// console.log(Phaser);

let gameScene = new Phaser.Scene('Game');

let config = {
    width: 800,
    height:600,
    type:Phaser.AUTO,
    backgroundColor: 0x444444,
    scene:gameScene,

    // *********************************** Add Physics ***********************************
// ============>>> type of physics in phaser3 ------>>> matter,arcade,impact
    physics:{
        default:"arcade",
        arcade:{
            gravity:{ y: 310 },
            debug:false
        }
    }
}

let text,player,cursors,platforms,coins,coronas,gameOver,score=0,scoreText;
// 1. scene -> preload, create,update
// assets preload
gameScene.preload = function(){
    this.load.spritesheet("player",".//assets//sprite//char.png",{frameWidth:40,frameHeight:45});
    this.load.spritesheet("coin",".//assets//sprite//coin.png",{frameWidth:30,frameHeight:30});
    this.load.image("platform",".//assets//sprite//platform.png");
    this.load.image("corona",".//assets//sprite//corona.png");
    this.load.audioSprite("sfx",'.//assets//audio//fx_mixdown.json',[
        './/assets//audio//fx_mixdown.ogg',
        './/assets//audio//fx_mixdown.mp3'
    ])
}

// ===========>>> create -> game introduce assets , entities
gameScene.create = function(){
    // text = this.add.text(300,200,"Hello Phaser",{fontSize:"32px"});
    player = this.physics.add.sprite(250,200,"player");
    player.setFrame(4);

    platforms = this.physics.add.staticGroup();

    // ===============>>>> ground
    platforms.create(50,590,"platform").setScale(2,0.7).refreshBody();
    platforms.create(215,110,"platform").setScale(0.2,0.3).refreshBody();
    platforms.create(260,390,'platform').setScale(0.2,0.3).refreshBody();
    platforms.create(555,200,'platform').setScale(0.2,0.3).refreshBody();


 // *********************************** Coins ***********************************
 coins = this.physics.add.group({
    key:"coin",
    repeat:10,
    setXY:{ x: 20 , y: 0 , stepX: 70}
})


 // *********************************** Corona ***********************************
 coronas = this.physics.add.group();
 createCorona();


    // *********************************** Animation ***********************************

    // ===============>>> Animation create
    this.anims.create({
        key:"right",
        frames:this.anims.generateFrameNames("player",{ start: 0,end: 9}),
        frameRate:20,
        repeat:-1 
    })

    this.anims.create({
        key:"left",
        frames:this.anims.generateFrameNames("player",{start:10,end:19}),
        frameRate:20,
        repeat:-1
    });

    this.anims.create({
        key:"idle",
        frames:[{key:"player", frame:4}],
        frameRate:20
    })

    this.anims.create({
        key: "ljump",
        frames: [{key:"player", frame:19}],
        frameRate: 20
    })

    this.anims.create({
        key: "rjump",
        frames: [{key:"player", frame:1}],
        frameRate: 20
    })

    this.anims.create({
        key:"shine",
        frames:this.anims.generateFrameNames("coin",{start:0,end:9}),
        frameRate:20,
        repeat:-1 
    });
    coins.playAnimation("shine");
    // player.anims.play("right");
    // player.anims.play("left");

    // *********************************** Collision ***********************************
    player.setCollideWorldBounds(true);
    this.physics.add.collider(platforms,player);
    this.physics.add.collider(platforms,coins);
    this.physics.add.collider(platforms,coronas);
    this.physics.add.collider(player,coins,collectCoin,null,this);
    this.physics.add.collider(player,coronas,hitCorona,null,this);

    // score
    scoreText = this.add.text(16,16,'SCORE:0',{fontSize:"16px",fill:"white"});

    // ============>>> take input
    cursors =this.input.keyboard.createCursorKeys();
    // console.log(cursors);

}


// multiple time
gameScene.update = function(){
    if(gameOver==true){
        return true;
    }
    if(cursors.left.isDown){
        player.setVelocityX(-120);
        if(player.body.touching.down){
            player.anims.play("left",true);
        }
        else{
            player.anime.play("ljump",true);
        }
    }
    else if(cursors.right.isDown){
        player.setVelocityX(+120);
        if(player.body.touching.down){
            player.anims.play("right",true);
        }
        else{
            player.anime.play("rjump",true);
        }
    }
    else{
        player.setVelocityX(0);
        player.anims.play("idle",true);
    }
    if(cursors.space.isDown && player.body.touching.down){
        player.setVelocityY(-350);
        this.sound.playAudioSprite("sfx","numkey")
    }
}

function collectCoin(player ,coin){
    coin.disableBody(true,true);
    score+=100;
    scoreText.setText('Score:'+score); 
    this.sound.playAudioSprite("sfx","ping")
    if(coins.countActive(true)==0){
        // respawn all coins
        coins.children.iterate((coin) => {
            coin.enableBody(true, coin.x , 0, true,true);
        })
        createCorona();
    }
}

function createCorona(){
    let x =player.x<400?Phaser.Math.Between(400,800):Phaser.Math.Between(0,400);
    let corona = coronas.create(x,16,"corona");
    // rebound effect
    corona.setBounce(0.99);
    corona.setCollideWorldBounds(true);
    // random speed
    corona.setVelocity(Phaser.Math.Between(-200,200),20);
}


function hitCorona(){
    this.physics.pause();
    player.setTint(0xff0000);
    gameOver=true;
}
let game = new Phaser.Game(config);