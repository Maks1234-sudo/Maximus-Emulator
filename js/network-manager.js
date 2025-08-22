/**
 * Сетевой менеджер для DOS эмулятора
 */
class NetworkManager {
    constructor() {
        this.isEnabled = true;
        this.connections = new Map();
        this.servers = new Map();
        this.hosts = new Map();
        this.ports = new Set();
        this.networkConfig = {
            ip: '192.168.1.100',
            subnet: '255.255.255.0',
            gateway: '192.168.1.1',
            dns: ['8.8.8.8', '8.8.4.4'],
            hostname: 'DOS-EMULATOR',
            domain: 'local'
        };
        
        this.initializeNetwork();
    }

    /**
     * Инициализация сети
     */
    initializeNetwork() {
        this.setupDefaultHosts();
        this.setupDefaultServers();
        this.startNetworkServices();
    }

    /**
     * Настройка стандартных хостов
     */
    setupDefaultHosts() {
        // Локальные хосты
        this.hosts.set('localhost', '127.0.0.1');
        this.hosts.set('dos-emulator', '192.168.1.100');
        this.hosts.set('gateway', '192.168.1.1');
        
        // Публичные DNS серверы
        this.hosts.set('google-dns', '8.8.8.8');
        this.hosts.set('cloudflare-dns', '1.1.1.1');
        
        // Популярные сайты
        this.hosts.set('google.com', '142.250.185.78');
        this.hosts.set('github.com', '140.82.113.4');
        this.hosts.set('stackoverflow.com', '151.101.193.69');
    }

    /**
     * Настройка стандартных серверов
     */
    setupDefaultServers() {
        // HTTP сервер
        this.servers.set('http', {
            port: 80,
            protocol: 'HTTP',
            description: 'HTTP Web Server',
            status: 'running'
        });

        // FTP сервер
        this.servers.set('ftp', {
            port: 21,
            protocol: 'FTP',
            description: 'FTP File Server',
            status: 'running'
        });

        // Telnet сервер
        this.servers.set('telnet', {
            port: 23,
            protocol: 'TELNET',
            description: 'Telnet Terminal Server',
            status: 'stopped'
        });

        // SMTP сервер
        this.servers.set('smtp', {
            port: 25,
            protocol: 'SMTP',
            description: 'SMTP Mail Server',
            status: 'running'
        });

        // POP3 сервер
        this.servers.set('pop3', {
            port: 110,
            protocol: 'POP3',
            description: 'POP3 Mail Server',
            status: 'running'
        });
    }

    /**
     * Запуск сетевых сервисов
     */
    startNetworkServices() {
        // Эмуляция запуска сетевых сервисов
        console.log('Starting network services...');
        
        // Открываем стандартные порты
        this.openPort(80);
        this.openPort(21);
        this.openPort(25);
        this.openPort(110);
        
        console.log('Network services started successfully');
    }

    /**
     * Пинг хоста
     */
    async ping(hostname, count = 4) {
        if (!this.isEnabled) {
            return { error: 'Network is disabled' };
        }

        const ip = this.resolveHostname(hostname);
        if (!ip) {
            return { error: `Could not resolve hostname: ${hostname}` };
        }

        const results = [];
        const startTime = Date.now();

        for (let i = 0; i < count; i++) {
            const pingTime = await this.simulatePing(ip);
            results.push({
                sequence: i + 1,
                ip: ip,
                time: pingTime,
                status: pingTime > 0 ? 'success' : 'timeout'
            });

            // Небольшая задержка между пингами
            if (i < count - 1) {
                await this.delay(1000);
            }
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        return {
            hostname: hostname,
            ip: ip,
            results: results,
            summary: this.calculatePingSummary(results),
            totalTime: totalTime
        };
    }

    /**
     * Симуляция пинга
     */
    async simulatePing(ip) {
        // Симуляция сетевой задержки
        const baseDelay = 20 + Math.random() * 50; // 20-70ms
        const packetLoss = Math.random() < 0.05; // 5% потери пакетов
        
        if (packetLoss) {
            await this.delay(5000); // Таймаут
            return -1; // Таймаут
        }

        await this.delay(baseDelay);
        return Math.round(baseDelay);
    }

    /**
     * Расчет статистики пинга
     */
    calculatePingSummary(results) {
        const successfulPings = results.filter(r => r.status === 'success');
        
        if (successfulPings.length === 0) {
            return {
                sent: results.length,
                received: 0,
                lost: results.length,
                lossPercent: 100,
                minTime: 0,
                maxTime: 0,
                avgTime: 0
            };
        }

        const times = successfulPings.map(r => r.time);
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);

        return {
            sent: results.length,
            received: successfulPings.length,
            lost: results.length - successfulPings.length,
            lossPercent: Math.round((results.length - successfulPings.length) / results.length * 100),
            minTime: minTime,
            maxTime: maxTime,
            avgTime: avgTime
        };
    }

