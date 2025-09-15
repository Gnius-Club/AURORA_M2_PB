// A.U.R.O.R.A. Mission 2 - Sequential Collection Game Logic (Fixed)
class AuroraSequentialGame {
    constructor() {
        // Game data from JSON
        this.levels = [
            // SWAPPED: Original Level 2 is now Level 1
            {
                id: 1, // Corrected ID
                name: "Navegación Avanzada",
                gridSize: 7,
                roverStart: {x: 0, y: 3},
                roverDirection: 1,
                target: {x: 6, y: 3, icon: "🏆"},
                obstacles: [
                    {x: 1, y: 1}, {x: 1, y: 2}, {x: 1, y: 4}, {x: 1, y: 5}, 
                    {x: 3, y: 0}, {x: 3, y: 1}, {x: 3, y: 2}, {x: 3, y: 4}, {x: 3, y: 5}, {x: 3, y: 6},
                    {x: 5, y: 1}, {x: 5, y: 2}, {x: 5, y: 4}, {x: 5, y: 5},
                ],
                maxSteps: 20,
            },
            // SWAPPED: Original Level 1 is now Level 2
            {
                id: 2, // Corrected ID
                name: "Ruta de Calibración",
                gridSize: 6,
                roverStart: {x: 0, y: 0},
                roverDirection: 1,
                target: {x: 5, y: 5, icon: "🏆"},
                obstacles: [{x: 2, y: 1}, {x: 2, y: 2}, {x: 2, y: 3}, {x: 3, y: 3}],
                maxSteps: 15,
            },
            {
                id: 3,
                name: "Desafío del Laberinto",
                gridSize: 8,
                roverStart: {x: 0, y: 0},
                roverDirection: 1,
                target: {x: 7, y: 7, icon: "🏆"},
                obstacles: [
                    {x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1}, {x: 4, y: 1}, {x: 5, y: 1},
                    {x: 1, y: 3}, {x: 2, y: 3}, {x: 3, y: 3}, {x: 4, y: 3},
                    {x: 6, y: 2}, {x: 6, y: 3}, {x: 6, y: 4}, {x: 6, y: 5},
                    {x: 2, y: 5}, {x: 3, y: 5}, {x: 4, y: 5},
                    {x: 1, y: 6}, {x: 4, y: 7}
                ],
                maxSteps: 30,
            }
        ];

        this.commands = [
            {id: "moveForward", name: "moverAdelante()", icon: "⬆️", color: "green"},
            {id: "turnRight", name: "girarDerecha()", icon: "↪️", color: "blue"},
            {id: "turnLeft", name: "girarIzquierda()", icon: "↩️", color: "yellow"},
            {id: "lightOn", name: "encenderLuz()", icon: "💡", color: "orange"}
        ];

        this.tutorialSteps = [
            {step: 1, title: "Misión: Calibración de Secuencia", message: "¡Bienvenido, Piloto! Tu misión es programar una secuencia de comandos para guiar al rover A.U.R.O.R.A. hasta su destino."},
            {step: 2, title: "El Objetivo: Punto X", message: "Tu único objetivo es llegar a la meta final (🏆), marcada como 'Punto X'. El camino no siempre será una línea recta."},
            {step: 3, title: "Comandos de Navegación", message: "Usa los comandos moverAdelante(), girarIzquierda() y girarDerecha() para construir tu ruta. Arrástralos a la secuencia de calibración."},
            {step: 4, title: "Evitando Obstáculos", message: "El simulador incluye obstáculos (🪨) que bloquean tu paso. Deberás planificar tu ruta para rodearlos. ¡Chocar reiniciará tu posición!"},
            {step: 5, title: "¡Listo para Calibrar!", message: "El tiempo corre, piloto. ¡Demuestra tu habilidad de navegación y completa la calibración! ¡Buena suerte!"}
        ];

        this.victoryMessages = {
            level1: "¡Calibración básica completada! El siguiente mapa requiere mayor precisión.",
            level2: "¡Navegación impresionante! Has superado los obstáculos. El laberinto final te espera...", 
            level3: "¡MISIÓN AURORA COMPLETADA! ¡Eres oficialmente un MAESTRO NAVEGADOR!"
        };

        // Game state
        this.currentLevel = 0;
        this.roverPosition = {x: 0, y: 0};
        this.roverDirection = 1; // 0: up, 1: right, 2: down, 3: left
        this.directions = ["↑", "→", "↓", "←"];
        this.sequence = [];
        this.isExecuting = false;
        this.tutorialStep = 1;
        this.audioContext = null;

        // Timer state
        this.timerInterval = null;
        this.elapsedTime = 0;

        this.init();
    }

