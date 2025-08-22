/**
 * DOS Emulator - Основной класс эмулятора
 */
class DOSEmulator {
    constructor() {
        this.currentDirectory = 'C:\\';
        this.fileSystem = new VirtualFileSystem();
        this.commandHistory = [];
        this.historyIndex = -1;
        this.isRunning = false;
        this.settings = {
            cpuSpeed: 8,
            memorySize: 640,
            soundEnabled: true,
            networkEnabled: true
        };
        
        this.initializeEmulator();
    }

    /**
     * Инициализация эмулятора
     */
    initializeEmulator() {
        this.setupEventListeners();
        this.createDefaultFileSystem();
        this.bootSequence();
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        const dosInput = document.getElementById('dos-input');
        const dosOutput = document.getElementById('dos-output');

        // Обработка ввода команд
        dosInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand(dosInput.value);
                dosInput.value = '';
                this.historyIndex = -1;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory('up');
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory('down');
            }
        });

        // Автофокус на ввод
        dosInput.addEventListener('focus', () => {
            dosInput.select();
        });

        // Обработка кнопок управления
        document.getElementById('close-dos').addEventListener('click', () => {
            this.closeDOS();
        });

        document.getElementById('maximize-dos').addEventListener('click', () => {
            this.toggleFullscreen();
        });
    }

    /**
     * Создание стандартной файловой системы
     */
    createDefaultFileSystem() {
        // Создание директорий
        this.fileSystem.createDirectory('C:\\DOS');
        this.fileSystem.createDirectory('C:\\GAMES');
        this.fileSystem.createDirectory('C:\\UTILS');
        this.fileSystem.createDirectory('C:\\TEMP');

        // Создание системных файлов
        this.fileSystem.createFile('C:\\AUTOEXEC.BAT', this.getAutoexecContent());
        this.fileSystem.createFile('C:\\CONFIG.SYS', this.getConfigContent());
        this.fileSystem.createFile('C:\\COMMAND.COM', 'DOS Command Interpreter');
        
        // Создание утилит
        this.fileSystem.createFile('C:\\UTILS\\EDIT.COM', 'Simple Text Editor');
        this.fileSystem.createFile('C:\\UTILS\\FORMAT.COM', 'Disk Format Utility');
        this.fileSystem.createFile('C:\\UTILS\\CHKDSK.COM', 'Check Disk Utility');
        
        // Создание игр
        this.fileSystem.createFile('C:\\GAMES\\SNAKE.EXE', 'Snake Game');
        this.fileSystem.createFile('C:\\GAMES\\TETRIS.EXE', 'Tetris Game');
        this.fileSystem.createFile('C:\\GAMES\\PACMAN.EXE', 'Pac-Man Game');
    }

    /**
     * Содержимое AUTOEXEC.BAT
     */
    getAutoexecContent() {
        return `@echo off
echo Starting DOS Emulator v1.0
echo Loading system files...
echo.
echo Welcome to DOS Emulator!
echo Type 'help' for available commands
echo.
prompt $p$g
path=C:\\DOS;C:\\UTILS;C:\\GAMES
`;
    }

    /**
     * Содержимое CONFIG.SYS
     */
    getConfigContent() {
        return `DEVICE=C:\\DOS\\HIMEM.SYS
DEVICE=C:\\DOS\\EMM386.EXE
BUFFERS=20
FILES=40
DOS=HIGH,UMB
`;
    }

    /**
     * Последовательность загрузки
     */
    async bootSequence() {
        const output = document.getElementById('dos-output');
        
        const bootMessages = [
            'DOS Emulator v1.0 - Starting...',
            'Loading system files...',
            'Initializing memory...',
            'Setting up file system...',
            'Loading device drivers...',
            'Starting network services...',
            'Initializing audio system...',
            '',
            'DOS Emulator v1.0 loaded successfully!',
            'Type "help" for available commands.',
            ''
        ];

        for (let i = 0; i < bootMessages.length; i++) {
            output.textContent += bootMessages[i] + '\n';
            output.scrollTop = output.scrollHeight;
            
            if (i < bootMessages.length - 1) {
                await this.delay(200);
            }
        }

        this.isRunning = true;
        this.updatePrompt();
    }

    /**
     * Выполнение команды
     */
    executeCommand(command) {
        if (!command.trim()) return;

        const output = document.getElementById('dos-output');
        const prompt = `${this.currentDirectory}> ${command}`;
        
        output.textContent += prompt + '\n';
        
        // Добавление в историю
        this.commandHistory.push(command);
        if (this.commandHistory.length > 50) {
            this.commandHistory.shift();
        }

        // Парсинг и выполнение команды
        const parts = command.trim().split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        try {
            switch (cmd) {
                case 'help':
                    this.showHelp();
                    break;
                case 'dir':
                    this.listDirectory(args);
                    break;
                case 'cd':
                    this.changeDirectory(args);
                    break;
                case 'type':
                    this.typeFile(args);
                    break;
                case 'copy':
                    this.copyFile(args);
                    break;
                case 'del':
                case 'delete':
                    this.deleteFile(args);
                    break;
                case 'md':
                case 'mkdir':
                    this.makeDirectory(args);
                    break;
                case 'rd':
                case 'rmdir':
                    this.removeDirectory(args);
                    break;
                case 'cls':
                case 'clear':
                    this.clearScreen();
                    break;
                case 'ver':
                    this.showVersion();
                    break;
                case 'time':
                    this.showTime();
                    break;
                case 'date':
                    this.showDate();
                    break;
                case 'mem':
                    this.showMemory();
                    break;
                case 'echo':
                    this.echo(args);
                    break;
                case 'ping':
                    this.ping(args);
                    break;
                case 'netstat':
                    this.netstat();
                    break;
                case 'sound':
                    this.soundTest();
                    break;
                case 'game':
                    this.loadGame(args);
                    break;
                case 'exit':
                case 'quit':
                    this.closeDOS();
                    break;
                default:
                    // Попытка запустить как исполняемый файл
                    this.runExecutable(cmd, args);
                    break;
            }
        } catch (error) {
            output.textContent += `Error: ${error.message}\n`;
        }

        output.scrollTop = output.scrollHeight;
        this.updatePrompt();
    }

    /**
     * Показать справку
     */
    showHelp() {
        const help = `Available commands:
  help          - Show this help
  dir           - List directory contents
  cd <dir>      - Change directory
  type <file>   - Display file contents
  copy <src> <dest> - Copy file
  del <file>    - Delete file
  md <dir>      - Make directory
  rd <dir>      - Remove directory
  cls           - Clear screen
  ver           - Show version
  time          - Show current time
  date          - Show current date
  mem           - Show memory usage
  echo <text>   - Echo text
  ping <host>   - Ping network host
  netstat       - Show network status
  sound         - Test sound
  game <name>   - Load game
  exit          - Exit DOS
`;
        this.print(help);
    }

    /**
     * Список директории
     */
    listDirectory(args) {
        const path = args[0] || this.currentDirectory;
        const files = this.fileSystem.listDirectory(path);
        
        if (!files) {
            this.print(`Directory of ${path}\nFile not found`);
            return;
        }

        let output = `Directory of ${path}\n\n`;
        
        files.forEach(file => {
            const size = file.size ? file.size.toString().padStart(10) : '<DIR>'.padStart(10);
            const date = file.date || '01/01/1980';
            const time = file.time || '00:00';
            output += `${date}  ${time}    ${size} ${file.name}\n`;
        });

        output += `\n    ${files.length} file(s)`;
        this.print(output);
    }

    /**
     * Смена директории
     */
    changeDirectory(args) {
        if (!args[0]) {
            this.print(this.currentDirectory);
            return;
        }

        const newPath = this.fileSystem.resolvePath(this.currentDirectory, args[0]);
        if (this.fileSystem.directoryExists(newPath)) {
            this.currentDirectory = newPath;
            this.updatePrompt();
        } else {
            this.print(`Directory not found: ${args[0]}`);
        }
    }

    /**
     * Показать содержимое файла
     */
    typeFile(args) {
        if (!args[0]) {
            this.print('Usage: type <filename>');
            return;
        }

        const filePath = this.fileSystem.resolvePath(this.currentDirectory, args[0]);
        const content = this.fileSystem.readFile(filePath);
        
        if (content !== null) {
            this.print(content);
        } else {
            this.print(`File not found: ${args[0]}`);
        }
    }

    /**
     * Копирование файла
     */
    copyFile(args) {
        if (args.length < 2) {
            this.print('Usage: copy <source> <destination>');
            return;
        }

        const source = this.fileSystem.resolvePath(this.currentDirectory, args[0]);
        const dest = this.fileSystem.resolvePath(this.currentDirectory, args[1]);
        
        if (this.fileSystem.copyFile(source, dest)) {
            this.print(`1 file(s) copied`);
        } else {
            this.print(`File not found: ${args[0]}`);
        }
    }

    /**
     * Удаление файла
     */
    deleteFile(args) {
        if (!args[0]) {
            this.print('Usage: del <filename>');
            return;
        }

        const filePath = this.fileSystem.resolvePath(this.currentDirectory, args[0]);
        if (this.fileSystem.deleteFile(filePath)) {
            this.print(`File deleted: ${args[0]}`);
        } else {
            this.print(`File not found: ${args[0]}`);
        }
    }

    /**
     * Создание директории
     */
    makeDirectory(args) {
        if (!args[0]) {
            this.print('Usage: md <dirname>');
            return;
        }

        const dirPath = this.fileSystem.resolvePath(this.currentDirectory, args[0]);
        if (this.fileSystem.createDirectory(dirPath)) {
            this.print(`Directory created: ${args[0]}`);
        } else {
            this.print(`Directory already exists: ${args[0]}`);
        }
    }

    /**
     * Удаление директории
     */
    removeDirectory(args) {
        if (!args[0]) {
            this.print('Usage: rd <dirname>');
            return;
        }

        const dirPath = this.fileSystem.resolvePath(this.currentDirectory, args[0]);
        if (this.fileSystem.removeDirectory(dirPath)) {
            this.print(`Directory removed: ${args[0]}`);
        } else {
            this.print(`Directory not found or not empty: ${args[0]}`);
        }
    }

    /**
     * Очистка экрана
     */
    clearScreen() {
        const output = document.getElementById('dos-output');
        output.textContent = '';
    }

    /**
     * Показать версию
     */
    showVersion() {
        this.print('DOS Emulator v1.0\nCopyright (c) 2024 DOS Emulator Team');
    }

    /**
     * Показать время
     */
    showTime() {
        const now = new Date();
        const time = now.toLocaleTimeString();
        this.print(`Current time is ${time}`);
    }

    /**
     * Показать дату
     */
    showDate() {
        const now = new Date();
        const date = now.toLocaleDateString();
        this.print(`Current date is ${date}`);
    }

    /**
     * Показать память
     */
    showMemory() {
        const total = this.settings.memorySize;
        const used = Math.floor(Math.random() * 200) + 100;
        const free = total - used;
        
        this.print(`Memory Type     Total =  Used  +  Free\n`);
        this.print(`Conventional     ${total}K     ${used}K    ${free}K\n`);
        this.print(`Total            ${total}K     ${used}K    ${free}K`);
    }

    /**
     * Эхо команда
     */
    echo(args) {
        this.print(args.join(' '));
    }

    /**
     * Пинг команда
     */
    ping(args) {
        if (!args[0]) {
            this.print('Usage: ping <hostname>');
            return;
        }

        this.print(`Pinging ${args[0]}...`);
        setTimeout(() => {
            this.print(`Reply from ${args[0]}: time=32ms TTL=64`);
        }, 1000);
    }

    /**
     * Сетевой статус
     */
    netstat() {
        this.print(`Active Connections\n`);
        this.print(`Proto  Local Address    Foreign Address   State\n`);
        this.print(`TCP    127.0.0.1:8080   0.0.0.0:0        LISTENING`);
    }

    /**
     * Тест звука
     */
    soundTest() {
        if (this.settings.soundEnabled) {
            const audio = document.getElementById('beep-sound');
            audio.play().catch(() => {
                this.print('Sound test failed - audio not supported');
            });
            this.print('Sound test completed');
        } else {
            this.print('Sound is disabled');
        }
    }

    /**
     * Загрузка игры
     */
    loadGame(args) {
        if (!args[0]) {
            this.print('Available games: snake, tetris, pacman');
            return;
        }

        const gameName = args[0].toLowerCase();
        this.print(`Loading game: ${gameName}...`);
        
        // Здесь будет загрузка игр
        setTimeout(() => {
            this.print(`Game ${gameName} loaded successfully!`);
        }, 2000);
    }

    /**
     * Запуск исполняемого файла
     */
    runExecutable(cmd, args) {
        const filePath = this.fileSystem.resolvePath(this.currentDirectory, cmd);
        const file = this.fileSystem.getFile(filePath);
        
        if (file && file.type === 'executable') {
            this.print(`Running ${cmd}...`);
            // Здесь будет выполнение программ
        } else {
            this.print(`'${cmd}' is not recognized as an internal or external command,\noperable program or batch file.`);
        }
    }

    /**
     * Навигация по истории команд
     */
    navigateHistory(direction) {
        const input = document.getElementById('dos-input');
        
        if (direction === 'up' && this.historyIndex < this.commandHistory.length - 1) {
            this.historyIndex++;
        } else if (direction === 'down' && this.historyIndex > -1) {
            this.historyIndex--;
        }

        if (this.historyIndex >= 0) {
            input.value = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
        } else {
            input.value = '';
        }
    }

    /**
     * Обновление промпта
     */
    updatePrompt() {
        const prompt = document.querySelector('.dos-prompt');
        prompt.textContent = `${this.currentDirectory}>`;
    }

    /**
     * Вывод текста
     */
    print(text) {
        const output = document.getElementById('dos-output');
        output.textContent += text + '\n';
        output.scrollTop = output.scrollHeight;
    }

    /**
     * Закрытие DOS
     */
    closeDOS() {
        document.getElementById('dos-terminal').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
    }

    /**
     * Переключение полноэкранного режима
     */
    toggleFullscreen() {
        const terminal = document.getElementById('dos-terminal');
        terminal.classList.toggle('dos-fullscreen');
    }

    /**
     * Задержка
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}