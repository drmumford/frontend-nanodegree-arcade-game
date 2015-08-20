//---------------------------------
// Game Board Pseudoclass.
//---------------------------------

// Constructor.
function GameBoard(rows, columns) {
    this.rows = rows;
    this.columns = columns;

    this.counter = 0;
    this.seconds = 0;

    this.sounds = {
        collision: "sounds/raygun.mp3",
        charmdrop: "sounds/raygun.wav",
        charmpickup: "sounds/raygun.mp3"
    }
};

// Pseudoclass properties.
GameBoard.TileWidth = 101;
GameBoard.TileHeight = 83;
GameBoard.WaterRow = 0; // always.
GameBoard.FPS = 60; // frames per second.

// Pseudoclass methods.
GameBoard.prototype.update = function() {
    this.counter++;
    if (this.counter == GameBoard.FPS) {
        this.seconds++;
        this.counter = 0;
        console.log("Game seconds: " + this.getSeconds() + " ...");
    }
}

GameBoard.prototype.getSeconds = function() {
    return this.seconds;
}

GameBoard.prototype.getWidth = function() {
    return (this.columns - 1) * GameBoard.TileWidth;
}

GameBoard.prototype.getHeight = function() {
    return (this.rows - 1) * GameBoard.TileHeight;
}

GameBoard.prototype.getRandomEnemyRow = function() {
    // A random rock tile row. Enemies don't use the first
    // row (water) or last two rows (grass); hence the minus three.
    return GameBoard.Random(1, this.rows - 3);
}

GameBoard.prototype.getBottomRow = function() {
    return this.rows - 1;
}

GameBoard.prototype.getRowFromY = function(y, offset) {
    return (y - offset) / GameBoard.TileHeight;
}

GameBoard.prototype.getYFromRow = function(row, offset) {
    return (row * GameBoard.TileHeight) + offset;
}

GameBoard.prototype.playSound = function(soundFile) {
    var sound = new Audio(soundFile);
    sound.play();
}

// Generate a random number x, where lowLimit <= x <= highLimit.
GameBoard.Random = function(lowLimit, highLimit) {
    return lowLimit + Math.floor(Math.random() * (highLimit - lowLimit + 1));
}

//---------------------------------
// RenderableItem Pseudoclass.
//---------------------------------

// Constructor.
function RenderableItem(id, x, y, sprite) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.sprite = sprite;
}

// Pseudoclass methods.
// Default method to render the item on the canvas.
RenderableItem.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

//---------------------------------
// InteractiveItem Pseudoclass.
//---------------------------------

// Constructor.
function InteractiveItem(id, width, visibleWidth, startingXPosition, startingYPosition, sprite) {
    RenderableItem.call(this, id, startingXPosition, startingYPosition, sprite);

    this.row = 0; // proxy for Y coordinate; makes interaction easier to detect.
    this.startingXPosition = startingXPosition;
    this.startingYPosition = startingYPosition;

    this.width = width; // total, including non-visible portion.
    this.halfVisibleWidth = visibleWidth / 2;
}

InteractiveItem.prototype = Object.create(RenderableItem.prototype);
InteractiveItem.prototype.constructor = InteractiveItem;

// Pseudoclass methods.
InteractiveItem.prototype.leftX = function() {
    return this.x + (this.width / 2) - this.halfVisibleWidth;
}

InteractiveItem.prototype.rightX = function() {
    return this.x + (this.width / 2) + this.halfVisibleWidth;
}

InteractiveItem.prototype.overlapsWith = function(other) {
    return (
        (other instanceof InteractiveItem) &&
        (this.row == other.row) &&
        (this.leftX() < other.rightX()) &&
        (this.rightX() > other.leftX())
    );
}

//---------------------------------
// Enemy Pseudoclass.
//---------------------------------

// Constructor.
function Enemy(id) {
    var width = 101;
    var visibleWidth = 101;
    var startingXPosition = -GameBoard.TileWidth; // off-canvas.
    var startingYPosition = 0; // dynamically determined.
    InteractiveItem.call(this, id, width, visibleWidth, startingXPosition, startingYPosition, 'images/enemy-bug.png');

    this.init();
}

Enemy.prototype = Object.create(InteractiveItem.prototype);
Enemy.prototype.constructor = Enemy;

// Pseudoclass properties.
Enemy.MinDelay = 0;   // Delay is the time in game ticks that an enemy waits
Enemy.MaxDelay = 100; // before starting a(nother) crossing of the game board.

Enemy.MinSpeed = 75;
Enemy.MaxSpeed = 300;

Enemy.OffsetY = -18; // to vertically center an enemy in their row.

// Pseudoclass methods.
Enemy.prototype.init = function() {
    this.row = gameBoard.getRandomEnemyRow();
    this.x = this.startingXPosition;
    this.y = gameBoard.getYFromRow(this.row, Enemy.OffsetY);

    this.delay = GameBoard.Random(Enemy.MinDelay, Enemy.MaxDelay);

    this.speed = GameBoard.Random(Enemy.MinSpeed, Enemy.MaxSpeed);
    this.color = "red";

    console.log("Bug " + this.id + ": " +
        "Row " + this.row + ", " +
        "Color = " + this.color + ", " +
        "Delay = " + this.delay + ", " +
        "Speed = " + this.speed + ", " +
        "x = " + this.x + ", " +
        "y = " + this.y
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
            this.init(); // for next run.
        }
    }
}

