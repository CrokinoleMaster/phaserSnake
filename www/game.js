
var game = new Phaser.Game(1600, 1200, Phaser.CANVAS, "snake",
    { preload: preload, create: create, update: update }, false, false);

// main state
function MainState(game, speed, level, background, textColor) {
    var currentState = this;
    var moveDone = false;
    var cursors;
    var snake=[];
    var direction = 1;
    var cherry;
    var map;
    var layer;
    var snakeLength;
    var lengthText;
    var lengthToWin = 6;
    var eatSound;
    var dieSound;
    var moveSound;
    var winSound;
    var collided = false;
    this.loss = false;
    this.level = level;
    this.speed = speed;
    this.background = background;

    this.preload = function(){
        game.load.tilemap(level, "assets/levels/"+level+".json", null, Phaser.Tilemap.TILED_JSON);
        game.load.image("tiles", "assets/levels/"+level+".png", 20, 20);
    };

    this.create = function(){
        map = game.add.tilemap(level);
        map.addTilesetImage("wall", "tiles");
        layer = map.createLayer("walls");
        layer.resizeWorld();
        eatSound = game.add.audio('eat');
        dieSound = game.add.audio('die');
        moveSound = game.add.audio('move');
        winSound = game.add.audio('win');

        game.stage.backgroundColor = this.background;
        head = game.add.sprite(400, 0, 'block');
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
        if (snakeLength === lengthToWin && this.loss === false && this.level !== 'level10'){
            winSound.play();
            var level = parseInt(this.level.substr(5));
            var nextLevel = level+1;
            var graphics = game.add.graphics(0,0);
            graphics.beginFill("0x"+this.background.substr(1), 0.8);
            graphics.drawRect(0, 0, game.width, game.height);

            window.localStorage.setItem('level', 'level'+nextLevel);
            createWinText(level);
            game.time.events.add(Phaser.Timer.SECOND * 3, transitionNextLevel, this);
            currentState.loss = true;

            return;
        }
        if (snakeLength === lengthToWin && this.loss === false && this.level === 'level10'){
            winSound.play();
            var graphics = game.add.graphics(0,0);
            graphics.beginFill("0x"+this.background.substr(1), 1);
            graphics.drawRect(0, 0, game.width, game.height);

            var winText = game.add.text(game.world.centerX, 500, 'FIN!',
                {fill: textColor, align: "center"});
            winText.font = 'Arial Black';
            winText.fontSize = 100;
            winText.anchor.set(0.5);

            var description = game.add.text(game.world.centerX, 700, 'THANK YOU!\n'+
                'You have completely completed my game\n'+
                'I did not think anyone would actually spend this much time on it.\n'+
                'Perhaps try it on Python Speed??\n : )',
                {fill: textColor, align: "center"});
            description.font = 'Arial';
            description.fontSize = 50;
            description.anchor.set(0.5);
            currentState.loss = true;

            game.time.events.add(Phaser.Timer.SECOND * 10, transitionMenu, this);

            return;
        }
        if (snakeLength < lengthToWin) {
            detectCollision();
        }

    };

    this.render = function(){
        lengthText.text ='length: ' + snakeLength;
    };

    function transitionNextLevel(){
        snake = [];
        direction = 1;
        currentState.loss = false;
        snakeLength = 5;
        var nextLevel = parseInt(this.level.substr(this.level.length-1))+1;
        game.state.start('level'+ nextLevel);
    }

    function createWinText(level){
        level = level + 1;
        var winText = game.add.text(game.world.centerX, 500, 'You Win!',
            {fill: textColor, align: "center"});
        winText.font = 'Arial Black';
        winText.fontSize = 100;
        winText.anchor.set(0.5);

        var description = game.add.text(game.world.centerX, 700, 'Next Level: '+level+
            '\nStarting in 3 seconds',
            {fill: textColor, align: "center"});
        description.font = 'Arial';
        description.fontSize = 60;
        description.anchor.set(0.5);
    }

    function createLengthText(){
        lengthText = game.add.text(game.world.centerX, 30, 'length: '+ snakeLength,
            {fill: textColor, align: "center"});
        lengthText.font = 'Arial';
        lengthText.fontSize = 50;
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
        } while (map.getTile(cherry.x/cherry.width, cherry.y/cherry.width)!==null || checkCherryOverlap());
    }

    function checkCherryOverlap(){
        snake.forEach(function(block){
            if (checkOverlap(cherry, block)===true){
                return true;
            }
        });
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
        if (lengthToWin!==snakeLength)
            eatSound.play();
    }

    function snakeInit(length){
        for (var i = 1; i < length; i++){
            var b = game.add.sprite(400-snake[0].width*i, 0, 'block');
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
        snake.slice(1).forEach(function(block){
            if (currentState.loss === false){
                if (checkOverlap(snake[0], block)){
                    showGG();
                    currentState.loss = true;
                }
            }
        });
        if (currentState.loss === false){
            if (map.getTile(snake[0].x/snake[0].width, snake[0].y/snake[0].width)!==null){
                showGG();
                currentState.loss = true;
            }
            else if (snake[0].x < 0 || snake[0].y < 0 || snake[0].x >= game.world.width || snake[0].y >= game.world.height){
                showGG();
                currentState.loss = true;
            }
        }
    }

    function showGG(){
        dieSound.play();
        currentState.loss = true;
        var graphics = game.add.graphics(0,0);
        graphics.beginFill("0x"+currentState.background.substr(1), 0.8);
        graphics.drawRect(0, 0, game.width, game.height);

        var lossText = game.add.text(game.world.centerX, 500, 'You Died!',
            {fill: textColor, align: "center"});
        lossText.font = 'Arial Black';
        lossText.fontSize = 100;
        lossText.anchor.set(0.5);

        var description = game.add.text(game.world.centerX, 700, 'Returning to menu in 3 seconds',
            {fill: textColor, align: "center"});
        description.font = 'Arial';
        description.fontSize = 60;
        description.anchor.set(0.5);

        game.time.events.add(Phaser.Timer.SECOND * 3, transitionMenu, currentState);
    }

    function transitionMenu(){
        snake = [];
        direction = 1;
        currentState.loss = false;
        snakeLength = 5;
        game.state.start('MenuState');
    }


    function handleCursors(){
        var oldDir = direction;
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
        if (direction!== oldDir){
            moveSound.play();
        }
    }


}


