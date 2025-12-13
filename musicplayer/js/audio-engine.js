// Audio Engine - Web Audio API wrapper for sound synthesis
class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isInitialized = false;
        this.activeSources = [];
        
        // Note frequencies in Hz
        this.noteFrequencies = {
            'C0': 16.35, 'C#0': 17.32, 'D0': 18.35, 'D#0': 19.45, 'E0': 20.60, 'F0': 21.83,
            'F#0': 23.12, 'G0': 24.50, 'G#0': 25.96, 'A0': 27.50, 'A#0': 29.14, 'B0': 30.87,
            'C1': 32.70, 'C#1': 34.65, 'D1': 36.71, 'D#1': 38.89, 'E1': 41.20, 'F1': 43.65,
            'F#1': 46.25, 'G1': 49.00, 'G#1': 51.91, 'A1': 55.00, 'A#1': 58.27, 'B1': 61.74,
            'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31,
            'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
            'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61,
            'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
            'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
            'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
            'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
            'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
            'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51, 'F6': 1396.91,
            'F#6': 1479.98, 'G6': 1567.98, 'G#6': 1661.22, 'A6': 1760.00, 'A#6': 1864.66, 'B6': 1975.53,
            'C7': 2093.00, 'C#7': 2217.46, 'D7': 2349.32, 'D#7': 2489.02, 'E7': 2637.02, 'F7': 2793.83,
            'F#7': 2959.96, 'G7': 3135.96, 'G#7': 3322.44, 'A7': 3520.00, 'A#7': 3729.31, 'B7': 3951.07,
            'C8': 4186.01
        };
        
        // Beat sound parameters
        // Available beats: kick, snare, hihat, tom, crash, ride, clap, rim, 
        // cowbell, tambourine, bongo, conga, floor_tom, splash, china
        this.beatSounds = {
            'kick': { frequency: 60, decay: 0.5, type: 'sine' },
            'snare': { frequency: 200, decay: 0.2, type: 'triangle', noise: true },
            'hihat': { frequency: 800, decay: 0.1, type: 'square', noise: true },
            'tom': { frequency: 150, decay: 0.3, type: 'sine' },
            'crash': { frequency: 500, decay: 1.5, type: 'sawtooth', noise: true },
            'ride': { frequency: 600, decay: 0.8, type: 'triangle', noise: true },
            'clap': { frequency: 1500, decay: 0.03, type: 'square', noise: true },
            'rim': { frequency: 800, decay: 0.05, type: 'square' },
            'cowbell': { frequency: 400, decay: 0.2, type: 'square' },
            'tambourine': { frequency: 1200, decay: 0.15, type: 'square', noise: true },
            'bongo': { frequency: 250, decay: 0.15, type: 'sine' },
            'conga': { frequency: 180, decay: 0.2, type: 'sine' },
            'floor_tom': { frequency: 100, decay: 0.4, type: 'sine' },
            'splash': { frequency: 700, decay: 0.4, type: 'sawtooth', noise: true },
            'china': { frequency: 450, decay: 1.2, type: 'sawtooth', noise: true }
        };
    }
    
    // Initialize audio context on first user interaction
    init() {
        if (this.isInitialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0.7; // Default master volume
            
            // Resume audio context if it was suspended
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            this.isInitialized = true;
            console.log('Audio context initialized successfully');
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
            throw new Error('Audio not supported');
        }
    }
    
    // Get frequency for a note name
    getNoteFrequency(note) {
        if (!note || note === 'rest') return null;
        return this.noteFrequencies[note.toUpperCase()] || null;
    }
    
    // Create an oscillator for a note
    createOscillator(frequency, type = 'sine', startTime = 0) {
        const now = startTime || this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.start(now);
        
        return { oscillator, gainNode };
    }
    
    // Create a synthesized instrument with multiple harmonics
    // Available instruments: piano, guitar, electricGuitar, strings
    // Basic waveforms: sine, square, sawtooth, triangle
    createInstrument(frequency, instrumentType, startTime = 0) {
        const now = startTime || this.audioContext.currentTime;
        const components = [];
        
        switch (instrumentType) {
            case 'piano':
                components.push(...this.createPiano(frequency, now));
                break;
            case 'guitar':
                components.push(...this.createGuitar(frequency, now));
                break;
            case 'electricGuitar':
                components.push(...this.createElectricGuitar(frequency, now));
                break;
            case 'strings':
                components.push(...this.createStrings(frequency, now));
                break;
            default:
                // Fallback to simple oscillator
                components.push(this.createOscillator(frequency, instrumentType, startTime));
        }
        
        return components;
    }
    
    // Create piano-like sound with harmonics and envelope
    createPiano(frequency, startTime) {
        const components = [];
        
        // Fundamental frequency
        const fundamental = this.createOscillator(frequency, 'sine', startTime);
        
        // Add harmonics for piano-like tone
        const harmonic2 = this.createOscillator(frequency * 2, 'sine', startTime);
        const harmonic3 = this.createOscillator(frequency * 3, 'sine', startTime);
        const harmonic5 = this.createOscillator(frequency * 5, 'triangle', startTime);
        
        // Volume levels for harmonics (piano-like spectrum)
        harmonic2.gainNode.gain.value = 0.3;
        harmonic3.gainNode.gain.value = 0.2;
        harmonic5.gainNode.gain.value = 0.1;
        
        // Create master gain for piano
        const masterGain = this.audioContext.createGain();
        fundamental.gainNode.connect(masterGain);
        harmonic2.gainNode.connect(masterGain);
        harmonic3.gainNode.connect(masterGain);
        harmonic5.gainNode.connect(masterGain);
        masterGain.connect(this.masterGain);
        
        // Piano envelope - fast attack, moderate decay
        const now = startTime;
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(1, now + 0.01); // Fast attack
        masterGain.gain.exponentialRampToValueAtTime(0.3, now + 0.1); // Initial decay
        masterGain.gain.exponentialRampToValueAtTime(0.01, now + 2); // Long sustain decay
        
        // Oscillators already started in createOscillator
        
        components.push(
            { oscillator: fundamental.oscillator, gainNode: masterGain },
            { oscillator: harmonic2.oscillator, gainNode: harmonic2.gainNode },
            { oscillator: harmonic3.oscillator, gainNode: harmonic3.gainNode },
            { oscillator: harmonic5.oscillator, gainNode: harmonic5.gainNode }
        );
        
        return components;
    }
    
    // Create guitar-like sound with plucked string characteristics
    createGuitar(frequency, startTime) {
        const components = [];
        
        // Fundamental with sawtooth for string-like quality
        const fundamental = this.createOscillator(frequency, 'sawtooth', startTime);
        
        // Add harmonics for guitar tone
        const harmonic2 = this.createOscillator(frequency * 2, 'triangle', startTime);
        const harmonic3 = this.createOscillator(frequency * 3, 'sawtooth', startTime);
        
        // Create filter for guitar-like tone
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 4; // Cut off higher harmonics
        filter.Q.value = 2; // Slight resonance
        
        // Create master gain for guitar envelope
        const masterGain = this.audioContext.createGain();
        
        fundamental.gainNode.connect(filter);
        harmonic2.gainNode.connect(filter);
        harmonic3.gainNode.connect(filter);
        filter.connect(masterGain);
        masterGain.connect(this.masterGain);
        
        // Volume levels
        harmonic2.gainNode.gain.value = 0.4;
        harmonic3.gainNode.gain.value = 0.2;
        
        // Guitar envelope - very fast attack, decay like plucked string
        const now = startTime;
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(1, now + 0.001); // Immediate attack
        masterGain.gain.exponentialRampToValueAtTime(0.01, now + 1.5); // Pluck decay
        
        // Start all oscillators
        // Oscillators already started in createOscillator
        
        components.push(
            { oscillator: fundamental.oscillator, gainNode: masterGain },
            { oscillator: harmonic2.oscillator, gainNode: harmonic2.gainNode },
            { oscillator: harmonic3.oscillator, gainNode: harmonic3.gainNode },
            { filter }
        );
        
        return components;
    }
    
    // Create electric guitar sound with distortion and harmonics
    createElectricGuitar(frequency, startTime) {
        const components = [];
        
        // Fundamental frequency with more aggressive waveform
        const fundamental = this.createOscillator(frequency, 'sawtooth', startTime);
        
        // Add harmonics for electric guitar tone
        const harmonic2 = this.createOscillator(frequency * 2, 'square', startTime);
        const harmonic3 = this.createOscillator(frequency * 3, 'triangle', startTime);
        
        // Create distortion using waveshaper
        const distortion = this.audioContext.createWaveShaper();
        const distortionCurve = new Float32Array(256);
        for (let i = 0; i < 256; i++) {
            const x = (i - 128) / 128;
            distortionCurve[i] = ((3 + x) / 2) / (1 + Math.abs(3 * x) / 2);
        }
        distortion.curve = distortionCurve;
        
        // Volume levels for electric guitar (more aggressive)
        fundamental.gainNode.gain.value = 0.7;
        harmonic2.gainNode.gain.value = 0.4;
        harmonic3.gainNode.gain.value = 0.3;
        
        // Create master gain for electric guitar
        const masterGain = this.audioContext.createGain();
        fundamental.gainNode.connect(distortion);
        harmonic2.gainNode.connect(distortion);
        harmonic3.gainNode.connect(distortion);
        distortion.connect(masterGain);
        masterGain.connect(this.masterGain);
        
        // Electric guitar envelope - fast attack, medium decay
        const now = startTime;
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(1, now + 0.01); // Fast attack
        masterGain.gain.exponentialRampToValueAtTime(0.5, now + 0.05); // Quick decay to sustain
        masterGain.gain.exponentialRampToValueAtTime(0.3, now + 0.2); // Sustain
        
        return components;
    }
    
    // Create electric guitar sound with distortion and harmonics
    // Create string section-like sound with lush harmonics
    createStrings(frequency, startTime) {
        const components = [];
        const now = startTime || this.audioContext.currentTime;
        
        // Create multiple oscillators for ensemble effect
        const numStrings = 3;
        const stringGains = [];
        
        for (let i = 0; i < numStrings; i++) {
            // Slight detuning for ensemble effect
            const detune = (Math.random() - 0.5) * 10; // ±5 cents
            const string = this.createOscillator(frequency, 'sawtooth', startTime);
            string.oscillator.detune.value = detune;
            
            // Create individual string filter
            const stringFilter = this.audioContext.createBiquadFilter();
            stringFilter.type = 'lowpass';
            stringFilter.frequency.value = frequency * 3;
            stringFilter.Q.value = 1;
            
            string.gainNode.connect(stringFilter);
            stringFilter.connect(this.masterGain);
            
            // Oscillator already started in createOscillator
            
            stringGains.push(string.gainNode);
            components.push(
                { oscillator: string.oscillator, gainNode: string.gainNode },
                { filter: stringFilter }
            );
        }
        
        // Add subtle vibrato for strings
        const vibrato = this.audioContext.createOscillator();
        vibrato.frequency.value = 5; // 5 Hz vibrato
        const vibratoGain = this.audioContext.createGain();
        vibratoGain.gain.value = 2; // Small vibrato depth
        
        vibrato.connect(vibratoGain);
        
        // Apply vibrato to all strings
        components.forEach(component => {
            if (component.oscillator && component.oscillator.frequency) {
                vibratoGain.connect(component.oscillator.frequency);
            }
        });
        
        // Master envelope for strings - slow attack, long sustain
        const masterGain = this.audioContext.createGain();
        stringGains.forEach(gain => {
            gain.connect(masterGain);
        });
        masterGain.connect(this.masterGain);
        
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(0.8, now + 0.3); // Slow attack
        masterGain.gain.exponentialRampToValueAtTime(0.3, now + 1); // Slight decay
        masterGain.gain.exponentialRampToValueAtTime(0.01, now + 3); // Long release
        
        vibrato.start(now);
        components.push({ oscillator: vibrato, gainNode: vibratoGain });
        
        return components;
    }
    
    // Play a single note with duration and volume
    playNote(note, duration, volume = 0.7, startTime = 0, instrument = 'sine') {
        if (!this.isInitialized) this.init();
        
        const frequency = this.getNoteFrequency(note);
        if (!frequency) return null; // Skip rests
        
        const now = startTime || this.audioContext.currentTime;
        let components = [];
        
        // Check if it's a synthesized instrument
        if (['piano', 'guitar', 'strings'].includes(instrument)) {
            components = this.createInstrument(frequency, instrument, startTime);
            
            // Schedule stop for all oscillators (start is called in createInstrument)
            components.forEach(component => {
                if (component.oscillator) {
                    component.oscillator.stop(now + duration);
                }
            });
            
        } else {
            // Simple oscillator for basic waveforms
            const { oscillator, gainNode } = this.createOscillator(frequency, instrument, startTime);
            
            // Set up envelope
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, now + 0.01); // Attack
            gainNode.gain.exponentialRampToValueAtTime(volume * 0.3, now + duration * 0.3); // Decay
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration); // Release
            
            // Schedule oscillator
            oscillator.stop(now + duration);
            
            components.push({ oscillator, gainNode });
        }
        
        return components;
    }
    
    // Play multiple notes simultaneously (chord)
    playChord(notes, duration, volume = 0.7, startTime = 0, instrument = 'sine') {
        if (!Array.isArray(notes)) {
            return this.playNote(notes, duration, volume, startTime, instrument);
        }
        
        const chordVolume = volume / notes.length;
        const allComponents = [];
        
        notes.forEach(note => {
            const components = this.playNote(note, duration, chordVolume, startTime, instrument);
            if (components) {
                if (Array.isArray(components)) {
                    allComponents.push(...components);
                } else {
                    allComponents.push(components);
                }
            }
        });
        
        return allComponents;
    }
    
    // Play a beat sound
    playBeat(beatType, duration, volume = 0.8, startTime = 0) {
        if (!this.isInitialized) this.init();
        
        const beatConfig = this.beatSounds[beatType] || this.beatSounds['kick'];
        const now = startTime || this.audioContext.currentTime;
        const actualDuration = Math.min(duration, beatConfig.decay);
        
        let components = [];
        
        // Create main oscillator component
        if (beatConfig.frequency > 0) {
            const { oscillator, gainNode } = this.createOscillator(beatConfig.frequency, beatConfig.type, startTime);
            
            // Beat envelope - quick attack and decay
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, now + 0.001); // Immediate attack
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + actualDuration); // Quick decay
            
            oscillator.stop(now + actualDuration);
            
            components.push({ oscillator, gainNode });
        }
        
        // Add noise component for cymbals and percussion
        if (beatConfig.noise) {
            let noiseType = 'white';
            let noiseVolume = volume * 0.3;
            
            // Determine noise type and volume based on beat type
            switch (beatType) {
                case 'crash':
                case 'splash':
                case 'china':
                    noiseType = 'metallic';
                    noiseVolume = volume * 0.6;
                    break;
                case 'ride':
                    noiseType = 'metallic';
                    noiseVolume = volume * 0.4;
                    break;
                case 'clap':
                    noiseType = 'sharp';
                    noiseVolume = volume * 0.8;
                    break;
                case 'tambourine':
                    noiseType = 'sharp';
                    noiseVolume = volume * 0.5;
                    break;
                case 'hihat':
                    noiseType = 'white';
                    noiseVolume = volume * 0.4;
                    break;
                case 'snare':
                    noiseType = 'white';
                    noiseVolume = volume * 0.3;
                    break;
            }
            
            const noiseComponent = this.addNoise(duration, noiseVolume, startTime, noiseType);
            components.push(noiseComponent);
        }
        
        return components;
    }
    
    // Add noise component (for snare, cymbals, etc.)
    addNoise(duration, volume = 0.3, startTime = 0, noiseType = 'white') {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        // Generate different types of noise
        for (let i = 0; i < bufferSize; i++) {
            switch (noiseType) {
                case 'white':
                    output[i] = Math.random() * 2 - 1;
                    break;
                case 'metallic':
                    // Metallic noise with more high frequencies
                    output[i] = (Math.random() * 2 - 1) * 0.7 + (Math.random() * 2 - 1) * 0.3;
                    break;
                case 'sharp':
                    // Sharp noise for claps and rimshots
                    output[i] = Math.random() > 0.5 ? 1 : -1;
                    break;
                default:
                    output[i] = Math.random() * 2 - 1;
            }
        }
        
        const noiseSource = this.audioContext.createBufferSource();
        const noiseGain = this.audioContext.createGain();
        const noiseFilter = this.audioContext.createBiquadFilter();
        
        // Set up filter for different noise types
        if (noiseType === 'metallic') {
            noiseFilter.type = 'highpass';
            noiseFilter.frequency.value = 3000;
        } else if (noiseType === 'sharp') {
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.value = 1000;
            noiseFilter.Q.value = 5;
        } else {
            noiseFilter.type = 'highpass';
            noiseFilter.frequency.value = 100;
        }
        
        noiseSource.buffer = buffer;
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        
        const now = startTime || this.audioContext.currentTime;
        noiseGain.gain.setValueAtTime(volume, now);
        
        // Different decay rates for different noise types
        const decayTime = noiseType === 'metallic' ? duration * 0.8 : 
                          noiseType === 'sharp' ? duration * 0.1 : 
                          duration * 0.3;
        
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + decayTime);
        
        // Start noise source and track it
        noiseSource.start(startTime);
        this.activeSources.push(noiseSource);
        
        return { noiseSource, noiseGain, noiseFilter };
    }
    
    // Set master volume
    setMasterVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }
    
    // Stop all sounds
    stopAll() {
        if (this.audioContext) {
            // Clear all scheduled sources
            if (this.activeSources) {
                this.activeSources.forEach(source => {
                    try {
                        if (source.stop) {
                            source.stop(0);
                        }
                        if (source.disconnect) {
                            source.disconnect();
                        }
                    } catch (e) {
                        // Source might already be stopped
                    }
                });
                this.activeSources = [];
            }
            
            // Suspend audio context to stop all sounds
            this.audioContext.suspend().then(() => {
                // Resume immediately for next playback
                this.audioContext.resume();
            });
        }
    }
    
    // Get current time
    getCurrentTime() {
        return this.isInitialized ? this.audioContext.currentTime : 0;
    }
    
    // Check if audio is supported
    isSupported() {
        return !!(window.AudioContext || window.webkitAudioContext);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioEngine;
}
