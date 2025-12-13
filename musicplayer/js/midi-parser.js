class MidiParser {
    constructor() {
        this.header = null;
        this.tracks = [];
        this.tempo = 120; // Default BPM
        this.timeDivision = 480; // Default PPQ (pulses per quarter note)
    }

    parse(arrayBuffer) {
        try {
            const dataView = new DataView(arrayBuffer);
            
            // Parse header chunk
            this.parseHeader(dataView);
            
            // Parse track chunks
            this.parseTracks(dataView);
            
            return {
                tempo: this.tempo,
                timeDivision: this.timeDivision,
                tracks: this.tracks
            };
        } catch (error) {
            console.error('MIDI parsing error:', error);
            throw new Error('Failed to parse MIDI file: ' + error.message);
        }
    }

    parseHeader(dataView) {
        // Check for MThd header
        const headerType = this.readString(dataView, 0, 4);
        if (headerType !== 'MThd') {
            throw new Error('Not a valid MIDI file - missing MThd header');
        }

        const headerLength = dataView.getUint32(4);
        const format = dataView.getUint16(8);
        const numTracks = dataView.getUint16(10);
        const timeDivision = dataView.getUint16(12);

        this.header = {
            type: headerType,
            length: headerLength,
            format: format,
            numTracks: numTracks,
            timeDivision: timeDivision
        };

        this.timeDivision = timeDivision;
        
        // Handle time division format
        if (timeDivision & 0x8000) {
            // SMPTE time format
            throw new Error('SMPTE time format not supported');
        }
    }

    parseTracks(dataView) {
        let offset = 14; // Start after header
        
        for (let i = 0; i < this.header.numTracks; i++) {
            const track = this.parseTrack(dataView, offset);
            this.tracks.push(track);
            offset = track.nextOffset;
        }
    }

    parseTrack(dataView, offset) {
        // Check for MTrk header
        const trackType = this.readString(dataView, offset, 4);
        if (trackType !== 'MTrk') {
            throw new Error('Invalid track chunk - missing MTrk header');
        }

        const trackLength = dataView.getUint32(offset + 4);
        const trackStart = offset + 8;
        const trackEnd = trackStart + trackLength;

        const events = [];
        let currentOffset = trackStart;
        let currentTime = 0;
        let lastStatus = 0;

        while (currentOffset < trackEnd) {
            const event = this.parseEvent(dataView, currentOffset, currentTime, lastStatus);
            events.push(event);
            currentTime += event.deltaTime;
            lastStatus = event.status || lastStatus;
            currentOffset = event.nextOffset;
        }

        return {
            type: trackType,
            length: trackLength,
            events: events,
            nextOffset: trackEnd
        };
    }

    parseEvent(dataView, offset, currentTime, lastStatus) {
        const deltaTime = this.readVariableLength(dataView, offset);
        let currentOffset = offset + deltaTime.bytesRead;

        const statusByte = dataView.getUint8(currentOffset);
        currentOffset++;

        let event = {
            deltaTime: deltaTime.value,
            absoluteTime: currentTime + deltaTime.value,
            status: null,
            type: null,
            data: null,
            nextOffset: currentOffset
        };

        // Handle running status
        if (statusByte < 0x80) {
            event.status = lastStatus;
            event.type = lastStatus & 0xF0;
            currentOffset--; // Put the byte back
        } else {
            event.status = statusByte;
            event.type = statusByte & 0xF0;
        }

        // Parse event based on type
        switch (event.type) {
            case 0x80: // Note off
                event.data = {
                    note: dataView.getUint8(currentOffset),
                    velocity: dataView.getUint8(currentOffset + 1)
                };
                event.subtype = 'noteOff';
                currentOffset += 2;
                break;

            case 0x90: // Note on
                const note = dataView.getUint8(currentOffset);
                const velocity = dataView.getUint8(currentOffset + 1);
                event.data = { note, velocity };
                event.subtype = velocity === 0 ? 'noteOff' : 'noteOn';
                currentOffset += 2;
                break;

            case 0xA0: // Polyphonic key pressure
                event.data = {
                    note: dataView.getUint8(currentOffset),
                    pressure: dataView.getUint8(currentOffset + 1)
                };
                event.subtype = 'keyPressure';
                currentOffset += 2;
                break;

            case 0xB0: // Control change
                event.data = {
                    controller: dataView.getUint8(currentOffset),
                    value: dataView.getUint8(currentOffset + 1)
                };
                event.subtype = 'controlChange';
                currentOffset += 2;
                break;

            case 0xC0: // Program change
                event.data = {
                    program: dataView.getUint8(currentOffset)
                };
                event.subtype = 'programChange';
                currentOffset += 1;
                break;

            case 0xD0: // Channel pressure
                event.data = {
                    pressure: dataView.getUint8(currentOffset)
                };
                event.subtype = 'channelPressure';
                currentOffset += 1;
                break;

            case 0xE0: // Pitch bend
                const lsb = dataView.getUint8(currentOffset);
                const msb = dataView.getUint8(currentOffset + 1);
                event.data = {
                    value: (msb << 7) | lsb
                };
                event.subtype = 'pitchBend';
                currentOffset += 2;
                break;

            case 0xF0: // Meta events and system exclusive
                if (event.status === 0xFF) {
                    // Meta event
                    const metaType = dataView.getUint8(currentOffset);
                    const metaLength = dataView.getUint8(currentOffset + 1);
                    const metaData = this.readBytes(dataView, currentOffset + 2, metaLength);
                    
                    event.subtype = 'meta';
                    event.metaType = metaType;
                    event.data = metaData;
                    
                    // Handle tempo meta event
                    if (metaType === 0x51 && metaLength === 3) {
                        const microsecondsPerQuarter = (metaData[0] << 16) | (metaData[1] << 8) | metaData[2];
                        this.tempo = Math.round(60000000 / microsecondsPerQuarter);
                    }
                    
                    currentOffset += 2 + metaLength;
                } else {
                    // System exclusive - skip for now
                    event.subtype = 'systemExclusive';
                    currentOffset = this.findEndOfSystemExclusive(dataView, currentOffset);
                }
                break;

            default:
                throw new Error(`Unknown MIDI event type: 0x${event.type.toString(16)}`);
        }

        event.nextOffset = currentOffset;
        return event;
    }

    readVariableLength(dataView, offset) {
        let value = 0;
        let bytesRead = 0;
        let byte;

        do {
            byte = dataView.getUint8(offset + bytesRead);
            value = (value << 7) | (byte & 0x7F);
            bytesRead++;
        } while (byte & 0x80);

        return { value, bytesRead };
    }

    readString(dataView, offset, length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += String.fromCharCode(dataView.getUint8(offset + i));
        }
        return result;
    }

    readBytes(dataView, offset, length) {
        const bytes = [];
        for (let i = 0; i < length; i++) {
            bytes.push(dataView.getUint8(offset + i));
        }
        return bytes;
    }

    findEndOfSystemExclusive(dataView, offset) {
        // Find the end of system exclusive message (0xF7)
        while (offset < dataView.byteLength) {
            if (dataView.getUint8(offset) === 0xF7) {
                return offset + 1;
            }
            offset++;
        }
        return offset;
    }

    // Convert parsed MIDI to beat and melody patterns
    convertToPatterns() {
        const beatPattern = [];
        const melodyPattern = [];

        // Group notes by time to create chords
        const noteOnEvents = [];
        const noteOffEvents = [];

        // Collect all note events from all tracks
        this.tracks.forEach(track => {
            track.events.forEach(event => {
                if (event.subtype === 'noteOn') {
                    noteOnEvents.push({
                        time: event.absoluteTime,
                        note: event.data.note,
                        velocity: event.data.velocity,
                        channel: event.status & 0x0F
                    });
                } else if (event.subtype === 'noteOff') {
                    noteOffEvents.push({
                        time: event.absoluteTime,
                        note: event.data.note,
                        channel: event.status & 0x0F
                    });
                }
            });
        });

        // Sort events by time
        noteOnEvents.sort((a, b) => a.time - b.time);
        noteOffEvents.sort((a, b) => a.time - b.time);

        // Create melody pattern from notes
        const activeNotes = new Map();
        let lastTime = 0;

        noteOnEvents.forEach(noteOn => {
            // Find corresponding note off
            const noteOff = noteOffEvents.find(off => 
                off.note === noteOn.note && 
                off.channel === noteOn.channel && 
                off.time > noteOn.time
            );

            if (noteOff) {
                const duration = (noteOff.time - noteOn.time) / this.timeDivision;
                const timeSinceLast = (noteOn.time - lastTime) / this.timeDivision;

                // Add rest if there's a gap
                if (timeSinceLast > 0.1) {
                    melodyPattern.push({
                        note: 'rest',
                        dur: Math.round(timeSinceLast * 4) / 4 // Round to 16th notes
                    });
                }

                // Convert MIDI note number to note name
                const noteName = this.midiNoteToName(noteOn.note);
                
                melodyPattern.push({
                    note: noteName,
                    dur: Math.max(0.25, Math.round(duration * 4) / 4), // Minimum 16th note
                    vol: noteOn.velocity / 127, // Normalize velocity to 0-1
                    instrument: 'piano' // Default instrument
                });

                lastTime = noteOff.time;
            }
        });

        // Create simple beat pattern based on time signature
        // This is a basic implementation - could be enhanced by analyzing percussion tracks
        const totalBeats = Math.ceil(lastTime / this.timeDivision);
        for (let i = 0; i < totalBeats; i++) {
            if (i % 4 === 0) {
                beatPattern.push({ beat: 'kick', dur: 1, vol: [0.8] });
            } else if (i % 2 === 1) {
                beatPattern.push({ beat: 'snare', dur: 1, vol: [0.6] });
            } else {
                beatPattern.push({ beat: 'hihat', dur: 0.5, vol: [0.4] });
                beatPattern.push({ beat: 'hihat', dur: 0.5, vol: [0.4] });
            }
        }

        return {
            beatPattern,
            melodyPattern,
            tempo: this.tempo
        };
    }

    midiNoteToName(midiNote) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor(midiNote / 12) - 1;
        const noteName = noteNames[midiNote % 12];
        return noteName + octave;
    }
}