// menu state
function MenuState(game){

    var worm;
    var snake;
    var python;
    var speedSelected = 2;
    var left;
    var right;
    var selectSound;
    var commitSound;

    this.create = function(){
        selectSound = game.add.audio('select');
        commitSound = game.add.audio('commit');

        game.stage.backgroundColor = "#0B486B";
        var title = game.add.text(game.world.centerX, 460, 'PHASER\nSNAKE',
            {fill: "#FE4365", align: "center"});
        title.font = 'Arial Black';
        title.fontSize = 100;
        title.fontWeight = "bold";
        title.anchor.set(0.5);

        createSnakeGraphic();

        var previousLevel = localStorage.getItem('level');
        var message = 'press UP key to continue your progress\n'+
            'press DOWN key to start over at level 1\n'+
            'LEFT and RIGHT to select speed';
        if (previousLevel){
            message+= '\n\nprevious level: '+ previousLevel.substr(5);
        }
        else {
            message+= '\n\n';
        }
        var description = game.add.text(game.world.centerX, 800, message,
            {fill: "#79BD9A", align: "center"});
        description.font = 'Arial';
        description.fontSize = 60;
        description.anchor.set(0.5);

        createSpeedText();

        // create speed select keys
        left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        left.onDown.add(function(){
            if (speedSelected > 1){
                selectSound.play();
                speedSelected-=1;
            }
        }, this);
        right.onDown.add(function(){
            if (speedSelected < 3){
                selectSound.play();
                speedSelected+=1;
            }
        }, this);

        commitSound.play();
    };

    this.update = function(){

        if ( left || right){
            switch (speedSelected){
                case 1:
                    worm.fill = "#FE4365";
                    snake.fill = "#79BD9A";
                    python.fill = "#79BD9A";
                    break;
                case 2:
                    snake.fill = "#FE4365";
                    worm.fill = "#79BD9A";
                    python.fill = "#79BD9A";
                    break;
                case 3:
                    python.fill = "#FE4365";
                    worm.fill = "#79BD9A";
                    snake.fill = "#79BD9A";
                    break;
                default:
                    worm.fill = "#FE4365";
                    snake.fill = "#79BD9A";
                    python.fill = "#79BD9A";
            }
        }
        if (game.input.keyboard.isDown(Phaser.Keyboard.UP))
        {
            continueGame();
        }
        if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN))
        {
            commitSound.play();
            startNewGame();
        }
    };

    this.shutdown = function(){
        left.onDown.removeAll();
        right.onDown.removeAll();
        speedSelected = 2;
    }

    function createSpeedText(){
        worm = game.add.text(game.world.centerX-400, 870, "WORM",
            {fill: "#79BD9A", align: "center"});
        worm.font = 'Arial Black';
        worm.fontSize = 50;
        worm.anchor.set(0.5);

        snake = game.add.text(game.world.centerX, 870, "SNAKE",
            {fill: "#FE4365", align: "center"});
        snake.font = 'Arial Black';
        snake.fontSize = 50;
        snake.anchor.set(0.5);

        python = game.add.text(game.world.centerX+400, 870, "PYTHON",
            {fill: "#79BD9A", align: "center"});
        python.font = 'Arial Black';
        python.fontSize = 50;
        python.anchor.set(0.5);
    }

    function createSnakeGraphic(){
        var graphics = game.add.graphics(0,0);
        graphics.beginFill("0x"+"79BD9A");
        graphics.drawRect(100, 100, 40, 300);
        graphics.drawRect(100, 100, 1340, 40);
        graphics.drawRect(1400, 100, 40, 1000);
        graphics.drawRect(160, 1060, 1240, 40);
        graphics.drawRect(160, 960, 40, 100);
        graphics.beginFill("0x" + "C02942");
        graphics.drawRect(100, 460, 40, 40);
    }

    function continueGame(){
        var level = localStorage.getItem('level');
        createLevelInstances();
        if (level){
            commitSound.play();
            game.state.start(level);
        }
    }

    function startNewGame(){
        createLevelInstances();
        game.state.start('level1');
    }

    function createLevelInstances(){
        var speed = 10;
        switch (speedSelected){
            case 1:
                speed = 5;
                break;
            case 2:
                speed = 10;
                break;
            case 3:
                speed = 20;
                break;
        }
        game.level1.speed = speed;
        game.level2.speed = speed;
        game.level3.speed = speed;
        game.level4.speed = speed;
        game.level5.speed = speed;
        game.level6.speed = speed;
        game.level7.speed = speed;
        game.level8.speed = speed;
        game.level9.speed = speed;
        game.level10.speed = speed;

    }
}


