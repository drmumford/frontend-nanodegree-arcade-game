// Enemies our player must avoid
var Enemy = function (id) {
    this.id = id;

    // Row; a random number 1-3;
    this.row = Math.floor(Math.random() * 3) + 1;

    // Initial location.
    this.x = -100;
    this.y = this.row * 82;

    // Updates to ignore before becoming active.
    this.delayCounter = Math.floor(Math.random() * 100) + 1;
    this.active = false;

    console.log("delayCounter = " + this.delayCounter);

    // Color.
    this.color = "red";

    // Speed.
    var minSpeed = 75;
    var maxSpeed = 300;
    this.speed = minSpeed + Math.floor(Math.random() * (maxSpeed - minSpeed + 1));
    if (this.speed > maxSpeed) {
        this.speed = maxSpeed;
    }
    console.log("Speed is " + this.speed);

    // Direction.
    this.direction = Math.floor(Math.random() * 2) + 1;

    // The image/sprite for our enemies.
    this.sprite = 'images/enemy-bug.png';
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
    // increment our delay counter.

    if (this.active) {
        // Multiply movement by the dt parameter which ensures
        // the game runs at the same speed for all computers.
        this.x += (this.speed * dt);
        if (this.direction) {
            // Enemies go left-to-right.
            if (this.x > (5 * 100)) {
                this.x = -100;

                // Reset properties!
                this.row = Math.floor(Math.random() * 3) + 1;
                this.color = "red";
                this.x = -100;
                this.y = this.row * 82;
                this.delayCounter = Math.floor(Math.random() * 100) + 1;
                this.active = false;
                
                var minSpeed = 75;
                var maxSpeed = 300;
                this.speed = minSpeed + Math.floor(Math.random() * (maxSpeed - minSpeed + 1));
                if (this.speed > maxSpeed) {
                    this.speed = maxSpeed;
                }

                console.log("Bug " + this.id + ": " +
                    "Row " + this.row + ", " +
                    "Color = " + this.color + ", " +
                    "Delay = " + this.delayCounter + ", " +
                    "Speed = " + this.speed);
            }
        }
        else {
            // Enemies go right-to-left.
        }
    }
    else {
        this.delayCounter--;
        if (this.delayCounter === 0) {
            this.active = true;
        }
    }
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// The player class; requires an update(), render() and handleInput() methods.
var player = function () {
    // Initial location.
    this.x = 2 * 100;
    this.y = 4 * 82;

    // The image/sprite for our player.
    this.sprite = 'images/char-boy.png';
}

// Update the player's position; basically detect collisions
// and reset the player position, if necessary.
player.prototype.update = function () {
    // Determine if our player shares a space
    // with any enemies.
}

player.prototype.handleInput = function (key) {
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
player.prototype.render = function () {
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
var player = new player();

// Handle 'keyup' events for allowed keys.
document.addEventListener('keyup', function (e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});