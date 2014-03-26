
var game = new Phaser.Game(800, 600, Phaser.CANVAS, '',
    { preload: preload, create: create, update: update });


// main state
function MainState(game, speed, level, color){
    var moveDone = false;
    var points = 0;
    var cursors;
    var snake=[];
    var direction = 1;
    var cherry;
    var map;
    var layer;
    this.speed = speed;

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

        game.stage.backgroundColor = '#6688ee';
        head = game.add.sprite(200, 0, 'block');
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
        var menu = game.add.text(game.width/2, 400, '- click to start -',
            { font: "40px Arial", fill: "#ffffff", align: "center" });
        game.input.onDown.add(startMain, this);
    };
    function startMain(){
        game.state.start('MainState');
    }

};



var mainState = new MainState(game, 4, "level2", "lightBlue");
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

