// JavaScript for Grid Power
console.log('Game initialized'); 

// Game constants and variables
const WHITE = 'white';
const BLACK = 'black';
let gameBoard = [];
let moveCount = 0;
let currentLevel = 1;

// Tile power types
const POWER_TYPES = {
    NORMAL: 'normal',   // Normal tile
    RED: 'red',         // Flips in X pattern (diagonals)
    BLUE: 'blue',       // Only flips adjacent tiles, not itself
    GREEN: 'green',     // Can be clicked even when black
    PURPLE: 'purple'    // Flips all tiles in its row and column
};

// Level configurations
const LEVELS = {
    1: { gridSize: 3, fixed: true, moves: 2 }, // Level 1: 3x3 basic (2 moves)
    2: { gridSize: 4, fixed: true, moves: 4 }, // Level 2: 4x4 basic (4 moves)
    3: { gridSize: 4, fixed: true, moves: 4 }, // Level 3: Red tiles (4 moves)
    4: { gridSize: 4, fixed: true, moves: 4 }, // Level 4: Blue tiles (4 moves)
    5: { gridSize: 4, fixed: true, moves: 4 }, // Level 5: Green tiles (4 moves)
    6: { gridSize: 4, fixed: true, moves: 5 },  // Level 6: Purple tiles (5 moves)
    7: { gridSize: 4, fixed: true, moves: 4 },   // Level 7: All power tiles (4 moves)
    'daily': { gridSize: 4, fixed: true, moves: 5 } // Daily Challenge: All power tiles (5 moves)
};

// Fixed level power tile configurations
const LEVEL_POWER_CONFIGS = {
    // Level 1-2: No power tiles
    1: [],
    2: [],
    
    // Level 3: One red power tile
    3: [
        { row: 1, col: 2, type: POWER_TYPES.RED }
    ],
    
    // Level 4: One blue power tile at B3 (row 2, col 1)
    4: [
        { row: 2, col: 1, type: POWER_TYPES.BLUE }
    ],
    
    // Level 5: One green power tile - will be placed by the layout
    5: [],
    
    // Level 6: Multiple power tiles - will be placed by the layout
    6: [],
    
    // Level 7: All power tiles (will be placed by the layout)
    7: [],
    
    // Daily Challenge: All power tiles (will be placed by the layout)
    'daily': []
};

// Fixed level solution moves (the tiles to click to solve)
const LEVEL_SOLUTIONS = {
    // Level 1: 2 moves to solve
    1: [
        { row: 1, col: 1 }, // center tile
        { row: 0, col: 0 }  // top-left tile
    ],
    
    // Level 2: 4 moves to solve - new randomized pattern
    2: [
        { row: 0, col: 3 }, // top-right
        { row: 1, col: 0 }, // second row, first column  
        { row: 2, col: 2 }, // third row, third column
        { row: 3, col: 1 }  // bottom row, second column
    ],
    
    // Level 3: 4 moves to solve (red power tile)
    3: [
        { row: 1, col: 2 }, // red power tile (C2)
        { row: 0, col: 1 }, // (B1)
        { row: 2, col: 3 }, // (D3)
        { row: 3, col: 0 }  // (A4)
    ],
    
    // Level 4: 4 moves to solve (blue power tile)
    4: [
        { row: 3, col: 2 }, // (C4)
        { row: 1, col: 2 }, // (C2)
        { row: 2, col: 1 }, // blue power tile (B3)
        { row: 2, col: 0 }  // (A3)
    ],
    
    // Level 5: 4 moves to solve (green power tile)
    5: [
        { row: 2, col: 0 }, // (A3)
        { row: 1, col: 2 }, // (C2)
        { row: 1, col: 3 }, // (D2)
        { row: 0, col: 1 }  // (B1)
    ],
    
    // Level 6: 5 moves to solve with purple power tile
    6: [
        { row: 0, col: 1 }, // (B1)
        { row: 1, col: 3 }, // (D2)
        { row: 2, col: 3 }, // (D3)
        { row: 2, col: 1 }, // (B3)
        { row: 1, col: 0 }  // (A2)
    ],
    
    // Level 7: 4 moves to solve with all power tiles
    7: [
        { row: 1, col: 0 }, // (A2) - blue power tile
        { row: 0, col: 1 }, // (B1) - red power tile
        { row: 1, col: 3 }, // (D2)
        { row: 2, col: 2 }  // (C3) - purple power tile
    ],
    
    // Daily Challenge: 4 moves to solve
    'daily': [
        { row: 2, col: 2 }, // (C3)
        { row: 1, col: 2 }, // (B3)
        { row: 0, col: 2 }, // (C1)
        { row: 0, col: 0 }  // (A1)
    ]
};

