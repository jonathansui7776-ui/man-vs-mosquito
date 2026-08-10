// ===================================================
// MAN VS MOSQUITO
// MOSQUITO.JS
// VS COMPUTER — PLAY AS MOSQUITO
// ===================================================


// ===================================================
// HTML ELEMENTS
// ===================================================

const mosquitoGameScreen =
    document.getElementById("mosquitoGameScreen");

const mosquitoBoard =
    document.getElementById("mosquitoBoard");

const confirmMosquitoBtn =
    document.getElementById("confirmMosquitoBtn");

const stayBtn =
    document.getElementById("stayBtn");

const mosquitoMovementStatus =
    document.getElementById("mosquitoMovementStatus");

const mosquitoManSanity =
    document.getElementById("mosquitoManSanity");

const mosquitoTurnValue =
    document.getElementById("mosquitoTurnValue");

const manPortrait =
    document.getElementById("manPortrait");

const manStatus =
    document.getElementById("manStatus");


// ===================================================
// GAME VARIABLES
// ===================================================

const mosquitoLetters = "ABCDEF";

let mosquitoGameStarted = false;

let mosquitoPlayer = {

    row: null,
    col: null

};

let mosquitoTurn = 1;

let mosquitoManSanityValue = 100;

let computerGambles = 3;

let lastManGambleSquares = [];


// Board

let mosquitoBoardCreated = false;


// Current game




// Last Man attack

let lastManAttackSquare = null;


// Mosquito movement

let mosquitoCanMove = false;


// Information system

let turnsWithoutBite = 0;

let revealedInformation = [];

let computerClues = [];


// ===================================================
// START MOSQUITO MODE
// ===================================================

// ===================================================
// SHOW MOSQUITO ON CURRENT TILE
// ===================================================

function showMosquitoPosition(){

    const allSquares =
        mosquitoBoard.querySelectorAll(".square");

    // Remove mosquito image from every tile

    allSquares.forEach(function(square){

        square.style.backgroundImage = "";

    });


    // Get current mosquito tile

    const square =
        getMosquitoSquare(
            mosquitoPlayer.row,
            mosquitoPlayer.col
        );


    if(!square)
        return;


    square.style.backgroundImage =
        "url('images/mosquitochan.png')";

    square.style.backgroundSize =
        "cover";

    square.style.backgroundPosition =
        "center";

}

function startMosquitoMode(){

    lastManGambleSquares = [];

    computerGambles = 3;

    currentGameMode = "mosquito";

    mosquitoGameStarted = false;

    mosquitoPlayer.row = null;
    mosquitoPlayer.col = null;

    mosquitoTurn = 1;

    mosquitoManSanityValue = 100;

    turnsWithoutBite = 0;

    revealedInformation = [];

    computerClues = [];

    lastManAttackSquare = null;

    mosquitoCanMove = false;


    // =========================================
    // RESET BOARD
    // =========================================

    mosquitoBoardCreated = false;

    mosquitoBoard.innerHTML = "";


    // =========================================
    // RESET HUD
    // =========================================

    mosquitoManSanity.innerText =
        "100%";

    mosquitoTurnValue.innerText =
        "1";


    // =========================================
    // RESET BUTTONS
    // =========================================

    confirmMosquitoBtn.disabled = true;

    confirmMosquitoBtn.classList.remove(
        "hidden"
    );

    stayBtn.classList.add(
        "hidden"
    );


    // =========================================
    // RESET DIALOGUE
    // =========================================

    manPortrait.src =
        "images/mannormal.png";

    manStatus.innerText =
        "I'm going to find you.";


    mosquitoMovementStatus.innerText =
        "Choose a square to hide in.";


    // =========================================
    // CREATE BOARD
    // =========================================

    createMosquitoBoard();

}


// ===================================================
// CREATE MOSQUITO BOARD
// ===================================================

