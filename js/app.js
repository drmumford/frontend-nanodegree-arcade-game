//---------------------------------
// ScoreBoard Pseudoclass.
//---------------------------------

// Constructor.
function ScoreBoard() {
    this.init();
};

// Pseudoclass properties.
ScoreBoard.Height = 48;
ScoreBoard.LivesPerGame = 5;
ScoreBoard.TitleTextY = 15;
ScoreBoard.LivesPositionX = 5;
ScoreBoard.LivesPositionY = -6;
ScoreBoard.ScorePositionX = 500;
ScoreBoard.ScorePositionY = 60;
ScoreBoard.LivesSprite = 'images/char-boy.png';

// Pseudoclass methods.
ScoreBoard.prototype.init = function() {
    this.livesSprite = ScoreBoard.LivesSprite;
    this.reset();
}

ScoreBoard.prototype.reset = function() {
    this.remainingLives = ScoreBoard.LivesPerGame;
    this.gutterMessage = null;
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

ScoreBoard.prototype.setLivesSprite = function(sprite) {
    this.livesSprite = sprite;
}

ScoreBoard.prototype.setGutterMessage = function(message) {
    this.gutterMessage = message;
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
    ctx.fillRect(0, 0, GameBoard.TileWidth * gameBoard.columns, topBuffer + ScoreBoard.Height);

    // Render remaining lives icons.
    var image = Resources.get(this.livesSprite);
    var width = image.width * 0.5;
    var height = image.height * 0.5;
    for (i = 0; i < this.remainingLives; ++i) {
        ctx.drawImage(image, ScoreBoard.LivesPositionX + i * width, ScoreBoard.LivesPositionY, width, height);
    }

    // Render remaining lives title.
    ctx.fillStyle = "black";
    ctx.font = "18px Luckiest Guy";
    ctx.textAlign = "left";
    ctx.fillText("Remaining Lives", ScoreBoard.LivesPositionX, ScoreBoard.TitleTextY);

    // Render remaining time and score title.
    ctx.textAlign = "right";
    ctx.fillText("Remaining Time / Score", ScoreBoard.ScorePositionX, ScoreBoard.TitleTextY);

    // Render the remaining time and score.
    ctx.font = "40px Luckiest Guy";
    ctx.fillText(gameBoard.remainingTime + " / " + this.score, ScoreBoard.ScorePositionX, ScoreBoard.ScorePositionY);

    this.renderGutterMessage();
    this.points = 0;
}

ScoreBoard.prototype.renderGutterMessage = function() {
    if (this.gutterMessage != null) {
        ctx.fillStyle = "black";
        ctx.font = "25px Luckiest Guy";
        ctx.textAlign = "center";
        ctx.fillText(this.gutterMessage,
            GameBoard.TileWidth / 2 + gameBoard.getWidth() / 2,
            GameBoard.TileHeight / 2 + gameBoard.getHeight());
    }
}

//---------------------------------
// Game Board Pseudoclass.
//---------------------------------

// Constructor.
function GameBoard(rows, columns) {
    this.rows = rows;
    this.columns = columns;
    this.stopwatch = new Stopwatch();

    this.sounds = {
        collision: "sounds/hit.wav",
        charmdrop: "sounds/thud.wav",
        charmpickup: "sounds/pop.wav"
    }

    this.reset();
};

// Pseudoclass properties.
GameBoard.TileWidth = 101;
GameBoard.TileHeight = 83;
GameBoard.TopRow = 0; // always.
GameBoard.PointsPerSecond = 100; // only when the player is active.
GameBoard.GameDuration = 120; // in seconds.

// Pseudoclass methods.
GameBoard.prototype.reset = function() {
    this.stopwatch.reset();
    this.remainingTime = GameBoard.GameDuration;
    this.paused = false;
    this.gameOver = false;
}

GameBoard.prototype.update = function() {
    if (this.paused) {
        this.stopwatch.stop(); // pause.
        return;
    }

    this.stopwatch.start();
    this.remainingTime = GameBoard.GameDuration - this.stopwatch.seconds();

    // Determine if the game is over.
    if (this.isGameOver()) {
        this.paused = true;
        this.gameOver = true;

        gameRulesDialog.hide();
        gameOverDialog.show();
    }
}

GameBoard.prototype.isGameOver = function() {
    if (scoreBoard.remainingLives === 0) {
        gameOverDialog.setReason(GameOverDialog.OuttaLivesReason);
        return true;
    }

    if (this.remainingTime === 0) {
        gameOverDialog.setReason(GameOverDialog.OuttaTimeReason);
        return true;
    }

    return false; // play on!
}

GameBoard.prototype.getSeconds = function() {
    return this.stopwatch.seconds();
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

GameBoard.prototype.startNewGame = function() {
    gameOverDialog.hide();
    scoreBoard.reset();
    gameBoard.reset();
    player.reset();
    charmsManager.reset();
    for (var i = 0; i < allEnemies.length; ++i) {
        allEnemies[i].init();
    }
}

// Generate a random number x, where lowLimit <= x <= highLimit.
GameBoard.Random = function(lowLimit, highLimit) {
    return lowLimit + Math.floor(Math.random() * (highLimit - lowLimit + 1));
}

GameBoard.prototype.handleInput = function(key, ctrlKey) {
    // Key inputs related to the game board.
    switch (key) {
        case "esc":
            if (this.gameOver || this.paused) {
                gameRulesDialog.hide();
                gameOverDialog.hide();
                scoreBoard.setGutterMessage("Hit the spacebar to play!");
            }
            break;
        case "space": // start or pause the game.
            if (this.gameOver) {
                this.startNewGame();
            }
            else {
                gameRulesDialog.hide();
                scoreBoard.setGutterMessage(null);
                this.paused = !this.paused;
            }
            break;
        default:
            // All other inputs are handled by the player.
            player.handleInput(key, ctrlKey);
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
        ctx.drawImage(Resources.get(this.sprite), this.x, topBuffer + this.y);
    } else {
        ctx.drawImage(Resources.get(this.sprite), this.x, topBuffer + this.y, width, height);
    }
}

RenderableItem.prototype.setSprite = function(sprite) {
    this.sprite = sprite;
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
    InteractiveItem.call(this, id, width, visibleWidth, startingXPosition, startingYPosition, 'images/enemy-red.png');

    // Build sprite array.
    this.sprites = [
        'images/enemy-green.png',
        'images/enemy-blue.png',
        'images/enemy-yellow.png',
        'images/enemy-purple.png',
        'images/enemy-red.png'
    ];

    // Build associated charms array.
    this.charmSprites = [
        'images/charm-green.png',
        'images/charm-blue.png',
        'images/charm-yellow.png',
        'images/charm-purple.png',
        'images/charm-red.png'
    ];

    this.init();
}

Enemy.prototype = Object.create(InteractiveItem.prototype);
Enemy.prototype.constructor = Enemy;

// Pseudoclass properties.
Enemy.HitFromBehindBias = 5; // slightly bumping an enemy from behind, no worries.
Enemy.ZombieLifetime = 100; // time in game ticks for a zombie to fade away.

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
    this.spriteIndex = this.getIndex();

    // Index determines:
    //  - the sprite by indexing into the sprites array, and
    //  - which player can make it a zombie; i.e. the player
    //    with the same index value.
    this.sprite = this.sprites[this.spriteIndex];

    this.zombieCounter = Enemy.ZombieLifetime;
    this.zombie = false;
}

Enemy.prototype.render = function() {
    if (this.zombie) {
        ctx.globalAlpha = this.zombieCounter / Enemy.ZombieLifetime;
        InteractiveItem.prototype.render.call(this);
        ctx.globalAlpha = 1;
        if (this.zombieCounter > 0) {
            this.zombieCounter--;
        }
    } else {
        InteractiveItem.prototype.render.call(this);
    }
}

Enemy.prototype.getCharmSprite = function() {
    return this.charmSprites[this.spriteIndex];
}

Enemy.prototype.getIndex = function() {
    //this.spriteIndex = (this.speed - Enemy.MinSpeed) /
    //    ((Enemy.MaxSpeed - Enemy.MinSpeed) / this.sprites.length);
    if (this.speed < 120) {
        return 0;
    }
    if (this.speed < 165) {
        return 1;
    }
    if (this.speed < 210) {
        return 2;
    }
    if (this.speed < 255) {
        return 3;
    }

    return 4;
}

Enemy.prototype.leftX = function() {
    return this.x + (this.width / 2) - this.halfVisibleWidth + Enemy.HitFromBehindBias;
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
    InteractiveItem.call(this, id, width, visibleWidth, startingXPosition, startingYPosition, Player.DefaultSprite);

    this.init();
}

Player.prototype = Object.create(InteractiveItem.prototype);
Player.prototype.constructor = Player;

// Pseudoclass properties.
Player.OffsetY = -8; // to vertically center the player in their row.
Player.DefaultSprite = 'images/char-boy.png';

// Pseudoclass methods.
Player.prototype.init = function() {
    // Build sprite array.
    this.sprites = [
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png'
    ];

    this.spriteIndex = 0;
    this.reset();
}

Player.prototype.reset = function() {
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
            if (this.spriteIndex != allEnemies[i].spriteIndex) {
                scoreBoard.removeLife();
                gameBoard.playSound(gameBoard.sounds.collision);
                this.reset();
                break;
            } else {
                allEnemies[i].zombie = true; // watch out!
            }
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

Player.prototype.handleInput = function(key, ctrlKey) {
    // Key inputs related to the player.
    switch (key) {
        case "left":
            this.moveLeft();
            break;
        case "right":
            this.moveRight();
            break;
        case "up":
            if (ctrlKey) {
                this.setNextSprite();
            } else {
                this.moveUp();
            }
            break;
        case "down":
            if (ctrlKey) {
                this.setPreviousSprite();
            } else {
                this.moveDown();
            }
            break;
    }
}

Player.prototype.moveLeft = function() {
    // If we're not in the far left column, then we can move left.
    if (!gameBoard.paused && (this.x >= GameBoard.TileWidth)) {
        this.x -= GameBoard.TileWidth;
    }
}

Player.prototype.moveRight = function() {
    // If we're not in the far right column, then we can move right.
    if (!gameBoard.paused && ((this.x + GameBoard.TileWidth) < ctx.canvas.width)) {
        this.x += GameBoard.TileWidth;
    }
}

Player.prototype.moveUp = function() {
    // If we're not in the top row, then we can move up.
    if (!gameBoard.paused && (this.row > GameBoard.TopRow)) {
        this.row--;
        this.y -= GameBoard.TileHeight;
    }
}

Player.prototype.moveDown = function() {
    // If we're not in the bottom row, then we can move down.
    if (!gameBoard.paused && (this.row < gameBoard.getBottomRow())) {
        this.row++;
        this.y += GameBoard.TileHeight;
    }
}

Player.prototype.getDefaultPlayerSprite = function() {
    return this.sprites[0];
}

Player.prototype.setNextSprite = function() {
    this.spriteIndex++;
    if (this.spriteIndex > (this.sprites.length - 1)) {
        this.spriteIndex = 0;
    }
    this.setSprite(this.sprites[this.spriteIndex]);
    scoreBoard.setLivesSprite(this.sprites[this.spriteIndex]);
}

Player.prototype.setPreviousSprite = function() {
    this.spriteIndex--;
    if (this.spriteIndex < 0) {
        this.spriteIndex = this.sprites.length - 1;
    }
    this.setSprite(this.sprites[this.spriteIndex]);
    scoreBoard.setLivesSprite(this.sprites[this.spriteIndex]);
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
CharmsManager.prototype.reset = function() {
    this.resetCharmTimer();
    for (var i = 0; i < this.charms.length; ++i) {
        this.charms[i].visible = false;
    }
}

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
                this.resetCharmTimer();
                break;
            }
        }
    }
}