// DOM elements
const gameBoardElement = document.getElementById('game-board');
const movesCounterElement = document.getElementById('moves-counter');
const resetButton = document.getElementById('reset-button');
const levelButtons = document.querySelectorAll('.level-btn');
const powerTileInfo = document.getElementById('power-tile-info');
const revealSolutionButton = document.getElementById('reveal-solution');
const solutionContainer = document.getElementById('solution-container');
const solutionMovesElement = document.getElementById('solution-moves');
const solutionStepsElement = document.getElementById('solution-steps');

// Modal elements
const congratsModal = document.getElementById('congrats-modal');
const congratsMessage = document.getElementById('congrats-message');
const nextLevelBtn = document.getElementById('next-level-btn');
const replayLevelBtn = document.getElementById('replay-level-btn');

// Initialize the game
function initializeGame() {
    removeCoordinatesFromGameBoard();
    
    const levelConfig = LEVELS[currentLevel];
    const GRID_SIZE = levelConfig.gridSize;
    
    gameBoard = [];
    moveCount = 0;
    movesCounterElement.textContent = `Moves: ${moveCount}`;
    gameBoardElement.innerHTML = '';
    
    // Set grid size class
    gameBoardElement.className = 'game-board';
    gameBoardElement.classList.add(`size-${GRID_SIZE}`);
    
    // Show/hide power tile info based on level
    if (currentLevel < 3) {
        powerTileInfo.style.display = 'none';
        hideHelperMessage();
    } else {
        powerTileInfo.style.display = 'block';
        
        if (currentLevel === 3) {
            highlightPowerTileForLevel(currentLevel);
        } else {
            const allPowerTileContainers = document.querySelectorAll('.power-tile-container');
            allPowerTileContainers.forEach(container => {
                container.classList.remove('highlighted-power');
            });
        }
        
        hideHelperMessage();
    }
    
    // Hide solution container when changing levels
    solutionContainer.classList.add('hidden');
    
    initializeFixedLevel(currentLevel);
    
    // Update solution moves count in the solution container
    if (currentLevel === 1) {
        solutionMovesElement.textContent = '2';
    } else if (currentLevel === 6) {
        solutionMovesElement.textContent = '5';
    } else if (currentLevel === 7) {
        solutionMovesElement.textContent = '4';
    } else if (currentLevel === 'daily') {
        solutionMovesElement.textContent = '4';
    } else {
        solutionMovesElement.textContent = '4';
    }
}

