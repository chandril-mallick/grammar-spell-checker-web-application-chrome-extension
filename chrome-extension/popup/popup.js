/**
 * Popup Script for Grammar & Spell Checker Extension
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const inputText = document.getElementById('inputText');
    const charCounter = document.getElementById('charCounter');
    const correctBtn = document.getElementById('correctBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const outputSection = document.getElementById('outputSection');
    const originalText = document.getElementById('originalText');
    const correctedText = document.getElementById('correctedText');
    const diffView = document.getElementById('diffView');
    const spinner = document.getElementById('spinner');

    const MAX_CHARS = 2000;
    let settings = { spellCheck: true, grammarCheck: true };
    let lastCorrectedText = '';

    // Load settings
    chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
        if (response) {
            settings = response;
        }
    });

    // Load the grammar checker library
    const script = document.createElement('script');
    script.src = '../lib/grammar-checker.js';
    document.head.appendChild(script);

    // Character counter
    inputText.addEventListener('input', () => {
        const length = inputText.value.length;
        charCounter.textContent = `${length} / ${MAX_CHARS} characters`;

        if (length > MAX_CHARS) {
            charCounter.classList.add('over-limit');
        } else {
            charCounter.classList.remove('over-limit');
        }
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
        inputText.value = '';
        charCounter.textContent = '0 / 2000 characters';
        charCounter.classList.remove('over-limit');
        outputSection.style.display = 'none';
    });

    // Correct button
    correctBtn.addEventListener('click', async () => {
        const text = inputText.value.trim();

        // Validation
        if (!text) {
            alert('Please enter some text to correct.');
            return;
        }

        if (text.length > MAX_CHARS) {
            alert(`Text is too long. Maximum ${MAX_CHARS} characters allowed.`);
            return;
        }

        // Show loading state
        setLoadingState(true);
        outputSection.style.display = 'none';

        // Wait for grammar checker to load
        setTimeout(() => {
            try {
                if (!window.grammarChecker) {
                    throw new Error('Grammar checker not loaded');
                }

                // Perform correction
                const result = window.grammarChecker.correct(text, {
                    spellCheck: settings.spellCheck,
                    grammarCheck: settings.grammarCheck
                });

                // Display results
                displayResults(result);
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            } finally {
                setLoadingState(false);
            }
        }, 100);
    });

    // Copy button
    copyBtn.addEventListener('click', () => {
        if (lastCorrectedText) {
            navigator.clipboard.writeText(lastCorrectedText).then(() => {
                // Show feedback
                const originalText = copyBtn.textContent;
                copyBtn.textContent = '✓ Copied!';
                copyBtn.style.background = '#28a745';

                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.background = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy:', err);
                alert('Failed to copy text.');
            });
        }
    });

    // Display results
    function displayResults(result) {
        originalText.textContent = result.original;
        correctedText.textContent = result.corrected;
        lastCorrectedText = result.corrected;

        // Generate diff view
        if (window.grammarChecker) {
            const diffHtml = window.grammarChecker.generateDiff(result.original, result.corrected);
            diffView.innerHTML = diffHtml;
        }

        // Show output section
        outputSection.style.display = 'block';
    }

    // Set loading state
    function setLoadingState(isLoading) {
        if (isLoading) {
            spinner.style.display = 'inline-block';
            correctBtn.disabled = true;
            inputText.disabled = true;
            correctBtn.style.opacity = '0.7';
        } else {
            spinner.style.display = 'none';
            correctBtn.disabled = false;
            inputText.disabled = false;
            correctBtn.style.opacity = '1';
        }
    }

    // Enable Ctrl+Enter to submit
    inputText.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            correctBtn.click();
        }
    });

    // Auto-focus on text input
    inputText.focus();
});
