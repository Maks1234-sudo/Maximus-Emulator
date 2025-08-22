/**
 * Виртуальная файловая система для DOS эмулятора
 */
class VirtualFileSystem {
    constructor() {
        this.files = new Map();
        this.directories = new Set();
        this.initializeRoot();
    }

    /**
     * Инициализация корневой директории
     */
    initializeRoot() {
        this.directories.add('C:\\');
        this.directories.add('C:');
    }

    /**
     * Создание файла
     */
    createFile(path, content = '', type = 'text') {
        const normalizedPath = this.normalizePath(path);
        
        if (this.files.has(normalizedPath)) {
            return false; // Файл уже существует
        }

        const directory = this.getDirectoryFromPath(normalizedPath);
        if (!this.directories.has(directory)) {
            this.createDirectory(directory);
        }

        const fileName = this.getFileNameFromPath(normalizedPath);
        const extension = this.getFileExtension(fileName);
        
        this.files.set(normalizedPath, {
            name: fileName,
            path: normalizedPath,
            content: content,
            type: this.getFileType(extension),
            size: content.length,
            date: this.getCurrentDate(),
            time: this.getCurrentTime(),
            extension: extension
        });

        return true;
    }

    /**
     * Чтение файла
     */
    readFile(path) {
        const normalizedPath = this.normalizePath(path);
        const file = this.files.get(normalizedPath);
        return file ? file.content : null;
    }

    /**
     * Запись в файл
     */
    writeFile(path, content) {
        const normalizedPath = this.normalizePath(path);
        const file = this.files.get(normalizedPath);
        
        if (file) {
            file.content = content;
            file.size = content.length;
            file.date = this.getCurrentDate();
            file.time = this.getCurrentTime();
            return true;
        }
        
        return false;
    }

    /**
     * Удаление файла
     */
    deleteFile(path) {
        const normalizedPath = this.normalizePath(path);
        return this.files.delete(normalizedPath);
    }

    /**
     * Копирование файла
     */
    copyFile(sourcePath, destPath) {
        const sourceContent = this.readFile(sourcePath);
        if (sourceContent === null) {
            return false;
        }

        return this.createFile(destPath, sourceContent);
    }

    /**
     * Создание директории
     */
    createDirectory(path) {
        const normalizedPath = this.normalizePath(path);
        
        if (this.directories.has(normalizedPath)) {
            return false; // Директория уже существует
        }

        this.directories.add(normalizedPath);
        return true;
    }

    /**
     * Удаление директории
     */
    removeDirectory(path) {
        const normalizedPath = this.normalizePath(path);
        
        // Проверяем, что директория пуста
        for (const filePath of this.files.keys()) {
            if (filePath.startsWith(normalizedPath + '\\') && filePath !== normalizedPath) {
                return false; // Директория не пуста
            }
        }

        return this.directories.delete(normalizedPath);
    }

    /**
     * Проверка существования директории
     */
    directoryExists(path) {
        const normalizedPath = this.normalizePath(path);
        return this.directories.has(normalizedPath);
    }

    /**
     * Проверка существования файла
     */
    fileExists(path) {
        const normalizedPath = this.normalizePath(path);
        return this.files.has(normalizedPath);
    }

    /**
     * Получение файла
     */
    getFile(path) {
        const normalizedPath = this.normalizePath(path);
        return this.files.get(normalizedPath);
    }

    /**
     * Список содержимого директории
     */
    listDirectory(path) {
        const normalizedPath = this.normalizePath(path);
        
        if (!this.directories.has(normalizedPath)) {
            return null; // Директория не существует
        }

        const files = [];
        
        // Добавляем файлы из текущей директории
        for (const [filePath, file] of this.files) {
            const fileDir = this.getDirectoryFromPath(filePath);
            if (fileDir === normalizedPath) {
                files.push(file);
            }
        }

        // Добавляем поддиректории
        for (const dirPath of this.directories) {
            if (dirPath !== normalizedPath && dirPath.startsWith(normalizedPath + '\\')) {
                const relativePath = dirPath.substring(normalizedPath.length + 1);
                const dirName = relativePath.split('\\')[0];
                const fullDirPath = normalizedPath + '\\' + dirName;
                
                // Проверяем, что это прямая поддиректория
                if (fullDirPath === dirPath) {
                    files.push({
                        name: dirName,
                        path: dirPath,
                        type: 'directory',
                        size: null,
                        date: this.getCurrentDate(),
                        time: this.getCurrentTime()
                    });
                }
            }
        }

        // Сортируем: сначала директории, потом файлы
        files.sort((a, b) => {
            if (a.type === 'directory' && b.type !== 'directory') return -1;
            if (a.type !== 'directory' && b.type === 'directory') return 1;
            return a.name.localeCompare(b.name);
        });

        return files;
    }