// Initialize a level with a fixed layout
function initializeFixedLevel(level) {
    const levelConfig = LEVELS[level];
    const gridSize = levelConfig.gridSize;
    const powerConfigs = LEVEL_POWER_CONFIGS[level];
    const solutionMoves = LEVEL_SOLUTIONS[level];
    
    // Step 1: Create an all-black grid (the solved state)
    for (let row = 0; row < gridSize; row++) {
        const rowTiles = [];
        for (let col = 0; col < gridSize; col++) {
            const tileData = {
                color: BLACK,
                power: POWER_TYPES.NORMAL
            };
            rowTiles.push(tileData);
            
            // Create tile element
            const tile = document.createElement('div');
            tile.classList.add('tile', BLACK);
            tile.dataset.row = row;
            tile.dataset.col = col;
            tile.addEventListener('click', handleTileClick);
            
            gameBoardElement.appendChild(tile);
        }
        gameBoard.push(rowTiles);
    }
    
    // Step 2: Apply power tiles based on configuration
    for (const powerConfig of powerConfigs) {
        const { row, col, type } = powerConfig;
        
        // Apply power to the tile
        gameBoard[row][col].power = type;
        
        // Add border to the tile element
        const tileElement = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
        tileElement.classList.add(`${type}-border`);
    }
    
    // Special case for level 4: Use the provided starting layout
    if (level === 4) {
        // Setup specific layout: 0010101101101011 where 0 is black and 1 is white
        const layout = "0010101101101011";
        for (let i = 0; i < layout.length; i++) {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            
            // If the character is '1', make the tile white
            if (layout[i] === '1') {
                gameBoard[row][col].color = WHITE;
                
                // Update the DOM
                const tileElement = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
                tileElement.classList.remove(BLACK);
                tileElement.classList.add(WHITE);
            }
            
            // Make sure power tile borders remain visible
            const power = gameBoard[row][col].power;
            if (power !== POWER_TYPES.NORMAL) {
                const tileElement = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
                tileElement.classList.add(`${power}-border`);
            }
        }
    } 
    // Special case for level 5: Use a specific layout
    else if (level === 5) {
        // Setup specific layout: 1101102011111000 where 1 is white, 0 is black, 2 is green power tile
        const layout = "1101102011111000";
        for (let i = 0; i < layout.length; i++) {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            
            // Set the tile color and power based on the layout
            if (layout[i] === '1') {
                // White tile
                gameBoard[row][col].color = WHITE;
                
                // Update the DOM
                const tileElement = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
                tileElement.classList.remove(BLACK);
                tileElement.classList.add(WHITE);
            } else if (layout[i] === '2') {
                // Green power tile - starts black (not white) at C2
                gameBoard[row][col].color = BLACK; // Starting as black
                gameBoard[row][col].power = POWER_TYPES.GREEN;
                
                // Update the DOM
                const tileElement = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
                // Keep it black
                tileElement.classList.add('green-border');
            }
        }
    }
    // Special case for level 6: Use a specific layout with multiple power tiles
    else if (level === 6) {
        // Setup specific layout with multiple power tiles:
        // 0 = black normal tile
        // 1 = white normal tile
        // 3 = purple power tile (starts white)
        const layout = "0111310101001101";
        for (let i = 0; i < layout.length; i++) {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            
            // Set the tile color and power based on the layout
            switch (layout[i]) {
                case '1':
                    // White normal tile
                    gameBoard[row][col].color = WHITE;
                    
                    // Update the DOM
                    const tileElement = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
                    tileElement.classList.remove(BLACK);
                    tileElement.classList.add(WHITE);
                    break;
                    
                case '3':
                    // Purple power tile - starts white
                    gameBoard[row][col].color = WHITE; // Starting as white
                    gameBoard[row][col].power = POWER_TYPES.PURPLE;
                    
                    // Update the DOM
                    const purpleTile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
                    purpleTile.classList.remove(BLACK);
                    purpleTile.classList.add(WHITE);
                    purpleTile.classList.add('purple-border');
                    break;
                    
                default:
                    // Black normal tile (0)
                    // Already set to BLACK by default
                    break;
            }
        }
    }
    // Special case for level 7: Use a layout with all four power tile types
    else if (level === 7) {
        // Setup specific layout with all power tiles:
        // 0 = white normal tile
        // X = black normal tile
        // R = red power tile (white)
        // G = green power tile (white)
        // B = blue power tile (white)
        // P = purple power tile (white)
        // Layout: 0R0GB000X0PXXX0X
        
        // Convert layout to numerical encoding for processing
        const layoutString = "0R0GB000X0PXXX0X";
        const layoutEncoding = {
            '0': '0',  // white normal tile
            'X': '1',  // black normal tile
            'R': '2',  // red power tile (white)
            'G': '3',  // green power tile (white)
            'B': '4',  // blue power tile (white)
            'P': '5'   // purple power tile (white)
        };
        
        let layout = "";
        for (let i = 0; i < layoutString.length; i++) {
            layout += layoutEncoding[layoutString[i]];
        }
        
        for (let i = 0; i < layout.length; i++) {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            
            // Set the tile color and power based on the layout
            switch (layout[i]) {
                case '0':
                    // White normal tile
                    gameBoard[row][col].color = WHITE;
                    
                    // Update the DOM
                    const whiteTile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
                    whiteTile.classList.remove(BLACK);
                    whiteTile.classList.add(WHITE);
                    break;
                    
                case '1':
                    // Black normal tile - already set to BLACK by default
                    break;
                    
                case '2':
                    // Red power tile - starts white
                    gameBoard[row][col].color = WHITE;
                    gameBoard[row][col].power = POWER_TYPES.RED;
                    
                    // Update the DOM
                    const redTile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
                    redTile.classList.remove(BLACK);
                    redTile.classList.add(WHITE);
                    redTile.classList.add('red-border');
                    break;
                    
                case '3':
                    // Green power tile - starts white
                    gameBoard[row][col].color = WHITE;
                    gameBoard[row][col].power = POWER_TYPES.GREEN;
                    
                    // Update the DOM
                    const greenTile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
                    greenTile.classList.remove(BLACK);
                    greenTile.classList.add(WHITE);
                    greenTile.classList.add('green-border');
                    break;
                    
                case '4':
                    // Blue power tile - starts white
                    gameBoard[row][col].color = WHITE;
                    gameBoard[row][col].power = POWER_TYPES.BLUE;
                    
                    // Update the DOM
                    const blueTile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
                    blueTile.classList.remove(BLACK);
                    blueTile.classList.add(WHITE);
                    blueTile.classList.add('blue-border');
                    break;
                    
                case '5':
                    // Purple power tile - starts white
                    gameBoard[row][col].color = WHITE;
                    gameBoard[row][col].power = POWER_TYPES.PURPLE;
                    
                    // Update the DOM
                    const purpleTile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
                    purpleTile.classList.remove(BLACK);
                    purpleTile.classList.add(WHITE);
                    purpleTile.classList.add('purple-border');
                    break;
            }
        }
    }
    // Special case for daily challenge
    else if (level === 'daily') {
        // Setup specific layout with all power tiles:
        // o = white normal tile
        // x = black normal tile
        // r, g, b, p = power tiles when white (lowercase)
        // R, G, B, P = power tiles when black (uppercase)
        // Layout: pxooxooxorGoBoxx
        
        // Convert layout to numerical encoding for processing
        const layoutString = "pxbxxxoxoRgoxxxx";
        const layoutEncoding = {
            'o': '0',  // white normal tile
            'x': '1',  // black normal tile
            'r': '2',  // red power tile (white)
            'g': '3',  // green power tile (white)
            'b': '4',  // blue power tile (white)
            'p': '5',  // purple power tile (white)
            'R': '6',  // red power tile (black)
            'G': '7',  // green power tile (black)
            'B': '8',  // blue power tile (black)
            'P': '9'   // purple power tile (black)
        };
        
        let layout = "";
        for (let i = 0; i < layoutString.length; i++) {
            layout += layoutEncoding[layoutString[i]];
        }
        
        for (let i = 0; i < layout.length; i++) {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            
            // Set the tile color and power based on the layout
            switch (layout[i]) {
                case '0':
                    // White normal tile
                    gameBoard[row][col].color = WHITE;
                    
                    // Update the DOM
                    const whiteTile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
                    whiteTile.classList.remove(BLACK);
                    whiteTile.classList.add(WHITE);
                    break;
                    
                case '1':
                    // Black normal tile - already set to BLACK by default
                    break;
                    
                case '2':
                    // Red power tile - starts white
                    gameBoard[row][col].color = WHITE;
                    gameBoard[row][col].power = POWER_TYPES.RED;
                    
                    // Update the DOM
                    const redTile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
                    redTile.classList.remove(BLACK);
                    redTile.classList.add(WHITE);
                    redTile.classList.add('red-border');
                    break;
                    
                case '3':
                    // Green power tile - starts white
                    gameBoard[row][col].color = WHITE;
                    gameBoard[row][col].power = POWER_TYPES.GREEN;
                    
                    // Update the DOM
                    const greenTile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
                    greenTile.classList.remove(BLACK);
                    greenTile.classList.add(WHITE);
                    greenTile.classList.add('green-border');
                    break;
                    
                case '4':
                    // Blue power tile - starts white
                    gameBoard[row][col].color = WHITE;
                    gameBoard[row][col].power = POWER_TYPES.BLUE;
                    
                    // Update the DOM
                    const blueTile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
                    blueTile.classList.remove(BLACK);
                    blueTile.classList.add(WHITE);
                    blueTile.classList.add('blue-border');
                    break;
                    
                case '5':
                    // Purple power tile - starts white
                    gameBoard[row][col].color = WHITE;
                    gameBoard[row][col].power = POWER_TYPES.PURPLE;
                    
                    // Update the DOM
                    const purpleTile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
                    purpleTile.classList.remove(BLACK);
                    purpleTile.classList.add(WHITE);
                    purpleTile.classList.add('purple-border');
                    break;
                    
                case '6':
                    // Red power tile - starts black
                    gameBoard[row][col].color = BLACK;
                    gameBoard[row][col].power = POWER_TYPES.RED;
                    
                    // Update the DOM
                    const redTileBlack = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
                    redTileBlack.classList.remove(WHITE);
                    redTileBlack.classList.add(BLACK);
                    redTileBlack.classList.add('red-border');
                    break;
                    
                case '7':
                    // Green power tile - starts black
                    gameBoard[row][col].color = BLACK;
                    gameBoard[row][col].power = POWER_TYPES.GREEN;
                    
                    // Update the DOM
                    const greenTileBlack = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
                    greenTileBlack.classList.remove(WHITE);
                    greenTileBlack.classList.add(BLACK);
                    greenTileBlack.classList.add('green-border');
                    break;
                    
                case '8':
                    // Blue power tile - starts black
                    gameBoard[row][col].color = BLACK;
                    gameBoard[row][col].power = POWER_TYPES.BLUE;
                    
                    // Update the DOM
                    const blueTileBlack = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
                    blueTileBlack.classList.remove(WHITE);
                    blueTileBlack.classList.add(BLACK);
                    blueTileBlack.classList.add('blue-border');
                    break;
                    
                case '9':
                    // Purple power tile - starts black
                    gameBoard[row][col].color = BLACK;
                    gameBoard[row][col].power = POWER_TYPES.PURPLE;
                    
                    // Update the DOM
                    const purpleTileBlack = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
                    purpleTileBlack.classList.remove(WHITE);
                    purpleTileBlack.classList.add(BLACK);
                    purpleTileBlack.classList.add('purple-border');
                    break;
            }
        }
    }
    else {
        // For other levels, apply the solution moves in reverse to create initial state
        for (const move of solutionMoves) {
            performMove(move.row, move.col, false, true);
        }
    }
    
    console.log(`Level ${level} initialized, solvable in ${solutionMoves.length} moves`);
}

