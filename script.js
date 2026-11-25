const $ = selector => document.querySelector(selector);
const input = $('#title');
const limit = 6;
const clean = text => text.toUpperCase().replace(/[^A-Z]/g, '');
let movie, words, hints, attempts, finished;
let pool = [];
let revealing = false;
const activeRow = () => $('#board').children[attempts];

function scoreWord(answer, guess) {
  const marks = Array(answer.length).fill('absent');
  const remaining = {};
  for (let i = 0; i < answer.length; i++) {
    if (guess[i] === answer[i]) marks[i] = 'exact';
    else remaining[answer[i]] = (remaining[answer[i]] || 0) + 1;
  }
  for (let i = 0; i < answer.length; i++) {
    if (marks[i] !== 'exact' && remaining[guess[i]] > 0) {
      marks[i] = 'near';
      remaining[guess[i]]--;
    }
  }
  return marks;
}

function partition(letters) {
  let offset = 0;
  return words.map(word => {
    const start = offset;
    offset += clean(word).length;
    return letters.slice(start, offset);
  });
}

function draw(board, letters, scored = false, showHints = true) {
  board.replaceChildren();
  const parts = partition(letters);
  words.forEach((word, w) => {
    if (w) {
      const gap = document.createElement('span');
      gap.className = 'gap';
      gap.setAttribute('aria-hidden', 'true');
      board.append(gap);
    }
    const group = document.createElement('span');
    group.className = 'word';
    const marks = scored ? scoreWord(clean(word), parts[w]) : [];
    let i = 0;
    for (const ch of word) {
      const tile = document.createElement('span');
      if (/[A-Z]/.test(ch)) {
        const hint = showHints && hints[w].includes(i);
        tile.textContent = parts[w][i] || (hint ? ch : '');
        tile.className = 'tile ' + (marks[i] || (hint && !parts[w][i] ? 'hint' : ''));
        const meaning = { exact: 'correct position', near: 'elsewhere in word', absent: 'no match' };
        tile.setAttribute('aria-label', [tile.textContent || 'blank', meaning[marks[i]]].filter(Boolean).join(', '));
        tile.setAttribute('role', 'img');
        i++;
      } else tile.textContent = ch;
      group.append(tile);
    }
    board.append(group);
  });
}

function start() {
  if (!pool.length) pool = movieList.slice();
  const choices = pool.filter(item => item !== movie);
  movie = choices[Math.floor(Math.random() * choices.length)] || pool[0];
  pool.splice(pool.indexOf(movie), 1);
  words = movie.answer.toUpperCase().split(' ');
  hints = words.map(word => {
    const size = clean(word).length;
    return size >= 8 ? [1, size - 2] : size >= 4 ? [1] : [];
  });
  attempts = 0;
  finished = false;
  input.value = '';
  $('#prompt').textContent = movie.prompt;
  $('#lengths').textContent = words.length + (words.length === 1 ? ' word' : ' words') + ' · ' + clean(movie.answer).length + ' letters';
  $('#turn').textContent = 'Guess 1 of 6';
  $('#status').textContent = '';
  $('#again').hidden = true;
  $('form').hidden = false;
  $('#board').replaceChildren();
  for (let n = 0; n < limit; n++) {
    const row = document.createElement('li');
    row.setAttribute('aria-label', 'Guess ' + (n + 1));
    draw(row, '', false, n === 0);
    $('#board').append(row);
  }
}

async function reveal(row, guess) {
  draw(row, guess, true);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const tiles = [...row.querySelectorAll('.tile')];
  const delay = Math.min(200, 1100 / tiles.length);
  await Promise.all(tiles.map((tile, index) => {
    const face = { backgroundColor: '#121213', borderColor: '#565758' };
    const scored = getComputedStyle(tile).backgroundColor;
    const back = { backgroundColor: scored, borderColor: scored };
    return tile.animate([
      { ...face, transform: 'rotateX(0deg)', offset: 0 },
      { ...face, transform: 'rotateX(90deg)', offset: 0.5 },
      { ...back, transform: 'rotateX(-90deg)', offset: 0.5 },
      { ...back, transform: 'rotateX(0deg)', offset: 1 }
    ], { duration: 500, delay: index * delay, fill: 'backwards', easing: 'ease-in-out' }).finished;
  }));
}

input.addEventListener('input', () => {
  if (revealing || finished) return;
  draw(activeRow(), clean(input.value));
  $('#status').textContent = '';
});
$('form').addEventListener('submit', async event => {
  event.preventDefault();
  if (finished || revealing) return;
  const guess = clean(input.value);
  const target = clean(movie.answer);
  if (guess.length !== target.length) {
    $('#status').textContent = 'Enter all ' + target.length + ' letters. Your guess has ' + guess.length + '.';
    return;
  }
  const typedWords = input.value.trim().split(/\s+/).map(clean);
  if (typedWords.length > 1 && typedWords.map(w => w.length).join() !== words.map(w => clean(w).length).join()) {
    $('#status').textContent = 'Match the word lengths shown on the board.';
    return;
  }
  revealing = true;
  input.readOnly = true;
  await reveal(activeRow(), guess);
  input.readOnly = false;
  revealing = false;
  attempts++;
  const win = guess === target;
  finished = win || attempts === limit;
  if (finished) {
    $('#turn').textContent = win ? 'You got it!' : 'That’s a wrap';
    $('#status').textContent = movie.answer + ' · ' + attempts + ' of 6 guesses';
    $('form').hidden = true;
    $('#again').hidden = false;
    $('#again').focus();
  } else {
    input.value = '';
    draw(activeRow(), '');
    $('#turn').textContent = 'Guess ' + (attempts + 1) + ' of 6';
    $('#status').textContent = 'Guess ' + attempts + ' scored.';
    input.focus();
  }
});
$('#help').onclick = () => $('dialog').showModal();
$('#again').onclick = () => { start(); input.focus(); };
start();
