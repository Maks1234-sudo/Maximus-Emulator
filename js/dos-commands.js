/**
 * Дополнительные DOS команды
 */

// Расширение DOS эмулятора дополнительными командами
DOSEmulator.prototype.extendCommands = function() {
    // Добавляем новые команды к существующим
    this.commands = {
        ...this.commands,
        'find': this.findFiles.bind(this),
        'grep': this.grepText.bind(this),
        'tree': this.showDirectoryTree.bind(this),
        'attrib': this.showFileAttributes.bind(this),
        'more': this.showFileWithPaging.bind(this),
        'sort': this.sortFileContent.bind(this),
        'wc': this.wordCount.bind(this),
        'head': this.showFileHead.bind(this),
        'tail': this.showFileTail.bind(this),
        'diff': this.compareFiles.bind(this),
        'uniq': this.removeDuplicates.bind(this),
        'tr': this.translateCharacters.bind(this),
        'cut': this.cutFileColumns.bind(this),
        'paste': this.pasteFiles.bind(this),
        'join': this.joinFiles.bind(this),
        'split': this.splitFile.bind(this),
        'fmt': this.formatText.bind(this),
        'nl': this.numberLines.bind(this),
        'tac': this.reverseFileLines.bind(this),
        'rev': this.reverseCharacters.bind(this)
    };
};

// Поиск файлов
DOSEmulator.prototype.findFiles = function(args) {
    if (!args[0]) {
        this.print('Usage: find <pattern> [directory]');
        return;
    }
    
    const pattern = args[0];
    const directory = args[1] || this.currentDirectory;
    const files = this.fileSystem.searchFiles(pattern, directory);
    
    if (files.length === 0) {
        this.print(`No files found matching pattern: ${pattern}`);
        return;
    }
    
    this.print(`Found ${files.length} file(s) matching "${pattern}":`);
    files.forEach(file => {
        this.print(`  ${file.path}`);
    });
};

// Поиск текста в файлах
DOSEmulator.prototype.grepText = function(args) {
    if (args.length < 1) {
        this.print('Usage: grep <pattern> [file]');
        return;
    }
    
    const pattern = args[0];
    const filename = args[1];
    
    if (filename) {
        const content = this.fileSystem.readFile(this.fileSystem.resolvePath(this.currentDirectory, filename));
        if (content === null) {
            this.print(`File not found: ${filename}`);
            return;
        }
        
        const lines = content.split('\n');
        const matches = lines.filter(line => line.toLowerCase().includes(pattern.toLowerCase()));
        
        if (matches.length === 0) {
            this.print(`No matches found in ${filename}`);
            return;
        }
        
        this.print(`Found ${matches.length} match(es) in ${filename}:`);
        matches.forEach(line => this.print(`  ${line}`));
    } else {
        this.print('Please specify a file to search in');
    }
};

// Показать дерево директорий
DOSEmulator.prototype.showDirectoryTree = function(args) {
    const directory = args[0] || this.currentDirectory;
    this.printDirectoryTree(directory, '', 0);
};

DOSEmulator.prototype.printDirectoryTree = function(path, prefix, depth) {
    if (depth > 10) return; // Ограничение глубины
    
    const files = this.fileSystem.listDirectory(path);
    if (!files) return;
    
    files.forEach((file, index) => {
        const isLast = index === files.length - 1;
        const currentPrefix = isLast ? '└── ' : '├── ';
        const nextPrefix = isLast ? '    ' : '│   ';
        
        this.print(`${prefix}${currentPrefix}${file.name}`);
        
        if (file.type === 'directory') {
            this.printDirectoryTree(file.path, prefix + nextPrefix, depth + 1);
        }
    });
};

// Показать атрибуты файла
DOSEmulator.prototype.showFileAttributes = function(args) {
    if (!args[0]) {
        this.print('Usage: attrib <filename>');
        return;
    }
    
    const filePath = this.fileSystem.resolvePath(this.currentDirectory, args[0]);
    const file = this.fileSystem.getFile(filePath);
    
    if (!file) {
        this.print(`File not found: ${args[0]}`);
        return;
    }
    
    this.print(`File: ${file.name}`);
    this.print(`Path: ${file.path}`);
    this.print(`Size: ${file.size} bytes`);
    this.print(`Type: ${file.type}`);
    this.print(`Created: ${file.date} ${file.time}`);
    this.print(`Extension: ${file.extension || 'none'}`);
};