    init() {
        console.log('Initializing A.U.R.O.R.A. Sequence Calibration Game...');
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.startGame());
        } else {
            this.startGame();
        }
    }

    startGame() {
        this.initAudio();
        this.updateTimerDisplay(); // Show 00:00 at start
        this.loadLevel(0);
        this.createCommandBlocks();
        this.createSequenceSlots();
        this.setupEventListeners();
        this.updateGameStatus("Completa el tutorial para comenzar tu misión");
        
        setTimeout(() => {
            this.startTutorial();
        }, 1000);
    }
    
    // Timer Logic
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.elapsedTime = 0;
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            this.elapsedTime++;
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }
    
    resetTimer() {
        this.stopTimer();
        this.elapsedTime = 0;
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('stopwatch');
        if (!timerElement) return;
        
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = this.elapsedTime % 60;
        
        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        timerElement.textContent = formattedTime;
    }


    // Audio System
    initAudio() {
        try {
            const initAudioContext = () => {
                if (!this.audioContext) {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }
            };
            document.addEventListener('click', initAudioContext, { once: true });
            document.addEventListener('touchstart', initAudioContext, { once: true });
        } catch (e) {
            console.warn('Audio not supported');
        }
    }

    playSound(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.warn('Audio playback failed:', e);
        }
    }

    playSoundEffect(effect) {
        switch (effect) {
            case 'drag': this.playSound(440, 0.1, 'square'); break;
            case 'drop': this.playSound(660, 0.2, 'sine'); break;
            case 'launch': this.playSound(220, 0.5, 'sawtooth'); setTimeout(() => this.playSound(330, 0.3, 'sawtooth'), 200); break;
            case 'move': this.playSound(200, 0.3, 'triangle'); break;
            case 'collect': this.playSound(880, 0.3, 'sine'); setTimeout(() => this.playSound(880 * 1.5, 0.3, 'sine'), 150); break;
            case 'crash': this.playSound(150, 0.5, 'sawtooth'); break;
            case 'levelVictory': const notes = [262, 330, 392, 523]; notes.forEach((note, i) => { setTimeout(() => this.playSound(note, 0.4, 'sine'), i * 200); }); break;
            case 'finalVictory': const epicNotes = [262, 330, 392, 523, 659, 784, 1047]; epicNotes.forEach((note, i) => { setTimeout(() => this.playSound(note, 0.5, 'sine'), i * 150); }); break;
        }
    }

    // Level Management
    loadLevel(levelIndex) {
        this.currentLevel = levelIndex;
        const level = this.levels[levelIndex];
        
        this.roverPosition = {...level.roverStart};
        this.roverDirection = level.roverDirection;
        this.sequence = [];
        
        this.updateLevelInfo(level);
        this.createMarsGrid();
        this.clearSequence();
        this.updateProgressIndicators();
    }

    updateLevelInfo(level) {
        document.getElementById('current-level').textContent = `NIVEL ${level.id}`;
        document.getElementById('level-name').textContent = level.name;
        document.getElementById('steps-count').textContent = `Pasos: 0/${level.maxSteps}`;
    }

    // Grid Creation
    createMarsGrid() {
        const grid = document.getElementById('mars-grid');
        const level = this.levels[this.currentLevel];
        grid.innerHTML = '';
        grid.className = `mars-grid grid-${level.gridSize}x${level.gridSize}`;
        
        for (let y = 0; y < level.gridSize; y++) {
            for (let x = 0; x < level.gridSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                if (x === this.roverPosition.x && y === this.roverPosition.y) {
                    cell.classList.add('rover');
                    cell.innerHTML = `<span style="transform: rotate(${(this.roverDirection - 1) * 90}deg); display: inline-block;">🤖</span>`;
                } else if (level.obstacles.some(obs => obs.x === x && obs.y === y)) {
                    cell.classList.add('obstacle');
                    cell.innerHTML = '🪨';
                } else if (x === level.target.x && y === level.target.y) {
                    cell.classList.add('target');
                    cell.innerHTML = `<span class="pulse">${level.target.icon}</span>`;
                }
                
                grid.appendChild(cell);
            }
        }
    }

    updateProgressIndicators() {
        const level = this.levels[this.currentLevel];
        const stepsCount = document.getElementById('steps-count');
        
        document.getElementById('objectives-progress').textContent = `Objetivo: Llega a 🏆`;
        if (stepsCount) {
            stepsCount.textContent = `Pasos: ${this.sequence.length}/${level.maxSteps}`;
        }
    }

    // Command Blocks
    createCommandBlocks() {
        const container = document.getElementById('command-blocks');
        if (!container) return;
        container.innerHTML = '';
        
        this.commands.forEach(command => {
            const block = document.createElement('div');
            block.className = `command-block ${command.color}`;
            block.draggable = true;
            block.dataset.command = command.id;
            block.innerHTML = `<span class="command-icon">${command.icon}</span><div>${command.name}</div>`;
            block.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', command.id); e.dataTransfer.effectAllowed = 'copy'; this.playSoundEffect('drag'); });
            block.addEventListener('click', () => {
                const firstEmptySlot = document.querySelector('.sequence-slot:not(.has-command)');
                if (firstEmptySlot) { this.addToSequence(firstEmptySlot, command); this.playSoundEffect('drop'); }
            });
            container.appendChild(block);
        });
    }

    // Sequence Slots
    createSequenceSlots() {
        const container = document.getElementById('sequence-slots');
        if (!container) return;
        container.innerHTML = '';
        const level = this.levels[this.currentLevel];
        
        for (let i = 1; i <= level.maxSteps; i++) {
            const slot = document.createElement('div');
            slot.className = 'sequence-slot';
            slot.dataset.slot = i;
            slot.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; slot.classList.add('drag-over'); });
            slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');
                const commandId = e.dataTransfer.getData('text/plain');
                const command = this.commands.find(c => c.id === commandId);
                if (command && !slot.classList.contains('has-command')) { this.addToSequence(slot, command); this.playSoundEffect('drop'); }
            });
            container.appendChild(slot);
        }
    }

    addToSequence(slot, command) {
        slot.innerHTML = '';
        slot.classList.add('has-command');
        const block = document.createElement('div');
        block.className = `command-block ${command.color}`;
        block.innerHTML = `<span class="command-icon">${command.icon}</span><div style="font-size: 0.8em;">${command.name}</div>`;
        block.addEventListener('click', (e) => { e.stopPropagation(); slot.innerHTML = ''; slot.classList.remove('has-command'); this.updateSequence(); });
        slot.appendChild(block);
        this.updateSequence();
    }

    updateSequence() {
        this.sequence = [];
        document.querySelectorAll('.sequence-slot.has-command').forEach(slot => {
            const icon = slot.querySelector('.command-icon')?.textContent;
            const command = this.commands.find(c => c.icon === icon);
            if (command) this.sequence.push(command.id);
        });
        this.updateProgressIndicators();
        this.updateGameStatus(this.sequence.length === 0 ? "Arrastra comandos para crear tu secuencia" : `Secuencia: ${this.sequence.length} comando(s) - ¡Listo para ejecutar!`);
    }

    setupEventListeners() {
        document.getElementById('launch-sequence').addEventListener('click', () => this.launchSequence());
        document.getElementById('clear-sequence').addEventListener('click', () => this.clearSequence());
        document.getElementById('next-level').addEventListener('click', () => this.nextLevel());
        document.getElementById('play-again').addEventListener('click', () => this.resetGame());
        this.setupTutorialListeners();
    }
    
    setupTutorialListeners() {
        document.getElementById('tutorial-next').addEventListener('click', () => this.nextTutorialStep());
        document.getElementById('tutorial-prev').addEventListener('click', () => this.prevTutorialStep());
        document.getElementById('tutorial-start').addEventListener('click', () => this.endTutorial());
    }

    startTutorial() { this.showTutorialStep(1); }

    showTutorialStep(step) {
        this.tutorialStep = step;
        const stepData = this.tutorialSteps[step - 1];
        if (!stepData) return;
        
        document.getElementById('tutorial-title').textContent = stepData.title;
        document.getElementById('tutorial-message').textContent = stepData.message;
        document.getElementById('tutorial-step').textContent = step;
        document.getElementById('tutorial-total').textContent = this.tutorialSteps.length;
        document.getElementById('tutorial-prev').style.display = step === 1 ? 'none' : 'block';
        document.getElementById('tutorial-next').style.display = step === this.tutorialSteps.length ? 'none' : 'block';
        document.getElementById('tutorial-start').style.display = step === this.tutorialSteps.length ? 'block' : 'none';
        document.getElementById('tutorial').classList.remove('hidden');
    }

    nextTutorialStep() { if (this.tutorialStep < this.tutorialSteps.length) this.showTutorialStep(this.tutorialStep + 1); }
    prevTutorialStep() { if (this.tutorialStep > 1) this.showTutorialStep(this.tutorialStep - 1); }
    
    endTutorial() {
        document.getElementById('tutorial').classList.add('hidden');
        this.updateGameStatus("¡Arrastra comandos para crear tu secuencia o haz click en ellos!");
        this.startTimer();
    }

    async launchSequence() {
        if (this.sequence.length === 0 || this.isExecuting) return;
        
        this.isExecuting = true;
        this.playSoundEffect('launch');
        this.updateGameStatus("🚀 Ejecutando secuencia...");
        document.getElementById('launch-sequence').disabled = true;
        
        this.resetRoverPosition();
        await new Promise(resolve => setTimeout(resolve, 300));

        await this.executeSequence(0);
    }

    async executeSequence(index) {
        if (index >= this.sequence.length) {
            this.isExecuting = false;
            document.getElementById('launch-sequence').disabled = false;
            this.updateGameStatus("Secuencia completada - ¿Intentar de nuevo?");
            if (!this.checkLevelComplete()) {
                this.crashRover("¡Destino no alcanzado! Revisa tu secuencia.");
            }
            return;
        }
        
        const slots = document.querySelectorAll('.sequence-slot');
        slots.forEach(slot => slot.classList.remove('executing'));
        if (slots[index]) slots[index].classList.add('executing');
        
        await this.executeCommand(this.sequence[index]);
        if (slots[index]) slots[index].classList.remove('executing');
        
        if (this.checkLevelComplete()) {
            this.levelCompleted();
            return;
        }
        
        if (this.isExecuting) {
             setTimeout(() => this.executeSequence(index + 1), 600);
        }
    }
    
    executeCommand(commandId) {
        return new Promise(resolve => {
            switch (commandId) {
                case 'moveForward': this.moveRover(); break;
                case 'turnRight': this.turnRover(1); break;
                case 'turnLeft': this.turnRover(-1); break;
                case 'lightOn': this.activateLight(); break;
            }
            setTimeout(resolve, 500);
        });
    }

    moveRover() {
        const level = this.levels[this.currentLevel];
        let {x, y} = this.roverPosition;
        if (this.roverDirection === 0) y--; // up
        if (this.roverDirection === 1) x++; // right
        if (this.roverDirection === 2) y++; // down
        if (this.roverDirection === 3) x--; // left
        
        if (x < 0 || x >= level.gridSize || y < 0 || y >= level.gridSize) {
            this.crashRover("¡A.U.R.O.R.A. se salió del mapa!");
            return;
        }
        if (level.obstacles.some(obs => obs.x === x && obs.y === y)) {
            this.crashRover("¡A.U.R.O.R.A. chocó con un obstáculo!");
            return;
        }
        
        this.roverPosition = {x, y};
        this.playSoundEffect('move');
        this.updateRoverOnGrid();
    }
    
    checkLevelComplete() {
        const level = this.levels[this.currentLevel];
        return this.roverPosition.x === level.target.x && this.roverPosition.y === level.target.y;
    }

    turnRover(direction) {
        this.roverDirection = (this.roverDirection + direction + 4) % 4;
        this.updateRoverOnGrid();
        this.playSoundEffect('move');
    }

    activateLight() {
        const roverCell = this.getRoverCell();
        if (roverCell) {
            roverCell.style.boxShadow = "0 0 30px rgba(255, 255, 0, 0.8)";
            setTimeout(() => roverCell.style.boxShadow = "", 500);
        }
        this.playSoundEffect('move');
    }

    updateRoverOnGrid() {
        document.querySelectorAll('.grid-cell.rover').forEach(c => {
             c.classList.remove('rover');
             c.innerHTML = c.innerHTML.replace(/<span style=".*?">🤖<\/span>/, '');
        });

        const roverCell = this.getRoverCell();
        if (roverCell) {
            roverCell.classList.add('rover');
            roverCell.innerHTML += `<span style="transform: rotate(${(this.roverDirection - 1) * 90}deg); display: inline-block;">🤖</span>`;
        }
    }


    getRoverCell() {
        return document.querySelector(`[data-x="${this.roverPosition.x}"][data-y="${this.roverPosition.y}"]`);
    }

    crashRover(message) {
        this.isExecuting = false;
        const roverCell = this.getRoverCell();
        if (roverCell) {
            roverCell.classList.add('crashed');
            roverCell.innerHTML = '😵';
        }
        this.playSoundEffect('crash');
        this.updateGameStatus(message + " ¡La posición se reiniciará!");
        
        setTimeout(() => {
            if(roverCell) {
                const level = this.levels[this.currentLevel];
                if(this.roverPosition.x === level.target.x && this.roverPosition.y === level.target.y) {
                    roverCell.innerHTML = `<span class="pulse">${level.target.icon}</span>`;
                } else {
                    roverCell.innerHTML = '';
                }
                roverCell.classList.remove('crashed');
            }
            this.resetRoverPosition();
            document.getElementById('launch-sequence').disabled = false;
        }, 2000);
    }

    resetRoverPosition() {
        const level = this.levels[this.currentLevel];
        this.roverPosition = {...level.roverStart};
        this.roverDirection = level.roverDirection;
        this.createMarsGrid();
    }
    
    levelCompleted() {
        this.isExecuting = false;
        document.getElementById('launch-sequence').disabled = false;
        this.playSoundEffect('levelVictory');
        this.updateGameStatus("🎉 ¡CALIBRACIÓN EXITOSA! 🎉");
        
        setTimeout(() => {
            if (this.currentLevel === this.levels.length - 1) {
                this.showFinalVictory();
            } else {
                this.showLevelVictory();
            }
        }, 1000);
    }
    
    showLevelVictory() {
        const modal = document.getElementById('level-victory-modal');
        const messageEl = document.getElementById('level-victory-message');
        const level = this.levels[this.currentLevel];
        const messageKey = `level${level.id}`;
        messageEl.textContent = this.victoryMessages[messageKey] || "¡Nivel completado!";
        modal.classList.remove('hidden');
    }
    
    showFinalVictory() {
        this.stopTimer();
        this.playSoundEffect('finalVictory');

        // NEW: Update final time on victory screen
        const finalTimeElement = document.getElementById('final-time');
        if (finalTimeElement) {
            const minutes = Math.floor(this.elapsedTime / 60);
            const seconds = this.elapsedTime % 60;
            const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            finalTimeElement.textContent = `⏱️ Tiempo Total: ${formattedTime}`;
        }
        
        document.getElementById('final-victory-modal').classList.remove('hidden');
    }
    
    nextLevel() {
        document.getElementById('level-victory-modal').classList.add('hidden');
        if (this.currentLevel < this.levels.length - 1) {
            this.loadLevel(this.currentLevel + 1);
            this.updateGameStatus("¡Nuevo nivel cargado! Planifica tu estrategia...");
        }
    }

    clearSequence() {
        document.querySelectorAll('.sequence-slot').forEach(slot => {
            slot.innerHTML = '';
            slot.classList.remove('has-command');
        });
        this.sequence = [];
        this.updateProgressIndicators();
        this.updateGameStatus("Secuencia limpiada - Crea una nueva secuencia");
        this.resetRoverPosition();
    }
    
    resetGame() {
        document.getElementById('final-victory-modal').classList.add('hidden');
        this.resetTimer();
        this.startTimer();
        this.loadLevel(0);
        this.updateGameStatus("¡Listo para una nueva misión!");
    }

    updateGameStatus(message) {
        document.getElementById('game-status').textContent = message;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.auroraGame = new AuroraSequentialGame();
});
