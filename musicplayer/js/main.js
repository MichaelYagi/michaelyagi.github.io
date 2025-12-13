// Music Player Application
class MusicPlayer {
    constructor() {
        // Audio engine
        this.audioEngine = new AudioEngine();
        
        // Storage module
        this.storage = new StorageModule();
        
        // DOM element references
        this.playBtn = document.getElementById('play-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.autoScrollBtn = document.getElementById('autoscroll-btn');
        this.beatInput = document.getElementById('beat-input');
        this.melodyInput = document.getElementById('melody-input');
        this.statusBox = document.getElementById('status-box');

        this.tempoSlider = document.getElementById('tempo-slider');
        this.tempoDisplay = document.getElementById('tempo-display');
        

        
        // Volume controls
        this.masterVolumeSlider = document.getElementById('master-volume');
        this.masterVolumeDisplay = document.getElementById('master-volume-display');
        
        // Track controls
        this.beatMuteBtn = document.getElementById('beat-mute-btn');
        this.beatSoloBtn = document.getElementById('beat-solo-btn');
        this.melodyMuteBtn = document.getElementById('melody-mute-btn');
        this.melodySoloBtn = document.getElementById('melody-solo-btn');
        
        // Pattern management buttons
        this.saveProjectBtn = document.getElementById('save-project-btn');
        this.loadProjectBtn = document.getElementById('load-project-btn');
        this.manageDataBtn = document.getElementById('manage-data-btn');
        this.exportDataBtn = document.getElementById('export-data-btn');
        this.importDataBtn = document.getElementById('import-data-btn');
        
        // Check if buttons were found
        
        // Editor tabs
        this.jsonTabBtn = document.getElementById('json-tab-btn');
        this.midiTabBtn = document.getElementById('midi-tab-btn');
        
        // Editors
        this.jsonEditor = document.getElementById('json-editor');
        this.midiEditor = document.getElementById('midi-editor');
        
        // MIDI elements
        this.midiFileInput = document.getElementById('midi-file-input');
        this.midiUploadBtn = document.getElementById('midi-upload-btn');
        this.convertMidiBtn = document.getElementById('convert-midi-btn');
        this.midiInfo = document.getElementById('midi-info');
        
        // Visualization
        this.beatViz = document.getElementById('beat-viz');
        this.melodyViz = document.getElementById('melody-viz');
        
        // Check if visualization elements exist
        if (!this.beatViz || !this.melodyViz) {
            console.warn('Visualization elements not found - playback visualization disabled');
        }
        
        // Application state
        this.isPlaying = false;

        this.tempo = 120; // Default BPM
        this.autoScrollDuringPlayback = true; // Default to auto-scroll enabled

        
        // Volume state
        this.masterVolume = 70;
        
        // Track state
        this.trackState = {
            beat: { muted: false, soloed: false },
            melody: { muted: false, soloed: false }
        };
        
        // Playback visualization
        this.playbackTimers = {
            beat: [],
            melody: []
        };
        
        this.scrollTrackers = {
            beat: null,
            melody: null
        };
        
        // Default example patterns
        this.defaultBeatPattern = `{"bpm":300, "pattern": [
    {"beat": "rest", "dur": 5},
    {"beats": [
        {"beat": "snare", "dur": 1},
        {"beat": "clap", "dur": 1}
    ]},
    {"beats": [
        {"beat": "kick", "dur": 2},
        {"beat": "hihat", "dur": 4},
        {"beat": "snare", "dur": 4},
        {"beat": "clap", "dur": 4}
    ]},
    {"beats": [
        {"beat": "kick", "dur": 4},
        {"beat": "snare", "dur": 4},
        {"beat": "clap", "dur": 2}
    ]},
    {"beat": "hihat", "dur": 2},
    {"beats": [
        {"beat": "kick", "dur": 4},
        {"beat": "snare", "dur": 4},
        {"beat": "clap", "dur": 2}
    ]},
    {"beat": "hihat", "dur": 2},
    {"beats": [
        {"beat": "kick", "dur": 4},
        {"beat": "snare", "dur": 4},
        {"beat": "clap", "dur": 2}
    ]},
    {"beat": "hihat", "dur": 2},
    {"beats": [
        {"beat": "kick", "dur": 4},
        {"beat": "snare", "dur": 4},
        {"beat": "clap", "dur": 2}
    ]},
    {"beat": "hihat", "dur": 2},
    {"beats": [
        {"beat": "kick", "dur": 4},
        {"beat": "snare", "dur": 4},
        {"beat": "clap", "dur": 2}
    ]},
    {"beat": "hihat", "dur": 2},
    {"beats": [
        {"beat": "kick", "dur": 4},
        {"beat": "snare", "dur": 4},
        {"beat": "clap", "dur": 2}
    ]},
    {"beat": "hihat", "dur": 2},
    {"beats": [
        {"beat": "kick", "dur": 4},
        {"beat": "snare", "dur": 4},
        {"beat": "clap", "dur": 2}
    ]},
    {"beat": "hihat", "dur": 2}
]}`;

        this.defaultMelodyPattern = `{"bpm":300, "pattern": [
    {"note": "F#6", "dur": 0.5, "instrument": "electricGuitar"},
    {"note": "C#6", "dur": 0.5, "instrument": "electricGuitar"},
    {"note": "B5", "dur": 0.5, "instrument": "electricGuitar"},
    {"note": "F#5", "dur": 0.5, "instrument": "electricGuitar"},
    {"note": "B5", "dur": 0.5, "instrument": "electricGuitar"},
    {"note": "C#6", "dur": 0.5, "instrument": "electricGuitar"},
    {"note": "F#6", "dur": 0.5, "instrument": "electricGuitar"},
    {"note": "C#6", "dur": 0.5, "instrument": "electricGuitar"},
    {"note": "B5", "dur": 0.5, "instrument": "electricGuitar"},
    {"note": "F#5", "dur": 0.5, "instrument": "electricGuitar"},
    {"note": "B5", "dur": 0.5, "instrument": "electricGuitar"},
    {"note": "C#6", "dur": 0.5, "instrument": "electricGuitar"},
    {"note": "F#6", "dur": 0.5, "instrument": "electricGuitar"},
    {"note": "C#6", "dur": 0.5, "instrument": "electricGuitar"},
    {"note": "B5", "dur": 0.5, "instrument": "electricGuitar"},
    {"note": "F#5", "dur": 0.5, "instrument": "electricGuitar"},
    {"note": "E2", "dur": 1, "instrument": "electricGuitar"},
    {"note": "E3", "dur": 1, "instrument": "electricGuitar"},
    {"notes": [
        {"note": "B5", "dur": 1, "instrument": "electricGuitar"},
        {"note": "E5", "dur": 1, "instrument": "electricGuitar"},
        {"note": "F#5", "dur": 1, "instrument": "electricGuitar"},
        {"note": "A5", "dur": 1, "instrument": "electricGuitar"},
        {"note": "E2", "dur": 1, "instrument": "electricGuitar"}
    ]},
    {"note": "E3", "dur": 1, "instrument": "electricGuitar"},
    {"notes": [
        {"note": "B5", "dur": 1, "instrument": "electricGuitar"},
        {"note": "E5", "dur": 1, "instrument": "electricGuitar"},
        {"note": "G#5", "dur": 1, "instrument": "electricGuitar"},
        {"note": "E2", "dur": 1, "instrument": "electricGuitar"}
    ]},
    {"notes": [
        {"note": "B5", "dur": 1, "instrument": "electricGuitar"},
        {"note": "E5", "dur": 1, "instrument": "electricGuitar"},
        {"note": "E3", "dur": 1, "instrument": "electricGuitar"}
    ]},
    {"note": "E2", "dur": 1, "instrument": "electricGuitar"},
    {"notes": [
        {"note": "B5", "dur": 1, "instrument": "electricGuitar"},
        {"note": "E5", "dur": 1, "instrument": "electricGuitar"},
        {"note": "F#5", "dur": 1, "instrument": "electricGuitar"},
        {"note": "A5", "dur": 1, "instrument": "electricGuitar"},
        {"note": "E3", "dur": 1, "instrument": "electricGuitar"}
    ]},
    {"note": "E2", "dur": 1, "instrument": "electricGuitar"},
    {"notes": [
        {"note": "B5", "dur": 1, "instrument": "electricGuitar"},
        {"note": "E5", "dur": 1, "instrument": "electricGuitar"},
        {"note": "G#5", "dur": 1, "instrument": "electricGuitar"},
        {"note": "E3", "dur": 1, "instrument": "electricGuitar"}
    ]},
    {"note": "E2", "dur": 1, "instrument": "electricGuitar"},
    {"note": "E3", "dur": 1, "instrument": "electricGuitar"},
    {"note": "E2", "dur": 1, "instrument": "electricGuitar"},
    {"notes": [
        {"note": "B5", "dur": 2, "instrument": "electricGuitar"},
        {"note": "E5", "dur": 2, "instrument": "electricGuitar"},
        {"note": "G#5", "dur": 2, "instrument": "electricGuitar"},
        {"note": "E3", "dur": 1, "instrument": "electricGuitar"}
    ]},
    {"note": "E2", "dur": 1, "instrument": "electricGuitar"},
    {"notes": [
        {"note": "B5", "dur": 2, "instrument": "electricGuitar"},
        {"note": "E5", "dur": 2, "instrument": "electricGuitar"},
        {"note": "G#5", "dur": 2, "instrument": "electricGuitar"},
        {"note": "E3", "dur": 1, "instrument": "electricGuitar"}
    ]},
    {"note": "D2", "dur": 1, "instrument": "electricGuitar"},
    {"notes": [
        {"note": "A5", "dur": 1, "instrument": "electricGuitar"},
        {"note": "F#5", "dur": 1, "instrument": "electricGuitar"},
        {"note": "D5", "dur": 1, "instrument": "electricGuitar"},
        {"note": "A5", "dur": 1, "instrument": "electricGuitar"},
        {"note": "D3", "dur": 1, "instrument": "electricGuitar"}
    ]},
    {"notes": [
        {"note": "A5", "dur": 2, "instrument": "electricGuitar"},
        {"note": "F#5", "dur": 2, "instrument": "electricGuitar"},
        {"note": "D5", "dur": 2, "instrument": "electricGuitar"},
        {"note": "A5", "dur": 2, "instrument": "electricGuitar"},
        {"note": "D2", "dur": 1, "instrument": "electricGuitar"}
    ]},
    {"note": "D3", "dur": 1, "instrument": "electricGuitar"},
    {"notes": [
        {"note": "A5", "dur": 4, "instrument": "electricGuitar"},
        {"note": "F#5", "dur": 4, "instrument": "electricGuitar"},
        {"note": "D5", "dur": 4, "instrument": "electricGuitar"},
        {"note": "A5", "dur": 4, "instrument": "electricGuitar"},
        {"note": "D2", "dur": 1, "instrument": "electricGuitar"}
    ]},
    {"note": "D3", "dur": 1, "instrument": "electricGuitar"},
    {"note": "D2", "dur": 1, "instrument": "electricGuitar"},
    {"note": "D3", "dur": 1, "instrument": "electricGuitar"}
]}`;

        this.init();
    }
    
    init() {
        // Set default patterns in input areas
        this.beatInput.value = this.defaultBeatPattern;
        this.melodyInput.value = this.defaultMelodyPattern;

        // Add event listeners
        this.playBtn.addEventListener('click', () => this.handlePlay());
        this.stopBtn.addEventListener('click', () => this.handleStop());
        this.autoScrollBtn.addEventListener('click', () => this.toggleAutoScroll());
        
        // Initialize auto-scroll button state
        this.autoScrollBtn.classList.add('active');

        // Add tempo control listener
        this.tempoSlider.addEventListener('input', () => {
            this.tempo = parseInt(this.tempoSlider.value);
            this.tempoDisplay.textContent = this.tempo;
            this.savePreferences();
        });
        
        // Add input validation listeners
        this.beatInput.addEventListener('input', () => {
            this.validateInput(this.beatInput);
            this.clearPatternHints();
        });
        this.melodyInput.addEventListener('input', () => {
            this.validateInput(this.melodyInput);
            this.clearPatternHints();
        });
        

        
        // Add volume control listeners
        this.masterVolumeSlider.addEventListener('input', () => {
            this.masterVolume = parseInt(this.masterVolumeSlider.value);
            this.masterVolumeDisplay.textContent = `${this.masterVolume}%`;
            // Initialize audio engine if not already done
            if (!this.audioEngine.isInitialized) {
                this.audioEngine.init();
            }
            this.audioEngine.setMasterVolume(this.masterVolume / 100);
        });
        
        // Add track control listeners
        this.beatMuteBtn.addEventListener('click', () => this.toggleTrackMute('beat'));
        this.beatSoloBtn.addEventListener('click', () => this.toggleTrackSolo('beat'));
        this.melodyMuteBtn.addEventListener('click', () => this.toggleTrackMute('melody'));
        this.melodySoloBtn.addEventListener('click', () => this.toggleTrackSolo('melody'));
        
        // Add pattern management listeners
        this.saveProjectBtn.addEventListener('click', () => {
            this.saveProject();
        });
        this.loadProjectBtn.addEventListener('click', () => this.showLoadProjectDialog());
        this.manageDataBtn.addEventListener('click', () => this.showManageDataDialog());
        this.exportDataBtn.addEventListener('click', () => this.exportData());
        this.importDataBtn.addEventListener('click', () => this.importData());
        
        // Add editor tab listeners
        this.jsonTabBtn.addEventListener('click', () => this.switchEditor('json'));
        this.midiTabBtn.addEventListener('click', () => this.switchEditor('midi'));
        
        // Add MIDI control listeners
        this.midiUploadBtn.addEventListener('click', () => this.midiFileInput.click());
        this.midiFileInput.addEventListener('change', (e) => this.handleMidiUpload(e));
        this.convertMidiBtn.addEventListener('click', () => this.convertMidiToPattern());
        
        // Load saved preferences
        this.loadPreferences();
        
        this.updateStatus('Ready to play');
        
        // Test audio engine with a simple beep
        setTimeout(() => {
            try {
                this.audioEngine.init();
                // Apply current master volume setting after initialization
                this.audioEngine.setMasterVolume(this.masterVolume / 100);
                this.audioEngine.playNote('C4', 0.2, 0.3, 0);
            } catch (error) {
                console.error('Test beep failed:', error);
            }
        }, 500);
    }
    
    handlePlay() {
        if (this.isPlaying) return;
        
        // Validate inputs before playing
        if (!this.validateInputs()) {
            this.updateStatus('Error: Invalid JSON in input fields', 'error');
            return;
        }
        
        // Check audio support
        if (!this.audioEngine.isSupported()) {
            this.updateStatus('Error: Web Audio API not supported', 'error');
            return;
        }
        
        try {
            // Parse patterns (handle empty inputs)
            let beatPattern = null;
            let melodyPattern = null;
            
            if (this.beatInput.value.trim()) {
                beatPattern = JSON.parse(this.beatInput.value);
            }
            
            if (this.melodyInput.value.trim()) {
                melodyPattern = JSON.parse(this.melodyInput.value);
            }

            // Validate patterns and show hints
            const beatValidation = this.validatePatternAndShowHints(beatPattern, 'beat');
            const melodyValidation = this.validatePatternAndShowHints(melodyPattern, 'melody');
            
            if (beatValidation && beatValidation.issues.length > 0) {
                this.updateStatus(`Beat pattern issues: ${beatValidation.issues[0]}`, 'error');
                this.showPatternHints(beatValidation.hints, 'beat');
                return;
            }
            
            if (melodyValidation && melodyValidation.issues.length > 0) {
                this.updateStatus(`Melody pattern issues: ${melodyValidation.issues[0]}`, 'error');
                this.showPatternHints(melodyValidation.hints, 'melody');
                return;
            }
            
            this.isPlaying = true;
            this.toggleButtonStates();
            this.updateStatus('Playing...');
            
            // Start playback visualization
            this.startPlaybackVisualization();
            
            // Start playback with both beat and melody
            this.startPlayback(beatPattern, melodyPattern);
            
        } catch (error) {
            this.updateStatus('Error: Failed to parse patterns', 'error');
            console.error('Playback error:', error);
        }
    }
    
    validatePatternAndShowHints(pattern, type) {
        if (!pattern) return null;
        
        // Handle both array format and object format with BPM
        let patternItems = [];
        let bpm = null;
        
        if (Array.isArray(pattern)) {
            patternItems = pattern;
        } else if (typeof pattern === 'object' && pattern.pattern && Array.isArray(pattern.pattern)) {
            patternItems = pattern.pattern;
            bpm = pattern.bpm;
        } else if (typeof pattern === 'object' && Array.isArray(pattern.beats)) {
            patternItems = pattern.beats;
            bpm = pattern.bpm;
        } else if (typeof pattern === 'object' && Array.isArray(pattern.notes)) {
            patternItems = pattern.notes;
            bpm = pattern.bpm;
        } else {
            return null;
        }
        
        const hints = [];
        const issues = [];
        
        // Validate BPM if present - this should happen even if patternItems is empty
        if (bpm !== null && bpm !== undefined) {
            if (typeof bpm !== 'number' || bpm <= 0 || bpm > 300) {
                issues.push(`Invalid BPM: ${bpm}. Must be a number between 1 and 300`);
            }
        }
        
        patternItems.forEach((item, index) => {
            const itemHints = this.validatePatternItem(item, type);
            if (itemHints.hints.length > 0) {
                hints.push(...itemHints.hints.map(h => `Item ${index + 1}: ${h}`));
            }
            if (itemHints.issues.length > 0) {
                issues.push(...itemHints.issues.map(i => `Item ${index + 1}: ${i}`));
            }
        });
        
        // Check for overall pattern issues
        if (patternItems.length === 0) {
            hints.push(`${type} pattern is empty - add at least one item`);
        }
        
        return { hints, issues, isValid: issues.length === 0 };
    }
    
    validatePatternItem(item, type) {
        const hints = [];
        const issues = [];
        
        if (type === 'beat') {
            // Beat pattern validation
            if (!item.beat && !item.beats) {
                hints.push('Missing "beat" or "beats" property');
                hints.push('Example: {"beat": "kick", "dur": 1} or {"beats": ["kick", "snare"]}');
            }
            
            if (item.beat && typeof item.beat !== 'string') {
                issues.push('"beat" must be a string (e.g., "kick", "snare", "hihat")');
                hints.push('Valid beats: kick, snare, hihat, clap, tom, crash, ride, rim, cowbell, tambourine, bongo, conga, floor_tom, splash, china');
            }
            
            if (item.beats && !Array.isArray(item.beats)) {
                issues.push('"beats" must be an array');
                hints.push('Example: {"beats": ["kick", "snare"], "dur": 1}');
            }
            
            if (item.beats && Array.isArray(item.beats)) {
                item.beats.forEach((beat, beatIndex) => {
                    if (typeof beat !== 'string' && typeof beat !== 'object') {
                        issues.push(`Beats[${beatIndex}] must be a string or object`);
                    }
                    if (typeof beat === 'object' && !beat.beat) {
                        hints.push(`Beats[${beatIndex}] missing "beat" property`);
                    }
                });
            }
            
            if (item.dur !== undefined && (typeof item.dur !== 'number' || item.dur < 0)) {
                issues.push('"dur" must be a non-negative number');
                hints.push('Example: {"beat": "kick", "dur": 1} for one beat, or {"beat": "kick", "dur": 0.5} for half beat');
            }
            
            if (item.vol !== undefined && !this.isValidVolume(item.vol)) {
                issues.push('"vol" must be a number or array of numbers between 0 and 1');
                hints.push('Examples: {"vol": 0.8} or {"vol": [0.5, 0.3, 0.1]} for volume envelope');
            }
            
        } else if (type === 'melody') {
            // Melody pattern validation
            if (!item.note && !item.notes && !item.freq) {
                hints.push('Missing "note", "notes", or "freq" property');
                hints.push('Examples: {"note": "C4", "dur": 1} or {"notes": [{"note": "C4"}, {"note": "E4"}]} or {"freq": 440, "dur": 1}');
            }
            
            if (item.note && typeof item.note !== 'string') {
                issues.push('"note" must be a string (e.g., "C4", "D#5", "Bb3")');
                hints.push('Note format: Pitch letter (A-G) with optional sharp (#) or flat (b) followed by octave number (0-8)');
                hints.push('For chords, use "notes" array format: {"notes": [{"note": "C4", "dur": 1}, {"note": "E4", "dur": 2}]}');
            }
            
            if (item.freq !== undefined && (typeof item.freq !== 'number' || item.freq <= 0)) {
                issues.push('"freq" must be a positive number in Hz');
                hints.push('Examples: {"freq": 440} for A4, {"freq": 261.63} for C4');
            }
            
            if (item.notes && !Array.isArray(item.notes)) {
                issues.push('"notes" must be an array');
                hints.push('Example: {"notes": [{"note": "C4"}, {"note": "E4"}], "dur": 1}');
            }
            
            if (item.notes && Array.isArray(item.notes)) {
                item.notes.forEach((note, noteIndex) => {
                    if (!note.note && !note.freq) {
                        hints.push(`Notes[${noteIndex}] missing "note" or "freq" property`);
                    }
                });
            }
            
            if (item.dur !== undefined && (typeof item.dur !== 'number' || item.dur < 0)) {
                issues.push('"dur" must be a non-negative number');
                hints.push('Example: {"note": "C4", "dur": 1} for one beat, or {"note": "C4", "dur": 0.25} for quarter beat');
            }
            
            if (item.instrument !== undefined && typeof item.instrument !== 'string') {
                issues.push('"instrument" must be a string');
                hints.push('Valid instruments: piano, strings, electricGuitar, acousticGuitar, sine, square, sawtooth, triangle');
            }
            
            if (item.vol !== undefined && !this.isValidVolume(item.vol)) {
                issues.push('"vol" must be a number or array of numbers between 0 and 1');
                hints.push('Examples: {"vol": 0.8} or {"vol": [0.5, 0.3, 0.1]} for volume envelope');
            }
        }
        
        return { hints, issues };
    }
    
    isValidVolume(vol) {
        if (typeof vol === 'number') {
            return vol >= 0 && vol <= 1;
        }
        if (Array.isArray(vol)) {
            return vol.every(v => typeof v === 'number' && v >= 0 && v <= 1);
        }
        return false;
    }
    
    showPatternHints(hints, type) {
        if (!hints || hints.length === 0) return;
        
        // Create or update hints container
        let hintsContainer = document.getElementById(`${type}-hints`);
        if (!hintsContainer) {
            hintsContainer = document.createElement('div');
            hintsContainer.id = `${type}-hints`;
            hintsContainer.className = 'pattern-hints';
            
            // Insert after the corresponding textarea
            const textarea = type === 'beat' ? this.beatInput : this.melodyInput;
            textarea.parentNode.insertBefore(hintsContainer, textarea.nextSibling);
        }
        
        // Update hints content
        hintsContainer.innerHTML = `
            <div class="hints-header">
                <strong>💡 Configuration Hints:</strong>
                <button class="hints-close" onclick="this.parentElement.parentElement.style.display='none'">×</button>
            </div>
            <div class="hints-list">
                ${hints.map(hint => `<div class="hint-item">• ${hint}</div>`).join('')}
            </div>
        `;
        
        hintsContainer.style.display = 'block';
    }
    
    clearPatternHints() {
        const beatHints = document.getElementById('beat-hints');
        const melodyHints = document.getElementById('melody-hints');
        if (beatHints) beatHints.style.display = 'none';
        if (melodyHints) melodyHints.style.display = 'none';
    }
    
    handleStop() {
        if (!this.isPlaying) return;
        
        // Stop all audio
        this.audioEngine.stopAll();
        
        // Clear visualization
        this.clearPlaybackVisualization();
        
        this.isPlaying = false;
        this.toggleButtonStates();
        this.updateStatus('Stopped');
    }
    
    toggleButtonStates() {
        this.playBtn.disabled = this.isPlaying;
        this.stopBtn.disabled = !this.isPlaying;
    }
    
    validateInputs() {
        const beatValid = this.validateInput(this.beatInput);
        const melodyValid = this.validateInput(this.melodyInput);
        
        // Allow playback if at least one pattern is valid and non-empty
        const beatNotEmpty = this.beatInput.value.trim() !== '';
        const melodyNotEmpty = this.melodyInput.value.trim() !== '';
        
        return (beatValid && beatNotEmpty) || (melodyValid && melodyNotEmpty);
    }
    
    validateInput(textarea) {
        try {
            const value = textarea.value.trim();
            if (!value) {
                textarea.style.borderColor = '#ddd'; // Reset color for empty
                return 'empty'; // Special value for empty input
            }
            JSON.parse(value);
            textarea.style.borderColor = '#ddd';
            return true;
        } catch (error) {
            textarea.style.borderColor = '#e74c3c';
            return false;
        }
    }
    
    updateStatus(message, type = 'info') {
        this.statusBox.textContent = message;
        this.statusBox.className = `status-${type}`;
        
        // Update status box styling based on type
        switch (type) {
            case 'error':
                this.statusBox.style.backgroundColor = '#fadbd8';
                this.statusBox.style.borderColor = '#e74c3c';
                this.statusBox.style.color = '#c0392b';
                break;
            case 'success':
                this.statusBox.style.backgroundColor = '#d5f4e6';
                this.statusBox.style.borderColor = '#27ae60';
                this.statusBox.style.color = '#229954';
                break;
            default:
                this.statusBox.style.backgroundColor = '#ecf0f1';
                this.statusBox.style.borderColor = '#bdc3c7';
                this.statusBox.style.color = '#2c3e50';
        }
    }
    
    startPlayback(beatPattern, melodyPattern) {
        // Extract BPM settings from patterns or use defaults
        let beatBpm = this.tempo;
        let melodyBpm = this.tempo;
        
        if (beatPattern && beatPattern.bpm) {
            beatBpm = beatPattern.bpm;
        }
        if (melodyPattern && melodyPattern.bpm) {
            melodyBpm = melodyPattern.bpm;
        }
        
        // Calculate durations for each pattern
        const beatDuration = 60 / beatBpm;
        const melodyDuration = 60 / melodyBpm;
        
        // Calculate total duration based on what's being played
        let totalDuration = 0;
        if (beatPattern) {
            const beatTotalDuration = this.calculatePatternDuration(beatPattern) * beatDuration;
            totalDuration = Math.max(totalDuration, beatTotalDuration);
        }
        if (melodyPattern) {
            const melodyTotalDuration = this.calculatePatternDuration(melodyPattern) * melodyDuration;
            totalDuration = Math.max(totalDuration, melodyTotalDuration);
        }

        // Play patterns based on track state
        const shouldPlayBeat = beatPattern && 
            !this.trackState.beat.muted && 
            (!this.trackState.melody.soloed || this.trackState.beat.soloed);
        
        const shouldPlayMelody = melodyPattern && 
            !this.trackState.melody.muted && 
            (!this.trackState.beat.soloed || this.trackState.melody.soloed);
        
        if (shouldPlayBeat) {
            this.playBeatPattern(beatPattern, beatBpm);
        }
        
        if (shouldPlayMelody) {
            this.playMelodyPattern(melodyPattern, melodyBpm);
        }
        
        // Schedule stop
        setTimeout(() => {
            if (this.isPlaying) {
                this.handleStop();
            }
        }, totalDuration * 1000);
    }
    
    calculatePatternDuration(pattern) {
        // Handle both array format and object format with BPM
        let patternItems = [];
        
        if (Array.isArray(pattern)) {
            patternItems = pattern;
        } else if (typeof pattern === 'object' && pattern.pattern && Array.isArray(pattern.pattern)) {
            patternItems = pattern.pattern;
        } else if (typeof pattern === 'object' && Array.isArray(pattern.beats)) {
            patternItems = pattern.beats;
        } else if (typeof pattern === 'object' && Array.isArray(pattern.notes)) {
            patternItems = pattern.notes;
        }
        
        return patternItems.reduce((total, item) => {
            const duration = item.dur || 1;
            return duration !== 0 ? total + duration : total;
        }, 0);
    }
    
    playBeatPattern(beatPattern = [], bpm = 300) {
        if (!this.audioEngine.isInitialized) this.audioEngine.init();

        // Handle both array format and object format with BPM
        let patternItems = [];
        if (Array.isArray(beatPattern)) {
            patternItems = beatPattern;
        } else if (typeof beatPattern === 'object' && beatPattern.pattern && Array.isArray(beatPattern.pattern)) {
            patternItems = beatPattern.pattern;
            bpm = beatPattern.bpm || bpm;
        } else if (typeof beatPattern === 'object' && Array.isArray(beatPattern.beats)) {
            patternItems = beatPattern.beats;
            bpm = beatPattern.bpm || bpm;
        }

        const beatMs = 60000 / bpm;
        const beatSec = beatMs / 1000;
        let startTime = this.audioEngine.audioContext.currentTime;

        patternItems.forEach(step => {
            // Skip items with duration 0 - check at the very beginning
            const itemDuration = step.dur || 1;
            if (itemDuration === 0) {
                return; // Skip this item entirely - no sound, no timing
            }
            
            let stepBeats;

            if (typeof step.dur === "number" && isFinite(step.dur)) {
                // explicit duration
                stepBeats = step.dur;
            } else if (step.beats && Array.isArray(step.beats) && step.beats.length > 0) {
                // compound types → shortest duration
                stepBeats = Math.min(...step.beats.map(t => {
                    if (typeof t === "string") return 1;
                    if (typeof t === "object" && typeof t.dur === "number" && isFinite(t.dur)) {
                        return t.dur;
                    }
                    return 1;
                }));
            } else {
                // default
                stepBeats = 1;
            }

            const stepDuration = beatSec * stepBeats;

            if (step.beat !== "rest") {
                // single type
                if (step.beat) {
                    const dur = step.dur || stepBeats;
                    const vol = step.vol || 1;
                    this.scheduleHit(step.beat, startTime, dur * beatSec, vol);
                }

                // multiple types
                if (step.beats && Array.isArray(step.beats)) {
                    step.beats.forEach(t => {
                        let typeName, hitDur, vol;
                        if (typeof t === "string") {
                            typeName = t;
                            hitDur = stepBeats; // default
                            vol = [1]; // default volume
                        } else if (typeof t === "object") {
                            typeName = t.beat;
                            hitDur = t.dur || stepBeats;
                            vol = t.vol || [1]; // individual beat volume or default
                        }
                        this.scheduleHit(typeName, startTime, hitDur * beatSec, vol);
                    });
                }
            }

            // visual dot flash
            setTimeout(() => {
                const dot = document.getElementById("metronomeDot");
                if (dot) {
                    dot.style.opacity = "1";
                    setTimeout(() => { dot.style.opacity = "0"; }, beatMs * stepBeats);
                }
            }, (startTime - this.audioEngine.audioContext.currentTime) * 1000);

            // advance timeline by shortest duration
            startTime += stepDuration;
        });
    }
    
    playMelodyPattern(melody = [], bpm = 300, onFinished) {
        if (!this.audioEngine.isInitialized) this.audioEngine.init();

        // Handle both array format and object format with BPM
        let patternItems = [];
        if (Array.isArray(melody)) {
            patternItems = melody;
        } else if (typeof melody === 'object' && melody.pattern && Array.isArray(melody.pattern)) {
            patternItems = melody.pattern;
            bpm = melody.bpm || bpm;
        } else if (typeof melody === 'object' && Array.isArray(melody.notes)) {
            patternItems = melody.notes;
            bpm = melody.bpm || bpm;
        }

        const beatMs = 60000 / bpm;
        const beatSec = beatMs / 1000;
        let startTime = this.audioEngine.audioContext.currentTime;
        let totalDuration = 0;

        patternItems.forEach(step => {
            // Skip items with duration 0 - check at the very beginning
            const itemDuration = step.dur || 1;
            if (itemDuration === 0) {
                return; // Skip this item entirely - no sound, no timing
            }
            
            // determine step length by shortest note
            let stepBeats;
            if (typeof step.dur === "number" && isFinite(step.dur)) {
                stepBeats = step.dur;
            } else if (step.notes && Array.isArray(step.notes) && step.notes.length > 0) {
                stepBeats = Math.min(...step.notes.map(n =>
                    (typeof n.dur === "number" && isFinite(n.dur)) ? n.dur : Infinity
                ));

            } else {
                stepBeats = 0;
            }

            const stepDuration = beatSec * stepBeats;

            if (step.notes && Array.isArray(step.notes)) {
                step.notes.forEach(n => {
                    let freq = null;
                    if (typeof n.freq === "number" && isFinite(n.freq)) {
                        freq = n.freq;
                    } else if (n.note) {
                        freq = this.noteToFrequency(n.note);
                    }

                    if (freq) {
                        // Each note has its own properties, no inheritance from parent
                        const noteDuration = beatSec * (n.dur || 1);
                        const instrument = n.instrument || 'sine';
                        const vol = n.vol || [1];
                        
                        if (instrument === "piano") {
                            this.playPianoTone(freq, startTime, noteDuration, vol);
                        } else if (instrument === "strings") {
                            this.playStringTone(freq, startTime, noteDuration, vol);
                        } else if (instrument === "electricGuitar") {
                            this.playElectricGuitarTone(freq, startTime, noteDuration, vol);
                        } else if (instrument === "acousticGuitar") {
                            this.playAcousticGuitarTone(freq, startTime, noteDuration, vol);
                        } else {
                            // default oscillator
                            const osc = this.audioEngine.audioContext.createOscillator();
                            const gain = this.audioEngine.audioContext.createGain();
                            osc.type = instrument === "guitar" ? "acousticGuitar" : instrument;
                            osc.frequency.setValueAtTime(freq, startTime);
                            const volPoints = this.normalizeVolume(vol);
                            this.applyVolumeRamp(gain, volPoints, startTime, noteDuration);
        osc.connect(gain).connect(this.audioEngine.masterGain);
                            osc.start(startTime);
                            osc.stop(startTime + noteDuration);
                            
                            // Track source for immediate stop
                            this.audioEngine.activeSources.push(osc);
                        }
                    }
                });
            } else {
                // single note or freq
                let freq = null;
                if (typeof step.freq === "number" && isFinite(step.freq)) {
                    freq = step.freq;
                } else if (step.note) {
                    freq = this.noteToFrequency(step.note);
                }

                if (step.note !== "rest" && freq) {
                    const noteDuration = beatSec * step.dur;
                    if (step.instrument === "piano") {
                        this.playPianoTone(freq, startTime, noteDuration);
                    } else if (step.instrument === "strings") {
                        this.playStringTone(freq, startTime, noteDuration);
                    } else if (step.instrument === "electricGuitar") {
                        this.playElectricGuitarTone(freq, startTime, noteDuration);
                    } else if (step.instrument === "acousticGuitar") {
                        this.playAcousticGuitarTone(freq, startTime, noteDuration);
                    } else {
                        const osc = this.audioEngine.audioContext.createOscillator();
                        const gain = this.audioEngine.audioContext.createGain();
                        osc.type = step.instrument === "guitar" ? "acousticGuitar" : (step.instrument || "square");
                        osc.frequency.setValueAtTime(freq, startTime);
                        const volPoints = this.normalizeVolume(step.vol);
                        this.applyVolumeRamp(gain, volPoints, startTime, noteDuration);
        // Connect to master gain if available, otherwise direct to destination
        if (this.audioEngine.masterGain) {
            osc.connect(gain).connect(this.audioEngine.masterGain);
        } else {
            osc.connect(gain).connect(this.audioEngine.audioContext.destination);
        }
                        osc.start(startTime);
                        osc.stop(startTime + noteDuration);
                        
                        // Track source for immediate stop
                        this.audioEngine.activeSources.push(osc);
                    }
                }
            }

            // advance timeline by shortest duration
            totalDuration += stepDuration;
            startTime += stepDuration;
        });

        // schedule callback when finished
        if (typeof onFinished === "function") {
            setTimeout(() => {
                onFinished();
            }, totalDuration * 1000);
        }
    }

    scheduleHit(type, time, duration, vol = 1) {
        // Skip duration 0 items
        if (duration <= 0) {
            return;
        }
        
        if (type === "hihat") this.playHiHatBeat(time, duration, vol);
        else if (type === "kick") this.playKickBeat(time, duration, vol);
        else if (type === "snare") this.playSnareBeat(time, duration, vol);
        else if (type === "clap") this.playClapBeat(time, duration);
    }

    playHiHatBeat(time, duration = 0.2, vol = 1) {
        // Skip duration 0 beats
        if (duration <= 0) {
            return;
        }
        
        const audioCtx = this.audioEngine.audioContext;
        const bufferSize = audioCtx.sampleRate * duration;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        // Filters
        const highpass = audioCtx.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = 8000;

        const bandpass = audioCtx.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.value = 9000;
        bandpass.Q.value = 1.5;

        // Envelope gain
        const gain = audioCtx.createGain();
        const volPoints = this.normalizeVolume(vol);

        // scale by envelope peak (1.2)
        this.applyVolumeRamp(gain, volPoints, time, duration, 1.2);

        // safe exponential cutoff (avoid ramp from 0)
        const startVal = volPoints[0] * 1.2;
        if (startVal > 0) {
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
        } else {
            gain.gain.linearRampToValueAtTime(0.001, time + 0.25);
        }

        // Master gain stage (constant boost, not scaled by array)
        const masterGain = audioCtx.createGain();
        masterGain.gain.value = 1.5;

        noise.connect(highpass).connect(gain).connect(masterGain).connect(this.audioEngine.masterGain);
        noise.connect(bandpass).connect(gain).connect(masterGain).connect(this.audioEngine.masterGain);

        noise.start(time);
        noise.stop(time + duration);
        
        // Track source for immediate stop
        this.audioEngine.activeSources.push(noise);
    }

    playKickBeat(time, duration = 0.3, vol = 1) {
        // Skip duration 0 beats
        if (duration <= 0) {
            return;
        }
        
        const audioCtx = this.audioEngine.audioContext;
        // Sub-bass sine sweep
        const osc = audioCtx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(50, time + 0.1);

        const gain = audioCtx.createGain();
        const volPoints = this.normalizeVolume(vol);
        this.applyVolumeRamp(gain, volPoints, time, duration, 1.5); // stronger fundamental

        // FIX: safe ramp instead of unconditional exponential
        const startVal = volPoints[0] * 1.5;
        this.safeExponentialRamp(gain, startVal, 0.001, time + duration);

        // Attack click (short noise burst)
        const bufferSize = audioCtx.sampleRate * 0.02;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const noiseGain = audioCtx.createGain();
        const noiseVol = this.normalizeVolume(vol);
        this.applyVolumeRamp(noiseGain, noiseVol, time, 0.05);

        // FIX: safe ramp for noise click
        const noiseStartVal = noiseVol[0];
        this.safeExponentialRamp(noiseGain, noiseStartVal, 0.001, time + 0.05);

        // Harmonic layer
        const osc2 = audioCtx.createOscillator();
        osc2.type = "triangle";
        osc2.frequency.value = 100;
        const gain2 = audioCtx.createGain();
        const vol2 = this.normalizeVolume(vol);
        this.applyVolumeRamp(gain2, vol2, time, 0.15);

        const osc2StartVal = vol2[0];
        this.safeExponentialRamp(gain2, osc2StartVal, 0.001, time + 0.15);

        // Connect chains
        osc.connect(gain).connect(this.audioEngine.masterGain);
        noise.connect(noiseGain).connect(this.audioEngine.masterGain);
        osc2.connect(gain2).connect(this.audioEngine.masterGain);

        // Start/stop
        osc.start(time);
        osc.stop(time + duration);
        noise.start(time);
        noise.stop(time + 0.05);
        osc2.start(time);
        osc2.stop(time + 0.15);
        
        // Track sources for immediate stop
        this.audioEngine.activeSources.push(osc, noise, osc2);
    }

    playSnareBeat(time, duration = 0.2, vol = 1) {
        // Skip duration 0 beats
        if (duration <= 0) {
            return;
        }
        
        const audioCtx = this.audioEngine.audioContext;
        const bufferSize = audioCtx.sampleRate * duration;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        // Crack
        const crackFilter = audioCtx.createBiquadFilter();
        crackFilter.type = "bandpass";
        crackFilter.frequency.value = 3500;
        const crackGain = audioCtx.createGain();
        const crackVol = this.normalizeVolume(vol);
        this.applyVolumeRamp(crackGain, crackVol, time, duration, 2.0);
        this.safeExponentialRamp(crackGain, crackVol[0] * 2.0, 0.001, time + 0.06);

        // Body
        const bodyFilter = audioCtx.createBiquadFilter();
        bodyFilter.type = "bandpass";
        bodyFilter.frequency.value = 1200;
        const bodyGain = audioCtx.createGain();
        const bodyVol = this.normalizeVolume(vol);
        this.applyVolumeRamp(bodyGain, bodyVol, time, duration, 1.2);
        this.safeExponentialRamp(bodyGain, bodyVol[0] * 1.2, 0.001, time + 0.1);

        // Air
        const airFilter = audioCtx.createBiquadFilter();
        airFilter.type = "bandpass";
        airFilter.frequency.value = 9000;
        const airGain = audioCtx.createGain();
        const airVol = this.normalizeVolume(vol);
        this.applyVolumeRamp(airGain, airVol, time, duration, 0.8);
        this.safeExponentialRamp(airGain, airVol[0] * 0.8, 0.001, time + 0.12);

        const masterGain = audioCtx.createGain();
        masterGain.gain.value = 1.5;

        noise.connect(crackFilter).connect(crackGain).connect(masterGain).connect(this.audioEngine.masterGain);
        noise.connect(bodyFilter).connect(bodyGain).connect(masterGain).connect(this.audioEngine.masterGain);
        noise.connect(airFilter).connect(airGain).connect(masterGain).connect(this.audioEngine.masterGain);

        noise.start(time);
        noise.stop(time + duration);
        
        // Track source for immediate stop
        this.audioEngine.activeSources.push(noise);
    }

    playClapBeat(time, duration = 0.12) {
        // Skip duration 0 beats
        if (duration <= 0) {
            return;
        }
        
        const audioCtx = this.audioEngine.audioContext;
        const bufferSize = audioCtx.sampleRate * duration;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        // Pink-ish noise: accumulate to reduce high-frequency harshness
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.997 * b0 + white * 0.05;
            b1 = 0.985 * b1 + white * 0.1;
            b2 = 0.940 * b2 + white * 0.2;
            data[i] = b0 + b1 + b2 + white * 0.05;
        }

        const bandpass = audioCtx.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.value = 2000; // slightly lower
        bandpass.Q.value = 2.5;          // tighter band

        const highpass = audioCtx.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = 800;  // remove low rumble

        const bursts = [0, 0.02, 0.04];
        bursts.forEach((offset, idx) => {
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;

            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(1.0 - idx * 0.3, time + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, time + offset + 0.08);

            noise.connect(highpass).connect(bandpass).connect(gain).connect(this.audioEngine.masterGain);
            noise.start(time + offset);
            noise.stop(time + offset + 0.1);
            
            // Track source for immediate stop
            this.audioEngine.activeSources.push(noise);
        });
    }