// Показать файл с постраничной прокруткой
DOSEmulator.prototype.showFileWithPaging = function(args) {
    if (!args[0]) {
        this.print('Usage: more <filename>');
        return;
    }
    
    const filePath = this.fileSystem.resolvePath(this.currentDirectory, args[0]);
    const content = this.fileSystem.readFile(filePath);
    
    if (content === null) {
        this.print(`File not found: ${args[0]}`);
        return;
    }
    
    const lines = content.split('\n');
    const pageSize = 20;
    
    for (let i = 0; i < lines.length; i += pageSize) {
        const page = lines.slice(i, i + pageSize);
        page.forEach(line => this.print(line));
        
        if (i + pageSize < lines.length) {
            this.print('-- More --');
            // В реальной реализации здесь была бы пауза
        }
    }
};

// Сортировка содержимого файла
DOSEmulator.prototype.sortFileContent = function(args) {
    if (!args[0]) {
        this.print('Usage: sort <filename>');
        return;
    }
    
    const filePath = this.fileSystem.resolvePath(this.currentDirectory, args[0]);
    const content = this.fileSystem.readFile(filePath);
    
    if (content === null) {
        this.print(`File not found: ${args[0]}`);
        return;
    }
    
    const lines = content.split('\n').filter(line => line.trim());
    const sortedLines = lines.sort();
    
    this.print('Sorted content:');
    sortedLines.forEach(line => this.print(line));
};

// Подсчет слов
DOSEmulator.prototype.wordCount = function(args) {
    if (!args[0]) {
        this.print('Usage: wc <filename>');
        return;
    }
    
    const filePath = this.fileSystem.resolvePath(this.currentDirectory, args[0]);
    const content = this.fileSystem.readFile(filePath);
    
    if (content === null) {
        this.print(`File not found: ${args[0]}`);
        return;
    }
    
    const lines = content.split('\n').length;
    const words = content.split(/\s+/).filter(word => word.trim()).length;
    const characters = content.length;
    
    this.print(`${lines} lines, ${words} words, ${characters} characters`);
};

// Показать начало файла
DOSEmulator.prototype.showFileHead = function(args) {
    if (!args[0]) {
        this.print('Usage: head <filename> [lines]');
        return;
    }
    
    const filePath = this.fileSystem.resolvePath(this.currentDirectory, args[0]);
    const content = this.fileSystem.readFile(filePath);
    const lines = parseInt(args[1]) || 10;
    
    if (content === null) {
        this.print(`File not found: ${args[0]}`);
        return;
    }
    
    const fileLines = content.split('\n');
    const headLines = fileLines.slice(0, lines);
    
    this.print(`First ${lines} lines of ${args[0]}:`);
    headLines.forEach(line => this.print(line));
};

// Показать конец файла
DOSEmulator.prototype.showFileTail = function(args) {
    if (!args[0]) {
        this.print('Usage: tail <filename> [lines]');
        return;
    }
    
    const filePath = this.fileSystem.resolvePath(this.currentDirectory, args[0]);
    const content = this.fileSystem.readFile(filePath);
    const lines = parseInt(args[1]) || 10;
    
    if (content === null) {
        this.print(`File not found: ${args[0]}`);
        return;
    }
    
    const fileLines = content.split('\n');
    const tailLines = fileLines.slice(-lines);
    
    this.print(`Last ${lines} lines of ${args[0]}:`);
    tailLines.forEach(line => this.print(line));
};

// Сравнение файлов
DOSEmulator.prototype.compareFiles = function(args) {
    if (args.length < 2) {
        this.print('Usage: diff <file1> <file2>');
        return;
    }
    
    const file1Path = this.fileSystem.resolvePath(this.currentDirectory, args[0]);
    const file2Path = this.fileSystem.resolvePath(this.currentDirectory, args[1]);
    
    const content1 = this.fileSystem.readFile(file1Path);
    const content2 = this.fileSystem.readFile(file2Path);
    
    if (content1 === null) {
        this.print(`File not found: ${args[0]}`);
        return;
    }
    
    if (content2 === null) {
        this.print(`File not found: ${args[1]}`);
        return;
    }
    
    if (content1 === content2) {
        this.print('Files are identical');
    } else {
        this.print('Files are different');
        this.print(`Size difference: ${Math.abs(content1.length - content2.length)} characters`);
    }
};

