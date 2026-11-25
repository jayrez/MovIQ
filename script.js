const $ = selector => document.querySelector(selector);
const input = $('#title');
const limit = 6;
const clean = text => text.toUpperCase().replace(/[^A-Z]/g, '');
let movie, words, hints, attempts, finished;
let pool = [];

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

function draw(board, letters, scored = false) {
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
        const hint = hints[w].includes(i);
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
  $('#history ol').replaceChildren();
  $('#history').hidden = $('#again').hidden = true;
  $('form').hidden = false;
  draw($('#board'), '');
}

input.addEventListener('input', () => {
  draw($('#board'), clean(input.value));
  $('#status').textContent = '';
});
$('form').addEventListener('submit', event => {
  event.preventDefault();
  if (finished) return;
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
  attempts++;
  const win = guess === target;
  finished = win || attempts === limit;
  if (finished) {
    draw($('#board'), guess, true);
    $('#turn').textContent = win ? 'You got it!' : 'That’s a wrap';
    $('#status').textContent = movie.answer + ' · ' + attempts + ' of 6 guesses';
    $('form').hidden = true;
    $('#again').hidden = false;
    $('#again').focus();
  } else {
    const row = document.createElement('li');
    draw(row, guess, true);
    row.setAttribute('aria-label', 'Guess ' + attempts);
    $('#history ol').prepend(row);
    $('#history').hidden = false;
    input.value = '';
    draw($('#board'), '');
    $('#turn').textContent = 'Guess ' + (attempts + 1) + ' of 6';
    $('#status').textContent = 'Guess ' + attempts + ' scored below.';
    input.focus();
  }
});
$('#help').onclick = () => $('dialog').showModal();
$('#again').onclick = () => { start(); input.focus(); };
start();
