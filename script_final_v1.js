const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let player;
let platforms = [];
let enemies = [];
let goal;
let keys = {};
let camera;

// World properties
const worldWidth = canvas.width * 3;
const worldHeight = canvas.height;

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
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
    }

    draw() {
        // Body
        ctx.fillStyle = 'orange';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Head
        ctx.fillStyle = '#ff9900';
        ctx.fillRect(this.x, this.y - 10, this.width, 10);

        // Ears
        ctx.fillStyle = '#ff9900';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 10);
        ctx.lineTo(this.x + 5, this.y - 20);
        ctx.lineTo(this.x + 10, this.y - 10);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.x + this.width - 10, this.y - 10);
        ctx.lineTo(this.x + this.width - 5, this.y - 20);
        ctx.lineTo(this.x + this.width, this.y - 10);
        ctx.fill();

        // Tail
        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.moveTo(this.x - 10, this.y + this.height - 10);
        ctx.lineTo(this.x - 20, this.y + this.height - 20);
        ctx.lineTo(this.x - 10, this.y + this.height);
        ctx.fill();
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
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.startX = x;
        this.moveRange = width * 5;
        this.direction = 1;
    }

    draw() {
        // Body
        ctx.fillStyle = 'pink';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Snout
        ctx.fillStyle = '#ffc0cb';
        ctx.fillRect(this.x + this.width, this.y + this.height / 4, 10, this.height / 2);
    }

    update() {
        this.x += this.direction;
        if (this.x > this.startX + this.moveRange || this.x < this.startX) {
            this.direction *= -1;
        }
    }
}

class Goal {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw() {
        // Door
        ctx.fillStyle = 'brown';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Doorknob
        ctx.fillStyle = 'gold';
        ctx.beginPath();
        ctx.arc(this.x + this.width - 10, this.y + this.height / 2, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Camera {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    update(player) {
        this.x = player.x - canvas.width / 2;
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x > worldWidth - canvas.width) {
            this.x = worldWidth - canvas.width;
        }
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
    player = new Player(50, canvas.height - 100, playerWidth, playerHeight);

    // Create platforms
    platforms = [
        new Platform(0, canvas.height - 20, worldWidth, 20, 'green'), // Ground
        new Platform(150, canvas.height - 100, 100, 20, 'green'),
        new Platform(300, canvas.height - 180, 100, 20, 'green'),
        new Platform(450, canvas.height - 260, 100, 20, 'green'),
        new Platform(600, canvas.height - 100, 100, 20, 'green'),
        new Platform(750, canvas.height - 180, 100, 20, 'green'),
        new Platform(900, canvas.height - 260, 100, 20, 'green'),
        new Platform(1050, canvas.height - 100, 100, 20, 'green'),
        new Platform(1200, canvas.height - 180, 100, 20, 'green'),
        new Platform(1350, canvas.height - 260, 100, 20, 'green'),
        new Platform(1500, canvas.height - 100, 100, 20, 'green'),
        new Platform(1650, canvas.height - 180, 100, 20, 'green'),
        new Platform(1800, canvas.height - 260, 100, 20, 'green'),
        new Platform(1950, canvas.height - 100, 100, 20, 'green'),
        new Platform(2100, canvas.height - 180, 100, 20, 'green'),
        new Platform(2250, canvas.height - 260, 100, 20, 'green')
    ];

    // Create enemies
    enemies = [
        new Enemy(200, canvas.height - 40, 30, 20),
        new Enemy(400, canvas.height - 200, 30, 20),
        new Enemy(800, canvas.height - 40, 30, 20),
        new Enemy(1200, canvas.height - 200, 30, 20),
        new Enemy(1600, canvas.height - 40, 30, 20),
        new Enemy(2000, canvas.height - 200, 30, 20)
    ];

    // Create goal
    goal = new Goal(worldWidth - 80, canvas.height - 80, 40, 60);

    // Create camera
    camera = new Camera(0, 0);

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

    // Update camera
    camera.update(player);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Translate canvas to camera position
    ctx.save();
    ctx.translate(-camera.x, 0);

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

    // Update and draw enemies
    enemies.forEach(enemy => {
        enemy.update();
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

    ctx.restore();
}

init();