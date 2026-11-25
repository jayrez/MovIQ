const $ = selector => document.querySelector(selector);
const keyboard = $('#keyboard');
let typed = '';
let template = [];
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
      board.lastElementChild.append(gap);
    }
    const group = document.createElement('span');
    group.className = 'word';
    const marks = scored ? scoreWord(clean(word), parts[w]) : [];
    let i = 0;
    for (const ch of word) {
      const tile = document.createElement('span');
      if (/[A-Z]/.test(ch)) {
        const hint = showHints && hints[w].includes(i);
        tile.textContent = (parts[w][i] || '').trim() || (hint ? ch : '');
        tile.className = 'tile ' + (marks[i] || (hint ? 'hint' : ''));
        const meaning = { exact: 'correct position', near: 'elsewhere in word', absent: 'no match' };
        tile.setAttribute('aria-label', [tile.textContent || 'blank', hint ? 'fixed hint' : '', meaning[marks[i]]].filter(Boolean).join(', '));
        tile.setAttribute('role', 'img');
        i++;
      } else tile.textContent = ch;
      group.append(tile);
    }
    board.append(group);
  });
}

const board = $('#board');
const latestPage = () => finished ? attempts - 1 : attempts;
const visiblePage = () => Math.round(board.scrollLeft / board.clientWidth);

function updateNavigation() {
  const page = Math.min(visiblePage(), latestPage());
  $('#history').hidden = !board.classList.contains('paged') || latestPage() === 0;
  $('#previous').disabled = page <= 0;
  $('#next').disabled = page >= latestPage();
  $('#page').textContent = 'Viewing guess ' + (page + 1) + ' of ' + (latestPage() + 1);
}

function showPage(page) {
  if (board.classList.contains('paged')) board.scrollLeft = page * board.clientWidth;
  updateNavigation();
}

function layoutBoard() {
  const first = board.firstElementChild;
  if (!first) return;
  const wrapped = first.lastElementChild.offsetTop !== first.firstElementChild.offsetTop;
  board.classList.toggle('paged', wrapped);
  Array.from(board.children).forEach((row, i) => {
    row.hidden = wrapped && i > latestPage();
  });
  showPage(latestPage());
}

board.addEventListener('scroll', updateNavigation);
$('#previous').onclick = () => showPage(visiblePage() - 1);
$('#next').onclick = () => showPage(visiblePage() + 1);
window.addEventListener('resize', layoutBoard);

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
  template = words.flatMap((word, w) => Array.from(clean(word), (ch, i) =>
    hints[w].includes(i) ? ch : ''
  ));
  attempts = 0;
  finished = false;
  typed = '';
  $('#prompt').textContent = movie.prompt;
  $('#lengths').textContent = words.length + (words.length === 1 ? ' word' : ' words') + ' · ' + clean(movie.answer).length + ' letters';
  $('#turn').textContent = 'Guess 1 of 6';
  $('#status').textContent = '';
  $('#again').hidden = true;
  keyboard.hidden = false;
  keyboard.querySelectorAll('button').forEach(key => delete key.dataset.score);
  $('#board').replaceChildren();
  for (let n = 0; n < limit; n++) {
    const row = document.createElement('li');
    row.setAttribute('aria-label', 'Guess ' + (n + 1));
    draw(row, '', false, n === 0);
    $('#board').append(row);
  }
  layoutBoard();
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

function assembledGuess() {
  let index = 0;
  return template.map(hint => hint || typed[index++] || ' ').join('');
}

function handleKey(key) {
  if (revealing || finished || $('dialog').open) return;
  if (key === 'Enter') return submitGuess();
  if (key === 'Backspace') typed = typed.slice(0, -1);
  else if (/^[A-Z]$/.test(key) && typed.length < template.filter(ch => !ch).length) typed += key;
  else return;
  showPage(latestPage());
  draw(activeRow(), assembledGuess().trimEnd());
  $('#status').textContent = '';
}

for (const keys of ['QWERTYUIOP', 'ASDFGHJKL', ['Enter', ...'ZXCVBNM', 'Backspace']]) {
  const row = document.createElement('div');
  for (const key of keys) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.key = key;
    button.textContent = key === 'Backspace' ? '⌫' : key.toUpperCase();
    button.setAttribute('aria-label', key);
    button.onclick = () => handleKey(key);
    row.append(button);
  }
  keyboard.append(row);
}

document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey || $('dialog').open || finished) return;
  if (event.key === 'Enter' && event.target.closest?.('button') && !keyboard.contains(event.target)) return;
  const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
  if (!/^[A-Z]$/.test(key) && key !== 'Backspace' && key !== 'Enter') return;
  event.preventDefault();
  handleKey(key);
});

async function submitGuess() {
  const guess = assembledGuess();
  const target = clean(movie.answer);
  if (guess.includes(' ')) {
    $('#status').textContent = 'Fill the remaining tiles.';
    return;
  }
  showPage(latestPage());
  revealing = true;
  await reveal(activeRow(), guess);
  const scores = ['absent', 'near', 'exact'];
  for (const tile of activeRow().querySelectorAll('.tile')) {
    const button = keyboard.querySelector('[data-key="' + tile.textContent + '"]');
    const score = scores.find(mark => tile.classList.contains(mark));
    if (scores.indexOf(score) > scores.indexOf(button.dataset.score)) button.dataset.score = score;
  }
  revealing = false;
  attempts++;
  const win = guess === target;
  finished = win || attempts === limit;
  if (finished) {
    $('#turn').textContent = win ? 'You got it!' : 'That’s a wrap';
    $('#status').textContent = movie.answer + ' · ' + attempts + ' of 6 guesses';
    keyboard.hidden = true;
    $('#again').hidden = false;
    $('#again').focus();
  } else {
    typed = '';
    draw(activeRow(), '');
    $('#turn').textContent = 'Guess ' + (attempts + 1) + ' of 6';
    $('#status').textContent = 'Guess ' + attempts + ' scored.';
  }
  layoutBoard();
}
$('#help').onclick = () => $('dialog').showModal();
$('#again').onclick = start;
start();
