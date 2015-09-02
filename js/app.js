//---------------------------------
// ScoreBoard Pseudoclass.
//---------------------------------

// Constructor.
function ScoreBoard() {
    this.init();
};

// Pseudoclass properties.
ScoreBoard.Height = 48;
ScoreBoard.TitleTextY = 17;
ScoreBoard.LivesPositionX = 5;
ScoreBoard.LivesPositionY = -6;
ScoreBoard.ScorePositionX = 500;
ScoreBoard.ScorePositionY = 60;
ScoreBoard.TitleFont = '20px Luckiest Guy';
ScoreBoard.ScoreFont = '40px Luckiest Guy';
ScoreBoard.GutterMsgFont = '25px Luckiest Guy';
ScoreBoard.Sprite = 'images/char-boy.png';

// Pseudoclass methods.
ScoreBoard.prototype.init = function() {
    this.sprite = ScoreBoard.Sprite;
    this.reset();
}

ScoreBoard.prototype.reset = function() {
    this.remainingLives = GameBoard.LivesPerGame;
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

ScoreBoard.prototype.setSprite = function(sprite) {
    this.sprite = sprite;
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
    ctx.fillStyle = '#ffd800';
    ctx.fillRect(0, 0, GameBoard.TileWidth * gameBoard.columns, topBuffer + ScoreBoard.Height);

    // Render remaining lives icons.
    var image = Resources.get(this.sprite);
    var width = image.width * 0.5;
    var height = image.height * 0.5;
    for (i = 0; i < this.remainingLives; ++i) {
        ctx.drawImage(image, ScoreBoard.LivesPositionX + i * width, ScoreBoard.LivesPositionY, width, height);
    }

    // Render remaining lives title.
    ctx.fillStyle = 'black';
    ctx.font = ScoreBoard.TitleFont;
    ctx.textAlign = 'left';
    ctx.fillText('Remaining Lives', ScoreBoard.LivesPositionX, ScoreBoard.TitleTextY);

    // Render remaining time and score title.
    ctx.textAlign = 'right';
    ctx.fillText('Remaining Time / Score', ScoreBoard.ScorePositionX, ScoreBoard.TitleTextY);

    // Render the remaining time and score.
    ctx.font = ScoreBoard.ScoreFont;
    ctx.fillText(gameBoard.remainingTime + ' / ' + this.score, ScoreBoard.ScorePositionX, ScoreBoard.ScorePositionY);

    this.renderGutterMessage();
    this.points = 0;
}

ScoreBoard.prototype.renderGutterMessage = function() {
    if (this.gutterMessage != null) {
        ctx.fillStyle = 'black';
        ctx.font = ScoreBoard.GutterMsgFont;
        ctx.textAlign = 'center';
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
    this.firstRun = true;

    // State variables.
    this.demoMode = false;
    this.showHelp = false;
    this.gameMode = false;
    this.paused = false;
    this.resumeGame = false;
    this.gameOver = false;

    this.sounds = {
        collision: 'sounds/hit.wav',
        charmdrop: 'sounds/pop.wav',
        charmpickup: 'sounds/thud.wav'
    }

    this.reset();
};

// Pseudoclass properties.
GameBoard.LivesPerGame = 4;
GameBoard.TileWidth = 101;
GameBoard.TileHeight = 83;
GameBoard.TopRow = 0;
GameBoard.PointsPerSecond = 1000; // only when the player is active.
GameBoard.GameDuration = 120; // in seconds.
GameBoard.HelpScreens = 3; // game instructions, hints, attribution.

// Pseudoclass methods.
GameBoard.prototype.reset = function() {
    this.stopwatch.reset();
    this.remainingTime = GameBoard.GameDuration;
    this.gameOver = false;
    this.paused = false;
    this.helpScreen = GameRulesDialog.Id; // start-up screen.
    this.demoMode = this.firstRun;
    this.showHelp = this.firstRun;
    this.gameMode = !this.firstRun;

    if (this.firstRun) {
        this.firstRun = false; // show game info once.
    }
}

GameBoard.prototype.update = function() {
    // Show the current help screen.
    if (this.showHelp) {
        this.showHelpScreen();
    }
    else {
        this.hideHelpScreens();
    }

    if (this.demoMode) {
        gameOverDialog.visible = false;
    }
    else { // Game Mode.
        if (this.paused) {
            this.stopwatch.stop(); // pause.
        }
        else {
            this.stopwatch.start(); // or resume / normal game play.
            this.remainingTime = GameBoard.GameDuration - this.stopwatch.seconds();

            // Determine if the game is over.
            if (this.isGameOver()) {
                this.paused = true;
                this.gameOver = true;
                gameOverDialog.show();
            }
        }
    }
}

GameBoard.prototype.isGameOver = function() {
    if (scoreBoard.remainingLives === 0) {
        gameOverDialog.setReason(GameOverDialog.OuttaLivesReason);
        return true;
    }

    if (this.remainingTime <= 0) {
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
    this.hideHelpScreens();
    gameOverDialog.hide();

    scoreBoard.reset();
    gameBoard.reset();
    player.reset();
    charmsManager.reset();
    for (var i = 0; i < allEnemies.length; ++i) {
        allEnemies[i].init();
    }
}

GameBoard.prototype.startDemoMode = function() {
    this.startNewGame();
    this.gameMode = false;
    this.demoMode = true;
    this.showHelp = false;
}

// Generate a random number x, where lowLimit <= x <= highLimit.
GameBoard.Random = function(lowLimit, highLimit) {
    return lowLimit + Math.floor(Math.random() * (highLimit - lowLimit + 1));
}

GameBoard.prototype.handleInput = function(key, ctrlKey) {
    switch (key) {
        case 'left':
            this.showPreviousHelpScreen();
            break;
        case 'right':
            this.showNextHelpScreen();
            break;
        case 'esc':
            // Close any open dialogs and start demo mode.
            if ((this.demoMode && this.showHelp) || (this.gameMode && this.gameOver)) {
                this.startDemoMode();
                scoreBoard.setGutterMessage('Hit the spacebar to play!');
            }
            break;
        case 'space':
            if (this.demoMode || (this.gameMode && this.gameOver)) {
                this.startNewGame();
            }
            else if (this.resumeGame) {
                this.showHelp = false;
                this.paused = false;
                this.resumeGame = false; // reset.
            }
            else {
                this.paused = !this.paused; // pause or resume game.
            }
            break;
    }
}

GameBoard.prototype.showPreviousHelpScreen = function() {
    if (this.demoMode || this.resumeGame) {
        this.helpScreen--;
        if (this.helpScreen < 0) {
            this.helpScreen = GameBoard.HelpScreens - 1;
        }
    }
}

GameBoard.prototype.showNextHelpScreen = function() {
    if (this.demoMode || this.resumeGame) {
        this.helpScreen++;
        if (this.helpScreen == GameBoard.HelpScreens) {
            this.helpScreen = 0;
        }
    }
}

GameBoard.prototype.showHelpScreen = function() {
    gameOverDialog.hide();
    gameRulesDialog.visible = (this.helpScreen == GameRulesDialog.Id);
    hintsDialog.visible = (this.helpScreen == HintsDialog.Id);
    attributionDialog.visible = (this.helpScreen == AttributionDialog.Id);
}

GameBoard.prototype.hideHelpScreens = function() {
    gameRulesDialog.hide();
    hintsDialog.hide();
    attributionDialog.hide();
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
        ctx.drawImage(Resources.get(this.sprite), this.x, topBuffer + this.y); // natural size
    }
    else {
        ctx.drawImage(Resources.get(this.sprite), this.x, topBuffer + this.y, width, height); // scaled
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
    this.info = [
        { sprite: 'images/enemy-green.png', color: 'green', charm: 'images/charm-green.png', points: Enemy.KillPointsGreen },
        { sprite: 'images/enemy-blue.png', color: 'blue', charm: 'images/charm-blue.png', points: Enemy.KillPointsBlue },
        { sprite: 'images/enemy-yellow.png', color: 'yellow', charm: 'images/charm-yellow.png', points: Enemy.KillPointsYellow },
        { sprite: 'images/enemy-purple.png', color: 'purple', charm: 'images/charm-purple.png', points: Enemy.KillPointsPurple },
        { sprite: 'images/enemy-red.png', color: 'red', charm: 'images/charm-red.png', points: Enemy.KillPointsRed }
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

Enemy.KillPointsGreen = 2000;
Enemy.KillPointsBlue = 4000;
Enemy.KillPointsYellow = 6000;
Enemy.KillPointsPurple = 8000;
Enemy.KillPointsRed = 10000;

// The +/- variation from the exact center of a tile column that
// defines an acceptable range for charms to be dropped.
Enemy.ColumnTolerance = GameBoard.TileWidth * 0.01;

// Pseudoclass methods.
Enemy.prototype.init = function() {
    this.row = gameBoard.getRandomEnemyRow();
    this.x = this.startingXPosition;
    this.y = gameBoard.getYFromRow(this.row, Enemy.OffsetY);

    this.delay = GameBoard.Random(Enemy.MinDelay, Enemy.MaxDelay);
    this.speed = GameBoard.Random(Enemy.MinSpeed, Enemy.MaxSpeed);

    // The enemy speed determines:
    //   - the color of the sprite that's assigned,
    //   - the points awarded to a player when the enemy is turned
    //     into a zombie (more points are awarded for faster enemies).
    this.index = this.getIndex();
    this.sprite = this.info[this.index].sprite;

    this.zombieCounter = Enemy.ZombieLifetime;
    this.zombie = false;
}

Enemy.prototype.render = function() {
    if (this.zombie) {
        ctx.globalAlpha = this.zombieCounter / Enemy.ZombieLifetime;
        InteractiveItem.prototype.render.call(this);
        ctx.globalAlpha = 1;
        if (!gameBoard.paused && this.zombieCounter > 0) {
            this.zombieCounter--;
        }
    }
    else {
        InteractiveItem.prototype.render.call(this);
    }
}

Enemy.prototype.getCharmSprite = function() {
    return this.info[this.index].charm;
}

Enemy.prototype.getIndex = function() {
    if (this.speed < 120) return 0;
    if (this.speed < 165) return 1;
    if (this.speed < 210) return 2;
    if (this.speed < 255) return 3;

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
    var columnPosition = Math.floor(this.x % GameBoard.TileWidth);
    if (columnPosition <= (columnCenter - Enemy.ColumnTolerance) ||
        columnPosition >= (columnCenter + Enemy.ColumnTolerance)) {
        return false; // off center.
    }

    return true; // enemy is centered in the column.
}

// Update the enemy's position, required method for game.
// Parameter: dt, a time delta between ticks.
Enemy.prototype.update = function(dt) {
    if (gameBoard.paused) {
        return;
    }

    if (this.delay > 0) {
        this.delay--;
    }
    else {
        // Multiply movement by the dt parameter. This ensures the
        // game runs at the same speed for all computers.
        this.x += (this.speed * dt);
        if (this.x > ctx.canvas.width || this.zombieCounter === 0) {
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
    this.info = [
        { sprite: 'images/char-cat-girl.png' },
        { sprite: 'images/char-pink-girl.png' },
        { sprite: 'images/char-princess-girl.png' },
        { sprite: 'images/char-horn-girl.png' },
        { sprite: 'images/char-boy.png' }
    ];

    this.index = this.info.length - 1; // the index of our default sprite.
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
        var enemy = allEnemies[i];
        if (!enemy.zombie && this.overlapsWith(enemy)) {
            if (this.index != enemy.index) {
                // Enemy kills player.
                scoreBoard.removeLife();
                gameBoard.playSound(gameBoard.sounds.collision);
                this.reset();
                break;
            }
            else {
                // Player kills enemy; enemy becomes the walking dead.
                if (!enemy.zombie) {
                    enemy.zombie = true;
                    scoreBoard.addPoints(enemy.info[enemy.index].points);
                }
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
    // No qualifications on when the user can toggle players.
    if (ctrlKey && key === 'up') {
        this.setNextSprite();
    }
    else if (ctrlKey && key === 'down') {
        this.setPreviousSprite();
    }
    else if (gameBoard.gameMode && !gameBoard.paused) {
        if (key === 'left') {
            this.moveLeft();
        }
        else if (key === 'right') {
            this.moveRight();
        }
        else if (key === 'up') {
            this.moveUp();
        }
        else if (key === 'down') {
            this.moveDown();
        }
    }
}

Player.prototype.moveLeft = function() {
    // If we're not in the far left column, then we can move left.
    if (this.x >= GameBoard.TileWidth) {
        this.x -= GameBoard.TileWidth;
    }
}

Player.prototype.moveRight = function() {
    // If we're not in the far right column, then we can move right.
    if ((this.x + GameBoard.TileWidth) < ctx.canvas.width) {
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

Player.prototype.setNextSprite = function() {
    this.index++;
    if (this.index > (this.info.length - 1)) {
        this.index = 0;
    }
    this.setSprite(this.info[this.index].sprite);
    scoreBoard.setSprite(this.info[this.index].sprite);
}

Player.prototype.setPreviousSprite = function() {
    this.index--;
    if (this.index < 0) {
        this.index = this.info.length - 1;
    }
    this.setSprite(this.info[this.index].sprite);
    scoreBoard.setSprite(this.info[this.index].sprite);
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
    this.points = (points == null ? Charm.DefaultPoints : points);
    this.visible = false;
}

Charm.prototype = Object.create(InteractiveItem.prototype);
Charm.prototype.constructor = Charm;

// Pseudoclass properties.
Charm.Width = 101;
Charm.Height = 171;
Charm.VisibleWidth = 20;
Charm.OffsetY = 93;
Charm.DefaultPoints = 5000;

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
    this.charms = [new Charm(0), new Charm(1), new Charm(2)];
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
Dialog.TitleFont = '64px Luckiest Guy';
Dialog.NormalFont = '25px Luckiest Guy';
Dialog.SmallFont = '20px Luckiest Guy';
Dialog.Bullet = String.fromCodePoint(0x2022);
Dialog.LeftIcon = String.fromCodePoint(0x2039); // ‹
Dialog.RightIcon = String.fromCodePoint(0x203A); // ›
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

Dialog.prototype.render = function() {
    if (this.visible) {
        this.drawDialog(this.x, this.y, this.width, this.height, 15, true, true);
        this.contents();
    }
}

Dialog.prototype.show = function() {
    this.visible = true;
}

Dialog.prototype.hide = function() {
    this.visible = false;
}

Dialog.prototype.titleText = function(title, x, y) {
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.font = Dialog.TitleFont;
    ctx.fillText(title, x, y);
}

Dialog.prototype.startResumeGameText = function(y) {
    ctx.textAlign = 'center';
    ctx.fillText('Hit the space bar', this.midX, y += 45);
    ctx.fillText('to' + (gameBoard.resumeGame ? ' resume ' : ' ') + 'play ...', this.midX, y += 27);
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
    if (typeof stroke == 'undefined') {
        stroke = true;
    }
    if (typeof radius === 'undefined') {
        radius = 5;
    }
    ctx.fillStyle = 'black';
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

// Pseudoclass properties.
GameRulesDialog.Id = 0;

// Pseudoclass methods.
GameRulesDialog.prototype.render = function() {
    if (this.visible) {
        this.drawDialog(this.x, this.y, this.width, this.height, 15, true, true);
        this.contents();
    }
}

GameRulesDialog.prototype.contents = function() {
    var y = this.y + 70;
    this.titleText('Game Rules ' + Dialog.RightIcon, this.midX, y);

    ctx.font = Dialog.NormalFont;

    ctx.textAlign = 'left';
    ctx.fillText(Dialog.Bullet + ' Move the Player using the', this.leftX, y += 40);
    ctx.fillText('   arrow keys: up, down, left, right', this.leftX, y += 27);
    ctx.fillText(Dialog.Bullet + ' Avoid the ladybugs!', this.leftX, y += 34);
    ctx.fillText(Dialog.Bullet + ' Get points for each second', this.leftX, y += 34);
    ctx.fillText('   the player is in-play (the grass', this.leftX, y += 27);
    ctx.fillText('   area is NOT considered in-play)', this.leftX, y += 27);
    ctx.fillText(Dialog.Bullet + ' Get points for cleaning up', this.leftX, y += 34);
    ctx.fillText('   after the ladybugs', this.leftX, y += 27);
    ctx.fillText(Dialog.Bullet + ' Game is over when all lives', this.leftX, y += 34);
    ctx.fillText('   are used or the time is up', this.leftX, y += 27);
    ctx.fillText(Dialog.Bullet + ' Ctrl-up/down changes player', this.leftX, y += 34);
    this.startResumeGameText(y);
}

//---------------------------------
// HintsDialog Pseudoclass.
//---------------------------------

// Constructor.
function HintsDialog() {
    this.init();

    var extraWidth = 88; // make this a constant.
    this.width = this.width + extraWidth; // a bit wider than default.
    this.height = this.height + 315; // a bit longer too.
    this.x = this.x - (extraWidth / 2); // to keep centered.
    this.y = this.y - 28;
    this.visible = true; // shown on startup.
}

HintsDialog.prototype = Object.create(Dialog.prototype);
HintsDialog.prototype.constructor = HintsDialog;

// Pseudoclass properties.
HintsDialog.Id = 1;

// Pseudoclass methods.
HintsDialog.prototype.contents = function() {
    var y = this.y + 70;
    this.titleText(Dialog.LeftIcon + ' Game Hints ' + Dialog.RightIcon, this.midX, y);

    ctx.font = Dialog.NormalFont;

    ctx.textAlign = 'left';
    ctx.fillText(Dialog.Bullet + ' Change players during play to', this.leftX, y += 40);
    ctx.fillText('   reveal each characters power', this.leftX, y += 27);
    ctx.fillText('   to defeat certain enemies', this.leftX, y += 27);
    ctx.fillText(Dialog.Bullet + ' Play wisely! Points for ...', this.leftX, y += 40);
    ctx.fillText('   Cleaning up after ladybugs - ' + Charm.DefaultPoints, this.leftX, y += 30);
    ctx.fillText('   Each full second in play - ' + GameBoard.PointsPerSecond, this.leftX, y += 30);
    ctx.fillText('   Defeating Green Enemy - ' + Enemy.KillPointsGreen, this.leftX, y += 30);
    ctx.fillText('   Defeating Blue Enemy - ' + Enemy.KillPointsBlue, this.leftX, y += 30);
    ctx.fillText('   Defeating Yellow Enemy - ' + Enemy.KillPointsYellow, this.leftX, y += 30);
    ctx.fillText('   Defeating Purple Enemy - ' + Enemy.KillPointsPurple, this.leftX, y += 30);
    ctx.fillText('   Defeating Red Enemy - ' + Enemy.KillPointsRed, this.leftX, y += 30);
    this.startResumeGameText(y);
}

//---------------------------------
// AttributionDialog Pseudoclass.
//---------------------------------

// Constructor.
function AttributionDialog() {
    this.init();

    var extraWidth = 88; // make this a constant.
    this.width = this.width + extraWidth; // a bit wider than default.
    this.height = this.height + 315; // a bit longer too.
    this.x = this.x - (extraWidth / 2); // to keep centered.
    this.y = this.y - 28;
    this.visible = true; // shown on startup.
}

AttributionDialog.prototype = Object.create(Dialog.prototype);
AttributionDialog.prototype.constructor = AttributionDialog;

// Pseudoclass properties.
AttributionDialog.Id = 2;

// Pseudoclass methods.
AttributionDialog.prototype.contents = function() {
    var y = this.y + 70;
    this.titleText('Attribution', this.midX, y);

    ctx.textAlign = 'left';
    ctx.font = Dialog.NormalFont;

    y += 50;
    ctx.fillText(Dialog.Bullet + ' Some attribution type stuff ...', this.leftX, y);
    //y += 30;
    //ctx.fillText('   arrow keys: up, down, left, right', this.leftX, y);
    //y += 33;
    //ctx.fillText(Dialog.Bullet + ' Avoid the ladybugs!', this.leftX, y);
    //y += 33;
    //ctx.fillText(Dialog.Bullet + ' Get points for each second', this.leftX, y);
    //y += 30;
    //ctx.fillText('   the player is in-play (the grass', this.leftX, y);
    //y += 30;
    //ctx.fillText('   area is NOT considered in-play)', this.leftX, y);
    //y += 33;
    //ctx.fillText(Dialog.Bullet + ' Get points for cleaning up', this.leftX, y);
    //y += 30;
    //ctx.fillText('   after the ladybugs', this.leftX, y);
    //y += 33;
    //ctx.fillText(Dialog.Bullet + ' Game is over when all lives', this.leftX, y);
    //y += 30;
    //ctx.fillText('   are used or the time is up', this.leftX, y);
    //y += 33;
    //ctx.fillText(Dialog.Bullet + ' Ctrl-up/down changes player', this.leftX, y);
    this.startResumeGameText(y);
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
GameOverDialog.OuttaTimeReason = 'Time';
GameOverDialog.OuttaLivesReason = 'Lives';

// Pseudoclass methods.
GameOverDialog.prototype.setReason = function(reason) {
    this.reason = reason;
}

GameOverDialog.prototype.contents = function() {
    var y = this.y + 75;

    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.font = Dialog.TitleFont;
    ctx.fillText('Game Over!', this.midX, y);

    if (this.reason != null) {
        y += 30;
        ctx.font = Dialog.SmallFont;
        ctx.fillText('(Outta ' + this.reason + ')', this.midX, y);
    }

    ctx.font = Dialog.NormalFont;

    y += 50;
    ctx.fillText('Hit the space bar', this.midX, y);
    y += 30;
    ctx.fillText('to play again ...', this.midX, y);
}

//---------------------------------
// Global Helpers.
//---------------------------------

function showGameInfo() {
    if (gameBoard.demoMode) {
        gameBoard.showHelp = true;
    }
    else if (gameBoard.gameMode && (gameBoard.paused || gameBoard.gameOver)) {
        gameBoard.showHelp = true;
        gameBoard.resumeGame = true;
    }
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

// Instantiate our Game Hints dialog.
var hintsDialog = new HintsDialog();

// Instantiate our Attribution dialog.
var attributionDialog = new AttributionDialog();

// Instantiate our Game Over dialog.
var gameOverDialog = new GameOverDialog();

// Instantiate enemy objects.
var allEnemies = [new Enemy(0), new Enemy(1), new Enemy(2), new Enemy(3), new Enemy(4), new Enemy(5)];

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
    player.handleInput(allowedKeys[e.keyCode], e.ctrlKey);
});