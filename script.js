// script.js

const promptEl = document.getElementById("prompt");
const gridEl = document.getElementById("guess-grid");
const keyboardEl = document.getElementById("keyboard");
const messageEl = document.getElementById("message");

const MAX_GUESSES = 6;
const target = gameData.answer.toUpperCase().replace(/'/g, ""); // Remove apostrophes completely
const normalizedTarget = target.replace(/[^A-Z ]/g, ""); // keep spaces // Remove spaces and special characters for input checking

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
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "SPACE", "⌫"]
];

function createKeyboard() {
  keyboardEl.innerHTML = "";

  keyboardLayout.forEach(rowKeys => {
    const row = document.createElement("div");
    row.classList.add("keyboard-row");

    rowKeys.forEach(key => {
      const btn = document.createElement("button");
      btn.className = "key";
      btn.innerText = key;

      if (key === "⌫") {
        btn.classList.add("backspace-key");
        btn.onclick = () => handleKey("Backspace");
      } else if (key === "ENTER") {
        btn.classList.add("enter-key");
        btn.onclick = () => handleKey("Enter");
      } else if (key === "SPACE") {
        btn.classList.add("space-key");
        btn.innerText = "␣"; // Optional: make it look clean
        btn.onclick = () => handleKey(" ");
      } else {
        btn.onclick = () => handleKey(key.toUpperCase());
      }      

      row.appendChild(btn);
    });

    keyboardEl.appendChild(row);
  });
}
createKeyboard(); 

// Keyboard input handlingdocument.addEventListener('keydown', (e) => {
document.addEventListener('keydown', (e) => {
  if (gameOver) return;
  handleKey(e.key);
});

function handleKey(key) {
  if (gameOver) return;

  if (key === 'Enter') {
    submitGuess();
  } else if (key === 'Backspace') {
    removeLetter();
  } else if (/^[a-zA-Z ]$/.test(key)) {
    addLetter(key.toUpperCase());
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
    
      if (target[i] === " ") continue;
    
      setTimeout(() => {
        tile.classList.add("flip");
    
        setTimeout(() => {
          const letter = guessUpper[guessIndex];
    
          if (letter === normalizedTarget[guessIndex]) {
            tile.classList.add("correct");
            markKey(letter, "correct");
            tempTargetArray[guessIndex] = null;
          } else if (tempTargetArray.includes(letter)) {
            tile.classList.add("present");
            markKey(letter, "present");
            tempTargetArray[tempTargetArray.indexOf(letter)] = null;
          } else {
            tile.classList.add("absent");
            markKey(letter, "absent");
          }
    
          guessIndex++;
        }, 250); // during the flip
      }, i * 200); // staggered
    }    
  
    // Second pass: Apply "present" (yellow) and "absent" (gray) after flipping
    setTimeout(() => {
      const letter = guessUpper[guessIndex];
    
      if (letter === normalizedTarget[guessIndex]) {
        tile.classList.add("correct");
        markKey(letter, "correct");
        tempTargetArray[guessIndex] = null;
      } else if (tempTargetArray.includes(letter)) {
        tile.classList.add("present");
        markKey(letter, "present");
        tempTargetArray[tempTargetArray.indexOf(letter)] = null;
      } else {
        tile.classList.add("absent");
        markKey(letter, "absent");
      }
    
      guessIndex++;
    }, 250);
  
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
