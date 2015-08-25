//---------------------------------
// ScoreBoard Pseudoclass.
//---------------------------------

// Constructor.
function ScoreBoard() {
    this.reset();
};

// Pseudoclass properties.
ScoreBoard.LivesPerGame = 5;
ScoreBoard.LivesPositionX = 5;
ScoreBoard.LivesPositionY = -26;
ScoreBoard.ScorePositionX = 500;
ScoreBoard.ScorePositionY = 40;
ScoreBoard.LivesSprite = 'images/char-boy.png';

// Pseudoclass methods.
ScoreBoard.prototype.reset = function() {
    this.remainingLives = ScoreBoard.LivesPerGame;
    this.score = 0;
    this.points = 0;
}

ScoreBoard.prototype.addLife = function() {
    this.remainingLives++;
}

ScoreBoard.prototype.removeLife = function() {
    this.remainingLives--;
}

ScoreBoard.prototype.addPoints = function(points) {
    this.points += points;
}

ScoreBoard.prototype.update = function() {
    if (gameBoard.paused) {
        return;
    }

    this.score += this.points;
}

ScoreBoard.prototype.render = function(score) {
    // Overwrite existing scoreboard.
    ctx.fillStyle = "#ffd800";
    ctx.fillRect(0, 0, GameBoard.TileWidth * gameBoard.columns, 48);

    // Render remaining lives icons.
    var image = Resources.get(ScoreBoard.LivesSprite);
    var width = image.width * 0.5;
    var height = image.height * 0.5;
    for (i = 0; i < this.remainingLives; ++i) {
        ctx.drawImage(image, ScoreBoard.LivesPositionX + i * width, ScoreBoard.LivesPositionY, width, height);
    }

    // Render the score.
    ctx.font = "28pt Impact";
    ctx.textAlign = "right";
    ctx.fillStyle = "red";
    if (score !== "") {
        ctx.fillText("Score " + this.score, ScoreBoard.ScorePositionX, ScoreBoard.ScorePositionY);
    }

    this.points = 0;
}

//---------------------------------
// Game Board Pseudoclass.
//---------------------------------

// Constructor.
function GameBoard(rows, columns) {
    this.rows = rows;
    this.columns = columns;

    this.counter = 0;
    this.seconds = 0;

    this.paused = false;

    this.sounds = {
        collision: "sounds/hit.wav",
        charmdrop: "sounds/thud.wav",
        charmpickup: "sounds/pop.wav"
    }
};

// Pseudoclass properties.
GameBoard.TileWidth = 101;
GameBoard.TileHeight = 83;
GameBoard.TopRow = 0; // always.
GameBoard.FPS = 60; // frames per second.
GameBoard.PointsPerSecond = 100; // when the player is inplay.

// Pseudoclass methods.
GameBoard.prototype.update = function() {
    if (this.paused) {
        return;
    }

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
    // A random stone tile row. Note: enemies don't use
    // the last two rows (grass tiles).
    return GameBoard.Random(0, this.getBottomRow() - 2);
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

GameBoard.prototype.handleInput = function(key) {
    // Key inputs related to the player.
    switch (key) {
        case "pause":
            this.paused = !this.paused;
            break;
        default:
            player.handleInput(key);
    }
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
RenderableItem.prototype.render = function(width, height) {
    if (width == null && height == null) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y, 101, 171);
    } else {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y, width, height);
    }
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

Enemy.prototype.getCharmSprite = function() {
    switch (this.color) {
        case "red":
        default:
            return 'images/charm-red.png'; // currently, just red.
    }
}

Enemy.prototype.centeredInTile = function() {
    if (this.x <= 0) {
        return false; // off-screen to the left.
    }

    if (this.x >= gameBoard.getWidth()) {
        return false; // off-screen to the right.
    }

    var offset = 10;
    var columnCenter = GameBoard.TileWidth / 2 - offset;
    var toleranceFactor = GameBoard.TileWidth * 0.01; // 1%
    var columnPosition = Math.floor(this.x % GameBoard.TileWidth);

    if (columnPosition <= (columnCenter - toleranceFactor) ||
        columnPosition >= (columnCenter + toleranceFactor)) {
        return false; // off center.
    }

    return true; // enemy is centered in the column.
}

// Update the enemy's position, required method for game.
// Parameter: dt, a time delta between ticks. We multiply movement by the
// dt parameter which ensures the game runs at the same speed for all computers.
Enemy.prototype.update = function(dt) {
    if (gameBoard.paused) {
        return;
    }

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
    this.lastSecond = gameBoard.getSeconds();
    this.row = gameBoard.getBottomRow();
    this.x = this.startingXPosition;
    this.y = this.startingYPosition;
}