function createMosquitoBoard(){

    if(mosquitoBoardCreated)
        return;

    mosquitoBoardCreated = true;


    // =========================================
    // TOP-LEFT CORNER
    // =========================================

    const corner =
        document.createElement("div");

    corner.className = "label";

    mosquitoBoard.appendChild(corner);


    // =========================================
    // COLUMN LABELS
    // =========================================

    for(let c = 0; c < 6; c++){

        const label =
            document.createElement("div");

        label.className = "label";

        label.innerText =
            mosquitoLetters[c];

        mosquitoBoard.appendChild(label);

    }


    // =========================================
    // ROWS + SQUARES
    // =========================================

    for(let r = 0; r < 6; r++){

        const rowLabel =
            document.createElement("div");

        rowLabel.className = "label";

        rowLabel.innerText =
            r + 1;

        mosquitoBoard.appendChild(rowLabel);


        for(let c = 0; c < 6; c++){

            const square =
                document.createElement("button");

            square.className =
                "square";


            // =================================
            // INITIAL HIDING PLACE SELECTION
            // =================================

            square.onclick = function(){

                if(mosquitoGameStarted)
                    return;

                selectStartingPosition(
                    r,
                    c,
                    square
                );

            };


            mosquitoBoard.appendChild(square);

        }

    }

}


// ===================================================
// SELECT STARTING POSITION
// ===================================================

function selectStartingPosition(
    row,
    col,
    square
){

    const allSquares =
        mosquitoBoard.querySelectorAll(
            ".square"
        );


    // Remove old selection

    allSquares.forEach(function(s){

        s.style.background = "";

    });


    mosquitoPlayer.row = row;

    mosquitoPlayer.col = col;


    square.style.background =
        "#00bb44";


    confirmMosquitoBtn.disabled =
        false;


    mosquitoMovementStatus.innerText =
        "Mosquito-chan will hide at " +
        mosquitoLetters[col] +
        (row + 1) +
        ".";


    console.log(
        "Mosquito starting position:",
        mosquitoLetters[col] +
        (row + 1)
    );

}


// ===================================================
// CONFIRM HIDING PLACE
// ===================================================

confirmMosquitoBtn.onclick =
function(){

    if(
        mosquitoPlayer.row === null ||
        mosquitoPlayer.col === null
    ){

        return;

    }


    mosquitoGameStarted = true;

    confirmMosquitoBtn.classList.add(
        "hidden"
    );

    // Remove the green starting highlight

const allSquares =
    mosquitoBoard.querySelectorAll(".square");

allSquares.forEach(function(square){

    square.style.background = "";

});

// Show Mosquito-chan on her tile

showMosquitoPosition();


    mosquitoMovementStatus.innerText =
        "The Man is searching...";


    manStatus.innerText =
        "I'm going to find you.";


    mosquitoTurnValue.innerText =
        mosquitoTurn;


    // Start Man's first attack

    setTimeout(function(){

        computerManAttack();

    }, 800);

};


// ===================================================
// MOSQUITO MOVEMENT
// ===================================================

function showMosquitoMovement(){

    if(!mosquitoGameStarted)
        return;


    mosquitoCanMove = true;

    stayBtn.classList.remove(
        "hidden"
    );


    clearMosquitoBoard();


    const moves = [

        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]

    ];


    for(const move of moves){

        const row =
            mosquitoPlayer.row +
            move[0];

        const col =
            mosquitoPlayer.col +
            move[1];


        if(
            row < 0 ||
            row >= 6 ||
            col < 0 ||
            col >= 6
        ){

            continue;

        }


        const square =
            getMosquitoSquare(
                row,
                col
            );


        if(!square)
            continue;


        square.classList.add(
            "mosquito-move-option"
        );


        square.onclick =
        function(){

            moveMosquito(
                row,
                col
            );

        };

    }


    mosquitoMovementStatus.innerText =
        "🦟 Your move — move one square or STAY.";

}


// ===================================================
// STAY
// ===================================================

