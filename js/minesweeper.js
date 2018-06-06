var c = 9, r = 9, mines = 10, flags = 0;
var isFirstClick, intervalId;
var mineField, visited, adjMinesNum, numRevealed = 0;
var flagged, flagsPlanted = 0;

var adj = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1]];

function buildGrid(c, r) {
    // Fetch grid and clear out old elements.
    var grid = document.getElementById("minefield");
    grid.innerHTML = null;
    var columns = c;
    var rows = r;

    // Build DOM Grid
    var tile;
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < columns; x++) {
            tile = createTile(x,y);
            grid.appendChild(tile);
        }
    }   
    
    var style = window.getComputedStyle(tile);

    var width = parseInt(style.width.slice(0, -2));
    var height = parseInt(style.height.slice(0, -2));
    
    grid.style.width = columns * width;
    grid.style.height = rows * height;
}

function createTile(x,y) {
    var tile = document.createElement("div");
    tile.x = x;
    tile.y = y;
    tile.classList.add("tile");
    tile.classList.add("hidden");

    tile.addEventListener("click", handleTileClick); //Left Click
    tile.addEventListener("auxclick", handleTileClick); //Middle Click
    tile.addEventListener("contextmenu", function(e) {e.preventDefault();}); //Right Click
    tile.addEventListener("mouseup", faceLimboOff);
    tile.addEventListener("mousedown", faceLimboOn);

    return tile;
}

function startGame() {
    buildGrid(c, r);
    updateMinesLeft();
    isFirstClick = true;
    timeValue = 0;
    flagsPlanted = 0;
    numRevealed = 0;
    updateTimer();
    window.clearInterval(intervalId);
}

function initiateGame(clickX, clickY) {
    mineField = setMines(mines, c, r, clickX, clickY);
    setAdjNum();
    setVisited();
    setFlag();
    startTimer();
    isFirstClick = false;
}

function smileyDown() {
    var smiley = document.getElementById("smiley");
    smiley.classList.add("face_down");
}

function smileyUp() {
    var smiley = document.getElementById("smiley");
    smiley.classList.remove("face_down");
}

function faceLimboOn() {
    var smiley = document.getElementById("smiley");
    smiley.classList.add("face_limbo");
}

function faceLimboOff() {
    var smiley = document.getElementById("smiley");
    smiley.classList.remove("face_limbo");
}

function revealNum(tile) {
    switch (adjMinesNum[tile.x][tile.y]) {
        case 1:
            tile.classList.add("tile_1");
            break;
        case 2:
            tile.classList.add("tile_2");
            break;
        case 3:
            tile.classList.add("tile_3");
            break;
        case 4:
            tile.classList.add("tile_4");
            break;
        case 5:
            tile.classList.add("tile_5");
            break;
        case 6:
            tile.classList.add("tile_6");
            break;
        case 7:
            tile.classList.add("tile_7");
            break;
        case 8:
            tile.classList.add("tile_8");
            break;
    }
}

function gameOver() {
    var smiley = document.getElementById("smiley");
    smiley.classList.add("face_lose");
    alert("You have lost.");
}

function gameWon() {
    var smiley = document.getElementById("smiley");
    smiley.classList.add("face_win");
    alert("You are victorious! Your time is: " + timeValue);
}

function revealSurround(tile) {
    var grid = document.getElementById("minefield");
    var map = grid.children;

    for (var i = 0; i < 8; i++) {
        var adjX = tile.x + adj[i][0];
        var adjY = tile.y + adj[i][1];
        if (inBound(adjX, adjY) && !visited[adjX][adjY] && !flagged[adjX][adjY]) {
            if (isMine(adjX, adjY)) {
                map[adjY * c + adjX].classList.add("mine_hit");
                gameOver();
            } else if (isNumbered(adjX, adjY)) {
                revealNum(map[adjY * c + adjX]);
            } else {
                var queue = [];
                queue.push(map[adjY * c + adjX]);
                revealEmpty(queue);
            }
            visited[adjX][adjY] = true;
            numRevealed++;
        }
    }
}

function matchSurroundFlags(tile) {
    var count = 0;
    for (var i = 0; i < 8; i++) {
        var adjX = tile.x + adj[i][0];
        var adjY = tile.y + adj[i][1];
        if (inBound(adjX, adjY) && flagged[adjX][adjY])
            count++;
    }

    if (adjMinesNum[tile.x][tile.y] === count)
        return true;
    else 
        return false;
}