// Update the player's position; basically detect collisions
// and reset the player position, if necessary.
Player.prototype.update = function() {
    if (gameBoard.paused) {
        return;
    }

    // Order is important here; don't pick up charm(s)
    // if the player has collided with an enemy.
    this.detectEnemyCollisions();
    this.detectCharmPickups();

    var currentSeconds = gameBoard.getSeconds();
    if (this.IsActive() &&
        currentSeconds > this.lastSecond) {
        scoreBoard.addPoints(GameBoard.PointsPerSecond);
        this.lastSecond = currentSeconds;
    }
}

// Determine if the player is touching any enemy.
Player.prototype.detectEnemyCollisions = function() {
    for (var i = 0; i < allEnemies.length; ++i) {
        if (this.overlapsWith(allEnemies[i])) {
            scoreBoard.removeLife();
            gameBoard.playSound(gameBoard.sounds.collision);
            this.reset();
            break;
        }
    }
}

// Determine if the player is touching any charm.
Player.prototype.detectCharmPickups = function() {
    for (var i = 0; i < charmsManager.charms.length; ++i) {
        var charm = charmsManager.charms[i];
        if (charm.visible && this.overlapsWith(charm)) {
            charm.pickup();
        }
    }
}

Player.prototype.reset = function() {
    this.init();
}

Player.prototype.handleInput = function(key) {
    // Key inputs related to the player.
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

    console.log("Player is " + (this.IsActive() ? "active" : "resting") +
        ", Row " + this.row + " (" + this.x + ", " + this.y + ")");
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
    if (this.row > GameBoard.TopRow) {
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

Player.prototype.IsActive = function() {
    return (this.row <= (gameBoard.getBottomRow() - 2));
}

//---------------------------------
// Charms Pseudoclass.
//---------------------------------

// Constructor.
function Charm(id, points) {
    InteractiveItem.call(this, id, Charm.Width * 0.25, Charm.VisibleWidth, 0, 0, null);
    this.points = points;
    this.visible = false;
}

Charm.prototype = Object.create(InteractiveItem.prototype);
Charm.prototype.constructor = Charm;

// Pseudoclass properties.
Charm.Width = 101;
Charm.Height = 171;
Charm.VisibleWidth = 20;
Charm.OffsetY = 93;

// Pseudoclass methods.
Charm.prototype.drop = function() {
    // Charms are dropped beneath an enemy; find one in an acceptable position.
    for (var i = 0; i < allEnemies.length; ++i) {
        var enemy = allEnemies[i];

        if (enemy.centeredInTile()) {
            // (Re)Init the charm using the enemy's properties.
            this.x = enemy.x;
            this.y = enemy.y + Charm.OffsetY;
            this.row = gameBoard.getRowFromY(enemy.y, Enemy.OffsetY);
            this.sprite = enemy.getCharmSprite();
            this.visible = true;

            gameBoard.playSound(gameBoard.sounds.charmdrop);
            charmsManager.resetCharmTimer();

            return true;
        }
    }

    return false; // no enemy is in a position to drop.
}

Charm.prototype.pickup = function() {
    gameBoard.playSound(gameBoard.sounds.charmpickup);
    scoreBoard.addPoints(this.points);
    charmsManager.resetCharmTimer(); // wait before dropping the next charm.
    this.visible = false;
}

//---------------------------------
// CharmsManager Pseudoclass.
//---------------------------------

// Constructor.
function CharmsManager() {
    this.charms = [new Charm(0, 10), new Charm(1, 20), new Charm(2, 30)];
    this.resetCharmTimer();
}

// Pseudoclass properties.
CharmsManager.MinDelay = 2; // Variable delay in seconds to wait
CharmsManager.MaxDelay = 4; // before dropping a(nother) charm.

// Pseudoclass methods.
CharmsManager.prototype.resetCharmTimer = function() {
    this.seconds = 0;
    this.startingSeconds = gameBoard.getSeconds();

    // A variable delay determines when the next charm is actually dropped.
    this.delay = GameBoard.Random(CharmsManager.MinDelay, CharmsManager.MaxDelay);
}

CharmsManager.prototype.render = function() {
    this.charms.forEach(function(charm) {
        if (charm.visible) {
            var width = Charm.Width * 0.25;
            var height = Charm.Height * 0.25;

            charm.render(width, height);
        }
    });
}

CharmsManager.prototype.update = function() {
    if (gameBoard.paused) {
        return;
    }

    this.seconds = gameBoard.getSeconds() - this.startingSeconds;
    if (this.seconds >= this.delay) {
        for (var i = 0; i < this.charms.length; ++i) {
            var charm = this.charms[i];
            if (!charm.visible && charm.drop()) {
                break;
            }
        }
    }
}

//---------------------------------
// Global game objects.
//---------------------------------

// Instantiate a scoreboard object.
var scoreBoard = new ScoreBoard();

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
        32: 'pause',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    gameBoard.handleInput(allowedKeys[e.keyCode]);
});