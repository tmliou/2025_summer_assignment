const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let player;
let platforms = [];
let enemies = [];
let goal;
let keys = {};

// Player properties
const playerWidth = 32;
const playerHeight = 48;
const playerSpeed = 5;
const jumpForce = 12;
const gravity = 0.5;

// Game state
let gameOver = false;
let gameWon = false;

class Player {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        // Handle horizontal movement
        if (keys['ArrowLeft']) {
            this.velocityX = -playerSpeed;
        } else if (keys['ArrowRight']) {
            this.velocityX = playerSpeed;
        } else {
            this.velocityX = 0;
        }

        // Handle jumping
        if (keys['Space'] && !this.isJumping) {
            this.velocityY = -jumpForce;
            this.isJumping = true;
        }

        // Apply gravity
        this.velocityY += gravity;

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Prevent falling through the bottom of the canvas
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocityY = 0;
            this.isJumping = false;
        }
    }
}

class Platform {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Enemy {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Goal {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function init() {
    // Create player
    player = new Player(50, canvas.height - 100, playerWidth, playerHeight, 'blue');

    // Create platforms
    platforms = [
        new Platform(0, canvas.height - 20, canvas.width, 20, 'green'), // Ground
        new Platform(150, canvas.height - 100, 100, 20, 'green'),
        new Platform(300, canvas.height - 180, 100, 20, 'green'),
        new Platform(450, canvas.height - 260, 100, 20, 'green')
    ];

    // Create enemies
    enemies = [
        new Enemy(200, canvas.height - 40, 30, 20, 'red'),
        new Enemy(400, canvas.height - 200, 30, 20, 'red')
    ];

    // Create goal
    goal = new Goal(canvas.width - 80, canvas.height - 300, 40, 40, 'gold');

    // Keyboard event listeners
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
        }
        keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    gameLoop();
}

function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '48px sans-serif';
        ctx.fillText('Game Over', canvas.width / 2 - 120, canvas.height / 2);
        return;
    }

    if (gameWon) {
        ctx.fillStyle = 'black';
        ctx.font = '48px sans-serif';
        ctx.fillText('You Win!', canvas.width / 2 - 100, canvas.height / 2);
        return;
    }

    requestAnimationFrame(gameLoop);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw player
    player.update();
    player.draw();

    // Draw platforms
    platforms.forEach(platform => {
        platform.draw();
        // Check for collision with platforms
        if (checkCollision(player, platform)) {
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.isJumping = false;
            }
        }
    });

    // Draw enemies
    enemies.forEach(enemy => {
        enemy.draw();
        // Check for collision with enemies
        if (checkCollision(player, enemy)) {
            gameOver = true;
        }
    });

    // Draw goal
    goal.draw();

    // Check for collision with goal
    if (checkCollision(player, goal)) {
        gameWon = true;
    }
}

init();