    safeExponentialRamp(gainNode, startValue, endValue, endTime) {
        if (startValue <= 0) {
            gainNode.gain.linearRampToValueAtTime(endValue, endTime);
        } else {
            gainNode.gain.exponentialRampToValueAtTime(endValue, endTime);
        }
    }

    normalizeVolume(vol) {
        if (Array.isArray(vol)) return vol;
        if (typeof vol === "number") return [vol];
        return [1]; // default full volume
    }

    applyVolumeRamp(gainNode, volPoints, startTime, dur, envelopePeak = 1.0) {
        const points = Array.isArray(volPoints) ? volPoints : [volPoints];

        // Always set the starting value
        const v0 = (points[0] ?? 1) * envelopePeak;
        gainNode.gain.setValueAtTime(v0, startTime);

        if (points.length === 1) return;

        // Ramp through subsequent points
        for (let i = 1; i < points.length; i++) {
            const t = startTime + (i / (points.length - 1)) * dur;
            gainNode.gain.linearRampToValueAtTime(points[i] * envelopePeak, t);
        }
    }

    playPianoTone(freq, startTime, duration, vol = [1]) {
        // Skip duration 0 notes
        if (duration <= 0) {
            return null;
        }
        
        const audioCtx = this.audioEngine.audioContext;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "sine"; // fundamental tone
        osc.frequency.setValueAtTime(freq, startTime);

        // Envelope: sharp attack, sustain, natural release
        gain.gain.setValueAtTime(0, startTime);
        const volPoints = this.normalizeVolume(vol);
        gain.gain.linearRampToValueAtTime(volPoints[0], startTime + 0.01); // fast attack
        gain.gain.setValueAtTime(volPoints[0] * 0.7, startTime + 0.1); // slight decay to sustain level

        osc.connect(gain).connect(this.audioEngine.masterGain);
        osc.start(startTime);
        osc.stop(startTime + duration);
        
        // Track source for immediate stop
        this.audioEngine.activeSources.push(osc);

        return { osc, gain };
    }

