// =============================
// GAME ENGINE
// =============================

const Game = {

    mosquito: {

        row: 0,
        col: 0

    },

    sanity:100,

    turn:1,

    gameOver:false

};

// ----------------------------

function randomDialogue(type){

    let list = dialogues[type];

    return list[
        Math.floor(Math.random()*list.length)
    ];

}

// ----------------------------

function startGame(){

    Game.sanity = 100;

    Game.turn = 1;

    Game.gameOver = false;

    Game.mosquito.row =
        Math.floor(Math.random()*6);

    Game.mosquito.col =
        Math.floor(Math.random()*6);

    console.log(
        "Mosquito:",
        LETTERS[Game.mosquito.col] +
        (Game.mosquito.row+1)
    );

}

// ----------------------------

function attack(row,col){

    if(Game.gameOver)
        return;

    // HIT

    if(
        row==Game.mosquito.row &&
        col==Game.mosquito.col
    ){

        Game.gameOver=true;

        return{

            result:"hit",

            text:randomDialogue("caught")

        };

    }

    // Near Miss

    let d =
        Math.abs(row-Game.mosquito.row)+
        Math.abs(col-Game.mosquito.col);

    if(d==1){

        Game.sanity-=10;

        return{

            result:"near",

            text:randomDialogue("near")

        };

    }

    // Miss

    Game.sanity--;

    return{

        result:"miss",

        text:randomDialogue("miss")

    };

}