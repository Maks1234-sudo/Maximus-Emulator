/**
 * Загрузчик игр для DOS эмулятора
 */
class GameLoader {
    constructor(dosEmulator) {
        this.dosEmulator = dosEmulator;
        this.currentGame = null;
        this.games = new Map();
        this.gameCanvas = null;
        this.gameContext = null;
        
        this.initializeGames();
    }

    /**
     * Инициализация игр
     */
    initializeGames() {
        this.registerGame('snake', {
            name: 'Snake',
            description: 'Classic Snake game',
            executable: 'SNAKE.EXE',
            start: () => this.startSnakeGame(),
            stop: () => this.stopCurrentGame()
        });

        this.registerGame('tetris', {
            name: 'Tetris',
            description: 'Classic Tetris game',
            executable: 'TETRIS.EXE',
            start: () => this.startTetrisGame(),
            stop: () => this.stopCurrentGame()
        });

        this.registerGame('pacman', {
            name: 'Pac-Man',
            description: 'Classic Pac-Man game',
            executable: 'PACMAN.EXE',
            start: () => this.startPacmanGame(),
            stop: () => this.stopCurrentGame()
        });

        this.registerGame('pong', {
            name: 'Pong',
            description: 'Classic Pong game',
            executable: 'PONG.EXE',
            start: () => this.startPongGame(),
            stop: () => this.stopCurrentGame()
        });
    }

    /**
     * Регистрация игры
     */
    registerGame(id, gameConfig) {
        this.games.set(id, gameConfig);
    }

    /**
     * Загрузка игры
     */
    loadGame(gameName) {
        const game = this.games.get(gameName.toLowerCase());
        
        if (!game) {
            this.dosEmulator.print(`Game not found: ${gameName}`);
            this.dosEmulator.print('Available games: snake, tetris, pacman, pong');
            return false;
        }

        this.dosEmulator.print(`Loading ${game.name}...`);
        
        // Создаем игровой канвас
        this.createGameCanvas();
        
        // Запускаем игру
        setTimeout(() => {
            game.start();
            this.currentGame = game;
            this.dosEmulator.print(`${game.name} loaded successfully!`);
            this.dosEmulator.print('Press ESC to exit game');
        }, 1000);

        return true;
    }

    /**
     * Создание игрового канваса
     */
    createGameCanvas() {
        // Скрываем DOS терминал
        const dosTerminal = document.getElementById('dos-terminal');
        dosTerminal.style.display = 'none';

        // Создаем игровой канвас
        this.gameCanvas = document.createElement('canvas');
        this.gameCanvas.id = 'game-canvas';
        this.gameCanvas.width = 800;
        this.gameCanvas.height = 600;
        this.gameCanvas.style.position = 'fixed';
        this.gameCanvas.style.top = '0';
        this.gameCanvas.style.left = '0';
        this.gameCanvas.style.zIndex = '1000';
        this.gameCanvas.style.background = '#000';
        this.gameCanvas.style.border = '2px solid #00ff41';

        document.body.appendChild(this.gameCanvas);
        this.gameContext = this.gameCanvas.getContext('2d');

        // Обработчик клавиш для выхода
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.stopCurrentGame();
            }
        });
    }

    /**
     * Остановка текущей игры
     */
    stopCurrentGame() {
        if (this.currentGame) {
            this.currentGame.stop();
            this.currentGame = null;
        }

        // Удаляем канвас
        if (this.gameCanvas) {
            document.body.removeChild(this.gameCanvas);
            this.gameCanvas = null;
            this.gameContext = null;
        }

        // Показываем DOS терминал
        const dosTerminal = document.getElementById('dos-terminal');
        dosTerminal.style.display = 'block';

        this.dosEmulator.print('Game stopped. Returning to DOS...');
    }

    /**
     * Запуск игры Snake
     */
    startSnakeGame() {
        const game = new SnakeGame(this.gameCanvas, this.gameContext, this.dosEmulator);
        game.start();
    }

    /**
     * Запуск игры Tetris
     */
    startTetrisGame() {
        const game = new TetrisGame(this.gameCanvas, this.gameContext, this.dosEmulator);
        game.start();
    }

    /**
     * Запуск игры Pac-Man
     */
    startPacmanGame() {
        const game = new PacmanGame(this.gameCanvas, this.gameContext, this.dosEmulator);
        game.start();
    }

    /**
     * Запуск игры Pong
     */
    startPongGame() {
        const game = new PongGame(this.gameCanvas, this.gameContext, this.dosEmulator);
        game.start();
    }

    /**
     * Получение списка игр
     */
    getGamesList() {
        return Array.from(this.games.values()).map(game => ({
            name: game.name,
            description: game.description,
            executable: game.executable
        }));
    }
}