    playStringTone(freq, startTime, duration, vol = [1]) {
        // Skip duration 0 notes
        if (duration <= 0) {
            return null;
        }
        
        const audioCtx = this.audioEngine.audioContext;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, startTime);

        // Envelope: slow attack, steady sustain, gentle release
        gain.gain.setValueAtTime(0, startTime);
        const volPoints = this.normalizeVolume(vol);
        gain.gain.linearRampToValueAtTime(volPoints[0], startTime + 0.1); // slow attack

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(500, startTime);

        osc.connect(filter).connect(gain).connect(this.audioEngine.masterGain);
        osc.start(startTime);

        if (duration) {
            // Sustain for most of duration, then release
            gain.gain.setValueAtTime(volPoints[0], startTime + 0.1); // maintain sustain
            gain.gain.linearRampToValueAtTime(0, startTime + duration); // release
            osc.stop(startTime + duration);
        }
        
        // Track source for immediate stop
        this.audioEngine.activeSources.push(osc);

        return { osc, gain };
    }

    playElectricGuitarTone(freq, startTime, duration, vol = [1]) {
        // Skip duration 0 notes
        if (duration <= 0) {
            return null;
        }
        
        const audioCtx = this.audioEngine.audioContext;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = "sawtooth"; // bright harmonic content
        osc.frequency.setValueAtTime(freq, startTime);

        // Envelope: sharp attack, sustain, release
        gain.gain.setValueAtTime(0, startTime);
        const volPoints = this.normalizeVolume(vol);
        gain.gain.linearRampToValueAtTime(volPoints[0], startTime + 0.02); // fast attack

        // Filter to tame harshness
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2500, startTime);

        osc.connect(filter).connect(gain).connect(this.audioEngine.masterGain);
        osc.start(startTime);

        if (duration) {
            // Sustain for most of duration, then release
            gain.gain.setValueAtTime(volPoints[0], startTime + 0.02); // maintain sustain
            gain.gain.linearRampToValueAtTime(0, startTime + duration); // release
            osc.stop(startTime + duration);
        }
        
        // Track source for immediate stop
        this.audioEngine.activeSources.push(osc);

        return { osc, gain };
    }

    playAcousticGuitarTone(freq, startTime, duration, vol = [1]) {
        // Skip duration 0 notes
        if (duration <= 0) {
            return null;
        }
        
        const audioCtx = this.audioEngine.audioContext;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "triangle"; // softer harmonic profile
        osc.frequency.setValueAtTime(freq, startTime);

        // Envelope: pluck attack, sustain, release
        gain.gain.setValueAtTime(0, startTime);
        const volPoints = this.normalizeVolume(vol);
        gain.gain.linearRampToValueAtTime(volPoints[0], startTime + 0.01); // sharp pluck attack
        gain.gain.setValueAtTime(volPoints[0] * 0.4, startTime + 0.05); // slight decay to sustain

        osc.connect(gain).connect(this.audioEngine.masterGain);
        osc.start(startTime);

        if (duration) {
            // Sustain for most of duration, then release
            gain.gain.setValueAtTime(volPoints[0] * 0.4, startTime + 0.05); // maintain sustain
            gain.gain.linearRampToValueAtTime(0, startTime + duration); // release
            osc.stop(startTime + duration);
        }
        
        // Track source for immediate stop
        this.audioEngine.activeSources.push(osc);

        return { osc, gain };
    }

    noteToFrequency(note) {
        // Handle non-string inputs
        if (typeof note !== "string") return null;
        
        const A4 = 440;
        const notes = {
            "C": -9, "C#": -8, "Db": -8,
            "D": -7, "D#": -6, "Eb": -6,
            "E": -5,
            "F": -4, "F#": -3, "Gb": -3,
            "G": -2, "G#": -1, "Ab": -1,
            "A": 0, "A#": 1, "Bb": 1,
            "B": 2
        };

        // split note string into pitch + octave
        const match = note.match(/^([A-G]#?|[A-G]b?)(\d)$/);
        if (!match) return null;

        const pitch = match[1];
        const octave = parseInt(match[2], 10);

        // semitone distance from A4
        const semitones = notes[pitch] + (octave - 4) * 12;
        return A4 * Math.pow(2, semitones / 12);
    }
    

    
    // Storage-related methods
    loadPreferences() {
        const preferences = this.storage.getPreferences();
        
        // Apply saved preferences
        this.tempo = preferences.tempo || 120;
        
        // Update UI
        this.tempoSlider.value = this.tempo;
        this.tempoDisplay.textContent = this.tempo;
        
        // Set master volume if audio engine supports it
        if (this.audioEngine.setMasterVolume) {
            this.audioEngine.setMasterVolume(preferences.masterVolume || 0.7);
        }
    }
    
    savePreferences() {
        const preferences = {
            tempo: this.tempo,
            masterVolume: 0.7 // Default, could be made configurable
        };
        
        this.storage.savePreferences(preferences);
    }
    
    saveProject() {
        const beatText = this.beatInput.value.trim();
        const melodyText = this.melodyInput.value.trim();

        if (!beatText && !melodyText) {
            this.updateStatus('Error: No patterns to save', 'error');
            return;
        }
        
        // Validate JSON
        let beatPattern = null;
        let melodyPattern = null;

        try {
            if (beatText) {
                beatPattern = JSON.parse(beatText);

                const beatValid = this.storage.validatePattern(beatPattern, 'beat');

                if (!beatValid) {
                    this.updateStatus('Error: Invalid beat pattern format', 'error');
                    return;
                }
            }
            
            if (melodyText) {
                melodyPattern = JSON.parse(melodyText);

                const melodyValid = this.storage.validatePattern(melodyPattern, 'melody');

                if (!melodyValid) {
                    this.updateStatus('Error: Invalid melody pattern format', 'error');
                    return;
                }
            }
            
            // Prompt for name
            const name = prompt('Enter a name for this project:', `Project ${Date.now()}`);

            if (!name) {
                return;
            }
            
            // Save project
            const projectData = {
                tempo: this.tempo,
                description: 'User-created music project',
                tags: ['user-created']
            };

            const success = this.storage.saveProject(name, beatPattern, melodyPattern, projectData);

            if (success) {
                this.updateStatus('Project saved successfully', 'success');
            } else {
                this.updateStatus('Error: Failed to save project', 'error');
            }
            
        } catch (error) {
            this.updateStatus('Error: Invalid JSON in patterns', 'error');
        }
    }
    
    showLoadProjectDialog() {
        const projects = this.storage.getProjects();
        
        if (projects.length === 0) {
            this.updateStatus('No saved projects found', 'error');
            return;
        }
        
        // Create simple selection dialog
        const options = projects.map((project, index) => {
            const hasBeat = project.beatPattern ? '🥁' : '❌';
            const hasMelody = project.melodyPattern ? '🎵' : '❌';
            const date = new Date(project.modified).toLocaleDateString();
            return `${index + 1}. ${project.name} ${hasBeat} ${hasMelody} - ${date}`;
        }).join('\n');
        
        const selection = prompt(`Select a project to load:\n\n${options}\n\nEnter the number:`);
        
        if (!selection) return;
        
        const index = parseInt(selection) - 1;
        if (index >= 0 && index < projects.length) {
            this.loadProject(projects[index]);
        } else {
            this.updateStatus('Invalid selection', 'error');
        }
    }
    
    loadProject(project) {
        try {
            // Load beat pattern
            if (project.beatPattern) {
                this.beatInput.value = JSON.stringify(project.beatPattern, null, 2);
            } else {
                this.beatInput.value = '';
            }
            this.beatInput.scrollTop = 0; // Reset scroll position
            
            // Load melody pattern
            if (project.melodyPattern) {
                this.melodyInput.value = JSON.stringify(project.melodyPattern, null, 2);
            } else {
                this.melodyInput.value = '';
            }
            this.melodyInput.scrollTop = 0; // Reset scroll position
            
            // Load project settings
            if (project.tempo) {
                this.tempo = project.tempo;
                this.tempoSlider.value = this.tempo;
                this.tempoDisplay.textContent = this.tempo;
            }
            

            
            this.updateStatus(`Loaded project: ${project.name}`, 'success');
            
            // Add to recent projects
            this.storage.addToRecentProject(project);
            
            // Save preferences
            this.savePreferences();
            
        } catch (error) {
            this.updateStatus('Error: Failed to load project', 'error');
        }
    }
    
    exportData() {
        try {
            const exportData = this.storage.exportData();
            
            if (!exportData) {
                this.updateStatus('Error: No data to export', 'error');
                return;
            }
            
            // Create download link
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `music-player-data-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            this.updateStatus('Data exported successfully', 'success');
            
        } catch (error) {
            this.updateStatus('Error: Failed to export data', 'error');
        }
    }
    
    importData() {
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        
        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    if (this.storage.importData(importedData)) {
                        this.updateStatus('Data imported successfully', 'success');
                        // Reload preferences to apply any imported settings
                        this.loadPreferences();
                    } else {
                        this.updateStatus('Error: Failed to import data', 'error');
                    }
                } catch (error) {
                    this.updateStatus('Error: Invalid import file format', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        fileInput.click();
    }
    
    showManageDataDialog() {
        const projects = this.storage.getProjects();
        const patterns = this.storage.getPatterns();
        
        if (projects.length === 0 && patterns.beats.length === 0 && patterns.melodies.length === 0) {
            this.updateStatus('No saved data to manage', 'error');
            return;
        }
        
        let dialogHTML = '<div class="manage-dialog">';
        dialogHTML += '<h3>Manage Saved Data</h3>';
        
        // Projects section
        if (projects.length > 0) {
            dialogHTML += '<div class="manage-section"><h4>Projects</h4>';
            projects.forEach((project, index) => {
                const hasBeat = project.beatPattern ? '🥁' : '❌';
                const hasMelody = project.melodyPattern ? '🎵' : '❌';
                const date = new Date(project.modified).toLocaleDateString();
                dialogHTML += `
                    <div class="manage-item">
                        <span class="item-info">${index + 1}. ${project.name} ${hasBeat} ${hasMelody} - ${date}</span>
                        <div class="item-actions">
                            <button onclick="musicPlayer.loadProjectById('${project.id}')" class="load-btn">Load</button>
                            <button onclick="musicPlayer.deleteProject('${project.id}')" class="delete-btn">Delete</button>
                        </div>
                    </div>
                `;
            });
            dialogHTML += '</div>';
        }
        
        // Beat patterns section
        if (patterns.beats.length > 0) {
            dialogHTML += '<div class="manage-section"><h4>Beat Patterns</h4>';
            patterns.beats.forEach((pattern, index) => {
                const date = new Date(pattern.modified).toLocaleDateString();
                dialogHTML += `
                    <div class="manage-item">
                        <span class="item-info">${index + 1}. ${pattern.name} - ${date}</span>
                        <div class="item-actions">
                            <button onclick="musicPlayer.loadPatternById('${pattern.id}', 'beat')" class="load-btn">Load</button>
                            <button onclick="musicPlayer.deletePattern('${pattern.id}', 'beat')" class="delete-btn">Delete</button>
                        </div>
                    </div>
                `;
            });
            dialogHTML += '</div>';
        }
        
        // Melody patterns section
        if (patterns.melodies.length > 0) {
            dialogHTML += '<div class="manage-section"><h4>Melody Patterns</h4>';
            patterns.melodies.forEach((pattern, index) => {
                const date = new Date(pattern.modified).toLocaleDateString();
                dialogHTML += `
                    <div class="manage-item">
                        <span class="item-info">${index + 1}. ${pattern.name} - ${date}</span>
                        <div class="item-actions">
                            <button onclick="musicPlayer.loadPatternById('${pattern.id}', 'melody')" class="load-btn">Load</button>
                            <button onclick="musicPlayer.deletePattern('${pattern.id}', 'melody')" class="delete-btn">Delete</button>
                        </div>
                    </div>
                `;
            });
            dialogHTML += '</div>';
        }
        
        dialogHTML += '<div class="dialog-actions">';
        dialogHTML += '<button onclick="musicPlayer.deleteAllData()" class="delete-all-btn">Delete All</button>';
        dialogHTML += '<button onclick="musicPlayer.closeManageDialog()" class="close-btn">Close</button>';
        dialogHTML += '</div>';
        dialogHTML += '</div>';
        
        // Create and show dialog
        const dialog = document.createElement('div');
        dialog.id = 'manage-dialog-overlay';
        dialog.innerHTML = dialogHTML;
        document.body.appendChild(dialog);
        
        // Add styles if not already added
        if (!document.getElementById('manage-dialog-styles')) {
            const style = document.createElement('style');
            style.id = 'manage-dialog-styles';
            style.textContent = `
                #manage-dialog-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                
                .manage-dialog {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    max-width: 600px;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                }
                
                .manage-dialog h3 {
                    margin-top: 0;
                    color: #2c3e50;
                    text-align: center;
                }
                
                .manage-section {
                    margin-bottom: 20px;
                }
                
                .manage-section h4 {
                    color: #3498db;
                    margin-bottom: 10px;
                    border-bottom: 2px solid #ecf0f1;
                    padding-bottom: 5px;
                }
                
                .manage-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    margin-bottom: 5px;
                    background-color: #f8f9fa;
                    border-radius: 4px;
                    border: 1px solid #e9ecef;
                }
                
                .item-info {
                    flex: 1;
                    font-size: 0.9rem;
                }
                
                .item-actions {
                    display: flex;
                    gap: 8px;
                }
                
                .load-btn {
                    background-color: #3498db;
                    color: white;
                    border: none;
                    padding: 4px 8px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 0.8rem;
                }
                
                .load-btn:hover {
                    background-color: #2980b9;
                }
                
                .delete-btn {
                    background-color: #e74c3c;
                    color: white;
                    border: none;
                    padding: 4px 8px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 0.8rem;
                }
                
                .delete-btn:hover {
                    background-color: #c0392b;
                }
                
                .close-btn {
                    background-color: #95a5a6;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                    display: block;
                    margin: 20px auto 0;
                }
                
                .close-btn:hover {
                    background-color: #7f8c8d;
                }
                
                .dialog-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    margin-top: 20px;
                }
                
                .delete-all-btn {
                    background-color: #c0392b;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 600;
                    display: block;
                    margin: 20px auto 0;
                }
                
                .delete-all-btn:hover {
                    background-color: #a93226;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    closeManageDialog() {
        const dialog = document.getElementById('manage-dialog-overlay');
        if (dialog) {
            dialog.remove();
        }
    }
    
    loadProjectById(id) {
        const project = this.storage.getProject(id);
        if (project) {
            this.loadProject(project);
            this.closeManageDialog();
        } else {
            this.updateStatus('Error: Project not found', 'error');
        }
    }
    
    loadPatternById(id, type) {
        const patterns = this.storage.getPatterns(type);
        const pattern = patterns.find(p => p.id === id);
        
        if (pattern) {
            try {
                const patternText = JSON.stringify(pattern.pattern, null, 2);
                
                if (type === 'beat') {
                    this.beatInput.value = patternText;
                } else {
                    this.melodyInput.value = patternText;
                }
                
                this.updateStatus(`Loaded ${pattern.name} (${type})`, 'success');
                this.closeManageDialog();
                
                // Add to recent patterns
                this.storage.addToRecent(type, pattern);
                
            } catch (error) {
                this.updateStatus('Error: Failed to load pattern', 'error');
            }
        } else {
            this.updateStatus('Error: Pattern not found', 'error');
        }
    }
    
    deleteProject(id) {
        if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            if (this.storage.deleteProject(id)) {
                this.updateStatus('Project deleted successfully', 'success');
                // Refresh the dialog
                this.closeManageDialog();
                this.showManageDataDialog();
            } else {
                this.updateStatus('Error: Failed to delete project', 'error');
            }
        }
    }
    
    deletePattern(id, type) {
        if (confirm('Are you sure you want to delete this pattern? This action cannot be undone.')) {
            if (this.storage.deletePattern(id)) {
                this.updateStatus(`${type.charAt(0).toUpperCase() + type.slice(1)} pattern deleted successfully`, 'success');
                // Refresh the dialog
                this.closeManageDialog();
                this.showManageDataDialog();
            } else {
                this.updateStatus('Error: Failed to delete pattern', 'error');
            }
        }
    }
    
    deleteAllData() {
        const confirmMessage = 'Are you sure you want to delete ALL saved data?\n\n' +
                          'This will permanently delete:\n' +
                          '• All saved projects\n' +
                          '• All beat patterns\n' +
                          '• All melody patterns\n' +
                          '• All preferences\n\n' +
                          'This action cannot be undone!';
        
        if (confirm(confirmMessage)) {
            if (this.storage.clearAllData()) {
                this.updateStatus('All data deleted successfully', 'success');
                this.closeManageDialog();
                
                // Reinitialize storage to ensure clean state
                this.storage = new StorageModule();
                
                // Reset preferences to defaults
                this.tempo = 120;
                this.tempoSlider.value = this.tempo;
                this.tempoDisplay.textContent = this.tempo;
                
                // Clear input fields
                this.beatInput.value = '';
                this.melodyInput.value = '';
                
            } else {
                this.updateStatus('Error: Failed to delete all data', 'error');
            }
        }
    }
    
    // Track Control Methods
    toggleTrackMute(track) {
        this.trackState[track].muted = !this.trackState[track].muted;
        const btn = track === 'beat' ? this.beatMuteBtn : this.melodyMuteBtn;
        btn.textContent = this.trackState[track].muted ? 'Unmute' : 'Mute';
        btn.classList.toggle('muted', this.trackState[track].muted);
        this.updateStatus(`${track.charAt(0).toUpperCase() + track.slice(1)} track ${this.trackState[track].muted ? 'muted' : 'unmuted'}`);
    }
    
    toggleTrackSolo(track) {
        // When soloing a track, unsolo the other track
        if (!this.trackState[track].soloed) {
            this.trackState.beat.soloed = track === 'beat';
            this.trackState.melody.soloed = track === 'melody';
        } else {
            this.trackState.beat.soloed = false;
            this.trackState.melody.soloed = false;
        }
        
        // Update button states
        this.beatSoloBtn.classList.toggle('soloed', this.trackState.beat.soloed);
        this.melodySoloBtn.classList.toggle('soloed', this.trackState.melody.soloed);
        
        const soloedTrack = this.trackState.beat.soloed ? 'beat' : 
                          this.trackState.melody.soloed ? 'melody' : 'none';
        this.updateStatus(`Solo: ${soloedTrack.charAt(0).toUpperCase() + soloedTrack.slice(1)}`);
    }
    
    toggleAutoScroll() {
        this.autoScrollDuringPlayback = !this.autoScrollDuringPlayback;
        this.autoScrollBtn.textContent = `Auto-Scroll: ${this.autoScrollDuringPlayback ? 'ON' : 'OFF'}`;
        this.autoScrollBtn.classList.toggle('active', this.autoScrollDuringPlayback);
        this.updateStatus(`Auto-scroll ${this.autoScrollDuringPlayback ? 'enabled' : 'disabled'}`);
    }
    
    // Editor Switching
    switchEditor(editor) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        if (editor === 'json') this.jsonTabBtn.classList.add('active');
        else if (editor === 'midi') this.midiTabBtn.classList.add('active');
        
        // Update editors
        document.querySelectorAll('.pattern-editor').forEach(editor => editor.classList.remove('active'));
        if (editor === 'json') this.jsonEditor.classList.add('active');
        else if (editor === 'midi') this.midiEditor.classList.add('active');
        
        // Show/hide playback visualization based on editor
        const playbackVisualization = document.querySelector('.playback-visualization');
        if (playbackVisualization) {
            if (editor === 'json') {
                playbackVisualization.style.display = 'block';
            } else if (editor === 'midi') {
                playbackVisualization.style.display = 'none';
            }
        }
        
        this.updateStatus(`Switched to ${editor.toUpperCase()} editor`);
    }

    // MIDI Methods
    handleMidiUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.midiData = e.target.result;
                this.midiFile = file;
                this.midiInfo.innerHTML = `
                    <p><strong>File:</strong> ${file.name}</p>
                    <p><strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
                    <p><strong>Status:</strong> Ready to convert</p>
                `;
                this.updateStatus('MIDI file loaded successfully');
            } catch (error) {
                this.midiInfo.innerHTML = '<p style="color: red;">Error loading MIDI file</p>';
                this.updateStatus('Error: Failed to load MIDI file', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    }
    
    convertMidiToPattern() {
        if (!this.midiData) {
            this.updateStatus('Please load a MIDI file first', 'error');
            return;
        }
        
        try {
            // Initialize MIDI parser
            const parser = new MidiParser();
            
            // Parse the MIDI file
            const midiData = parser.parse(this.midiData);
            
            // Convert to beat and melody patterns
            const patterns = parser.convertToPatterns();
            
            // Update tempo if different from current
            if (patterns.tempo && patterns.tempo !== this.tempo) {
                this.tempo = patterns.tempo;
                this.tempoSlider.value = this.tempo;
                this.tempoDisplay.textContent = this.tempo;
            }
            
            // Set the patterns in the JSON editor
            this.beatInput.value = JSON.stringify(patterns.beatPattern, null, 2);
            this.melodyInput.value = JSON.stringify(patterns.melodyPattern, null, 2);
            
            // Reset scroll positions
            this.beatInput.scrollTop = 0;
            this.melodyInput.scrollTop = 0;
            
            // Update MIDI info with conversion details
            this.midiInfo.innerHTML = `
                <p><strong>File:</strong> ${this.midiFile.name}</p>
                <p><strong>Size:</strong> ${(this.midiFile.size / 1024).toFixed(2)} KB</p>
                <p><strong>Tracks:</strong> ${midiData.tracks.length}</p>
                <p><strong>Tempo:</strong> ${patterns.tempo} BPM</p>
                <p><strong>Beat Pattern:</strong> ${patterns.beatPattern.length} events</p>
                <p><strong>Melody Pattern:</strong> ${patterns.melodyPattern.length} events</p>
                <p style="color: green;"><strong>Status:</strong> Converted successfully!</p>
            `;
            
            this.updateStatus('MIDI converted to patterns successfully');
            
            // Switch to JSON editor tab to show results
            this.switchEditor('json');
            
        } catch (error) {
            console.error('MIDI conversion error:', error);
            this.midiInfo.innerHTML += `<p style="color: red;">Error: ${error.message}</p>`;
            this.updateStatus('Error: Failed to convert MIDI - ' + error.message, 'error');
        }
    }
    
    // Playback Visualization
    startPlaybackVisualization() {
        this.clearPlaybackVisualization();
        
        // Always visualize both beat and melody
        this.visualizePattern('beat');
        this.visualizePattern('melody');
    }
    

    
    visualizePattern(type) {
        // Defensive checks
        const input = type === 'beat' ? this.beatInput : this.melodyInput;
        const viz = type === 'beat' ? this.beatViz : this.melodyViz;
        
        if (!input || !viz) {
            console.error(`Visualization error: Missing ${type} input or viz element`);
            return;
        }
        
        let data;
        try {
            data = JSON.parse(input.value || '[]');
        } catch (error) {
            console.error(`Error parsing ${type} pattern for visualization:`, error);
            return;
        }
        
        // Handle both array format and object format with BPM
        let patternItems = [];
        let tempo = this.tempo; // default tempo
        
        if (Array.isArray(data)) {
            patternItems = data;
        } else if (typeof data === 'object' && data.pattern && Array.isArray(data.pattern)) {
            patternItems = data.pattern;
            tempo = data.bpm || this.tempo;
        } else if (typeof data === 'object' && Array.isArray(data.beats)) {
            patternItems = data.beats;
            tempo = data.bpm || this.tempo;
        } else {
            console.error(`${type} pattern is not in a valid format:`, data);
            return;
        }
        
        const beatDuration = 60 / tempo;
        
        // Clear existing visualization
        viz.innerHTML = '';
        
        // Filter out items with duration 0
        const filteredItems = patternItems.filter(item => {
            const duration = item && typeof item.dur === 'number' ? item.dur : 1;
            return duration !== 0;
        });
        
        // Calculate total duration for positioning
        const totalDuration = filteredItems.reduce((total, item) => total + ((item && typeof item.dur === 'number') ? item.dur : 1), 0);
        
        let currentTime = 0;
        
        filteredItems.forEach((item, index) => {
            if (!item || typeof item !== 'object') {
                console.warn(`Invalid ${type} pattern item at index ${index}:`, item);
                return;
            }
            
            const duration = ((item && typeof item.dur === 'number') ? item.dur : 1) * beatDuration;
            const startTime = currentTime;
            const endTime = currentTime + duration;
            
            // Create visualization element
            const vizItem = document.createElement('div');
            vizItem.className = 'viz-item';
            
            const label = type === 'beat' ? item.beat : item.note;
            vizItem.textContent = label;
            vizItem.title = `${label} (${(item.dur || 1).toFixed(1)} beats)`;
            
            // Add data attributes for debugging and scroll tracking
            vizItem.dataset.index = index;
            vizItem.dataset.startTime = startTime;
            vizItem.dataset.duration = duration;
            vizItem.dataset.label = label;
            
            viz.appendChild(vizItem);

            // Schedule highlighting with optional scrolling
            const highlightTimer = setTimeout(() => {
                vizItem.classList.add('active');

                // Only scroll if user has enabled auto-scroll
                if (this.autoScrollDuringPlayback) {
                    this.scrollToActiveItem(viz, vizItem);
                }
                
                setTimeout(() => {
                    vizItem.classList.remove('active');
                }, duration * 1000 - 100); // Remove highlight just before next item
            }, startTime * 1000);
            
            if (this.playbackTimers && this.playbackTimers[type]) {
                this.playbackTimers[type].push(highlightTimer);
            }
            currentTime = endTime;
        });
        
        console.log(`Visualization for ${type}:`, {
            totalItems: patternItems.length,
            filteredItems: filteredItems.length,
            totalDuration: totalDuration,
            tempo: tempo,
            items: filteredItems.map((item, i) => ({
                index: i,
                label: type === 'beat' ? item.beat : item.note,
                duration: item.dur || 1,
                startTime: filteredItems.slice(0, i).reduce((sum, prev) => sum + (prev.dur || 1), 0) * beatDuration
            }))
        });
    }
    
    scrollToActiveItem(viz, activeItem) {
        // Smooth horizontal scrolling to keep active item visible
        try {
            const vizRect = viz.getBoundingClientRect();
            const itemRect = activeItem.getBoundingClientRect();
            
            // Calculate item position relative to visualization container
            const itemLeft = itemRect.left - vizRect.left;
            const itemRight = itemRect.right - vizRect.left;
            const vizWidth = vizRect.width;
            
            // Check if item needs scrolling (not fully visible with some padding)
            const padding = 50; // 50px padding on each side
            const needsScroll = itemLeft < padding || itemRight > (vizWidth - padding);
            
            if (needsScroll) {
                console.log('Scrolling to active item:', {
                    itemLeft,
                    itemRight,
                    vizWidth,
                    needsScroll
                });
                
                // Use scrollIntoView with options for smooth horizontal scrolling
                activeItem.scrollIntoView({
                    behavior: 'smooth',
                    inline: 'center',
                    block: 'nearest'
                });
            }
        } catch (error) {
            console.error('Error in scroll check:', error);
        }
    }
    
    clearPlaybackVisualization() {
        // Clear existing timers
        if (this.playbackTimers) {
            Object.values(this.playbackTimers).forEach(timers => {
                if (Array.isArray(timers)) {
                    timers.forEach(timer => clearTimeout(timer));
                }
            });
            
            this.playbackTimers.beat = [];
            this.playbackTimers.melody = [];
        }
        
        // Clear scroll trackers
        if (this.scrollTrackers) {
            Object.values(this.scrollTrackers).forEach(tracker => {
                if (tracker) clearInterval(tracker);
            });
            this.scrollTrackers = {};
        }
        
        // Clear text highlights
        this.clearTextHighlights(this.beatInput);
        this.clearTextHighlights(this.melodyInput);
        
        // Clear visualization containers (keep them empty)
        if (this.beatViz) this.beatViz.innerHTML = '';
        if (this.melodyViz) this.melodyViz.innerHTML = '';
    }
    
    clearTextHighlights(textarea) {
        // Restore original value without highlights
        if (textarea.dataset.originalValue) {
            textarea.value = textarea.dataset.originalValue;
            textarea.scrollTop = 0; // Reset scroll position
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.musicPlayer = new MusicPlayer();
});