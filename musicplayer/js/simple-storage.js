// Simple Storage Module - Basic localStorage implementation
class SimpleStorage {
    constructor() {
        this.storageKey = 'musicPlayerData';
        this.isSupported = this.checkSupport();
    }
    
    checkSupport() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    saveProject(name, beatPattern, melodyPattern, metadata = {}) {
        if (!this.isSupported) {
            console.warn('localStorage not supported');
            return false;
        }
        
        try {
            const data = this.loadData();
            const project = {
                name,
                beatPattern,
                melodyPattern,
                metadata: {
                    ...metadata,
                    created: Date.now(),
                    modified: Date.now()
                }
            };
            
            data.projects[name] = project;
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Save failed:', error);
            return false;
        }
    }
    
    loadProject(name) {
        if (!this.isSupported) return null;
        
        try {
            const data = this.loadData();
            return data.projects[name] || null;
        } catch (error) {
            console.error('Load failed:', error);
            return null;
        }
    }
    
    deleteProject(name) {
        if (!this.isSupported) return false;
        
        try {
            const data = this.loadData();
            delete data.projects[name];
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Delete failed:', error);
            return false;
        }
    }
    
    getAllProjects() {
        if (!this.isSupported) return [];
        
        try {
            const data = this.loadData();
            return Object.entries(data.projects).map(([name, project]) => ({
                name,
                ...project
            }));
        } catch (error) {
            console.error('Get all projects failed:', error);
            return [];
        }
    }
    
    loadData() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : { projects: {} };
    }
    
    exportData() {
        if (!this.isSupported) return null;
        
        try {
            return JSON.stringify(this.loadData(), null, 2);
        } catch (error) {
            console.error('Export failed:', error);
            return null;
        }
    }
    
    importData(jsonData) {
        if (!this.isSupported) return false;
        
        try {
            const data = JSON.parse(jsonData);
            if (data.projects && typeof data.projects === 'object') {
                localStorage.setItem(this.storageKey, JSON.stringify(data));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    }
    
    clearAll() {
        if (!this.isSupported) return false;
        
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Clear failed:', error);
            return false;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleStorage;
}