const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let player;
let platforms = [];
let enemies = [];
let goal;
let keys = {};
let camera;
let particles = [];
let clouds = [];
let birds = [];

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
let currentLevel = 0;

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
    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.startX = x;
        this.moveRange = width * 5;
        this.direction = 1;
    }

    draw() {
        switch (this.type) {
            case 'pig':
                this.drawPig();
                break;
            case 'bird':
                this.drawBird();
                break;
            case 'snake':
                this.drawSnake();
                break;
            case 'fish':
                this.drawFish();
                break;
            default:
                ctx.fillStyle = 'red';
                ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    drawPig() {
        // Body
        ctx.fillStyle = 'pink';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Snout
        ctx.fillStyle = '#ffc0cb';
        ctx.fillRect(this.x + this.width, this.y + this.height / 4, 10, this.height / 2);
    }

    drawBird() {
        // Body
        ctx.fillStyle = '#87CEEB'; // SkyBlue
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Beak
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width + 10, this.y + this.height / 2 - 5);
        ctx.lineTo(this.x + this.width + 10, this.y + this.height / 2 + 5);
        ctx.fill();
    }

    drawSnake() {
        // Body
        ctx.fillStyle = '#32CD32'; // LimeGreen
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + this.width - 5, this.y + 5, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawFish() {
        // Body
        ctx.fillStyle = '#1E90FF'; // DodgerBlue
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.fillStyle = '#1E90FF';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height / 2);
        ctx.lineTo(this.x - 10, this.y);
        ctx.lineTo(this.x - 10, this.y + this.height);
        ctx.fill();
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

class Particle {
    constructor(x, y, size, speed, color, type) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.color = color;
        this.type = type;
    }

    draw() {
        ctx.fillStyle = this.color;
        if (this.type === 'cherryBlossom') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'leaf') {
            ctx.fillRect(this.x, this.y, this.size, this.size * 1.5);
        } else if (this.type === 'snow') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'rain') {
            ctx.fillRect(this.x, this.y, this.size / 2, this.size * 2);
        } else if (this.type === 'star') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }

    update() {
        this.y += this.speed;
        if (this.type === 'leaf') {
            this.x += Math.sin(this.y * 0.05) * 0.5; // Add some horizontal sway
        }
        if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * canvas.width;
        }
    }
}

class Cloud {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    draw() {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 4, 0, Math.PI * 2);
        ctx.arc(this.x + this.width * 0.4, this.y, this.width / 3, 0, Math.PI * 2);
        ctx.arc(this.x + this.width * 0.7, this.y, this.width / 5, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.x += this.speed;
        if (this.x > worldWidth) {
            this.x = -this.width;
        }
    }
}

class Bird {
    constructor(x, y, size, speed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
    }

    draw() {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.size, this.y - this.size);
        ctx.lineTo(this.x + this.size * 2, this.y);
        ctx.stroke();
    }

    update() {
        this.x += this.speed;
        if (this.x > worldWidth) {
            this.x = -this.size * 2;
        }
    }
}

