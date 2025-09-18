class SettingsManager {
    constructor() {
        this.currentMode = 'merge'; // Default mode
        this.componentOrder = ['partner', 'date', 'reference', 'invoice'];
        this.separator = ' - ';
        this.slashReplacement = '_';
        this.enabledComponents = {
            partner: true,
            date: true,
            reference: true,
            invoice: true
        };

        this.initializeElements();
        this.loadSettings();
        this.bindEvents();
        this.updatePreview();
        this.updateDragContainer();
    }

    initializeElements() {
        // Mode radio buttons
        this.modeRename = DOMUtils.getElementById('modeRename');
        this.modeMerge = DOMUtils.getElementById('modeMerge');

        // Format section
        this.filenameFormatSection = DOMUtils.getElementById('filenameFormatSection');
        this.dragContainer = DOMUtils.getElementById('dragContainer');

        // Settings dropdowns
        this.separatorSelect = DOMUtils.getElementById('separatorSelect');
        this.slashReplacementSelect = DOMUtils.getElementById('slashReplacementSelect');

        // Component checkboxes
        this.enablePartner = DOMUtils.getElementById('enablePartner');
        this.enableDate = DOMUtils.getElementById('enableDate');
        this.enableReference = DOMUtils.getElementById('enableReference');
        this.enableInvoice = DOMUtils.getElementById('enableInvoice');

        // Preview
        this.filenamePreview = DOMUtils.getElementById('filenamePreview');

        console.log('🔧 Settings Manager Elements:', {
            modeRename: this.modeRename,
            modeMerge: this.modeMerge,
            filenameFormatSection: this.filenameFormatSection,
            dragContainer: this.dragContainer
        });
    }

    bindEvents() {
        // Mode selection events
        if (this.modeRename) {
            this.modeRename.addEventListener('change', () => {
                if (this.modeRename.checked) {
                    this.currentMode = 'rename';
                    this.showFilenameFormat();
                    this.saveSettings();
                }
            });
        }

        if (this.modeMerge) {
            this.modeMerge.addEventListener('change', () => {
                if (this.modeMerge.checked) {
                    this.currentMode = 'merge';
                    this.hideFilenameFormat();
                    this.saveSettings();
                }
            });
        }

        // Settings dropdown events
        if (this.separatorSelect) {
            this.separatorSelect.addEventListener('change', (e) => {
                this.separator = e.target.value || ' - ';
                this.saveSettings();
                this.updatePreview();
            });
        }

        if (this.slashReplacementSelect) {
            this.slashReplacementSelect.addEventListener('change', (e) => {
                this.slashReplacement = e.target.value || '_';
                this.saveSettings();
                this.updatePreview();
            });
        }

        // Component checkbox events
        this.bindCheckboxEvents();

        // Initialize drag and drop
        this.initializeDragAndDrop();
    }

    showFilenameFormat() {
        if (this.filenameFormatSection) {
            this.filenameFormatSection.style.display = 'block';
            console.log('📋 Showing filename format section');
        }
    }

    hideFilenameFormat() {
        if (this.filenameFormatSection) {
            this.filenameFormatSection.style.display = 'none';
            console.log('📋 Hiding filename format section');
        }
    }

    initializeDragAndDrop() {
        if (!this.dragContainer) return;

        // Add drag event listeners to all drag items
        const dragItems = this.dragContainer.querySelectorAll('.drag-item');

        dragItems.forEach(item => {
            item.draggable = true;

            item.addEventListener('dragstart', (e) => {
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', item.outerHTML);
                e.dataTransfer.setData('text/plain', item.dataset.component);
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
        });

        // Add drop zone listeners
        this.dragContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            const draggingItem = this.dragContainer.querySelector('.dragging');
            const afterElement = this.getDragAfterElement(this.dragContainer, e.clientY);

            if (afterElement == null) {
                this.dragContainer.appendChild(draggingItem);
            } else {
                this.dragContainer.insertBefore(draggingItem, afterElement);
            }
        });

        this.dragContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            this.updateComponentOrder();
            this.saveSettings();
            this.updatePreview();
        });

        console.log('🔄 Drag and drop initialized for', dragItems.length, 'items');
    }

    bindCheckboxEvents() {
        const checkboxes = [
            { element: this.enablePartner, component: 'partner' },
            { element: this.enableDate, component: 'date' },
            { element: this.enableReference, component: 'reference' },
            { element: this.enableInvoice, component: 'invoice' }
        ];

        checkboxes.forEach(({ element, component }) => {
            if (element) {
                element.addEventListener('change', (e) => {
                    this.enabledComponents[component] = e.target.checked;
                    this.updateDragContainer();
                    this.saveSettings();
                    this.updatePreview();
                    console.log(`🔲 Component ${component} enabled:`, e.target.checked);
                });
            }
        });
    }

    updateDragContainer() {
        if (!this.dragContainer) return;

        const allItems = this.dragContainer.querySelectorAll('.drag-item');

        allItems.forEach(item => {
            const component = item.dataset.component;
            if (this.enabledComponents[component]) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });

        console.log('🔄 Drag container updated. Enabled components:', this.enabledComponents);
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.drag-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    updateComponentOrder() {
        const dragItems = this.dragContainer.querySelectorAll('.drag-item');
        this.componentOrder = Array.from(dragItems).map(item => item.dataset.component);
        console.log('📋 Component order updated:', this.componentOrder);
    }

    updatePreview() {
        if (!this.filenamePreview) return;

        const sampleData = {
            partner: 'PT ABC',
            date: '09-10-2025',
            reference: 'INV251111',
            invoice: '04002500141214002'
        };

        // Clean reference (replace slash)
        const cleanReference = sampleData.reference.replace(/\//g, this.slashReplacement);
        sampleData.reference = cleanReference;

        // Build filename based on enabled components only
        const enabledOrderedComponents = this.componentOrder.filter(component =>
            this.enabledComponents[component]
        );
        const components = enabledOrderedComponents.map(component => sampleData[component]);
        const filename = components.join(this.separator) + '.pdf';

        this.filenamePreview.textContent = filename;
        console.log('👁️ Preview updated:', filename);
    }

    saveSettings() {
        const settings = {
            mode: this.currentMode,
            componentOrder: this.componentOrder,
            separator: this.separator,
            slashReplacement: this.slashReplacement,
            enabledComponents: this.enabledComponents
        };

        try {
            localStorage.setItem('renamerged-settings', JSON.stringify(settings));
            console.log('💾 Settings saved to localStorage:', settings);
        } catch (error) {
            console.error('❌ Failed to save settings:', error);
        }
    }

    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('renamerged-settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);

                // Apply saved settings
                this.currentMode = settings.mode || 'merge';
                this.componentOrder = settings.componentOrder || ['partner', 'date', 'reference', 'invoice'];
                this.separator = settings.separator || ' - ';
                this.slashReplacement = settings.slashReplacement || '_';
                this.enabledComponents = settings.enabledComponents || {
                    partner: true,
                    date: true,
                    reference: true,
                    invoice: true
                };

                // Update UI elements
                this.applySettingsToUI();

                console.log('📂 Settings loaded from localStorage:', settings);
            }
        } catch (error) {
            console.error('❌ Failed to load settings:', error);
        }
    }

    applySettingsToUI() {
        // Apply mode selection
        if (this.modeRename && this.modeMerge) {
            if (this.currentMode === 'rename') {
                this.modeRename.checked = true;
                this.showFilenameFormat();
            } else {
                this.modeMerge.checked = true;
                this.hideFilenameFormat();
            }
        }

        // Apply separator selection
        if (this.separatorSelect) {
            this.separatorSelect.value = this.separator;
        }

        // Apply slash replacement selection
        if (this.slashReplacementSelect) {
            this.slashReplacementSelect.value = this.slashReplacement;
        }

        // Apply checkbox states
        if (this.enablePartner) this.enablePartner.checked = this.enabledComponents.partner;
        if (this.enableDate) this.enableDate.checked = this.enabledComponents.date;
        if (this.enableReference) this.enableReference.checked = this.enabledComponents.reference;
        if (this.enableInvoice) this.enableInvoice.checked = this.enabledComponents.invoice;

        // Reorder drag items according to saved component order
        this.reorderDragItems();

        console.log('🎛️ UI updated with saved settings');
    }

    reorderDragItems() {
        if (!this.dragContainer) return;

        // Get all drag items
        const allDragItems = Array.from(this.dragContainer.querySelectorAll('.drag-item'));
        const dragItemsMap = {};

        // Create a map of component -> element
        allDragItems.forEach(item => {
            const component = item.dataset.component;
            dragItemsMap[component] = item;
        });

        // Clear container
        this.dragContainer.innerHTML = '';

        // Add items back in the saved order
        this.componentOrder.forEach(component => {
            if (dragItemsMap[component]) {
                this.dragContainer.appendChild(dragItemsMap[component]);
            }
        });

        // Re-initialize drag and drop events after reordering
        this.initializeDragAndDrop();

        console.log('🔄 Drag items reordered according to saved settings:', this.componentOrder);
    }

    // Public method to get current settings
    getSettings() {
        // Filter component order to only include enabled components
        const enabledOrderedComponents = this.componentOrder.filter(component =>
            this.enabledComponents[component]
        );

        return {
            mode: this.currentMode,
            componentOrder: enabledOrderedComponents,
            separator: this.separator,
            slashReplacement: this.slashReplacement,
            enabledComponents: this.enabledComponents
        };
    }

    // Public method to check if rename mode is selected
    isRenameMode() {
        return this.currentMode === 'rename';
    }
}

window.SettingsManager = SettingsManager;