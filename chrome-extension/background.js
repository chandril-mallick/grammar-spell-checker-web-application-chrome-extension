/**
 * Background Service Worker for Grammar & Spell Checker Extension
 * Handles context menus, keyboard shortcuts, and message passing
 */

// Create context menu on installation
chrome.runtime.onInstalled.addListener(() => {
    // Create context menu for selected text
    chrome.contextMenus.create({
        id: 'check-grammar-selection',
        title: 'Check Grammar & Spelling',
        contexts: ['selection', 'editable']
    });

    console.log('✓ Grammar & Spell Checker extension installed');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'check-grammar-selection') {
        // Send message to content script to check the selected text
        chrome.tabs.sendMessage(tab.id, {
            action: 'checkGrammar',
            text: info.selectionText || ''
        });
    }
});

// Handle keyboard shortcut commands
chrome.commands.onCommand.addListener((command) => {
    if (command === 'check-grammar') {
        // Get active tab and send message to content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'checkGrammarFocused'
                });
            }
        });
    }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSettings') {
        // Return user settings from storage
        chrome.storage.sync.get({
            spellCheck: true,
            grammarCheck: true,
            autoCheck: true,
            theme: 'light'
        }, (settings) => {
            sendResponse(settings);
        });
        return true; // Keep channel open for async response
    }

    if (request.action === 'saveSettings') {
        // Save settings to storage
        chrome.storage.sync.set(request.settings, () => {
            sendResponse({ success: true });
        });
        return true;
    }
});

console.log('✓ Background service worker loaded');