//---------------------------------
// Stopwatch Pseudoclass.
//---------------------------------

// Constructor.
function Stopwatch() {
    this.reset();
};

// Pseudoclass methods.
Stopwatch.prototype.start = function() {
    this.startTime = this.startTime ? this.startTime : Date.now();
}

Stopwatch.prototype.stop = function() {
    // Update elapsed time before stopping the stopwatch, if necessary.
    this.elapsedTime = this.startTime ? this.elapsedTime + (Date.now() - this.startTime) : this.elapsedTime;
    this.startTime = 0; // reinit for next start.
};

Stopwatch.prototype.reset = function() {
    this.startTime = 0; // allows stopping and restarting.
    this.elapsedTime = 0; // the stopwatch time; in milliseconds.
};

Stopwatch.prototype.seconds = function() {
    var ms = this.elapsedTime + (this.startTime ? Date.now() - this.startTime : 0);
    return Math.floor(ms / 1000);
};

//---------------------------------
// Dialog Pseudoclass.
//---------------------------------

// Constructor.
function Dialog() {
    this.init();
}

// Pseudoclass properties.
Dialog.LeftMargin = 0;
Dialog.TitleFont = "64px Luckiest Guy";
Dialog.NormalFont = "25px Luckiest Guy";
Dialog.SmallFont = "20px Luckiest Guy";
Dialog.Bullet = String.fromCodePoint(0x2022);
Dialog.Transparency = 0.83;

