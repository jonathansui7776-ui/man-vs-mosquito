// ===================================================
// MAN VS MOSQUITO
// SCRIPT.JS
// MAN MODE — VS COMPUTER
// ===================================================


// ===================================================
// DIALOGUE
// ===================================================

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


// ===================================================
// HTML ELEMENTS
// ===================================================

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

const playerModeMenu =
    document.getElementById("playerModeMenu");


// ===================================================
// GAME VARIABLES
// ===================================================

const letters = "ABCDEF";

let sanity = 100;

let gamble = 3;

let turn = 1;

let missStreak = 0;

let gameStarted = false;

let gambleMode = false;

let boardCreated = false;

let lastHighlighted = [];


// Current game mode
// Used by Play Again

let currentGameMode = null;


// ===================================================
// MOSQUITO POSITION
// ===================================================

let mosquito = {

    row: 0,

    col: 0

};


// Stores every button

let squares = [];


// ===================================================
// HUD
// ===================================================

function updateHUD(){

    sanityValue.innerText =
        sanity + "%";

    gambleValue.innerText =
        gamble;

    turnValue.innerText =
        turn;

}


// ===================================================
// PORTRAIT
// ===================================================

function setExpression(name){

    portrait.src =
        "images/" + name + ".png";

}


// ===================================================
// MOSQUITO TAUNT SYSTEM
// ===================================================

function showMosquitoTaunt(type){

    if(!gameStarted)
        return;


    // =========================================
    // NORMAL MISS
    // =========================================

    if(type === "miss"){

        setExpression("smug");

        status.innerText =
            dialogues.miss[
                Math.floor(
                    Math.random() *
                    dialogues.miss.length
                )
            ];

        return;

    }


    // =========================================
    // NEAR MISS
    // =========================================

    if(type === "near"){

        setExpression("scared");

        status.innerText =
            dialogues.near[
                Math.floor(
                    Math.random() *
                    dialogues.near.length
                )
            ];

        return;

    }


    // =========================================
    // BITE
    // =========================================

    if(type === "bite"){

        status.innerText =
            dialogues.bite[
                Math.floor(
                    Math.random() *
                    dialogues.bite.length
                )
            ];

        return;

    }


    // =========================================
    // CAUGHT
    // =========================================

    if(type === "caught"){

        setExpression("dead");

        status.innerText =
            dialogues.caught[
                Math.floor(
                    Math.random() *
                    dialogues.caught.length
                )
            ];

    }

}


// ===================================================
// CLEAR HIGHLIGHTS
// ===================================================

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

    show(
        document.getElementById("endScreen")
    );


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
            "Mosquito-chan:\n" +
            "\"N-No... Impossible...\"";

    }

    else{

        title.innerText =
            "💀 YOU LOST";

        image.src =
            "images/mosquitowin.png";

        message.innerText =
            "Mosquito-chan:\n" +
            "\"BWAHAHA! Better luck next time.\"";

    }

}


// ===================================================
// SCREEN SWITCHING
// ===================================================

function show(screen){

    console.log("SHOW CALLED:", screen);


    // =========================================
    // MAIN MENU
    // =========================================

    const mainMenu =
        document.getElementById("mainMenu");


    if(mainMenu){

        mainMenu.classList.add("hidden");

    }


    // =========================================
    // VS COMPUTER SIDE MENU
    // =========================================

    const modeMenu =
        document.getElementById("modeMenu");


    if(modeMenu){

        modeMenu.classList.add("hidden");

    }


    // =========================================
    // VS COMPUTER — MAN
    // =========================================

    const gameScreen =
        document.getElementById("gameScreen");


    if(gameScreen){

        gameScreen.classList.add("hidden");

    }


    // =========================================
    // VS COMPUTER — MOSQUITO
    // =========================================

    const mosquitoScreen =
        document.getElementById(
            "mosquitoGameScreen"
        );


    if(mosquitoScreen){

        mosquitoScreen.classList.add(
            "hidden"
        );

    }


    // =========================================
    // END SCREEN
    // =========================================

    const endScreen =
        document.getElementById(
            "endScreen"
        );


    if(endScreen){

        endScreen.classList.add(
            "hidden"
        );

    }


    // =========================================
    // SHOW REQUESTED SCREEN
    // =========================================

    if(screen){

        screen.classList.remove(
            "hidden"
        );

        console.log(
            "✅ Screen shown:",
            screen.id
        );

    }
    else{

        console.error(
            "❌ show() received a NULL screen!"
        );

    }

}