game.level1 = new MainState(game, 10, "level1", "#E4C8BC", "#B58E87");
game.level2 = new MainState(game, 10, "level2", "#E0E4CC", "#F38630");
game.level3 = new MainState(game, 10, "level3", "#3B8686", "#F9CDAD");
game.level4 = new MainState(game, 10, "level4", "#542437", "#D95B43");
game.level5 = new MainState(game, 10, "level5", "#036564", "#CDB380");
game.level6 = new MainState(game, 10, "level6", "#C5E0DC", "#774F38");
game.level7 = new MainState(game, 10, "level7", "#D5DED9", "#948C75");
game.level8 = new MainState(game, 10, "level8", "#F56991", "#EFFAB4");
game.level9 = new MainState(game, 10, "level9", "#413E4A", "#B38184");
game.level10 = new MainState(game, 10, "level10", "#0D6759", "#A0C55F");


game.state.add('level1', game.level1);
game.state.add('level2', game.level2);
game.state.add('level3', game.level3);
game.state.add('level4', game.level4);
game.state.add('level5', game.level5);
game.state.add('level6', game.level6);
game.state.add('level7', game.level7);
game.state.add('level8', game.level8);
game.state.add('level9', game.level9);
game.state.add('level10', game.level10);
game.state.add('MenuState', MenuState);


// game functions
function preload(){
    game.stage.smoothed = false;
    screenResize();
    game.ready = false;
    game.stage.backgroundColor = "#0B486B";
    var graphics = game.add.graphics(0,0);
    graphics.beginFill("0x"+"79BD9A");
    graphics.drawRect(100, 100, 40, 300);
    graphics.drawRect(100, 100, 1340, 40);
    graphics.drawRect(1400, 100, 40, 1000);
    graphics.drawRect(160, 1060, 1240, 40);
    graphics.drawRect(160, 960, 40, 100);
    graphics.beginFill("0x" + "C02942");
    graphics.drawRect(100, 460, 40, 40);

    var title = game.add.text(game.world.centerX, 230, 'LOADING...',
        {fill: "#FE4365", align: "center"});
    title.font = 'Arial Black';
    title.fontSize = 50;
    title.fontWeight = "bold";
    title.anchor.set(0.5);

    game.load.image('block', 'assets/block.png');
    game.load.image('cherry', 'assets/cherry.png');
    game.load.audio('eat', 'assets/sounds/eat.wav');
    game.load.audio('die', 'assets/sounds/die.wav');
    game.load.audio('select', 'assets/sounds/select.wav');
    game.load.audio('commit', 'assets/sounds/commit.wav');
    game.load.audio('move', 'assets/sounds/move.wav');
    game.load.audio('win', 'assets/sounds/win.wav');
}

function create(){


    window.addEventListener('resize', function(event){
        screenResize();
    });
}

function screenResize(){
     // screen scaling
    Phaser.Canvas.setSmoothingEnabled(game.context, false);
    game.scale.setShowAll();
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVeritcally = true;
    game.scale.refresh();
}



function update(){
    if (game.ready === false){
        game.state.start('MenuState');
        game.ready = true;
    }

}



function restart(){

}