// Pseudoclass methods.
Dialog.prototype.init = function() {
    this.width = gameBoard.getWidth();
    this.height = gameBoard.getHeight() / 2;

    this.x = GameBoard.TileWidth / 2;
    this.y = this.height / 2;

    this.leftX = this.x + Dialog.LeftMargin;
    this.midX = this.x + (this.width / 2);

    this.visible = false;
}

Dialog.prototype.show = function() {
    this.visible = true;
}

Dialog.prototype.hide = function() {
    this.visible = false;
}

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} radius The corner radius. Defaults to 5;
 * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
 * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
 */
Dialog.prototype.drawDialog = function(x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == "undefined") {
        stroke = true;
    }
    if (typeof radius === "undefined") {
        radius = 5;
    }
    ctx.fillStyle = "black";
    ctx.globalAlpha = Dialog.Transparency;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (stroke) {
        ctx.stroke();
    }
    if (fill) {
        ctx.fill();
    }

    ctx.globalAlpha = 1.0;
}

//---------------------------------
// GameRulesDialog Pseudoclass.
//---------------------------------

// Constructor.
function GameRulesDialog() {
    this.init();

    var extraWidth = 88; // make this a constant.
    this.width = this.width + extraWidth; // a bit wider than default.
    this.height = this.height + 315; // a bit longer too.
    this.x = this.x - (extraWidth / 2); // to keep centered.
    this.y = this.y - 28;
    this.visible = true; // shown on startup.
}

