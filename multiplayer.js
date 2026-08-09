// ============================================================
// MAN VS MOSQUITO
// MULTIPLAYER.JS
// ============================================================


// ============================================================
// CONNECTION
// ============================================================

const MP_WS_URL =
    "wss://man-vs-mosquito.onrender.com";

const mpSocket =
    new WebSocket(MP_WS_URL);


// ============================================================
// BOARD
// ============================================================

const MP_ROWS = 6;
const MP_COLS = 6;


// ============================================================
// GLOBAL MULTIPLAYER STATE
// ============================================================

window.multiplayerRole = null;
window.multiplayerRoomCode = null;
window.multiplayerConnected = false;


// ============================================================
// ROUND STATE
// ============================================================

let mpManSanity = 100;
let mpManTurn = 1;
let mpGambles = 3;
let mpBiteFreeTurns = 0;

let mpManCanAttack = false;
let mpWaitingForAttack = false;

let mpMosquitoReady = false;
let mpMosquitoCanMove = false;
let mpMosquitoMoveReason = null;

let mpMosquitoRow = null;
let mpMosquitoCol = null;

let mpSelectedManCell = null;
let mpSelectedMosquitoCell = null;

let mpLastAttackRow = null;
let mpLastAttackCol = null;
let mpLastAttackResult = null;

let mpGambleMode = false;

let mpRestartRequested = false;


// ============================================================
// DOM HELPER
// ============================================================

function mpGet(...ids) {

    for (const id of ids) {

        const element =
            document.getElementById(id);

        if (element) {
            return element;
        }
    }

    return null;
}


// ============================================================
// LOBBY
// ============================================================

const mpCreateGameBtn =
    mpGet("createGameBtn");

const mpJoinGameBtn =
    mpGet("joinGameBtn");

const mpCreateGamePanel =
    mpGet("createGamePanel");

const mpJoinGamePanel =
    mpGet("joinGamePanel");

const mpRoomCode =
    mpGet("roomCode");

const mpRoomCodeInput =
    mpGet("roomCodeInput");

const mpJoinRoomBtn =
    mpGet("joinRoomBtn");

const mpLobbyStatus =
    mpGet("lobbyStatus");

const mpJoinStatus =
    mpGet("joinStatus");

const mpPlayerBackBtn =
    mpGet("playerBackBtn");


// ============================================================
// MULTIPLAYER SCREENS
// ============================================================

const mpLobbyScreen =
    mpGet("playerModeMenu");

const mpManScreen =
    mpGet("multiplayerManScreen");

const mpMosquitoScreen =
    mpGet("multiplayerMosquitoScreen");


// ============================================================
// BOARDS
// ============================================================

const mpManBoard =
    mpGet("multiplayerManBoard");

const mpMosquitoBoard =
    mpGet("multiplayerMosquitoBoard");


// ============================================================
// MAN HUD
// ============================================================

const mpManSanityEl =
    mpGet(
        "multiplayerManSanity",
        "mpManSanity"
    );

const mpManGambleEl =
    mpGet(
        "multiplayerManGamble",
        "mpManGamble"
    );

const mpManTurnEl =
    mpGet(
        "multiplayerManTurn",
        "mpManTurn"
    );

const mpGambleBtn =
    mpGet(
        "multiplayerGambleBtn"
    );

const mpManStatus =
    mpGet(
        "multiplayerStatus",
        "mpManStatus"
    );


// ============================================================
// MOSQUITO HUD
// ============================================================
//
// IMPORTANT:
// The current HTML uses:
//
// mpMosquitoSanity
// mpMosquitoTurn
//
// ============================================================

const mpMosquitoSanityEl =
    mpGet(
        "mpMosquitoSanity",
        "mosquitoManSanity",
        "multiplayerMosquitoManSanity",
        "mpMosquitoManSanity"
    );

const mpMosquitoTurnEl =
    mpGet(
        "mpMosquitoTurn",
        "mosquitoTurnValue",
        "multiplayerMosquitoTurn"
    );

const mpMosquitoStatus =
    mpGet(
        "mpMosquitoStatus",
        "multiplayerMosquitoStatus",
        "manStatus"
    );

const mpMosquitoMovementStatus =
    mpGet(
        "multiplayerMosquitoMovementStatus"
    );


// ============================================================
// MOSQUITO HIDE BUTTON
// ============================================================

const mpHideBtn =
    mpGet(
        "multiplayerHideBtn",
        "confirmMultiplayerMosquitoBtn",
        "confirmMosquitoBtn"
    );


// ============================================================
// MOVEMENT CONTROLS
// ============================================================

let mpMovementControls = null;
let mpStayBtn = null;
let mpMoveBtn = null;


// ============================================================
// POSITION
// ============================================================

function mpPosition(row, col) {

    return (
        String.fromCharCode(65 + row) +
        (col + 1)
    );

}


// ============================================================
// VALID POSITION
// ============================================================

function mpValid(row, col) {

    return (
        row >= 0 &&
        row < MP_ROWS &&
        col >= 0 &&
        col < MP_COLS
    );

}


// ============================================================
// SEND
// ============================================================

function mpSend(data) {

    if (
        mpSocket.readyState !==
        WebSocket.OPEN
    ) {

        console.error(
            "❌ Multiplayer socket is not open."
        );

        return false;
    }

    console.log(
        "📤 Multiplayer:",
        data
    );

    mpSocket.send(
        JSON.stringify(data)
    );

    return true;
}


// ============================================================
// HIDE ALL MULTIPLAYER SCREENS
// ============================================================

function mpHideScreens() {

    [
        mpLobbyScreen,
        mpManScreen,
        mpMosquitoScreen
    ]
    .forEach(function(screen) {

        if (screen) {

            screen.classList.add(
                "hidden"
            );

        }

    });

}


// ============================================================
// HIDE NORMAL GAME SCREENS
// ============================================================

function mpHideNormalScreens() {

    const gameScreen =
        document.getElementById(
            "gameScreen"
        );

    const mosquitoGameScreen =
        document.getElementById(
            "mosquitoGameScreen"
        );

    if (gameScreen) {

        gameScreen.classList.add(
            "hidden"
        );

    }

    if (mosquitoGameScreen) {

        mosquitoGameScreen.classList.add(
            "hidden"
        );

    }

}


// ============================================================
// REMOVE VICTORY SCREEN
// ============================================================