// ===================================================
// START GAME
// ===================================================

function startGame(){

    currentGameMode = "man";


    sanity = 100;

    gamble = 3;

    turn = 1;

    missStreak = 0;

    gambleMode = false;


    mosquito.row =
        Math.floor(
            Math.random() * 6
        );

    mosquito.col =
        Math.floor(
            Math.random() * 6
        );


    gameStarted = true;


    setExpression("smug");

    updateHUD();


    status.innerText =
        "BWAHAHA! You'll never catch me!";


    console.log(
        "Mosquito:",
        letters[mosquito.col] +
        (mosquito.row + 1)
    );

}


// ===================================================
// MOSQUITO MOVEMENT
// ===================================================

function moveMosquito(){

    if(Math.random() < 0.5){

        status.innerText =
            "🦟 " +
            dialogues.miss[
                Math.floor(
                    Math.random() *
                    dialogues.miss.length
                )
            ] +
            "\n(She stayed.)";

        return;

    }


    let moves = [

        [-1,0],

        [1,0],

        [0,-1],

        [0,1]

    ];


    let legal = [];


    for(let m of moves){

        let nr =
            mosquito.row + m[0];

        let nc =
            mosquito.col + m[1];


        if(
            nr >= 0 &&
            nr < 6 &&
            nc >= 0 &&
            nc < 6
        ){

            legal.push([
                nr,
                nc
            ]);

        }

    }


    let choice =
        legal[
            Math.floor(
                Math.random() *
                legal.length
            )
        ];


    mosquito.row =
        choice[0];

    mosquito.col =
        choice[1];


    status.innerText =
        "🦟 " +
        dialogues.miss[
            Math.floor(
                Math.random() *
                dialogues.miss.length
            )
        ] +
        "\n(She moved.)";

}


// ===================================================
// TELEPORT
// ===================================================

function teleportMosquito(){

    let oldRow =
        mosquito.row;

    let oldCol =
        mosquito.col;


    do{

        mosquito.row =
            Math.floor(
                Math.random() * 6
            );

        mosquito.col =
            Math.floor(
                Math.random() * 6
            );

    }

    while(

        mosquito.row == oldRow &&

        mosquito.col == oldCol

    );

}


// ===================================================
// REVEAL SYSTEM
// ===================================================

function revealHint(){

    let truths = [];

    let lies = [];


    // =========================================
    // TRUTHS
    // =========================================

    truths.push(
        "Row " +
        (mosquito.row + 1)
    );


    truths.push(
        "Column " +
        letters[mosquito.col]
    );


    // =========================================
    // LIES
    // =========================================

    for(let i = 1; i <= 6; i++){

        if(
            i != mosquito.row + 1
        ){

            lies.push(
                "Row " + i
            );

        }

    }


    for(let i = 0; i < 6; i++){

        if(
            i != mosquito.col
        ){

            lies.push(
                "Column " +
                letters[i]
            );

        }

    }


    // =========================================
    // ABOVE 50 SANITY
    // =========================================

    if(sanity >= 50){

        status.innerText =
            "🦟 Fine...\n" +
            truths[
                Math.floor(
                    Math.random() *
                    truths.length
                )
            ];


        missStreak = 0;


        // Return to normal dialogue
        setTimeout(function(){

            if(gameStarted){

                showMosquitoTaunt("miss");

            }

        }, 1800);


        return;

    }


    // =========================================
    // BELOW 50 SANITY
    // =========================================

    let lieCount =
        Math.floor(
            (49 - sanity) / 10
        ) + 1;


    let clues = [];


    // One truth

    clues.push(
        truths[
            Math.floor(
                Math.random() *
                truths.length
            )
        ]
    );


    // Shuffle lies

    lies.sort(
        () => Math.random() - 0.5
    );


    // Add lies

    for(
        let i = 0;
        i < lieCount;
        i++
    ){

        clues.push(
            lies[i]
        );

    }


    // Shuffle everything

    clues.sort(
        () => Math.random() - 0.5
    );


    status.innerText =
        "🦟 Hmm... Maybe this helps...\n\n" +
        clues.join("\n");


    missStreak = 0;


    // Return to normal dialogue

    setTimeout(function(){

        if(gameStarted){

            showMosquitoTaunt("miss");

        }

    }, 2500);

}