function handleTileClick(event) {
    var tile = event.target;
    // Left Click
    if (event.button === 0) {
        tile.classList.remove("hidden");
        console.log(tile.x, tile.y);
        if (isFirstClick)
            initiateGame(tile.x, tile.y);

        if (!flagged[tile.x][tile.y]) {
            if (isMine(tile.x, tile.y)) {
                tile.classList.add("mine_hit");
                gameOver();
            } else if (isNumbered(tile.x, tile.y)) {
                revealNum(tile);
            } else {
                var queue = [];
                queue.push(tile);
                revealEmpty(queue);
            }
            visited[tile.x][tile.y] = true;
            numRevealed++;
        }   
    }
    // Middle Click
    else if (event.button === 1) {
        if (visited[tile.x][tile.y] && isNumbered(tile.x, tile.y) && matchSurroundFlags(tile)) {
            revealSurround(tile);
        }
    }
    // Right Click
    else if (event.button === 2) {
        if (!visited[tile.x][tile.y]) {
            if (!flagged[tile.x][tile.y]) {
                flagged[tile.x][tile.y] = true;
                tile.classList.add("flag");
                flagsPlanted++;
            } else {
                flagged[tile.x][tile.y] = false;
                tile.classList.remove("flag");
                flagsPlanted--;
            }
        }
    }

    console.log(numRevealed);
    if (numRevealed === (r * c - mines)) {
        gameWon();
    }
}

function setFlag() {
    flagged = new Array(r);
    for (var i = 0; i < c; i++) {
        flagged[i] = new Array(c);
        for (var j = 0; j < r; j++) {
            flagged[i][j] = 0;
        }
    }
    console.log("Set flagged matrix");
}


function setVisited() {
    visited = new Array(r);
    for (var i = 0; i < c; i++) {
        visited[i] = new Array(c);
        for (var j = 0; j < r; j++) {
            visited[i][j] = 0;
        }
    }
    console.log("Set visited matrix");
}

function setAdjNum() {
    adjMinesNum = new Array(r);
    for (var i = 0; i < c; i++) {
        adjMinesNum[i] = new Array(c);
        for (var j = 0; j < r; j++) {
            adjMinesNum[i][j] = 0;
        }
    }

    for (var i = 0; i < c; i++) {
        for (var j = 0; j < r; j++) {
            adjMinesNum[i][j] = countAdj(i, j);
        }
    }
    console.log("Set adj mines num matrix.");
}

function countAdj(x, y) {
    var count = 0;
    for (var i = 0; i < 8; i++) {
        var adjX = x + adj[i][0];
        var adjY = y + adj[i][1];
        if (inBound(adjX, adjY) && isMine(adjX, adjY))
            count++;
    }
    return count;
}

function inBound(x, y) {
    if (x >= 0 && x < c && y >= 0 && y < r )
        return true;
    else
        return false;
}

function setDifficulty() {
    handleDifficultyChange();
}

function handleDifficultyChange() {
    var difficultySelector = document.getElementById("difficulty");
    var difficulty = event.target.selectedIndex;
    console.log(difficulty);
    switch (difficulty) {
        case 0:
            c = 9;
            r = 9;
            mines = 10;
            startGame();
            break;
        case 1:
            c = 16;
            r = 16;
            mines = 40;
            startGame();
            break;
        case 2:
            c = 30;
            r = 16;
            mines = 99;
            startGame();
            break;
    }
}

function traverseEmpty(queue) {
    var grid = document.getElementById("minefield");
    var map = grid.children;
    for (var i = 0; i < 8; i++) {
        var adjX = queue[0].x + adj[i][0];
        var adjY = queue[0].y + adj[i][1];
        if (inBound(adjX, adjY) && !isMine(adjX, adjY) && !visited[adjX][adjY] && !flagged[adjX][adjY]) {
            queue.push(map[adjY * c + adjX]);
            visited[adjX][adjY] = true;
            numRevealed++;
        }
    }
    return queue;
}


function revealEmpty(queue) {
    while(!(queue.length === 0)) {
        var tile = queue[0];
        visited[tile.x][tile.y] = true;
        tile.classList.remove("hidden");
        revealNum(tile);
        if (adjMinesNum[tile.x][tile.y] === 0) {
            queue = traverseEmpty(queue);
        }
        queue.shift();
    }
}

function setMines(mines, c, r, clickX, clickY) {
    var grid = new Array(r);
    for (var i = 0; i < c; i++) {
        grid[i] = new Array(c);
        for (var j = 0; j < r; j++) {
            grid[i][j] = false;
        }
    }

    var count = 0;
    while (count < mines) {
        var x = generateRandom(c);
        var y = generateRandom(r);

        while (grid[x][y] || (Math.abs(clickX - x) <= 1 && Math.abs(clickY - y) <= 1)) {
            var x = generateRandom(c);
            var y = generateRandom(r);
        }
        grid[x][y] = true;
        count++;
    }
    console.log("Mines set.");
    return grid;
}

function isMine(x, y) {
    if (mineField[x][y])
        return true;
    else
        return false;
}

function isNumbered(x, y) {
    if (adjMinesNum[x][y] != 0 && !isMine(x, y))
        return true;
    else
        return false;
}

function generateRandom(max) {
    return Math.floor(Math.random() * max);
}

function startTimer() {
    timeValue = 0;
    intervalId = window.setInterval(onTimerTick, 1000);
}

function onTimerTick() {
    timeValue++;
    updateTimer();
    updateMinesLeft();
}

function updateTimer() {
    document.getElementById("timer").innerHTML = timeValue;
}

function updateMinesLeft() {
    document.getElementById("flagCount").innerHTML = Math.max(0, mines - flagsPlanted);
}