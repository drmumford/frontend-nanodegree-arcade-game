//---------------------------------
// ScoreBoard Pseudoclass.
//---------------------------------

// Constructor.
function ScoreBoard() {
    this.init();
}

// Pseudoclass properties.
ScoreBoard.HEIGHT = 48;
ScoreBoard.TITLE_TEXT_Y = 17;
ScoreBoard.LIVES_POSITION_X = 5;
ScoreBoard.LIVES_POSITION_Y = -6;
ScoreBoard.SCORE_POSITION_X = 500;
ScoreBoard.SCORE_POSITION_Y = 60;
ScoreBoard.TITLE_FONT = '20px Luckiest Guy';
ScoreBoard.SCORE_FONT = '40px Luckiest Guy';
ScoreBoard.BANNER_MSG_FONT = '25px Luckiest Guy';

// Pseudoclass methods.
ScoreBoard.prototype.init = function() {
    this.sprite = 'images/char-boy.png';
    this.reset();
};

ScoreBoard.prototype.reset = function() {
    this.remainingLives = GameBoard.LIVES_PER_GAME;
    this.bannerMessage = null;
    this.score = 0;
    this.points = 0;
};

ScoreBoard.prototype.addLife = function() {
    this.remainingLives++;
};

ScoreBoard.prototype.removeLife = function() {
    this.remainingLives--;
};

ScoreBoard.prototype.addPoints = function(points) {
    this.points += points;
};

ScoreBoard.prototype.setSprite = function(sprite) {
    this.sprite = sprite;
};

ScoreBoard.prototype.setBannerMessage = function(message) {
    this.bannerMessage = message;
};

ScoreBoard.prototype.update = function() {
    if (gameBoard.paused) {
        return;
    }

    this.score += this.points;
};

ScoreBoard.prototype.render = function() {
    // Overwrite existing scoreboard.
    ctx.fillStyle = '#ffd800';
    ctx.fillRect(0, 0, GameBoard.TILE_WIDTH * gameBoard.columns, topBuffer + ScoreBoard.HEIGHT);

    // Render remaining lives icons.
    var image = Resources.get(this.sprite);
    var width = image.width * 0.5;
    var height = image.height * 0.5;
    for (var i = 0; i < this.remainingLives; ++i) {
        ctx.drawImage(image, ScoreBoard.LIVES_POSITION_X + i * width, ScoreBoard.LIVES_POSITION_Y, width, height);
    }

    // Render remaining lives title.
    ctx.fillStyle = 'black';
    ctx.font = ScoreBoard.TITLE_FONT;
    ctx.textAlign = 'left';
    ctx.fillText('Remaining Lives', ScoreBoard.LIVES_POSITION_X, ScoreBoard.TITLE_TEXT_Y);

    // Render remaining time and score title.
    ctx.textAlign = 'right';
    ctx.fillText('Remaining Time / Score', ScoreBoard.SCORE_POSITION_X, ScoreBoard.TITLE_TEXT_Y);

    // Render the remaining time and score.
    ctx.font = ScoreBoard.SCORE_FONT;
    if (gameBoard.gameMode) {
        ctx.fillText(gameBoard.remainingTime + ' / ' + this.score, ScoreBoard.SCORE_POSITION_X, ScoreBoard.SCORE_POSITION_Y);
    }
    else { // demo mode doesn't show the elapsed game time.
        ctx.fillText(GameBoard.GAME_DURATION + ' / 0', ScoreBoard.SCORE_POSITION_X, ScoreBoard.SCORE_POSITION_Y);
    }

    this.renderBannerMessage();
    this.points = 0;
};

ScoreBoard.prototype.renderBannerMessage = function() {
    if (this.bannerMessage !== null) {
        ctx.fillStyle = 'black';
        ctx.font = ScoreBoard.BANNER_MSG_FONT;
        ctx.textAlign = 'center';
        ctx.fillText(this.bannerMessage,
            GameBoard.TILE_WIDTH / 2 + gameBoard.getWidth() / 2,
            GameBoard.TILE_HEIGHT / 2 + gameBoard.getHeight());
    }
};

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

    this.soundOn = false;
    this.sounds = {
        collision: 'sounds/hit.wav',
        charmdrop: 'sounds/pop.wav',
        charmpickup: 'sounds/thud.wav'
    };

    this.reset();
}

