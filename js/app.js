//
// Enemy Pseudoclass.
//

var Enemy = function(id) {
    this.id = id;

    // Initialize/reset enemy properties.
    this.renewProperties = function() {
        this.row = Math.floor(Math.random() * 3) + 1; // Row 1-3.

    this.x = -100;
    this.y = (this.row * 82) - 18;

        // Game ticks to ignore before becoming active. This mixes up
        // when a bug reappears after traversing a row of the game board.
        this.delay = Math.floor(Math.random() * 100) + 1;

    // Speed.
    var minSpeed = 75;
    var maxSpeed = 300;
    this.speed = minSpeed + Math.floor(Math.random() * (maxSpeed - minSpeed + 1));
    if (this.speed > maxSpeed) {
        this.speed = maxSpeed;
    }

    // Direction.
    this.direction = Math.floor(Math.random() * 2) + 1;

        // Color.
        this.color = "red";

    // The image/sprite for our enemies.
    this.sprite = 'images/enemy-bug.png';
        //this.width = Resources.get(this.sprite).width;
        //this.height = Resources.get(this.sprite).height;

        console.log("Bug " + this.id + ": " +
            "Row " + this.row + ", " +
            "Color = " + this.color + ", " +
            "Delay = " + this.delay + ", " +
            "Speed = " + this.speed);
    }

    this.renewProperties();
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    if (this.delay > 0) {
        this.delay--;
    } else {
        // Multiply movement by the dt parameter which ensures
        // the game runs at the same speed for all computers.
        this.x += (this.speed * dt);
        if (this.direction) {
            // Enemies go left-to-right.
            if (this.x > (5 * 100)) {
                this.renewProperties();
        }
        } else {
            // Enemies go right-to-left.
        }
    }
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

//
// Player Pseudoclass.
//
var Player = function() {
    // Initial location.
    this.x = 2 * 100;
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

// Instantiate enemy objects.
var allEnemies = [];
allEnemies.push(new Enemy(1));
allEnemies.push(new Enemy(2));
allEnemies.push(new Enemy(3));
allEnemies.push(new Enemy(4));
allEnemies.push(new Enemy(5));

// Instantiate our single player.
var player = new Player();

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