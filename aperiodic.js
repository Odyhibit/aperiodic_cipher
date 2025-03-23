 document.addEventListener('DOMContentLoaded', function() {
    const inputText = document.getElementById('inputText');
    const keyInput = document.getElementById('keyInput');
    const interruptorInput = document.getElementById('interruptorInput');
    const interruptorLabel = document.getElementById('interruptorLabel');
    const algorithmSelect = document.getElementById('algorithmSelect');
    const encodeBtn = document.getElementById('encodeBtn');
    const decodeBtn = document.getElementById('decodeBtn');
    const outputText = document.getElementById('outputText');
    const errorMessage = document.getElementById('errorMessage');
    const algorithmInfo = document.getElementById('algorithmInfo');

    // Update algorithm info and UI when selection changes
    algorithmSelect.addEventListener('change', function() {
        updateAlgorithmInfo();
        updateUIForAlgorithm();
    });

    // Initial setup
    updateAlgorithmInfo();
    updateUIForAlgorithm();

    function updateUIForAlgorithm() {
        const algorithm = algorithmSelect.value;

        if (algorithm === 'interruptorLetter') {
            interruptorInput.style.display = 'inline-block';
            interruptorLabel.style.display = 'inline-block';
            keyInput.placeholder = "Enter cipher key...";
        } else {
            interruptorInput.style.display = 'none';
            interruptorLabel.style.display = 'none';
            keyInput.placeholder = "Enter key...";
        }
    }

    function updateAlgorithmInfo() {
        const algorithm = algorithmSelect.value;
        let infoText = '';

        switch (algorithm) {
            case 'wordLength':
                infoText = `<p><strong>Word Length Aperiodic:</strong> Changes alphabet with each word instead of each letter. Uses a sequence of alphabets in rotation, with a new alphabet starting at each word.</p>`;
                break;
            case 'numericallyKeyed':
                infoText = `<p><strong>Numerically Keyed Aperiodic:</strong> Changes alphabets after a number of letters determined by a numerical key. The key is derived from a keyword by numbering its letters alphabetically.</p>`;
                break;
            case 'interruptorLetter':
                infoText = `<p><strong>Interruptor Letter Aperiodic:</strong> Uses alphabets in rotation like a periodic system, but when a preselected letter is encountered, the rotation is interrupted and encipherment returns to the first alphabet.</p>`;
                break;
        }

        algorithmInfo.innerHTML = infoText;
    }

    encodeBtn.addEventListener('click', function() {
        processText('encode');
    });

    decodeBtn.addEventListener('click', function() {
        processText('decode');
    });

    function processText(action) {
        const text = inputText.value.trim();
        const algorithm = algorithmSelect.value;

        // Clear previous error messages
        errorMessage.textContent = '';

        // Validate inputs
        if (!text) {
            showError('Please enter text to process');
            return;
        }

        try {
            let result;

            if (algorithm === 'interruptorLetter') {
                const interruptor = interruptorInput.value;
                const key = keyInput.value.trim();

                if (!interruptor) {
                    showError('Please enter an interruptor letter');
                    return;
                }
                console.log(interruptor.charCodeAt(0), interruptor.length);
                if (interruptor.length !== 1 || !/^[a-zA-Z ]$/.test(interruptor)) {
                    showError('Interruptor must be a single letter');
                    return;
                }

                if (!key) {
                    showError('Please enter a cipher key');
                    return;
                }

                if (action === 'encode') {
                    result = interruptorLetterEncode(text, interruptor, key);
                } else {
                    result = interruptorLetterDecode(text, interruptor, key);
                }
            } else {
                const key = keyInput.value.trim();

                if (!key) {
                    showError('Please enter a key');
                    return;
                }

                if (action === 'encode') {
                    result = encode(text, key, algorithm);
                } else {
                    result = decode(text, key, algorithm);
                }
            }

            outputText.value = result;
        } catch (error) {
            showError(error.message);
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
    }

    // Generate shifting alphabets
    function generateShiftedAlphabets(key) {
        const alphabets = [];
        const baseAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        // Create shifted alphabets based on key
        for (let i = 0; i < key.length; i++) {
            const shiftAmount = key.toUpperCase().charCodeAt(i) - 65; // A=0, B=1, etc.
            let shiftedAlphabet = '';

            for (let j = 0; j < baseAlphabet.length; j++) {
                const newPos = (j + shiftAmount) % 26;
                shiftedAlphabet += baseAlphabet[newPos];
            }

            alphabets.push(shiftedAlphabet);
        }

        return alphabets;
    }

    // Convert key to numerical sequence (for numerically keyed algorithm)
    function keyToNumericalSequence(key) {
        // Create array of letter, original index pairs
        const keyLetters = key.toUpperCase().split('').map((letter, index) => ({
            letter,
            index
        }));

        // Sort alphabetically
        keyLetters.sort((a, b) => a.letter.localeCompare(b.letter));

        // Create numerical sequence
        const sequence = new Array(key.length);
        keyLetters.forEach((item, sortedIndex) => {
            sequence[item.index] = sortedIndex + 1;
        });

        return sequence;
    }

    function encode(text, key, algorithm) {
        switch (algorithm) {
            case 'wordLength':
                return wordLengthEncode(text, key);
            case 'numericallyKeyed':
                return numericallyKeyedEncode(text, key);
            default:
                throw new Error('Unknown algorithm');
        }
    }

    function decode(text, key, algorithm) {
        switch (algorithm) {
            case 'wordLength':
                return wordLengthDecode(text, key);
            case 'numericallyKeyed':
                return numericallyKeyedDecode(text, key);
            default:
                throw new Error('Unknown algorithm');
        }
    }

    // Word Length Aperiodic
    function wordLengthEncode(text, key) {
        if (!/^[a-zA-Z]+$/.test(key)) {
            throw new Error('Word Length Aperiodic requires an alphabetic key');
        }

        const alphabets = generateShiftedAlphabets(key);
        const words = text.split(/\s+/);
        const baseAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';

        let currentWordIndex = 0;
        for (const word of words) {
            if (word.length === 0) continue;

            const currentAlphabet = alphabets[currentWordIndex % alphabets.length];
            let encodedWord = '';

            for (const char of word) {
                if (/[a-zA-Z]/.test(char)) {
                    const isUpperCase = char === char.toUpperCase();
                    const index = char.toUpperCase().charCodeAt(0) - 65;

                    if (index >= 0 && index < 26) {
                        const encChar = currentAlphabet[index];
                        encodedWord += isUpperCase ? encChar : encChar.toLowerCase();
                    } else {
                        encodedWord += char;
                    }
                } else {
                    encodedWord += char;
                }
            }

            result += encodedWord + ' ';
            currentWordIndex++;
        }

        return result.trim();
    }

    function wordLengthDecode(text, key) {
        if (!/^[a-zA-Z]+$/.test(key)) {
            throw new Error('Word Length Aperiodic requires an alphabetic key');
        }

        const alphabets = generateShiftedAlphabets(key);
        const words = text.split(/\s+/);
        const baseAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';

        let currentWordIndex = 0;
        for (const word of words) {
            if (word.length === 0) continue;

            const currentAlphabet = alphabets[currentWordIndex % alphabets.length];
            let decodedWord = '';

            for (const char of word) {
                if (/[a-zA-Z]/.test(char)) {
                    const isUpperCase = char === char.toUpperCase();
                    const encChar = char.toUpperCase();
                    const index = currentAlphabet.indexOf(encChar);

                    if (index >= 0) {
                        const decChar = baseAlphabet[index];
                        decodedWord += isUpperCase ? decChar : decChar.toLowerCase();
                    } else {
                        decodedWord += char;
                    }
                } else {
                    decodedWord += char;
                }
            }

            result += decodedWord + ' ';
            currentWordIndex++;
        }

        return result.trim();
    }

    // Numerically Keyed Aperiodic
    function numericallyKeyedEncode(text, key) {
        if (!/^[a-zA-Z]+$/.test(key)) {
            throw new Error('Numerically Keyed Aperiodic requires an alphabetic key');
        }

        const alphabets = generateShiftedAlphabets(key);
        const numericSequence = keyToNumericalSequence(key);
        const baseAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        let result = '';
        let currentAlphabetIndex = 0;
        let letterCounter = 0;
        let currentSequenceIndex = 0;

        for (const char of text) {
            if (/[a-zA-Z]/.test(char)) {
                // Check if we need to change alphabets
                if (letterCounter >= numericSequence[currentSequenceIndex]) {
                    letterCounter = 0;
                    currentAlphabetIndex = (currentAlphabetIndex + 1) % alphabets.length;
                    currentSequenceIndex = (currentSequenceIndex + 1) % numericSequence.length;
                }

                const isUpperCase = char === char.toUpperCase();
                const index = char.toUpperCase().charCodeAt(0) - 65;

                if (index >= 0 && index < 26) {
                    const encChar = alphabets[currentAlphabetIndex][index];
                    result += isUpperCase ? encChar : encChar.toLowerCase();
                } else {
                    result += char;
                }

                letterCounter++;
            } else {
                result += char;
            }
        }

        return result;
    }

    function numericallyKeyedDecode(text, key) {
        if (!/^[a-zA-Z]+$/.test(key)) {
            throw new Error('Numerically Keyed Aperiodic requires an alphabetic key');
        }

        const alphabets = generateShiftedAlphabets(key);
        const numericSequence = keyToNumericalSequence(key);
        const baseAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        let result = '';
        let currentAlphabetIndex = 0;
        let letterCounter = 0;
        let currentSequenceIndex = 0;

        for (const char of text) {
            if (/[a-zA-Z]/.test(char)) {
                // Check if we need to change alphabets
                if (letterCounter >= numericSequence[currentSequenceIndex]) {
                    letterCounter = 0;
                    currentAlphabetIndex = (currentAlphabetIndex + 1) % alphabets.length;
                    currentSequenceIndex = (currentSequenceIndex + 1) % numericSequence.length;
                }

                const isUpperCase = char === char.toUpperCase();
                const encChar = char.toUpperCase();
                const index = alphabets[currentAlphabetIndex].indexOf(encChar);

                if (index >= 0) {
                    const decChar = baseAlphabet[index];
                    result += isUpperCase ? decChar : decChar.toLowerCase();
                } else {
                    result += char;
                }

                letterCounter++;
            } else {
                result += char;
            }
        }

        return result;
    }

    // Interruptor Letter Aperiodic
    function interruptorLetterEncode(text, interruptor, key) {
        if (!/^[a-zA-Z ]$/.test(interruptor)) {
            throw new Error('Interruptor must be a single letter');
        }

        if (!/^[a-zA-Z ]+$/.test(key)) {
            throw new Error('Interruptor Letter Aperiodic requires an alphabetic key');
        }

        const interruptorLetter = interruptor.toUpperCase();
        const alphabets = generateShiftedAlphabets(key);
        const baseAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        let result = '';
        let currentAlphabetIndex = 0;

        for (const char of text) {
            if (/[a-zA-Z ]/.test(char)) {
                const isUpperCase = char === char.toUpperCase();
                const charUpper = char.toUpperCase();

                // Check if this is the interruptor letter
                if (charUpper === interruptorLetter) {
                    // Reset to first alphabet
                    currentAlphabetIndex = 0;
                }

                const index = charUpper.charCodeAt(0) - 65;

                if (index >= 0 && index < 26) {
                    const encChar = alphabets[currentAlphabetIndex][index];
                    result += isUpperCase ? encChar : encChar.toLowerCase();
                } else {
                    result += char;
                }

                // Move to next alphabet if not an interruptor
                if (charUpper !== interruptorLetter) {
                    currentAlphabetIndex = (currentAlphabetIndex + 1) % alphabets.length;
                }
            } else {
                result += char;
            }
        }

        return result;
    }

    function interruptorLetterDecode(text, interruptor, key) {
        if (!/^[a-zA-Z ]$/.test(interruptor)) {
            throw new Error('Interruptor must be a single letter');
        }

        if (!/^[a-zA-Z ]+$/.test(key)) {
            throw new Error('Interruptor Letter Aperiodic requires an alphabetic key');
        }

        // We need to track which alphabet was used for each character during encoding
        // to correctly decode. This makes decoding more complex than encoding.

        const interruptorLetter = interruptor.toUpperCase();
        const alphabets = generateShiftedAlphabets(key);
        const baseAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        // First, determine which alphabet was used for each character
        const alphabetIndices = [];
        let currentAlphabetIndex = 0;

        // Simulate the encoding process to determine alphabet indices
        for (const char of text) {
            if (/[a-zA-Z ]/.test(char)) {
                alphabetIndices.push(currentAlphabetIndex);

                // Now decode the character to check if it's an interruptor
                const charUpper = char.toUpperCase();
                const index = alphabets[currentAlphabetIndex].indexOf(charUpper);
                const decodedChar = (index >= 0) ? baseAlphabet[index] : charUpper;

                // Check if the decoded character is the interruptor
                if (decodedChar === interruptorLetter) {
                    // Reset to first alphabet
                    currentAlphabetIndex = 0;
                } else {
                    // Move to next alphabet
                    currentAlphabetIndex = (currentAlphabetIndex + 1) % alphabets.length;
                }
            }
        }

        // Now perform the actual decoding
        let result = '';
        let charIndex = 0;

        for (const char of text) {
            if (/[a-zA-Z ]/.test(char)) {
                const isUpperCase = char === char.toUpperCase();
                const charUpper = char.toUpperCase();
                const alphabetIndex = alphabetIndices[charIndex];
                const index = alphabets[alphabetIndex].indexOf(charUpper);

                if (index >= 0) {
                    const decChar = baseAlphabet[index];
                    result += isUpperCase ? decChar : decChar.toLowerCase();
                } else {
                    result += char;
                }

                charIndex++;
            } else {
                result += char;
            }
        }

        return result;
    }
});