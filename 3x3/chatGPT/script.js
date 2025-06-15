const puzzle = document.getElementById('puzzle');
const imageInput = document.getElementById('imageInput');
const message = document.getElementById('message');
let tiles = [];
let emptyIndex = 8;
let imageSrc = null;

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    imageSrc = reader.result;
    initializePuzzle();
  };
  reader.readAsDataURL(file);
});

function initializePuzzle() {
  puzzle.innerHTML = '';
  tiles = Array.from({ length: 8 }, (_, i) => i);
  do {
    shuffleArray(tiles);
  } while (!isSolvable(tiles));
  tiles.push(null); // empty tile

  tiles.forEach((num, idx) => {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    if (num === null) {
      tile.classList.add('empty');
      emptyIndex = idx;
    } else {
      const x = num % 3;
      const y = Math.floor(num / 3);
      tile.style.backgroundImage = `url(${imageSrc})`;
      tile.style.backgroundPosition = `-${x * 100}px -${y * 100}px`;
    }
    tile.addEventListener('click', () => moveTile(idx));
    puzzle.appendChild(tile);
  });
  message.style.display = 'none';
}

function moveTile(index) {
  const validMoves = [ -1, 1, -3, 3 ]; // 左右上下
  const emptyX = emptyIndex % 3;
  const emptyY = Math.floor(emptyIndex / 3);

  for (let move of validMoves) {
    const newIndex = emptyIndex + move;
    if (newIndex < 0 || newIndex > 8) continue;
    const x = newIndex % 3;
    const y = Math.floor(newIndex / 3);
    if (Math.abs(x - emptyX) + Math.abs(y - emptyY) === 1 && index === newIndex) {
      swapTiles(index, emptyIndex);
      emptyIndex = index;
      checkClear();
      break;
    }
  }
}

function swapTiles(i, j) {
  const children = puzzle.children;
  [children[i].style.backgroundImage, children[j].style.backgroundImage] =
    [children[j].style.backgroundImage, children[i].style.backgroundImage];
  [children[i].style.backgroundPosition, children[j].style.backgroundPosition] =
    [children[j].style.backgroundPosition, children[i].style.backgroundPosition];

  children[i].classList.toggle('empty');
  children[j].classList.toggle('empty');
}

function checkClear() {
  const children = puzzle.children;
  for (let i = 0; i < 8; i++) {
    const x = i % 3;
    const y = Math.floor(i / 3);
    const bgPos = `-${x * 100}px -${y * 100}px`;
    if (children[i].style.backgroundPosition !== bgPos) return;
  }
  message.style.display = 'block';
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function isSolvable(array) {
  let invCount = 0;
  for (let i = 0; i < array.length; i++) {
    for (let j = i + 1; j < array.length; j++) {
      if (array[i] > array[j]) invCount++;
    }
  }
  return invCount % 2 === 0;
}