/**
 * Игра Snake
 */
class SnakeGame {
    constructor(canvas, context, dosEmulator) {
        this.canvas = canvas;
        this.context = context;
        this.dosEmulator = dosEmulator;
        this.gridSize = 20;
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.direction = {x: 1, y: 0};
        this.score = 0;
        this.gameLoop = null;
        this.speed = 150;

        this.setupControls();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    if (this.direction.y === 0) this.direction = {x: 0, y: -1};
                    break;
                case 'ArrowDown':
                    if (this.direction.y === 0) this.direction = {x: 0, y: 1};
                    break;
                case 'ArrowLeft':
                    if (this.direction.x === 0) this.direction = {x: -1, y: 0};
                    break;
                case 'ArrowRight':
                    if (this.direction.x === 0) this.direction = {x: 1, y: 0};
                    break;
            }
        });
    }

    generateFood() {
        const x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
        const y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
        return {x, y};
    }

    update() {
        const head = {x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y};

        // Проверка границ
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            this.gameOver();
            return;
        }

        // Проверка столкновения с собой
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Проверка еды
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.generateFood();
            this.speed = Math.max(50, this.speed - 5);
        } else {
            this.snake.pop();
        }
    }

    draw() {
        // Очистка экрана
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Рисование змейки
        this.context.fillStyle = '#00ff41';
        this.snake.forEach(segment => {
            this.context.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 1,
                this.gridSize - 1
            );
        });

        // Рисование еды
        this.context.fillStyle = '#ff0000';
        this.context.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 1,
            this.gridSize - 1
        );

        // Рисование счета
        this.context.fillStyle = '#ffffff';
        this.context.font = '20px monospace';
        this.context.fillText(`Score: ${this.score}`, 10, 30);
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.context.fillStyle = '#ff0000';
        this.context.font = '40px monospace';
        this.context.fillText('GAME OVER', this.canvas.width / 2 - 100, this.canvas.height / 2);
        this.context.fillStyle = '#ffffff';
        this.context.font = '20px monospace';
        this.context.fillText(`Final Score: ${this.score}`, this.canvas.width / 2 - 80, this.canvas.height / 2 + 40);
        this.context.fillText('Press ESC to exit', this.canvas.width / 2 - 80, this.canvas.height / 2 + 80);
    }

    start() {
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, this.speed);
    }
}

/**
 * Игра Tetris
 */
