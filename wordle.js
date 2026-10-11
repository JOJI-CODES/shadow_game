const words = [
    "APPLE", "GRAPE", "CHAIR", "TABLE",
    "PLANE", "CLOUD", "TRAIN", "BRAVE",
    "STONE", "PIANO", "QUEEN", "TIGER",
    "BRAIN", "MOUSE", "LIGHT", "WATER"
];

let target = "";
let attempts = 0;
let gameOver = false;

const board = document.getElementById("board");
const message = document.getElementById("message");
const tries = document.getElementById("tries");
const input = document.getElementById("guess");

function newGame() {
    target = words[Math.floor(Math.random() * words.length)];
    attempts = 0;
    gameOver = false;

    board.innerHTML = "";
    message.textContent = "";
    tries.textContent = "6 attempts remaining";

    input.value = "";
    input.disabled = false;

    for (let i = 0; i < 30; i++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        board.appendChild(tile);
    }

    input.focus();
}

function checkGuess() {
    if (gameOver) return;

    const guess = input.value.trim().toUpperCase();

    if (!/^[A-Z]{5}$/.test(guess)) {
        message.textContent = "Enter exactly 5 letters!";
        return;
    }

    const start = attempts * 5;
    const tiles = board.children;

    const result = Array(5).fill("absent");
    const remaining = target.split("");

    // Correct letters in the correct position
    for (let i = 0; i < 5; i++) {
        if (guess[i] === target[i]) {
            result[i] = "correct";
            remaining[i] = null;
        }
    }

    // Correct letters in the wrong position
    for (let i = 0; i < 5; i++) {
        if (result[i] === "correct") continue;

        const index = remaining.indexOf(guess[i]);

        if (index !== -1) {
            result[i] = "present";
            remaining[index] = null;
        }
    }

    for (let i = 0; i < 5; i++) {
        tiles[start + i].textContent = guess[i];
        tiles[start + i].classList.add(result[i]);
    }

    attempts++;
    tries.textContent = `${6 - attempts} attempts remaining`;

    if (guess === target) {
        message.textContent = "🎉 You won!";
        gameOver = true;
    } else if (attempts === 6) {
        message.textContent = `Game over! Word: ${target}`;
        gameOver = true;
    } else {
        message.textContent = "Try again!";
    }

    if (gameOver) {
        input.disabled = true;
    } else {
        input.value = "";
        input.focus();
    }
}

document.getElementById("submit")
    .addEventListener("click", checkGuess);

input.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        checkGuess();
    }
});

document.getElementById("newGame")
    .addEventListener("click", newGame);

newGame();