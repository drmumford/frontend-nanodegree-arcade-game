//---------------------------------
// Game Board Pseudoclass.
//---------------------------------

// Constructor.
function GameBoard(rows, columns) {
    this.Rows = rows;
    this.Columns = columns;
}

// Pseudoclass properties.
GameBoard.TileWidth = 100;
GameBoard.TileHeight = 82;

// Pseudoclass methods.
GameBoard.prototype.getWidth = function() {
    return this.Columns * GameBoard.TileWidth;
}

GameBoard.prototype.Height = function() {
    return this.Rows * GameBoard.TileHeight;
}

GameBoard.prototype.getRandomEnemyRow = function() {
    return GameBoard.Random(1, this.getMaxEnemyRow());
}

GameBoard.prototype.getMinEnemyRow = function() {
    return 1;
}

GameBoard.prototype.getMaxEnemyRow = function() {
    return this.Rows - 2; // don't count first (water) or last (grass) rows.
}

// Generate a random number x, where lowLimit <= x <= highLimit.
GameBoard.Random = function(lowLimit, highLimit) {
    return lowLimit + Math.floor(Math.random() * (highLimit - lowLimit + 1));
}

//---------------------------------
// Enemy Pseudoclass.
//---------------------------------

// Constructor.
function Enemy(gameBoard, id) {
    this.gameBoard = gameBoard;
    this.id = id;

    // Set initial properties.
    this.setProperties();
}

// Pseudoclass properties.
Enemy.MinDelay = 0;   // Delay is the time in game ticks that an enemy waits
Enemy.MaxDelay = 100; // before starting a(nother) crossing of the game board.

Enemy.MinSpeed = 75;
Enemy.MaxSpeed = 300;

// Pseudoclass methods.
Enemy.prototype.setProperties = function() {

    var verticalOffset = 18; // to center enemy in row.
    this.row = gameBoard.getRandomEnemyRow();

    this.x = -GameBoard.TileWidth; // off canvas.
    this.y = (this.row * GameBoard.TileHeight) - verticalOffset;

    this.delay = GameBoard.Random(Enemy.MinDelay, Enemy.MaxDelay);

    this.speed = GameBoard.Random(Enemy.MinSpeed, Enemy.MaxSpeed);
    this.color = "red";
    this.sprite = 'images/enemy-bug.png';
    //this.width = Resources.get(this.sprite).width;
    //this.height = Resources.get(this.sprite).height;

    console.log("Bug " + this.id + ": " +
        "Row " + this.row + ", " +
        "Color = " + this.color + ", " +
        "Delay = " + this.delay + ", " +
        "Speed = " + this.speed);
}

// Update the enemy's position, required method for game.
// Parameter: dt, a time delta between ticks. We multiply movement by the
// dt parameter which ensures the game runs at the same speed for all computers.
Enemy.prototype.update = function(dt) {
    if (this.delay > 0) {
        this.delay--;
    } else {
        this.x += (this.speed * dt);
        if (this.x > gameBoard.getWidth()) {
            this.setProperties(); // for next run.
        }
    }
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

//---------------------------------
// Player Pseudoclass.
//---------------------------------

// Constructor.
function Player(gameBoard) {

    this.gameBoard = gameBoard;

    // Initial location.
    this.x = gameBoard.getWidth() / 2 - 50; //2 * 100;
    this.y = 4 * 82;

    // The image/sprite for our player.
    this.sprite = 'images/char-boy.png';
}

// Update the player's position; basically detect collisions
// and reset the player position, if necessary.
Player.prototype.update = function() {
    // Determine if our player shares a space
    // with any enemies.
}

Player.prototype.handleInput = function(key) {
    // Determine the new position based on key input.
    var newX;
    var newY;

    switch (key) {
        case "left":
            newX = this.x - 100;
            break;
        case "right":
            newX = this.x + 100;
            break;
        case "up":
            newY = this.y - 82;
            break;
        case "down":
            newY = this.y + 82;
            break;
    }

    // Update actual positions if new positions are in-bounds.
    if (newX >= 0 && newX <= (4 * 100)) {
        this.x = newX;
    }
    if (newY >= 0 && newY <= (4 * 82)) {
        this.y = newY;
    }
    console.log("x, y = " + this.x + ", " + this.y);
}

// Draw the player on the screen, required method for game
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Instantiate our Game Board object.
var gameBoard = new GameBoard(5, 5);

// Instantiate enemy objects.
var allEnemies = [];
allEnemies.push(new Enemy(gameBoard, 1));
allEnemies.push(new Enemy(gameBoard, 2));
allEnemies.push(new Enemy(gameBoard, 3));
allEnemies.push(new Enemy(gameBoard, 4));
allEnemies.push(new Enemy(gameBoard, 5));

// Instantiate our single player.
var player = new Player(gameBoard);

// Handle 'keyup' events for allowed keys.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});