// ===================================================
// CREATE BOARD
// ===================================================

function createBoard(){

    if(boardCreated)
        return;


    boardCreated = true;


    // =========================================
    // EMPTY CORNER
    // =========================================

    const corner =
        document.createElement("div");

    corner.className =
        "label";

    board.appendChild(corner);


    // =========================================
    // LETTERS
    // =========================================

    for(
        let c = 0;
        c < 6;
        c++
    ){

        const label =
            document.createElement("div");

        label.className =
            "label";

        label.innerText =
            letters[c];

        board.appendChild(label);

    }


    // =========================================
    // GRID
    // =========================================

    for(
        let r = 0;
        r < 6;
        r++
    ){

        const rowLabel =
            document.createElement("div");

        rowLabel.className =
            "label";

        rowLabel.innerText =
            r + 1;

        board.appendChild(
            rowLabel
        );


        for(
            let c = 0;
            c < 6;
            c++
        ){

            const square =
                document.createElement(
                    "button"
                );


            square.className =
                "square";


            if(!squares[r])
                squares[r] = [];


            squares[r][c] =
                square;


            // =================================
            // CLICK
            // =================================

            square.onclick =
            function(){

                // -----------------------------
                // GAMBLE ATTACK
                // -----------------------------

                if(gambleMode){

                    gambleAttack(
                        r,
                        c
                    );

                    return;

                }


                // -----------------------------
                // GAME OVER
                // -----------------------------

                if(!gameStarted)
                    return;


                // -----------------------------
                // CLEAR OLD ATTACK
                // -----------------------------

                clearHighlights();


                // =================================
                // HIT
                // =================================

                if(
                    r == mosquito.row &&
                    c == mosquito.col
                ){

                    square.style.background =
                        "#00bb44";

                    lastHighlighted.push(
                        square
                    );


                    showMosquitoTaunt(
                        "caught"
                    );


                    missStreak = 0;

                    gameStarted = false;


                    showEndScreen(
                        true
                    );


                    return;

                }


                // =================================
                // NEAR MISS
                // =================================

                let distance =

                    Math.abs(
                        r -
                        mosquito.row
                    )

                    +

                    Math.abs(
                        c -
                        mosquito.col
                    );


                if(distance == 1){

                    square.style.background =
                        "orange";


                    lastHighlighted.push(
                        square
                    );


                    sanity -= 10;


                    showMosquitoTaunt(
                        "near"
                    );


                    teleportMosquito();


                    missStreak = 0;

                }


                // =================================
                // MISS
                // =================================

                else{

                    square.style.background =
                        "#993333";


                    lastHighlighted.push(
                        square
                    );


                    sanity--;

                    missStreak++;


                    setExpression(
                        "smug"
                    );


                    if(
                        missStreak >= 5
                    ){

                        revealHint();

                    }

                    else{

                        showMosquitoTaunt(
                            "miss"
                        );

                        moveMosquito();

                    }

                }


                turn++;

                updateHUD();


                // =================================
                // INSANITY / LOSS
                // =================================

                if(
                    sanity <= 0
                ){

                    sanity = 0;

                    updateHUD();

                    gameStarted = false;

                    showEndScreen(
                        false
                    );

                }

            };


            board.appendChild(
                square
            );

        }

    }

}


// ===================================================
// MAIN MENU BUTTONS
// ===================================================

document.getElementById(
    "vsComputerBtn"
).onclick =
function(){

    show(modeMenu);

};


document.getElementById(
    "backBtn"
).onclick =
function(){

    show(mainMenu);

};


document.getElementById(
    "manBtn"
).onclick =
function(){

    show(gameScreen);

    createBoard();

    startGame();

};