function mpRemoveVictory() {

    const screen =
        document.getElementById(
            "mpVictoryScreen"
        );

    if (screen) {

        screen.remove();

    }

}


// ============================================================
// CLEAR MOVEMENT HIGHLIGHTS
// ============================================================

function mpClearMovement() {

    [
        mpManBoard,
        mpMosquitoBoard
    ]
    .forEach(function(board) {

        if (!board) {
            return;
        }

        board
            .querySelectorAll(
                ".mpMosquitoMoveAllowed"
            )
            .forEach(function(cell) {

                cell.classList.remove(
                    "mpMosquitoMoveAllowed"
                );

                cell.style.background = "";
                cell.style.outline = "";

            });

    });

}


// ============================================================
// CLEAR ATTACK HIGHLIGHTS
// ============================================================

function mpClearAttackHighlights() {

    [
        mpManBoard,
        mpMosquitoBoard
    ]
    .forEach(function(board) {

        if (!board) {
            return;
        }

        board
            .querySelectorAll(
                ".multiplayerCell"
            )
            .forEach(function(cell) {

                cell.classList.remove(
                    "mpAttackRed"
                );

                cell.classList.remove(
                    "mpAttackOrange"
                );

                cell.classList.remove(
                    "mpAttackBlue"
                );

                cell.style.background = "";

            });

    });

}


// ============================================================
// REMOVE MOVEMENT CONTROLS
// ============================================================

function mpRemoveMovementControls() {

    if (mpMovementControls) {

        mpMovementControls.remove();

    }

    mpMovementControls = null;
    mpStayBtn = null;
    mpMoveBtn = null;

}


// ============================================================
// RESET ROUND
// ============================================================

function mpResetRound() {

    mpManSanity = 100;
    mpManTurn = 1;
    mpGambles = 3;
    mpBiteFreeTurns = 0;

    mpManCanAttack = false;
    mpWaitingForAttack = false;

    mpMosquitoReady = false;
    mpMosquitoCanMove = false;
    mpMosquitoMoveReason = null;

    mpMosquitoRow = null;
    mpMosquitoCol = null;

    mpSelectedManCell = null;
    mpSelectedMosquitoCell = null;

    mpLastAttackRow = null;
    mpLastAttackCol = null;
    mpLastAttackResult = null;

    mpGambleMode = false;
    mpRestartRequested = false;

    mpClearMovement();
    mpClearAttackHighlights();
    mpRemoveMovementControls();

    mpUpdateHUD();

}


// ============================================================
// HUD UPDATE
// ============================================================
//
// BOTH WINDOWS RECEIVE THE SAME SERVER SANITY.
//
// This function intentionally gets the mosquito HUD
// element directly from the DOM every time.
//
// ============================================================

function mpUpdateHUD() {

    const sanityText =
        String(mpManSanity) + "%";

    const turnText =
        String(mpManTurn);


    // ========================================================
    // MAN HUD
    // ========================================================

    const manSanityEl =
        document.getElementById(
            "mpManSanity"
        ) ||
        document.getElementById(
            "multiplayerManSanity"
        );


    const manTurnEl =
        document.getElementById(
            "mpManTurn"
        ) ||
        document.getElementById(
            "multiplayerManTurn"
        );


    if (manSanityEl) {

        manSanityEl.textContent =
            sanityText;

    }


    if (manTurnEl) {

        manTurnEl.textContent =
            turnText;

    }


    // ========================================================
    // MAN GAMBLE
    // ========================================================

    const gambleEl =
        document.getElementById(
            "mpManGamble"
        ) ||
        document.getElementById(
            "multiplayerManGamble"
        );


    if (gambleEl) {

        gambleEl.textContent =
            String(mpGambles);

    }


    // ========================================================
    // MOSQUITO HUD
    // ========================================================

    const mosquitoSanityEl =
        document.getElementById(
            "mpMosquitoSanity"
        ) ||
        document.getElementById(
            "mosquitoManSanity"
        ) ||
        document.getElementById(
            "multiplayerMosquitoManSanity"
        ) ||
        document.getElementById(
            "mpMosquitoManSanity"
        );


    const mosquitoTurnEl =
        document.getElementById(
            "mpMosquitoTurn"
        ) ||
        document.getElementById(
            "mosquitoTurnValue"
        ) ||
        document.getElementById(
            "multiplayerMosquitoTurn"
        );


    if (mosquitoSanityEl) {

        mosquitoSanityEl.textContent =
            sanityText;

        console.log(
            "🦟 MOSQUITO HUD UPDATED:",
            mosquitoSanityEl.textContent
        );

    }
    else {

        console.error(
            "❌ MOSQUITO SANITY ELEMENT NOT FOUND"
        );

    }


    if (mosquitoTurnEl) {

        mosquitoTurnEl.textContent =
            turnText;

    }


    console.log(
        "📊 HUD SYNC:",
        {
            sanity: mpManSanity,
            turn: mpManTurn,
            mosquitoSanityElement:
                mosquitoSanityEl
        }
    );

}


// ============================================================
// SET SERVER SANITY
// ============================================================

function mpSetServerSanity(value) {

    const number =
        Number(value);

    if (
        Number.isFinite(number)
    ) {

        mpManSanity =
            Math.max(
                0,
                Math.min(
                    100,
                    number
                )
            );

    }

    mpUpdateHUD();

}


// ============================================================
// SET SERVER TURN
// ============================================================

function mpSetServerTurn(value) {

    const number =
        Number(value);

    if (
        Number.isFinite(number)
    ) {

        mpManTurn =
            number;

    }

    mpUpdateHUD();

}


// ============================================================
// BOARD SETUP
// ============================================================

function mpSetupBoard(board) {

    if (!board) {
        return;
    }

    board.style.setProperty(
        "display",
        "grid",
        "important"
    );

    board.style.setProperty(
        "grid-template-columns",
        "repeat(6, 70px)",
        "important"
    );

    board.style.setProperty(
        "grid-template-rows",
        "repeat(6, 70px)",
        "important"
    );

    board.style.setProperty(
        "grid-auto-flow",
        "row",
        "important"
    );

    board.style.setProperty(
        "gap",
        "5px",
        "important"
    );

    board.style.setProperty(
        "width",
        "445px",
        "important"
    );

    board.style.setProperty(
        "height",
        "445px",
        "important"
    );

    board.style.setProperty(
        "margin",
        "20px auto",
        "important"
    );

}


// ============================================================
// CREATE CELL
// ============================================================

