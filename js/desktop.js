// Desktop functionality for Windows 95 Simulator

class Desktop {
    constructor() {
        this.selectedIcons = new Set();
        this.isSelecting = false;
        this.startX = 0;
        this.startY = 0;
        this.selectionRect = document.getElementById('selection-rect');
        this.desktop = document.getElementById('desktop');
        this.lastClickTime = 0;
        this.lastClickedIcon = null;
        
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
        const currentTime = Date.now();
        
        // Check for double-click
        if (this.lastClickedIcon === icon && currentTime - this.lastClickTime < 300) {
            this.handleIconDoubleClick(e);
            return;
        }
        
        this.lastClickTime = currentTime;
        this.lastClickedIcon = icon;
        
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
        this.showNotification('Opening My Computer...');
        console.log('My Computer opened');
        // Future implementation: Open My Computer window
    }
    
    openRecycleBin() {
        this.showNotification('Opening Recycle Bin...');
        console.log('Recycle Bin opened');
        // Future implementation: Open Recycle Bin window
    }
    
    openMyDocuments() {
        this.showNotification('Opening My Documents...');
        console.log('My Documents opened');
        // Future implementation: Open My Documents window
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