// Perform a move (flip tile and adjacent tiles based on power)
function performMove(row, col, checkWin = true, forceFlip = false) {
    const GRID_SIZE = LEVELS[currentLevel].gridSize;
    const tilePower = gameBoard[row][col].power;
    const tileColor = gameBoard[row][col].color;
    
    // Check if we can click this tile
    if (!forceFlip && tileColor === BLACK && tilePower !== POWER_TYPES.GREEN) {
        return; // Do nothing when clicking black tiles during gameplay unless it's a green power tile
    }
    
    // Handle different power types
    switch (tilePower) {
        case POWER_TYPES.NORMAL:
            // Normal tile: flip self and adjacent tiles in + pattern
            flipTile(row, col); // Flip self
            
            // Flip adjacent tiles
            if (row > 0) flipTile(row - 1, col); // Top
            if (row < GRID_SIZE - 1) flipTile(row + 1, col); // Bottom
            if (col > 0) flipTile(row, col - 1); // Left
            if (col < GRID_SIZE - 1) flipTile(row, col + 1); // Right
            break;
            
        case POWER_TYPES.RED:
            // Red tile: flip self and diagonal tiles in X pattern
            flipTile(row, col); // Flip self
            
            // Flip diagonal tiles
            if (row > 0 && col > 0) flipTile(row - 1, col - 1); // Top-left
            if (row > 0 && col < GRID_SIZE - 1) flipTile(row - 1, col + 1); // Top-right
            if (row < GRID_SIZE - 1 && col > 0) flipTile(row + 1, col - 1); // Bottom-left
            if (row < GRID_SIZE - 1 && col < GRID_SIZE - 1) flipTile(row + 1, col + 1); // Bottom-right
            break;
            
        case POWER_TYPES.BLUE:
            // Blue tile: only flip adjacent tiles, not itself
            // Flip adjacent tiles
            if (row > 0) flipTile(row - 1, col); // Top
            if (row < GRID_SIZE - 1) flipTile(row + 1, col); // Bottom
            if (col > 0) flipTile(row, col - 1); // Left
            if (col < GRID_SIZE - 1) flipTile(row, col + 1); // Right
            break;
            
        case POWER_TYPES.GREEN:
            // Green tile: same as normal but can be clicked when black
            flipTile(row, col); // Flip self
            
            // Flip adjacent tiles
            if (row > 0) flipTile(row - 1, col); // Top
            if (row < GRID_SIZE - 1) flipTile(row + 1, col); // Bottom
            if (col > 0) flipTile(row, col - 1); // Left
            if (col < GRID_SIZE - 1) flipTile(row, col + 1); // Right
            break;
            
        case POWER_TYPES.PURPLE:
            // Purple tile: flip all tiles in the same row and column
            flipTile(row, col); // Flip self
            
            // Flip entire row
            for (let c = 0; c < GRID_SIZE; c++) {
                if (c !== col) flipTile(row, c);
            }
            
            // Flip entire column
            for (let r = 0; r < GRID_SIZE; r++) {
                if (r !== row) flipTile(r, col);
            }
            break;
    }
    
    if (checkWin) {
        // Update moves counter
        moveCount++;
        movesCounterElement.textContent = `Moves: ${moveCount}`;
        
        // Check if game is won
        checkWinCondition();
    }
}