stayBtn.onclick =
function(){

    if(
        !mosquitoGameStarted ||
        !mosquitoCanMove
    ){

        return;

    }


    mosquitoCanMove = false;

    stayBtn.classList.add(
        "hidden"
    );


    clearMosquitoBoard();

    showMosquitoPosition();


    mosquitoMovementStatus.innerText =
        "🦟 You stayed at " +
        mosquitoLetters[
            mosquitoPlayer.col
        ] +
        (mosquitoPlayer.row + 1) +
        ". The Man is searching...";


    mosquitoTurn++;


    mosquitoTurnValue.innerText =
        mosquitoTurn;


    setTimeout(function(){

        computerManAttack();

    }, 800);

};


// ===================================================
// NORMAL MOSQUITO MOVEMENT
// ===================================================

function moveMosquito(
    row,
    col
){

    if(
        !mosquitoGameStarted ||
        !mosquitoCanMove
    ){

        return;

    }


    mosquitoCanMove = false;

    stayBtn.classList.add(
        "hidden"
    );

    mosquitoPlayer.row = row;

mosquitoPlayer.col = col;

clearMosquitoBoard();

showMosquitoPosition();


    mosquitoTurn++;


    mosquitoTurnValue.innerText =
        mosquitoTurn;


    mosquitoMovementStatus.innerText =
        "🦟 You moved to " +
        mosquitoLetters[col] +
        (row + 1) +
        ". The Man is searching...";


    setTimeout(function(){

        computerManAttack();

    }, 800);

}


// ===================================================
// FREE FLIGHT AFTER BITE
// ===================================================

function showFreeFlight(){

    if(!mosquitoGameStarted)
        return;


    mosquitoCanMove = true;

    stayBtn.classList.add(
        "hidden"
    );


    clearMosquitoBoard();


    mosquitoMovementStatus.innerText =
        "🩸 You bit him! FLY ANYWHERE!";


    const allSquares =
        mosquitoBoard.querySelectorAll(
            ".square"
        );


    allSquares.forEach(function(square){

        square.classList.add(
            "mosquito-move-option"
        );


        square.onclick =
        function(){

            const index =
                Array.from(
                    allSquares
                ).indexOf(square);


            const row =
                Math.floor(index / 6);

            const col =
                index % 6;


            flyMosquito(
                row,
                col
            );

        };

    });

}


// ===================================================
// FREE FLIGHT
// ===================================================

function flyMosquito(
    row,
    col
){

    if(!mosquitoGameStarted)
        return;


    mosquitoCanMove = false;


    mosquitoPlayer.row = row;

    mosquitoPlayer.col = col;


    clearMosquitoBoard();

    showMosquitoPosition();


    stayBtn.classList.add(
        "hidden"
    );


    mosquitoTurn++;


    mosquitoTurnValue.innerText =
        mosquitoTurn;


    mosquitoMovementStatus.innerText =
        "🦟 You flew to " +
        mosquitoLetters[col] +
        (row + 1) +
        ". The Man is searching...";


    setTimeout(function(){

        computerManAttack();

    }, 800);

}


// ===================================================
// GET SQUARE
// ===================================================

function getMosquitoSquare(
    row,
    col
){

    const allSquares =
        mosquitoBoard.querySelectorAll(
            ".square"
        );


    return allSquares[
        row * 6 + col
    ];

}


// ===================================================
// CLEAR MOVEMENT HIGHLIGHTS
// ===================================================

function clearMosquitoBoard(){

    const allSquares =
        mosquitoBoard.querySelectorAll(
            ".square"
        );


    allSquares.forEach(function(square){

        square.onclick = null;


        square.classList.remove(
            "mosquito-move-option"
        );

    });

}

// ===================================================
// COMPUTER MAD MAN'S GAMBLE
// ===================================================

