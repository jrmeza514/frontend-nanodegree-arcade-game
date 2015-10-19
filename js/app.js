/**
    Random Integer Generating Utiity
    Min: Inclusive
    Max: Exclusive
*/
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
/**
    Enemies The Player Must Avoid
*/
var Enemy = function() {
    /**
        Image For The Currently Used Enemy
        Any Custom Images Must be preloaded With the
        Resources Utility
    */
    this.sprite = 'images/enemy-bug.png';
    /**
        Enemies Grid X and Y Coordinates
        Note : Grid Coordinates are to be
        Converted To Pixel Units When Rendering
    */
    this.x = -1;
    /**
        Spawnng Frid Row Is Randomly Generated.
    */
    this.y = getRandomInt(1, 4);
    /**
        The Enemy Will Move At one of Three Randomly
        Generated Speeds Along Their Randomly Assigned
        Row
    */
    this.speed = getRandomInt(1, 4);
};
/**
    Update The enemy's Position based on Their Assigned Speeds
    Note: Each Enemy Is REsponsible for Handlign Collision
    Detextion Against the Player Alone
*/
Enemy.prototype.update = function(dt) {
    /**
        Progressively Move Enemy based on
        Time and Speed
    */
    this.x += dt * (this.speed / 4);

    /**
        Collision Detection:
        Calculate Each Entities Collision Box
        and add a constant to allow for a small
        margin of error
    */
    var enemyXMin = this.x * 101 + 5;
    var enemyXMax = this.x * 101 + 101 - 5;
    var enemyYMin = this.y * 83 + 5 + 5;
    var enemyYMax = this.y * 83 + 83 - 5;

    var playerXMin = player.x * 101 + 10;
    var playerXMax = player.x * 101 + 101 - 10;
    var playerYMin = player.y * 83 + 5;
    var playerYMax = player.y * 83 + 83 - 5;

    /**
        Check If Enemy and Player X-Coordinates Overlap
    */
    if ((playerXMin >= enemyXMin && playerXMin <= enemyXMax) || ( playerXMax <= enemyXMax && playerXMax >= enemyXMin )) {
        /**
            Check If Enemy and Player Y-Coordinates Overlap
        */
        if ((playerYMin >= enemyYMin && playerYMin <= enemyYMax) || ( playerYMax <= enemyYMax && playerYMax >= enemyYMin )) {
            /*
                We have A Collision!

                Invoke The Restart Function To Reset The Game
            */
            restart();
        }
    }

};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x * 101, this.y * 83 - 20);
};

/**
    Player Class
*/
var Player = function() {
    /**
        Image For The Currently Used Enemy
        Any Custom Images Must be preloaded With the
        Resources Utility
    */
    this.sprite = "images/char-boy.png";
    /**
        These Are The X and Y Coordinates at which the player should be
        at any give time.
    */
    this.posX = 2;
    this.posY = 5;
    /*
       These are The X and Y Coordinates at which the plyer actually is
       These Values Gradually Approach the ones above to allow for a
       smooth movement animation
    */
    this.x = this.posX;
    this.y = this.posY;
};
/**
    The update Method Takes Care of Updating player's Location
*/
Player.prototype.update = function() {
    /**
        Udate The X and Y Coordinates To Approach The Intended Value
        This will Draw the player Several Times In Between Positions
        For a More Fluid Experience
    */
    this.x += (1 / 4) * (this.posX - this.x);
    this.y += (1 / 4) * (this.posY - this.y);


    /*
        If The Difference Between the Values is Miniscule,
        Set Them To The Exaxct Value To Avoid Infinite Recursive
        Addition
    */
    if (Math.abs(this.posX - this.x) < 0.001) {
        this.x = this.posX;
    }
    if (Math.abs(this.posY - this.y) < 0.001) {
        this.y = this.posY;
    }
    /*
        Once User Is Done Animationg Into The Water,
        TELEPORT Back To The Starting Position
    */
    if (this.y === 0) {
        reachedWater();
    }
};
/*
    Simply Draws The player Every Frame
*/
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x * 101, this.y * 83 - 10);
};
/*
    Translate User input into Movement In The Game Grid System
*/
Player.prototype.handleInput = function(keycode) {
    switch (keycode) {
        case 'left':
            this.posX -= 1;
            break;
        case 'right':
            this.posX += 1;
            break;
        case 'up':
            this.posY -= 1;
            break;
        case 'down':
            this.posY += 1;
            break;
    }
    /**
        Ensure That The Player Remains Within The
        Bounds of The Canvas.
    */
    if (this.posX < 0) {
        this.posX = 0;
    }

    if (this.posX > 4) {
        this.posX = 4;
    }

    if (this.posY < 0) {
        this.posY = 0;
    }

    if (this.posY > 5) {
        this.posY = 5;
    }
};
// Create The Player
var player = new Player();
/*
    Create An Array To Hold All Active Enemies
*/
var allEnemies = [];
// Create A  First Enemy That Will Spawn Imediately
var firstEnemy = new Enemy();
allEnemies.push(firstEnemy);
// Keep Track Of What Row The Last Enemy Spawned To avoid
// Overusing The Same Row
var lastSpawnRow = firstEnemy.y;
// Set The Spawn Frequencty in Milliseconds for how often an
//Enemy Should Spawn
var spawnFrequency = 5000;
// Spawn New Enemies At The Specified Frequency
setInterval(function() {
    // create new enemy
    var enemy = new Enemy();
    // make sure not to use the last row
    if (enemy.y == lastSpawnRow) {
        // reassign a row randomly
        enemy.y = getRandomInt(1, 4);
    }
    // keep track of last row
    lastSpawnRow = enemy.y;
    // add new enemy to array
    allEnemies.push(enemy);
    //Ensure That all Enemies that are out of the frame
    //Get Disposed of the Avoid Long Term
    //Performance Drops
    removeEnemiesOutOfFrame();

}, spawnFrequency);


// handle User Input For Controlling The Player
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    // Send The Player input As Plain Text
    player.handleInput(allowedKeys[e.keyCode]);
});

/**
    Calculate The Enemies Position. If ti is Out Of The Frame,
    Remove It.
*/
function removeEnemiesOutOfFrame() {
    // Iterate Through Enemies
    for (var x = 0; x < allEnemies.length; x++) {
        var en = allEnemies[x];
        // If Grid X Position is > 7
        // Remove From Stack
        if (en.x > 7) {
            // Remove The Enemy
            allEnemies.splice(x, 1);
            // Break The Loop and Recursively
            // Repeat the Process Untill All
            // Useless Enemies Are Gone
            removeEnemiesOutOfFrame();
            break;
        }
    }
}
/**
    Check For custom Character Selection
    And Uodate Player
*/
window.onload = function() {
    var chars = document.getElementsByClassName("char-change");
    for (var i = 0; i < chars.length; i++) {
        chars[i].addEventListener("click", function() {
            player.sprite = this.name;
        });
    }
};
/**
    Clear All Enemies And Set The Player Back To
    The Starting Position.
*/
function restart() {
    player.posX = 2;
    player.posY = 5;
    allEnemies.splice(0);
    // Create The First New Enemy And Start Over
    firstEnemy = new Enemy();
    lastSpawnRow = firstEnemy.y;
    allEnemies.push(firstEnemy);
}
/**
    Teleports Player Back to The Starting Position Without
    Restarting The Game
*/
function reachedWater() {
    player.posX = 2;
    player.posY = 5;
    player.x = 2;
    player.y = 5;
}