// Handle tile click
function handleTileClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    
    performMove(row, col);
}

// Flip a tile's color
function flipTile(row, col) {
    // Update the game board array
    gameBoard[row][col].color = gameBoard[row][col].color === WHITE ? BLACK : WHITE;
    
    // Update the DOM
    const tileElement = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
    tileElement.classList.toggle(WHITE);
    tileElement.classList.toggle(BLACK);
    
    // Ensure power tile borders remain visible
    const power = gameBoard[row][col].power;
    if (power !== POWER_TYPES.NORMAL) {
        // Remove all power border classes first to avoid having multiple
        tileElement.classList.remove('red-border', 'blue-border', 'green-border', 'purple-border');
        // Add the correct power border
        tileElement.classList.add(`${power}-border`);
    }
}

// Check if all tiles are black (win condition)
function checkWinCondition() {
    const allBlack = gameBoard.every(row => 
        row.every(tile => tile.color === BLACK)
    );
    
    if (allBlack) {
        setTimeout(() => {
            showCongratsModal();
        }, 300);
    }
}

// Show congratulations modal
function showCongratsModal() {
    // Set congratulations message
    congratsMessage.textContent = `You completed ${currentLevel === 'daily' ? 'the Daily Challenge' : 'level ' + currentLevel} in ${moveCount} moves!`;
    
    // Show/hide next level button based on whether there's a next level
    if (currentLevel === 'daily' || currentLevel >= 7) {
        nextLevelBtn.style.display = 'none';
    } else {
        nextLevelBtn.style.display = 'block';
    }
    
    // Show the modal
    congratsModal.classList.remove('hidden');
}

