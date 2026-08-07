// ===================================================
// MAN VS MOSQUITO
// SCRIPT.JS
// PART 1
// ===================================================

// --------------------
// Dialogue
// --------------------

const dialogues = {

    miss:[
        "BWAHAHA! Too slow!",
        "You'll never catch me!",
        "Skill issue.",
        "Wrong square.",
        "Hehehe~"
    ],

    near:[
        "W-Whoa!",
        "That was close!",
        "Lucky guess!",
        "H-Hey!"
    ],

    bite:[
        "Gotcha~",
        "Thanks for the blood.",
        "BWAHAHA!"
    ],

    caught:[
        "N-No...",
        "Impossible...",
        "You actually got me..."
    ]

};

// --------------------
// HTML Elements
// --------------------

const mainMenu =
document.getElementById("mainMenu");

const modeMenu =
document.getElementById("modeMenu");

const gameScreen =
document.getElementById("gameScreen");

const board =
document.getElementById("gameBoard");

const status =
document.getElementById("status");

const portrait =
document.getElementById("mosquitoPortrait");

const gambleBtn =
document.getElementById("gambleBtn");

const sanityValue =
document.getElementById("sanityValue");

const gambleValue =
document.getElementById("gambleValue");

const turnValue =
document.getElementById("turnValue");

// --------------------

const letters="ABCDEF";

let sanity=100;

let gamble=3;

let turn=1;

let missStreak = 0;

let gameStarted=false;

let gambleMode=false;

let boardCreated=false;

let lastHighlighted = [];

// --------------------

let mosquito={

    row:0,

    col:0

};

// Stores every button

let squares=[];

// ===================================================
// HUD
// ===================================================

function updateHUD(){

    sanityValue.innerText=
    sanity+"%";

    gambleValue.innerText=
    gamble;

    turnValue.innerText=
    turn;

}

// ===================================================
// Portrait
// ===================================================

function setExpression(name){

    portrait.src=
    "images/"+name+".png";

}

function clearHighlights(){

    for(const square of lastHighlighted){

        square.style.background = "";

    }

    lastHighlighted = [];

}

// ===================================================
// END SCREEN
// ===================================================

function showEndScreen(playerWon){

    gameStarted = false;

    show(document.getElementById("endScreen"));

    const title =
    document.getElementById("endTitle");

    const image =
    document.getElementById("endImage");

    const message =
    document.getElementById("endMessage");

    if(playerWon){

        title.innerText =
        "🏆 YOU WIN";

        image.src =
        "images/manwin.png";

        message.innerText =
        "Mosquito-chan:\n\"N-No... Impossible...\"";

    }

    else{

        title.innerText =
        "💀 YOU LOST";

        image.src =
        "images/mosquitowin.png";

        message.innerText =
        "Mosquito-chan:\n\"BWAHAHA! Better luck next time.\"";

    }

}

// ===================================================
// Screen Switching
// ===================================================

function show(screen){

    mainMenu.classList.add("hidden");

    modeMenu.classList.add("hidden");

    gameScreen.classList.add("hidden");

    screen.classList.remove("hidden");

}

// ===================================================
// Start Game
// ===================================================

function startGame(){

    sanity=100;

    gamble=3;

    turn=1;

    missStreak = 0;

    gambleMode=false;

    mosquito.row=
    Math.floor(Math.random()*6);

    mosquito.col=
    Math.floor(Math.random()*6);

    gameStarted=true;

    setExpression("smug");

    updateHUD();

    console.log(
        "Mosquito:",
        letters[mosquito.col]+
        (mosquito.row+1)
    );

}

// ===================================================
// Mosquito Movement
// ===================================================

function moveMosquito(){

    if(Math.random()<0.5){

        status.innerText=
        "🦟 "+
        dialogues.miss[
            Math.floor(
                Math.random()*
                dialogues.miss.length
            )
        ]+
        "\n(She stayed.)";

        return;

    }

    let moves=[

        [-1,0],

        [1,0],

        [0,-1],

        [0,1]

    ];

    let legal=[];

    for(let m of moves){

        let nr=
        mosquito.row+m[0];

        let nc=
        mosquito.col+m[1];

        if(
            nr>=0 &&
            nr<6 &&
            nc>=0 &&
            nc<6
        ){

            legal.push([nr,nc]);

        }

    }

    let choice=
    legal[
        Math.floor(
            Math.random()*
            legal.length
        )
    ];

    mosquito.row=choice[0];

    mosquito.col=choice[1];

    status.innerText=
    "🦟 "+
    dialogues.miss[
        Math.floor(
            Math.random()*
            dialogues.miss.length
        )
    ]+
    "\n(She moved.)";

}