GameRulesDialog.prototype = Object.create(Dialog.prototype);
GameRulesDialog.prototype.constructor = GameRulesDialog;

// Pseudoclass methods.
GameRulesDialog.prototype.render = function() {
    if (this.visible) {
        this.drawDialog(this.x, this.y, this.width, this.height, 15, true, true);
        this.contents();
    }
}

GameRulesDialog.prototype.contents = function() {
    var y = this.y + 70;

    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.font = Dialog.TitleFont;
    ctx.fillText("Game Rules", this.midX, y);

    ctx.textAlign = "left";
    ctx.font = Dialog.NormalFont;

    y += 50;
    ctx.fillText(Dialog.Bullet + " Move the Player using the", this.leftX, y);
    y += 30;
    ctx.fillText("   arrow keys: up, down, left, right", this.leftX, y);
    y += 33;
    ctx.fillText(Dialog.Bullet + " Avoid the ladybugs!", this.leftX, y);
    y += 33;
    ctx.fillText(Dialog.Bullet + " Get points for each second", this.leftX, y);
    y += 30;
    ctx.fillText("   the player is in-play (the grass", this.leftX, y);
    y += 30;
    ctx.fillText("   area is NOT considered in-play)", this.leftX, y);
    y += 33;
    ctx.fillText(Dialog.Bullet + " Get points for cleaning up", this.leftX, y);
    y += 30;
    ctx.fillText("   after the ladybugs", this.leftX, y);
    y += 33;
    ctx.fillText(Dialog.Bullet + " Game is over when all lives", this.leftX, y);
    y += 30;
    ctx.fillText("   are used or the time is up", this.leftX, y);
    y += 33;
    ctx.fillText(Dialog.Bullet + " Ctrl-up/down changes player", this.leftX, y);

    ctx.textAlign = "center";

    y += 45;
    ctx.fillText("Hit the space bar", this.midX, y);
    y += 30;
    ctx.fillText("to play ...", this.midX, y);
}

