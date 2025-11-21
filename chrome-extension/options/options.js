/**
 * Options Page Script
 * Handles saving and loading user preferences
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const spellCheck = document.getElementById('spellCheck');
    const grammarCheck = document.getElementById('grammarCheck');
    const autoCheck = document.getElementById('autoCheck');
    const theme = document.getElementById('theme');
    const saveBtn = document.getElementById('saveBtn');
    const saveMessage = document.getElementById('saveMessage');

    // Load saved settings
    loadSettings();

    // Save button click handler
    saveBtn.addEventListener('click', saveSettings);

    /**
     * Load settings from Chrome storage
     */
    function loadSettings() {
        chrome.storage.sync.get({
            spellCheck: true,
            grammarCheck: true,
            autoCheck: true,
            theme: 'light'
        }, (settings) => {
            spellCheck.checked = settings.spellCheck;
            grammarCheck.checked = settings.grammarCheck;
            autoCheck.checked = settings.autoCheck;
            theme.value = settings.theme;
        });
    }

    /**
     * Save settings to Chrome storage
     */
    function saveSettings() {
        const settings = {
            spellCheck: spellCheck.checked,
            grammarCheck: grammarCheck.checked,
            autoCheck: autoCheck.checked,
            theme: theme.value
        };

        chrome.storage.sync.set(settings, () => {
            // Show save confirmation
            saveMessage.classList.add('show');
            saveBtn.textContent = '✓ Saved!';
            saveBtn.style.background = '#28a745';

            // Reset button after 2 seconds
            setTimeout(() => {
                saveMessage.classList.remove('show');
                saveBtn.textContent = '💾 Save Settings';
                saveBtn.style.background = '';
            }, 2000);

            console.log('Settings saved:', settings);
        });
    }

    // Auto-save on toggle changes (optional)
    [spellCheck, grammarCheck, autoCheck, theme].forEach(element => {
        element.addEventListener('change', () => {
            // Optional: uncomment to enable auto-save
            // saveSettings();
        });
    });
});
