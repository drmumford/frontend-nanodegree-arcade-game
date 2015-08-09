//---------------------------------
// Game Board Pseudoclass.
//---------------------------------

// Constructor.
function GameBoard(rows, columns) {
    this.Rows = rows;
    this.Columns = columns;

    this.sounds = {
        collision: new Audio("sounds/raygun.mp3")
    }
}

// Pseudoclass properties.
GameBoard.TileWidth = 101;
GameBoard.TileHeight = 83;
GameBoard.WaterRow = 0; // always.

// Pseudoclass methods.
GameBoard.prototype.getWidth = function() {
    return (this.Columns - 1) * GameBoard.TileWidth;
}

GameBoard.prototype.getHeight = function() {
    return (this.Rows - 1) * GameBoard.TileHeight;
}

GameBoard.prototype.getRandomEnemyRow = function() {
    // A random rock tile row. Enemies don't use the first
    // row (water) or last two rows (grass); hence the minus three.
    return GameBoard.Random(1, this.Rows - 3);
}

GameBoard.prototype.getBottomRow = function() {
    return this.Rows - 1;
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

Enemy.Width = 101; // total, including non-visible portion.
Enemy.OffsetX = 50.5; // to detect collisions; 1/2 the visible portion of enemy.
Enemy.OffsetY = -18; // to vertically center an enemy in their row.

Enemy.prototype.leftX = function() {
    return this.x + (Enemy.Width / 2) - Enemy.OffsetX;
}

Enemy.prototype.rightX = function() {
    return this.x + (Enemy.Width / 2) + Enemy.OffsetX;
}

// Pseudoclass methods.
Enemy.prototype.setProperties = function() {
    this.row = gameBoard.getRandomEnemyRow();

    this.x = -GameBoard.TileWidth; // off canvas.
    this.y = (this.row * GameBoard.TileHeight) + Enemy.OffsetY;

    this.delay = GameBoard.Random(Enemy.MinDelay, Enemy.MaxDelay);

    this.speed = GameBoard.Random(Enemy.MinSpeed, Enemy.MaxSpeed);
    this.color = "red";
    this.sprite = 'images/enemy-bug.png';

    console.log("Bug " + this.id + ": " +
        "Row " + this.row + ", " +
        "Color = " + this.color + ", " +
        "Delay = " + this.delay + ", " +
        "Speed = " + this.speed + ", " +
        "X = " + this.x
        );
}

// Update the enemy's position, required method for game.
// Parameter: dt, a time delta between ticks. We multiply movement by the
// dt parameter which ensures the game runs at the same speed for all computers.
Enemy.prototype.update = function(dt) {
    if (this.delay > 0) {
        this.delay--;
    } else {
        this.x += (this.speed * dt);
        if (this.x > ctx.canvas.width) {
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
    this.init();

    // The image/sprite for our player.
    this.sprite = 'images/char-boy.png';
}

// Pseudoclass properties.
Player.Width = 101; // total, including non-visible portion.
Player.OffsetX = 30; // to detect collisions; 1/2 the visible portion of player.
Player.OffsetY = -8; // to vertically center the player in their row.

Player.prototype.init = function() {
    this.row = gameBoard.getBottomRow();
    this.x = gameBoard.getWidth() / 2;
    this.y = gameBoard.getHeight() + Player.OffsetY;
}

Player.prototype.leftX = function() {
    return this.x + (Player.Width / 2) - Player.OffsetX;
}

Player.prototype.rightX = function() {
    return this.x + (Player.Width / 2) + Player.OffsetX;
}

// Update the player's position; basically detect collisions
// and reset the player position, if necessary.
Player.prototype.update = function() {
    this.detectCollisions();
}

Player.prototype.detectCollisions = function() {
    // Iterate through each enemy and detect if any overlap
    // with the current player position.
    for (var i = 0; i < allEnemies.length; ++i) {
        var enemy = allEnemies[i];
        if ((enemy.row == this.row) &&
            (this.leftX() < enemy.rightX() && this.rightX() > enemy.leftX())) {
            gameBoard.sounds.collision.play();
            this.reset();
            break;
        }
    }
}

Player.prototype.reset = function() {
    this.init();
}

Player.prototype.handleInput = function(key) {
    switch (key) {
        case "left":
            this.moveLeft();
            break;
        case "right":
            this.moveRight();
            break;
        case "up":
            this.moveUp();
            break;
        case "down":
            this.moveDown();
            break;
    }
    console.log("Player in Row " + this.row + " (" + this.x + ", " + this.y + ")");
}

Player.prototype.moveLeft = function() {
    // If we're not in the far left column, then we can move left.
    if (this.x >= GameBoard.TileWidth) {
        this.x -= GameBoard.TileWidth;
    }
}

Player.prototype.moveRight = function() {
    // If we're not in the far right column, then we can move right.
    if (this.x + GameBoard.TileWidth < ctx.canvas.width) {
        this.x += GameBoard.TileWidth;
    }
}

Player.prototype.moveUp = function() {
    // If we're not in the top row, then we can move up.
    if (this.row > GameBoard.WaterRow) {
        this.row--;
        this.y -= GameBoard.TileHeight;
    }
}

Player.prototype.moveDown = function() {
    // If we're not in the bottom row, then we can move down.
    if (this.row < gameBoard.getBottomRow()) {
        this.row++;
        this.y += GameBoard.TileHeight;
    }
}

// Draw the player on the screen, required method for game
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Instantiate our Game Board object.
var gameBoard = new GameBoard(6, 5);

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