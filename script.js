$(document).ready(function () {
  const sentences = [
    "It is good to learn.",
    "Birds chirped happily in the trees.",
    "A gentle breeze rustled through the leaves.",
    "The river flowed steadily beside the meadow.",
    "The sun rose gently over the horizon.",
  ];

  const sentenceElement = document.getElementById("sentence");
  const progressBar = document.querySelector("#progress-bar .progress-bar");
  const nextButton = document.getElementById("next-button");
  const stopButton = document.getElementById("stop-button");
  const completionMessage = document.getElementById("completion-message");
  const resultMessage = document.getElementById("result-message");
  const synth = window.speechSynthesis; // Initialize speech synthesis

  let currentSentenceIndex = 0;
  let recognition;

  nextButton.addEventListener("click", startExercise);
  stopButton.addEventListener("click", stopExercise);

  function startExercise() {
    currentSentenceIndex = 0;
    progressBar.style.width = "0%";
    progressBar.textContent = "0%";
    completionMessage.classList.add("d-none");
    resultMessage.classList.add("d-none"); // Hide result message
    nextButton.classList.add("d-none");
    stopButton.classList.remove("d-none");
    sentenceElement.textContent = sentences[currentSentenceIndex];
    startRecognition();
    speak(sentences[currentSentenceIndex]); // Speak the first sentence
  }

  function stopExercise() {
    if (recognition) {
      recognition.stop();
    }
    nextButton.classList.remove("d-none");
    stopButton.classList.add("d-none");
    completionMessage.classList.add("d-none");
    resultMessage.classList.add("d-none"); // Hide result message
  }

  function startRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    recognition.onresult = function (event) {
      const userVoice =
        event.results[event.results.length - 1][0].transcript.toLowerCase();
      const targetSentence = sentences[currentSentenceIndex].toLowerCase();

      if (userVoice === targetSentence) {
        // Correct pronunciation
        currentSentenceIndex++;
        const completionPercentage = Math.min(currentSentenceIndex * 20, 100);
        progressBar.style.width = completionPercentage + "%";
        progressBar.textContent = completionPercentage + "%";

        if (currentSentenceIndex === sentences.length) {
          recognition.stop();
          nextButton.classList.remove("d-none");
          stopButton.classList.add("d-none");
          completionMessage.textContent =
            "Congratulations! You have completed the exercise.";
          completionMessage.classList.remove("d-none");
        } else {
          sentenceElement.textContent = sentences[currentSentenceIndex];
          speak(sentences[currentSentenceIndex]); // Speak the next sentence
          recognition.stop(); // Stop recognition after correct pronunciation
        }

        // Display "Good" in green
        resultMessage.textContent = "Good";
        resultMessage.style.color = "green";
        resultMessage.classList.remove("error");
        resultMessage.classList.remove("d-none");
      } else {
        // Incorrect pronunciation
        resultMessage.textContent = "Try again.";
        resultMessage.style.color = "red";
        resultMessage.classList.add("error");
        resultMessage.classList.remove("d-none");
        recognition.start(); // Start recognition again for the same sentence
      }
    };

    recognition.onerror = function (event) {
      console.error("Speech recognition error:", event.error);
      stopExercise();
    };

    recognition.onend = function () {
      recognition.start();
    };

    recognition.start();
  }

  // Function to speak a given sentence
  function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  }
});
