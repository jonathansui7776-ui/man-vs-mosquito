// ===================================================
// MAN VS MOSQUITO
// SCRIPT.JS
// NORMAL GAME + MUSIC SYSTEM
// ===================================================


// ===================================================
// DIALOGUE
// ===================================================

const dialogues = {

    miss: [
        "BWAHAHA! Too slow!",
        "You'll never catch me!",
        "Skill issue.",
        "Wrong square.",
        "Hehehe~"
    ],

    near: [
        "W-Whoa!",
        "That was close!",
        "Lucky guess!",
        "H-Hey!"
    ],

    bite: [
        "Gotcha~",
        "Thanks for the blood.",
        "BWAHAHA!"
    ],

    caught: [
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
// HARDCORE AUDIO STATE
// ===================================================
//
// hardcore.js sets this to true while Hardcore
// is running.
//
// This prevents the normal music system from
// accidentally restarting lounge.mp3.
// ===================================================

window.hardcoreActive = false;


// ===================================================
// MUSIC SYSTEM
// ===================================================

const MUSIC_PATH = "music/";

const gameMusic = {

    lounge:
        new Audio(
            MUSIC_PATH + "lounge.mp3"
        ),

    phase1:
        new Audio(
            MUSIC_PATH + "phase1.mp3"
        ),

    phase2:
        new Audio(
            MUSIC_PATH + "phase2.mp3"
        ),

    phase3:
        new Audio(
            MUSIC_PATH + "phase3.mp3"
        )

};


let currentMusicName = null;

let currentMusic = null;


// ===================================================
// CONFIGURE MUSIC
// ===================================================

Object.values(gameMusic).forEach(
    function(audio) {

        audio.loop = true;

        audio.volume = 0.45;

        audio.preload = "auto";

    }
);


// Make the music system accessible to Hardcore.
window.gameMusic = gameMusic;


// ===================================================
// STOP ALL NORMAL MUSIC
// ===================================================

function stopGameMusic() {

    Object.values(gameMusic).forEach(
        function(audio) {

            audio.pause();

            audio.currentTime = 0;

        }
    );


    currentMusic =
        null;

    currentMusicName =
        null;

}


window.stopGameMusic =
    stopGameMusic;


// ===================================================
// PLAY MUSIC
// ===================================================

function playGameMusic(name) {

    /*
       NEVER allow normal music to start while
       Hardcore mode is active.
    */

    if (
        window.hardcoreActive
    ) {

        return;

    }


    const nextMusic =
        gameMusic[name];


    if (!nextMusic) {

        return;

    }


    /*
       Already playing.
    */

    if (
        currentMusic === nextMusic &&
        !nextMusic.paused
    ) {

        return;

    }


    /*
       Stop previous music.
    */

    if (
        currentMusic &&
        currentMusic !== nextMusic
    ) {

        currentMusic.pause();

        currentMusic.currentTime = 0;

    }


    currentMusicName =
        name;

    currentMusic =
        nextMusic;


    nextMusic.currentTime =
        0;


    nextMusic.play().catch(
        function() {

            /*
               Browser autoplay protection.
               Pointer interaction below will
               retry playback.
            */

        }
    );

}


// ===================================================
// MAIN MENU MUSIC
// ===================================================

function playMainMenuMusic() {

    /*
       Hardcore is no longer active when
       returning to the normal menu.
    */

    window.hardcoreActive =
        false;

    playGameMusic("lounge");

}


window.playMainMenuMusic =
    playMainMenuMusic;


// ===================================================
// VICTORY MUSIC
// ===================================================

function playVictoryMusic() {

    /*
       Normal game victory screen.
    */

    if (
        window.hardcoreActive
    ) {

        return;

    }

    playGameMusic("lounge");

}


// ===================================================
// SANITY MUSIC
// ===================================================

function updateSanityMusic(value) {

    /*
       Never interfere with Hardcore music.
    */

    if (
        window.hardcoreActive
    ) {

        return;

    }


    value =
        Number(value);


    if (
        !Number.isFinite(value)
    ) {

        return;

    }


    /*
       ABOVE 50
    */

    if (
        value > 50
    ) {

        playGameMusic("phase1");

    }


    /*
       31–50
    */

    else if (
        value > 30
    ) {

        playGameMusic("phase2");

    }


    /*
       0–30
    */

    else {

        playGameMusic("phase3");

    }

}


// ===================================================
// AUTOPLAY FIX
// ===================================================

document.addEventListener(
    "pointerdown",
    function() {

        /*
           IMPORTANT:
           Do NOT restart lounge/phase music
           during Hardcore.
        */

        if (
            window.hardcoreActive
        ) {

            return;

        }


        if (
            currentMusic &&
            currentMusic.paused
        ) {

            currentMusic.play().catch(
                function() {}
            );

        }

    },
    {
        passive: true
    }
);


// ===================================================
// START MENU MUSIC
// ===================================================

playMainMenuMusic();


// ===================================================
// GAME VARIABLES
// ===================================================

const letters =
    "ABCDEF";

let sanity =
    100;

let gamble =
    3;

let turn =
    1;

let missStreak =
    0;

let gameStarted =
    false;

let gambleMode =
    false;

let boardCreated =
    false;

let lastHighlighted =
    [];

let currentGameMode =
    null;


// ===================================================
// MOSQUITO POSITION
// ===================================================

let mosquito = {

    row: 0,

    col: 0

};


// ===================================================
// BOARD SQUARES
// ===================================================

let squares = [];


// ===================================================
// HUD
// ===================================================

function updateHUD() {

    if (sanityValue) {

        sanityValue.innerText =
            sanity + "%";

    }


    if (gambleValue) {

        gambleValue.innerText =
            gamble;

    }


    if (turnValue) {

        turnValue.innerText =
            turn;

    }


    updateSanityMusic(
        sanity
    );

}


// ===================================================
// PORTRAIT
// ===================================================

function setExpression(name) {

    if (!portrait) {

        return;

    }


    portrait.src =
        "images/" +
        name +
        ".png";

}


// ===================================================
// MOSQUITO TAUNT SYSTEM
// ===================================================

function showMosquitoTaunt(type) {

    if (!gameStarted) {

        return;

    }


    if (type === "miss") {

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


    if (type === "near") {

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


    if (type === "bite") {

        status.innerText =
            dialogues.bite[
                Math.floor(
                    Math.random() *
                    dialogues.bite.length
                )
            ];

        return;

    }


    if (type === "caught") {

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

function clearHighlights() {

    for (
        const square
        of lastHighlighted
    ) {

        square.style.background =
            "";

    }


    lastHighlighted = [];

}


// ===================================================
// END SCREEN
// ===================================================

function showEndScreen(playerWon) {

    gameStarted =
        false;

    playVictoryMusic();


    const endScreen =
        document.getElementById(
            "endScreen"
        );


    if (endScreen) {

        show(endScreen);

    }


    const title =
        document.getElementById(
            "endTitle"
        );

    const image =
        document.getElementById(
            "endImage"
        );

    const message =
        document.getElementById(
            "endMessage"
        );


    if (playerWon) {

        title.innerText =
            "🏆 YOU WIN";

        image.src =
            "images/manwin.png";

        message.innerText =
            "Mosquito-chan:\n" +
            "\"N-No... Impossible...\"";

    }

    else {

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

function show(screen) {

    const screens = [

        document.getElementById("mainMenu"),

        document.getElementById("modeMenu"),

        document.getElementById("playerModeMenu"),

        document.getElementById("gameScreen"),

        document.getElementById("mosquitoGameScreen"),

        document.getElementById("multiplayerManScreen"),

        document.getElementById("multiplayerMosquitoScreen"),

        document.getElementById("hardcoreScreen"),

        document.getElementById("endScreen")

    ];


    screens.forEach(
        function(currentScreen) {

            if (currentScreen) {

                currentScreen.classList.add(
                    "hidden"
                );

            }

        }
    );


    if (screen) {

        screen.classList.remove(
            "hidden"
        );

    }

}


// ===================================================
// START NORMAL MAN GAME
// ===================================================

function startGame() {

    currentGameMode =
        "man";


    window.hardcoreActive =
        false;


    sanity =
        100;

    gamble =
        3;

    turn =
        1;

    missStreak =
        0;

    gambleMode =
        false;


    mosquito.row =
        Math.floor(
            Math.random() * 6
        );

    mosquito.col =
        Math.floor(
            Math.random() * 6
        );


    gameStarted =
        true;


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

function moveMosquito() {

    if (
        Math.random() < 0.5
    ) {

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


    const moves = [

        [-1, 0],

        [1, 0],

        [0, -1],

        [0, 1]

    ];


    const legal = [];


    for (
        const move
        of moves
    ) {

        const nr =
            mosquito.row +
            move[0];

        const nc =
            mosquito.col +
            move[1];


        if (
            nr >= 0 &&
            nr < 6 &&
            nc >= 0 &&
            nc < 6
        ) {

            legal.push([
                nr,
                nc
            ]);

        }

    }


    if (
        legal.length === 0
    ) {

        return;

    }


    const choice =
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

function teleportMosquito() {

    const oldRow =
        mosquito.row;

    const oldCol =
        mosquito.col;


    do {

        mosquito.row =
            Math.floor(
                Math.random() * 6
            );

        mosquito.col =
            Math.floor(
                Math.random() * 6
            );

    }

    while (
        mosquito.row === oldRow &&
        mosquito.col === oldCol
    );

}


// ===================================================
// REVEAL SYSTEM
// ===================================================

function revealHint() {

    const truths = [];

    const lies = [];


    truths.push(
        "Row " +
        (mosquito.row + 1)
    );


    truths.push(
        "Column " +
        letters[mosquito.col]
    );


    for (
        let i = 1;
        i <= 6;
        i++
    ) {

        if (
            i !== mosquito.row + 1
        ) {

            lies.push(
                "Row " +
                i
            );

        }

    }


    for (
        let i = 0;
        i < 6;
        i++
    ) {

        if (
            i !== mosquito.col
        ) {

            lies.push(
                "Column " +
                letters[i]
            );

        }

    }


    if (
        sanity >= 50
    ) {

        status.innerText =
            "🦟 Fine...\n" +
            truths[
                Math.floor(
                    Math.random() *
                    truths.length
                )
            ];


        missStreak =
            0;


        setTimeout(
            function() {

                if (gameStarted) {

                    showMosquitoTaunt(
                        "miss"
                    );

                }

            },
            1800
        );


        return;

    }


    const lieCount =
        Math.floor(
            (49 - sanity) / 10
        ) + 1;


    const clues = [];


    clues.push(
        truths[
            Math.floor(
                Math.random() *
                truths.length
            )
        ]
    );


    lies.sort(
        () =>
            Math.random() -
            0.5
    );


    for (
        let i = 0;
        i < lieCount;
        i++
    ) {

        clues.push(
            lies[i]
        );

    }


    clues.sort(
        () =>
            Math.random() -
            0.5
    );


    status.innerText =
        "🦟 Hmm... Maybe this helps...\n\n" +
        clues.join("\n");


    missStreak =
        0;


    setTimeout(
        function() {

            if (gameStarted) {

                showMosquitoTaunt(
                    "miss"
                );

            }

        },
        2500
    );

}


// ===================================================
// CREATE BOARD
// ===================================================

function createBoard() {

    if (boardCreated) {

        return;

    }


    boardCreated =
        true;


    const corner =
        document.createElement(
            "div"
        );

    corner.className =
        "label";

    board.appendChild(
        corner
    );


    for (
        let c = 0;
        c < 6;
        c++
    ) {

        const label =
            document.createElement(
                "div"
            );

        label.className =
            "label";

        label.innerText =
            letters[c];

        board.appendChild(
            label
        );

    }


    for (
        let r = 0;
        r < 6;
        r++
    ) {

        const rowLabel =
            document.createElement(
                "div"
            );

        rowLabel.className =
            "label";

        rowLabel.innerText =
            r + 1;

        board.appendChild(
            rowLabel
        );


        if (!squares[r]) {

            squares[r] = [];

        }


        for (
            let c = 0;
            c < 6;
            c++
        ) {

            const square =
                document.createElement(
                    "button"
                );


            square.className =
                "square";


            squares[r][c] =
                square;


            square.onclick =
                function() {

                    if (gambleMode) {

                        gambleAttack(
                            r,
                            c
                        );

                        return;

                    }


                    if (!gameStarted) {

                        return;

                    }


                    clearHighlights();


                    /*
                       HIT
                    */

                    if (
                        r === mosquito.row &&
                        c === mosquito.col
                    ) {

                        square.style.background =
                            "#00bb44";

                        lastHighlighted.push(
                            square
                        );


                        showMosquitoTaunt(
                            "caught"
                        );


                        missStreak =
                            0;

                        gameStarted =
                            false;


                        showEndScreen(
                            true
                        );


                        return;

                    }


                    /*
                       NEAR MISS
                    */

                    const distance =
                        Math.abs(
                            r -
                            mosquito.row
                        ) +
                        Math.abs(
                            c -
                            mosquito.col
                        );


                    if (
                        distance === 1
                    ) {

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


                        missStreak =
                            0;

                    }


                    /*
                       MISS
                    */

                    else {

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


                        if (
                            missStreak >= 5
                        ) {

                            revealHint();

                        }

                        else {

                            showMosquitoTaunt(
                                "miss"
                            );

                            moveMosquito();

                        }

                    }


                    turn++;

                    updateHUD();


                    if (
                        sanity <= 0
                    ) {

                        sanity =
                            0;

                        updateHUD();

                        gameStarted =
                            false;

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
function() {

    show(modeMenu);

};


document.getElementById(
    "backBtn"
).onclick =
function() {

    show(mainMenu);

    playMainMenuMusic();

};


document.getElementById(
    "manBtn"
).onclick =
function() {

    show(gameScreen);

    createBoard();

    startGame();

};


document.getElementById(
    "mosquitoBtn"
).onclick =
function() {

    /*
       mosquito.js owns this button.
    */

};


document.getElementById(
    "vsPlayerBtn"
).onclick =
function() {

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
function() {

    playerModeMenu.classList.add(
        "hidden"
    );

    mainMenu.classList.remove(
        "hidden"
    );

    playMainMenuMusic();

};


document.getElementById(
    "rulesBtn"
).onclick =
function() {

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
function() {

    if (!gameStarted) {

        return;

    }


    if (gamble <= 0) {

        alert(
            "No Gambles Remaining!"
        );

        return;

    }


    gambleMode =
        true;


    status.innerText =
        "🎲 Gamble Ready! Click the TOP-LEFT square.";

};


// ===================================================
// GAMBLE ATTACK
// ===================================================

function gambleAttack(r, c) {

    gambleMode =
        false;


    gamble--;


    updateHUD();


    if (
        r > 4 ||
        c > 4
    ) {

        status.innerText =
            "Choose between A1 and E5.";


        gamble++;

        updateHUD();


        setTimeout(
            function() {

                if (gameStarted) {

                    showMosquitoTaunt(
                        "miss"
                    );

                }

            },
            1000
        );


        return;

    }


    let hit =
        false;


    const area = [

        [r, c],

        [r, c + 1],

        [r + 1, c],

        [r + 1, c + 1]

    ];


    for (
        const cell
        of area
    ) {

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


        if (
            mosquito.row === cell[0] &&
            mosquito.col === cell[1]
        ) {

            hit =
                true;

        }

    }


    setTimeout(
        function() {

            if (hit) {

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

            else {

                for (
                    const cell
                    of area
                ) {

                    squares[
                        cell[0]
                    ][
                        cell[1]
                    ].style.background =
                        "#993333";

                }


                sanity -= 20;


                if (sanity < 0) {

                    sanity =
                        0;

                }


                updateHUD();


                setExpression(
                    "smug"
                );


                status.innerText =
                    "💀 Gamble Failed! (-20 Sanity)";


                moveMosquito();

                turn++;

                updateHUD();


                if (
                    sanity <= 0
                ) {

                    gameStarted =
                        false;

                    showEndScreen(
                        false
                    );

                    return;

                }


                setTimeout(
                    function() {

                        if (gameStarted) {

                            showMosquitoTaunt(
                                "miss"
                            );

                        }

                    },
                    1200
                );

            }

        },
        300
    );

}


// ===================================================
// PLAY AGAIN
// ===================================================

document.getElementById(
    "playAgainBtn"
).onclick =
function() {

    if (
        currentGameMode === "mosquito"
    ) {

        return;

    }


    document.getElementById(
        "endScreen"
    ).classList.add(
        "hidden"
    );


    board.innerHTML =
        "";


    squares = [];

    boardCreated =
        false;


    show(gameScreen);

    createBoard();

    startGame();

};


// ===================================================
// MAIN MENU
// ===================================================

document.getElementById(
    "menuBtn"
).onclick =
function() {

    if (
        currentGameMode === "mosquito"
    ) {

        return;

    }


    document.getElementById(
        "endScreen"
    ).classList.add(
        "hidden"
    );


    board.innerHTML =
        "";


    squares = [];

    boardCreated =
        false;


    show(mainMenu);

    playMainMenuMusic();

};
