$(document).ready(function() {
const sentences = [
    "Technique.",
    "Stutter.",
    "Fluency.",
    "Communication.",
    "Confidence.",
    "Butter.",
    "Difficulty.",
    "Stutter.",
    "Fluency.",
    "Learn."
].sort(() => Math.random() - 0.5);

    const sentenceElement = document.getElementById('sentence');
    const progressBar = document.querySelector('#progress-bar .progress-bar');
    const nextButton = document.getElementById('next-button');
    const stopButton = document.getElementById('stop-button');
    const completionMessage = document.getElementById('completion-message');
    const resultMessage = document.getElementById('result-message');
    const wordList = document.getElementById('wordList');
    const synth = window.speechSynthesis; // Initialize speech synthesis

    let currentSentenceIndex = 0;
    let recognition;
    let learnedWords = {};

    nextButton.addEventListener('click', startExercise);
    stopButton.addEventListener('click', stopExercise);

    function startExercise() {
        currentSentenceIndex = 0;
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
        completionMessage.classList.add('d-none');
        resultMessage.classList.add('d-none'); // Hide result message
        nextButton.classList.add('d-none');
        stopButton.classList.remove('d-none');
        sentenceElement.textContent = sentences[currentSentenceIndex];
        startRecognition();
        speak(sentences[currentSentenceIndex]); // Speak the first sentence
    }

function stopExercise() {
    console.log('Recognition stopped');
    if (recognition) {
        recognition.stop();
    }
    nextButton.classList.remove('d-none');
    stopButton.classList.add('d-none');
    completionMessage.classList.add('d-none');
    resultMessage.classList.add('d-none'); // Hide result message
}


    function startRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = function(event) {
            const userVoice = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
            const targetSentence = sentences[currentSentenceIndex].toLowerCase();

            if (isSimilar(userVoice, targetSentence, 3)) { // Adjust threshold as needed
                // Correct pronunciation
                currentSentenceIndex++;
                const completionPercentage = Math.min(currentSentenceIndex * 20, 100);
                progressBar.style.width = completionPercentage + '%';
                progressBar.textContent = completionPercentage + '%';

                if (currentSentenceIndex === sentences.length) {
                    recognition.stop();
                    nextButton.classList.remove('d-none');
                    stopButton.classList.add('d-none');
                    completionMessage.textContent = 'Congratulations! You have completed the exercise.';
                    completionMessage.classList.remove('d-none');
                } else {
                    sentenceElement.textContent = sentences[currentSentenceIndex];
                    speak(sentences[currentSentenceIndex]); // Speak the next sentence
                }

                // Display "Good" in green
                resultMessage.textContent = 'Good';
                resultMessage.style.color='green';
                resultMessage.classList.remove('error');
                resultMessage.classList.remove('d-none');

                // Update learned words and display them in the menu
                const currentWord = sentences[currentSentenceIndex - 1];
                learnedWords[currentWord] = (learnedWords[currentWord] || 0) + 1;
                updateWordList();
            } else {
                // Incorrect pronunciation
                resultMessage.textContent = 'Try again.';
                resultMessage.style.color='red';
                resultMessage.classList.add('error');
                resultMessage.classList.remove('d-none');
            }
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            stopExercise();
        };

        recognition.onend = function() {
            console.log('Recognition ended');
            // Start recognition again after it ends
            recognition.start();
        };

        recognition.start();
    }

function updateWordList() {
    const sortedWords = Object.entries(learnedWords).sort((a, b) => b[1] - a[1]);
    
    wordList.innerHTML = '';
    
    sortedWords.forEach(([word, count]) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${word} (${count})`;
        wordList.appendChild(listItem);
    });
}

    function speak(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        synth.speak(utterance);
    }

    // Levenshtein distance function
    function levenshteinDistance(s1, s2) {
        const len1 = s1.length;
        const len2 = s2.length;
        const matrix = [];

        // Initialize matrix
        for (let i = 0; i <= len1; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= len2; j++) {
            matrix[0][j] = j;
        }

        // Calculate Levenshtein distance
        for (let j = 1; j <= len2; j++) {
            for (let i = 1; i <= len1; i++) {
                if (s1.charAt(i - 1) === s2.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }

        return matrix[len1][len2];
    }

    // Function to check if two strings are similar within a given threshold
    function isSimilar(s1, s2, threshold) {
        const distance = levenshteinDistance(s1, s2);
        return distance <= threshold;
    }
});
