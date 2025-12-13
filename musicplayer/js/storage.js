// Storage Module - Handles persistent storage for music player data
class StorageModule {
    constructor() {
        this.storageKey = 'musicPlayerData';
        this.defaultData = {
            projects: [],
            patterns: {
                beats: [],
                melodies: []
            },
            preferences: {
                tempo: 120,
                playbackMode: 'both',
                masterVolume: 0.7
            },
            recentPatterns: {
                beats: [],
                melodies: []
            },
            recentProjects: []
        };
        
        this.init();
    }
    
    init() {
        // Initialize storage with default data if empty or invalid
        const data = this.getData();
        if (!data || !data.projects) {
            this.saveData(this.defaultData);
        }
    }
    
    // Get all stored data
    getData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error reading from storage:', error);
            return null;
        }
    }
    
    // Save all data
    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error writing to storage:', error);
            return false;
        }
    }
    
    // Project management (combined beat and melody)
    saveProject(name, beatPattern, melodyPattern, metadata = {}) {
        const data = this.getData() || this.defaultData;
        const timestamp = Date.now();
        
        const projectData = {
            id: this.generateId(),
            name: name,
            beatPattern: beatPattern,
            melodyPattern: melodyPattern,
            created: timestamp,
            modified: timestamp,
            tempo: metadata.tempo || 120,
            playbackMode: metadata.playbackMode || 'both',
            ...metadata
        };
        
        data.projects.push(projectData);
        
        // Add to recent projects (keep last 10)
        this.addToRecentProject(projectData);
        
        return this.saveData(data);
    }
    
    getProjects() {
        const data = this.getData() || this.defaultData;
        return data.projects || [];
    }
    
    getProject(id) {
        const projects = this.getProjects();
        return projects.find(project => project.id === id);
    }
    
    deleteProject(id) {
        const data = this.getData() || this.defaultData;
        data.projects = data.projects.filter(p => p.id !== id);
        data.recentProjects = data.recentProjects.filter(p => p.id !== id);
        return this.saveData(data);
    }
    
    updateProject(id, updates) {
        const data = this.getData() || this.defaultData;
        const projectIndex = data.projects.findIndex(p => p.id === id);
        
        if (projectIndex === -1) return false;
        
        data.projects[projectIndex] = {
            ...data.projects[projectIndex],
            ...updates,
            modified: Date.now()
        };
        
        return this.saveData(data);
    }
    
    // Pattern management (individual patterns)
    savePattern(type, name, pattern, metadata = {}) {
        const data = this.getData() || this.defaultData;
        const timestamp = Date.now();
        
        const patternData = {
            id: this.generateId(),
            name: name,
            pattern: pattern,
            type: type, // 'beat' or 'melody'
            created: timestamp,
            modified: timestamp,
            ...metadata
        };
        
        data.patterns[`${type}s`].push(patternData);
        
        // Add to recent patterns (keep last 10)
        this.addToRecent(type, patternData);
        
        return this.saveData(data);
    }
    
    getPatterns(type = null) {
        const data = this.getData() || this.defaultData;
        
        if (type) {
            return data.patterns[`${type}s`] || [];
        }
        
        return {
            beats: data.patterns.beats || [],
            melodies: data.patterns.melodies || []
        };
    }
    
    getPattern(id) {
        const allPatterns = this.getPatterns();
        const all = [...allPatterns.beats, ...allPatterns.melodies];
        return all.find(pattern => pattern.id === id);
    }
    
    deletePattern(id) {
        const data = this.getData() || this.defaultData;
        
        // Remove from beats
        data.patterns.beats = data.patterns.beats.filter(p => p.id !== id);
        
        // Remove from melodies
        data.patterns.melodies = data.patterns.melodies.filter(p => p.id !== id);
        
        // Remove from recent
        data.recentPatterns.beats = data.recentPatterns.beats.filter(p => p.id !== id);
        data.recentPatterns.melodies = data.recentPatterns.melodies.filter(p => p.id !== id);
        
        return this.saveData(data);
    }
    
    updatePattern(id, updates) {
        const data = this.getData() || this.defaultData;
        const allPatterns = [...data.patterns.beats, ...data.patterns.melodies];
        const patternIndex = allPatterns.findIndex(p => p.id === id);
        
        if (patternIndex === -1) return false;
        
        const pattern = allPatterns[patternIndex];
        const updatedPattern = {
            ...pattern,
            ...updates,
            modified: Date.now()
        };
        
        // Update in the appropriate array
        if (pattern.type === 'beat') {
            const beatIndex = data.patterns.beats.findIndex(p => p.id === id);
            if (beatIndex !== -1) {
                data.patterns.beats[beatIndex] = updatedPattern;
            }
        } else {
            const melodyIndex = data.patterns.melodies.findIndex(p => p.id === id);
            if (melodyIndex !== -1) {
                data.patterns.melodies[melodyIndex] = updatedPattern;
            }
        }
        
        return this.saveData(data);
    }
    
    // Recent projects management
    addToRecentProject(project) {
        const data = this.getData() || this.defaultData;
        
        // Remove if already exists
        data.recentProjects = data.recentProjects.filter(p => p.id !== project.id);
        
        // Add to beginning
        data.recentProjects.unshift({
            id: project.id,
            name: project.name,
            modified: project.modified
        });
        
        // Keep only last 10
        data.recentProjects = data.recentProjects.slice(0, 10);
        
        this.saveData(data);
    }
    
    getRecentProjects() {
        const data = this.getData() || this.defaultData;
        return data.recentProjects || [];
    }
    
    // Recent patterns management
    addToRecent(type, pattern) {
        const data = this.getData() || this.defaultData;
        const recentKey = `${type}s`;
        
        // Remove if already exists
        data.recentPatterns[recentKey] = data.recentPatterns[recentKey].filter(
            p => p.id !== pattern.id
        );
        
        // Add to beginning
        data.recentPatterns[recentKey].unshift({
            id: pattern.id,
            name: pattern.name,
            modified: pattern.modified
        });
        
        // Keep only last 10
        data.recentPatterns[recentKey] = data.recentPatterns[recentKey].slice(0, 10);
        
        this.saveData(data);
    }
    
    getRecentPatterns(type = null) {
        const data = this.getData() || this.defaultData;
        
        if (type) {
            return data.recentPatterns[`${type}s`] || [];
        }
        
        return data.recentPatterns;
    }
    
    // Preferences management
    savePreferences(preferences) {
        const data = this.getData() || this.defaultData;
        data.preferences = { ...data.preferences, ...preferences };
        return this.saveData(data);
    }
    
    getPreferences() {
        const data = this.getData() || this.defaultData;
        return data.preferences || this.defaultData.preferences;
    }
    
    // Export/Import functionality
    exportData() {
        const data = this.getData();
        if (!data) return null;
        
        return {
            version: '1.0',
            exportDate: new Date().toISOString(),
            data: data
        };
    }
    
    importData(exportedData) {
        try {
            if (!exportedData || !exportedData.data) {
                throw new Error('Invalid export data format');
            }
            
            // Merge with existing data, preserving existing IDs
            const currentData = this.getData() || this.defaultData;
            const importedData = exportedData.data;
            
            const mergedData = {
                projects: [...currentData.projects, ...(importedData.projects || [])],
                patterns: {
                    beats: [...currentData.patterns.beats, ...(importedData.patterns?.beats || [])],
                    melodies: [...currentData.patterns.melodies, ...(importedData.patterns?.melodies || [])]
                },
                preferences: { ...currentData.preferences, ...(importedData.preferences || {}) },
                recentPatterns: importedData.recentPatterns || currentData.recentPatterns,
                recentProjects: [...currentData.recentProjects, ...(importedData.recentProjects || [])]
            };
            
            return this.saveData(mergedData);
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
    
    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    clearAllData() {
        try {
            localStorage.removeItem(this.storageKey);
            this.init();
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }
    
    getStorageSize() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? new Blob([data]).size : 0;
        } catch (error) {
            console.error('Error calculating storage size:', error);
            return 0;
        }
    }
    
    // Search functionality
    searchPatterns(query, type = null) {
        const patterns = this.getPatterns(type);
        const allPatterns = type ? patterns : [...patterns.beats, ...patterns.melodies];
        
        if (!query) return allPatterns;
        
        const lowerQuery = query.toLowerCase();
        return allPatterns.filter(pattern => 
            pattern.name.toLowerCase().includes(lowerQuery) ||
            (pattern.description && pattern.description.toLowerCase().includes(lowerQuery)) ||
            (pattern.tags && pattern.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
        );
    }
    
    // Pattern validation
    validatePattern(pattern, type) {
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
            return false;
        }
        
        // Validate BPM if present - this should happen even if patternItems is empty
        if (bpm !== null && bpm !== undefined) {
            if (typeof bpm !== 'number' || bpm <= 0 || bpm > 300) {
                console.error('Invalid BPM:', bpm);
                return false;
            }
        }
        
        if (type === 'beat') {
            return patternItems.every((item, index) => {
                console.log(`Validating beat item ${index}:`, item);
                
                const isObject = typeof item === 'object';
                const hasBeatOrBeats = typeof item.beat === 'string' || Array.isArray(item.beats);
                const hasDur = item.hasOwnProperty('dur') ? typeof item.dur === 'number' : true; // Allow missing dur (defaults to 1) or explicit 0
                
                // For chord items, vol is optional (uses individual beat volumes)
                // For single items, vol is optional (defaults to 1.0)
                let hasVol = true;
                if (item.beats) {
                    // Chord item - check if inner beats have vol
                    // If any beat has vol, consider it valid (some chords may not specify individual volumes)
                    const hasAnyVol = item.beats.some(beat => 
                        beat.hasOwnProperty('vol') && (typeof beat.vol === 'number' || Array.isArray(beat.vol))
                    );
                    hasVol = hasAnyVol || item.beats.every(beat => 
                        !beat.hasOwnProperty('vol') || (typeof beat.vol === 'number' || Array.isArray(beat.vol))
                    );
                } else if (item.beat === 'rest') {
                    // Rest items don't need volume
                    hasVol = true;
                } else {
                    // Single item - vol is optional, but if present must be valid
                    hasVol = !item.hasOwnProperty('vol') || 
                             (typeof item.vol === 'number' || Array.isArray(item.vol));
                }
                
                console.log(`Beat item ${index} validation checks:`, {
                    isObject,
                    hasBeatOrBeats,
                    hasDur,
                    hasVol,
                    beatType: typeof item.beat,
                    beatsType: typeof item.beats,
                    durType: typeof item.dur,
                    volType: typeof item.vol,
                    isChord: !!item.notes,
                    isRest: item.note === 'rest'
                });

                const isValid = isObject && hasBeatOrBeats && hasDur && hasVol;
                
                if (!isValid) {
                    console.log(`Melody validation FAILED at index ${index}:`, item);
                } else {
                    console.log(`Melody validation PASSED at index ${index}`);
                }
                return isValid;
            });
        } else if (type === 'melody') {
            return patternItems.every((item, index) => {
                console.log(`Validating melody item ${index}:`, item);
                
                const isObject = typeof item === 'object';
                const hasNoteOrNotes = typeof item.note === 'string' || Array.isArray(item.notes) || typeof item.freq === 'number';
                const hasDur = item.hasOwnProperty('dur') ? typeof item.dur === 'number' : true; // Allow missing dur (defaults to 1) or explicit 0
                
                // For chord items, vol is optional (uses individual note volumes)
                // For single items, vol is optional (defaults to 1.0)
                let hasVol = true;
                if (item.notes) {
                    // Chord item - check if inner notes have vol
                    const hasAnyVol = item.notes.some(note => 
                        note.hasOwnProperty('vol') && (typeof note.vol === 'number' || Array.isArray(note.vol))
                    );
                    hasVol = hasAnyVol || item.notes.every(note => 
                        !note.hasOwnProperty('vol') || (typeof note.vol === 'number' || Array.isArray(note.vol))
                    );
                } else if (item.note === 'rest') {
                    // Rest items don't need volume
                    hasVol = true;
                } else {
                    // Single item - vol is optional, but if present must be valid
                    hasVol = !item.hasOwnProperty('vol') || 
                             (typeof item.vol === 'number' || Array.isArray(item.vol));
                }
                
                console.log(`Melody item ${index} validation checks:`, {
                    isObject,
                    hasNoteOrNotes,
                    hasDur,
                    hasVol,
                    noteType: typeof item.note,
                    notesType: typeof item.notes,
                    durType: typeof item.dur,
                    volType: typeof item.vol,
                    isChord: !!item.notes,
                    isRest: item.note === 'rest'
                });

                const isValid = isObject && hasNoteOrNotes && hasDur && hasVol;
                
                if (!isValid) {
                    console.log(`Melody validation FAILED at index ${index}:`, item);
                } else {
                    console.log(`Melody validation PASSED at index ${index}`);
                }
                return isValid;
            });
        }
        
        return false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageModule;
}