class TetrisGame {
    constructor(canvas, context, dosEmulator) {
        this.canvas = canvas;
        this.context = context;
        this.dosEmulator = dosEmulator;
        this.gridSize = 30;
        this.cols = 10;
        this.rows = 20;
        this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.currentPiece = this.generatePiece();
        this.score = 0;
        this.gameLoop = null;
        this.dropTime = 0;
        this.dropInterval = 1000;

        this.pieces = [
            [[1, 1, 1, 1]], // I
            [[1, 1], [1, 1]], // O
            [[1, 1, 1], [0, 1, 0]], // T
            [[1, 1, 1], [1, 0, 0]], // L
            [[1, 1, 1], [0, 0, 1]], // J
            [[1, 1, 0], [0, 1, 1]], // S
            [[0, 1, 1], [1, 1, 0]]  // Z
        ];

        this.setupControls();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    this.rotatePiece();
                    break;
            }
        });
    }

    generatePiece() {
        const piece = this.pieces[Math.floor(Math.random() * this.pieces.length)];
        return {
            shape: piece,
            x: Math.floor(this.cols / 2) - Math.floor(piece[0].length / 2),
            y: 0
        };
    }

    movePiece(dx, dy) {
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;

        if (this.isValidMove(this.currentPiece.shape, newX, newY)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            return true;
        }
        return false;
    }

    rotatePiece() {
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );

        if (this.isValidMove(rotated, this.currentPiece.x, this.currentPiece.y)) {
            this.currentPiece.shape = rotated;
        }
    }

    isValidMove(shape, x, y) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = x + col;
                    const newY = y + row;

                    if (newX < 0 || newX >= this.cols || newY >= this.rows) {
                        return false;
                    }

                    if (newY >= 0 && this.grid[newY][newX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    placePiece() {
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const x = this.currentPiece.x + col;
                    const y = this.currentPiece.y + row;
                    if (y >= 0) {
                        this.grid[y][x] = 1;
                    }
                }
            }
        }

        this.clearLines();
        this.currentPiece = this.generatePiece();

        if (!this.isValidMove(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
            this.gameOver();
        }
    }

    clearLines() {
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.grid[row].every(cell => cell)) {
                this.grid.splice(row, 1);
                this.grid.unshift(Array(this.cols).fill(0));
                this.score += 100;
            }
        }
    }

    update(timestamp) {
        if (timestamp - this.dropTime > this.dropInterval) {
            if (!this.movePiece(0, 1)) {
                this.placePiece();
            }
            this.dropTime = timestamp;
        }
    }

    draw() {
        // Очистка экрана
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Рисование сетки
        this.context.strokeStyle = '#333';
        for (let i = 0; i <= this.cols; i++) {
            this.context.beginPath();
            this.context.moveTo(i * this.gridSize, 0);
            this.context.lineTo(i * this.gridSize, this.rows * this.gridSize);
            this.context.stroke();
        }
        for (let i = 0; i <= this.rows; i++) {
            this.context.beginPath();
            this.context.moveTo(0, i * this.gridSize);
            this.context.lineTo(this.cols * this.gridSize, i * this.gridSize);
            this.context.stroke();
        }

        // Рисование размещенных блоков
        this.context.fillStyle = '#00ff41';
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col]) {
                    this.context.fillRect(
                        col * this.gridSize + 1,
                        row * this.gridSize + 1,
                        this.gridSize - 2,
                        this.gridSize - 2
                    );
                }
            }
        }

        // Рисование текущего блока
        this.context.fillStyle = '#ff0000';
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    this.context.fillRect(
                        (this.currentPiece.x + col) * this.gridSize + 1,
                        (this.currentPiece.y + row) * this.gridSize + 1,
                        this.gridSize - 2,
                        this.gridSize - 2
                    );
                }
            }
        }

        // Рисование счета
        this.context.fillStyle = '#ffffff';
        this.context.font = '20px monospace';
        this.context.fillText(`Score: ${this.score}`, 320, 30);
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.context.fillStyle = '#ff0000';
        this.context.font = '40px monospace';
        this.context.fillText('GAME OVER', 200, 300);
        this.context.fillStyle = '#ffffff';
        this.context.font = '20px monospace';
        this.context.fillText(`Final Score: ${this.score}`, 200, 350);
        this.context.fillText('Press ESC to exit', 200, 400);
    }

    start() {
        this.gameLoop = setInterval((timestamp) => {
            this.update(timestamp);
            this.draw();
        }, 16);
    }
}

/**
 * Игра Pac-Man
 */
class PacmanGame {
    constructor(canvas, context, dosEmulator) {
        this.canvas = canvas;
        this.context = context;
        this.dosEmulator = dosEmulator;
        this.gridSize = 20;
        this.pacman = {x: 1, y: 1, direction: {x: 1, y: 0}};
        this.ghosts = [
            {x: 18, y: 18, direction: {x: -1, y: 0}, color: '#ff0000'},
            {x: 19, y: 18, direction: {x: 1, y: 0}, color: '#ff00ff'},
            {x: 18, y: 19, direction: {x: 0, y: -1}, color: '#00ffff'},
            {x: 19, y: 19, direction: {x: 0, y: 1}, color: '#ffff00'}
        ];
        this.dots = [];
        this.score = 0;
        this.gameLoop = null;
        this.lives = 3;

        this.createMaze();
        this.setupControls();
    }

