/**
 * Content Script - Injected into all web pages
 * Detects text inputs and provides inline grammar checking
 */

(function () {
    'use strict';

    let currentInput = null;
    let checkButton = null;
    let correctionPanel = null;
    let settings = { spellCheck: true, grammarCheck: true, autoCheck: true };
    let debounceTimer = null;
    let errorIndicator = null;

    // Load settings from storage
    chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
        if (response) {
            settings = response;
        }
    });

    /**
     * Create the floating check button
     */
    function createCheckButton() {
        if (checkButton) return checkButton;

        checkButton = document.createElement('button');
        checkButton.className = 'grammar-check-btn';
        checkButton.innerHTML = '✓ Check';
        checkButton.style.display = 'none';

        checkButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (currentInput) {
                checkText(currentInput);
            }
        });

        document.body.appendChild(checkButton);
        return checkButton;
    }

    /**
     * Create the correction panel
     */
    function createCorrectionPanel() {
        if (correctionPanel) return correctionPanel;

        correctionPanel = document.createElement('div');
        correctionPanel.className = 'grammar-correction-panel';
        correctionPanel.style.display = 'none';
        correctionPanel.innerHTML = `
      <div class="grammar-panel-header">
        <h4>Grammar & Spell Check</h4>
        <button class="grammar-panel-close">×</button>
      </div>
      <div class="grammar-panel-content">
        <div class="grammar-result-section">
          <h5>Original</h5>
          <div class="grammar-result-original"></div>
        </div>
        <div class="grammar-result-section">
          <h5>Corrected</h5>
          <div class="grammar-result-corrected"></div>
        </div>
        <div class="grammar-result-section">
          <h5>Changes</h5>
          <div class="grammar-result-diff"></div>
        </div>
      </div>
      <div class="grammar-panel-footer">
        <button class="grammar-panel-apply">Apply Corrections</button>
        <button class="grammar-panel-cancel">Cancel</button>
      </div>
    `;

        document.body.appendChild(correctionPanel);

        // Event listeners
        correctionPanel.querySelector('.grammar-panel-close').addEventListener('click', hideCorrectionPanel);
        correctionPanel.querySelector('.grammar-panel-cancel').addEventListener('click', hideCorrectionPanel);
        correctionPanel.querySelector('.grammar-panel-apply').addEventListener('click', applyCorrectionPanel);

        return correctionPanel;
    }

    /**
     * Position the check button near the input field
     */
    function positionCheckButton(input) {
        if (!checkButton) return;

        const rect = input.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        checkButton.style.position = 'absolute';
        checkButton.style.left = `${rect.right + scrollLeft - 80}px`;
        checkButton.style.top = `${rect.top + scrollTop + 5}px`;
        checkButton.style.display = 'block';
    }

    /**
     * Check if element is a text input
     */
    function isTextInput(element) {
        if (!element) return false;

        const tagName = element.tagName.toLowerCase();

        // Check for textarea
        if (tagName === 'textarea') return true;

        // Check for text input
        if (tagName === 'input' && element.type === 'text') return true;

        // Check for contenteditable
        if (element.contentEditable === 'true') return true;

        return false;
    }

    /**
     * Get text from input element
     */
    function getInputText(element) {
        if (element.tagName.toLowerCase() === 'textarea' || element.tagName.toLowerCase() === 'input') {
            return element.value;
        }
        if (element.contentEditable === 'true') {
            return element.innerText || element.textContent;
        }
        return '';
    }

    /**
     * Set text to input element
     */
    function setInputText(element, text) {
        if (element.tagName.toLowerCase() === 'textarea' || element.tagName.toLowerCase() === 'input') {
            element.value = text;
            // Trigger input event for frameworks like React
            element.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (element.contentEditable === 'true') {
            element.innerText = text;
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    /**
     * Check text and show results
     */
    function checkText(input) {
        const text = getInputText(input);

        if (!text || text.trim().length === 0) {
            alert('Please enter some text to check.');
            return;
        }

        if (text.length > 2000) {
            alert('Text is too long. Maximum 2000 characters allowed.');
            return;
        }

        // Perform grammar check using the library
        const result = window.grammarChecker.correct(text, {
            spellCheck: settings.spellCheck,
            grammarCheck: settings.grammarCheck
        });

        // Show results in panel
        showCorrectionPanel(result, input);
    }

    /**
     * Show correction panel with results
     */
    function showCorrectionPanel(result, input) {
        const panel = createCorrectionPanel();

        // Update content
        panel.querySelector('.grammar-result-original').textContent = result.original;
        panel.querySelector('.grammar-result-corrected').textContent = result.corrected;

        // Generate diff
        const diffHtml = window.grammarChecker.generateDiff(result.original, result.corrected);
        panel.querySelector('.grammar-result-diff').innerHTML = diffHtml;

        // Store the corrected text and input reference
        panel.dataset.correctedText = result.corrected;
        panel.dataset.inputId = assignInputId(input);

        // Position and show panel
        panel.style.display = 'block';

        // Position near the input or center of screen
        const rect = input.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        panel.style.position = 'absolute';
        panel.style.left = '50%';
        panel.style.transform = 'translateX(-50%)';
        panel.style.top = `${rect.bottom + scrollTop + 10}px`;
        panel.style.zIndex = '999999';
    }

    /**
     * Hide correction panel
     */
    function hideCorrectionPanel() {
        if (correctionPanel) {
            correctionPanel.style.display = 'none';
        }
    }

    /**
     * Apply corrections from panel
     */
    function applyCorrectionPanel() {
        if (!correctionPanel) return;

        const correctedText = correctionPanel.dataset.correctedText;
        const inputId = correctionPanel.dataset.inputId;
        const input = document.querySelector(`[data-grammar-input-id="${inputId}"]`);

        if (input && correctedText) {
            setInputText(input, correctedText);
        }

        hideCorrectionPanel();
    }

    /**
     * Assign unique ID to input for tracking
     */
    function assignInputId(input) {
        if (!input.dataset.grammarInputId) {
            input.dataset.grammarInputId = `input-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        return input.dataset.grammarInputId;
    }

    /**
     * Handle input events for auto-checking
     */
    function handleInput(e) {
        const element = e.target;

        if (!isTextInput(element) || !settings.autoCheck) {
            return;
        }

        // Clear previous timer
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        // Debounce: wait 1.5 seconds after user stops typing
        debounceTimer = setTimeout(() => {
            const text = getInputText(element);

            if (text && text.trim().length > 0 && text.length <= 2000) {
                autoCheckText(element);
            }
        }, 1500);
    }

    /**
     * Auto-check text and show inline indicator
     */
    function autoCheckText(input) {
        const text = getInputText(input);

        // Perform grammar check
        const result = window.grammarChecker.correct(text, {
            spellCheck: settings.spellCheck,
            grammarCheck: settings.grammarCheck
        });

        // If there are corrections, show indicator
        if (result.original !== result.corrected) {
            showErrorIndicator(input, result.changes.length);
        } else {
            hideErrorIndicator();
        }
    }

    /**
     * Create error indicator
     */
    function createErrorIndicator() {
        if (errorIndicator) return errorIndicator;

        errorIndicator = document.createElement('div');
        errorIndicator.className = 'grammar-error-indicator';
        errorIndicator.innerHTML = `
      <span class="error-count">0</span>
      <span class="error-text">errors found</span>
      <button class="error-fix-btn">Fix</button>
    `;
        errorIndicator.style.display = 'none';

        document.body.appendChild(errorIndicator);

        // Click handler to show corrections
        errorIndicator.querySelector('.error-fix-btn').addEventListener('click', () => {
            if (currentInput) {
                checkText(currentInput);
            }
        });

        return errorIndicator;
    }

    /**
     * Show error indicator near input
     */
    function showErrorIndicator(input, errorCount) {
        const indicator = createErrorIndicator();

        indicator.querySelector('.error-count').textContent = errorCount;
        indicator.querySelector('.error-text').textContent = errorCount === 1 ? 'error found' : 'errors found';

        const rect = input.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        indicator.style.position = 'absolute';
        indicator.style.left = `${rect.left + scrollLeft}px`;
        indicator.style.top = `${rect.bottom + scrollTop + 5}px`;
        indicator.style.display = 'flex';
    }

    /**
     * Hide error indicator
     */
    function hideErrorIndicator() {
        if (errorIndicator) {
            errorIndicator.style.display = 'none';
        }
    }

    /**
     * Handle focus on text inputs
     */
    function handleFocus(e) {
        const element = e.target;

        if (isTextInput(element)) {
            currentInput = element;

            // Only show check button if auto-check is disabled
            if (!settings.autoCheck) {
                createCheckButton();
                positionCheckButton(element);
            }
        }
    }

    /**
     * Handle blur on text inputs
     */
    function handleBlur(e) {
        // Delay hiding to allow button click
        setTimeout(() => {
            if (checkButton && !checkButton.matches(':hover')) {
                checkButton.style.display = 'none';
            }
            // Also hide error indicator after a delay
            setTimeout(() => {
                hideErrorIndicator();
            }, 3000);
        }, 200);
    }

    /**
     * Handle scroll to reposition button
     */
    function handleScroll() {
        if (currentInput && checkButton && checkButton.style.display === 'block') {
            positionCheckButton(currentInput);
        }
    }

    /**
     * Handle resize to reposition button
     */
    function handleResize() {
        if (currentInput && checkButton && checkButton.style.display === 'block') {
            positionCheckButton(currentInput);
        }
    }

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'checkGrammar') {
            // Check the provided text
            const result = window.grammarChecker.correct(request.text, settings);
            alert(`Original: ${result.original}\n\nCorrected: ${result.corrected}`);
        }

        if (request.action === 'checkGrammarFocused') {
            // Check currently focused input
            if (currentInput) {
                checkText(currentInput);
            } else {
                alert('Please focus on a text input field first.');
            }
        }
    });

    // Add event listeners
    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('blur', handleBlur, true);
    document.addEventListener('input', handleInput, true);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    console.log('✓ Grammar & Spell Checker content script loaded');
    console.log('✓ Auto-detection:', settings.autoCheck ? 'enabled' : 'disabled');
})();