// Hide congratulations modal
function hideCongratsModal() {
    congratsModal.classList.add('hidden');
}

// Change level
function changeLevel(level) {
    currentLevel = level;
    
    // Remove any existing coordinate labels before changing levels
    removeCoordinatesFromGameBoard();
    
    // Update active button
    levelButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Update document title
    if (level === 'daily') {
        document.title = "GRID POWER - Daily";
        document.getElementById('daily-challenge').classList.add('active');
    } else {
        document.title = `GRID POWER - Level ${level}`;
        document.getElementById(`level-${level}`).classList.add('active');
    }
    
    // Reinitialize game
    initializeGame();
}

// Reveal solution function
function revealSolution() {
    // Clear previous solution steps
    solutionStepsElement.innerHTML = '';
    
    // Add row numbers and column letters to the game board
    addCoordinatesToGameBoard();
    
    // For level 1, show the exact specified solution text
    if (currentLevel === 1) {
        // Display the hardcoded solution for level 1
        const step1 = document.createElement('li');
        step1.textContent = 'Click the tile at position B2';
        solutionStepsElement.appendChild(step1);
        
        const step2 = document.createElement('li');
        step2.textContent = 'Click the tile at position A1';
        solutionStepsElement.appendChild(step2);
    } 
    // For level 2, show the hardcoded solution
    else if (currentLevel === 2) {
        const steps = [
            'Click the tile at position C3',
            'Click the tile at position B4',
            'Click the tile at position A2',
            'Click the tile at position D1'
        ];
        
        steps.forEach(stepText => {
            const step = document.createElement('li');
            step.textContent = stepText;
            solutionStepsElement.appendChild(step);
        });
    }
    // For level 3, show the solution with red power tile
    else if (currentLevel === 3) {
        const steps = [
            'Click the tile at position C2',
            'Click the tile at position B1',
            'Click the tile at position D3',
            'Click the tile at position A4'
        ];
        
        steps.forEach(stepText => {
            const step = document.createElement('li');
            step.textContent = stepText;
            solutionStepsElement.appendChild(step);
        });
    }
    // For level 4, show the solution with blue power tile
    else if (currentLevel === 4) {
        const steps = [
            'Click the tile at position C4',
            'Click the tile at position C2',
            'Click the tile at position B3',
            'Click the tile at position A3'
        ];
        
        steps.forEach(stepText => {
            const step = document.createElement('li');
            step.textContent = stepText;
            solutionStepsElement.appendChild(step);
        });
    }
    // For level 5, show the solution with green power tile
    else if (currentLevel === 5) {
        const steps = [
            'Click the tile at position A3',
            'Click the tile at position C2',
            'Click the tile at position D2',
            'Click the tile at position B1'
        ];
        
        steps.forEach(stepText => {
            const step = document.createElement('li');
            step.textContent = stepText;
            solutionStepsElement.appendChild(step);
        });
    }
    // For level 6, show the solution with multiple power tiles
    else if (currentLevel === 6) {
        const steps = [
            'Click the tile at position B1',
            'Click the tile at position D2',
            'Click the tile at position D3',
            'Click the tile at position B3',
            'Click the tile at position A2'
        ];
        
        steps.forEach(stepText => {
            const step = document.createElement('li');
            step.textContent = stepText;
            solutionStepsElement.appendChild(step);
        });
    }
    // For level 7, show the solution with all power tiles
    else if (currentLevel === 7) {
        const steps = [
            'Click the tile at position A2',
            'Click the tile at position B1',
            'Click the tile at position D2',
            'Click the tile at position C3'
        ];
        
        steps.forEach(stepText => {
            const step = document.createElement('li');
            step.textContent = stepText;
            solutionStepsElement.appendChild(step);
        });
    }
    // For Daily Challenge
    else if (currentLevel === 'daily') {
        const steps = [
            'Click the tile at position C3',
            'Click the tile at position B3',
            'Click the tile at position C1',
            'Click the tile at position A1'
        ];
        
        steps.forEach(stepText => {
            const step = document.createElement('li');
            step.textContent = stepText;
            solutionStepsElement.appendChild(step);
        });
    }
    
    // Show solution container
    solutionContainer.classList.remove('hidden');
}