document.getElementById(
    "mosquitoBtn"
).onclick =
function(){

    // mosquito.js takes over
    // this button after loading

};


document.getElementById(
    "vsPlayerBtn"
).onclick =
function(){

    mainMenu.classList.add(
        "hidden"
    );

    modeMenu.classList.add(
        "hidden"
    );

    playerModeMenu.classList.remove(
        "hidden"
    );

};

document.getElementById(
    "playerBackBtn"
).onclick =
function(){

    playerModeMenu.classList.add(
        "hidden"
    );

    mainMenu.classList.remove(
        "hidden"
    );

};



document.getElementById(
    "rulesBtn"
).onclick =
function(){

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

gambleBtn.onclick =
function(){

    if(!gameStarted)
        return;


    if(gamble <= 0){

        alert(
            "No Gambles Remaining!"
        );

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


    // =========================================
    // INVALID 2×2 POSITION
    // =========================================

    if(
        r > 4 ||
        c > 4
    ){

        status.innerText =
            "Choose between A1 and E5.";


        gamble++;


        updateHUD();


        // Restore dialogue

        setTimeout(function(){

            if(gameStarted){

                showMosquitoTaunt(
                    "miss"
                );

            }

        }, 1000);


        return;

    }


    let hit = false;


    const area = [

        [r,c],

        [r,c+1],

        [r+1,c],

        [r+1,c+1]

    ];


    // =========================================
    // BLUE FLASH
    // =========================================

    for(
        const cell of area
    ){

        const square =
            squares[
                cell[0]
            ][
                cell[1]
            ];


        square.style.background =
            "dodgerblue";


        lastHighlighted.push(
            square
        );


        if(
            mosquito.row === cell[0] &&
            mosquito.col === cell[1]
        ){

            hit = true;

        }

    }


    // =========================================
    // RESULT
    // =========================================

    setTimeout(
    function(){

        if(hit){

            setExpression(
                "dead"
            );


            status.innerText =
                "💥 MAD MAN'S GAMBLE!!";


            gameStarted =
                false;


            showEndScreen(
                true
            );


        }

        else{

            // -----------------------------
            // RED 2×2 AREA
            // -----------------------------

            for(
                const cell of area
            ){

                squares[
                    cell[0]
                ][
                    cell[1]
                ].style.background =
                    "#993333";

            }


            sanity -= 20;


            if(sanity < 0)
                sanity = 0;


            updateHUD();


            setExpression(
                "smug"
            );


            status.innerText =
                "💀 Gamble Failed! (-20 Sanity)";


            // Move mosquito

            moveMosquito();


            turn++;


            updateHUD();


            // -----------------------------
            // LOSS
            // -----------------------------

            if(
                sanity <= 0
            ){

                gameStarted =
                    false;


                showEndScreen(
                    false
                );

                return;

            }


            // -----------------------------
            // RESTORE DIALOGUE
            // -----------------------------

            setTimeout(function(){

                if(gameStarted){

                    showMosquitoTaunt(
                        "miss"
                    );

                }

            }, 1200);

        }

    }, 300);

}


// ===================================================
// END SCREEN — PLAY AGAIN
// ===================================================

document.getElementById(
    "playAgainBtn"
).onclick =
function(){

    // =========================================
    // MOSQUITO MODE
    // =========================================

    if(
        currentGameMode === "mosquito"
    ){

        // mosquito.js owns this case

        return;

    }


    // =========================================
    // MAN MODE
    // =========================================

    document.getElementById(
        "endScreen"
    )
    .classList.add(
        "hidden"
    );


    board.innerHTML =
        "";


    squares = [];


    boardCreated =
        false;


    show(
        gameScreen
    );


    createBoard();


    startGame();

};


// ===================================================
// END SCREEN — MAIN MENU
// ===================================================

document.getElementById(
    "menuBtn"
).onclick =
function(){

    // Mosquito mode handles its own
    // menu button behavior

    if(
        currentGameMode === "mosquito"
    ){

        return;

    }


    document.getElementById(
        "endScreen"
    )
    .classList.add(
        "hidden"
    );


    board.innerHTML =
        "";


    squares = [];


    boardCreated =
        false;


    show(
        mainMenu
    );

};
