// A.U.R.O.R.A. Mission 2 - Sequential Collection Game Logic (Fixed)
class AuroraSequentialGame {
    constructor() {
        // Game data from JSON
        this.levels = [
            {
                id: 1,
                name: "Recolección Secuencial",
                gridSize: 6,
                roverStart: {x: 0, y: 0},
                roverDirection: 1,
                objectives: [
                    {id: "O1", x: 2, y: 3, collected: false, icon: "💎", color: "#00aaff"},
                    {id: "O2", x: 4, y: 1, collected: false, icon: "💎", color: "#00ff88"}
                ],
                target: {x: 5, y: 5, icon: "🏆", color: "#ffdd00"},
                obstacles: [{x: 1, y: 2}, {x: 3, y: 1}, {x: 2, y: 4}],
                maxSteps: 15,
                expectedSteps: 12
            },
            {
                id: 2,
                name: "Navegación Central",
                gridSize: 7,
                roverStart: {x: 0, y: 0},
                roverDirection: 1,
                objectives: [
                    {id: "O1", x: 2, y: 2, collected: false, icon: "💎", color: "#00aaff"},
                    {id: "O2", x: 6, y: 4, collected: false, icon: "💎", color: "#00ff88"}
                ],
                target: {x: 3, y: 3, icon: "🏆", color: "#ffdd00"},
                obstacles: [
                    {x: 1, y: 1}, {x: 0, y: 2}, {x: 3, y: 1}, {x: 4, y: 1}, 
                    {x: 2, y: 3}, {x: 4, y: 3}, {x: 2, y: 4}, {x: 4, y: 4}
                ],
                maxSteps: 20,
                expectedSteps: 16
            },
            {
                id: 3,
                name: "Desafío del Laberinto",
                gridSize: 8,
                roverStart: {x: 0, y: 0},
                roverDirection: 1,
                objectives: [
                    {id: "O1", x: 2, y: 1, collected: false, icon: "💎", color: "#00aaff"},
                    {id: "O2", x: 6, y: 4, collected: false, icon: "💎", color: "#00ff88"}
                ],
                target: {x: 7, y: 7, icon: "🏆", color: "#ffdd00"},
                obstacles: [
                    {x: 2, y: 0}, {x: 3, y: 0}, {x: 1, y: 1}, {x: 4, y: 2}, {x: 5, y: 2},
                    {x: 0, y: 3}, {x: 1, y: 3}, {x: 5, y: 3}, {x: 6, y: 3}, {x: 3, y: 4},
                    {x: 1, y: 5}, {x: 2, y: 5}, {x: 4, y: 5}, {x: 5, y: 5}
                ],
                maxSteps: 25,
                expectedSteps: 22
            }
        ];

        this.commands = [
            {id: "moveForward", name: "Mover Adelante", icon: "⬆️", color: "green"},
            {id: "turnRight", name: "Girar Derecha", icon: "↪️", color: "blue"},
            {id: "turnLeft", name: "Girar Izquierda", icon: "↩️", color: "yellow"},
            {id: "lightOn", name: "Encender Luz", icon: "💡", color: "orange"}
        ];

        this.tutorialSteps = [
            {step: 1, title: "¡Bienvenido, Navegador AURORA!", message: "Tu nueva misión implica recolección secuencial. Debes visitar objetivos EN ORDEN: Inicio → Objetivo 1 → Objetivo 2 → Meta Final."},
            {step: 2, title: "Sistema de Recolección", message: "Los diamantes (💎) son objetivos que debes recolectar en secuencia. El trofeo (🏆) es tu meta final. ¡No puedes saltarte objetivos!"},
            {step: 3, title: "Mapas Complejos", message: "Cada nivel es progresivamente más difícil: 6x6 → 7x7 → 8x8. Los obstáculos (🪨) bloquean el paso directo."},
            {step: 4, title: "Secuencias Largas", message: "Necesitarás hasta 25 pasos para completar los niveles más avanzados. ¡Planifica cuidadosamente tu ruta!"},
            {step: 5, title: "Estrategia de Navegación", message: "Los mapas requieren múltiples giros y rodear obstáculos. La ruta más obvia no siempre es la correcta."},
            {step: 6, title: "Indicadores de Progreso", message: "Observa los indicadores visuales: objetivos completados brillarán y el progreso se mostrará en tiempo real."},
            {step: 7, title: "¡Listo para la Aventura!", message: "¡Prepárate para el desafío de navegación más complejo de AURORA! ¡Demuestra ser un Maestro Navegador!"}
        ];

        this.victoryMessages = {
            level1: "¡Excelente! Has dominado la recolección secuencial básica. Preparándote para obstáculos centrales...",
            level2: "¡Impresionante navegación! Has superado los obstáculos centrales. El laberinto final te espera...", 
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
        this.currentObjectiveIndex = 0;
        this.collectionState = "start"; // start -> o1 -> o2 -> target

        this.init();
    }

    init() {
        console.log('Initializing A.U.R.O.R.A. Sequential Collection Game...');
        // Wait for DOM to be fully ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.startGame());
        } else {
            this.startGame();
        }
    }

