// script.js

const promptEl = document.getElementById("prompt");
const gridEl = document.getElementById("guess-grid");
const carouselEl = gridEl.querySelector(".carousel");
const carouselNav = document.getElementById("carousel-nav");
const keyboardEl = document.getElementById("keyboard");
const messageEl = document.getElementById("message");
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');

const MAX_GUESSES = 4;
const target = gameData.answer.toUpperCase().replace(/'/g, ""); // Remove apostrophes completely
const normalizedTarget = target.replace(/[^A-Z ]/g, ""); // keep spaces // Remove spaces and special characters for input checking

const prompt = gameData.prompt;

let currentGuess = '';
let guesses = [];
let gameOver = false;
let currentSlide = 0;

// Add touch/drag handling variables
let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID = 0;
let startTime = 0;

// Show the prompt
promptEl.textContent = `🧠 ${prompt}`;

// Function to split movie title into logical rows
function splitIntoRows(title) {
    const words = title.split(' ');
    const rows = [];
    let currentRow = [];
    let currentLength = 0;
    
    // Dynamically calculate max row length based on title length
    let MAX_ROW_LENGTH = 15;
    if (title.length <= 10) {
        MAX_ROW_LENGTH = title.length; // Short titles stay on one row
    } else if (title.length <= 20) {
        MAX_ROW_LENGTH = Math.ceil(title.length / 1.5); // Medium titles get 1-2 rows
    } else {
        // For longer titles, try to balance row lengths
        MAX_ROW_LENGTH = Math.ceil(title.length / Math.ceil(title.length / 15));
    }

    // First pass: group words into rows
    words.forEach((word, index) => {
        // If this is the first word of the title, always start a new row with it
        if (currentRow.length === 0) {
            currentRow.push(word);
            currentLength = word.length;
            return;
        }

        const spaceNeeded = currentLength + 1 + word.length;
        
        // Special case: if this is the last word and it would only slightly exceed max length, keep it
        if (index === words.length - 1 && spaceNeeded <= MAX_ROW_LENGTH + 3) {
            currentRow.push(word);
            return;
        }

        // Normal case: check if word fits in current row
        if (spaceNeeded <= MAX_ROW_LENGTH) {
            currentRow.push(word);
            currentLength = spaceNeeded;
        } else {
            rows.push(currentRow.join(' '));
            currentRow = [word];
            currentLength = word.length;
        }
    });

    // Don't forget to add the last row
    if (currentRow.length > 0) {
        rows.push(currentRow.join(' '));
    }

    // Second pass: balance row lengths if needed
    if (rows.length > 1) {
        const avgLength = Math.ceil(title.length / rows.length);
        const lastRow = rows[rows.length - 1];
        
        // If the last row is too short compared to others, try to rebalance
        if (lastRow.length < avgLength * 0.7) {
            const words = title.split(' ');
            rows.length = 0;
            currentRow = [];
            currentLength = 0;
            
            // Recalculate with slightly shorter max length to better distribute words
            MAX_ROW_LENGTH = Math.max(avgLength, Math.ceil(title.length / (Math.ceil(title.length / (avgLength - 2)))));
            
            words.forEach(word => {
                if (currentLength + word.length + (currentLength > 0 ? 1 : 0) <= MAX_ROW_LENGTH) {
                    currentRow.push(word);
                    currentLength += word.length + (currentLength > 0 ? 1 : 0);
                } else {
                    rows.push(currentRow.join(' '));
                    currentRow = [word];
                    currentLength = word.length;
                }
            });
            
            if (currentRow.length > 0) {
                rows.push(currentRow.join(' '));
            }
        }
    }

    return rows;
}

// Update createGrid to handle dynamic tile sizes
function createGrid() {
    carouselEl.innerHTML = "";
    carouselNav.innerHTML = "";
  
    let cleanAnswer = gameData.answer.replace(/'/g, "");
    const titleRows = splitIntoRows(cleanAnswer);
    
    // Calculate tile size based on the longest row
    const longestRowLength = Math.max(...titleRows.map(row => row.length));
    const tileSize = Math.min(40, Math.max(30, Math.floor(500 / longestRowLength)));
    
    // Update tile size CSS variable
    document.documentElement.style.setProperty('--tile-size', `${tileSize}px`);
    
    for (let guessIndex = 0; guessIndex < MAX_GUESSES; guessIndex++) {
        const guessContainer = document.createElement("div");
        guessContainer.classList.add("guess-container");
        
        if (guessIndex === 0) {
            guessContainer.classList.add("current");
        } else {
            guessContainer.classList.add("next");
            guessContainer.style.transform = `translateY(${100}%)`;
        }

        titleRows.forEach((rowText, rowIndex) => {
            const row = document.createElement("div");
            row.classList.add("grid-row");
            
            for (let charIndex = 0; charIndex < rowText.length; charIndex++) {
                const tile = document.createElement("div");
                tile.classList.add("tile");
                
                if (rowText[charIndex] === " ") {
                    tile.classList.add("space-tile");
                }
                
                row.appendChild(tile);
            }
            
            guessContainer.appendChild(row);
        });

        carouselEl.appendChild(guessContainer);

        const dot = document.createElement("div");
        dot.classList.add("carousel-dot");
        if (guessIndex === 0) dot.classList.add("active");
        dot.addEventListener("click", () => goToSlide(guessIndex));
        carouselNav.appendChild(dot);
    }
}

function goToSlide(index) {
    if (index < 0 || index >= MAX_GUESSES || index > guesses.length) return;
    
    const rows = Array.from(carouselEl.children);
    const dots = Array.from(carouselNav.children);
    
    // Cancel any existing animation
    cancelAnimationFrame(animationID);
    
    // Update transform for horizontal sliding
    carouselEl.style.transform = `translateX(-${index * 100}%)`;
    
    // Update row classes
    rows.forEach((row, i) => {
        row.classList.remove("previous", "current", "next");
        if (i < index) row.classList.add("previous");
        else if (i === index) row.classList.add("current");
        else row.classList.add("next");
    });
    
    // Update navigation dots
    dots.forEach((dot, i) => {
        dot.classList.remove("active");
        if (i === index) dot.classList.add("active");
        if (i < index) dot.classList.add("completed");
        else dot.classList.remove("completed");
    });
    
    currentSlide = index;
    
    // Update button states
    prevButton.disabled = index === 0;
    nextButton.disabled = index >= guesses.length;
}

// Add button event listeners
prevButton.addEventListener('click', () => {
    if (currentSlide > 0) {
        goToSlide(currentSlide - 1);
    }
});

nextButton.addEventListener('click', () => {
    if (currentSlide < guesses.length) {
        goToSlide(currentSlide + 1);
    }
});

// Initialize the grid
createGrid();

// Create on-screen keyboard
const keyboardLayout = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"]
];

function createKeyboard() {
  keyboardEl.innerHTML = "";

  keyboardLayout.forEach((rowKeys, rowIndex) => {
    const row = document.createElement("div");
    row.classList.add("keyboard-row");
    
    if (rowIndex === 1) {
      const leftPad = document.createElement("div");
      leftPad.style.flex = "0.5";
      row.appendChild(leftPad);
    }

    rowKeys.forEach(key => {
      const btn = document.createElement("button");
      btn.className = "key";
      
      if (key === "⌫") {
        btn.classList.add("backspace-key");
        btn.innerHTML = `<svg width="24" height="18" viewBox="0 0 24 18" fill="none">
          <path d="M8 4L4 9L8 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M4 9H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
        btn.onclick = () => handleKey("Backspace");
      } else if (key === "ENTER") {
        btn.classList.add("enter-key");
        btn.innerText = "enter";
        btn.onclick = () => handleKey("Enter");
      } else {
        btn.innerText = key;
        // Only allow clicking if we haven't filled all tiles
        btn.onclick = () => {
          if (currentGuess.length < target.length) {
            handleKey(key);
          }
        };
      }      

      row.appendChild(btn);
    });

    if (rowIndex === 1) {
      const rightPad = document.createElement("div");
      rightPad.style.flex = "0.5";
      row.appendChild(rightPad);
    }

    keyboardEl.appendChild(row);
  });

  // Add space bar row
  const spaceRow = document.createElement("div");
  spaceRow.classList.add("keyboard-row", "space-row");
  
  const spaceBtn = document.createElement("button");
  spaceBtn.className = "key space-key";
  spaceBtn.innerText = "space";
  // Only allow space if we haven't filled all tiles
  spaceBtn.onclick = () => {
    if (currentGuess.length < target.length) {
      handleKey(" ");
    }
  };
  
  spaceRow.appendChild(spaceBtn);
  keyboardEl.appendChild(spaceRow);
}
createKeyboard(); 

// Keyboard input handling
document.addEventListener('keydown', (e) => {
  // Only process letter keys if we haven't filled all tiles
  if (currentGuess.length >= target.length && /^[a-zA-Z ]$/.test(e.key)) {
    e.preventDefault();
    return;
  }
  handleKey(e.key);
});

function handleKey(key) {
  if (gameOver) return;

  if (key === 'Enter') {
    submitGuess();
  } else if (key === 'Backspace') {
    removeLetter();
  } else if (/^[a-zA-Z ]$/.test(key)) {
    // If we're at or past the limit, reset to the correct length
    if (currentGuess.length >= target.length) {
      currentGuess = currentGuess.slice(0, target.length);
      updateGrid();
      return;
    }
    
    currentGuess += key.toUpperCase();
    updateGrid();
  }
}

function removeLetter() {
  if (currentGuess.length > 0) {
    currentGuess = currentGuess.slice(0, -1);
    updateGrid();
  }
}

function updateGrid() {
    const guessIndex = guesses.length;
    const guessContainer = carouselEl.children[guessIndex];
    if (!guessContainer) return;

    const titleRows = splitIntoRows(target);
    let currentGuessPos = 0;

    titleRows.forEach((rowText, rowIndex) => {
        const row = guessContainer.children[rowIndex];
        if (!row) return;

        for (let i = 0; i < rowText.length; i++) {
            const tile = row.children[i];
            if (!tile) continue;

            if (rowText[i] === " ") {
                tile.textContent = "";
                continue;
            }

            // Only update tile if we haven't exceeded the current guess length
            if (currentGuessPos < currentGuess.length) {
                tile.textContent = currentGuess[currentGuessPos];
                if (currentGuessPos === currentGuess.length - 1) {
                    tile.classList.add("bounce");
                    setTimeout(() => tile.classList.remove("bounce"), 150);
                }
            } else {
                tile.textContent = "";
            }
            
            if (rowText[i] !== " ") currentGuessPos++;
        }
    });
}

function submitGuess() {
  const guessIndex = guesses.length;
  const guessContainer = carouselEl.children[guessIndex];
  if (!guessContainer) return;

  // Get the target answer without apostrophes
  const targetAnswer = gameData.answer.toUpperCase().replace(/'/g, "");
  const guessUpper = currentGuess.toUpperCase();
  
  // Get all tiles in order
  const allTiles = [];
  const allTargetChars = [];
  
  const titleRows = splitIntoRows(targetAnswer);
  titleRows.forEach((rowText, rowIndex) => {
    const row = guessContainer.children[rowIndex];
    if (!row) return;
    
    for (let i = 0; i < rowText.length; i++) {
      if (rowText[i] === " ") continue;
      const tile = row.children[i];
      if (tile) {
        allTiles.push(tile);
        allTargetChars.push(rowText[i]);
      }
    }
  });
  
  // Create arrays for checking
  const guessChars = guessUpper.split('');
  const targetChars = [...allTargetChars];
  
  // Mark correct letters first
  for (let i = 0; i < allTiles.length; i++) {
    if (i >= guessChars.length) break;
    
    if (guessChars[i] === targetChars[i]) {
      setTimeout(() => {
        allTiles[i].classList.add("correct");
        allTiles[i].classList.add("flip");
        markKey(guessChars[i], "correct");
      }, i * 200);
      
      // Mark as used
      guessChars[i] = null;
      targetChars[i] = null;
    }
  }
  
  // Then mark present/absent letters
  for (let i = 0; i < allTiles.length; i++) {
    if (i >= guessChars.length) break;
    if (guessChars[i] === null) continue; // Skip already marked correct
    
    setTimeout(() => {
      // Check if letter exists elsewhere in target
      const targetIndex = targetChars.findIndex(char => char === guessChars[i]);
      
      if (targetIndex !== -1) {
        allTiles[i].classList.add("present");
        markKey(guessChars[i], "present");
        targetChars[targetIndex] = null; // Mark as used
      } else {
        allTiles[i].classList.add("absent");
        markKey(guessChars[i], "absent");
      }
      
      allTiles[i].classList.add("flip");
      
      // Move to next slide after last tile is flipped
      if (i === allTiles.length - 1) {
        setTimeout(() => {
          goToSlide(guessIndex + 1);
        }, 250);
      }
    }, i * 200);
  }
  
  guesses.push(currentGuess);
  
  // Check for win
  const isCorrect = guessUpper === targetAnswer;
  if (isCorrect) {
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