// Pseudoclass properties.
GameBoard.LIVES_PER_GAME = 4;
GameBoard.TILE_WIDTH = 101;
GameBoard.TILE_HEIGHT = 83;
GameBoard.TOP_ROW = 0;
GameBoard.POINTS_PER_SECOND = 1000; // only when the player is active.
GameBoard.GAME_DURATION = 120; // in seconds.
GameBoard.HELP_SCREENS = 4; // game instructions, hints, art attribution, sound attribution

// Pseudoclass methods.
GameBoard.prototype.reset = function() {
    this.stopwatch.reset();
    this.remainingTime = GameBoard.GAME_DURATION;
    this.gameOver = false;
    this.paused = false;
    this.helpScreen = GameRulesDialog.ID; // start-up screen.
    this.demoMode = this.firstRun;
    this.showHelp = this.firstRun;
    this.gameMode = !this.firstRun;

    if (this.firstRun) {
        this.firstRun = false; // show game info once.
    }
};

GameBoard.prototype.update = function() {
    // Show the current help screen.
    if (this.showHelp) {
        this.showHelpScreen();
    }
    else {
        this.hideHelpScreens();
    }

    if (!this.paused) {
        this.stopwatch.start();
        this.remainingTime = GameBoard.GAME_DURATION - this.stopwatch.seconds();
    }

    if (this.demoMode) {
        gameOverDialog.visible = false;
    }
    else { // Game Mode.
        if (this.paused) {
            this.stopwatch.stop(); // pause.
        }
        else {
            // Determine if the game is over.
            if (this.isGameOver()) {
                this.paused = true;
                this.gameOver = true;
                this.resumeGame = false;
                gameOverDialog.show();
            }
        }
    }
};

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
};

GameBoard.prototype.getSeconds = function() {
    return this.stopwatch.seconds();
};

GameBoard.prototype.getWidth = function() {
    return (this.columns - 1) * GameBoard.TILE_WIDTH;
};

GameBoard.prototype.getHeight = function() {
    return (this.rows - 1) * GameBoard.TILE_HEIGHT;
};

GameBoard.prototype.getRandomEnemyRow = function() {
    // A random stone tile row. Note: enemies don't use
    // the last two rows (grass tiles).
    return GameBoard.Random(0, this.getBottomRow() - 2);
};

GameBoard.prototype.getBottomRow = function() {
    return this.rows - 1;
};

GameBoard.prototype.getRowFromY = function(y, offset) {
    return (y - offset) / GameBoard.TILE_HEIGHT;
};

GameBoard.prototype.getYFromRow = function(row, offset) {
    return (row * GameBoard.TILE_HEIGHT) + offset;
};

GameBoard.prototype.playSound = function(soundFile) {
    if (gameBoard.soundOn) {
        var sound = new Audio(soundFile);
        sound.play();
    }
};

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
};

GameBoard.prototype.startDemoMode = function() {
    this.startNewGame();
    this.gameMode = false;
    this.demoMode = true;
    this.showHelp = false;
};

// Generate a random number x, where lowLimit <= x <= highLimit.
GameBoard.Random = function(lowLimit, highLimit) {
    return lowLimit + Math.floor(Math.random() * (highLimit - lowLimit + 1));
};

GameBoard.prototype.handleInput = function(key) {
    switch (key) {
        case 'debug':
            console.log("DemoMode=" + this.demoMode + ", GameMode=" + this.gameMode + ", GameOver=" + this.gameOver +
                ", paused=" + this.paused + ", showHelp=" + this.showHelp + ", resumeGame=" + this.resumeGame);
            break;
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
                scoreBoard.setBannerMessage('Hit the spacebar to play!');
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
};

GameBoard.prototype.showPreviousHelpScreen = function() {
    if (this.showHelp) {
        this.helpScreen--;
        if (this.helpScreen < 0) {
            this.helpScreen = GameBoard.HELP_SCREENS - 1;
        }
    }
};

GameBoard.prototype.showNextHelpScreen = function() {
    if (this.showHelp) {
        this.helpScreen++;
        if (this.helpScreen == GameBoard.HELP_SCREENS) {
            this.helpScreen = 0;
        }
    }
};

GameBoard.prototype.showHelpScreen = function() {
    gameOverDialog.hide();
    gameRulesDialog.visible = (this.helpScreen == GameRulesDialog.ID);
    hintsDialog.visible = (this.helpScreen == HintsDialog.ID);
    attributionDialog.visible = (this.helpScreen == AttributionDialog.ID);
    attributionSoundsDialog.visible = (this.helpScreen == AttributionSoundsDialog.ID);
};

GameBoard.prototype.hideHelpScreens = function() {
    gameRulesDialog.hide();
    hintsDialog.hide();
    attributionDialog.hide();
    attributionSoundsDialog.hide();
};

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
};

