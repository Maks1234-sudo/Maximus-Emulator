/**
 * Менеджер аудио для DOS эмулятора
 */
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.isEnabled = true;
        this.volume = 0.5;
        this.masterGain = null;
        
        this.initializeAudio();
        this.createDefaultSounds();
    }

    /**
     * Инициализация аудио контекста
     */
    async initializeAudio() {
        try {
            // Создаем аудио контекст
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;
            
            console.log('Audio context initialized successfully');
        } catch (error) {
            console.warn('Audio context initialization failed:', error);
            this.isEnabled = false;
        }
    }

    /**
     * Создание стандартных звуков
     */
    createDefaultSounds() {
        this.createBeepSound();
        this.createClickSound();
        this.createErrorSound();
        this.createSuccessSound();
        this.createBootSound();
        this.createGameSounds();
    }

    /**
     * Создание звука бипа
     */
    createBeepSound() {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        this.sounds.set('beep', { oscillator, gainNode, duration: 100 });
    }

    /**
     * Создание звука клика
     */
    createClickSound() {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        
        this.sounds.set('click', { oscillator, gainNode, duration: 50 });
    }

    /**
     * Создание звука ошибки
     */
    createErrorSound() {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime + 0.1);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        this.sounds.set('error', { oscillator, gainNode, duration: 200 });
    }

    /**
     * Создание звука успеха
     */
    createSuccessSound() {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.2); // G5
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        this.sounds.set('success', { oscillator, gainNode, duration: 300 });
    }

    /**
     * Создание звука загрузки
     */
    createBootSound() {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
        oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime + 0.5); // A5
        oscillator.type = 'triangle';
        
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime + 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.0);
        
        this.sounds.set('boot', { oscillator, gainNode, duration: 1000 });
    }

    /**
     * Создание игровых звуков
     */
    createGameSounds() {
        // Звук движения змейки
        this.createSnakeMoveSound();
        
        // Звук еды
        this.createEatSound();
        
        // Звук игры в тетрис
        this.createTetrisSound();
        
        // Звук падения блока
        this.createDropSound();
    }

    /**
     * Создание звука движения змейки
     */
    createSnakeMoveSound() {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.03, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        
        this.sounds.set('snake_move', { oscillator, gainNode, duration: 50 });
    }

    /**
     * Создание звука еды
     */
    createEatSound() {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.1);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        this.sounds.set('eat', { oscillator, gainNode, duration: 150 });
    }

    /**
     * Создание звука тетриса
     */
    createTetrisSound() {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        this.sounds.set('tetris', { oscillator, gainNode, duration: 100 });
    }

    /**
     * Создание звука падения блока
     */
    createDropSound() {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime + 0.2);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0.06, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);
        
        this.sounds.set('drop', { oscillator, gainNode, duration: 250 });
    }

    /**
     * Воспроизведение звука
     */
    playSound(soundName) {
        if (!this.isEnabled || !this.audioContext || !this.sounds.has(soundName)) {
            return;
        }

        try {
            const sound = this.sounds.get(soundName);
            
            // Создаем новые узлы для каждого воспроизведения
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Копируем параметры звука
            oscillator.frequency.setValueAtTime(sound.oscillator.frequency.value, this.audioContext.currentTime);
            oscillator.type = sound.oscillator.type;
            
            gainNode.gain.setValueAtTime(sound.gainNode.gain.value, this.audioContext.currentTime);
            
            // Воспроизводим
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + sound.duration / 1000);
            
        } catch (error) {
            console.warn('Failed to play sound:', soundName, error);
        }
    }

    /**
     * Воспроизведение бипа
     */
    beep() {
        this.playSound('beep');
    }

    /**
     * Воспроизведение клика
     */
    click() {
        this.playSound('click');
    }

    /**
     * Воспроизведение ошибки
     */
    error() {
        this.playSound('error');
    }

    /**
     * Воспроизведение успеха
     */
    success() {
        this.playSound('success');
    }

    /**
     * Воспроизведение загрузки
     */
    boot() {
        this.playSound('boot');
    }

    /**
     * Воспроизведение игровых звуков
     */
    playGameSound(soundName) {
        this.playSound(soundName);
    }

    /**
     * Установка громкости
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }

    /**
     * Получение громкости
     */
    getVolume() {
        return this.volume;
    }

    /**
     * Включение/выключение звука
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }

    /**
     * Проверка включен ли звук
     */
    isAudioEnabled() {
        return this.isEnabled;
    }

    /**
     * Создание пользовательского звука
     */
    createCustomSound(name, frequency, duration, type = 'sine', volume = 0.1) {
        if (!this.audioContext) return false;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
        
        this.sounds.set(name, { oscillator, gainNode, duration });
        return true;
    }

    /**
     * Воспроизведение мелодии
     */
    playMelody(notes, tempo = 120) {
        if (!this.isEnabled || !this.audioContext) return;

        const noteDuration = 60000 / tempo; // длительность ноты в мс
        
        notes.forEach((note, index) => {
            setTimeout(() => {
                if (note.frequency) {
                    this.createCustomSound(
                        `melody_${index}`,
                        note.frequency,
                        note.duration || noteDuration,
                        note.type || 'sine',
                        note.volume || 0.05
                    );
                    this.playSound(`melody_${index}`);
                }
            }, index * noteDuration);
        });
    }

    /**
     * Воспроизведение стандартной мелодии DOS
     */
    playDOSMelody() {
        const notes = [
            { frequency: 523, duration: 200 }, // C5
            { frequency: 659, duration: 200 }, // E5
            { frequency: 784, duration: 200 }, // G5
            { frequency: 1047, duration: 400 } // C6
        ];
        
        this.playMelody(notes, 120);
    }

    /**
     * Остановка всех звуков
     */
    stopAllSounds() {
        if (this.audioContext) {
            this.audioContext.suspend();
        }
    }

    /**
     * Возобновление аудио
     */
    resumeAudio() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    /**
     * Получение статуса аудио
     */
    getAudioStatus() {
        if (!this.audioContext) {
            return 'not_supported';
        }
        
        return {
            enabled: this.isEnabled,
            contextState: this.audioContext.state,
            volume: this.volume,
            soundsAvailable: this.sounds.size
        };
    }
}