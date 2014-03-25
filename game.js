
var game = new Phaser.Game(800, 600, Phaser.CANVAS, '',
    { preload: preload, create: create, update: update });


// main state
function MainState(game, speed){
    var moveDone = false;
    var cursors;
    var snake=[];
    var direction = 1;
    var cherry;
    this.speed = speed;

    this.preload = function(){
        game.load.image('block', 'assets/block.png');
        game.load.image('cherry', 'assets/cherry.png');
    };

    this.create = function(){
        game.stage.backgroundColor = '#6688ee';
        head = game.add.sprite(200, 200, 'block');
        snake.push(head);
        snakeInit(5);

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
        detectCollision();
    };

    function createCherry(){
        var blockWidth = snake[0].width;
        var gridWidth = game.width/blockWidth;
        var gridHeight = game.height/blockWidth;
        cherry = game.add.sprite(game.rnd.integerInRange(0, gridWidth-blockWidth)*blockWidth,
            game.rnd.integerInRange(0, gridHeight-blockWidth)*blockWidth, 'cherry');
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
    }

    function snakeInit(length){
        for (var i = 1; i < length; i++){
            var b = game.add.sprite(200-snake[0].width*i, 200, 'block');
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
        if (snake[0].x < 0 || snake[0].y < 0 || snake[0].x >= game.world.width || snake[0].y >= game.world.height){
            snake=[];
            direction = 1;
            game.state.start('MenuState');
        }
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
    }

    function handleCursors(){
        if (cursors.right.isDown && direction!== 3)
            direction = 1;
        else if (cursors.down.isDown && direction!== 4)
            direction = 2;
        else if (cursors.left.isDown && direction!== 1)
            direction = 3;
        else if (cursors.up.isDown && direction!== 2)
            direction = 4;
        moveDone = false;
    }


};


// menu state
function MenuState(game){
    this.create = function(){
        var menu = game.add.text(game.width/2, 400, '- click to start -',
            { font: "40px Arial", fill: "#ffffff", align: "center" });
        game.input.onDown.add(startMain, this);
    };
    function startMain(){
        game.state.start('MainState');
    }

};



var mainState = new MainState(game, 20);
game.state.add('MainState', mainState);
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

