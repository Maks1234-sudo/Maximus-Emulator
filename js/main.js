/**
 * Основной файл приложения DOS эмулятора
 */
class DOSEmulatorApp {
    constructor() {
        this.dosEmulator = null;
        this.audioManager = null;
        this.networkManager = null;
        this.gameLoader = null;
        this.isInitialized = false;
        
        this.initializeApp();
    }

    /**
     * Инициализация приложения
     */
    async initializeApp() {
        try {
            console.log('Initializing DOS Emulator...');
            
            // Инициализация менеджеров
            this.audioManager = new AudioManager();
            this.networkManager = new NetworkManager();
            
            // Инициализация DOS эмулятора
            this.dosEmulator = new DOSEmulator();
            
            // Инициализация загрузчика игр
            this.gameLoader = new GameLoader(this.dosEmulator);
            
            // Настройка обработчиков событий
            this.setupEventListeners();
            
            // Загрузка настроек
            this.loadSettings();
            
            this.isInitialized = true;
            console.log('DOS Emulator initialized successfully!');
            
            // Воспроизведение звука загрузки
            if (this.audioManager.isAudioEnabled()) {
                this.audioManager.boot();
            }
            
        } catch (error) {
            console.error('Failed to initialize DOS Emulator:', error);
            this.showError('Failed to initialize DOS Emulator: ' + error.message);
        }
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Главное меню
        document.getElementById('start-dos').addEventListener('click', () => {
            this.startDOS();
        });

        document.getElementById('load-game').addEventListener('click', () => {
            this.showFileUploadModal();
        });

        document.getElementById('settings').addEventListener('click', () => {
            this.showSettingsModal();
        });

        document.getElementById('about').addEventListener('click', () => {
            this.showAbout();
        });

        // Модальные окна
        this.setupModalEventListeners();
        
        // Обработка клавиш
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeyPress(e);
        });

        // Обработка кликов вне модальных окон
        document.addEventListener('click', (e) => {
            this.handleOutsideClick(e);
        });
    }

    /**
     * Настройка обработчиков модальных окон
     */
    setupModalEventListeners() {
        // Закрытие модальных окон
        document.querySelectorAll('.close-modal, .btn.cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.hideModal(modal);
                }
            });
        });

        // Загрузка файла
        document.getElementById('upload-file').addEventListener('click', () => {
            this.uploadFile();
        });

        // Сохранение настроек
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Обработка выбора файла
        document.getElementById('file-input').addEventListener('change', (e) => {
            this.handleFileSelection(e);
        });
    }

    /**
     * Запуск DOS
     */
    startDOS() {
        if (!this.isInitialized) {
            this.showError('DOS Emulator is not initialized');
            return;
        }

        // Воспроизведение звука клика
        if (this.audioManager.isAudioEnabled()) {
            this.audioManager.click();
        }

        // Скрытие главного меню
        document.getElementById('main-menu').classList.add('hidden');
        
        // Показ DOS терминала
        document.getElementById('dos-terminal').classList.remove('hidden');
        
        // Фокус на ввод
        setTimeout(() => {
            document.getElementById('dos-input').focus();
        }, 100);

        console.log('DOS started');
    }

    /**
     * Показать модальное окно загрузки файла
     */
    showFileUploadModal() {
        if (this.audioManager.isAudioEnabled()) {
            this.audioManager.click();
        }
        document.getElementById('file-upload-modal').classList.remove('hidden');
    }

    /**
     * Показать модальное окно настроек
     */
    showSettingsModal() {
        if (this.audioManager.isAudioEnabled()) {
            this.audioManager.click();
        }
        
        // Заполнение текущих настроек
        document.getElementById('cpu-speed').value = this.dosEmulator.settings.cpuSpeed;
        document.getElementById('memory-size').value = this.dosEmulator.settings.memorySize;
        document.getElementById('sound-enabled').checked = this.audioManager.isAudioEnabled();
        document.getElementById('network-enabled').checked = this.networkManager.isNetworkEnabled();
        
        document.getElementById('settings-modal').classList.remove('hidden');
    }

    /**
     * Показать информацию о программе
     */
    showAbout() {
        if (this.audioManager.isAudioEnabled()) {
            this.audioManager.click();
        }

        const aboutText = `
DOS Emulator v1.0
================

A web-based DOS emulator with support for:
- Classic DOS commands and file system
- Audio system with various sound effects
- Network emulation (ping, HTTP, FTP)
- Built-in games (Snake, Tetris, Pac-Man, Pong)
- Modern web interface with retro styling

Features:
- Virtual file system
- Command history
- Sound effects and music
- Network simulation
- Game emulation
- Responsive design

Controls:
- Arrow keys for navigation
- Enter to execute commands
- ESC to exit games
- Mouse for interface interaction

Created with HTML5, CSS3, and JavaScript
© 2024 DOS Emulator Team
        `;

        this.showAlert('About DOS Emulator', aboutText);
    }

    /**
     * Загрузка файла
     */
    uploadFile() {
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showError('Please select a file');
            return;
        }

        // Воспроизведение звука успеха
        if (this.audioManager.isAudioEnabled()) {
            this.audioManager.success();
        }

        // Здесь можно добавить обработку загруженного файла
        console.log('File uploaded:', file.name);
        
        this.dosEmulator.print(`File uploaded: ${file.name}`);
        this.hideModal(document.getElementById('file-upload-modal'));
        
        // Очистка input
        fileInput.value = '';
    }

    /**
     * Обработка выбора файла
     */
    handleFileSelection(e) {
        const file = e.target.files[0];
        if (file) {
            console.log('File selected:', file.name);
        }
    }

    /**
     * Сохранение настроек
     */
    saveSettings() {
        const cpuSpeed = parseFloat(document.getElementById('cpu-speed').value);
        const memorySize = parseInt(document.getElementById('memory-size').value);
        const soundEnabled = document.getElementById('sound-enabled').checked;
        const networkEnabled = document.getElementById('network-enabled').checked;

        // Обновление настроек DOS эмулятора
        this.dosEmulator.settings.cpuSpeed = cpuSpeed;
        this.dosEmulator.settings.memorySize = memorySize;

        // Обновление аудио менеджера
        this.audioManager.setEnabled(soundEnabled);

        // Обновление сетевого менеджера
        this.networkManager.setEnabled(networkEnabled);

        // Сохранение в localStorage
        this.saveSettingsToStorage();

        // Воспроизведение звука успеха
        if (this.audioManager.isAudioEnabled()) {
            this.audioManager.success();
        }

        this.hideModal(document.getElementById('settings-modal'));
        this.showSuccess('Settings saved successfully!');
    }

    /**
     * Загрузка настроек
     */
    loadSettings() {
        try {
            const settings = localStorage.getItem('dosEmulatorSettings');
            if (settings) {
                const parsedSettings = JSON.parse(settings);
                
                // Применение настроек
                this.dosEmulator.settings = { ...this.dosEmulator.settings, ...parsedSettings };
                this.audioManager.setEnabled(parsedSettings.soundEnabled !== false);
                this.networkManager.setEnabled(parsedSettings.networkEnabled !== false);
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }

    /**
     * Сохранение настроек в localStorage
     */
    saveSettingsToStorage() {
        try {
            const settings = {
                cpuSpeed: this.dosEmulator.settings.cpuSpeed,
                memorySize: this.dosEmulator.settings.memorySize,
                soundEnabled: this.audioManager.isAudioEnabled(),
                networkEnabled: this.networkManager.isNetworkEnabled()
            };
            
            localStorage.setItem('dosEmulatorSettings', JSON.stringify(settings));
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }

    /**
     * Обработка глобальных нажатий клавиш
     */
    handleGlobalKeyPress(e) {
        // ESC для закрытия модальных окон
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal:not(.hidden)');
            if (openModal) {
                this.hideModal(openModal);
            }
        }

        // F11 для полноэкранного режима
        if (e.key === 'F11') {
            e.preventDefault();
            this.toggleFullscreen();
        }

        // Ctrl+S для сохранения настроек
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.saveSettings();
        }
    }

    /**
     * Обработка кликов вне модальных окон
     */
    handleOutsideClick(e) {
        if (e.target.classList.contains('modal')) {
            this.hideModal(e.target);
        }
    }

    /**
     * Скрытие модального окна
     */
    hideModal(modal) {
        modal.classList.add('hidden');
        
        // Воспроизведение звука клика
        if (this.audioManager.isAudioEnabled()) {
            this.audioManager.click();
        }
    }

    /**
     * Переключение полноэкранного режима
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn('Failed to enter fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * Показать алерт
     */
    showAlert(title, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'dos-alert';
        alertDiv.innerHTML = `
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="dos-alert-buttons">
                <button class="dos-alert-btn" onclick="this.parentElement.parentElement.remove()">OK</button>
            </div>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Автоматическое удаление через 5 секунд
        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.remove();
            }
        }, 5000);
    }

    /**
     * Показать ошибку
     */
    showError(message) {
        this.showAlert('Error', message);
        
        // Воспроизведение звука ошибки
        if (this.audioManager.isAudioEnabled()) {
            this.audioManager.error();
        }
    }

    /**
     * Показать успех
     */
    showSuccess(message) {
        this.showAlert('Success', message);
        
        // Воспроизведение звука успеха
        if (this.audioManager.isAudioEnabled()) {
            this.audioManager.success();
        }
    }

    /**
     * Получение статуса приложения
     */
    getAppStatus() {
        return {
            initialized: this.isInitialized,
            audio: this.audioManager ? this.audioManager.getAudioStatus() : null,
            network: this.networkManager ? this.networkManager.getNetworkStats() : null,
            dos: this.dosEmulator ? {
                currentDirectory: this.dosEmulator.currentDirectory,
                isRunning: this.dosEmulator.isRunning,
                settings: this.dosEmulator.settings
            } : null
        };
    }

    /**
     * Перезапуск приложения
     */
    restart() {
        console.log('Restarting DOS Emulator...');
        
        // Остановка всех компонентов
        if (this.audioManager) {
            this.audioManager.stopAllSounds();
        }
        
        if (this.networkManager) {
            this.networkManager.setEnabled(false);
        }
        
        // Перезагрузка страницы
        location.reload();
    }

    /**
     * Экспорт состояния
     */
    exportState() {
        const state = {
            dos: this.dosEmulator ? this.dosEmulator.fileSystem.export() : null,
            settings: this.dosEmulator ? this.dosEmulator.settings : null,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dos-emulator-state.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }

    /**
     * Импорт состояния
     */
    importState(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const state = JSON.parse(e.target.result);
                
                if (state.dos && this.dosEmulator) {
                    this.dosEmulator.fileSystem.import(state.dos);
                }
                
                if (state.settings && this.dosEmulator) {
                    this.dosEmulator.settings = { ...this.dosEmulator.settings, ...state.settings };
                }
                
                this.showSuccess('State imported successfully!');
            } catch (error) {
                this.showError('Failed to import state: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.dosApp = new DOSEmulatorApp();
    
    // Добавление глобальных функций для отладки
    window.getDOSStatus = () => window.dosApp.getAppStatus();
    window.restartDOS = () => window.dosApp.restart();
    window.exportDOSState = () => window.dosApp.exportState();
    
    console.log('DOS Emulator App loaded successfully!');
});

// Обработка ошибок
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    if (window.dosApp) {
        window.dosApp.showError('An error occurred: ' + e.error.message);
    }
});

// Обработка необработанных промисов
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    if (window.dosApp) {
        window.dosApp.showError('An unhandled error occurred: ' + e.reason);
    }
});