    startGame() {
        this.initAudio();
        this.loadLevel(0);
        this.createCommandBlocks();
        this.createSequenceSlots();
        this.setupEventListeners();
        this.updateGameStatus("Completa el tutorial para comenzar tu misión");
        
        // Start tutorial with delay to ensure DOM is ready
        setTimeout(() => {
            this.startTutorial();
        }, 1000);
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
            case 'drag':
                this.playSound(440, 0.1, 'square');
                break;
            case 'drop':
                this.playSound(660, 0.2, 'sine');
                break;
            case 'launch':
                this.playSound(220, 0.5, 'sawtooth');
                setTimeout(() => this.playSound(330, 0.3, 'sawtooth'), 200);
                break;
            case 'move':
                this.playSound(200, 0.3, 'triangle');
                break;
            case 'collect':
                const baseFreq = 440 + (this.currentObjectiveIndex * 220);
                this.playSound(baseFreq, 0.3, 'sine');
                setTimeout(() => this.playSound(baseFreq * 1.5, 0.3, 'sine'), 150);
                break;
            case 'crash':
                this.playSound(150, 0.5, 'sawtooth');
                break;
            case 'levelVictory':
                const notes = [262, 330, 392, 523];
                notes.forEach((note, i) => {
                    setTimeout(() => this.playSound(note, 0.4, 'sine'), i * 200);
                });
                break;
            case 'finalVictory':
                const epicNotes = [262, 330, 392, 523, 659, 784, 1047];
                epicNotes.forEach((note, i) => {
                    setTimeout(() => this.playSound(note, 0.5, 'sine'), i * 150);
                });
                break;
        }
    }

    // Level Management
    loadLevel(levelIndex) {
        this.currentLevel = levelIndex;
        const level = this.levels[levelIndex];
        
        // Reset level state
        level.objectives.forEach(obj => obj.collected = false);
        this.roverPosition = {...level.roverStart};
        this.roverDirection = level.roverDirection;
        this.currentObjectiveIndex = 0;
        this.collectionState = "start";
        this.sequence = [];
        
        // Update UI
        this.updateLevelInfo(level);
        this.createMarsGrid();
        this.updateCollectionOrder();
        this.clearSequence();
        this.updateProgressIndicators();
    }

    updateLevelInfo(level) {
        const currentLevelEl = document.getElementById('current-level');
        const levelNameEl = document.getElementById('level-name');
        const stepsCountEl = document.getElementById('steps-count');
        
        if (currentLevelEl) currentLevelEl.textContent = `NIVEL ${level.id}`;
        if (levelNameEl) levelNameEl.textContent = level.name;
        if (stepsCountEl) stepsCountEl.textContent = `Pasos: 0/${level.maxSteps}`;
    }

    // Grid Creation
    createMarsGrid() {
        const grid = document.getElementById('mars-grid');
        if (!grid) return;
        
        const level = this.levels[this.currentLevel];
        grid.innerHTML = '';
        grid.className = `mars-grid grid-${level.gridSize}x${level.gridSize}`;
        
        for (let y = 0; y < level.gridSize; y++) {
            for (let x = 0; x < level.gridSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // Add content based on position
                if (x === this.roverPosition.x && y === this.roverPosition.y) {
                    cell.classList.add('rover');
                    cell.innerHTML = `<span style="transform: rotate(${(this.roverDirection - 1) * 90}deg); display: inline-block;">🤖</span>`;
                } else if (level.obstacles.some(obs => obs.x === x && obs.y === y)) {
                    cell.classList.add('obstacle');
                    cell.innerHTML = '🪨';
                } else if (level.objectives.some(obj => obj.x === x && obj.y === y)) {
                    const objective = level.objectives.find(obj => obj.x === x && obj.y === y);
                    cell.classList.add('objective');
                    if (objective.collected) {
                        cell.classList.add('collected');
                    } else if (this.isNextTarget(objective)) {
                        cell.classList.add('next-target');
                    }
                    cell.innerHTML = `<span class="pulse">${objective.icon}</span>`;
                } else if (x === level.target.x && y === level.target.y) {
                    cell.classList.add('target');
                    if (this.collectionState === "o2") {
                        cell.classList.add('next-target');
                    }
                    cell.innerHTML = `<span class="pulse">${level.target.icon}</span>`;
                }
                
                grid.appendChild(cell);
            }
        }
    }

    isNextTarget(objective) {
        if (this.collectionState === "start" && objective.id === "O1") return true;
        if (this.collectionState === "o1" && objective.id === "O2") return true;
        return false;
    }

    // Collection Order Display
    updateCollectionOrder() {
        const stepStart = document.getElementById('step-start');
        const stepO1 = document.getElementById('step-o1');
        const stepO2 = document.getElementById('step-o2');
        const stepFinal = document.getElementById('step-final');
        
        // Reset classes
        [stepStart, stepO1, stepO2, stepFinal].forEach(el => {
            if (el) {
                el.classList.remove('completed', 'current');
            }
        });
        
        // Update based on collection state
        switch (this.collectionState) {
            case "start":
                if (stepStart) stepStart.classList.add('completed');
                if (stepO1) stepO1.classList.add('current');
                break;
            case "o1":
                if (stepStart) stepStart.classList.add('completed');
                if (stepO1) stepO1.classList.add('completed');
                if (stepO2) stepO2.classList.add('current');
                break;
            case "o2":
                if (stepStart) stepStart.classList.add('completed');
                if (stepO1) stepO1.classList.add('completed');
                if (stepO2) stepO2.classList.add('completed');
                if (stepFinal) stepFinal.classList.add('current');
                break;
        }
    }

    updateProgressIndicators() {
        const level = this.levels[this.currentLevel];
        const objectivesProgress = document.getElementById('objectives-progress');
        const stepsCount = document.getElementById('steps-count');
        
        const completedObjectives = level.objectives.filter(obj => obj.collected).length;
        
        if (objectivesProgress) {
            objectivesProgress.textContent = `Objetivos: ${completedObjectives}/${level.objectives.length}`;
        }
        
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
            block.innerHTML = `
                <span class="command-icon">${command.icon}</span>
                <div>${command.name}</div>
            `;
            
            // Drag events
            block.addEventListener('dragstart', (e) => {
                console.log('Drag start:', command.id);
                e.dataTransfer.setData('text/plain', command.id);
                e.dataTransfer.effectAllowed = 'copy';
                this.playSoundEffect('drag');
            });
            
            // Click event for mobile/fallback
            block.addEventListener('click', (e) => {
                console.log('Command clicked:', command.id);
                const firstEmptySlot = document.querySelector('.sequence-slot:not(.has-command)');
                if (firstEmptySlot) {
                    this.addToSequence(firstEmptySlot, command);
                    this.playSoundEffect('drop');
                }
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
            slot.textContent = i;
            
            // Drop events
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                slot.classList.add('drag-over');
            });
            
            slot.addEventListener('dragleave', (e) => {
                slot.classList.remove('drag-over');
            });
            
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                console.log('Drop event triggered');
                slot.classList.remove('drag-over');
                
                const commandId = e.dataTransfer.getData('text/plain');
                console.log('Dropped command:', commandId);
                const command = this.commands.find(c => c.id === commandId);
                
                if (command && !slot.classList.contains('has-command')) {
                    this.addToSequence(slot, command);
                    this.playSoundEffect('drop');
                }
            });
            
            container.appendChild(slot);
        }
    }

    addToSequence(slot, command) {
        slot.innerHTML = '';
        slot.classList.add('has-command');
        
        const block = document.createElement('div');
        block.className = `command-block ${command.color}`;
        block.innerHTML = `
            <span class="command-icon">${command.icon}</span>
            <div style="font-size: 0.7rem;">${command.name}</div>
        `;
        
        block.addEventListener('click', (e) => {
            e.stopPropagation();
            slot.innerHTML = slot.dataset.slot;
            slot.classList.remove('has-command');
            this.updateSequence();
        });
        
        slot.appendChild(block);
        this.updateSequence();
    }

    updateSequence() {
        const slots = document.querySelectorAll('.sequence-slot');
        this.sequence = [];
        
        slots.forEach(slot => {
            const commandBlock = slot.querySelector('.command-block');
            if (commandBlock) {
                const commandId = this.getCommandIdFromBlock(commandBlock);
                if (commandId) {
                    this.sequence.push(commandId);
                }
            }
        });
        
        this.updateProgressIndicators();
        this.updateGameStatus(
            this.sequence.length === 0 
                ? "Arrastra comandos para crear tu secuencia o haz click en ellos" 
                : `Secuencia: ${this.sequence.length} comando(s) - ¡Listo para lanzar!`
        );
    }

    getCommandIdFromBlock(block) {
        const icon = block.querySelector('.command-icon')?.textContent;
        const command = this.commands.find(c => c.icon === icon);
        return command ? command.id : null;
    }

    // Event Listeners Setup - Fixed
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Use event delegation and direct binding
        this.setupTutorialListeners();
        this.setupGameControlListeners();
        this.setupKeyboardListeners();
        this.setupTouchEvents();
    }

    setupTutorialListeners() {
        // Wait for elements to be in DOM, then bind
        const bindTutorialEvents = () => {
            const tutorialNext = document.getElementById('tutorial-next');
            const tutorialPrev = document.getElementById('tutorial-prev');
            const tutorialStart = document.getElementById('tutorial-start');
            
            if (tutorialNext) {
                tutorialNext.replaceWith(tutorialNext.cloneNode(true));
                document.getElementById('tutorial-next').addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Next tutorial clicked');
                    this.nextTutorialStep();
                });
            }
            
            if (tutorialPrev) {
                tutorialPrev.replaceWith(tutorialPrev.cloneNode(true));
                document.getElementById('tutorial-prev').addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Prev tutorial clicked');
                    this.prevTutorialStep();
                });
            }
            
            if (tutorialStart) {
                tutorialStart.replaceWith(tutorialStart.cloneNode(true));
                document.getElementById('tutorial-start').addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Tutorial start clicked');
                    this.endTutorial();
                });
            }
        };
        
        // Bind immediately and also after a delay
        bindTutorialEvents();
        setTimeout(bindTutorialEvents, 2000);
    }

    setupGameControlListeners() {
        const launchButton = document.getElementById('launch-sequence');
        const clearButton = document.getElementById('clear-sequence');
        const nextLevelButton = document.getElementById('next-level');
        const playAgainButton = document.getElementById('play-again');
        
        if (launchButton) {
            launchButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.launchSequence();
            });
        }
        
        if (clearButton) {
            clearButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearSequence();
            });
        }
        
        if (nextLevelButton) {
            nextLevelButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextLevel();
            });
        }
        
        if (playAgainButton) {
            playAgainButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetGame();
            });
        }
    }

    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            const tutorialModal = document.getElementById('tutorial');
            if (tutorialModal && !tutorialModal.classList.contains('hidden')) {
                if (e.key === 'Enter' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    if (this.tutorialStep < this.tutorialSteps.length) {
                        this.nextTutorialStep();
                    } else {
                        this.endTutorial();
                    }
                } else if (e.key === 'ArrowLeft' && this.tutorialStep > 1) {
                    e.preventDefault();
                    this.prevTutorialStep();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    this.endTutorial();
                }
            }
        });
    }

    setupTouchEvents() {
        let draggedElement = null;
        
        document.addEventListener('touchstart', (e) => {
            const target = e.target.closest('.command-block');
            if (target && target.parentElement.classList.contains('command-blocks')) {
                draggedElement = target;
                target.style.opacity = '0.5';
            }
        }, {passive: true});
        
        document.addEventListener('touchmove', (e) => {
            if (draggedElement) {
                e.preventDefault();
            }
        }, {passive: false});
        
        document.addEventListener('touchend', (e) => {
            if (draggedElement) {
                const touch = e.changedTouches[0];
                const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
                const slot = dropTarget?.closest('.sequence-slot:not(.has-command)');
                
                if (slot) {
                    const commandId = this.getCommandIdFromBlock(draggedElement);
                    const command = this.commands.find(c => c.id === commandId);
                    if (command) {
                        this.addToSequence(slot, command);
                        this.playSoundEffect('drop');
                    }
                }
                
                draggedElement.style.opacity = '';
                draggedElement = null;
            }
        }, {passive: true});
    }

    // Tutorial System - Fixed
    startTutorial() {
        console.log('Starting tutorial...');
        this.tutorialStep = 1;
        this.showTutorialStep(1);
    }

    showTutorialStep(step) {
        console.log(`Showing tutorial step ${step}`);
        this.tutorialStep = step;
        const stepData = this.tutorialSteps[step - 1];
        
        if (!stepData) return;
        
        const titleElement = document.getElementById('tutorial-title');
        const messageElement = document.getElementById('tutorial-message');
        const stepElement = document.getElementById('tutorial-step');
        const totalElement = document.getElementById('tutorial-total');
        const prevButton = document.getElementById('tutorial-prev');
        const nextButton = document.getElementById('tutorial-next');
        const startButton = document.getElementById('tutorial-start');
        const tutorialModal = document.getElementById('tutorial');
        
        if (titleElement) titleElement.textContent = stepData.title;
        if (messageElement) messageElement.textContent = stepData.message;
        if (stepElement) stepElement.textContent = step;
        if (totalElement) totalElement.textContent = this.tutorialSteps.length;
        
        if (prevButton) prevButton.style.display = step === 1 ? 'none' : 'block';
        if (nextButton) nextButton.style.display = step === this.tutorialSteps.length ? 'none' : 'block';
        if (startButton) startButton.style.display = step === this.tutorialSteps.length ? 'block' : 'none';
        
        if (tutorialModal) tutorialModal.classList.remove('hidden');
        
        // Re-bind events after updating content
        setTimeout(() => this.setupTutorialListeners(), 100);
    }

    nextTutorialStep() {
        console.log(`Next tutorial step. Current: ${this.tutorialStep}`);
        if (this.tutorialStep < this.tutorialSteps.length) {
            this.showTutorialStep(this.tutorialStep + 1);
        }
    }

    prevTutorialStep() {
        console.log(`Prev tutorial step. Current: ${this.tutorialStep}`);
        if (this.tutorialStep > 1) {
            this.showTutorialStep(this.tutorialStep - 1);
        }
    }

    endTutorial() {
        console.log('Ending tutorial...');
        const tutorialModal = document.getElementById('tutorial');
        if (tutorialModal) tutorialModal.classList.add('hidden');
        this.updateGameStatus("¡Arrastra comandos para crear tu secuencia o haz click en ellos!");
    }

    // Game Logic
    async launchSequence() {
        if (this.sequence.length === 0 || this.isExecuting) return;
        
        this.isExecuting = true;
        this.playSoundEffect('launch');
        this.updateGameStatus("🚀 Ejecutando secuencia...");
        
        const launchButton = document.getElementById('launch-sequence');
        if (launchButton) launchButton.disabled = true;
        
        await this.executeSequence(0);
    }

    async executeSequence(index) {
        if (index >= this.sequence.length) {
            this.isExecuting = false;
            const launchButton = document.getElementById('launch-sequence');
            if (launchButton) launchButton.disabled = false;
            this.updateGameStatus("Secuencia completada - ¿Intentar de nuevo?");
            return;
        }
        
        // Highlight current command
        const slots = document.querySelectorAll('.sequence-slot');
        slots.forEach(slot => slot.classList.remove('executing'));
        if (slots[index]) slots[index].classList.add('executing');
        
        const command = this.sequence[index];
        await this.executeCommand(command);
        
        if (slots[index]) slots[index].classList.remove('executing');
        
        // Check if level completed
        if (this.checkLevelComplete()) {
            this.levelCompleted();
            return;
        }
        
        // Continue with next command
        setTimeout(() => {
            this.executeSequence(index + 1);
        }, 800);
    }

    async executeCommand(commandId) {
        return new Promise((resolve) => {
            switch (commandId) {
                case 'moveForward':
                    this.moveRover();
                    break;
                case 'turnRight':
                    this.turnRover(1);
                    break;
                case 'turnLeft':
                    this.turnRover(-1);
                    break;
                case 'lightOn':
                    this.activateLight();
                    break;
            }
            setTimeout(resolve, 600);
        });
    }

    moveRover() {
        const level = this.levels[this.currentLevel];
        const newX = this.roverPosition.x + (this.roverDirection === 1 ? 1 : this.roverDirection === 3 ? -1 : 0);
        const newY = this.roverPosition.y + (this.roverDirection === 0 ? -1 : this.roverDirection === 2 ? 1 : 0);
        
        console.log(`Moving rover from (${this.roverPosition.x}, ${this.roverPosition.y}) to (${newX}, ${newY}), direction: ${this.roverDirection}`);
        
        // Check boundaries
        if (newX < 0 || newX >= level.gridSize || newY < 0 || newY >= level.gridSize) {
            this.crashRover("¡A.U.R.O.R.A. se salió del mapa!");
            return;
        }
        
        // Check obstacle collision
        if (level.obstacles.some(obs => obs.x === newX && obs.y === newY)) {
            this.crashRover("¡A.U.R.O.R.A. chocó con un obstáculo!");
            return;
        }
        
        // Move rover
        this.roverPosition.x = newX;
        this.roverPosition.y = newY;
        
        // Check for objective collection
        this.checkObjectiveCollection();
        
        this.playSoundEffect('move');
        this.updateRoverOnGrid();
    }

    checkObjectiveCollection() {
        const level = this.levels[this.currentLevel];
        
        console.log(`Checking collection at (${this.roverPosition.x}, ${this.roverPosition.y}), state: ${this.collectionState}`);
        
        // Check for objective collection in sequence
        if (this.collectionState === "start") {
            const o1 = level.objectives.find(obj => obj.id === "O1");
            if (o1 && this.roverPosition.x === o1.x && this.roverPosition.y === o1.y && !o1.collected) {
                console.log('Collected O1!');
                o1.collected = true;
                this.collectionState = "o1";
                this.currentObjectiveIndex = 1;
                this.playSoundEffect('collect');
                this.updateCollectionOrder();
                this.createMarsGrid();
                this.updateProgressIndicators();
                this.updateGameStatus("💎 ¡Objetivo 1 recolectado! Busca el Objetivo 2...");
            }
        } else if (this.collectionState === "o1") {
            const o2 = level.objectives.find(obj => obj.id === "O2");
            if (o2 && this.roverPosition.x === o2.x && this.roverPosition.y === o2.y && !o2.collected) {
                console.log('Collected O2!');
                o2.collected = true;
                this.collectionState = "o2";
                this.currentObjectiveIndex = 2;
                this.playSoundEffect('collect');
                this.updateCollectionOrder();
                this.createMarsGrid();
                this.updateProgressIndicators();
                this.updateGameStatus("💎 ¡Objetivo 2 recolectado! Dirígete a la meta final...");
            }
        }
    }

    checkLevelComplete() {
        const level = this.levels[this.currentLevel];
        
        // Must have collected all objectives and reached target
        const allObjectivesCollected = level.objectives.every(obj => obj.collected);
        const atTarget = this.roverPosition.x === level.target.x && this.roverPosition.y === level.target.y;
        
        console.log(`Level complete check: objectives=${allObjectivesCollected}, atTarget=${atTarget}`);
        return allObjectivesCollected && atTarget;
    }

    turnRover(direction) {
        this.roverDirection = (this.roverDirection + direction + 4) % 4;
        console.log(`Rover turned to direction: ${this.roverDirection}`);
        this.updateRoverOnGrid();
        this.playSoundEffect('move');
    }

    activateLight() {
        const roverCell = this.getRoverCell();
        if (roverCell) {
            roverCell.style.boxShadow = "0 0 30px rgba(255, 255, 0, 0.8)";
            setTimeout(() => {
                roverCell.style.boxShadow = "0 0 15px rgba(0, 255, 0, 0.5)";
            }, 500);
        }
        this.playSoundEffect('move');
    }

    updateRoverOnGrid() {
        // Clear previous rover position
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.classList.remove('rover');
            if (cell.innerHTML.includes('🤖')) {
                // Restore original content if not rover
                const x = parseInt(cell.dataset.x);
                const y = parseInt(cell.dataset.y);
                const level = this.levels[this.currentLevel];
                
                if (level.obstacles.some(obs => obs.x === x && obs.y === y)) {
                    cell.innerHTML = '🪨';
                } else if (level.objectives.some(obj => obj.x === x && obj.y === y)) {
                    const objective = level.objectives.find(obj => obj.x === x && obj.y === y);
                    cell.innerHTML = `<span class="pulse">${objective.icon}</span>`;
                } else if (x === level.target.x && y === level.target.y) {
                    cell.innerHTML = `<span class="pulse">${level.target.icon}</span>`;
                } else {
                    cell.innerHTML = '';
                }
            }
        });
        
        // Set new rover position
        const roverCell = this.getRoverCell();
        if (roverCell) {
            roverCell.classList.add('rover');
            roverCell.innerHTML = `<span style="transform: rotate(${(this.roverDirection - 1) * 90}deg); display: inline-block;">🤖</span>`;
        }
    }

    getRoverCell() {
        return document.querySelector(`[data-x="${this.roverPosition.x}"][data-y="${this.roverPosition.y}"]`);
    }

    crashRover(message) {
        const roverCell = this.getRoverCell();
        if (roverCell) {
            roverCell.classList.add('crashed');
            roverCell.innerHTML = '😵';
            setTimeout(() => {
                roverCell.classList.remove('crashed');
                this.resetRoverPosition();
            }, 1000);
        }
        
        this.playSoundEffect('crash');
        this.updateGameStatus(message + " ¡Intenta de nuevo!");
        
        this.isExecuting = false;
        const launchButton = document.getElementById('launch-sequence');
        if (launchButton) launchButton.disabled = false;
    }

    resetRoverPosition() {
        const level = this.levels[this.currentLevel];
        this.roverPosition = {...level.roverStart};
        this.roverDirection = level.roverDirection;
        // Reset collection state
        level.objectives.forEach(obj => obj.collected = false);
        this.collectionState = "start";
        this.currentObjectiveIndex = 0;
        this.updateCollectionOrder();
        this.updateProgressIndicators();
        this.createMarsGrid();
    }

    levelCompleted() {
        const level = this.levels[this.currentLevel];
        this.playSoundEffect('levelVictory');
        this.updateGameStatus("🎉 ¡NIVEL COMPLETADO! 🎉");
        
        this.isExecuting = false;
        const launchButton = document.getElementById('launch-sequence');
        if (launchButton) launchButton.disabled = false;
        
        setTimeout(() => {
            if (this.currentLevel === this.levels.length - 1) {
                // Final victory
                this.showFinalVictory();
            } else {
                // Level victory
                this.showLevelVictory();
            }
        }, 1000);
    }

    showLevelVictory() {
        const modal = document.getElementById('level-victory-modal');
        const messageEl = document.getElementById('level-victory-message');
        
        const level = this.levels[this.currentLevel];
        const message = this.victoryMessages[`level${level.id}`];
        
        if (messageEl) messageEl.textContent = message;
        if (modal) modal.classList.remove('hidden');
    }

    showFinalVictory() {
        this.playSoundEffect('finalVictory');
        const modal = document.getElementById('final-victory-modal');
        if (modal) modal.classList.remove('hidden');
    }

    nextLevel() {
        const modal = document.getElementById('level-victory-modal');
        if (modal) modal.classList.add('hidden');
        
        if (this.currentLevel < this.levels.length - 1) {
            this.loadLevel(this.currentLevel + 1);
            this.updateGameStatus("¡Nuevo nivel cargado! Planifica tu estrategia...");
        }
    }

    clearSequence() {
        const slots = document.querySelectorAll('.sequence-slot');
        slots.forEach(slot => {
            slot.innerHTML = slot.dataset.slot;
            slot.classList.remove('has-command');
        });
        this.sequence = [];
        this.updateProgressIndicators();
        this.updateGameStatus("Secuencia limpiada - Crea una nueva secuencia");
    }

    resetGame() {
        const finalModal = document.getElementById('final-victory-modal');
        if (finalModal) finalModal.classList.add('hidden');
        
        this.loadLevel(0);
        this.updateGameStatus("¡Listo para una nueva misión!");
    }

    updateGameStatus(message) {
        const statusElement = document.getElementById('game-status');
        if (statusElement) statusElement.textContent = message;
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing sequential collection game...');
    window.auroraGame = new AuroraSequentialGame();
});

// Fallback initialization
if (document.readyState !== 'loading') {
    console.log('DOM already ready, initializing game immediately...');
    window.auroraGame = new AuroraSequentialGame();
}