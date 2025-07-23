class CrosswordGame {
    constructor() {
        this.gridSize = 18; // ATUALIZADO: Aumentado para 18x18
        this.currentCell = null;
        this.currentWord = null;
        this.currentDirection = 'horizontal';
        this.completedWords = new Set();
        
        // ATUALIZADO: Definição das novas palavras e suas posições
        this.words = {
            1: { // TOMBAMENTO (vertical)
                word: 'TOMBAMENTO',
                startRow: 0,
                startCol: 14,
                direction: 'vertical',
                clue: 'Processo obrigatório de registro dos bens permanentes adquiridos com recursos do PDDE no patrimônio da escola ou do ente federado.'
            },
            2: { // PRESTACAODECONTAS (horizontal)
                word: 'PRESTACAODECONTAS',
                startRow: 8,
                startCol: 0,
                direction: 'horizontal',
                clue: 'Conjunto de documentos que comprovam a aplicação dos recursos e devem ser guardados por 5 anos após aprovação.'
            },
            3: { // ATA (vertical)
                word: 'ATA',
                startRow: 8,
                startCol: 4,
                direction: 'vertical',
                clue: 'Documento que formaliza a decisão da comunidade escolar sobre o que será adquirido com os recursos do PDDE.'
            },
            4: { // ISONOMIA (horizontal)
                word: 'ISONOMIA',
                startRow: 9,
                startCol: 10,
                direction: 'horizontal',
                clue: 'Princípio que garante igualdade de condições entre os fornecedores participantes das licitações.'
            },
            5: { // PRESIDENTE (horizontal)
                word: 'PRESIDENTE',
                startRow: 6,
                startCol: 8,
                direction: 'horizontal',
                clue: 'Responsável máximo pela unidade escolar e pela gestão dos recursos do PDDE.'
            }
        };
        
        this.grid = this.createEmptyGrid();
        this.setupWordPositions();
        this.init();
    }
    
    createEmptyGrid() {
        return Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));
    }
    
    setupWordPositions() {
        // Marca as posições das palavras no grid
        Object.keys(this.words).forEach(wordId => {
            const wordData = this.words[wordId];
            const { word, startRow, startCol, direction } = wordData;
            
            for (let i = 0; i < word.length; i++) {
                const row = direction === 'horizontal' ? startRow : startRow + i;
                const col = direction === 'horizontal' ? startCol + i : startCol;
                
                if (row < this.gridSize && col < this.gridSize) {
                    if (!this.grid[row][col]) {
                        this.grid[row][col] = {
                            letter: word[i],
                            words: [wordId],
                            isStart: i === 0,
                            number: i === 0 ? wordId : null
                        };
                    } else {
                        // Célula compartilhada entre palavras
                        this.grid[row][col].words.push(wordId);
                    }
                }
            }
        });
    }
    
    init() {
        this.createGrid();
        this.setupEventListeners();
        this.setupAccessibilityControls();
        this.updateProgress();
    }
    
    createGrid() {
        const gridContainer = document.getElementById('crossword-grid');
        gridContainer.innerHTML = '';
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (this.grid[row][col]) {
                    const cellData = this.grid[row][col];
                    
                    // Adiciona número se for início de palavra
                    if (cellData.number) {
                        const numberSpan = document.createElement('span');
                        numberSpan.className = 'cell-number';
                        numberSpan.textContent = cellData.number;
                        cell.appendChild(numberSpan);
                    }
                    
                    // Adiciona input para a letra
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.setAttribute('aria-label', `Célula linha ${row + 1}, coluna ${col + 1}`);
                    
                    cell.appendChild(input);
                    cell.classList.add('active');
                } else {
                    cell.classList.add('blocked');
                }
                
                gridContainer.appendChild(cell);
            }
        }
    }
    
    setupEventListeners() {
        const grid = document.getElementById('crossword-grid');
        
        // Event delegation para inputs
        grid.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT') {
                this.handleInput(e);
            }
        });
        
        grid.addEventListener('click', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.classList.contains('cell')) {
                const cell = e.target.closest('.cell');
                if (cell) {
                    this.handleCellClick(cell);
                }
            }
        });
        
        grid.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') {
                this.handleKeyDown(e);
            }
        });
        
        // Event listeners para as dicas
        document.querySelectorAll('.clue-item').forEach(item => {
            item.addEventListener('click', () => {
                this.highlightWord(item.dataset.word);
            });
        });
    }
    
    handleInput(e) {
        const input = e.target;
        const cell = input.parentElement;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        input.value = input.value.toUpperCase();
        
        const cellData = this.grid[row][col];
        if (cellData && input.value === cellData.letter) {
            cell.classList.add('filled');
            this.checkWordCompletion(cellData.words);
        } else {
            cell.classList.remove('filled');
        }
        
        if (input.value) {
            this.moveToNextCell(row, col);
        }
        
        this.updateProgress();
    }
    
    handleCellClick(cell) {
        if (!cell.classList.contains('active')) return;
        this.setCurrentCell(cell);
        
        const cellData = this.grid[parseInt(cell.dataset.row)][parseInt(cell.dataset.col)];
        if (cellData.words.length > 1) {
            // Se houver clique duplo ou clique em célula de interseção, muda a direção
            const wordData = this.words[cellData.words[0]];
            const currentDir = wordData.direction;
            
            if (this.currentCell === cell && this.currentDirection !== currentDir) {
                this.currentDirection = currentDir;
            }
        }
    }
    
    handleKeyDown(e) {
        const input = e.target;
        const cell = input.parentElement;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.currentDirection = 'vertical';
                this.moveTo(row - 1, col);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.currentDirection = 'vertical';
                this.moveTo(row + 1, col);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.currentDirection = 'horizontal';
                this.moveTo(row, col - 1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.currentDirection = 'horizontal';
                this.moveTo(row, col + 1);
                break;
            case 'Backspace':
                if (!input.value) {
                    this.moveToPreviousCell(row, col);
                }
                break;
        }
    }
    
    setCurrentCell(cell) {
        document.querySelectorAll('.cell.current').forEach(c => c.classList.remove('current'));
        
        cell.classList.add('current');
        this.currentCell = cell;
        
        const input = cell.querySelector('input');
        if (input) {
            input.focus();
        }
    }
    
    moveTo(row, col) {
        if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell && cell.classList.contains('active')) {
                this.setCurrentCell(cell);
            }
        }
    }
    
    moveToNextCell(row, col) {
        if (this.currentDirection === 'horizontal') {
            this.moveTo(row, col + 1);
        } else {
            this.moveTo(row + 1, col);
        }
    }
    
    moveToPreviousCell(row, col) {
        if (this.currentDirection === 'horizontal') {
            this.moveTo(row, col - 1);
        } else {
            this.moveTo(row - 1, col);
        }
    }
    
    highlightWord(wordId) {
        document.querySelectorAll('.clue-item.active').forEach(item => item.classList.remove('active'));
        document.querySelectorAll('.cell.highlighted').forEach(cell => cell.classList.remove('highlighted'));
        
        document.querySelector(`[data-word="${wordId}"]`).classList.add('active');
        
        const wordData = this.words[wordId];
        const { startRow, startCol, direction, word } = wordData;
        
        for (let i = 0; i < word.length; i++) {
            const row = direction === 'horizontal' ? startRow : startRow + i;
            const col = direction === 'horizontal' ? startCol + i : startCol;
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) cell.classList.add('highlighted');
        }
        
        setTimeout(() => {
            document.querySelectorAll('.cell.highlighted').forEach(cell => cell.classList.remove('highlighted'));
        }, 3000);
        
        this.moveTo(startRow, startCol);
        this.currentDirection = direction;
    }
    
    checkWordCompletion(wordIds) {
        wordIds.forEach(wordId => {
            if (this.completedWords.has(wordId)) return;
            
            const wordData = this.words[wordId];
            const { word, startRow, startCol, direction } = wordData;
            let isComplete = true;
            
            for (let i = 0; i < word.length; i++) {
                const row = direction === 'horizontal' ? startRow : startRow + i;
                const col = direction === 'horizontal' ? startCol + i : startCol;
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                const input = cell?.querySelector('input');
                
                if (!input || input.value !== word[i]) {
                    isComplete = false;
                    break;
                }
            }
            
            if (isComplete) {
                this.markWordAsCompleted(wordId);
            }
        });
    }
    
    markWordAsCompleted(wordId) {
        this.completedWords.add(wordId);
        
        const wordData = this.words[wordId];
        const { word, startRow, startCol, direction } = wordData;
        
        for (let i = 0; i < word.length; i++) {
            const row = direction === 'horizontal' ? startRow : startRow + i;
            const col = direction === 'horizontal' ? startCol + i : startCol;
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            
            if (cell) {
                cell.classList.add('completed');
                const input = cell.querySelector('input');
                if (input) input.disabled = true;
            }
        }
        
        const clueItem = document.querySelector(`[data-word="${wordId}"]`);
        if (clueItem) clueItem.classList.add('completed');
        
        this.animateWordCompletion(wordId);
        this.updateProgress();
        
        if (this.completedWords.size === Object.keys(this.words).length) {
            this.gameCompleted();
        }
    }
    
    animateWordCompletion(wordId) {
        const wordData = this.words[wordId];
        const { word, startRow, startCol, direction } = wordData;
        
        for (let i = 0; i < word.length; i++) {
            const row = direction === 'horizontal' ? startRow : startRow + i;
            const col = direction === 'horizontal' ? startCol + i : startCol;
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            
            if (cell) {
                setTimeout(() => {
                    cell.classList.add('word-completed');
                    setTimeout(() => cell.classList.remove('word-completed'), 500);
                }, i * 50); // Shorter delay for smoother effect
            }
        }
    }
    
    updateProgress() {
        const totalCells = new Set();
        Object.values(this.words).forEach(wordData => {
            for(let i = 0; i < wordData.word.length; i++) {
                const row = wordData.direction === 'horizontal' ? wordData.startRow : wordData.startRow + i;
                const col = wordData.direction === 'horizontal' ? wordData.startCol + i : wordData.startCol;
                totalCells.add(`${row}-${col}`);
            }
        });
        
        const filledCells = document.querySelectorAll('.cell.filled').length;
        const progress = (filledCells / totalCells.size) * 100;
        
        document.getElementById('progress-fill').style.width = `${progress}%`;
        
        if (this.completedWords.size === Object.keys(this.words).length) {
            document.getElementById('status-text').textContent = 'Parabéns! Você completou a cruzadinha!';
        } else {
            document.getElementById('status-text').textContent = 
                `Progresso: ${this.completedWords.size}/${Object.keys(this.words).length} palavras completadas`;
        }
    }
    
    gameCompleted() {
        setTimeout(() => {
            alert('Parabéns! Você completou a cruzadinha sobre gestão escolar e PDDE!');
        }, 1000);
    }
    
    setupAccessibilityControls() {
        document.getElementById('increase-font').addEventListener('click', () => this.adjustFontSize(2));
        document.getElementById('decrease-font').addEventListener('click', () => this.adjustFontSize(-2));
        document.getElementById('increase-grid').addEventListener('click', () => this.adjustGridSize(4));
        document.getElementById('decrease-grid').addEventListener('click', () => this.adjustGridSize(-4));
        document.getElementById('toggle-contrast').addEventListener('click', () => this.toggleHighContrast());
    }
    
    adjustFontSize(change) {
        const root = document.documentElement;
        const currentSize = parseInt(getComputedStyle(root).getPropertyValue('--font-size-base'));
        const newSize = Math.max(12, Math.min(24, currentSize + change));
        
        root.style.setProperty('--font-size-base', `${newSize}px`);
        root.style.setProperty('--font-size-grid', `${newSize}px`);
    }
    
    adjustGridSize(change) {
        const root = document.documentElement;
        const currentSize = parseInt(getComputedStyle(root).getPropertyValue('--cell-size'));
        const newSize = Math.max(18, Math.min(50, currentSize + change));
        
        root.style.setProperty('--cell-size', `${newSize}px`);
    }
    
    toggleHighContrast() {
        document.body.classList.toggle('high-contrast');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CrosswordGame();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') return;
    
    if (e.ctrlKey) {
        switch (e.key) {
            case '+': case '=':
                e.preventDefault();
                document.getElementById('increase-font').click();
                break;
            case '-':
                e.preventDefault();
                document.getElementById('decrease-font').click();
                break;
            case 'h':
                e.preventDefault();
                document.getElementById('toggle-contrast').click();
                break;
        }
    }
});