function mpCreateCell(row, col) {

    const cell =
        document.createElement(
            "button"
        );

    cell.className =
        "multiplayerCell";

    cell.dataset.row =
        String(row);

    cell.dataset.col =
        String(col);

    cell.dataset.position =
        mpPosition(
            row,
            col
        );

    cell.innerText =
        cell.dataset.position;

    cell.style.width =
        "70px";

    cell.style.height =
        "70px";

    cell.style.boxSizing =
        "border-box";

    cell.style.display =
        "flex";

    cell.style.alignItems =
        "center";

    cell.style.justifyContent =
        "center";

    cell.style.position =
        "relative";

    cell.style.fontWeight =
        "bold";

    cell.style.cursor =
        "pointer";

    return cell;

}


// ============================================================
// CREATE MAN BOARD
// ============================================================

function mpCreateManBoard() {

    if (!mpManBoard) {

        console.error(
            "❌ multiplayerManBoard not found."
        );

        return;

    }

    mpManBoard.innerHTML = "";

    mpSetupBoard(
        mpManBoard
    );

    for (
        let row = 0;
        row < MP_ROWS;
        row++
    ) {

        for (
            let col = 0;
            col < MP_COLS;
            col++
        ) {

            const cell =
                mpCreateCell(
                    row,
                    col
                );

            cell.addEventListener(
                "click",
                function() {

                    mpManCellClicked(
                        cell
                    );

                }
            );

            mpManBoard.appendChild(
                cell
            );

        }

    }

    mpManBoard.style.pointerEvents =
        "none";

    mpManBoard.style.opacity =
        "0.55";

    console.log(
        "🧍 6×6 MULTIPLAYER MAN BOARD CREATED"
    );

}


// ============================================================
// CREATE MOSQUITO BOARD
// ============================================================

function mpCreateMosquitoBoard() {

    if (!mpMosquitoBoard) {

        console.error(
            "❌ multiplayerMosquitoBoard not found."
        );

        return;

    }

    mpMosquitoBoard.innerHTML = "";

    mpSetupBoard(
        mpMosquitoBoard
    );

    for (
        let row = 0;
        row < MP_ROWS;
        row++
    ) {

        for (
            let col = 0;
            col < MP_COLS;
            col++
        ) {

            const cell =
                mpCreateCell(
                    row,
                    col
                );

            cell.addEventListener(
                "click",
                function() {

                    mpMosquitoCellClicked(
                        cell
                    );

                }
            );

            mpMosquitoBoard.appendChild(
                cell
            );

        }

    }

    console.log(
        "🦟 6×6 MULTIPLAYER MOSQUITO BOARD CREATED"
    );

}


// ============================================================
// GET CELL
// ============================================================

function mpGetCell(
    board,
    row,
    col
) {

    if (!board) {
        return null;
    }

    return board.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
    );

}


// ============================================================
// SHOW MOSQUITO IMAGE
// ============================================================

function mpShowMosquito() {

    if (
        mpMosquitoRow === null ||
        mpMosquitoCol === null
    ) {

        return;

    }

    if (!mpMosquitoBoard) {
        return;
    }


    // Restore every tile's coordinate.

    mpMosquitoBoard
        .querySelectorAll(
            ".multiplayerCell"
        )
        .forEach(function(cell) {

            const image =
                cell.querySelector(
                    ".mpMosquitoImage"
                );

            if (image) {
                image.remove();
            }

            cell.innerText =
                cell.dataset.position;

        });


    const cell =
        mpGetCell(
            mpMosquitoBoard,
            mpMosquitoRow,
            mpMosquitoCol
        );


    if (!cell) {
        return;
    }


    cell.innerText = "";


    const image =
        document.createElement(
            "img"
        );


    image.src =
        "images/mosquitochan.png";

    image.className =
        "mpMosquitoImage";

    image.alt =
        "Mosquito-chan";

    image.style.width =
        "52px";

    image.style.height =
        "52px";

    image.style.objectFit =
        "contain";

    image.style.pointerEvents =
        "none";


    cell.appendChild(
        image
    );

}


// ============================================================
// MOSQUITO TILE CLICK
// ============================================================

function mpMosquitoCellClicked(cell) {

    // ========================================================
    // HIDING PHASE
    // ========================================================

    if (
        !mpMosquitoReady &&
        !mpMosquitoCanMove
    ) {

        if (
            mpSelectedMosquitoCell
        ) {

            mpSelectedMosquitoCell.classList.remove(
                "selected"
            );

        }

        mpSelectedMosquitoCell =
            cell;

        cell.classList.add(
            "selected"
        );

        if (mpHideBtn) {

            mpHideBtn.disabled =
                false;

        }

        if (mpMosquitoStatus) {

            mpMosquitoStatus.innerText =
                "Selected: " +
                cell.dataset.position;

        }

        return;

    }


    // ========================================================
    // MOVEMENT PHASE
    // ========================================================

    if (
        mpMosquitoCanMove
    ) {

        if (
            !cell.classList.contains(
                "mpMosquitoMoveAllowed"
            )
        ) {

            return;

        }

        if (
            mpSelectedMosquitoCell
        ) {

            mpSelectedMosquitoCell.classList.remove(
                "selected"
            );

        }

        mpSelectedMosquitoCell =
            cell;

        cell.classList.add(
            "selected"
        );

        if (mpMoveBtn) {

            mpMoveBtn.disabled =
                false;

        }

    }

}


// ============================================================
// HIDE HERE
// ============================================================

if (mpHideBtn) {

    mpHideBtn.onclick =
        function() {

            if (mpMosquitoReady) {
                return;
            }

            if (!mpSelectedMosquitoCell) {

                if (mpMosquitoStatus) {

                    mpMosquitoStatus.innerText =
                        "Select a square first.";

                }

                return;

            }

            const row =
                Number(
                    mpSelectedMosquitoCell.dataset.row
                );

            const col =
                Number(
                    mpSelectedMosquitoCell.dataset.col
                );

            const sent =
                mpSend({

                    type:
                        "mosquitoPosition",

                    roomCode:
                        window.multiplayerRoomCode,

                    row:
                        row,

                    col:
                        col

                });


            if (!sent) {
                return;
            }


            mpMosquitoReady =
                true;

            mpMosquitoRow =
                row;

            mpMosquitoCol =
                col;


            mpHideBtn.disabled =
                true;


            mpMosquitoBoard.style.pointerEvents =
                "none";

            mpMosquitoBoard.style.opacity =
                "0.55";


            mpShowMosquito();


            if (mpMosquitoStatus) {

                mpMosquitoStatus.innerText =
                    "🦟 Hidden! Waiting for the Man.";

            }


            if (
                mpMosquitoMovementStatus
            ) {

                mpMosquitoMovementStatus.innerText =
                    "The hunt has started.";

            }

        };

}


