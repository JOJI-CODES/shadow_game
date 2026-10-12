const player = document.getElementById("player");
const enemy = document.getElementById("enemy");
const arena = document.getElementById("arena");

const playerHealthBar = document.getElementById("playerHealth");
const enemyHealthBar = document.getElementById("enemyHealth");

const playerNumber = document.getElementById("playerNumber");
const enemyNumber = document.getElementById("enemyNumber");
const message = document.getElementById("message");
const restart = document.getElementById("restart");

let playerHealth = 100;
let enemyHealth = 100;

let playerX = 90;
let enemyX = 0;
let jumping = false;
let gameOver = false;

let lastPlayerAttack = 0;
let lastEnemyAttack = 0;
let enemyBlocking = false;

let jumpTimer;
let enemyBlockTimer;
let messageTimer;

const keys = {};

function resetGame() {
  clearTimeout(jumpTimer);
  clearTimeout(enemyBlockTimer);
  clearTimeout(messageTimer);

  playerHealth = 100;
  enemyHealth = 100;

  playerX = 90;
  enemyX = arena.clientWidth - 110;

  jumping = false;
  gameOver = false;
  enemyBlocking = false;

  lastPlayerAttack = 0;
  lastEnemyAttack = 0;

  Object.keys(keys).forEach(key => delete keys[key]);

  player.className = "fighter player";
  enemy.className = "fighter enemy";

  playerHealthBar.style.width = "100%";
  enemyHealthBar.style.width = "100%";

  playerNumber.textContent = "100";
  enemyNumber.textContent = "100";

  message.textContent = "FIGHT!";
  message.style.color = "white";

  updatePositions();
}

function updatePositions() {
  const maxX = arena.clientWidth - 65;

  playerX = Math.max(0, Math.min(playerX, maxX));
  enemyX = Math.max(0, Math.min(enemyX, maxX));

  player.style.left = playerX + "px";
  enemy.style.left = enemyX + "px";
}

function updateHealth() {
  playerHealthBar.style.width = playerHealth + "%";
  enemyHealthBar.style.width = enemyHealth + "%";

  playerNumber.textContent = playerHealth;
  enemyNumber.textContent = enemyHealth;
}

function showMessage(text, color = "white") {
  message.textContent = text;
  message.style.color = color;
}

function finishGame(text, color) {
  if (gameOver) return;

  gameOver = true;
  jumping = false;

  player.classList.remove("jumping", "blocking");
  enemy.classList.remove("blocking");

  showMessage(text, color);
}

function jump() {
  if (gameOver || jumping) return;

  jumping = true;
  player.classList.add("jumping");

  clearTimeout(jumpTimer);

  jumpTimer = setTimeout(() => {
    jumping = false;
    player.classList.remove("jumping");
  }, 650);
}

function attack(type) {
  if (gameOver) return;

  const now = Date.now();

  if (now - lastPlayerAttack < 350) return;
  lastPlayerAttack = now;

  player.classList.remove("punching", "kicking");
  void player.offsetWidth;

  player.classList.add(
    type === "punch" ? "punching" : "kicking"
  );

  const distance = Math.abs(playerX - enemyX);
  const range = type === "punch" ? 105 : 130;

  if (distance <= range && !enemyBlocking) {
    const damage = type === "punch" ? 10 : 17;

    enemyHealth = Math.max(0, enemyHealth - damage);
    updateHealth();

    enemy.classList.add("hit");

    setTimeout(() => {
      enemy.classList.remove("hit");
    }, 200);

    showMessage(type === "punch" ? "PUNCH!" : "KICK!");

    clearTimeout(messageTimer);

    messageTimer = setTimeout(() => {
      if (!gameOver) showMessage("FIGHT!");
    }, 400);

    if (enemyHealth <= 0) {
      finishGame("YOU WIN! 🏆", "#5dff91");
    }
  }

  setTimeout(() => {
    player.classList.remove("punching", "kicking");
  }, 250);
}

function blockEnemy() {
  if (gameOver) return;

  enemyBlocking = true;
  enemy.classList.add("blocking");

  clearTimeout(enemyBlockTimer);

  enemyBlockTimer = setTimeout(() => {
    enemyBlocking = false;
    enemy.classList.remove("blocking");
  }, 550);
}

function enemyAttack() {
  if (gameOver) return;

  const now = Date.now();
  const distance = Math.abs(enemyX - playerX);

  if (distance > 115 || now - lastEnemyAttack < 900) {
    return;
  }

  lastEnemyAttack = now;

  if (Math.random() < 0.25) {
    blockEnemy();
    return;
  }

  const type = Math.random() < 0.6 ? "punch" : "kick";

  enemy.classList.remove("punching", "kicking");
  enemy.classList.add(
    type === "punch" ? "punching" : "kicking"
  );

  setTimeout(() => {
    if (gameOver) return;

    const currentDistance = Math.abs(enemyX - playerX);

    if (
      currentDistance <= 140 &&
      !jumping &&
      !player.classList.contains("blocking")
    ) {
      const damage = type === "punch" ? 8 : 13;

      playerHealth = Math.max(0, playerHealth - damage);
      updateHealth();

      player.classList.add("hit");

      setTimeout(() => {
        player.classList.remove("hit");
      }, 200);

      if (playerHealth <= 0) {
        finishGame("YOU LOSE! 💀", "#ff5353");
      }
    }

    enemy.classList.remove("punching", "kicking");
  }, 250);
}

function handleKey(key) {
  if (gameOver) return;

  switch (key) {
    case "a":
      playerX -= 22;
      updatePositions();
      break;

    case "d":
      playerX += 22;
      updatePositions();
      break;

    case "w":
      jump();
      break;

    case "j":
      attack("punch");
      break;

    case "k":
      attack("kick");
      break;

    case "l":
      player.classList.add("blocking");
      break;
  }
}

document.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();

  if (["a", "d", "w", "j", "k", "l"].includes(key)) {
    event.preventDefault();
  }

  if (key === "l") {
    handleKey(key);
    return;
  }

  if (!keys[key]) {
    handleKey(key);
  }

  keys[key] = true;
});

document.addEventListener("keyup", event => {
  const key = event.key.toLowerCase();

  keys[key] = false;

  if (key === "l") {
    player.classList.remove("blocking");
  }
});

// Mobile touch controls
document.querySelectorAll("[data-key]").forEach(button => {
  const key = button.dataset.key;

  button.addEventListener("pointerdown", event => {
    event.preventDefault();

    if (key === "l") {
      player.classList.add("blocking");
    } else {
      handleKey(key);
    }
  });

  function releaseButton() {
    if (key === "l") {
      player.classList.remove("blocking");
    }
  }

  button.addEventListener("pointerup", releaseButton);
  button.addEventListener("pointercancel", releaseButton);
  button.addEventListener("lostpointercapture", releaseButton);
});

restart.addEventListener("click", resetGame);

window.addEventListener("resize", updatePositions);

// Enemy follows the player and attacks automatically
setInterval(() => {
  if (gameOver) return;

  const distance = Math.abs(enemyX - playerX);

  if (distance > 90) {
    enemyX += enemyX > playerX ? -7 : 7;
  }

  updatePositions();
  enemyAttack();
}, 250);

resetGame();