//---------------------------------
// Player Pseudoclass.
//---------------------------------

// Constructor.
function Player(id) {
    var width = 101;
    var visibleWidth = 60;
    var startingXPosition = gameBoard.getWidth() / 2;
    var startingYPosition = gameBoard.getHeight() + Player.OffsetY;
    InteractiveItem.call(this, id, width, visibleWidth, startingXPosition, startingYPosition, 'images/char-boy.png');

    this.init();
}

Player.prototype = Object.create(InteractiveItem.prototype);
Player.prototype.constructor = Player;

// Pseudoclass properties.
Player.OffsetY = -8; // to vertically center the player in their row.

// Pseudoclass methods.
Player.prototype.init = function() {
    this.row = gameBoard.getBottomRow();
    this.x = this.startingXPosition;
    this.y = this.startingYPosition;
}

// Update the player's position; basically detect collisions
// and reset the player position, if necessary.
Player.prototype.update = function() {
    this.detectEnemyCollisions();
    this.detectCharmPickups();
}

// Determine if the player is touching any enemy.
Player.prototype.detectEnemyCollisions = function() {
    for (var i = 0; i < allEnemies.length; ++i) {
        if (this.overlapsWith(allEnemies[i])) {
            gameBoard.playSound(gameBoard.sounds.collision);
            this.reset();
            break;
        }
    }
}

// Determine if the player is touching any charm.
Player.prototype.detectCharmPickups = function() {
    for (var i = 0; i < charmsManager.charms.length; ++i) {
        if (this.overlapsWith(charmsManager.charms[i])) {
            // Pickup charm, add points, etc. ...
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

//---------------------------------
// Charms Pseudoclass.
//---------------------------------

// Constructor.
function Charm(id, x, y, sprite) {

    var width = 101;
    var visibleWidth = 101;
    var startingXPosition = x; // starting position is only position.
    var startingYPosition = y; // starting position is only position.

    InteractiveItem.call(this, id, width, visibleWidth, startingXPosition, startingYPosition, sprite);

    this.row = gameBoard.getRowFromY(y, Enemy.OffsetY);
    this.visible = false;
}

Charm.prototype = Object.create(InteractiveItem.prototype);
Charm.prototype.constructor = Charm;

//---------------------------------
// CharmsManager Pseudoclass.
//---------------------------------

// Constructor.
function CharmsManager() {
    this.charms = [];
    this.seconds = 0;

    this.init();
}

// Pseudoclass properties.
CharmsManager.MinDelay = 2; // Delay in seconds the charms manager waits before triggering
CharmsManager.MaxDelay = 4; // a(nother) charm when the number of charms < the allowed charms.

CharmsManager.AllowedCharms = 2; // maximum number of charms allowed on the game board.

// Pseudoclass methods.
CharmsManager.prototype.init = function() {
    this.startingSeconds = gameBoard.getSeconds();
    this.delay = GameBoard.Random(CharmsManager.MinDelay, CharmsManager.MaxDelay);
}

CharmsManager.prototype.makeCharm = function() {
    // Create a charm using the coordinates of a random enemy.
    var enemy = allEnemies[GameBoard.Random(0, allEnemies.length - 1)];
    return new Charm(0, enemy.x, enemy.y, this.getCharmSpriteForEnemy(enemy))
}

CharmsManager.prototype.getCharmSpriteForEnemy = function(enemy) {
    switch (enemy.color) {
        case "red":
        default:
            return 'images/charm-red.png'; // currently, just red.
    }
}

CharmsManager.prototype.render = function() {
    this.charms.forEach(function(charm) {
        charm.render();
    });
}

CharmsManager.prototype.update = function() {
    this.seconds = gameBoard.getSeconds() - this.startingSeconds;
    if ((this.charms.length < CharmsManager.AllowedCharms) &&
        (this.seconds >= this.delay)) {
        var charm = this.makeCharm();
        if (charm != null) {
            gameBoard.playSound(gameBoard.sounds.charmdrop);
            this.charms.push(charm);
            this.init();
        }
    }
}

//---------------------------------
// Global game objects.
//---------------------------------

// Instantiate our Game Board object.
var gameBoard = new GameBoard(6, 5);

// Instantiate enemy objects.
var allEnemies = [];
allEnemies.push(new Enemy(0));
allEnemies.push(new Enemy(1));
allEnemies.push(new Enemy(2));
allEnemies.push(new Enemy(3));
allEnemies.push(new Enemy(4));

// Instantiate player objects.
var player = new Player(0); // just one currently.

// Instantiate charm manager.
var charmsManager = new CharmsManager();

//---------------------------------
// Event handlers.
//---------------------------------

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