// Add coordinate labels to the game board
function addCoordinatesToGameBoard() {
    const GRID_SIZE = LEVELS[currentLevel].gridSize;
    
    // Remove any existing coordinates
    removeCoordinatesFromGameBoard();
    
    // Add wrapper div for coordinates
    const gameColumn = document.querySelector('.game-column');
    const gridWrapper = document.createElement('div');
    gridWrapper.className = 'grid-wrapper';
    
    // Get game controls to preserve their position
    const gameControls = document.querySelector('.game-controls');
    
    // Move the game board into the wrapper
    const originalGameBoard = document.getElementById('game-board');
    gameColumn.removeChild(originalGameBoard);
    
    // If game controls exist, temporarily remove them so they can be re-added after the grid
    if (gameControls) {
        gameColumn.removeChild(gameControls);
    }
    
    gridWrapper.appendChild(originalGameBoard);
    
    // Create column headers (A, B, C, D...)
    const colHeaders = document.createElement('div');
    colHeaders.className = 'col-headers';
    colHeaders.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
    
    // Add corner cell (empty top-left corner)
    const cornerCell = document.createElement('div');
    cornerCell.className = 'corner-cell';
    gridWrapper.appendChild(cornerCell);
    
    // Add column letters
    for (let col = 0; col < GRID_SIZE; col++) {
        const colHeader = document.createElement('div');
        colHeader.className = 'col-header';
        colHeader.textContent = String.fromCharCode(65 + col); // A, B, C, D...
        colHeaders.appendChild(colHeader);
    }
    
    // Create row headers container
    const rowHeaders = document.createElement('div');
    rowHeaders.className = 'row-headers';
    rowHeaders.style.gridTemplateRows = `repeat(${GRID_SIZE}, 1fr)`;
    
    // Add row numbers
    for (let row = 0; row < GRID_SIZE; row++) {
        const rowHeader = document.createElement('div');
        rowHeader.className = 'row-header';
        rowHeader.textContent = (row + 1).toString();
        rowHeaders.appendChild(rowHeader);
    }
    
    // Add elements to wrapper in correct order
    gridWrapper.appendChild(colHeaders);
    gridWrapper.appendChild(rowHeaders);
    gridWrapper.appendChild(originalGameBoard); // Re-add the game board to ensure proper placement
    gameColumn.appendChild(gridWrapper);
    
    // Add back the game controls if they existed, ensuring they appear below the grid
    if (gameControls) {
        gameColumn.appendChild(gameControls);
    }
}

// Remove coordinate labels from the game board
function removeCoordinatesFromGameBoard() {
    const gridWrapper = document.querySelector('.grid-wrapper');
    if (gridWrapper) {
        const gameColumn = document.querySelector('.game-column');
        const gameBoard = document.getElementById('game-board');
        const gameControls = document.querySelector('.game-controls');
        
        // Temporarily remove game controls if they exist
        if (gameControls) {
            if (gameColumn.contains(gameControls)) {
                gameColumn.removeChild(gameControls);
            }
        }
        
        // Move game board back to its original parent
        if (gameBoard && gridWrapper.contains(gameBoard)) {
            gridWrapper.removeChild(gameBoard);
            gameColumn.appendChild(gameBoard);
        }
        
        // Remove the wrapper
        gridWrapper.remove();
        
        // Add back the game controls below the grid
        if (gameControls) {
            gameColumn.appendChild(gameControls);
        }
    }
}