// ===================================================
// Teleport
// ===================================================

function teleportMosquito(){

    let oldRow=
    mosquito.row;

    let oldCol=
    mosquito.col;

    do{

        mosquito.row=
        Math.floor(Math.random()*6);

        mosquito.col=
        Math.floor(Math.random()*6);

    }

    while(

        mosquito.row==
        oldRow &&

        mosquito.col==
        oldCol

    );

}

// ===================================================
// REVEAL SYSTEM
// ===================================================

function revealHint(){

    let truths = [];

    let lies = [];

    // Truths

    truths.push(
        "Row " + (mosquito.row + 1)
    );

    truths.push(
        "Column " + letters[mosquito.col]
    );

    // Lies

    for(let i=1;i<=6;i++){

        if(i != mosquito.row + 1){

            lies.push("Row " + i);

        }

    }

    for(let i=0;i<6;i++){

        if(i != mosquito.col){

            lies.push(
                "Column " + letters[i]
            );

        }

    }

    // ==========================
    // ABOVE 50 SANITY
    // ==========================

    if(sanity >= 50){

        status.innerText =
        "🦟 Fine...\n" +
        truths[
            Math.floor(Math.random()*2)
        ];

        missStreak = 0;

        return;

    }

    // ==========================
// BELOW 50 SANITY
// ==========================

// Number of lies
let lieCount =
Math.floor((49 - sanity) / 10) + 1;

// Pick ONE truth
let clues = [];

clues.push(
    truths[
        Math.floor(Math.random() * truths.length)
    ]
);

// Shuffle lies
lies.sort(() => Math.random() - 0.5);

// Add the lies
for(let i=0; i<lieCount; i++){

    clues.push(lies[i]);

}

// Shuffle everything
clues.sort(() => Math.random() - 0.5);

// Display
status.innerText =
"🦟 Hmm... Maybe this helps...\n\n" +
clues.join("\n");

missStreak = 0;

}

// ===================================================
// CREATE BOARD
// ===================================================

function createBoard(){

    if(boardCreated)
        return;

    boardCreated=true;

    // Empty Corner

    const corner=document.createElement("div");
    corner.className="label";
    board.appendChild(corner);

    // Letters

    for(let c=0;c<6;c++){

        const label=document.createElement("div");

        label.className="label";

        label.innerText=letters[c];

        board.appendChild(label);

    }

    // Grid

    for(let r=0;r<6;r++){

        const rowLabel=document.createElement("div");

        rowLabel.className="label";

        rowLabel.innerText=r+1;

        board.appendChild(rowLabel);

        for(let c=0;c<6;c++){

            const square=document.createElement("button");

            square.className="square";

            if(!squares[r])
                squares[r]=[];

            squares[r][c]=square;

            // -----------------------
            // CLICK
            // -----------------------

          square.onclick = function(){

    // Gamble attack
    if(gambleMode){

        gambleAttack(r,c);

        return;

    }

    // Ignore clicks if the game is over
    if(!gameStarted)
        return;

    // Remove previous attack highlight
    clearHighlights();

    // Rest of your attack code starts here...

                // Gamble handled in Part 3

                if(gambleMode)
                    return;

                // ====================
                // HIT
                // ====================

                if(
                    r==mosquito.row &&
                    c==mosquito.col
                ){

                    square.style.background="#00bb44";

                    lastHighlighted.push(square);

                    setExpression("dead");

                    status.innerText=
                    dialogues.caught[
                        Math.floor(
                            Math.random()*
                            dialogues.caught.length
                        )
                    ];

                    missStreak = 0;
                    gameStarted=false;

                    showEndScreen(true);

                    return;

                }

                // ====================
                // NEAR MISS
                // ====================

                let distance=

                    Math.abs(
                        r-mosquito.row
                    )+

                    Math.abs(
                        c-mosquito.col
                    );

                if(distance==1){

                    square.style.background=
                    "orange";

                    lastHighlighted.push(square);

                    sanity-=10;

                    setExpression("scared");

                    status.innerText=
                    dialogues.near[
                        Math.floor(
                            Math.random()*
                            dialogues.near.length
                        )
                    ];

                    teleportMosquito();
                    missStreak = 0;

                }

                // ====================
                // MISS
                // ====================

                else{

    square.style.background="#993333";

    lastHighlighted.push(square);

    sanity--;

    missStreak++;

    setExpression("smug");

    if(missStreak >= 5){

        revealHint();

    }

    else{

        moveMosquito();

    }

}

                turn++;

                updateHUD();

                if(sanity<=0){

                    gameStarted=false;

                    showEndScreen(false);

                }

            };

            board.appendChild(square);

        }

    }

}

