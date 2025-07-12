// Desktop functionality for Windows 95 Simulator

class Desktop {
    constructor() {
        this.selectedIcons = new Set();
        this.isSelecting = false;
        this.startX = 0;
        this.startY = 0;
        this.selectionRect = document.getElementById('selection-rect');
        this.desktop = document.getElementById('desktop');
        
        // Window management
        this.windows = new Map();
        this.activeWindow = null;
        this.nextWindowId = 1;
        this.taskbarWindows = document.getElementById('taskbar-windows');
        
        this.init();
    }
    
    init() {
        this.attachEventListeners();
        this.setupKeyboardNavigation();
    }
    
    attachEventListeners() {
        // Desktop click events
        this.desktop.addEventListener('mousedown', this.handleDesktopMouseDown.bind(this));
        this.desktop.addEventListener('mousemove', this.handleDesktopMouseMove.bind(this));
        this.desktop.addEventListener('mouseup', this.handleDesktopMouseUp.bind(this));
        
        // Icon click events
        const icons = document.querySelectorAll('.desktop-icon');
        icons.forEach(icon => {
            icon.addEventListener('click', this.handleIconClick.bind(this));
            icon.addEventListener('dblclick', this.handleIconDoubleClick.bind(this));
        });
        
        // Prevent context menu on desktop
        this.desktop.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Clear selection when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.desktop-icon') && !e.target.closest('.desktop')) {
                this.clearSelection();
            }
        });
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' && this.selectedIcons.size > 0) {
                this.handleDeleteKey();
            } else if (e.key === 'Enter' && this.selectedIcons.size === 1) {
                this.handleEnterKey();
            }
        });
    }
    
    handleDesktopMouseDown(e) {
        if (e.target === this.desktop) {
            this.isSelecting = true;
            this.startX = e.clientX;
            this.startY = e.clientY;
            
            this.selectionRect.style.left = e.clientX + 'px';
            this.selectionRect.style.top = e.clientY + 'px';
            this.selectionRect.style.width = '0px';
            this.selectionRect.style.height = '0px';
            this.selectionRect.style.display = 'block';
            
            this.clearSelection();
        }
    }
    
    handleDesktopMouseMove(e) {
        if (this.isSelecting) {
            const currentX = e.clientX;
            const currentY = e.clientY;
            
            const left = Math.min(this.startX, currentX);
            const top = Math.min(this.startY, currentY);
            const width = Math.abs(currentX - this.startX);
            const height = Math.abs(currentY - this.startY);
            
            this.selectionRect.style.left = left + 'px';
            this.selectionRect.style.top = top + 'px';
            this.selectionRect.style.width = width + 'px';
            this.selectionRect.style.height = height + 'px';
            
            this.updateIconSelection(left, top, width, height);
        }
    }
    
    handleDesktopMouseUp(e) {
        if (this.isSelecting) {
            this.isSelecting = false;
            this.selectionRect.style.display = 'none';
        }
    }
    
    updateIconSelection(left, top, width, height) {
        const icons = document.querySelectorAll('.desktop-icon');
        const selectionRect = {
            left: left,
            top: top,
            right: left + width,
            bottom: top + height
        };
        
        icons.forEach(icon => {
            const iconRect = icon.getBoundingClientRect();
            const iconBounds = {
                left: iconRect.left,
                top: iconRect.top,
                right: iconRect.right,
                bottom: iconRect.bottom
            };
            
            // Check if icon intersects with selection rectangle
            if (this.rectanglesIntersect(selectionRect, iconBounds)) {
                this.selectIcon(icon);
            } else {
                this.deselectIcon(icon);
            }
        });
    }
    
    rectanglesIntersect(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }
    
    handleIconClick(e) {
        e.stopPropagation();
        const icon = e.currentTarget;
        
        // Handle selection
        if (e.ctrlKey) {
            this.toggleIconSelection(icon);
        } else {
            this.clearSelection();
            this.selectIcon(icon);
        }
    }
    
    handleIconDoubleClick(e) {
        e.stopPropagation();
        const icon = e.currentTarget;
        const iconType = icon.dataset.icon;
        
        // Add animation
        icon.classList.add('double-clicked');
        setTimeout(() => {
            icon.classList.remove('double-clicked');
        }, 300);
        
        // Handle different icon types
        switch (iconType) {
            case 'my-computer':
                this.openMyComputer();
                break;
            case 'recycle-bin':
                this.openRecycleBin();
                break;
            case 'my-documents':
                this.openMyDocuments();
                break;
            default:
                console.log('Unknown icon type:', iconType);
        }
    }
    
    selectIcon(icon) {
        icon.classList.add('selected');
        this.selectedIcons.add(icon);
        icon.focus();
    }
    
    deselectIcon(icon) {
        icon.classList.remove('selected');
        this.selectedIcons.delete(icon);
    }
    
    toggleIconSelection(icon) {
        if (this.selectedIcons.has(icon)) {
            this.deselectIcon(icon);
        } else {
            this.selectIcon(icon);
        }
    }
    
    clearSelection() {
        this.selectedIcons.forEach(icon => {
            this.deselectIcon(icon);
        });
        this.selectedIcons.clear();
    }
    
    handleDeleteKey() {
        const selectedIconsArray = Array.from(this.selectedIcons);
        const iconNames = selectedIconsArray.map(icon => 
            icon.querySelector('.icon-label').textContent
        );
        
        if (confirm(`Are you sure you want to delete ${iconNames.join(', ')}?`)) {
            console.log('Deleting icons:', iconNames);
            // In a real implementation, this would move items to recycle bin
            this.showNotification('Items moved to Recycle Bin');
        }
    }
    
    handleEnterKey() {
        const selectedIcon = Array.from(this.selectedIcons)[0];
        if (selectedIcon) {
            this.handleIconDoubleClick({ currentTarget: selectedIcon, stopPropagation: () => {} });
        }
    }
    
    openMyComputer() {
        this.createWindow('my-computer', 'My Computer', 'assets/icons/my-computer.svg', this.getMyComputerContent());
    }
    
    openRecycleBin() {
        this.createWindow('recycle-bin', 'Recycle Bin', 'assets/icons/recycle-bin.svg', this.getRecycleBinContent());
    }
    
    openMyDocuments() {
        this.createWindow('my-documents', 'My Documents', 'assets/icons/my-documents.svg', this.getMyDocumentsContent());
    }
    
    createWindow(type, title, icon, content) {
        const windowId = `window-${this.nextWindowId++}`;
        
        // Create window element
        const windowElement = document.createElement('div');
        windowElement.className = 'window visible';
        windowElement.id = windowId;
        windowElement.style.left = `${50 + (this.windows.size * 30)}px`;
        windowElement.style.top = `${50 + (this.windows.size * 30)}px`;
        windowElement.style.width = '400px';
        windowElement.style.height = '300px';
        
        windowElement.innerHTML = `
            <div class="window-title-bar">
                <img src="${icon}" alt="${title}" class="window-icon">
                <span class="window-title">${title}</span>
                <div class="window-controls">
                    <div class="window-control-button minimize-btn" title="Minimize">_</div>
                    <div class="window-control-button maximize-btn" title="Maximize">□</div>
                    <div class="window-control-button close-btn" title="Close">×</div>
                </div>
            </div>
            <div class="window-content">
                ${content}
            </div>
        `;
        
        this.desktop.appendChild(windowElement);
        
        // Create taskbar button
        const taskbarButton = document.createElement('div');
        taskbarButton.className = 'taskbar-window-button';
        taskbarButton.innerHTML = `
            <img src="${icon}" alt="${title}">
            <span class="window-title">${title}</span>
        `;
        
        this.taskbarWindows.appendChild(taskbarButton);
        
        // Store window data
        const windowData = {
            id: windowId,
            type: type,
            title: title,
            icon: icon,
            element: windowElement,
            taskbarButton: taskbarButton,
            isMinimized: false,
            isMaximized: false
        };
        
        this.windows.set(windowId, windowData);
        
        // Set up event listeners
        this.setupWindowEventListeners(windowData);
        
        // Make this window active
        this.setActiveWindow(windowId);
        
        return windowId;
    }
    
    setupWindowEventListeners(windowData) {
        const { element, taskbarButton, id } = windowData;
        
        // Title bar click to activate window
        const titleBar = element.querySelector('.window-title-bar');
        titleBar.addEventListener('mousedown', (e) => {
            if (e.target === titleBar || e.target.classList.contains('window-title') || e.target.classList.contains('window-icon')) {
                this.setActiveWindow(id);
                this.setupWindowDrag(e, element);
            }
        });
        
        // Window control buttons
        element.querySelector('.minimize-btn').addEventListener('click', () => {
            this.minimizeWindow(id);
        });
        
        element.querySelector('.maximize-btn').addEventListener('click', () => {
            this.toggleMaximizeWindow(id);
        });
        
        element.querySelector('.close-btn').addEventListener('click', () => {
            this.closeWindow(id);
        });
        
        // Taskbar button click
        taskbarButton.addEventListener('click', () => {
            this.toggleWindow(id);
        });
        
        // Window content click to activate
        element.addEventListener('mousedown', () => {
            this.setActiveWindow(id);
        });
    }
    
    setupWindowDrag(e, windowElement) {
        const startX = e.clientX;
        const startY = e.clientY;
        const startLeft = parseInt(windowElement.style.left) || 0;
        const startTop = parseInt(windowElement.style.top) || 0;
        
        const handleMouseMove = (e) => {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            windowElement.style.left = `${startLeft + deltaX}px`;
            windowElement.style.top = `${Math.max(0, startTop + deltaY)}px`;
        };
        
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
    
    setActiveWindow(windowId) {
        // Deactivate all windows
        this.windows.forEach((windowData, id) => {
            windowData.element.classList.remove('active');
            windowData.taskbarButton.classList.remove('active');
            windowData.element.querySelector('.window-title-bar').classList.add('inactive');
        });
        
        // Activate the selected window
        const windowData = this.windows.get(windowId);
        if (windowData && !windowData.isMinimized) {
            windowData.element.classList.add('active');
            windowData.taskbarButton.classList.add('active');
            windowData.element.querySelector('.window-title-bar').classList.remove('inactive');
            this.activeWindow = windowId;
        }
    }
    
    minimizeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (windowData) {
            windowData.element.style.display = 'none';
            windowData.isMinimized = true;
            windowData.taskbarButton.classList.remove('active');
            
            if (this.activeWindow === windowId) {
                this.activeWindow = null;
            }
        }
    }
    
    toggleMaximizeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (windowData) {
            if (windowData.isMaximized) {
                // Restore window
                windowData.element.style.left = windowData.restoreLeft || '100px';
                windowData.element.style.top = windowData.restoreTop || '100px';
                windowData.element.style.width = windowData.restoreWidth || '400px';
                windowData.element.style.height = windowData.restoreHeight || '300px';
                windowData.isMaximized = false;
            } else {
                // Maximize window
                windowData.restoreLeft = windowData.element.style.left;
                windowData.restoreTop = windowData.element.style.top;
                windowData.restoreWidth = windowData.element.style.width;
                windowData.restoreHeight = windowData.element.style.height;
                
                windowData.element.style.left = '0px';
                windowData.element.style.top = '0px';
                windowData.element.style.width = '100vw';
                windowData.element.style.height = 'calc(100vh - 30px)';
                windowData.isMaximized = true;
            }
        }
    }
    
    toggleWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (windowData) {
            if (windowData.isMinimized) {
                // Restore window
                windowData.element.style.display = 'block';
                windowData.isMinimized = false;
                this.setActiveWindow(windowId);
            } else if (this.activeWindow === windowId) {
                // Minimize if it's the active window
                this.minimizeWindow(windowId);
            } else {
                // Activate window
                this.setActiveWindow(windowId);
            }
        }
    }
    
    closeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (windowData) {
            windowData.element.remove();
            windowData.taskbarButton.remove();
            this.windows.delete(windowId);
            
            if (this.activeWindow === windowId) {
                this.activeWindow = null;
            }
        }
    }
    
    getMyComputerContent() {
        return `
            <h2>My Computer</h2>
            <p>This is a Windows 95 style My Computer window.</p>
            <p>Here you would typically see:</p>
            <p>• Local disk drives (C:, D:, etc.)</p>
            <p>• Floppy disk drives (A:, B:)</p>
            <p>• CD-ROM drives</p>
            <p>• Network drives</p>
            <p>• Control Panel</p>
            <p>• Printers folder</p>
        `;
    }
    
    getRecycleBinContent() {
        return `
            <h2>Recycle Bin</h2>
            <p>The Recycle Bin is currently empty.</p>
            <p>When you delete files or folders, they are moved to the Recycle Bin where they can be restored or permanently deleted.</p>
            <p>To restore an item, select it and click Restore.</p>
            <p>To permanently delete all items, click Empty Recycle Bin.</p>
        `;
    }
    
    getMyDocumentsContent() {
        return `
            <h2>My Documents</h2>
            <p>This is your personal document folder.</p>
            <p>You can store and organize your files here:</p>
            <p>• Text documents</p>
            <p>• Spreadsheets</p>
            <p>• Presentations</p>
            <p>• Images and graphics</p>
            <p>• Other personal files</p>
            <p>This folder is private to your user account.</p>
        `;
    }
    
    showNotification(message) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ffffe1;
            border: 1px solid #000000;
            padding: 8px 12px;
            font-size: 11px;
            z-index: 10000;
            box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize desktop when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Desktop();
});