const levels = [
    // Level 0: Spring
    {
        theme: { backgroundColor: '#90EE90', particles: 'cherryBlossom' }, // LightGreen
        platforms: [
            new Platform(0, canvas.height - 20, worldWidth, 20, '#228B22'), // ForestGreen
            new Platform(150, canvas.height - 100, 100, 20, '#228B22'),
            new Platform(300, canvas.height - 180, 100, 20, '#228B22'),
            new Platform(450, canvas.height - 260, 100, 20, '#228B22'),
            new Platform(600, canvas.height - 100, 100, 20, '#228B22'),
            new Platform(750, canvas.height - 180, 100, 20, '#228B22'),
            new Platform(900, canvas.height - 260, 100, 20, '#228B22'),
            new Platform(1050, canvas.height - 100, 100, 20, '#228B22'),
            new Platform(1200, canvas.height - 180, 100, 20, '#228B22'),
            new Platform(1350, canvas.height - 260, 100, 20, '#228B22'),
            new Platform(1500, canvas.height - 100, 100, 20, '#228B22'),
            new Platform(1650, canvas.height - 180, 100, 20, '#228B22'),
            new Platform(1800, canvas.height - 260, 100, 20, '#228B22'),
            new Platform(1950, canvas.height - 100, 100, 20, '#228B22'),
            new Platform(2100, canvas.height - 180, 100, 20, '#228B22'),
            new Platform(2250, canvas.height - 260, 100, 20, '#228B22')
        ],
        enemies: [
            new Enemy(200, canvas.height - 40, 30, 20, 'bird'),
            new Enemy(800, canvas.height - 40, 30, 20, 'bird'),
            new Enemy(1600, canvas.height - 40, 30, 20, 'bird')
        ],
        goal: new Goal(worldWidth - 80, canvas.height - 80, 40, 60)
    },
    // Level 1: Summer
    {
        theme: { backgroundColor: '#ADD8E6', sun: true, clouds: true, birds: true }, // LightBlue
        platforms: [
            new Platform(0, canvas.height - 20, worldWidth, 20, '#FFD700'), // Gold
            new Platform(200, canvas.height - 120, 120, 20, '#FFD700'),
            new Platform(400, canvas.height - 220, 120, 20, '#FFD700'),
            new Platform(600, canvas.height - 120, 120, 20, '#FFD700'),
            new Platform(800, canvas.height - 220, 120, 20, '#FFD700'),
            new Platform(1000, canvas.height - 120, 120, 20, '#FFD700'),
            new Platform(1200, canvas.height - 220, 120, 20, '#FFD700'),
            new Platform(1400, canvas.height - 120, 120, 20, '#FFD700'),
            new Platform(1600, canvas.height - 220, 120, 20, '#FFD700'),
            new Platform(1800, canvas.height - 120, 120, 20, '#FFD700'),
            new Platform(2000, canvas.height - 220, 120, 20, '#FFD700'),
            new Platform(2200, canvas.height - 120, 120, 20, '#FFD700')
        ],
        enemies: [
            new Enemy(300, canvas.height - 40, 40, 20, 'snake'),
            new Enemy(900, canvas.height - 40, 40, 20, 'snake'),
            new Enemy(1700, canvas.height - 40, 40, 20, 'snake')
        ],
        goal: new Goal(worldWidth - 100, canvas.height - 80, 40, 60)
    },
    // Level 2: Fall
    {
        theme: { backgroundColor: '#D2B48C', particles: 'leaf' }, // Tan
        platforms: [
            new Platform(0, canvas.height - 20, worldWidth, 20, '#A0522D'), // Sienna
            new Platform(100, canvas.height - 80, 80, 20, '#A0522D'),
            new Platform(250, canvas.height - 160, 80, 20, '#A0522D'),
            new Platform(400, canvas.height - 240, 80, 20, '#A0522D'),
            new Platform(550, canvas.height - 160, 80, 20, '#A0522D'),
            new Platform(700, canvas.height - 80, 80, 20, '#A0522D'),
            new Platform(850, canvas.height - 160, 80, 20, '#A0522D'),
            new Platform(1000, canvas.height - 240, 80, 20, '#A0522D'),
            new Platform(1150, canvas.height - 160, 80, 20, '#A0522D'),
            new Platform(1300, canvas.height - 80, 80, 20, '#A0522D'),
            new Platform(1450, canvas.height - 160, 80, 20, '#A0522D'),
            new Platform(1600, canvas.height - 240, 80, 20, '#A0522D'),
            new Platform(1750, canvas.height - 160, 80, 20, '#A0522D'),
            new Platform(1900, canvas.height - 80, 80, 20, '#A0522D'),
            new Platform(2050, canvas.height - 160, 80, 20, '#A0522D'),
            new Platform(2200, canvas.height - 240, 80, 20, '#A0522D')
        ],
        enemies: [
            new Enemy(500, canvas.height - 40, 35, 25, 'pig'),
            new Enemy(1100, canvas.height - 40, 35, 25, 'pig'),
            new Enemy(1900, canvas.height - 40, 35, 25, 'pig')
        ],
        goal: new Goal(worldWidth - 120, canvas.height - 100, 40, 60)
    },
    // Level 3: Winter
    {
        theme: { backgroundColor: '#D3D3D3', particles: 'snow' }, // LightGray
        platforms: [
            new Platform(0, canvas.height - 20, worldWidth, 20, '#ADD8E6'), // LightBlue
            new Platform(120, canvas.height - 90, 90, 20, '#ADD8E6'),
            new Platform(280, canvas.height - 170, 90, 20, '#ADD8E6'),
            new Platform(440, canvas.height - 250, 90, 20, '#ADD8E6'),
            new Platform(600, canvas.height - 170, 90, 20, '#ADD8E6'),
            new Platform(760, canvas.height - 90, 90, 20, '#ADD8E6'),
            new Platform(920, canvas.height - 170, 90, 20, '#ADD8E6'),
            new Platform(1080, canvas.height - 250, 90, 20, '#ADD8E6'),
            new Platform(1240, canvas.height - 170, 90, 20, '#ADD8E6'),
            new Platform(1400, canvas.height - 90, 90, 20, '#ADD8E6'),
            new Platform(1560, canvas.height - 170, 90, 20, '#ADD8E6'),
            new Platform(1720, canvas.height - 250, 90, 20, '#ADD8E6'),
            new Platform(1880, canvas.height - 170, 90, 20, '#ADD8E6'),
            new Platform(2040, canvas.height - 90, 90, 20, '#ADD8E6'),
            new Platform(2200, canvas.height - 170, 90, 20, '#ADD8E6'),
            new Platform(2360, canvas.height - 250, 90, 20, '#ADD8E6')
        ],
        enemies: [
            new Enemy(400, canvas.height - 40, 30, 30, 'fish'),
            new Enemy(1000, canvas.height - 40, 30, 30, 'fish'),
            new Enemy(1800, canvas.height - 40, 30, 30, 'fish')
        ],
        goal: new Goal(worldWidth - 140, canvas.height - 120, 40, 60)
    },
    // Level 4: Raining Day
    {
        theme: { backgroundColor: '#778899', particles: 'rain' }, // LightSlateGray
        platforms: [
            new Platform(0, canvas.height - 20, worldWidth, 20, '#2F4F4F'), // DarkSlateGray
            new Platform(180, canvas.height - 110, 110, 20, '#2F4F4F'),
            new Platform(360, canvas.height - 200, 110, 20, '#2F4F4F'),
            new Platform(540, canvas.height - 110, 110, 20, '#2F4F4F'),
            new Platform(720, canvas.height - 200, 110, 20, '#2F4F4F'),
            new Platform(900, canvas.height - 110, 110, 20, '#2F4F4F'),
            new Platform(1080, canvas.height - 200, 110, 20, '#2F4F4F'),
            new Platform(1260, canvas.height - 110, 110, 20, '#2F4F4F'),
            new Platform(1440, canvas.height - 200, 110, 20, '#2F4F4F'),
            new Platform(1620, canvas.height - 110, 110, 20, '#2F4F4F'),
            new Platform(1800, canvas.height - 200, 110, 20, '#2F4F4F'),
            new Platform(1980, canvas.height - 110, 110, 20, '#2F4F4F'),
            new Platform(2160, canvas.height - 200, 110, 20, '#2F4F4F'),
            new Platform(2340, canvas.height - 110, 110, 20, '#2F4F4F')
        ],
        enemies: [
            new Enemy(600, canvas.height - 40, 25, 25, 'bird'),
            new Enemy(1300, canvas.height - 40, 25, 25, 'bird'),
            new Enemy(2000, canvas.height - 40, 25, 25, 'bird')
        ],
        goal: new Goal(worldWidth - 160, canvas.height - 140, 40, 60)
    },
    // Level 5: Night Scene
    {
        theme: { backgroundColor: '#000080', particles: 'star' }, // Navy
        platforms: [
            new Platform(0, canvas.height - 20, worldWidth, 20, '#483D8B'), // DarkSlateBlue
            new Platform(220, canvas.height - 130, 130, 20, '#483D8B'),
            new Platform(440, canvas.height - 240, 130, 20, '#483D8B'),
            new Platform(660, canvas.height - 130, 130, 20, '#483D8B'),
            new Platform(880, canvas.height - 240, 130, 20, '#483D8B'),
            new Platform(1100, canvas.height - 130, 130, 20, '#483D8B'),
            new Platform(1320, canvas.height - 240, 130, 20, '#483D8B'),
            new Platform(1540, canvas.height - 130, 130, 20, '#483D8B'),
            new Platform(1760, canvas.height - 240, 130, 20, '#483D8B'),
            new Platform(1980, canvas.height - 130, 130, 20, '#483D8B'),
            new Platform(2200, canvas.height - 240, 130, 20, '#483D8B'),
            new Platform(2420, canvas.height - 130, 130, 20, '#483D8B')
        ],
        enemies: [
            new Enemy(700, canvas.height - 40, 30, 20, 'snake'),
            new Enemy(1400, canvas.height - 40, 30, 20, 'snake'),
            new Enemy(2100, canvas.height - 40, 30, 20, 'snake')
        ],
        goal: new Goal(worldWidth - 180, canvas.height - 160, 40, 60)
    }
];

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function loadLevel(levelIndex) {
    const level = levels[levelIndex];
    platforms = level.platforms;
    enemies = level.enemies;
    goal = level.goal;
    document.body.style.backgroundColor = level.theme.backgroundColor;

    // Reset player position
    player.x = 50;
    player.y = canvas.height - 100;

    // Clear existing particles, clouds, and birds
    particles = [];
    clouds = [];
    birds = [];

    // Create particles for special themes
    if (level.theme.particles === 'cherryBlossom') {
        for (let i = 0; i < 50; i++) {
            particles.push(new Particle(Math.random() * worldWidth, Math.random() * canvas.height, 5, 1, '#FFB6C1', 'cherryBlossom')); // LightPink
        }
    } else if (level.theme.particles === 'leaf') {
        for (let i = 0; i < 50; i++) {
            const color = Math.random() > 0.5 ? '#DAA520' : '#B22222'; // Goldenrod or FireBrick
            particles.push(new Particle(Math.random() * worldWidth, Math.random() * canvas.height, 8, 1.5, color, 'leaf'));
        }
    } else if (level.theme.particles === 'snow') {
        for (let i = 0; i < 100; i++) {
            particles.push(new Particle(Math.random() * worldWidth, Math.random() * canvas.height, 3, 2, 'white', 'snow'));
        }
    } else if (level.theme.particles === 'rain') {
        for (let i = 0; i < 100; i++) {
            particles.push(new Particle(Math.random() * worldWidth, Math.random() * canvas.height, 2, 5, 'blue', 'rain'));
        }
    } else if (level.theme.particles === 'star') {
        for (let i = 0; i < 100; i++) {
            particles.push(new Particle(Math.random() * worldWidth, Math.random() * canvas.height, 2, 0.5, 'white', 'star'));
        }
    }

    // Create clouds for summer
    if (level.theme.clouds) {
        clouds.push(new Cloud(100, 50, 100, 50, 0.5));
        clouds.push(new Cloud(500, 80, 120, 60, 0.3));
    }

    // Create birds for summer
    if (level.theme.birds) {
        for (let i = 0; i < 5; i++) { // Add more birds
            birds.push(new Bird(Math.random() * worldWidth, Math.random() * 150 + 50, 10, Math.random() * 0.5 + 0.5));
        }
    }
}

function init() {
    // Create player
    player = new Player(50, canvas.height - 100, playerWidth, playerHeight);

    // Create camera
    camera = new Camera(0, 0);

    // Load the first level
    loadLevel(currentLevel);

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

    // Draw background
    const level = levels[currentLevel];
    ctx.fillStyle = level.theme.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw sun for summer level
    if (level.theme.sun) {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(canvas.width - 80, 80, 50, 0, Math.PI * 2);
        ctx.fill();
    }

    // Update and draw clouds
    clouds.forEach(cloud => {
        cloud.update();
        cloud.draw();
    });

    // Update and draw birds
    birds.forEach(bird => {
        bird.update();
        bird.draw();
    });

    // Draw and update particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

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
        if (player.velocityY > 0 && checkCollision(player, platform)) {
            if (player.y + player.height - player.velocityY <= platform.y) {
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
        currentLevel++;
        if (currentLevel >= levels.length) {
            gameWon = true;
        } else {
            loadLevel(currentLevel);
        }
    }

    ctx.restore();
}

init();