// ============================================================
// MAN ATTACK
// ============================================================

function mpManCellClicked(cell) {

    if (!mpManCanAttack) {
        return;
    }

    if (mpWaitingForAttack) {
        return;
    }


    const row =
        Number(
            cell.dataset.row
        );

    const col =
        Number(
            cell.dataset.col
        );


    // ========================================================
    // GAMBLE
    // ========================================================

    if (mpGambleMode) {

        mpPerformGamble(
            row,
            col
        );

        return;

    }


    // ========================================================
    // NORMAL ATTACK
    // ========================================================

    mpWaitingForAttack =
        true;

    mpManCanAttack =
        false;


    if (mpManBoard) {

        mpManBoard.style.pointerEvents =
            "none";

    }


    if (mpManStatus) {

        mpManStatus.innerText =
            "⚔️ Attacking " +
            cell.dataset.position +
            "...";

    }


    mpSend({

        type:
            "manAttack",

        roomCode:
            window.multiplayerRoomCode,

        row:
            row,

        col:
            col

    });

}


// ============================================================
// GAMBLE BUTTON
// ============================================================

if (mpGambleBtn) {

    mpGambleBtn.onclick =
        function() {

            if (!mpManCanAttack) {
                return;
            }

            if (mpGambles <= 0) {

                alert(
                    "No Gambles Remaining!"
                );

                return;

            }

            mpGambleMode =
                true;

            if (mpManStatus) {

                mpManStatus.innerText =
                    "🎲 MAD MAN'S GAMBLE: choose the TOP-LEFT tile of a 2×2 area (A1–E5).";

            }

        };

}


// ============================================================
// GAMBLE
// ============================================================

function mpPerformGamble(
    row,
    col
) {

    if (
        row > 4 ||
        col > 4
    ) {

        if (mpManStatus) {

            mpManStatus.innerText =
                "Choose a top-left tile from A1 to E5.";

        }

        return;

    }


    mpGambleMode =
        false;

    mpGambles--;


    mpUpdateHUD();


    mpWaitingForAttack =
        true;

    mpManCanAttack =
        false;


    if (mpManBoard) {

        mpManBoard.style.pointerEvents =
            "none";

    }


    const area = [

        [row, col],

        [row, col + 1],

        [row + 1, col],

        [row + 1, col + 1]

    ];


    area.forEach(function(position) {

        const tile =
            mpGetCell(
                mpManBoard,
                position[0],
                position[1]
            );

        if (tile) {

            tile.classList.add(
                "mpAttackBlue"
            );

            tile.style.background =
                "dodgerblue";

        }

    });


    mpSend({

        type:
            "manGamble",

        roomCode:
            window.multiplayerRoomCode,

        row:
            row,

        col:
            col

    });

}


// ============================================================
// ACTIVATE MAN
// ============================================================

function mpActivateMan() {

    mpManCanAttack =
        true;

    mpWaitingForAttack =
        false;


    if (mpManBoard) {

        mpManBoard.style.pointerEvents =
            "auto";

        mpManBoard.style.opacity =
            "1";

    }


    if (mpManStatus) {

        mpManStatus.innerText =
            "🦟 Mosquito is hidden. Find it!";

    }

}


// ============================================================
// SHOW ATTACK
// ============================================================

function mpShowAttack(
    row,
    col,
    result
) {

    // Only the latest attack remains highlighted.

    mpClearAttackHighlights();


    mpLastAttackRow =
        row;

    mpLastAttackCol =
        col;

    mpLastAttackResult =
        result;


    [
        mpManBoard,
        mpMosquitoBoard
    ]
    .forEach(function(board) {

        if (!board) {
            return;
        }


        const cell =
            mpGetCell(
                board,
                row,
                col
            );


        if (!cell) {
            return;
        }


        // ====================================================
        // BITE = ORANGE
        // ====================================================

        if (
            result ===
            "bite"
        ) {

            cell.classList.add(
                "mpAttackOrange"
            );

            cell.style.background =
                "orange";

        }


        // ====================================================
        // EVERYTHING ELSE = RED
        // ====================================================

        else {

            cell.classList.add(
                "mpAttackRed"
            );

            cell.style.background =
                "red";

        }

    });

}


// ============================================================
// CREATE MOVEMENT CONTROLS
// ============================================================

function mpCreateMovementControls() {

    mpRemoveMovementControls();


    mpMovementControls =
        document.createElement(
            "div"
        );


    mpMovementControls.style.display =
        "flex";

    mpMovementControls.style.justifyContent =
        "center";

    mpMovementControls.style.gap =
        "12px";

    mpMovementControls.style.margin =
        "15px auto";


    mpStayBtn =
        document.createElement(
            "button"
        );


    mpStayBtn.innerText =
        "🦟 Stay";


    mpMoveBtn =
        document.createElement(
            "button"
        );


    mpMoveBtn.innerText =
        "🦟 Move Here";

    mpMoveBtn.disabled =
        true;


    mpStayBtn.onclick =
        function() {

            mpMosquitoStay();

        };


    mpMoveBtn.onclick =
        function() {

            mpMosquitoMove();

        };


    mpMovementControls.appendChild(
        mpStayBtn
    );

    mpMovementControls.appendChild(
        mpMoveBtn
    );


    if (mpMosquitoBoard) {

        mpMosquitoBoard.parentNode.insertBefore(
            mpMovementControls,
            mpMosquitoBoard.nextSibling
        );

    }

}


// ============================================================
// HIGHLIGHT MOSQUITO MOVEMENT
// ============================================================

