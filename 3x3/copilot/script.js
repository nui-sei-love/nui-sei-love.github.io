let imageSrc = "";
let emptyIndex = 8;
let tiles = [];

document.getElementById('imageInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        imageSrc = URL.createObjectURL(file);
        document.getElementById('original-image').src = imageSrc;
        createPuzzle(imageSrc);
    }
});

function createPuzzle(imageSrc) {
    const container = document.getElementById('puzzle-container');
    container.innerHTML = "";
    tiles = [];

    for (let i = 0; i < 9; i++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.style.backgroundImage = `url(${imageSrc})`;
        tile.style.backgroundPosition = `-${(i % 3) * 100}px -${Math.floor(i / 3) * 100}px`;
        tile.dataset.index = i;
        tile.addEventListener("click", () => moveTile(i));

        if (i === emptyIndex) {
            tile.id = "empty";
        }

        tiles.push(tile);
        container.appendChild(tile);
    }
}

function moveTile(index) {
    const emptyTile = document.getElementById('empty');
    const emptyPos = parseInt(emptyTile.dataset.index);
    const validMoves = [emptyPos - 3, emptyPos + 3, emptyPos - 1, emptyPos + 1];

    if (validMoves.includes(index)) {
        tiles[emptyPos].style.backgroundImage = tiles[index].style.backgroundImage;
        tiles[emptyPos].style.backgroundPosition = tiles[index].style.backgroundPosition;
        tiles[index].style.backgroundImage = "none";
        tiles[index].id = "empty";
        tiles[emptyPos].id = "";
        emptyIndex = index;
    }

    checkWin();
}

function shuffleTiles() {
    let solvable = false;
    let shuffledIndices;

    while (!solvable) {
        shuffledIndices = [...Array(9).keys()].sort(() => Math.random() - 0.5);
        solvable = isSolvable(shuffledIndices);
    }

    emptyIndex = shuffledIndices.indexOf(8);

    tiles.forEach((tile, i) => {
        tile.style.backgroundImage = shuffledIndices[i] === 8 ? "none" : `url(${imageSrc})`;
        tile.style.backgroundPosition = `-${(shuffledIndices[i] % 3) * 100}px -${Math.floor(shuffledIndices[i] / 3) * 100}px`;
        tile.id = shuffledIndices[i] === 8 ? "empty" : "";
        tile.dataset.index = shuffledIndices[i];
    });
}

function isSolvable(arr) {
    let inversions = 0;

    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] !== 8 && arr[j] !== 8 && arr[i] > arr[j]) {
                inversions++;
            }
        }
    }

    return inversions % 2 === 0;
}

function checkWin() {
    if (tiles.every((tile, i) => parseInt(tile.dataset.index) === i)) {
        setTimeout(() => {
            alert("おめでとう！クリアしました！");
            document.getElementById("original-image").style.display = "block";
        }, 200);
    }
}