RenderableItem.prototype.setSprite = function(sprite) {
    this.sprite = sprite;
};

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
};

InteractiveItem.prototype.rightX = function() {
    return this.x + (this.width / 2) + this.halfVisibleWidth;
};

InteractiveItem.prototype.overlapsWith = function(other) {
    return (
        (other instanceof InteractiveItem) &&
        (this.row == other.row) &&
        (this.leftX() < other.rightX()) &&
        (this.rightX() > other.leftX())
    );
};

//---------------------------------
// Enemy Pseudoclass.
//---------------------------------

// Constructor.
function Enemy(id) {
    var width = 101;
    var visibleWidth = 101;
    var startingXPosition = -GameBoard.TILE_WIDTH; // off-canvas.
    var startingYPosition = 0; // row is dynamically determined.
    InteractiveItem.call(this, id, width, visibleWidth, startingXPosition, startingYPosition, 'images/enemy-red.png');

    // Build sprite array.
    this.info = [
        { sprite: 'images/enemy-green.png', color: 'green', charm: 'images/charm-green.png', points: Enemy.KILL_POINTS_GREEN },
        { sprite: 'images/enemy-blue.png', color: 'blue', charm: 'images/charm-blue.png', points: Enemy.KILL_POINTS_BLUE },
        { sprite: 'images/enemy-yellow.png', color: 'yellow', charm: 'images/charm-yellow.png', points: Enemy.KILL_POINTS_YELLOW },
        { sprite: 'images/enemy-purple.png', color: 'purple', charm: 'images/charm-purple.png', points: Enemy.KILL_POINTS_PURPLE },
        { sprite: 'images/enemy-red.png', color: 'red', charm: 'images/charm-red.png', points: Enemy.KILL_POINTS_RED }
    ];

    this.init();
}

Enemy.prototype = Object.create(InteractiveItem.prototype);
Enemy.prototype.constructor = Enemy;

// Pseudoclass properties.
Enemy.HIT_FROM_BEHIND_BIAS = 5; // slightly bumping an enemy from behind, no worries.
Enemy.ZOMBIE_LIFETIME = 100; // time in game ticks for a zombie to fade away.

Enemy.MIN_DELAY = 0;   // Delay is the time in game ticks that an enemy waits
Enemy.MaxDelay = 100; // before starting a(nother) crossing of the game board.

Enemy.MIN_SPEED = 75;
Enemy.MAX_SPEED = 300;

Enemy.OFFSET_Y = -18; // to vertically center an enemy in their row.

Enemy.KILL_POINTS_GREEN = 2000;
Enemy.KILL_POINTS_BLUE = 4000;
Enemy.KILL_POINTS_YELLOW = 6000;
Enemy.KILL_POINTS_PURPLE = 8000;
Enemy.KILL_POINTS_RED = 10000;

// The +/- variation from the exact center of a tile column that
// defines an acceptable range for charms to be dropped.
Enemy.COLUMN_TOLERANCE = GameBoard.TILE_WIDTH * 0.1;

// Pseudoclass methods.
Enemy.prototype.init = function() {
    this.row = gameBoard.getRandomEnemyRow();
    this.x = this.startingXPosition;
    this.y = gameBoard.getYFromRow(this.row, Enemy.OFFSET_Y);

    this.delay = GameBoard.Random(Enemy.MIN_DELAY, Enemy.MaxDelay);
    this.speed = GameBoard.Random(Enemy.MIN_SPEED, Enemy.MAX_SPEED);

    // The enemy speed determines:
    //   - the color of the sprite that's assigned,
    //   - the points awarded to a player when the enemy is turned
    //     into a zombie (more points are awarded for faster enemies).
    this.index = this.getIndex();
    this.sprite = this.info[this.index].sprite;

    this.zombieCounter = Enemy.ZOMBIE_LIFETIME;
    this.zombie = false;
};

Enemy.prototype.render = function() {
    if (this.zombie) {
        ctx.globalAlpha = this.zombieCounter / Enemy.ZOMBIE_LIFETIME;
        InteractiveItem.prototype.render.call(this);
        ctx.globalAlpha = 1;
        if (!gameBoard.paused && this.zombieCounter > 0) {
            this.zombieCounter--;
        }
    }
    else {
        InteractiveItem.prototype.render.call(this);
    }
};

