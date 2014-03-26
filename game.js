
var game = new Phaser.Game(800, 600, Phaser.CANVAS, '',
    { preload: preload, create: create, update: update });

// main state
function MainState(game, speed, level, color, background){
    var moveDone = false;
    var cursors;
    var snake=[];
    var direction = 1;
    var cherry;
    var map;
    var layer;
    var snakeLength;
    var lengthText;
    this.level = level;
    this.speed = speed;
    this.background = background;

    this.preload = function(){
        game.load.image('block', 'assets/block.png');
        game.load.image('cherry', 'assets/cherry.png');
        game.load.tilemap(level, "assets/levels/"+level+".json", null, Phaser.Tilemap.TILED_JSON);
        game.load.image("tiles", "assets/levels/"+color+".png", 20, 20);
    };

    this.create = function(){
        map = game.add.tilemap(level);
        map.addTilesetImage(color, "tiles");
        layer = map.createLayer("walls");
        layer.resizeWorld();

        game.stage.backgroundColor = this.background;
        head = game.add.sprite(200, 0, 'block');
        snake.push(head);
        snakeInit(4);
        snakeLength = 5;
        createLengthText();

        createCherry();
        cursors = game.input.keyboard.createCursorKeys();
        game.time.events.loop(Phaser.Timer.SECOND/this.speed, moveSnake, this);

    };

    this.update = function(){

        if (checkOverlap(snake[0], cherry)){
            eatCherry();
        }
        if (moveDone == true){
            handleCursors();
        }
        if (snakeLength === 6){
            var graphics = game.add.graphics(0,0);
            graphics.beginFill("0x"+this.background.substr(1), 0.2);
            graphics.drawRect(0, 0, game.width, game.height);

            createWinText(parseInt(this.level.substr(this.level.length-1)));
            game.time.events.add(Phaser.Timer.SECOND * 3, transitionNextLevel, this);

            return;
        }

        detectCollision();

    };

    this.render = function(){
        lengthText.text ='length: ' + snakeLength;
    }

    function transitionNextLevel(){
        var nextLevel = parseInt(this.level.substr(this.level.length-1))+1;
        game.state.start('Level'+ nextLevel);
    }

    function createWinText(level){
        level = level + 1;
        var winText = game.add.text(game.world.centerX, 250, 'You Win!',
            {fill: "#ffffff", align: "center"});
        winText.font = 'Arial Black';
        winText.fontSize = 50;
        winText.anchor.set(0.5);

        var description = game.add.text(game.world.centerX, 350, 'Next Level: '+level+
            '\nStarting in 3 seconds',
            {fill: "#ffffff", align: "center"});
        description.font = 'Arial';
        description.fontSize = 30;
        description.anchor.set(0.5);
    }

    function createLengthText(){
        lengthText = game.add.text(game.world.centerX, 10, 'length: '+ snakeLength,
            {fill: "#ffffff", align: "center"});
        lengthText.font = 'Arial';
        lengthText.fontSize = 25;
        lengthText.alpha = 0.8;
        lengthText.anchor.set(0.5);
    }

    function createCherry(){
        var blockWidth = snake[0].width;
        var gridWidth = game.width/blockWidth;
        var gridHeight = game.height/blockWidth;
        do {
            cherry = game.add.sprite(game.rnd.integerInRange(0, gridWidth-1)*blockWidth,
                game.rnd.integerInRange(0, gridHeight-1)*blockWidth, 'cherry');
            if (map.getTile(cherry.x/cherry.width, cherry.y/cherry.width)!==null || checkCherryOverlap()){
                cherry.destroy();
            }
        } while (map.getTile(cherry.x/cherry.width, cherry.y/cherry.width)!==null || checkCherryOverlap())
    }

    function checkCherryOverlap(){
        snake.forEach(function(block){
            if (checkOverlap(cherry, block)===true){
                return true;
            }
        })
        return false;
    }

    function checkOverlap(spriteA, spriteB) {
        var boundsA = spriteA.getBounds();
        var boundsB = spriteB.getBounds();
        return Phaser.Rectangle.containsRect(boundsA, boundsB);
    }


    function eatCherry(){
        cherry.destroy();
        createCherry();
        var tail = snake[snake.length-1];
        b = game.add.sprite(tail.x, tail.y, 'block');
        snake.push(b);
        snakeLength+=1;
    }

    function snakeInit(length){
        for (var i = 1; i < length; i++){
            var b = game.add.sprite(200-snake[0].width*i, 0, 'block');
            snake.push(b);
        }
    }

    function moveSnake(){
        snake.pop().destroy();
        var b;
        var head = snake[0];
        if (direction == 1)
            b = game.add.sprite(head.x+ head.width, head.y, 'block');
        if (direction == 2)
            b = game.add.sprite(head.x, head.y+head.width, 'block');
        if (direction == 3)
            b = game.add.sprite(head.x- head.width, head.y, 'block');
        if (direction == 4)
            b = game.add.sprite(head.x, head.y-head.width, 'block');
        snake.unshift(b);
        moveDone = true;
    }

    function detectCollision(){
        var collided = false;
        snake.slice(1).forEach(function(block){
            if (collided === false){
                if (checkOverlap(snake[0], block)){
                    snake=[];
                    direction = 1;
                    game.state.start('MenuState');
                    collided = true;
                }
            }
        });
        if (collided === false){
            if (map.getTile(snake[0].x/snake[0].width, snake[0].y/snake[0].width)!==null){
                snake=[];
                direction = 1;
                game.state.start('MenuState');
                collided = true;
            }
            else if (snake[0].x < 0 || snake[0].y < 0 || snake[0].x >= game.world.width || snake[0].y >= game.world.height){
                snake=[];
                direction = 1;
                game.state.start('MenuState');
            }
        }
    }

    function handleCursors(){
        if (cursors.right.isDown && direction!== 3){
            direction = 1;
            moveDone = false;
        }
        else if (cursors.down.isDown && direction!== 4){
            direction = 2;
            moveDone = false;
        }
        else if (cursors.left.isDown && direction!== 1){
            direction = 3;
            moveDone = false;
        }
        else if (cursors.up.isDown && direction!== 2){
            direction = 4;
            moveDone = false;
        }
    }


};


// menu state
function MenuState(game){

    this.create = function(){
        game.stage.backgroundColor = "#6688ee";
        var title = game.add.text(game.world.centerX, 250, 'PHASER\nSNAKE',
            {fill: "#ffffff", align: "center"});
        title.font = 'Arial Black';
        title.fontSize = 50;
        title.fontWeight = "bold";
        title.anchor.set(0.5);

        var description = game.add.text(game.world.centerX, 400, 'press UP key to start',
            {fill: "#ffffff", align: "center"});
        description.font = 'Arial';
        description.fontSize = 30;
        description.anchor.set(0.5);


    };

    this.update = function(){
        if (game.input.keyboard.isDown(Phaser.Keyboard.UP))
        {
            startMain();
        }
    };
    function startMain(){
        game.state.start('Level1');
    }

};



game.level1 = new MainState(game, 10, "level1", "yellow", "#aaaaaa");
game.level2 = new MainState(game, 10, "level2", "lightBlue", "#6688ee")
game.state.add('Level1', game.level1);
game.state.add('Level2', game.level2);
game.state.add('MenuState', MenuState);


// game functions
function preload(){

}
function create(){

    game.state.start('MenuState');
}



function update(){

}



function restart(){

}