function mpHighlightMovement(
    reason,
    currentRow,
    currentCol
) {

    mpClearMovement();


    // ========================================================
    // BITE
    // ========================================================
    //
    // Mosquito can fly anywhere.
    //
    // ========================================================

    if (
        reason ===
        "bite"
    ) {

        for (
            let row = 0;
            row < MP_ROWS;
            row++
        ) {

            for (
                let col = 0;
                col < MP_COLS;
                col++
            ) {

                if (
                    row === currentRow &&
                    col === currentCol
                ) {

                    continue;

                }


                const cell =
                    mpGetCell(
                        mpMosquitoBoard,
                        row,
                        col
                    );


                if (cell) {

                    cell.classList.add(
                        "mpMosquitoMoveAllowed"
                    );

                    cell.style.background =
                        "rgba(0,120,255,.45)";

                    cell.style.outline =
                        "3px solid blue";

                }

            }

        }

        return;

    }


    // ========================================================
    // MISS
    // ========================================================
    //
    // Mosquito may stay OR move one square
    // orthogonally.
    //
    // ========================================================

    const directions = [

        [-1, 0],

        [1, 0],

        [0, -1],

        [0, 1]

    ];


    directions.forEach(
        function(direction) {

            const row =
                currentRow +
                direction[0];

            const col =
                currentCol +
                direction[1];


            if (
                !mpValid(
                    row,
                    col
                )
            ) {

                return;

            }


            const cell =
                mpGetCell(
                    mpMosquitoBoard,
                    row,
                    col
                );


            if (cell) {

                cell.classList.add(
                    "mpMosquitoMoveAllowed"
                );

                cell.style.background =
                    "rgba(0,120,255,.45)";

                cell.style.outline =
                    "3px solid blue";

            }

        }
    );

}


// ============================================================
// ENABLE MOSQUITO MOVEMENT
// ============================================================

function mpEnableMosquitoMovement(data) {

    mpMosquitoCanMove =
        true;

    mpMosquitoMoveReason =
        data.reason;


    if (data.currentPosition) {

        mpMosquitoRow =
            Number(
                data.currentPosition.row
            );

        mpMosquitoCol =
            Number(
                data.currentPosition.col
            );

    }


    mpSelectedMosquitoCell =
        null;


    mpCreateMovementControls();


    if (mpMosquitoBoard) {

        mpMosquitoBoard.style.pointerEvents =
            "auto";

        mpMosquitoBoard.style.opacity =
            "1";

    }


    mpShowMosquito();


    mpHighlightMovement(
        data.reason,
        mpMosquitoRow,
        mpMosquitoCol
    );


    if (mpMosquitoMovementStatus) {

        if (
            data.reason ===
            "bite"
        ) {

            mpMosquitoMovementStatus.innerText =
                "🩸 BITE! You may stay or fly anywhere.";

        }
        else {

            mpMosquitoMovementStatus.innerText =
                "❌ MISS! You may stay or move one square orthogonally.";

        }

    }

}


// ============================================================
// LOCK MOSQUITO MOVEMENT
// ============================================================

function mpLockMosquito() {

    mpMosquitoCanMove =
        false;

    mpMosquitoMoveReason =
        null;

    mpSelectedMosquitoCell =
        null;


    mpClearMovement();
    mpRemoveMovementControls();


    if (mpMosquitoBoard) {

        mpMosquitoBoard.style.pointerEvents =
            "none";

        mpMosquitoBoard.style.opacity =
            "0.55";

    }

}


// ============================================================
// MOSQUITO STAY
// ============================================================

function mpMosquitoStay() {

    if (!mpMosquitoCanMove) {
        return;
    }


    mpSend({

        type:
            "mosquitoMove",

        roomCode:
            window.multiplayerRoomCode,

        action:
            "stay"

    });

}


// ============================================================
// MOSQUITO MOVE
// ============================================================

function mpMosquitoMove() {

    if (!mpMosquitoCanMove) {
        return;
    }


    if (!mpSelectedMosquitoCell) {
        return;
    }


    const row =
        Number(
            mpSelectedMosquitoCell.dataset.row
        );

    const col =
        Number(
            mpSelectedMosquitoCell.dataset.col
        );


    mpSend({

        type:
            "mosquitoMove",

        roomCode:
            window.multiplayerRoomCode,

        action:
            "move",

        row:
            row,

        col:
            col

    });

}


// ============================================================
// OPEN MAN SCREEN
// ============================================================

function mpOpenMan() {

    console.log(
        "🧍 OPENING MULTIPLAYER MAN"
    );


    mpRemoveVictory();
    mpHideNormalScreens();
    mpHideScreens();


    if (!mpManScreen) {

        console.error(
            "❌ multiplayerManScreen not found."
        );

        return;

    }


    mpManScreen.classList.remove(
        "hidden"
    );


    mpManCanAttack =
        false;

    mpWaitingForAttack =
        false;

    mpGambleMode =
        false;


    mpCreateManBoard();

    mpUpdateHUD();


    if (mpManStatus) {

        mpManStatus.innerText =
            "Waiting for Mosquito...";

    }


    console.log(
        "✅ MULTIPLAYER MAN SCREEN OPENED"
    );

}


// ============================================================
// OPEN MOSQUITO SCREEN
// ============================================================

function mpOpenMosquito() {

    console.log(
        "🦟 OPENING MULTIPLAYER MOSQUITO"
    );


    mpRemoveVictory();
    mpHideNormalScreens();
    mpHideScreens();


    if (!mpMosquitoScreen) {

        console.error(
            "❌ multiplayerMosquitoScreen not found."
        );

        return;

    }


    mpMosquitoScreen.classList.remove(
        "hidden"
    );


    mpCreateMosquitoBoard();


    mpMosquitoReady =
        false;

    mpMosquitoCanMove =
        false;

    mpMosquitoMoveReason =
        null;

    mpSelectedMosquitoCell =
        null;


    mpRemoveMovementControls();
    mpClearMovement();


    if (mpHideBtn) {

        mpHideBtn.disabled =
            true;

    }


    if (mpMosquitoStatus) {

        mpMosquitoStatus.innerText =
            "Choose your hiding place.";

    }


    if (mpMosquitoMovementStatus) {

        mpMosquitoMovementStatus.innerText =
            "";

    }


    mpUpdateHUD();


    console.log(
        "✅ MULTIPLAYER MOSQUITO SCREEN OPENED"
    );

}


// ============================================================
// VICTORY SCREEN
// ============================================================

