// Clock functionality for Windows 95 Simulator

class TaskbarClock {
    constructor() {
        this.clockElement = document.getElementById('clock');
        this.init();
    }
    
    init() {
        this.updateClock();
        this.startClock();
    }
    
    updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        
        if (this.clockElement) {
            this.clockElement.textContent = timeString;
        }
    }
    
    startClock() {
        // Update every second
        setInterval(() => {
            this.updateClock();
        }, 1000);
    }
}

// Initialize clock when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TaskbarClock();
});
