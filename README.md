# 🎬 MovIQ

**MovIQ** is a Wordle-style guessing game where players identify a movie title based on a badly explained plot. Built using vanilla JavaScript, HTML, and CSS — no frameworks, no backend.

---

## 🕹️ How to Play

- You have **6 tries** to guess the correct movie title.
- Each guess must match the number of tiles shown.
- After each guess, tiles will flip and reveal:
  - 🟩 **Green**: Correct letter, correct position  
  - 🟨 **Yellow**: Correct letter, wrong position  
  - ⬜ **Gray**: Letter is not in the title
- **Spaces are displayed and filled in automatically.**
- **Apostrophes and hyphens are ignored** during input and do not affect gameplay.

---

## ✨ Features

- Supports **multi-word movie titles**
- Smooth tile animations (flip, fade, bounce)
- Virtual keyboard with color feedback
- Handles special characters cleanly
- Random movie mode (daily mode planned)

---

## 🛠️ Tech Stack

- **HTML & CSS** – Layout and styling
- **Vanilla JavaScript** – Game logic and animations
- **CloudFlare Pages** – Static hosting

---

## 📁 File Structure
- /index.html # Main HTML structure
- /style.css # Styles and animations
- /script.js # Game logic and input
- /data.js # List of possible movie titles and answers

---

## 🚀 Deployment

MovIQ is hosted on **CloudFlare Pages**.  
To run locally, just clone the repo and open `index.html` in your browser.

---

## 📄 License

This project is **not open-source**. All rights reserved.  
You may not copy, distribute, or reuse any part of the codebase without explicit permission from the creator.

---

> Created with ❤️ as a passion project inspired by Wordle and bad movie summaries.