// ===================================================
// BUTTONS
// ===================================================

document.getElementById("vsComputerBtn").onclick = function () {

    show(modeMenu);

};

document.getElementById("backBtn").onclick = function () {

    show(mainMenu);

};

document.getElementById("manBtn").onclick = function () {

    show(gameScreen);

    createBoard();

    startGame();

};

document.getElementById("mosquitoBtn").onclick = function () {

    alert("Mosquito Mode Coming Soon!");

};

document.getElementById("vsPlayerBtn").onclick = function () {

    alert("VS Player Coming Soon!");

};

document.getElementById("rulesBtn").onclick = function () {

    alert(`

MAN VS MOSQUITO

Man wins by swatting the mosquito.

Miss      = -1 Sanity

Near Miss = -10 Sanity

Mad Man's Gamble:
Hits a 2×2 area.
Miss = -20 Sanity.

`);

};

// ===================================================
// MAD MAN'S GAMBLE
// ===================================================

gambleBtn.onclick = function(){

    if(!gameStarted)
        return;

    if(gamble<=0){

        alert("No Gambles Remaining!");

        return;

    }

    gambleMode = true;

    status.innerText =
    "🎲 Gamble Ready! Click the TOP-LEFT square.";

};

// ===================================================
// GAMBLE ATTACK
// ===================================================

function gambleAttack(r,c){

    gambleMode = false;

    gamble--;

    updateHUD();

    if(r>4 || c>4){

        status.innerText =
        "Choose between A1 and E5.";

        gamble++;

        updateHUD();

        return;

    }

    let hit = false;

    const area = [

        [r,c],

        [r,c+1],

        [r+1,c],

        [r+1,c+1]

    ];

    // Blue flash

   for(const cell of area){

    const square = squares[cell[0]][cell[1]];

    square.style.background = "dodgerblue";

    lastHighlighted.push(square);

    if(
        mosquito.row === cell[0] &&
        mosquito.col === cell[1]
    ){

        hit = true;

    }

}

    setTimeout(function(){

        if(hit){

            setExpression("dead");

            status.innerText =
            "💥 MAD MAN'S GAMBLE!!";

            gameStarted=false;

            showEndScreen(true);

        }

        else{

            for(const cell of area){

                squares[cell[0]][cell[1]].style.background =
                "#993333";

            }

            sanity -= 20;

            updateHUD();

            setExpression("smug");

            status.innerText =
            "💀 Gamble Failed! (-20 Sanity)";

            moveMosquito();

            turn++;

            updateHUD();

            if(sanity<=0){

                gameStarted=false;

                showEndScreen(false);

            }

        }

    },300);

}

// ===================================================
// END SCREEN BUTTONS
// ===================================================

document.getElementById("playAgainBtn").onclick = function(){

    document.getElementById("endScreen")
    .classList.add("hidden");

    board.innerHTML = "";

    squares = [];

    boardCreated = false;

    show(gameScreen);

    createBoard();

    startGame();

};

document.getElementById("menuBtn").onclick = function(){

    document.getElementById("endScreen")
    .classList.add("hidden");

    board.innerHTML = "";

    squares = [];

    boardCreated = false;

    show(mainMenu);

};