function mpShowVictory(winner) {

    mpRemoveVictory();


    mpManCanAttack =
        false;

    mpWaitingForAttack =
        false;

    mpMosquitoCanMove =
        false;


    mpClearMovement();
    mpRemoveMovementControls();


    const screen =
        document.createElement(
            "div"
        );


    screen.id =
        "mpVictoryScreen";


    screen.style.position =
        "fixed";

    screen.style.inset =
        "0";

    screen.style.zIndex =
        "99999";

    screen.style.background =
        "rgba(0,0,0,.96)";

    screen.style.display =
        "flex";

    screen.style.flexDirection =
        "column";

    screen.style.alignItems =
        "center";

    screen.style.justifyContent =
        "center";

    screen.style.textAlign =
        "center";


    const title =
        document.createElement(
            "h1"
        );


    const image =
        document.createElement(
            "img"
        );


    const restart =
        document.createElement(
            "button"
        );


    const leave =
        document.createElement(
            "button"
        );


    if (winner === "man") {

        title.innerText =
            "🎯 THE MAN WINS!";

        image.src =
            "images/manwin.png";

    }
    else {

        title.innerText =
            "🦟 MOSQUITO-CHAN WINS!";

        image.src =
            "images/mosquitowin.png";

    }


    image.style.maxWidth =
        "360px";

    image.style.maxHeight =
        "360px";

    image.style.objectFit =
        "contain";


    restart.innerText =
        "🔄 Restart";

    leave.innerText =
        "🚪 Leave Room";


    restart.style.margin =
        "10px";

    leave.style.margin =
        "10px";


    restart.onclick =
        function() {

            if (mpRestartRequested) {
                return;
            }


            mpRestartRequested =
                true;

            restart.disabled =
                true;

            restart.innerText =
                "⏳ Waiting for opponent...";


            mpSend({

                type:
                    "restartGame",

                roomCode:
                    window.multiplayerRoomCode

            });

        };


    leave.onclick =
        function() {

            mpSend({

                type:
                    "leaveRoom",

                roomCode:
                    window.multiplayerRoomCode

            });

        };


    screen.appendChild(title);
    screen.appendChild(image);
    screen.appendChild(restart);
    screen.appendChild(leave);

    document.body.appendChild(
        screen
    );

}


// ============================================================
// REJOIN AFTER RESTART
// ============================================================

function mpCheckRejoin() {

    const room =
        sessionStorage.getItem(
            "mpRestartRoom"
        );

    const role =
        sessionStorage.getItem(
            "mpRestartRole"
        );


    if (!room || !role) {
        return false;
    }


    window.multiplayerRoomCode =
        room;

    window.multiplayerRole =
        role;


    sessionStorage.removeItem(
        "mpRestartRoom"
    );

    sessionStorage.removeItem(
        "mpRestartRole"
    );


    console.log(
        "🔁 Rejoining multiplayer room:",
        room,
        role
    );


    mpSend({

        type:
            "rejoinRoom",

        roomCode:
            room,

        role:
            role

    });


    return true;

}


// ============================================================
// SOCKET OPEN
// ============================================================

mpSocket.onopen =
    function() {

        window.multiplayerConnected =
            true;


        console.log(
            "🌐 Connected to multiplayer server!"
        );


        mpCheckRejoin();

    };


// ============================================================
// SOCKET MESSAGE
// ============================================================