Enemy.prototype.getCharmSprite = function() {
    return this.info[this.index].charm;
};

Enemy.prototype.getIndex = function() {
    if (this.speed < 120) return 0;
    if (this.speed < 165) return 1;
    if (this.speed < 210) return 2;
    if (this.speed < 255) return 3;

    return 4;
};

Enemy.prototype.leftX = function() {
    return this.x + (this.width / 2) - this.halfVisibleWidth + Enemy.HIT_FROM_BEHIND_BIAS;
};

Enemy.prototype.centeredInTile = function() {
    if (this.x <= 0) {
        return false; // off-screen to the left.
    }

    if (this.x >= (gameBoard.columns * GameBoard.TILE_WIDTH)) {
        return false; // off-screen to the right.
    }

    var tileCenter = GameBoard.TILE_WIDTH / 2;
    var columnPosition = Math.floor(this.x % GameBoard.TILE_WIDTH);
    if (columnPosition <= (tileCenter - Enemy.COLUMN_TOLERANCE) ||
        columnPosition >= (tileCenter + Enemy.COLUMN_TOLERANCE)) {
        return false; // off center.
    }

    return true; // enemy is centered in the column within our tolerance.
};

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
};

//---------------------------------
// Player Pseudoclass.
//---------------------------------

// Constructor.
function Player(id) {
    var width = 101;
    var visibleWidth = 60;
    var startingXPosition = gameBoard.getWidth() / 2;
    var startingYPosition = gameBoard.getHeight() + Player.OFFSET_Y;
    InteractiveItem.call(this, id, width, visibleWidth, startingXPosition, startingYPosition, Player.DEFAULT_SPRITE);

    this.init();
}

Player.prototype = Object.create(InteractiveItem.prototype);
Player.prototype.constructor = Player;

// Pseudoclass properties.
Player.OFFSET_Y = -8; // to vertically center the player in their row.
Player.DEFAULT_SPRITE = 'images/char-boy.png';

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
};

Player.prototype.reset = function() {
    this.lastSecond = gameBoard.getSeconds();
    this.row = gameBoard.getBottomRow();
    this.x = this.startingXPosition;
    this.y = this.startingYPosition;
};

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
        scoreBoard.addPoints(GameBoard.POINTS_PER_SECOND);
        this.lastSecond = currentSeconds;
    }
};

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
};

// Determine if the player is touching any charm.
Player.prototype.detectCharmPickups = function() {
    for (var i = 0; i < charmsManager.charms.length; ++i) {
        var charm = charmsManager.charms[i];
        if (charm.visible && this.overlapsWith(charm)) {
            charm.pickup();
        }
    }
};

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
};

Player.prototype.moveLeft = function() {
    // If we're not in the far left column, then we can move left.
    if (this.x >= GameBoard.TILE_WIDTH) {
        this.x -= GameBoard.TILE_WIDTH;
    }
};

Player.prototype.moveRight = function() {
    // If we're not in the far right column, then we can move right.
    if ((this.x + GameBoard.TILE_WIDTH) < ctx.canvas.width) {
        this.x += GameBoard.TILE_WIDTH;
    }
};

Player.prototype.moveUp = function() {
    // If we're not in the top row, then we can move up.
    if (this.row > GameBoard.TOP_ROW) {
        this.row--;
        this.y -= GameBoard.TILE_HEIGHT;
    }
};

Player.prototype.moveDown = function() {
    // If we're not in the bottom row, then we can move down.
    if (this.row < gameBoard.getBottomRow()) {
        this.row++;
        this.y += GameBoard.TILE_HEIGHT;
    }
};

Player.prototype.setNextSprite = function() {
    this.index++;
    if (this.index > (this.info.length - 1)) {
        this.index = 0;
    }
    this.setSprite(this.info[this.index].sprite);
    scoreBoard.setSprite(this.info[this.index].sprite);
};

Player.prototype.setPreviousSprite = function() {
    this.index--;
    if (this.index < 0) {
        this.index = this.info.length - 1;
    }
    this.setSprite(this.info[this.index].sprite);
    scoreBoard.setSprite(this.info[this.index].sprite);
};

Player.prototype.IsActive = function() {
    return (this.row <= (gameBoard.getBottomRow() - 2));
};