function computerMadManGamble(){

    if(!mosquitoGameStarted)
        return;

    manStatus.innerText =
    "🎲 MAD MAN'S GAMBLE! (" +
    computerGambles +
    " left)";


    // =========================================
    // FIND A 2×2 AREA USING KNOWN INFORMATION
    // =========================================

    let topRow;
    let leftCol;


    // -----------------------------------------
    // ROW KNOWN
    // -----------------------------------------

    if(
        revealedInformation.length > 0 &&
        revealedInformation[
            revealedInformation.length - 1
        ].type === "row"
    ){

        const knownRow =
            revealedInformation[
                revealedInformation.length - 1
            ].value;


        // Make sure the 2×2 contains this row

        if(knownRow === 0){

            topRow = 0;

        }

        else if(knownRow === 5){

            topRow = 4;

        }

        else{

            topRow =
                Math.random() < 0.5
                    ? knownRow - 1
                    : knownRow;

        }


        leftCol =
            Math.floor(
                Math.random() * 5
            );

    }


    // -----------------------------------------
    // COLUMN KNOWN
    // -----------------------------------------

    else if(
        revealedInformation.length > 0 &&
        revealedInformation[
            revealedInformation.length - 1
        ].type === "column"
    ){

        const knownCol =
            revealedInformation[
                revealedInformation.length - 1
            ].value;


        // Make sure the 2×2 contains this column

        if(knownCol === 0){

            leftCol = 0;

        }

        else if(knownCol === 5){

            leftCol = 4;

        }

        else{

            leftCol =
                Math.random() < 0.5
                    ? knownCol - 1
                    : knownCol;

        }


        topRow =
            Math.floor(
                Math.random() * 5
            );

    }


    // -----------------------------------------
    // SAFETY FALLBACK
    // -----------------------------------------

    else{

        topRow =
            Math.floor(
                Math.random() * 5
            );

        leftCol =
            Math.floor(
                Math.random() * 5
            );

    }


    // =========================================
    // CREATE 2×2 AREA
    // =========================================

    const area = [

        [topRow, leftCol],

        [topRow, leftCol + 1],

        [topRow + 1, leftCol],

        [topRow + 1, leftCol + 1]

    ];


    // =========================================
    // DISPLAY ATTACK
    // =========================================

    const attackSquares = [];


    for(const cell of area){

        const square =
            getMosquitoSquare(
                cell[0],
                cell[1]
            );


        if(square){

            square.classList.add(
                "man-bite"
            );

            attackSquares.push(
                square
            );

            lastManGambleSquares.push(
    square
);

        }

    }


    mosquitoMovementStatus.innerText =
        "🎲 THE MAN USES MAD MAN'S GAMBLE!";


    manStatus.innerText =
        "I KNOW WHERE YOU ARE.";


    // =========================================
    // CHECK IF MOSQUITO IS INSIDE
    // =========================================

    const hit =
        area.some(function(cell){

            return(
                cell[0] === mosquitoPlayer.row &&
                cell[1] === mosquitoPlayer.col
            );

        });


    setTimeout(function(){

        if(hit){

            // =================================
            // MAN WINS
            // =================================

            const mosquitoSquare =
                getMosquitoSquare(
                    mosquitoPlayer.row,
                    mosquitoPlayer.col
                );


            if(mosquitoSquare){

                mosquitoSquare.classList.remove(
                    "man-bite"
                );

                mosquitoSquare.classList.add(
                    "man-hit"
                );

            }


            mosquitoGameStarted = false;


            manStatus.innerText =
                "GOT YOU.";


            mosquitoMovementStatus.innerText =
                "💥 MAD MAN'S GAMBLE CAUGHT YOU!";


            showMosquitoEndScreen(false);

            return;

        }


        // =====================================
        // GAMBLE MISSED
        // =====================================

        for(const square of attackSquares){

            square.classList.remove(
                "man-bite"
            );

            square.classList.add(
                "man-miss"
            );

        }


        mosquitoManSanityValue -= 20;


        if(
            mosquitoManSanityValue < 0
        ){

            mosquitoManSanityValue = 0;

        }


        mosquitoManSanity.innerText =
            mosquitoManSanityValue +
            "%";
        
        updateSanityMusic(
    mosquitoManSanityValue
);


        updateManExpression();


        manStatus.innerText =
            "DAMN IT!";


        mosquitoMovementStatus.innerText =
            "🎲 MAD MAN'S GAMBLE FAILED!";


        // =====================================
        // MAN LOST SANITY
        // =====================================

        if(
            mosquitoManSanityValue <= 0
        ){

            mosquitoGameStarted = false;

            showMosquitoEndScreen(true);

            return;

        }


        // =====================================
        // MOSQUITO GETS TO MOVE
        // =====================================

        setTimeout(function(){

            showMosquitoMovement();

        }, 1000);

    }, 700);

}