// Удаление дубликатов
DOSEmulator.prototype.removeDuplicates = function(args) {
    if (!args[0]) {
        this.print('Usage: uniq <filename>');
        return;
    }
    
    const filePath = this.fileSystem.resolvePath(this.currentDirectory, args[0]);
    const content = this.fileSystem.readFile(filePath);
    
    if (content === null) {
        this.print(`File not found: ${args[0]}`);
        return;
    }
    
    const lines = content.split('\n');
    const uniqueLines = [...new Set(lines)];
    
    this.print('Unique lines:');
    uniqueLines.forEach(line => this.print(line));
};

// Трансляция символов
DOSEmulator.prototype.translateCharacters = function(args) {
    if (args.length < 2) {
        this.print('Usage: tr <from> <to>');
        return;
    }
    
    const from = args[0];
    const to = args[1];
    
    // Простая реализация - замена символов
    this.print(`Translation: ${from} -> ${to}`);
    this.print('Use with input redirection for file processing');
};

// Обрезка колонок
DOSEmulator.prototype.cutFileColumns = function(args) {
    if (args.length < 2) {
        this.print('Usage: cut -c <columns> <filename>');
        return;
    }
    
    const columns = args[0];
    const filename = args[1];
    
    this.print(`Cutting columns ${columns} from ${filename}`);
    this.print('Column cutting not implemented in this version');
};

// Склеивание файлов
DOSEmulator.prototype.pasteFiles = function(args) {
    if (args.length < 2) {
        this.print('Usage: paste <file1> <file2>');
        return;
    }
    
    this.print('Pasting files side by side');
    this.print('File pasting not implemented in this version');
};

// Объединение файлов
DOSEmulator.prototype.joinFiles = function(args) {
    if (args.length < 2) {
        this.print('Usage: join <file1> <file2>');
        return;
    }
    
    this.print('Joining files on common fields');
    this.print('File joining not implemented in this version');
};

// Разделение файла
DOSEmulator.prototype.splitFile = function(args) {
    if (!args[0]) {
        this.print('Usage: split <filename> [size]');
        return;
    }
    
    this.print('Splitting file into smaller parts');
    this.print('File splitting not implemented in this version');
};

// Форматирование текста
DOSEmulator.prototype.formatText = function(args) {
    if (!args[0]) {
        this.print('Usage: fmt <filename>');
        return;
    }
    
    this.print('Formatting text to standard width');
    this.print('Text formatting not implemented in this version');
};

// Нумерация строк
DOSEmulator.prototype.numberLines = function(args) {
    if (!args[0]) {
        this.print('Usage: nl <filename>');
        return;
    }
    
    const filePath = this.fileSystem.resolvePath(this.currentDirectory, args[0]);
    const content = this.fileSystem.readFile(filePath);
    
    if (content === null) {
        this.print(`File not found: ${args[0]}`);
        return;
    }
    
    const lines = content.split('\n');
    this.print('Numbered lines:');
    lines.forEach((line, index) => {
        this.print(`${(index + 1).toString().padStart(6)}  ${line}`);
    });
};

// Обратный порядок строк
DOSEmulator.prototype.reverseFileLines = function(args) {
    if (!args[0]) {
        this.print('Usage: tac <filename>');
        return;
    }
    
    const filePath = this.fileSystem.resolvePath(this.currentDirectory, args[0]);
    const content = this.fileSystem.readFile(filePath);
    
    if (content === null) {
        this.print(`File not found: ${args[0]}`);
        return;
    }
    
    const lines = content.split('\n');
    const reversedLines = lines.reverse();
    
    this.print('Reversed lines:');
    reversedLines.forEach(line => this.print(line));
};

// Обратный порядок символов
DOSEmulator.prototype.reverseCharacters = function(args) {
    if (!args[0]) {
        this.print('Usage: rev <filename>');
        return;
    }
    
    const filePath = this.fileSystem.resolvePath(this.currentDirectory, args[0]);
    const content = this.fileSystem.readFile(filePath);
    
    if (content === null) {
        this.print(`File not found: ${args[0]}`);
        return;
    }
    
    const lines = content.split('\n');
    this.print('Reversed characters:');
    lines.forEach(line => {
        this.print(line.split('').reverse().join(''));
    });
};