//---------------------------------
// Charms Pseudoclass.
//---------------------------------

// Constructor.
function Charm(id, points) {
    InteractiveItem.call(this, id, Charm.WIDTH * 0.25, Charm.VISIBLE_WIDTH, 0, 0, null);
    this.points = (points == null ? Charm.DEFAULT_POINTS : points);
    this.counter = Charm.LIFETIME;
    this.visible = false;
}

Charm.prototype = Object.create(InteractiveItem.prototype);
Charm.prototype.constructor = Charm;

// Pseudoclass properties.
Charm.WIDTH = 101;
Charm.HEIGHT = 171;
Charm.VISIBLE_WIDTH = 20;
Charm.OFFSET_Y = 100;
Charm.DEFAULT_POINTS = 5000;
Charm.LIFETIME = 2000; // time in game ticks for a charm to fade away.

// Pseudoclass methods.
Charm.prototype.render = function(width, height) {
    if (this.visible) {
        // 90% of charm's lifetime is spent opaque; in the final 10% it fades away.
        ctx.globalAlpha = this.counter > Charm.LIFETIME / 10 ? 1 : this.counter / (Charm.LIFETIME / 10);
        InteractiveItem.prototype.render.call(this, width, height);
        ctx.globalAlpha = 1;
        if (!gameBoard.paused) {
            if (this.counter > 0) {
                this.counter--;
            }
            else {
                this.visible = false;  // so it can be dropped again.
            }
        }
    }
};

Charm.prototype.drop = function() {
    // Charms are dropped beneath an enemy; find one in an acceptable position.
    for (var i = 0; i < allEnemies.length; ++i) {
        var enemy = allEnemies[i];
        if (enemy.centeredInTile()) {
            // (Re)Init the charm using the enemy's properties.
            this.x = enemy.x;
            this.y = enemy.y + Charm.OFFSET_Y;
            this.y += GameBoard.Random(0, 20) * -GameBoard.Random(0, 1); // put some random variation in y too.
            this.row = gameBoard.getRowFromY(enemy.y, Enemy.OFFSET_Y);
            this.sprite = enemy.getCharmSprite();

            this.visible = true;
            this.counter = Charm.LIFETIME;

            gameBoard.playSound(gameBoard.sounds.charmdrop);
            return true;
        }
    }
    return false; // no enemy is in a position to drop.
};

Charm.prototype.pickup = function() {
    gameBoard.playSound(gameBoard.sounds.charmpickup);
    scoreBoard.addPoints(this.points);
    charmsManager.resetCharmTimer(); // wait before dropping the next charm.
    this.visible = false;
};

//---------------------------------
// CharmsManager Pseudoclass.
//---------------------------------

// Constructor.
function CharmsManager() {
    this.charms = [new Charm(0), new Charm(1), new Charm(2), new Charm(3), new Charm(4), new Charm(5)];
    this.resetCharmTimer();
}

// Pseudoclass properties.
CharmsManager.MIN_DELAY = 2; // Variable delay in seconds to wait
CharmsManager.MAX_DELAY = 4; // before dropping a(nother) charm.

// Pseudoclass methods.
CharmsManager.prototype.reset = function() {
    this.resetCharmTimer();
    for (var i = 0; i < this.charms.length; ++i) {
        this.charms[i].visible = false;
    }
};

CharmsManager.prototype.resetCharmTimer = function() {
    this.seconds = 0;
    this.startingSeconds = gameBoard.getSeconds();

    // A variable delay determines when the next charm is actually dropped.
    this.delay = GameBoard.Random(CharmsManager.MIN_DELAY, CharmsManager.MAX_DELAY);
};

CharmsManager.prototype.render = function() {
    this.charms.forEach(function(charm) {
        if (charm.visible) {
            var width = Charm.WIDTH * 0.25;
            var height = Charm.HEIGHT * 0.25;

            charm.render(width, height);
        }
    });
};

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
};

//---------------------------------
// Stopwatch Pseudoclass.
//---------------------------------

// Constructor.
function Stopwatch() {
    this.reset();
}