// ===================================================
// COMPUTER / MAN ATTACK
// ===================================================

function computerManAttack(){

    if(!mosquitoGameStarted)
        return;

        // =========================================
    // USE GAMBLE IF MAN HAS LEARNED INFORMATION
    // =========================================

    // =========================================
// COMPUTER GAMBLE DECISION
// =========================================

if(
    revealedInformation.length > 0 &&
    computerGambles > 0
){

    // 40% chance to use a Gamble
    // 60% chance to make a normal attack

    if(Math.random() < 0.40){

        computerGambles--;

        computerMadManGamble();

        return;

    }

}


    mosquitoCanMove = false;

    stayBtn.classList.add(
        "hidden"
    );


    // =========================================
    // REMOVE PREVIOUS ATTACK MARKER
    // =========================================

    if(lastManAttackSquare){

        lastManAttackSquare.classList.remove(
            "man-miss",
            "man-bite",
            "man-hit"
        );

        lastManAttackSquare = null;

    }

    // Remove previous Gamble attack markers

if(lastManGambleSquares.length > 0){

    for(const square of lastManGambleSquares){

        square.classList.remove(
            "man-miss",
            "man-bite",
            "man-hit"
        );

    }

    lastManGambleSquares = [];

}


    clearMosquitoBoard();


    // =========================================
    // CHOOSE ATTACK
    // =========================================

    const attack =
        chooseComputerAttack();


    const attackRow =
        attack.row;

    const attackCol =
        attack.col;


    const attackSquare =
        getMosquitoSquare(
            attackRow,
            attackCol
        );


    if(!attackSquare)
        return;


    lastManAttackSquare =
        attackSquare;


    // =========================================
    // EXACT HIT
    // =========================================

    if(
        attackRow === mosquitoPlayer.row &&
        attackCol === mosquitoPlayer.col
    ){

        attackSquare.classList.add(
            "man-hit"
        );


        mosquitoGameStarted = false;


        mosquitoMovementStatus.innerText =
            "💥 The Man caught you!";


        manStatus.innerText =
            "GOT YOU.";


        showMosquitoEndScreen(false);

        return;

    }


    // =========================================
    // DISTANCE
    // =========================================

    const distance =

        Math.abs(
            attackRow -
            mosquitoPlayer.row
        )

        +

        Math.abs(
            attackCol -
            mosquitoPlayer.col
        );


    // =========================================
    // BITE
    // =========================================

    if(distance === 1){

        attackSquare.classList.add(
            "man-bite"
        );


        turnsWithoutBite = 0;


        mosquitoManSanityValue -= 10;


        if(
            mosquitoManSanityValue < 0
        ){

            mosquitoManSanityValue = 0;

        }


        mosquitoManSanity.innerText =
            mosquitoManSanityValue +
            "%";

        updateSanityMusic(
    mosquitoManSanityValue
);


        updateManExpression();


        manStatus.innerText =
            "AAARGH!";


        mosquitoMovementStatus.innerText =
            "🩸 BITE! FLY ANYWHERE!";


        if(
            mosquitoManSanityValue <= 0
        ){

            mosquitoGameStarted = false;

            showMosquitoEndScreen(true);

            return;

        }


        showFreeFlight();

        return;

    }


    // =========================================
    // NORMAL MISS
    // =========================================

    attackSquare.classList.add(
        "man-miss"
    );


    turnsWithoutBite++;


    mosquitoManSanityValue -= 1;


    if(
        mosquitoManSanityValue < 0
    ){

        mosquitoManSanityValue = 0;

    }


    mosquitoManSanity.innerText =
        mosquitoManSanityValue +
        "%";

    updateSanityMusic(
    mosquitoManSanityValue
);


    updateManExpression();


    manStatus.innerText =
        "Damn...";


    mosquitoMovementStatus.innerText =
        "🔴 The Man attacked " +
        mosquitoLetters[attackCol] +
        (attackRow + 1) +
        " — MISS";


    // =========================================
    // SANITY LOSS
    // =========================================

    if(
        mosquitoManSanityValue <= 0
    ){

        mosquitoGameStarted = false;

        showMosquitoEndScreen(true);

        return;

    }


    // =========================================
    // FIVE TURNS WITHOUT BITE
    // =========================================

    checkInformationReveal();


    // =========================================
    // CONTINUE
    // =========================================

    showMosquitoMovement();

}


