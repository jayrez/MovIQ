// script.js

const promptEl = document.getElementById("prompt");
const gridEl = document.getElementById("guess-grid");
const keyboardEl = document.getElementById("keyboard");
const messageEl = document.getElementById("message");

const MAX_GUESSES = 6;
const target = gameData.answer.toUpperCase().replace(/'/g, ""); // Remove apostrophes completely
const normalizedTarget = target.replace(/[^A-Z]/g, ""); // Remove spaces and special characters for input checking

const prompt = gameData.prompt;

let currentGuess = '';
let guesses = [];
let gameOver = false;

// Show the prompt
promptEl.textContent = `🧠 ${prompt}`;

// Create grid slots
function createGrid() {
    gridEl.innerHTML = ""; // Clear previous grid
  
    let cleanAnswer = gameData.answer.replace(/'/g, ""); // Remove apostrophes
  
    for (let i = 0; i < MAX_GUESSES; i++) {
      const row = document.createElement("div");
      row.classList.add("grid-row");
  
      for (let j = 0; j < cleanAnswer.length; j++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
  
        if (cleanAnswer[j] === " ") {
          tile.classList.add("space-tile");
          tile.textContent = ""; // Ensure it remains visually empty
        } else {
          tile.dataset.index = j; // Store correct letter position
        }
  
        row.appendChild(tile);
      }
  
      gridEl.appendChild(row);
    }
  }  
createGrid();

// Create on-screen keyboard
const keyboardLayout = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"]
];

function createKeyboard() {
  keyboardEl.innerHTML = ""; // Clear existing keyboard

  keyboardLayout.forEach(rowKeys => {
    const row = document.createElement("div");
    row.classList.add("keyboard-row");

    rowKeys.forEach(key => {
      const btn = document.createElement("button");
      btn.textContent = key;
      btn.className = "key";

      if (key === "ENTER") {
        btn.classList.add("enter-key");
      } else if (key === "⌫") {
        btn.classList.add("backspace-key");
      }

      btn.onclick = () => handleKey(key === "⌫" ? "BACKSPACE" : key);
      row.appendChild(btn);
    });

    keyboardEl.appendChild(row);
  });
}
createKeyboard();

// Keyboard input handling
document.addEventListener('keydown', (e) => {
  if (gameOver) return;
  const key = e.key.toUpperCase();
  if (key === 'ENTER') {
    submitGuess();
  } else if (key === 'BACKSPACE') {
    removeLetter();
  } else if (/^[A-Z]$/.test(key)) {
    addLetter(key);
  }
});

function handleKey(key) {
  if (gameOver) return;

  if (key === 'ENTER') {
    submitGuess();
  } else if (key === 'BACKSPACE') {
    removeLetter();
  } else if (/^[A-Z]$/.test(key)) {
    addLetter(key);
  }
}

function addLetter(letter) {
  if (currentGuess.length < normalizedTarget.length) {
    currentGuess += letter;
    updateGrid();
  }
}

function removeLetter() {
  currentGuess = currentGuess.slice(0, -1);
  updateGrid();
}

function updateGrid() {
    const row = guesses.length;
    const rowEl = gridEl.children[row]; // Get the current row
    if (!rowEl) return; // Prevent errors
  
    let guessIndex = 0; // Tracks input letters only
  
    for (let i = 0; i < target.length; i++) {
      const tile = rowEl.children[i]; // Get the correct tile in row
  
      if (target[i] === " ") {
        tile.textContent = ""; // Keep spaces blank
        continue; // Skip spaces
      }
  
      if (tile) {
        // Update only the latest typed tile
        if (guessIndex === currentGuess.length - 1) {
          tile.classList.add("bounce"); // Apply bounce effect only to new letter
          setTimeout(() => tile.classList.remove("bounce"), 150); // Remove after animation
        }
  
        tile.textContent = currentGuess[guessIndex] || "";
        guessIndex++; // Only increment for actual letters
      }
    }
  }    

  function submitGuess() {
    if (currentGuess.length !== normalizedTarget.length) {
      showMessage("Not enough letters");
      return;
    }
  
    const guessUpper = currentGuess.toUpperCase();
    const row = guesses.length;
    const rowEl = gridEl.children[row]; // Get the correct row
  
    if (!rowEl) return; // Prevent errors
  
    let guessIndex = 0;
    let tempTargetArray = normalizedTarget.split(""); // Copy of target for tracking misplaced letters
  
    // First, apply flip animation before changing colors
    for (let i = 0; i < target.length; i++) {
      const tile = rowEl.children[i];
  
      if (target[i] === " ") continue; // Skip spaces
  
      setTimeout(() => {
        tile.classList.add("flip"); // Start the flip animation
  
        // After flip animation completes, apply colors
        setTimeout(() => {
          const letter = guessUpper[guessIndex];
  
          // Step 1: Mark correct letters (Green)
          if (letter === normalizedTarget[guessIndex]) {
            tile.classList.add("correct");
            markKey(letter, "correct");
            tempTargetArray[guessIndex] = null; // Remove from temp array to prevent duplicate marking
          }
          
          guessIndex++;
        }, 250); // Delay color application until half-flip
  
      }, i * 200); // Stagger tile flips
    }
  
    // Second pass: Apply "present" (yellow) and "absent" (gray) after flipping
    setTimeout(() => {
      guessIndex = 0;
      for (let i = 0; i < target.length; i++) {
        const tile = rowEl.children[i];
  
        if (target[i] === " ") continue; // Skip spaces
  
        const letter = guessUpper[guessIndex];
  
        // Step 2: Mark present letters (Yellow)
        if (letter !== normalizedTarget[guessIndex] && tempTargetArray.includes(letter)) {
          tile.classList.add("present");
          markKey(letter, "present");
          tempTargetArray[tempTargetArray.indexOf(letter)] = null; // Remove from temp array
        }
  
        // Step 3: Mark absent letters (Gray)
        else if (!normalizedTarget.includes(letter)) {
          tile.classList.add("absent");
          markKey(letter, "absent");
        }
  
        guessIndex++;
      }
    }, target.length * 200 + 250); // Ensure this runs after all flips complete
  
    guesses.push(currentGuess);
    if (guessUpper.replace(/\s/g, "") === normalizedTarget) {
      setTimeout(() => showMessage("🎉 Correct! You win!"), 1000);
      gameOver = true;
    } else if (guesses.length === MAX_GUESSES) {
      setTimeout(() => showMessage(`💀 Out of tries! Answer was: ${gameData.answer}`), 1000);
      gameOver = true;
    }
  
    currentGuess = "";
  }
  

function showMessage(msg) {
  messageEl.textContent = msg;
}

function markKey(letter, status) {
  const keyBtn = [...keyboardEl.children].find(k => k.textContent === letter);
  if (!keyBtn || keyBtn.classList.contains('correct')) return; // Don't downgrade
  if (status === 'correct' || (status === 'present' && !keyBtn.classList.contains('present'))) {
    keyBtn.className = `key ${status}`;
  } else if (!keyBtn.classList.contains('correct') && !keyBtn.classList.contains('present')) {
    keyBtn.classList.add('absent');
  }
}