// Pseudoclass methods.
Stopwatch.prototype.start = function() {
    this.startTime = this.startTime ? this.startTime : Date.now();
};

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
Dialog.LEFT_MARGIN = GameBoard.TILE_WIDTH / 2;
Dialog.TITLE_FONT = '64px Luckiest Guy';
Dialog.NORMAL_FONT = '25px Luckiest Guy';
Dialog.SMALL_FONT = '20px Luckiest Guy';
Dialog.BULLET = String.fromCodePoint(0x2022); // •
Dialog.LEFT_ICON = String.fromCodePoint(0x2039); // ‹
Dialog.RIGHT_ICON = String.fromCodePoint(0x203A); // ›
Dialog.ALPHA = 0.83;

// Pseudoclass methods.
Dialog.prototype.init = function(x, y, width, height, radius) {
    // If position and size aren't provided, use defaults.
    this.width = width || (GameBoard.TILE_WIDTH * gameBoard.columns);
    this.height = height || (GameBoard.TILE_HEIGHT * gameBoard.rows + bottomBuffer);

    this.x = x || 0;
    this.y = y || (topBuffer + ScoreBoard.HEIGHT);

    this.radius = radius || 0; // default is square corners.

    this.leftX = this.x + Dialog.LEFT_MARGIN;
    this.midX = this.x + (this.width / 2);

    this.visible = false;
};

Dialog.prototype.render = function() {
    if (this.visible) {
        this.drawDialog(this.x, this.y, this.width, this.height, this.radius, true, true);
        this.contents();
    }
};

Dialog.prototype.show = function() {
    this.visible = true;
};

Dialog.prototype.hide = function() {
    this.visible = false;
};

Dialog.prototype.titleText = function(title, x, y) {
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.font = Dialog.TITLE_FONT;
    ctx.fillText(title, x, y);
};

Dialog.prototype.startResumeGameText = function(y, again) {
    again = again || false;

    // Hit the space bar to play ...
    // Hit the space bar to resume play ...
    // Hit the space bar to play again ...
    ctx.textAlign = 'center';
    ctx.fillText('Hit the space bar', this.midX, y += 45);
    ctx.fillText('to' + (gameBoard.resumeGame ? ' resume ' : ' ') + 'play' +
        (again ? ' again ' : ' ') + '...', this.midX, y += 27);
};

// Draws a rounded rectangle using the current state of the canvas.
// If you omit the last three params, it will draw a rectangle
// outline with a 5 pixel border radius.
// CanvasRenderingContext2D - The ctx.
// Number - x The top left x coordinate
// Number - y The top left y coordinate
// Number - width The width of the rectangle
// Number - height The height of the rectangle
// Number - radius The corner radius. Defaults to 5;
// Boolean - fill Whether to fill the rectangle. Defaults to false.
// Boolean - stroke Whether to stroke the rectangle. Defaults to true.
// This method is based on this StackOverflow answer
// http://stackoverflow.com/a/3368118/229858 by Juan Mendes
Dialog.prototype.drawDialog = function(x, y, width, height, radius, fill, stroke, alpha, color) {
    if (typeof stroke == 'undefined') {
        stroke = true;
    }
    if (typeof radius === 'undefined') {
        radius = 5;
    }

    ctx.fillStyle = color || 'black';
    ctx.globalAlpha = alpha || Dialog.ALPHA;

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
};

//---------------------------------
// GameRulesDialog Pseudoclass.
//---------------------------------

// Constructor.
function GameRulesDialog() {
    this.init();
}

GameRulesDialog.prototype = Object.create(Dialog.prototype);
GameRulesDialog.prototype.constructor = GameRulesDialog;

// Pseudoclass properties.
GameRulesDialog.ID = 0;

// Pseudoclass methods.
GameRulesDialog.prototype.contents = function() {
    var y = this.y + 70;
    this.titleText('Game Rules ' + Dialog.RIGHT_ICON, this.midX, y);

    ctx.font = Dialog.NORMAL_FONT;

    ctx.textAlign = 'left';
    ctx.fillText(Dialog.BULLET + ' Move the Player using the', this.leftX, y += 40);
    ctx.fillText('   arrow keys: up, down, left, right', this.leftX, y += 27);
    ctx.fillText(Dialog.BULLET + ' Avoid the ladybugs!', this.leftX, y += 34);
    ctx.fillText(Dialog.BULLET + ' Get points for each second', this.leftX, y += 34);
    ctx.fillText('   the player is in-play (the grass', this.leftX, y += 27);
    ctx.fillText('   area is NOT considered in-play)', this.leftX, y += 27);
    ctx.fillText(Dialog.BULLET + ' Get points for cleaning up', this.leftX, y += 34);
    ctx.fillText('   after the ladybugs', this.leftX, y += 27);
    ctx.fillText(Dialog.BULLET + ' Game is over when all lives', this.leftX, y += 34);
    ctx.fillText('   are used or the time is up', this.leftX, y += 27);
    ctx.fillText(Dialog.BULLET + ' Ctrl-up/down changes player', this.leftX, y += 34);
    this.startResumeGameText(gameBoard.getHeight() + GameBoard.TILE_HEIGHT);
};