// Get human-readable description of a tile
function getTileDescription(row, col) {
    const tile = gameBoard[row][col];
    let description = '';
    
    // Add color
    description += tile.color === WHITE ? 'white' : 'black';
    
    // Add power type if any
    if (tile.power !== POWER_TYPES.NORMAL) {
        switch (tile.power) {
            case POWER_TYPES.RED:
                description += ' red-bordered';
                break;
            case POWER_TYPES.BLUE:
                description += ' blue-bordered';
                break;
            case POWER_TYPES.GREEN:
                description += ' green-bordered';
                break;
            case POWER_TYPES.PURPLE:
                description += ' purple-bordered';
                break;
        }
    }
    
    description += ' tile';
    return description;
}

// Highlight the power tile info for the current level
function highlightPowerTileForLevel(level) {
    // Remove any existing highlights
    const allPowerTileContainers = document.querySelectorAll('.power-tile-container');
    allPowerTileContainers.forEach(container => {
        container.classList.remove('highlighted-power');
    });
    
    // Add highlight based on the level
    if (level === 3) {
        // Level 3 - Red power tile
        const redPowerContainer = document.querySelector('.power-tile-container:nth-child(1)');
        if (redPowerContainer) {
            redPowerContainer.classList.add('highlighted-power');
        }
    } else if (level === 4) {
        // Level 4 - Blue power tile
        const bluePowerContainer = document.querySelector('.power-tile-container:nth-child(2)');
        if (bluePowerContainer) {
            bluePowerContainer.classList.add('highlighted-power');
        }
    } else if (level === 5) {
        // Level 5 - Green power tile
        const greenPowerContainer = document.querySelector('.power-tile-container:nth-child(3)');
        if (greenPowerContainer) {
            greenPowerContainer.classList.add('highlighted-power');
        }
    } else if (level === 6) {
        // Level 6 - Purple power tile
        const purplePowerContainer = document.querySelector('.power-tile-container:nth-child(4)');
        if (purplePowerContainer) {
            purplePowerContainer.classList.add('highlighted-power');
        }
    }
}

// Helper message functions
function showHelperMessage(message) {
    hideHelperMessage();
    
    const helperMessage = document.createElement('div');
    helperMessage.className = 'helper-message';
    helperMessage.textContent = message;
    
    const gameColumn = document.querySelector('.game-column');
    gameColumn.insertBefore(helperMessage, gameColumn.firstChild);
}

function hideHelperMessage() {
    const existingMessage = document.querySelector('.helper-message');
    if (existingMessage) {
        existingMessage.remove();
    }
}

// Set up event listeners
resetButton.addEventListener('click', () => {
    removeCoordinatesFromGameBoard();
    initializeGame();
});

revealSolutionButton.addEventListener('click', revealSolution);

// Modal button event listeners
nextLevelBtn.addEventListener('click', () => {
    hideCongratsModal();
    if (currentLevel !== 'daily' && currentLevel < 7) {
        changeLevel(currentLevel + 1);
    }
});

replayLevelBtn.addEventListener('click', () => {
    hideCongratsModal();
    initializeGame();
});

// Level button event listeners
levelButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const level = parseInt(e.target.id.split('-')[1]);
        changeLevel(level);
    });
});

// Start the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    currentLevel = 1;
    
    // Show levels 1-7 and hide all others
    levelButtons.forEach(btn => {
        if (btn.id !== 'level-1' && btn.id !== 'level-2' && btn.id !== 'level-3' && 
            btn.id !== 'level-4' && btn.id !== 'level-5' && btn.id !== 'level-6' && 
            btn.id !== 'level-7') {
            btn.style.display = 'none';
        } else if (btn.id === 'level-1') {
            btn.classList.add('active');
        }
    });
    
    // Add event listener for the daily challenge button
    const dailyButton = document.getElementById('daily-challenge');
    dailyButton.addEventListener('click', () => {
        // Deactivate all level buttons
        levelButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Activate daily button
        dailyButton.classList.add('active');
        
        // Update document title
        document.title = "GRID POWER - Daily";
        
        // Set current level to daily and initialize
        currentLevel = 'daily';
        initializeGame();
    });
    
    initializeGame();
});

document.addEventListener('DOMContentLoaded', () => {
    // Add click event listener to dropdown button for mobile devices
    const dropdownButton = document.querySelector('.dropdown-button');
    const dropdownContent = document.querySelector('.dropdown-content');

    dropdownButton.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownContent.style.display = 
            dropdownContent.style.display === 'block' ? 'none' : 'block';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        dropdownContent.style.display = 'none';
    });
}); 