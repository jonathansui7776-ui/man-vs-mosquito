// ============================================================
// MAN VS MOSQUITO
// MULTIPLAYER.JS
// ============================================================

const MP_WS_URL =
    "wss://man-vs-mosquito.onrender.com";

const MP_ROWS = 6;
const MP_COLS = 6;


// ============================================================
// SOCKET
// ============================================================

const mpSocket =
    new WebSocket(MP_WS_URL);


// ============================================================
// MULTIPLAYER IDENTITY
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

let mpMissStreak = 0;

let mpManCanAttack = false;
let mpWaitingForResult = false;

let mpMosquitoReady = false;
let mpMosquitoCanMove = false;

let mpMosquitoMoveReason = null;

let mpMosquitoRow = null;
let mpMosquitoCol = null;

let mpSelectedManCell = null;
let mpSelectedMosquitoCell = null;

let mpGambleMode = false;

let mpRestartRequested = false;


// ============================================================
// DOM HELPERS
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
// SCREENS
// ============================================================

const mpLobbyScreen =
    mpGet("playerModeMenu");

const mpManScreen =
    mpGet(
        "multiplayerManScreen"
    );

const mpMosquitoScreen =
    mpGet(
        "multiplayerMosquitoScreen"
    );


// ============================================================
// BOARDS
// ============================================================

const mpManBoard =
    mpGet(
        "multiplayerManBoard"
    );

const mpMosquitoBoard =
    mpGet(
        "multiplayerMosquitoBoard"
    );


// ============================================================
// MAN HUD
// ============================================================

const mpManSanity =
    mpGet(
        "multiplayerManSanity",
        "mpManSanity"
    );

const mpManGamble =
    mpGet(
        "multiplayerManGamble",
        "mpManGamble"
    );

const mpManTurn =
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

const mpMosquitoSanity =
    mpGet(
        "multiplayerMosquitoManSanity",
        "mpMosquitoManSanity"
    );

const mpMosquitoTurn =
    mpGet(
        "multiplayerMosquitoTurn",
        "mpMosquitoTurn"
    );

const mpMosquitoStatus =
    mpGet(
        "multiplayerMosquitoStatus",
        "mpMosquitoStatus"
    );

const mpMosquitoMovementStatus =
    mpGet(
        "multiplayerMosquitoMovementStatus"
    );


// ============================================================
// MOSQUITO HIDE
// ============================================================

const mpHideBtn =
    mpGet(
        "confirmMultiplayerMosquitoBtn",
        "multiplayerHideBtn",
        "confirmMosquitoBtn"
    );


// ============================================================
// MOVEMENT CONTROLS
// ============================================================

let mpMovementControls = null;
let mpStayBtn = null;
let mpMoveBtn = null;


// ============================================================
// POSITION NAME
// ============================================================