// ===================================================
// COMPUTER ATTACK AI
// ===================================================

function chooseComputerAttack(){

    // -----------------------------------------
    // 1. If exact row/column information exists
    // -----------------------------------------

    if(
        revealedInformation.length > 0
    ){

        const latest =
            revealedInformation[
                revealedInformation.length - 1
            ];


        if(latest.type === "row"){

            const row =
                latest.value;


            return {

                row: row,

                col:
                    Math.floor(
                        Math.random() * 6
                    )

            };

        }


        if(latest.type === "column"){

            const col =
                latest.value;


            return {

                row:
                    Math.floor(
                        Math.random() * 6
                    ),

                col: col

            };

        }

    }


    // -----------------------------------------
    // 2. Otherwise random
    // -----------------------------------------

    return {

        row:
            Math.floor(
                Math.random() * 6
            ),

        col:
            Math.floor(
                Math.random() * 6
            )

    };

}


// ===================================================
// FIVE-TURN INFORMATION REVEAL
// ===================================================

function checkInformationReveal(){

    if(
        turnsWithoutBite < 5
    ){

        return;

    }


    turnsWithoutBite = 0;


    const revealType =

        revealedInformation.length % 2 === 0
            ? "row"
            : "column";


    if(
        revealType === "row"
    ){

        const revealedRow =
            mosquitoPlayer.row;


        revealedInformation.push({

            type: "row",

            value: revealedRow

        });


        mosquitoMovementStatus.innerText =
            "⚠️ THE MAN DISCOVERED YOUR ROW: " +
            (revealedRow + 1);


        manStatus.innerText =
            "I KNOW YOUR ROW.";


        console.log(
            "🧠 COMPUTER LEARNED:",
            "ROW",
            revealedRow + 1
        );

    }


    else{

        const revealedCol =
            mosquitoPlayer.col;


        revealedInformation.push({

            type: "column",

            value: revealedCol

        });


        mosquitoMovementStatus.innerText =
            "⚠️ THE MAN DISCOVERED YOUR COLUMN: " +
            mosquitoLetters[revealedCol];


        manStatus.innerText =
            "I KNOW YOUR COLUMN.";


        console.log(
            "🧠 COMPUTER LEARNED:",
            "COLUMN",
            mosquitoLetters[revealedCol]
        );

    }

}


// ===================================================
// LIE COUNT
// ===================================================

function getLieCount(){

    if(
        mosquitoManSanityValue >= 50
    ){

        return 0;

    }


    return Math.floor(
        (50 - mosquitoManSanityValue) / 10
    );

}


// ===================================================
// GENERATE SANITY CLUES
// ===================================================

function generateComputerClues(){

    if(
        mosquitoManSanityValue >= 50
    ){

        return;

    }


    const lieCount =
        getLieCount();


    computerClues = [];


    // =========================================
    // ONE TRUE ROW
    // =========================================

    computerClues.push({

        truth: true,

        row:
            mosquitoPlayer.row,

        text:
            "Mosquito is in row " +
            (mosquitoPlayer.row + 1)

    });


    // =========================================
    // LIES
    // =========================================

    for(
        let i = 0;
        i < lieCount;
        i++
    ){

        let fakeRow;


        do{

            fakeRow =
                Math.floor(
                    Math.random() * 6
                );

        }
        while(
            fakeRow === mosquitoPlayer.row
        );


        computerClues.push({

            truth: false,

            row: fakeRow,

            text:
                "Mosquito is in row " +
                (fakeRow + 1)

        });

    }


    // =========================================
    // SHUFFLE
    // =========================================

    computerClues.sort(
        () => Math.random() - 0.5
    );


    console.log(
        "🧠 COMPUTER CLUES:",
        computerClues
    );

}