    createMaze() {
        // Простой лабиринт
        this.maze = [
            "WWWWWWWWWWWWWWWWWWWW",
            "W....W........W....W",
            "W.WW.W.WWWWWW.W.WW.W",
            "W.WW.W.W....W.W.WW.W",
            "W.WW.W.W.WW.W.W.WW.W",
            "W....W.W.WW.W.W....W",
            "WWWWWW.W.WW.W.WWWWWW",
            "     W.W.WW.W.W     ",
            "WWWWWW.W.WW.W.WWWWWW",
            "W....W.W.WW.W.W....W",
            "W.WW.W.W....W.W.WW.W",
            "W.WW.W.WWWWWW.W.WW.W",
            "W.WW.W........W.WW.W",
            "W....WWWWWWWWWW....W",
            "WWWWWWWWWWWWWWWWWWWW"
        ];

        // Создаем точки
        for (let y = 0; y < this.maze.length; y++) {
            for (let x = 0; x < this.maze[y].length; x++) {
                if (this.maze[y][x] === '.') {
                    this.dots.push({x, y});
                }
            }
        }
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    this.pacman.direction = {x: 0, y: -1};
                    break;
                case 'ArrowDown':
                    this.pacman.direction = {x: 0, y: 1};
                    break;
                case 'ArrowLeft':
                    this.pacman.direction = {x: -1, y: 0};
                    break;
                case 'ArrowRight':
                    this.pacman.direction = {x: 1, y: 0};
                    break;
            }
        });
    }

    update() {
        // Движение Pac-Man
        const newX = this.pacman.x + this.pacman.direction.x;
        const newY = this.pacman.y + this.pacman.direction.y;

        if (this.isValidMove(newX, newY)) {
            this.pacman.x = newX;
            this.pacman.y = newY;
        }

        // Сбор точек
        const dotIndex = this.dots.findIndex(dot => dot.x === this.pacman.x && dot.y === this.pacman.y);
        if (dotIndex !== -1) {
            this.dots.splice(dotIndex, 1);
            this.score += 10;
        }

        // Движение призраков
        this.ghosts.forEach(ghost => {
            const possibleMoves = [
                {x: ghost.x + 1, y: ghost.y},
                {x: ghost.x - 1, y: ghost.y},
                {x: ghost.x, y: ghost.y + 1},
                {x: ghost.x, y: ghost.y - 1}
            ].filter(move => this.isValidMove(move.x, move.y));

            if (possibleMoves.length > 0) {
                const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                ghost.x = move.x;
                ghost.y = move.y;
            }
        });

        // Проверка столкновения с призраками
        this.ghosts.forEach(ghost => {
            if (ghost.x === this.pacman.x && ghost.y === this.pacman.y) {
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver();
                } else {
                    this.resetPositions();
                }
            }
        });

        // Проверка победы
        if (this.dots.length === 0) {
            this.victory();
        }
    }

    isValidMove(x, y) {
        if (x < 0 || x >= this.maze[0].length || y < 0 || y >= this.maze.length) {
            return false;
        }
        return this.maze[y][x] !== 'W';
    }

    resetPositions() {
        this.pacman = {x: 1, y: 1, direction: {x: 1, y: 0}};
        this.ghosts = [
            {x: 18, y: 18, direction: {x: -1, y: 0}, color: '#ff0000'},
            {x: 19, y: 18, direction: {x: 1, y: 0}, color: '#ff00ff'},
            {x: 18, y: 19, direction: {x: 0, y: -1}, color: '#00ffff'},
            {x: 19, y: 19, direction: {x: 0, y: 1}, color: '#ffff00'}
        ];
    }

    draw() {
        // Очистка экрана
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Рисование лабиринта
        this.context.fillStyle = '#0000ff';
        for (let y = 0; y < this.maze.length; y++) {
            for (let x = 0; x < this.maze[y].length; x++) {
                if (this.maze[y][x] === 'W') {
                    this.context.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
                }
            }
        }

        // Рисование точек
        this.context.fillStyle = '#ffff00';
        this.dots.forEach(dot => {
            this.context.beginPath();
            this.context.arc(
                dot.x * this.gridSize + this.gridSize / 2,
                dot.y * this.gridSize + this.gridSize / 2,
                2,
                0,
                2 * Math.PI
            );
            this.context.fill();
        });

        // Рисование Pac-Man
        this.context.fillStyle = '#ffff00';
        this.context.beginPath();
        this.context.arc(
            this.pacman.x * this.gridSize + this.gridSize / 2,
            this.pacman.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            2 * Math.PI
        );
        this.context.fill();

        // Рисование призраков
        this.ghosts.forEach(ghost => {
            this.context.fillStyle = ghost.color;
            this.context.fillRect(
                ghost.x * this.gridSize + 2,
                ghost.y * this.gridSize + 2,
                this.gridSize - 4,
                this.gridSize - 4
            );
        });

        // Рисование счета и жизней
        this.context.fillStyle = '#ffffff';
        this.context.font = '20px monospace';
        this.context.fillText(`Score: ${this.score}`, 10, 30);
        this.context.fillText(`Lives: ${this.lives}`, 10, 60);
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.context.fillStyle = '#ff0000';
        this.context.font = '40px monospace';
        this.context.fillText('GAME OVER', 300, 300);
        this.context.fillStyle = '#ffffff';
        this.context.font = '20px monospace';
        this.context.fillText(`Final Score: ${this.score}`, 300, 350);
        this.context.fillText('Press ESC to exit', 300, 400);
    }

    victory() {
        clearInterval(this.gameLoop);
        this.context.fillStyle = '#00ff00';
        this.context.font = '40px monospace';
        this.context.fillText('VICTORY!', 300, 300);
        this.context.fillStyle = '#ffffff';
        this.context.font = '20px monospace';
        this.context.fillText(`Final Score: ${this.score}`, 300, 350);
        this.context.fillText('Press ESC to exit', 300, 400);
    }

    start() {
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, 200);
    }
}