    /**
     * Разрешение имени хоста
     */
    resolveHostname(hostname) {
        // Сначала проверяем локальную таблицу хостов
        if (this.hosts.has(hostname)) {
            return this.hosts.get(hostname);
        }

        // Симуляция DNS запроса
        return this.simulateDNSLookup(hostname);
    }

    /**
     * Симуляция DNS запроса
     */
    simulateDNSLookup(hostname) {
        // Простая симуляция DNS
        const commonDomains = {
            'www.google.com': '142.250.185.78',
            'www.github.com': '140.82.113.4',
            'www.stackoverflow.com': '151.101.193.69',
            'www.microsoft.com': '13.107.42.14',
            'www.apple.com': '17.253.144.10'
        };

        if (commonDomains[hostname]) {
            return commonDomains[hostname];
        }

        // Генерируем случайный IP для неизвестных хостов
        return this.generateRandomIP();
    }

    /**
     * Генерация случайного IP
     */
    generateRandomIP() {
        const segments = [];
        for (let i = 0; i < 4; i++) {
            segments.push(Math.floor(Math.random() * 256));
        }
        return segments.join('.');
    }

    /**
     * Открытие порта
     */
    openPort(port) {
        this.ports.add(port);
        return true;
    }

    /**
     * Закрытие порта
     */
    closePort(port) {
        return this.ports.delete(port);
    }

    /**
     * Проверка открыт ли порт
     */
    isPortOpen(port) {
        return this.ports.has(port);
    }

    /**
     * Получение списка открытых портов
     */
    getOpenPorts() {
        return Array.from(this.ports).sort((a, b) => a - b);
    }

    /**
     * Создание TCP соединения
     */
    createConnection(host, port, protocol = 'TCP') {
        const connectionId = `${protocol}-${host}:${port}-${Date.now()}`;
        
        const connection = {
            id: connectionId,
            host: host,
            port: port,
            protocol: protocol,
            status: 'ESTABLISHED',
            localPort: this.getRandomLocalPort(),
            startTime: new Date(),
            bytesSent: 0,
            bytesReceived: 0
        };

        this.connections.set(connectionId, connection);
        return connectionId;
    }

    /**
     * Закрытие соединения
     */
    closeConnection(connectionId) {
        const connection = this.connections.get(connectionId);
        if (connection) {
            connection.status = 'CLOSED';
            connection.endTime = new Date();
            this.connections.delete(connectionId);
            return true;
        }
        return false;
    }

    /**
     * Получение случайного локального порта
     */
    getRandomLocalPort() {
        return 1024 + Math.floor(Math.random() * 64511);
    }

    /**
     * Получение активных соединений
     */
    getActiveConnections() {
        return Array.from(this.connections.values()).filter(conn => conn.status === 'ESTABLISHED');
    }