mpSocket.onmessage =
    function(event) {

        let data;


        try {

            data =
                JSON.parse(
                    event.data
                );

        }
        catch (error) {

            console.error(
                "❌ Invalid server message:",
                event.data
            );

            return;

        }


        console.log(
            "📨 Server:",
            data
        );


        // ========================================================
        // ROOM CREATED
        // ========================================================

        if (
            data.type ===
            "roomCreated"
        ) {

            window.multiplayerRole =
                data.role ||
                "man";

            window.multiplayerRoomCode =
                data.roomCode;


            if (mpRoomCode) {

                mpRoomCode.innerText =
                    data.roomCode;

            }


            if (mpCreateGamePanel) {

                mpCreateGamePanel.classList.remove(
                    "hidden"
                );

            }


            if (mpJoinGamePanel) {

                mpJoinGamePanel.classList.add(
                    "hidden"
                );

            }


            if (mpLobbyStatus) {

                mpLobbyStatus.innerText =
                    "Waiting for opponent...";

            }


            console.log(
                "🧍 Your multiplayer role: MAN"
            );


            return;

        }


        // ========================================================
        // PLAYER JOINED
        // ========================================================

        if (
            data.type ===
            "playerJoined"
        ) {

            if (mpLobbyStatus) {

                mpLobbyStatus.innerText =
                    "✅ Opponent connected!";

            }

            return;

        }


        // ========================================================
        // JOINED ROOM
        // ========================================================

        if (
            data.type ===
            "joinedRoom"
        ) {

            window.multiplayerRole =
                data.role ||
                "mosquito";

            window.multiplayerRoomCode =
                data.roomCode;


            if (mpJoinStatus) {

                mpJoinStatus.innerText =
                    "✅ Joined game!";

            }

            return;

        }


        // ========================================================
        // GAME START
        // ========================================================

        if (
            data.type ===
            "gameStart"
        ) {

            window.multiplayerRole =
                data.role;

            window.multiplayerRoomCode =
                data.roomCode;


            mpResetRound();


            console.log(
                "🎮 MULTIPLAYER GAME START"
            );


            console.log(
                "Room:",
                data.roomCode
            );


            console.log(
                "Role:",
                data.role
            );


            if (
                data.role ===
                "man"
            ) {

                mpOpenMan();

            }
            else if (
                data.role ===
                "mosquito"
            ) {

                mpOpenMosquito();

            }


            return;

        }


        // ========================================================
        // REJOIN ACCEPTED
        // ========================================================

        if (
            data.type ===
            "rejoinAccepted"
        ) {

            window.multiplayerRole =
                data.role;

            window.multiplayerRoomCode =
                data.roomCode;


            console.log(
                "✅ Rejoin accepted."
            );


            return;

        }


        // ========================================================
        // NEW ROUND
        // ========================================================

        if (
            data.type ===
            "newRound"
        ) {

            console.log(
                "🆕 NEW ROUND"
            );


            window.multiplayerRole =
                data.role;

            window.multiplayerRoomCode =
                data.roomCode;


            mpRemoveVictory();
            mpResetRound();


            if (
                data.role ===
                "man"
            ) {

                mpOpenMan();

            }
            else {

                mpOpenMosquito();

            }


            return;

        }


        // ========================================================
        // RESTART NOW
        // ========================================================

        if (
            data.type ===
            "restartNow"
        ) {

            console.log(
                "🔄 BOTH PLAYERS READY — RELOADING"
            );


            sessionStorage.setItem(
                "mpRestartRoom",
                window.multiplayerRoomCode
            );


            sessionStorage.setItem(
                "mpRestartRole",
                window.multiplayerRole
            );


            window.location.reload();


            return;

        }


        // ========================================================
        // RESTART WAITING
        // ========================================================

        if (
            data.type ===
            "restartWaiting"
        ) {

            mpRestartRequested =
                true;

            return;

        }


        // ========================================================
        // MOSQUITO READY
        // ========================================================

        if (
            data.type ===
            "mosquitoReady"
        ) {

            console.log(
                "🦟 MOSQUITO READY RECEIVED"
            );


            if (
                typeof data.sanity ===
                "number"
            ) {

                mpSetServerSanity(
                    data.sanity
                );

            }
            else {

                mpSetServerSanity(
                    100
                );

            }


            if (
                typeof data.turn ===
                "number"
            ) {

                mpManTurn =
                    Number(
                        data.turn
                    ) + 1;

            }
            else {

                mpManTurn =
                    1;

            }


            mpBiteFreeTurns =
                0;

            mpMosquitoReady =
                true;


            mpUpdateHUD();


            if (
                window.multiplayerRole ===
                "man"
            ) {

                mpActivateMan();

            }


            return;

        }


        // ========================================================
        // MOSQUITO HIDDEN
        // ========================================================

        if (
            data.type ===
            "mosquitoHidden"
        ) {

            if (mpMosquitoStatus) {

                mpMosquitoStatus.innerText =
                    "🦟 Hidden! The Man has started hunting.";

            }

            return;

        }


        // ========================================================
        // ATTACK RESULT
        // ========================================================

        if (
            data.type ===
            "attackResult"
        ) {

            console.log(
                "⚔️ ATTACK RESULT:",
                data
            );


            mpWaitingForAttack =
                false;


            // ==================================================
            // AUTHORITATIVE SERVER SANITY
            // ==================================================

            if (
                typeof data.sanity ===
                "number"
            ) {

                mpSetServerSanity(
                    data.sanity
                );

            }


            // ==================================================
            // AUTHORITATIVE SERVER TURN
            // ==================================================

            if (
                typeof data.turn ===
                "number"
            ) {

                mpSetServerTurn(
                    data.turn
                );

            }


            if (
                typeof data.biteFreeTurns ===
                "number"
            ) {

                mpBiteFreeTurns =
                    Number(
                        data.biteFreeTurns
                    );

            }


            if (
                typeof data.gambles ===
                "number"
            ) {

                mpGambles =
                    Number(
                        data.gambles
                    );

            }


            // Update AGAIN after all values arrive.

            mpUpdateHUD();


            // ==================================================
            // ATTACK VISUAL
            // ==================================================

            if (
                typeof data.attackRow ===
                "number" &&
                typeof data.attackCol ===
                "number"
            ) {

                mpShowAttack(
                    data.attackRow,
                    data.attackCol,
                    data.result
                );

            }


            // ==================================================
            // HIT
            // ==================================================

            if (
                data.result ===
                "hit"
            ) {

                mpManCanAttack =
                    false;

                return;

            }


            // ==================================================
            // BITE
            // ==================================================

            if (
                data.result ===
                "bite"
            ) {

                mpManCanAttack =
                    false;


                if (mpManStatus) {

                    mpManStatus.innerText =
                        "🩸 BITE! -10 Sanity. Mosquito can fly anywhere.";

                }


                if (mpMosquitoStatus) {

                    mpMosquitoStatus.innerText =
                        "🩸 You bit the Man! Choose Stay or fly anywhere.";

                }


                return;

            }


            // ==================================================
            // MISS
            // ==================================================

            if (
                data.result ===
                "miss"
            ) {

                mpManCanAttack =
                    false;


                if (mpManStatus) {

                    mpManStatus.innerText =
                        "❌ MISS! -1 Sanity.";

                }


                if (mpMosquitoStatus) {

                    mpMosquitoStatus.innerText =
                        "❌ The Man missed. Choose Stay or move orthogonally.";

                }


                return;

            }


            // ==================================================
            // GAMBLE HIT
            // ==================================================

            if (
                data.result ===
                "gambleHit"
            ) {

                mpManCanAttack =
                    false;

                return;

            }


            // ==================================================
            // GAMBLE MISS
            // ==================================================

            if (
                data.result ===
                "gambleMiss"
            ) {

                mpManCanAttack =
                    false;


                if (mpManStatus) {

                    mpManStatus.innerText =
                        "💀 MAD MAN'S GAMBLE FAILED! -20 Sanity.";

                }


                if (mpMosquitoStatus) {

                    mpMosquitoStatus.innerText =
                        "💀 The Man's gamble failed.";

                }


                return;

            }


            return;

        }


        // ========================================================
        // HINT
        // ========================================================

        if (
            data.type ===
            "hint"
        ) {

            if (
                window.multiplayerRole ===
                "man"
            ) {

                if (mpManStatus) {

                    mpManStatus.innerText =
                        data.message;

                }

            }


            mpBiteFreeTurns =
                0;


            return;

        }


        // ========================================================
        // MOSQUITO TURN
        // ========================================================

        if (
            data.type ===
            "mosquitoTurn"
        ) {

            if (
                window.multiplayerRole ===
                "mosquito"
            ) {

                mpEnableMosquitoMovement(
                    data
                );

            }


            return;

        }


        // ========================================================
        // MOSQUITO MOVE RESULT
        // ========================================================

        if (
            data.type ===
            "mosquitoMoveResult"
        ) {

            mpMosquitoRow =
                Number(
                    data.row
                );

            mpMosquitoCol =
                Number(
                    data.col
                );


            mpLockMosquito();
            mpShowMosquito();


            if (mpMosquitoStatus) {

                mpMosquitoStatus.innerText =
                    "🦟 Waiting for the Man...";

            }


            return;

        }


        // ========================================================
        // MOSQUITO MOVED
        // ========================================================

        if (
            data.type ===
            "mosquitoMoved"
        ) {

            mpClearMovement();


            mpManCanAttack =
                true;

            mpWaitingForAttack =
                false;


            if (mpManBoard) {

                mpManBoard.style.pointerEvents =
                    "auto";

                mpManBoard.style.opacity =
                    "1";

            }


            if (mpManStatus) {

                mpManStatus.innerText =
                    "🦟 Mosquito moved. Attack!";

            }


            return;

        }


        // ========================================================
        // GAME OVER
        // ========================================================

        if (
            data.type ===
            "gameOver"
        ) {

            if (
                typeof data.sanity ===
                "number"
            ) {

                mpSetServerSanity(
                    data.sanity
                );

            }


            if (
                typeof data.turn ===
                "number"
            ) {

                mpSetServerTurn(
                    data.turn
                );

            }


            mpManCanAttack =
                false;

            mpMosquitoCanMove =
                false;


            mpClearMovement();


            mpShowVictory(
                data.winner
            );


            return;

        }


        // ========================================================
        // LEFT ROOM
        // ========================================================

        if (
            data.type ===
            "leftRoom"
        ) {

            sessionStorage.removeItem(
                "mpRestartRoom"
            );

            sessionStorage.removeItem(
                "mpRestartRole"
            );


            mpRemoveVictory();
            mpHideScreens();


            const mainMenu =
                document.getElementById(
                    "mainMenu"
                );


            if (mainMenu) {

                mainMenu.classList.remove(
                    "hidden"
                );

            }


            window.multiplayerRole =
                null;

            window.multiplayerRoomCode =
                null;


            return;

        }


        // ========================================================
        // OPPONENT LEFT
        // ========================================================

        if (
            data.type ===
            "opponentLeftRoom"
        ) {

            mpRemoveVictory();


            alert(
                "Your opponent left the room."
            );


            return;

        }


        // ========================================================
        // OPPONENT DISCONNECTED
        // ========================================================

        if (
            data.type ===
            "opponentDisconnected"
        ) {

            console.warn(
                "⚠️ Opponent disconnected."
            );


            if (mpManStatus) {

                mpManStatus.innerText =
                    "⚠️ Opponent disconnected.";

            }


            if (mpMosquitoStatus) {

                mpMosquitoStatus.innerText =
                    "⚠️ Opponent disconnected.";

            }


            return;

        }


        // ========================================================
        // SERVER ERROR
        // ========================================================

        if (
            data.type ===
            "error"
        ) {

            console.error(
                "❌ SERVER ERROR:",
                data.message
            );


            mpWaitingForAttack =
                false;


            if (
                window.multiplayerRole ===
                "man"
            ) {

                mpManCanAttack =
                    true;


                if (mpManBoard) {

                    mpManBoard.style.pointerEvents =
                        "auto";

                }

            }


            if (mpManStatus) {

                mpManStatus.innerText =
                    "❌ " +
                    data.message;

            }


            if (mpMosquitoStatus) {

                mpMosquitoStatus.innerText =
                    "❌ " +
                    data.message;

            }


            if (mpJoinStatus) {

                mpJoinStatus.innerText =
                    "❌ " +
                    data.message;

            }


            return;

        }

    };