/**
 * Игра Pong
 */
class PongGame {
    constructor(canvas, context, dosEmulator) {
        this.canvas = canvas;
        this.context = context;
        this.dosEmulator = dosEmulator;
        this.paddleHeight = 100;
        this.paddleWidth = 10;
        this.ballSize = 10;
        this.paddleSpeed = 5;
        this.ballSpeed = 3;

        this.leftPaddle = {y: this.canvas.height / 2 - this.paddleHeight / 2};
        this.rightPaddle = {y: this.canvas.height / 2 - this.paddleHeight / 2};
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            dx: this.ballSpeed,
            dy: this.ballSpeed
        };

        this.leftScore = 0;
        this.rightScore = 0;
        this.gameLoop = null;

        this.setupControls();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'w':
                    this.leftPaddle.y = Math.max(0, this.leftPaddle.y - this.paddleSpeed);
                    break;
                case 's':
                    this.leftPaddle.y = Math.min(this.canvas.height - this.paddleHeight, this.leftPaddle.y + this.paddleSpeed);
                    break;
                case 'ArrowUp':
                    this.rightPaddle.y = Math.max(0, this.rightPaddle.y - this.paddleSpeed);
                    break;
                case 'ArrowDown':
                    this.rightPaddle.y = Math.min(this.canvas.height - this.paddleHeight, this.rightPaddle.y + this.paddleSpeed);
                    break;
            }
        });
    }

    update() {
        // Движение мяча
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Отскок от верхней и нижней границы
        if (this.ball.y <= 0 || this.ball.y >= this.canvas.height - this.ballSize) {
            this.ball.dy = -this.ball.dy;
        }

        // Проверка столкновения с левой ракеткой
        if (this.ball.x <= this.paddleWidth && 
            this.ball.y >= this.leftPaddle.y && 
            this.ball.y <= this.leftPaddle.y + this.paddleHeight) {
            this.ball.dx = -this.ball.dx;
        }

        // Проверка столкновения с правой ракеткой
        if (this.ball.x >= this.canvas.width - this.paddleWidth - this.ballSize && 
            this.ball.y >= this.rightPaddle.y && 
            this.ball.y <= this.rightPaddle.y + this.paddleHeight) {
            this.ball.dx = -this.ball.dx;
        }

        // Голы
        if (this.ball.x <= 0) {
            this.rightScore++;
            this.resetBall();
        } else if (this.ball.x >= this.canvas.width - this.ballSize) {
            this.leftScore++;
            this.resetBall();
        }
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx = this.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.dy = this.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    }

    draw() {
        // Очистка экрана
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Рисование центральной линии
        this.context.strokeStyle = '#fff';
        this.context.setLineDash([5, 15]);
        this.context.beginPath();
        this.context.moveTo(this.canvas.width / 2, 0);
        this.context.lineTo(this.canvas.width / 2, this.canvas.height);
        this.context.stroke();
        this.context.setLineDash([]);

        // Рисование ракеток
        this.context.fillStyle = '#fff';
        this.context.fillRect(0, this.leftPaddle.y, this.paddleWidth, this.paddleHeight);
        this.context.fillRect(this.canvas.width - this.paddleWidth, this.rightPaddle.y, this.paddleWidth, this.paddleHeight);

        // Рисование мяча
        this.context.fillStyle = '#fff';
        this.context.fillRect(this.ball.x, this.ball.y, this.ballSize, this.ballSize);

        // Рисование счета
        this.context.fillStyle = '#fff';
        this.context.font = '40px monospace';
        this.context.fillText(this.leftScore.toString(), this.canvas.width / 4, 50);
        this.context.fillText(this.rightScore.toString(), 3 * this.canvas.width / 4, 50);
    }

    start() {
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, 16);
    }
}