    /**
     * Получение статистики сети
     */
    getNetworkStats() {
        const activeConnections = this.getActiveConnections();
        const totalBytesSent = activeConnections.reduce((sum, conn) => sum + conn.bytesSent, 0);
        const totalBytesReceived = activeConnections.reduce((sum, conn) => sum + conn.bytesReceived, 0);

        return {
            activeConnections: activeConnections.length,
            openPorts: this.ports.size,
            totalBytesSent: totalBytesSent,
            totalBytesReceived: totalBytesReceived,
            uptime: this.getUptime(),
            ip: this.networkConfig.ip,
            hostname: this.networkConfig.hostname
        };
    }

    /**
     * Получение времени работы
     */
    getUptime() {
        // Симуляция времени работы
        const uptimeSeconds = Math.floor(Date.now() / 1000) % 86400; // Максимум 24 часа
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = uptimeSeconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * HTTP запрос
     */
    async httpRequest(url, method = 'GET', headers = {}) {
        if (!this.isEnabled) {
            return { error: 'Network is disabled' };
        }

        try {
            // Симуляция HTTP запроса
            const response = await this.simulateHTTPRequest(url, method, headers);
            return response;
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Симуляция HTTP запроса
     */
    async simulateHTTPRequest(url, method, headers) {
        // Симуляция сетевой задержки
        await this.delay(100 + Math.random() * 500);

        // Простые ответы для популярных сайтов
        const responses = {
            'http://www.google.com': {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'text/html' },
                body: '<html><body><h1>Google</h1><p>Search the web</p></body></html>'
            },
            'http://www.github.com': {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'text/html' },
                body: '<html><body><h1>GitHub</h1><p>Where the world builds software</p></body></html>'
            }
        };

        if (responses[url]) {
            return responses[url];
        }

        // Стандартный ответ
        return {
            status: 200,
            statusText: 'OK',
            headers: { 'Content-Type': 'text/html' },
            body: `<html><body><h1>DOS Emulator</h1><p>HTTP request to ${url}</p></body></html>`
        };
    }

    /**
     * FTP команды
     */
    async ftpCommand(command, args = []) {
        if (!this.isEnabled) {
            return { error: 'Network is disabled' };
        }

        const commands = {
            'ls': () => this.ftpList(),
            'get': (filename) => this.ftpGet(filename),
            'put': (filename) => this.ftpPut(filename),
            'cd': (directory) => this.ftpChangeDirectory(directory),
            'pwd': () => this.ftpGetCurrentDirectory()
        };

        if (commands[command]) {
            return await commands[command](...args);
        }

        return { error: `Unknown FTP command: ${command}` };
    }

    /**
     * FTP список файлов
     */
    ftpList() {
        return {
            files: [
                { name: 'README.TXT', size: 1024, type: 'file' },
                { name: 'DOS', size: 0, type: 'directory' },
                { name: 'GAMES', size: 0, type: 'directory' },
                { name: 'UTILS', size: 0, type: 'directory' }
            ]
        };
    }

    /**
     * FTP получение файла
     */
    ftpGet(filename) {
        return {
            filename: filename,
            size: 1024,
            content: `Content of ${filename}`,
            status: 'success'
        };
    }

    /**
     * FTP отправка файла
     */
    ftpPut(filename) {
        return {
            filename: filename,
            status: 'success',
            message: `File ${filename} uploaded successfully`
        };
    }

    /**
     * FTP смена директории
     */
    ftpChangeDirectory(directory) {
        return {
            status: 'success',
            message: `Changed directory to ${directory}`
        };
    }

    /**
     * FTP текущая директория
     */
    ftpGetCurrentDirectory() {
        return {
            directory: '/DOS'
        };
    }

    /**
     * Настройка сети
     */
    configureNetwork(config) {
        this.networkConfig = { ...this.networkConfig, ...config };
        return true;
    }

    /**
     * Получение конфигурации сети
     */
    getNetworkConfig() {
        return { ...this.networkConfig };
    }

    /**
     * Включение/выключение сети
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            // Закрываем все соединения
            this.connections.clear();
        }
    }

    /**
     * Проверка включена ли сеть
     */
    isNetworkEnabled() {
        return this.isEnabled;
    }

    /**
     * Задержка
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}