//---------------------------------
// HintsDialog Pseudoclass.
//---------------------------------

// Constructor.
function HintsDialog() {
    this.init();
}

HintsDialog.prototype = Object.create(Dialog.prototype);
HintsDialog.prototype.constructor = HintsDialog;

// Pseudoclass properties.
HintsDialog.ID = 1;

// Pseudoclass methods.
HintsDialog.prototype.contents = function() {
    var y = this.y + 70;
    this.titleText(Dialog.LEFT_ICON + ' Game Hints ' + Dialog.RIGHT_ICON, this.midX, y);

    ctx.font = Dialog.NORMAL_FONT;

    ctx.textAlign = 'left';
    ctx.fillText(Dialog.BULLET + ' Change players during play to', this.leftX, y += 40);
    ctx.fillText('   reveal each characters power', this.leftX, y += 27);
    ctx.fillText('   to defeat certain enemies', this.leftX, y += 27);
    ctx.fillText(Dialog.BULLET + ' Play wisely! Points for ...', this.leftX, y += 34);
    ctx.fillText('   Cleaning up after ladybugs - ' + Charm.DEFAULT_POINTS, this.leftX, y += 30);
    ctx.fillText('   Each full second in play - ' + GameBoard.POINTS_PER_SECOND, this.leftX, y += 30);
    ctx.fillText('   Defeating Green Enemy - ' + Enemy.KILL_POINTS_GREEN, this.leftX, y += 30);
    ctx.fillText('   Defeating Blue Enemy - ' + Enemy.KILL_POINTS_BLUE, this.leftX, y += 30);
    ctx.fillText('   Defeating Yellow Enemy - ' + Enemy.KILL_POINTS_YELLOW, this.leftX, y += 30);
    ctx.fillText('   Defeating Purple Enemy - ' + Enemy.KILL_POINTS_PURPLE, this.leftX, y += 30);
    ctx.fillText('   Defeating Red Enemy - ' + Enemy.KILL_POINTS_RED, this.leftX, y += 30);
    this.startResumeGameText(gameBoard.getHeight() + GameBoard.TILE_HEIGHT);
};

//---------------------------------
// AttributionDialog Pseudoclass.
//---------------------------------

// Constructor.
function AttributionDialog() {
    this.init();
}

AttributionDialog.prototype = Object.create(Dialog.prototype);
AttributionDialog.prototype.constructor = AttributionDialog;

// Pseudoclass properties.
AttributionDialog.ID = 2;

// Pseudoclass methods.
AttributionDialog.prototype.contents = function() {
    var y = this.y + 70;
    this.titleText(Dialog.LEFT_ICON + ' Attribution' + Dialog.RIGHT_ICON, this.midX, y);

    ctx.font = Dialog.NORMAL_FONT;

    ctx.textAlign = 'left';
    ctx.fillText(Dialog.BULLET + ' Original Artwork design by', this.leftX, y += 40);
    ctx.fillText('   Daniel Cook (Lostgarden.com)', this.leftX, y += 27);
    ctx.fillText('   Stone & Grass Tiles', this.leftX, y += 27);
    ctx.fillText('   Red Enemy & Red Player', this.leftX, y += 27);
    ctx.fillText('   Green, Blue & Yellow Players', this.leftX, y += 27);

    ctx.fillText(Dialog.BULLET + ' Additional colors for Enemies', this.leftX, y += 34);
    ctx.fillText('   by Cheryl Court (cherylcourt.ca)', this.leftX, y += 27);
    ctx.fillText('   Green, Blue, Yellow & Purple', this.leftX, y += 27);

    ctx.fillText(Dialog.BULLET + ' Artwork by David Mumford', this.leftX, y += 34);
    ctx.fillText('   All Ladybug Charms', this.leftX, y += 27);
    ctx.fillText('   Modifications to Purple Player', this.leftX, y += 27);

    this.startResumeGameText(gameBoard.getHeight() + GameBoard.TILE_HEIGHT);
};