// ===================================================
// UPDATE MAN EXPRESSION
// ===================================================

function updateManExpression(){

    // =========================================
    // NORMAL
    // =========================================

    if(
        mosquitoManSanityValue >= 50
    ){

        manPortrait.src =
            "images/mannormal.png";


        manStatus.innerText =
            "I'm going to find you.";

        return;

    }


    // =========================================
    // PISSED
    // =========================================

    if(
        mosquitoManSanityValue > 30
    ){

        manPortrait.src =
            "images/manpissed.png";


        manStatus.innerText =
            "You are really starting to piss me off.";

        generateComputerClues();

        return;

    }


    // =========================================
    // INSANE
    // =========================================

    manPortrait.src =
        "images/maninsane.png";


    manStatus.innerText =
        "I KNOW YOU'RE HERE.";


    generateComputerClues();

}


// ===================================================
// MOSQUITO END SCREEN
// ===================================================

function showMosquitoEndScreen(
    mosquitoWon
){

    mosquitoGameStarted = false;

        playVictoryMusic();

    mosquitoCanMove = false;


    mosquitoGameScreen.classList.add(
        "hidden"
    );


    const endScreen =
        document.getElementById(
            "endScreen"
        );

    const endTitle =
        document.getElementById(
            "endTitle"
        );

    const endImage =
        document.getElementById(
            "endImage"
        );

    const endMessage =
        document.getElementById(
            "endMessage"
        );


    endScreen.classList.remove(
        "hidden"
    );


    if(mosquitoWon){

        endTitle.innerText =
            "🦟 MOSQUITO WINS!";


        endImage.src =
            "images/mosquitowin.png";


        endMessage.innerText =
            "The Man lost all his sanity!\n" +
            "Mosquito-chan survives another day.";

    }

    else{

        endTitle.innerText =
            "💀 MAN WINS!";


        endImage.src =
            "images/manwin.png";


        endMessage.innerText =
            "The Man finally caught Mosquito-chan!";

    }

}


// ===================================================
// PLAY AS MOSQUITO BUTTON
// ===================================================

document.getElementById(
    "mosquitoBtn"
).onclick = function(){

    mainMenu.classList.add(
        "hidden"
    );

    modeMenu.classList.add(
        "hidden"
    );

    gameScreen.classList.add(
        "hidden"
    );

    document.getElementById(
        "endScreen"
    ).classList.add(
        "hidden"
    );


    mosquitoGameScreen.classList.remove(
        "hidden"
    );


    startMosquitoMode();

};


// ===================================================
// PLAY AGAIN
// ===================================================

document.getElementById(
    "playAgainBtn"
).onclick = function(){

    if(
        currentGameMode === "mosquito"
    ){

        document.getElementById(
            "endScreen"
        ).classList.add(
            "hidden"
        );


        mosquitoGameScreen.classList.remove(
            "hidden"
        );


        startMosquitoMode();

        return;

    }


    if(
        currentGameMode === "man"
    ){

        document.getElementById(
            "endScreen"
        ).classList.add(
            "hidden"
        );


        gameScreen.classList.remove(
            "hidden"
        );


        startGame();

        return;

    }

};


// ===================================================
// MAIN MENU
// ===================================================

document.getElementById(
    "menuBtn"
).onclick = function(){

    mosquitoGameStarted = false;

    mosquitoCanMove = false;


    document.getElementById(
        "endScreen"
    ).classList.add(
        "hidden"
    );


    mosquitoGameScreen.classList.add(
        "hidden"
    );


    gameScreen.classList.add(
        "hidden"
    );


    modeMenu.classList.add(
        "hidden"
    );


    mainMenu.classList.remove(
        "hidden"
    );

};