// ============================================================
// CREATE GAME
// ============================================================

if (mpCreateGameBtn) {

    mpCreateGameBtn.onclick =
        function() {

            if (
                mpSocket.readyState !==
                WebSocket.OPEN
            ) {

                if (mpLobbyStatus) {

                    mpLobbyStatus.innerText =
                        "❌ Not connected to server.";

                }

                return;

            }


            if (mpCreateGamePanel) {

                mpCreateGamePanel.classList.remove(
                    "hidden"
                );

            }


            if (mpJoinGamePanel) {

                mpJoinGamePanel.classList.add(
                    "hidden"
                );

            }


            if (mpLobbyStatus) {

                mpLobbyStatus.innerText =
                    "Creating game...";

            }


            mpSend({

                type:
                    "createRoom"

            });

        };

}


// ============================================================
// JOIN GAME BUTTON
// ============================================================

if (mpJoinGameBtn) {

    mpJoinGameBtn.onclick =
        function() {

            if (mpJoinGamePanel) {

                mpJoinGamePanel.classList.remove(
                    "hidden"
                );

            }


            if (mpCreateGamePanel) {

                mpCreateGamePanel.classList.add(
                    "hidden"
                );

            }


            if (mpJoinStatus) {

                mpJoinStatus.innerText =
                    "";

            }


            if (mpRoomCodeInput) {

                mpRoomCodeInput.value =
                    "";

                mpRoomCodeInput.focus();

            }

        };

}


// ============================================================
// JOIN ROOM
// ============================================================

if (mpJoinRoomBtn) {

    mpJoinRoomBtn.onclick =
        function() {

            if (!mpRoomCodeInput) {
                return;
            }


            const code =
                mpRoomCodeInput.value
                    .trim()
                    .toUpperCase();


            if (
                code.length !==
                6
            ) {

                if (mpJoinStatus) {

                    mpJoinStatus.innerText =
                        "Enter a 6-character game code.";

                }

                return;

            }


            if (
                mpSocket.readyState !==
                WebSocket.OPEN
            ) {

                if (mpJoinStatus) {

                    mpJoinStatus.innerText =
                        "❌ Not connected to server.";

                }

                return;

            }


            if (mpJoinStatus) {

                mpJoinStatus.innerText =
                    "Joining game...";

            }


            mpSend({

                type:
                    "joinRoom",

                roomCode:
                    code

            });

        };

}


// ============================================================
// ENTER TO JOIN
// ============================================================

if (mpRoomCodeInput) {

    mpRoomCodeInput.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key ===
                "Enter"
            ) {

                if (mpJoinRoomBtn) {

                    mpJoinRoomBtn.click();

                }

            }

        }
    );

}


// ============================================================
// BACK BUTTON
// ============================================================

if (mpPlayerBackBtn) {

    mpPlayerBackBtn.onclick =
        function() {

            mpHideScreens();
            mpHideNormalScreens();
            mpRemoveVictory();


            const mainMenu =
                document.getElementById(
                    "mainMenu"
                );


            if (mainMenu) {

                mainMenu.classList.remove(
                    "hidden"
                );

            }


            window.multiplayerRole =
                null;

            window.multiplayerRoomCode =
                null;


            mpManCanAttack =
                false;

            mpMosquitoCanMove =
                false;


            console.log(
                "🏠 Returned to main menu."
            );

        };

}


// ============================================================
// SOCKET CLOSE
// ============================================================

mpSocket.onclose =
    function() {

        window.multiplayerConnected =
            false;

        mpManCanAttack =
            false;

        mpWaitingForAttack =
            false;

        mpMosquitoCanMove =
            false;


        console.log(
            "❌ Disconnected from multiplayer server."
        );

    };


// ============================================================
// SOCKET ERROR
// ============================================================

mpSocket.onerror =
    function(error) {

        console.error(
            "❌ Multiplayer WebSocket error:",
            error
        );

    };