    /**
     * Разрешение пути
     */
    resolvePath(currentPath, targetPath) {
        if (targetPath.includes(':')) {
            // Абсолютный путь
            return this.normalizePath(targetPath);
        }

        if (targetPath.startsWith('\\')) {
            // Путь от корня текущего диска
            const drive = currentPath.split('\\')[0];
            return this.normalizePath(drive + targetPath);
        }

        if (targetPath === '.' || targetPath === '') {
            return currentPath;
        }

        if (targetPath === '..') {
            return this.getParentDirectory(currentPath);
        }

        // Относительный путь
        const resolvedPath = currentPath.endsWith('\\') 
            ? currentPath + targetPath 
            : currentPath + '\\' + targetPath;
        
        return this.normalizePath(resolvedPath);
    }

    /**
     * Получение родительской директории
     */
    getParentDirectory(path) {
        const parts = path.split('\\');
        if (parts.length <= 2) {
            return parts[0] + '\\';
        }
        return parts.slice(0, -1).join('\\');
    }

    /**
     * Нормализация пути
     */
    normalizePath(path) {
        // Убираем лишние слеши и приводим к верхнему регистру
        let normalized = path.replace(/[\/\\]+/g, '\\').toUpperCase();
        
        // Убираем завершающий слеш для файлов
        if (normalized.endsWith('\\') && !this.isDirectoryPath(normalized)) {
            normalized = normalized.slice(0, -1);
        }
        
        return normalized;
    }

    /**
     * Проверка, является ли путь директорией
     */
    isDirectoryPath(path) {
        return path.endsWith('\\') || !path.includes('.');
    }

    /**
     * Получение директории из пути
     */
    getDirectoryFromPath(path) {
        const lastSlash = path.lastIndexOf('\\');
        if (lastSlash === -1) {
            return path;
        }
        return path.substring(0, lastSlash + 1);
    }

    /**
     * Получение имени файла из пути
     */
    getFileNameFromPath(path) {
        const lastSlash = path.lastIndexOf('\\');
        if (lastSlash === -1) {
            return path;
        }
        return path.substring(lastSlash + 1);
    }

    /**
     * Получение расширения файла
     */
    getFileExtension(filename) {
        const lastDot = filename.lastIndexOf('.');
        if (lastDot === -1) {
            return '';
        }
        return filename.substring(lastDot + 1);
    }

    /**
     * Определение типа файла по расширению
     */
    getFileType(extension) {
        const executableExtensions = ['exe', 'com', 'bat'];
        const textExtensions = ['txt', 'bat', 'sys', 'ini', 'cfg'];
        
        if (executableExtensions.includes(extension.toLowerCase())) {
            return 'executable';
        } else if (textExtensions.includes(extension.toLowerCase())) {
            return 'text';
        } else {
            return 'binary';
        }
    }

    /**
     * Получение текущей даты в DOS формате
     */
    getCurrentDate() {
        const now = new Date();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const year = now.getFullYear().toString().slice(-2);
        return `${month}/${day}/${year}`;
    }

    /**
     * Получение текущего времени в DOS формате
     */
    getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    /**
     * Поиск файлов
     */
    searchFiles(pattern, directory = 'C:\\') {
        const files = [];
        const normalizedDir = this.normalizePath(directory);
        
        for (const [filePath, file] of this.files) {
            if (filePath.startsWith(normalizedDir)) {
                if (this.matchesPattern(file.name, pattern)) {
                    files.push(file);
                }
            }
        }
        
        return files;
    }

    /**
     * Проверка соответствия имени файла шаблону
     */
    matchesPattern(filename, pattern) {
        // Простая реализация с поддержкой * и ?
        const regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        
        const regex = new RegExp(`^${regexPattern}$`, 'i');
        return regex.test(filename);
    }

    /**
     * Получение размера директории
     */
    getDirectorySize(path) {
        const normalizedPath = this.normalizePath(path);
        let totalSize = 0;
        let fileCount = 0;
        
        for (const [filePath, file] of this.files) {
            if (filePath.startsWith(normalizedPath)) {
                totalSize += file.size || 0;
                fileCount++;
            }
        }
        
        return { size: totalSize, files: fileCount };
    }

    /**
     * Создание архива директории
     */
    createArchive(path) {
        const normalizedPath = this.normalizePath(path);
        const files = [];
        
        for (const [filePath, file] of this.files) {
            if (filePath.startsWith(normalizedPath)) {
                files.push({
                    path: filePath.substring(normalizedPath.length),
                    content: file.content,
                    size: file.size
                });
            }
        }
        
        return {
            directory: normalizedPath,
            files: files,
            totalSize: files.reduce((sum, file) => sum + file.size, 0),
            created: this.getCurrentDate() + ' ' + this.getCurrentTime()
        };
    }

    /**
     * Экспорт файловой системы
     */
    export() {
        return {
            files: Array.from(this.files.entries()),
            directories: Array.from(this.directories),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Импорт файловой системы
     */
    import(data) {
        if (data.files) {
            this.files = new Map(data.files);
        }
        if (data.directories) {
            this.directories = new Set(data.directories);
        }
    }
}