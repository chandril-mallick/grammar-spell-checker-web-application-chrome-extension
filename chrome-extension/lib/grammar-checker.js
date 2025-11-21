/**
 * Grammar & Spell Checker Library
 * Client-side text correction using spell checking and grammar rules
 */

class GrammarChecker {
    constructor() {
        // Common spelling corrections dictionary
        this.spellingCorrections = {
            'teh': 'the',
            'recieve': 'receive',
            'seperate': 'separate',
            'definately': 'definitely',
            'occured': 'occurred',
            'untill': 'until',
            'sucessful': 'successful',
            'tommorow': 'tomorrow',
            'metting': 'meeting',
            'becuase': 'because',
            'wich': 'which',
            'thier': 'their',
            'wierd': 'weird',
            'beleive': 'believe',
            'calender': 'calendar',
            'arguement': 'argument',
            'existance': 'existence',
            'goverment': 'government',
            'occassion': 'occasion',
            'realy': 'really',
            'reccomend': 'recommend',
            'writting': 'writing',
            'youre': "you're",
            'ur': 'your',
            'dreamm': 'dream',
            'lett': 'let'
        };

        // Grammar patterns (basic rules)
        this.grammarRules = [
            {
                pattern: /\b(I|he|she|it)\s+are\b/gi,
                replacement: '$1 am/is',
                message: 'Subject-verb agreement error'
            },
            {
                pattern: /\b(I|you|we|they)\s+is\b/gi,
                replacement: '$1 are',
                message: 'Subject-verb agreement error'
            },
            {
                pattern: /\bI\s+has\b/gi,
                replacement: 'I have',
                message: 'Incorrect verb form'
            },
            {
                pattern: /\b(he|she|it)\s+have\b/gi,
                replacement: '$1 has',
                message: 'Subject-verb agreement error'
            },
            {
                pattern: /\ba\s+([aeiou])/gi,
                replacement: 'an $1',
                message: 'Article usage: use "an" before vowel sounds'
            },
            {
                pattern: /\ban\s+([^aeiou])/gi,
                replacement: 'a $1',
                message: 'Article usage: use "a" before consonant sounds'
            }
        ];
    }

    /**
     * Main correction function
     * @param {string} text - Input text to correct
     * @param {Object} options - Correction options
     * @returns {Object} - Correction results
     */
    correct(text, options = { spellCheck: true, grammarCheck: true }) {
        if (!text || typeof text !== 'string') {
            return {
                original: text || '',
                spellCorrected: text || '',
                corrected: text || '',
                changes: []
            };
        }

        const original = text.trim();
        let spellCorrected = original;
        let finalCorrected = original;
        const changes = [];

        // Step 1: Spell check
        if (options.spellCheck) {
            const spellResult = this.spellCorrect(original);
            spellCorrected = spellResult.text;
            changes.push(...spellResult.changes);
        }

        // Step 2: Grammar check
        if (options.grammarCheck) {
            const grammarResult = this.grammarCorrect(spellCorrected);
            finalCorrected = grammarResult.text;
            changes.push(...grammarResult.changes);
        }

        return {
            original,
            spellCorrected,
            corrected: finalCorrected,
            changes
        };
    }

    /**
     * Spell correction
     * @param {string} text - Input text
     * @returns {Object} - Corrected text and changes
     */
    spellCorrect(text) {
        let corrected = text;
        const changes = [];

        // Split into words and check each
        const words = text.split(/\b/);
        corrected = words.map((word) => {
            const lower = word.toLowerCase();
            if (this.spellingCorrections[lower]) {
                const correction = this.spellingCorrections[lower];
                // Preserve capitalization
                const correctedWord = this.preserveCase(word, correction);
                if (word !== correctedWord) {
                    changes.push({
                        type: 'spelling',
                        original: word,
                        corrected: correctedWord,
                        message: `Spelling: "${word}" → "${correctedWord}"`
                    });
                }
                return correctedWord;
            }
            return word;
        }).join('');

        return { text: corrected, changes };
    }

    /**
     * Grammar correction
     * @param {string} text - Input text
     * @returns {Object} - Corrected text and changes
     */
    grammarCorrect(text) {
        let corrected = text;
        const changes = [];

        // Apply each grammar rule
        this.grammarRules.forEach((rule) => {
            const matches = [...corrected.matchAll(rule.pattern)];
            matches.forEach((match) => {
                if (match[0]) {
                    changes.push({
                        type: 'grammar',
                        original: match[0],
                        corrected: match[0].replace(rule.pattern, rule.replacement),
                        message: rule.message
                    });
                }
            });
            corrected = corrected.replace(rule.pattern, rule.replacement);
        });

        return { text: corrected, changes };
    }

    /**
     * Preserve the case pattern of the original word
     * @param {string} original - Original word
     * @param {string} correction - Corrected word
     * @returns {string} - Corrected word with preserved case
     */
    preserveCase(original, correction) {
        // All uppercase
        if (original === original.toUpperCase()) {
            return correction.toUpperCase();
        }
        // First letter uppercase
        if (original[0] === original[0].toUpperCase()) {
            return correction.charAt(0).toUpperCase() + correction.slice(1);
        }
        // All lowercase
        return correction.toLowerCase();
    }

    /**
     * Generate diff HTML for displaying changes
     * @param {string} original - Original text
     * @param {string} corrected - Corrected text
     * @returns {string} - HTML with diff highlighting
     */
    generateDiff(original, corrected) {
        if (original === corrected) {
            return '<span style="color: #28a745; font-weight: 600;">✓ No changes needed - text is already correct!</span>';
        }

        const originalWords = original.split(/(\s+)/);
        const correctedWords = corrected.split(/(\s+)/);

        let diffHtml = '';
        let i = 0, j = 0;

        while (i < originalWords.length || j < correctedWords.length) {
            if (i >= originalWords.length) {
                diffHtml += `<span class="diff-added">${this.escapeHtml(correctedWords[j])}</span>`;
                j++;
            } else if (j >= correctedWords.length) {
                diffHtml += `<span class="diff-removed">${this.escapeHtml(originalWords[i])}</span>`;
                i++;
            } else if (originalWords[i] === correctedWords[j]) {
                diffHtml += this.escapeHtml(originalWords[i]);
                i++;
                j++;
            } else {
                diffHtml += `<span class="diff-removed">${this.escapeHtml(originalWords[i])}</span>`;
                diffHtml += `<span class="diff-added">${this.escapeHtml(correctedWords[j])}</span>`;
                i++;
                j++;
            }
        }

        return diffHtml;
    }

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.GrammarChecker = GrammarChecker;
    window.grammarChecker = new GrammarChecker();
}