//---------------------------------
// GameOverDialog Pseudoclass.
//---------------------------------

// Constructor.
function GameOverDialog() {
    this.reason = null;
    this.init();
}

GameOverDialog.prototype = Object.create(Dialog.prototype);
GameOverDialog.prototype.constructor = GameOverDialog;

// Pseudoclass properties.
GameOverDialog.OuttaTimeReason = "Time";
GameOverDialog.OuttaLivesReason = "Lives";

// Pseudoclass methods.
GameOverDialog.prototype.setReason = function(reason) {
    this.reason = reason;
}

GameOverDialog.prototype.render = function() {
    if (this.visible) {
        this.drawDialog(this.x, this.y, this.width, this.height, 15, true, true);
        this.contents();
    }
}

GameOverDialog.prototype.contents = function() {
    var y = this.y + 75;

    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.font = Dialog.TitleFont;
    ctx.fillText("Game Over!", this.midX, y);

    if (this.reason != null) {
        y += 30;
        ctx.font = Dialog.SmallFont;
        ctx.fillText("(Outta " + this.reason + ")", this.midX, y);
    }

    ctx.font = Dialog.NormalFont;

    y += 50;
    ctx.fillText("Hit the space bar", this.midX, y);
    y += 30;
    ctx.fillText("to play again ...", this.midX, y);
}

//---------------------------------
// Global game objects.
//---------------------------------

// Instantiate our scoreboard object.
var scoreBoard = new ScoreBoard();

// Instantiate our Game Board object.
var gameBoard = new GameBoard(6, 5);

// Instantiate our Game Rules dialog.
var gameRulesDialog = new GameRulesDialog();

// Instantiate our Game Over dialog.
var gameOverDialog = new GameOverDialog();

// Instantiate enemy objects.
var allEnemies = [];
allEnemies.push(new Enemy(0));
allEnemies.push(new Enemy(1));
allEnemies.push(new Enemy(2));
allEnemies.push(new Enemy(3));
allEnemies.push(new Enemy(4));
allEnemies.push(new Enemy(5));

// Instantiate player objects.
var player = new Player(0); // just one currently.

// Instantiate charm manager.
var charmsManager = new CharmsManager();

//---------------------------------
// Event handlers.
//---------------------------------

// Handle 'keydown' events for allowed keys.
document.addEventListener('keydown', function(e) {
    // Ensure event is not null.
    e = e || window.event;

    var allowedKeys = {
        27: 'esc',
        32: 'space',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    gameBoard.handleInput(allowedKeys[e.keyCode], e.ctrlKey);
});