function mpPosition(row, col) {

    return (
        String.fromCharCode(
            65 + row
        ) +
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
            "❌ Multiplayer socket not open."
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
// HIDE SCREENS
// ============================================================

function mpHideScreens() {

    [
        mpLobbyScreen,
        mpManScreen,
        mpMosquitoScreen
    ]
    .forEach(
        function(screen) {

            if (screen) {

                screen.classList.add(
                    "hidden"
                );

            }

        }
    );

}


// ============================================================
// NORMAL SCREENS
// ============================================================

function mpHideNormalScreens() {

    [
        document.getElementById(
            "gameScreen"
        ),

        document.getElementById(
            "mosquitoGameScreen"
        )
    ]
    .forEach(
        function(screen) {

            if (screen) {

                screen.classList.add(
                    "hidden"
                );

            }

        }
    );

}


// ============================================================
// VICTORY SCREEN
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
// CLEAR MOVEMENT
// ============================================================

function mpClearMovement() {

    [
        mpManBoard,
        mpMosquitoBoard
    ]
    .forEach(
        function(board) {

            if (!board) {

                return;

            }

            board
                .querySelectorAll(
                    ".mpMosquitoMoveAllowed"
                )
                .forEach(
                    function(cell) {

                        cell.classList.remove(
                            "mpMosquitoMoveAllowed"
                        );

                        cell.style.background =
                            "";

                        cell.style.outline =
                            "";

                    }
                );

        }
    );

}


// ============================================================
// CLEAR ATTACK HIGHLIGHTS
// ============================================================

function mpClearAttackHighlights() {

    [
        mpManBoard,
        mpMosquitoBoard
    ]
    .forEach(
        function(board) {

            if (!board) {

                return;

            }

            board
                .querySelectorAll(
                    ".multiplayerCell"
                )
                .forEach(
                    function(cell) {

                        cell.classList.remove(
                            "mpAttackRed"
                        );

                        cell.classList.remove(
                            "mpAttackOrange"
                        );

                        cell.classList.remove(
                            "mpAttackBlue"
                        );

                        cell.style.background =
                            "";

                    }
                );

        }
    );

}


// ============================================================
// REMOVE MOVEMENT BUTTONS
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
// FULL LOCAL ROUND RESET
// ============================================================

function mpResetLocalRound() {

    mpManSanity = 100;

    mpManTurn = 1;

    mpGambles = 3;

    mpMissStreak = 0;

    mpManCanAttack = false;

    mpWaitingForResult = false;

    mpMosquitoReady = false;

    mpMosquitoCanMove = false;

    mpMosquitoMoveReason = null;

    mpMosquitoRow = null;

    mpMosquitoCol = null;

    mpSelectedManCell = null;

    mpSelectedMosquitoCell = null;

    mpGambleMode = false;

    mpRestartRequested = false;


    mpClearMovement();

    mpClearAttackHighlights();

    mpRemoveMovementControls();


    mpUpdateHUD();

}


// ============================================================
// HUD
// ============================================================

function mpUpdateHUD() {

    if (mpManSanity) {

        mpManSanity.innerText =
            mpManSanityValue();

    }

    if (mpManGamble) {

        mpManGamble.innerText =
            mpGambles;

    }

    if (mpManTurn) {

        mpManTurn.innerText =
            mpManTurnValue();

    }

    if (mpMosquitoSanity) {

        mpMosquitoSanity.innerText =
            mpManSanityValue();

    }

    if (mpMosquitoTurn) {

        mpMosquitoTurn.innerText =
            mpManTurnValue();

    }

}


function mpManSanityValue() {

    return mpManSanity + "%";

}


function mpManTurnValue() {

    return mpManTurn;

}


// ============================================================
// BOARD STYLE
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
        row;

    cell.dataset.col =
        col;

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
// MAN BOARD
// ============================================================

function mpCreateManBoard() {

    if (!mpManBoard) {

        return;

    }


    mpManBoard.innerHTML =
        "";

    mpSetupBoard(
        mpManBoard
    );


    for (
        let row = 0;
        row < 6;
        row++
    ) {

        for (
            let col = 0;
            col < 6;
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

}


// ============================================================
// MOSQUITO BOARD
// ============================================================

function mpCreateMosquitoBoard() {

    if (!mpMosquitoBoard) {

        return;

    }


    mpMosquitoBoard.innerHTML =
        "";

    mpSetupBoard(
        mpMosquitoBoard
    );


    for (
        let row = 0;
        row < 6;
        row++
    ) {

        for (
            let col = 0;
            col < 6;
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
// MOSQUITO IMAGE
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


    mpMosquitoBoard
        .querySelectorAll(
            ".multiplayerCell"
        )
        .forEach(
            function(cell) {

                const image =
                    cell.querySelector(
                        ".mpMosquitoImage"
                    );

                if (image) {

                    image.remove();

                }

                cell.innerText =
                    cell.dataset.position;

            }
        );


    const cell =
        mpGetCell(
            mpMosquitoBoard,
            mpMosquitoRow,
            mpMosquitoCol
        );


    if (!cell) {

        return;

    }


    cell.innerText =
        "";


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
// MOSQUITO CELL
// ============================================================

function mpMosquitoCellClicked(cell) {

    // ------------------------------------------
    // INITIAL HIDING
    // ------------------------------------------

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


    // ------------------------------------------
    // MOVEMENT
    // ------------------------------------------

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


        mpSelectedMosquitoCell =
            cell;


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

            if (
                mpMosquitoReady
            ) {

                return;

            }


            if (
                !mpSelectedMosquitoCell
            ) {

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


            if (
                !mpSend({

                    type:
                        "mosquitoPosition",

                    roomCode:
                        window.multiplayerRoomCode,

                    row:
                        row,

                    col:
                        col

                })
            ) {

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

        };

}


// ============================================================
// MAN ATTACK
// ============================================================

function mpManCellClicked(cell) {

    if (!mpManCanAttack) {

        return;

    }

    if (mpWaitingForResult) {

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


    // ------------------------------------------
    // GAMBLE
    // ------------------------------------------

    if (mpGambleMode) {

        mpPerformGamble(
            row,
            col
        );

        return;

    }


    mpWaitingForResult =
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

            if (
                !mpManCanAttack
            ) {

                return;

            }


            if (
                mpGambles <= 0
            ) {

                alert(
                    "No Gambles Remaining!"
                );

                return;

            }


            mpGambleMode =
                true;


            if (mpManStatus) {

                mpManStatus.innerText =
                    "🎲 Gamble ready! Click the TOP-LEFT square of a 2×2 area. Use A1–E5.";

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

    // ------------------------------------------
    // Only A1-E5 can be top-left
    // ------------------------------------------

    if (
        row > 4 ||
        col > 4
    ) {

        if (mpManStatus) {

            mpManStatus.innerText =
                "Choose a top-left square from A1 to E5.";

        }

        return;

    }


    mpGambleMode =
        false;


    mpGambles--;


    mpUpdateHUD();


    mpWaitingForResult =
        true;

    mpManCanAttack =
        false;


    if (mpManBoard) {

        mpManBoard.style.pointerEvents =
            "none";

    }


    // Blue 2×2 flash immediately

    const area = [

        [row, col],
        [row, col + 1],
        [row + 1, col],
        [row + 1, col + 1]

    ];


    area.forEach(
        function(position) {

            const cell =
                mpGetCell(
                    mpManBoard,
                    position[0],
                    position[1]
                );

            if (cell) {

                cell.classList.add(
                    "mpAttackBlue"
                );

                cell.style.background =
                    "dodgerblue";

            }

        }
    );


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

    mpWaitingForResult =
        false;


    if (mpManBoard) {

        mpManBoard.style.pointerEvents =
            "auto";

        mpManBoard.style.opacity =
            "1";

    }


    if (mpManStatus) {

        mpManStatus.innerText =
            "🦟 Mosquito is hidden. Attack!";

    }

}


// ============================================================
// ATTACK VISUAL
// ============================================================

function mpShowAttack(
    row,
    col,
    result
) {

    mpClearAttackHighlights();


    [
        mpManBoard,
        mpMosquitoBoard
    ]
    .forEach(
        function(board) {

            const cell =
                mpGetCell(
                    board,
                    row,
                    col
                );

            if (!cell) {

                return;

            }


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

            else {

                cell.classList.add(
                    "mpAttackRed"
                );

                cell.style.background =
                    "red";

            }

        }
    );

}


// ============================================================
// MOVEMENT CONTROLS
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
// HIGHLIGHT MOVEMENT
// ============================================================

function mpHighlightMovement(
    reason,
    currentRow,
    currentCol
) {

    mpClearMovement();


    // ------------------------------------------
    // BITE = FLY ANYWHERE
    // ------------------------------------------

    if (
        reason ===
        "bite"
    ) {

        for (
            let row = 0;
            row < 6;
            row++
        ) {

            for (
                let col = 0;
                col < 6;
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


    // ------------------------------------------
    // MISS = ORTHOGONAL ONLY
    // ------------------------------------------

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
// ENABLE MOVEMENT
// ============================================================

function mpEnableMosquitoMovement(
    data
) {

    mpMosquitoCanMove =
        true;

    mpMosquitoMoveReason =
        data.reason;


    if (
        data.currentPosition
    ) {

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


    mpMosquitoBoard.style.pointerEvents =
        "auto";

    mpMosquitoBoard.style.opacity =
        "1";


    mpShowMosquito();


    mpHighlightMovement(
        data.reason,
        mpMosquitoRow,
        mpMosquitoCol
    );


    if (
        mpMosquitoMovementStatus
    ) {

        mpMosquitoMovementStatus.innerText =
            data.reason === "bite"
                ? "🩸 BITE! Stay or fly anywhere."
                : "❌ MISS! Stay or move one square orthogonally.";

    }

}


// ============================================================
// LOCK MOSQUITO
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

    if (
        !mpMosquitoCanMove
    ) {

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

    if (
        !mpMosquitoCanMove
    ) {

        return;

    }


    if (
        !mpSelectedMosquitoCell
    ) {

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
// OPEN MAN
// ============================================================

function mpOpenMan() {

    mpRemoveVictory();

    mpHideNormalScreens();

    mpHideScreens();


    if (!mpManScreen) {

        return;

    }


    mpManScreen.classList.remove(
        "hidden"
    );


    mpManCanAttack =
        false;

    mpWaitingForResult =
        false;

    mpGambleMode =
        false;


    mpCreateManBoard();


    mpUpdateHUD();


    if (mpManStatus) {

        mpManStatus.innerText =
            "Waiting for Mosquito...";

    }

}


// ============================================================
// OPEN MOSQUITO
// ============================================================

function mpOpenMosquito() {

    mpRemoveVictory();

    mpHideNormalScreens();

    mpHideScreens();


    if (!mpMosquitoScreen) {

        return;

    }


    mpMosquitoScreen.classList.remove(
        "hidden"
    );


    mpCreateMosquitoBoard();


    if (mpHideBtn) {

        mpHideBtn.disabled =
            true;

    }


    if (mpMosquitoStatus) {

        mpMosquitoStatus.innerText =
            "Choose your hiding place.";

    }


    if (
        mpMosquitoMovementStatus
    ) {

        mpMosquitoMovementStatus.innerText =
            "";

    }

}


// ============================================================
// VICTORY
// ============================================================

function mpShowVictory(
    winner
) {

    mpRemoveVictory();


    mpManCanAttack =
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


    if (
        winner ===
        "man"
    ) {

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

            if (
                mpRestartRequested
            ) {

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


    screen.appendChild(
        title
    );

    screen.appendChild(
        image
    );

    screen.appendChild(
        restart
    );

    screen.appendChild(
        leave
    );


    document.body.appendChild(
        screen
    );

}


// ============================================================
// AUTOMATIC REJOIN AFTER RELOAD
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


    if (
        !room ||
        !role
    ) {

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
        "🔁 Rejoining room after restart:",
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
            "🌐 Multiplayer connected."
        );


        // ------------------------------------------
        // IMPORTANT:
        // REJOIN ONLY AFTER SOCKET IS OPEN
        // ------------------------------------------

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

        catch(error) {

            console.error(
                "❌ Bad server message:",
                event.data
            );

            return;

        }


        console.log(
            "📨 Server:",
            data
        );


        // ==================================================
        // ROOM CREATED
        // ==================================================

        if (
            data.type ===
            "roomCreated"
        ) {

            window.multiplayerRole =
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


            return;

        }


        // ==================================================
        // JOINED
        // ==================================================

        if (
            data.type ===
            "joinedRoom"
        ) {

            window.multiplayerRole =
                "mosquito";

            window.multiplayerRoomCode =
                data.roomCode;


            if (mpJoinStatus) {

                mpJoinStatus.innerText =
                    "✅ Joined game!";

            }


            return;

        }


        // ==================================================
        // PLAYER JOINED
        // ==================================================

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


        // ==================================================
        // GAME START
        // ==================================================

        if (
            data.type ===
            "gameStart"
        ) {

            window.multiplayerRole =
                data.role;

            window.multiplayerRoomCode =
                data.roomCode;


            mpResetLocalRound();


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


        // ==================================================
        // REJOIN ACCEPTED
        // ==================================================

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


        // ==================================================
        // NEW ROUND
        // ==================================================

        if (
            data.type ===
            "newRound"
        ) {

            console.log(
                "🆕 Fresh round received."
            );


            window.multiplayerRole =
                data.role;

            window.multiplayerRoomCode =
                data.roomCode;


            mpRemoveVictory();

            mpResetLocalRound();


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


        // ==================================================
        // RESTART NOW
        // ==================================================

        if (
            data.type ===
            "restartNow"
        ) {

            console.log(
                "🔄 SERVER APPROVED RESTART."
            );


            sessionStorage.setItem(
                "mpRestartRoom",
                window.multiplayerRoomCode
            );

            sessionStorage.setItem(
                "mpRestartRole",
                window.multiplayerRole
            );


            // ------------------------------------------
            // THE ACTUAL HARD RESET
            // ------------------------------------------

            window.location.reload();


            return;

        }


        // ==================================================
        // RESTART WAITING
        // ==================================================

        if (
            data.type ===
            "restartWaiting"
        ) {

            mpRestartRequested =
                true;


            return;

        }


        // ==================================================
        // MOSQUITO READY
        // ==================================================

        if (
            data.type ===
            "mosquitoReady"
        ) {

            mpManSanity =
                Number(
                    data.sanity ??
                    100
                );


            mpManTurn =
                Number(
                    data.turn ??
                    0
                ) + 1;


            mpMissStreak =
                0;


            mpUpdateHUD();

            mpActivateMan();


            return;

        }


        // ==================================================
        // MOSQUITO HIDDEN
        // ==================================================

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


        // ==================================================
        // ATTACK RESULT
        // ==================================================

        if (
            data.type ===
            "attackResult"
        ) {

            mpWaitingForResult =
                false;


            if (
                typeof data.sanity ===
                "number"
            ) {

                mpManSanity =
                    data.sanity;

            }


            if (
                typeof data.turn ===
                "number"
            ) {

                mpManTurn =
                    data.turn;

            }


            if (
                typeof data.biteFreeTurns ===
                "number"
            ) {

                mpMissStreak =
                    data.biteFreeTurns;

            }


            mpUpdateHUD();


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


            // ------------------------------------------
            // HIT
            // ------------------------------------------

            if (
                data.result ===
                "hit"
            ) {

                mpShowVictory(
                    "man"
                );

                return;

            }


            // ------------------------------------------
            // BITE
            // ------------------------------------------

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


                return;

            }


            // ------------------------------------------
            // MISS
            // ------------------------------------------

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


                return;

            }


            // ------------------------------------------
            // GAMBLE HIT
            // ------------------------------------------

            if (
                data.result ===
                "gambleHit"
            ) {

                mpShowVictory(
                    "man"
                );

                return;

            }


            // ------------------------------------------
            // GAMBLE MISS
            // ------------------------------------------

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


                return;

            }


            return;

        }


        // ==================================================
        // HINT
        // ==================================================

        if (
            data.type ===
            "hint"
        ) {

            if (mpManStatus) {

                mpManStatus.innerText =
                    data.message;

            }


            mpMissStreak =
                0;


            return;

        }


        // ==================================================
        // MOSQUITO TURN
        // ==================================================

        if (
            data.type ===
            "mosquitoTurn"
        ) {

            mpEnableMosquitoMovement(
                data
            );


            return;

        }


        // ==================================================
        // MOSQUITO MOVE RESULT
        // ==================================================

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


        // ==================================================
        // MOSQUITO MOVED
        // ==================================================

        if (
            data.type ===
            "mosquitoMoved"
        ) {

            mpClearMovement();


            mpManCanAttack =
                true;

            mpWaitingForResult =
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


        // ==================================================
        // GAME OVER
        // ==================================================

        if (
            data.type ===
            "gameOver"
        ) {

            if (
                typeof data.sanity ===
                "number"
            ) {

                mpManSanity =
                    data.sanity;

            }


            mpUpdateHUD();


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


        // ==================================================
        // LEFT ROOM
        // ==================================================

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


            return;

        }


        // ==================================================
        // OPPONENT LEFT
        // ==================================================

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


        // ==================================================
        // OPPONENT DISCONNECTED
        // ==================================================

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


        // ==================================================
        // ERROR
        // ==================================================

        if (
            data.type ===
            "error"
        ) {

            console.error(
                "❌ Server:",
                data.message
            );


            mpWaitingForResult =
                false;


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
// CREATE ROOM
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
                        "❌ Server not connected.";

                }

                return;

            }


            mpCreateGamePanel?.classList.remove(
                "hidden"
            );

            mpJoinGamePanel?.classList.add(
                "hidden"
            );


            mpSend({

                type:
                    "createRoom"

            });

        };

}


// ============================================================
// JOIN ROOM BUTTON
// ============================================================

if (mpJoinGameBtn) {

    mpJoinGameBtn.onclick =
        function() {

            mpJoinGamePanel?.classList.remove(
                "hidden"
            );

            mpCreateGamePanel?.classList.add(
                "hidden"
            );


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

            const code =
                mpRoomCodeInput
                    ?.value
                    .trim()
                    .toUpperCase();


            if (
                !code ||
                code.length !== 6
            ) {

                if (mpJoinStatus) {

                    mpJoinStatus.innerText =
                        "Enter a 6-character game code.";

                }

                return;

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

                mpJoinRoomBtn?.click();

            }

        }
    );

}


// ============================================================
// BACK
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

        mpMosquitoCanMove =
            false;


        console.log(
            "❌ Multiplayer disconnected."
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