//---------------------------------
// AttributionSoundsDialog Pseudoclass.
//---------------------------------

// Constructor.
function AttributionSoundsDialog() {
    this.init();
}

AttributionSoundsDialog.prototype = Object.create(Dialog.prototype);
AttributionSoundsDialog.prototype.constructor = AttributionSoundsDialog;

// Pseudoclass properties.
AttributionSoundsDialog.ID = 3;

// Pseudoclass methods.
AttributionSoundsDialog.prototype.contents = function() {
    var y = this.y + 70;
    this.titleText(Dialog.LEFT_ICON + ' Attribution', this.midX, y);

    ctx.font = Dialog.NORMAL_FONT;

    ctx.textAlign = 'left';
    ctx.fillText(Dialog.BULLET + ' All sounds obtained from', this.leftX, y += 40);
    ctx.fillText('   freesound.org - CC BY 3.0 License', this.leftX, y += 27);

    ctx.fillText(Dialog.BULLET + ' Enemy/Player Collisions', this.leftX, y += 34);
    ctx.fillText('   By Leviclasssen, hit_002.wav.', this.leftX, y += 27);

    ctx.fillText(Dialog.BULLET + ' Ladybug Charm drops', this.leftX, y += 34);
    ctx.fillText('    By Yottasounds, pop.wav.', this.leftX, y += 27);

    ctx.fillText(Dialog.BULLET + ' Ladybug Charm pickups', this.leftX, y += 34);
    ctx.fillText('    By EdgardEdition, thud6.wav.', this.leftX, y += 27);

    ctx.fillText(Dialog.BULLET + ' Luckiest Guy Font by Brian J.', this.leftX, y += 34);
    ctx.fillText('    Bonislawsky. Available under', this.leftX, y += 27);
    ctx.fillText('    the Apache 2.0 License', this.leftX, y += 27);

    this.startResumeGameText(gameBoard.getHeight() + GameBoard.TILE_HEIGHT);
};

//---------------------------------
// GameOverDialog Pseudoclass.
//---------------------------------

// Constructor.
function GameOverDialog() {
    var x = GameBoard.TILE_WIDTH / 2;
    var y = gameBoard.getHeight() / 4;

    var width = gameBoard.getWidth();
    var height = gameBoard.getHeight() / 2;

    var radius = 15; // rounded corners.

    this.init(x, y, width, height, radius);

    // The reason the game is over; outta time or lives.
    this.reason = null;
}

GameOverDialog.prototype = Object.create(Dialog.prototype);
GameOverDialog.prototype.constructor = GameOverDialog;

// Pseudoclass properties.
GameOverDialog.OuttaTimeReason = 'Time';
GameOverDialog.OuttaLivesReason = 'Lives';

// Pseudoclass methods.
GameOverDialog.prototype.setReason = function(reason) {
    this.reason = reason;
};

GameOverDialog.prototype.contents = function() {
    var y = this.y + 75;
    this.titleText('Game Over!', this.midX, y);

    if (this.reason !== null) {
        y += 30;
        ctx.font = Dialog.SMALL_FONT;
        ctx.fillText('(Outta ' + this.reason + ')', this.midX, y);
    }

    ctx.font = Dialog.NORMAL_FONT;
    this.startResumeGameText(y, true);
};

//---------------------------------
// Global Helpers.
//---------------------------------

function showGameInfo() {
    if (gameBoard.demoMode) {
        gameBoard.showHelp = true;
        scoreBoard.bannerMessage = null; // clear it out.
    }
    else if (gameBoard.gameMode && (gameBoard.paused || gameBoard.gameOver)) {
        gameBoard.showHelp = true;
        gameBoard.resumeGame = !gameBoard.gameOver;
    }
}

function toggleSound() {
    gameBoard.soundOn = !gameBoard.soundOn;
    document.getElementById('sound').innerHTML = gameBoard.soundOn ? 'Sound On' : 'Sound Off';
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

// Instantiate our Attribution (Artwork) dialog.
var attributionDialog = new AttributionDialog();

// Instantiate our Attribution (Sounds) dialog.
var attributionSoundsDialog = new AttributionSoundsDialog();

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

    var allowedKeys = { 27: 'esc', 32: 'space', 37: 'left', 38: 'up', 39: 'right', 40: 'down', 68: 'debug' };

    gameBoard.handleInput(allowedKeys[e.keyCode]);
    player.handleInput(allowedKeys[e.keyCode], e.ctrlKey);
});