// ===================================================
// MAN VS MOSQUITO
// MULTIPLAYER.JS
// ===================================================


// ===================================================
// WEBSOCKET
// ===================================================

const mpSocket =
    new WebSocket(
        "wss://man-vs-mosquito.onrender.com"
    );


// ===================================================
// GLOBAL STATE
// ===================================================

window.multiplayerRole = null;

window.multiplayerRoomCode = null;

window.multiplayerConnected = false;

window.multiplayerMosquitoReady = false;

window.multiplayerManReady = false;


// ===================================================
// GAME STATE
// ===================================================

let mpManCanAttack = false;

let mpWaitingForAttackResult = false;

let mpManSanity = 100;

let mpManTurn = 1;

let mpBiteFreeTurns = 0;


// ===================================================
// MULTIPLAYER ATTACK STATE
// ===================================================

let mpMultiplayerLastAttackCell = null;

let mpMultiplayerLastAttackResult = null;


// ===================================================
// MOSQUITO STATE
// ===================================================

let mpMosquitoCanMove = false;

let mpMosquitoMoveReason = null;

let mpMosquitoCurrentRow = null;

let mpMosquitoCurrentCol = null;

let mpMosquitoSelectedCell = null;


// ===================================================
// RESTART
// ===================================================

let mpRestartWaiting = false;


// ===================================================
// BOARD
// ===================================================

const MP_ROWS = 6;

const MP_COLS = 6;


// ===================================================
// ELEMENTS
// ===================================================

const mpCreateGameBtn =
    document.getElementById(
        "createGameBtn"
    );

const mpJoinGameBtn =
    document.getElementById(
        "joinGameBtn"
    );

const mpCreateGamePanel =
    document.getElementById(
        "createGamePanel"
    );

const mpJoinGamePanel =
    document.getElementById(
        "joinGamePanel"
    );

const mpRoomCode =
    document.getElementById(
        "roomCode"
    );

const mpRoomCodeInput =
    document.getElementById(
        "roomCodeInput"
    );

const mpJoinRoomBtn =
    document.getElementById(
        "joinRoomBtn"
    );

const mpLobbyStatus =
    document.getElementById(
        "lobbyStatus"
    );

const mpJoinStatus =
    document.getElementById(
        "joinStatus"
    );

const mpPlayerBackBtn =
    document.getElementById(
        "playerBackBtn"
    );


// ===================================================
// SCREENS
// ===================================================

const mpManScreen =
    document.getElementById(
        "multiplayerManScreen"
    );

const mpMosquitoScreen =
    document.getElementById(
        "multiplayerMosquitoScreen"
    );


// ===================================================
// BOARDS
// ===================================================

const mpManBoard =
    document.getElementById(
        "multiplayerManBoard"
    );

const mpMosquitoBoard =
    document.getElementById(
        "multiplayerMosquitoBoard"
    );


// ===================================================
// BUTTON
// ===================================================

const mpHideBtn =
    document.getElementById(
        "multiplayerHideBtn"
    );


// ===================================================
// STATUS
// ===================================================

const mpManStatus =
    document.getElementById(
        "mpManStatus"
    );

const mpMosquitoStatus =
    document.getElementById(
        "mpMosquitoStatus"
    );

const mpMosquitoMovementStatus =
    document.getElementById(
        "multiplayerMosquitoMovementStatus"
    );


// ===================================================
// MOVEMENT CONTROLS
// ===================================================

let mpMosquitoControls = null;

let mpStayBtn = null;

let mpMoveBtn = null;


// ===================================================
// POSITION
// ===================================================

function mpPosition(row, col) {

    return (
        String.fromCharCode(
            65 + row
        ) +
        (col + 1)
    );

}


// ===================================================
// SEND
// ===================================================

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


// ===================================================
// COMPLETE ROUND RESET
// ===================================================

function resetMultiplayerRoundState() {

    window.multiplayerMosquitoReady =
        false;

    window.multiplayerManReady =
        false;


    mpManCanAttack =
        false;

    mpWaitingForAttackResult =
        false;


    mpManSanity =
        100;

    mpManTurn =
        1;

    mpBiteFreeTurns =
        0;


    mpMultiplayerLastAttackCell =
        null;

    mpMultiplayerLastAttackResult =
        null;


    mpMosquitoCanMove =
        false;

    mpMosquitoMoveReason =
        null;


    mpMosquitoCurrentRow =
        null;

    mpMosquitoCurrentCol =
        null;

    mpMosquitoSelectedCell =
        null;


    mpRestartWaiting =
        false;


    clearAllMosquitoMovementHighlights();

}


// ===================================================
// HIDE SCREENS
// ===================================================

function hideAllMultiplayerScreens() {

    if (mpManScreen) {

        mpManScreen.classList.add(
            "hidden"
        );

    }


    if (mpMosquitoScreen) {

        mpMosquitoScreen.classList.add(
            "hidden"
        );

    }

}


// ===================================================
// HIDE NORMAL SCREENS
// ===================================================

function hideNormalGameScreens() {

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


// ===================================================
// BOARD STYLE
// ===================================================

function setupMultiplayerBoardStyle(board) {

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
        "0 auto",
        "important"
    );

    board.style.setProperty(
        "box-sizing",
        "border-box",
        "important"
    );

}


// ===================================================
// CELL STYLE
// ===================================================

function setupMultiplayerCell(cell) {

    cell.style.setProperty(
        "width",
        "70px",
        "important"
    );

    cell.style.setProperty(
        "height",
        "70px",
        "important"
    );

    cell.style.setProperty(
        "box-sizing",
        "border-box",
        "important"
    );


    cell.style.display =
        "flex";

    cell.style.alignItems =
        "center";

    cell.style.justifyContent =
        "center";

    cell.style.cursor =
        "pointer";

    cell.style.userSelect =
        "none";

    cell.style.fontWeight =
        "bold";

    cell.style.fontSize =
        "18px";

    cell.style.position =
        "relative";

}


// ===================================================
// CREATE CELL
// ===================================================

function createMultiplayerCell(
    row,
    col
) {

    const cell =
        document.createElement(
            "div"
        );


    cell.className =
        "multiplayerCell";


    const position =
        mpPosition(
            row,
            col
        );


    cell.dataset.row =
        row;

    cell.dataset.col =
        col;

    cell.dataset.position =
        position;


    cell.innerText =
        position;


    setupMultiplayerCell(
        cell
    );


    return cell;

}


// ===================================================
// RESTORE LABEL
// ===================================================

function restoreMultiplayerCellLabel(
    cell
) {

    if (!cell) {

        return;

    }


    const image =
        cell.querySelector(
            ".mpMosquitoImage"
        );


    if (image) {

        image.remove();

    }


    cell.innerText =
        cell.dataset.position || "";

}


// ===================================================
// CLEAR MOVEMENT HIGHLIGHTS
// ===================================================

function clearAllMosquitoMovementHighlights() {

    const boards = [
        mpMosquitoBoard
    ];


    boards.forEach(
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
                            "mpMosquitoMoveAllowed"
                        );

                        cell.classList.remove(
                            "movementSelected"
                        );


                        cell.style.outline =
                            "";


                        // -----------------------------------------
                        // CRITICAL FIX:
                        // Remove the inline blue background.
                        // -----------------------------------------

                        if (
                            !cell.classList.contains(
                                "mpMultiplayerAttackBite"
                            ) &&
                            !cell.classList.contains(
                                "mpMultiplayerAttackMiss"
                            ) &&
                            !cell.classList.contains(
                                "mpMultiplayerAttackHit"
                            )
                        ) {

                            cell.style.background =
                                "";

                        }

                    }
                );

        }
    );

}


// ===================================================
// CLEAR ATTACK VISUALS
// ===================================================

function clearMultiplayerAttackVisuals() {

    const boards = [
        mpManBoard,
        mpMosquitoBoard
    ];


    boards.forEach(
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
                            "mpMultiplayerAttackMiss"
                        );

                        cell.classList.remove(
                            "mpMultiplayerAttackBite"
                        );

                        cell.classList.remove(
                            "mpMultiplayerAttackHit"
                        );


                        cell.style.background =
                            "";

                    }
                );

        }
    );

}


// ===================================================
// APPLY ATTACK VISUAL
// ===================================================

function applyMultiplayerAttackVisual(
    row,
    col,
    result
) {

    // -----------------------------------------------
    // Only latest attack remains
    // -----------------------------------------------

    clearMultiplayerAttackVisuals();


    const boards = [
        mpManBoard,
        mpMosquitoBoard
    ];


    boards.forEach(
        function(board) {

            if (!board) {

                return;

            }


            const cell =
                board.querySelector(
                    `[data-row="${row}"][data-col="${col}"]`
                );


            if (!cell) {

                return;

            }


            if (
                result ===
                "miss"
            ) {

                cell.classList.add(
                    "mpMultiplayerAttackMiss"
                );

                cell.style.background =
                    "red";

            }


            else if (
                result ===
                "bite"
            ) {

                cell.classList.add(
                    "mpMultiplayerAttackBite"
                );

                cell.style.background =
                    "orange";

            }


            else if (
                result ===
                "hit"
            ) {

                cell.classList.add(
                    "mpMultiplayerAttackHit"
                );

                cell.style.background =
                    "red";

            }

        }
    );


    mpMultiplayerLastAttackCell = {

        row:
            row,

        col:
            col

    };


    mpMultiplayerLastAttackResult =
        result;

}


// ===================================================
// MAN BOARD
// ===================================================

function createMultiplayerManBoard() {

    if (!mpManBoard) {

        return;

    }


    mpManBoard.innerHTML =
        "";


    setupMultiplayerBoardStyle(
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
                createMultiplayerCell(
                    row,
                    col
                );


            cell.addEventListener(
                "click",
                function() {

                    selectManCell(
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


// ===================================================
// MOSQUITO BOARD
// ===================================================

function createMultiplayerMosquitoBoard() {

    if (!mpMosquitoBoard) {

        return;

    }


    mpMosquitoBoard.innerHTML =
        "";


    setupMultiplayerBoardStyle(
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
                createMultiplayerCell(
                    row,
                    col
                );


            cell.addEventListener(
                "click",
                function() {

                    selectMosquitoCell(
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


// ===================================================
// SHOW MOSQUITO
// ===================================================

function showMultiplayerMosquitoPosition() {

    if (
        mpMosquitoCurrentRow === null ||
        mpMosquitoCurrentCol === null
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

                cell.classList.remove(
                    "mpMosquitoCurrent"
                );

                restoreMultiplayerCellLabel(
                    cell
                );

            }
        );


    const cell =
        mpMosquitoBoard.querySelector(
            `[data-row="${mpMosquitoCurrentRow}"][data-col="${mpMosquitoCurrentCol}"]`
        );


    if (!cell) {

        return;

    }


    cell.classList.add(
        "mpMosquitoCurrent"
    );


    const image =
        document.createElement(
            "img"
        );


    image.src =
        "images/mosquitochan.png";

    image.alt =
        "Mosquito-chan";

    image.className =
        "mpMosquitoImage";


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


// ===================================================
// HIGHLIGHT MOVES
// ===================================================

function highlightMultiplayerMosquitoMoves(
    reason
) {

    // -----------------------------------------------
    // ALWAYS START CLEAN
    // -----------------------------------------------

    clearAllMosquitoMovementHighlights();


    if (!mpMosquitoBoard) {

        return;

    }


    if (
        mpMosquitoCurrentRow === null ||
        mpMosquitoCurrentCol === null
    ) {

        return;

    }


    // =================================================
    // BITE = ANYWHERE
    // =================================================

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
                    row ===
                        mpMosquitoCurrentRow &&
                    col ===
                        mpMosquitoCurrentCol
                ) {

                    continue;

                }


                const cell =
                    mpMosquitoBoard.querySelector(
                        `[data-row="${row}"][data-col="${col}"]`
                    );


                if (cell) {

                    cell.classList.add(
                        "mpMosquitoMoveAllowed"
                    );

                    cell.style.background =
                        "rgba(0, 110, 255, 0.45)";

                    cell.style.outline =
                        "3px solid blue";

                }

            }

        }


        return;

    }


    // =================================================
    // MISS = ORTHOGONAL
    // =================================================

    const directions = [

        [-1, 0],

        [1, 0],

        [0, -1],

        [0, 1]

    ];


    directions.forEach(
        function(direction) {

            const row =
                mpMosquitoCurrentRow +
                direction[0];

            const col =
                mpMosquitoCurrentCol +
                direction[1];


            if (
                row < 0 ||
                row >= MP_ROWS ||
                col < 0 ||
                col >= MP_COLS
            ) {

                return;

            }


            const cell =
                mpMosquitoBoard.querySelector(
                    `[data-row="${row}"][data-col="${col}"]`
                );


            if (cell) {

                cell.classList.add(
                    "mpMosquitoMoveAllowed"
                );

                cell.style.background =
                    "rgba(0, 110, 255, 0.45)";

                cell.style.outline =
                    "3px solid blue";

            }

        }
    );

}


// ===================================================
// MAN ATTACK
// ===================================================

function selectManCell(cell) {

    if (!mpManCanAttack) {

        return;

    }


    if (mpWaitingForAttackResult) {

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


    const position =
        cell.dataset.position;


    mpManCanAttack =
        false;

    mpWaitingForAttackResult =
        true;


    if (mpManBoard) {

        mpManBoard.style.pointerEvents =
            "none";

    }


    if (mpManStatus) {

        mpManStatus.innerText =
            "⚔️ Attacking " +
            position +
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


// ===================================================
// MOSQUITO SELECT
// ===================================================

function selectMosquitoCell(cell) {

    // =================================================
    // INITIAL HIDE
    // =================================================

    if (
        !window.multiplayerMosquitoReady &&
        !mpMosquitoCanMove
    ) {

        if (!mpMosquitoBoard) {

            return;

        }


        mpMosquitoBoard
            .querySelectorAll(
                ".selected"
            )
            .forEach(
                function(old) {

                    old.classList.remove(
                        "selected"
                    );

                }
            );


        cell.classList.add(
            "selected"
        );


        mpMosquitoSelectedCell =
            cell;


        if (mpHideBtn) {

            mpHideBtn.disabled =
                false;

        }


        if (mpMosquitoStatus) {

            mpMosquitoStatus.innerText =
                "Selected hiding place: " +
                cell.dataset.position;

        }


        return;

    }


    // =================================================
    // MOVEMENT
    // =================================================

    if (
        mpMosquitoCanMove
    ) {

        if (
            !cell.classList.contains(
                "mpMosquitoMoveAllowed"
            )
        ) {

            if (
                mpMosquitoMovementStatus
            ) {

                mpMosquitoMovementStatus.innerText =
                    "❌ That square is not a legal move.";

            }


            return;

        }


        mpMosquitoBoard
            .querySelectorAll(
                ".movementSelected"
            )
            .forEach(
                function(old) {

                    old.classList.remove(
                        "movementSelected"
                    );

                }
            );


        cell.classList.add(
            "movementSelected"
        );


        mpMosquitoSelectedCell =
            cell;


        if (mpMoveBtn) {

            mpMoveBtn.disabled =
                false;

        }


        if (
            mpMosquitoMovementStatus
        ) {

            mpMosquitoMovementStatus.innerText =
                "Selected " +
                cell.dataset.position +
                ". Press Move.";

        }

    }

}


// ===================================================
// ACTIVATE MAN
// ===================================================

function activateManBoard() {

    window.multiplayerManReady =
        true;


    mpManCanAttack =
        true;


    mpWaitingForAttackResult =
        false;


    if (mpManBoard) {

        mpManBoard.style.pointerEvents =
            "auto";

        mpManBoard.style.opacity =
            "1";

    }


    if (mpManStatus) {

        mpManStatus.innerText =
            "🦟 Mosquito is hidden. Attack a square!";

    }

}


// ===================================================
// MOSQUITO CONTROLS
// ===================================================

function createMosquitoMovementControls() {

    if (mpMosquitoControls) {

        return;

    }


    mpMosquitoControls =
        document.createElement(
            "div"
        );


    mpMosquitoControls.id =
        "multiplayerMosquitoControls";


    mpMosquitoControls.style.display =
        "flex";

    mpMosquitoControls.style.justifyContent =
        "center";

    mpMosquitoControls.style.gap =
        "12px";

    mpMosquitoControls.style.margin =
        "20px auto";


    mpStayBtn =
        document.createElement(
            "button"
        );


    mpStayBtn.innerText =
        "🦟 Stay";

    mpStayBtn.disabled =
        true;


    mpStayBtn.onclick =
        function() {

            sendMosquitoStay();

        };


    mpMoveBtn =
        document.createElement(
            "button"
        );


    mpMoveBtn.innerText =
        "🦟 Move Here";

    mpMoveBtn.disabled =
        true;


    mpMoveBtn.onclick =
        function() {

            sendMosquitoMove();

        };


    mpMosquitoControls.appendChild(
        mpStayBtn
    );

    mpMosquitoControls.appendChild(
        mpMoveBtn
    );


    if (mpMosquitoBoard) {

        mpMosquitoBoard.parentNode.insertBefore(
            mpMosquitoControls,
            mpMosquitoBoard.nextSibling
        );

    }

}


// ===================================================
// ENABLE MOVEMENT
// ===================================================

function enableMosquitoMovement(data) {

    mpMosquitoCanMove =
        true;


    mpMosquitoMoveReason =
        data.reason;


    if (
        data.currentPosition
    ) {

        mpMosquitoCurrentRow =
            Number(
                data.currentPosition.row
            );

        mpMosquitoCurrentCol =
            Number(
                data.currentPosition.col
            );

    }


    mpMosquitoSelectedCell =
        null;


    createMosquitoMovementControls();


    if (mpMosquitoControls) {

        mpMosquitoControls.style.display =
            "flex";

    }


    if (mpMosquitoBoard) {

        mpMosquitoBoard.style.pointerEvents =
            "auto";

        mpMosquitoBoard.style.opacity =
            "1";

    }


    showMultiplayerMosquitoPosition();


    highlightMultiplayerMosquitoMoves(
        data.reason
    );


    if (mpStayBtn) {

        mpStayBtn.disabled =
            false;

    }


    if (mpMoveBtn) {

        mpMoveBtn.disabled =
            true;

    }


    if (
        mpMosquitoMovementStatus
    ) {

        mpMosquitoMovementStatus.innerText =
            data.reason ===
            "bite"
                ? "🩸 BITE! Stay or fly anywhere."
                : "❌ MISS! Stay or move orthogonally.";

    }

}


// ===================================================
// STAY
// ===================================================

function sendMosquitoStay() {

    if (!mpMosquitoCanMove) {

        return;

    }


    if (
        mpSend({

            type:
                "mosquitoMove",

            roomCode:
                window.multiplayerRoomCode,

            action:
                "stay"

        })
    ) {

        // Immediately remove blue options.
        clearAllMosquitoMovementHighlights();

        lockMosquitoMovement();

    }

}


// ===================================================
// MOVE
// ===================================================

function sendMosquitoMove() {

    if (!mpMosquitoCanMove) {

        return;

    }


    if (!mpMosquitoSelectedCell) {

        if (
            mpMosquitoMovementStatus
        ) {

            mpMosquitoMovementStatus.innerText =
                "Select a blue square first.";

        }


        return;

    }


    const row =
        Number(
            mpMosquitoSelectedCell.dataset.row
        );

    const col =
        Number(
            mpMosquitoSelectedCell.dataset.col
        );


    if (
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

        })
    ) {

        // Immediately remove blue options.
        clearAllMosquitoMovementHighlights();

        lockMosquitoMovement();

    }

}


// ===================================================
// LOCK MOVEMENT
// ===================================================

function lockMosquitoMovement() {

    mpMosquitoCanMove =
        false;


    mpMosquitoMoveReason =
        null;


    mpMosquitoSelectedCell =
        null;


    if (mpStayBtn) {

        mpStayBtn.disabled =
            true;

    }


    if (mpMoveBtn) {

        mpMoveBtn.disabled =
            true;

    }


    clearAllMosquitoMovementHighlights();


    if (mpMosquitoBoard) {

        mpMosquitoBoard.style.pointerEvents =
            "none";

        mpMosquitoBoard.style.opacity =
            "0.65";

    }

}


// ===================================================
// OPEN MAN SCREEN
// ===================================================

function openMultiplayerMan() {

    hideNormalGameScreens();

    hideAllMultiplayerScreens();


    if (!mpManScreen) {

        return;

    }


    mpManScreen.classList.remove(
        "hidden"
    );


    window.currentGameMode =
        "multiplayer-man";


    mpManCanAttack =
        false;

    mpWaitingForAttackResult =
        false;


    mpManSanity =
        100;

    mpManTurn =
        1;

    mpBiteFreeTurns =
        0;


    mpMultiplayerLastAttackCell =
        null;

    mpMultiplayerLastAttackResult =
        null;


    updateManHUD();

    createMultiplayerManBoard();


    if (mpManStatus) {

        mpManStatus.innerText =
            "Waiting for Mosquito...";

    }

}


// ===================================================
// OPEN MOSQUITO SCREEN
// ===================================================

function openMultiplayerMosquito() {

    hideNormalGameScreens();

    hideAllMultiplayerScreens();


    if (!mpMosquitoScreen) {

        return;

    }


    mpMosquitoScreen.classList.remove(
        "hidden"
    );


    window.currentGameMode =
        "multiplayer-mosquito";


    // -----------------------------------------------
    // FULL CLIENT RESET
    // -----------------------------------------------

    clearAllMosquitoMovementHighlights();


    mpMosquitoCanMove =
        false;

    mpMosquitoMoveReason =
        null;

    mpMosquitoCurrentRow =
        null;

    mpMosquitoCurrentCol =
        null;

    mpMosquitoSelectedCell =
        null;


    mpManSanity =
        100;

    mpManTurn =
        1;

    mpBiteFreeTurns =
        0;


    mpMultiplayerLastAttackCell =
        null;

    mpMultiplayerLastAttackResult =
        null;


    updateMosquitoHUD();


    createMultiplayerMosquitoBoard();

    createMosquitoMovementControls();


    if (mpMosquitoControls) {

        mpMosquitoControls.style.display =
            "none";

    }


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


// ===================================================
// MAN HUD
// ===================================================

function updateManHUD() {

    const sanity =
        document.getElementById(
            "mpManSanity"
        );

    const turn =
        document.getElementById(
            "mpManTurn"
        );


    if (sanity) {

        sanity.innerText =
            mpManSanity + "%";

    }


    if (turn) {

        turn.innerText =
            mpManTurn;

    }

}


// ===================================================
// MOSQUITO HUD
// ===================================================

function updateMosquitoHUD() {

    const sanity =
        document.getElementById(
            "mpMosquitoSanity"
        );

    const turn =
        document.getElementById(
            "mpMosquitoTurn"
        );


    if (sanity) {

        sanity.innerText =
            mpManSanity + "%";

    }


    if (turn) {

        turn.innerText =
            mpManTurn;

    }

}


// ===================================================
// VICTORY SCREEN
// ===================================================

function createMultiplayerVictoryScreen(
    winner
) {

    let screen =
        document.getElementById(
            "mpVictoryScreen"
        );


    if (!screen) {

        screen =
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
            "rgba(0,0,0,0.92)";

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

        screen.style.padding =
            "20px";


        document.body.appendChild(
            screen
        );

    }


    screen.innerHTML =
        "";


    const title =
        document.createElement(
            "h1"
        );

    const image =
        document.createElement(
            "img"
        );

    const message =
        document.createElement(
            "p"
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
            "🎯 MAN WINS!";

        image.src =
            "images/manwin.png";

        image.alt =
            "Man wins";

        message.innerText =
            "The Man caught Mosquito-chan!";

    }

    else {

        title.innerText =
            "🦟 MOSQUITO WINS!";

        image.src =
            "images/mosquitowin.png";

        image.alt =
            "Mosquito wins";

        message.innerText =
            "The Man's sanity has reached zero!";

    }


    image.style.maxWidth =
        "350px";

    image.style.maxHeight =
        "350px";

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

            requestMultiplayerRestart(
                restart
            );

        };


    leave.onclick =
        function() {

            leaveMultiplayerRoom();

        };


    screen.appendChild(
        title
    );

    screen.appendChild(
        image
    );

    screen.appendChild(
        message
    );

    screen.appendChild(
        restart
    );

    screen.appendChild(
        leave
    );

}


// ===================================================
// REQUEST RESTART
// ===================================================

function requestMultiplayerRestart(
    button
) {

    if (mpRestartWaiting) {

        return;

    }


    mpRestartWaiting =
        true;


    button.disabled =
        true;

    button.innerText =
        "⏳ Waiting for opponent...";


    mpSend({

        type:
            "restartGame",

        roomCode:
            window.multiplayerRoomCode

    });

}


// ===================================================
// LEAVE ROOM
// ===================================================

function leaveMultiplayerRoom() {

    mpSend({

        type:
            "leaveRoom",

        roomCode:
            window.multiplayerRoomCode

    });

}


// ===================================================
// CLOSE VICTORY
// ===================================================

function closeMultiplayerVictoryScreen() {

    const screen =
        document.getElementById(
            "mpVictoryScreen"
        );


    if (screen) {

        screen.remove();

    }

}


// ===================================================
// HIDE BUTTON
// ===================================================

if (mpHideBtn) {

    mpHideBtn.onclick =
        function() {

            if (
                !mpMosquitoSelectedCell
            ) {

                if (
                    mpMosquitoStatus
                ) {

                    mpMosquitoStatus.innerText =
                        "Select a square first.";

                }

                return;

            }


            const row =
                Number(
                    mpMosquitoSelectedCell.dataset.row
                );

            const col =
                Number(
                    mpMosquitoSelectedCell.dataset.col
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


            window.multiplayerMosquitoReady =
                true;


            mpMosquitoCurrentRow =
                row;

            mpMosquitoCurrentCol =
                col;


            showMultiplayerMosquitoPosition();


            if (mpHideBtn) {

                mpHideBtn.disabled =
                    true;

            }


            if (mpMosquitoBoard) {

                mpMosquitoBoard.style.pointerEvents =
                    "none";

                mpMosquitoBoard.style.opacity =
                    "0.55";

            }


            if (mpMosquitoStatus) {

                mpMosquitoStatus.innerText =
                    "🦟 Hidden! Waiting for the Man.";

            }

        };

}


// ===================================================
// SOCKET OPEN
// ===================================================

mpSocket.onopen =
    function() {

        window.multiplayerConnected =
            true;


        console.log(
            "🌐 Connected to multiplayer server!"
        );

    };


// ===================================================
// SOCKET MESSAGE
// ===================================================

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
                "Invalid server message:",
                event.data
            );

            return;

        }


        console.log(
            "📨 Server:",
            data
        );


        // =================================================
        // ROOM CREATED
        // =================================================

        if (
            data.type ===
            "roomCreated"
        ) {

            window.multiplayerRole =
                data.role;

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

        }


        // =================================================
        // PLAYER JOINED
        // =================================================

        else if (
            data.type ===
            "playerJoined"
        ) {

            if (mpLobbyStatus) {

                mpLobbyStatus.innerText =
                    "✅ Opponent connected!";

            }

        }


        // =================================================
        // JOINED
        // =================================================

        else if (
            data.type ===
            "joinedRoom"
        ) {

            window.multiplayerRole =
                data.role;

            window.multiplayerRoomCode =
                data.roomCode;


            if (mpJoinStatus) {

                mpJoinStatus.innerText =
                    "✅ Joined game!";

            }

        }


        // =================================================
        // GAME START
        // =================================================

        else if (
            data.type ===
            "gameStart"
        ) {

            window.multiplayerRole =
                data.role;

            window.multiplayerRoomCode =
                data.roomCode;


            resetMultiplayerRoundState();


            if (
                data.role ===
                "man"
            ) {

                openMultiplayerMan();

            }

            else {

                openMultiplayerMosquito();

            }

        }


        // =================================================
        // NEW ROUND
        // =================================================

        else if (
            data.type ===
            "newRound"
        ) {

            console.log(
                "🔄 NEW ROUND RECEIVED"
            );


            closeMultiplayerVictoryScreen();


            // ---------------------------------------------
            // Destroy old movement controls.
            // They will be recreated for the new round.
            // ---------------------------------------------

            if (mpMosquitoControls) {

                mpMosquitoControls.remove();

            }


            mpMosquitoControls =
                null;

            mpStayBtn =
                null;

            mpMoveBtn =
                null;


            resetMultiplayerRoundState();


            if (
                data.role ===
                "man"
            ) {

                openMultiplayerMan();

            }

            else {

                openMultiplayerMosquito();

            }

        }


        // =================================================
        // MOSQUITO READY
        // =================================================

        else if (
            data.type ===
            "mosquitoReady"
        ) {

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
                    data.turn + 1;

            }


            // IMPORTANT:
            // Update both windows from server state.

            updateManHUD();

            updateMosquitoHUD();


            activateManBoard();

        }


        // =================================================
        // MOSQUITO HIDDEN
        // =================================================

        else if (
            data.type ===
            "mosquitoHidden"
        ) {

            if (
                mpMosquitoStatus
            ) {

                mpMosquitoStatus.innerText =
                    "🦟 Hidden! Waiting for the Man.";

            }

        }


        // =================================================
        // ATTACK RESULT
        // =================================================

        else if (
            data.type ===
            "attackResult"
        ) {

            mpWaitingForAttackResult =
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
                    data.turn + 1;

            }


            if (
                typeof data.biteFreeTurns ===
                "number"
            ) {

                mpBiteFreeTurns =
                    data.biteFreeTurns;

            }


            updateManHUD();

            updateMosquitoHUD();


            if (
                typeof data.attackRow ===
                    "number" &&
                typeof data.attackCol ===
                    "number"
            ) {

                applyMultiplayerAttackVisual(
                    data.attackRow,
                    data.attackCol,
                    data.result
                );

            }


            // ---------------------------------------------
            // BITE
            // ---------------------------------------------

            if (
                data.result ===
                "bite"
            ) {

                mpManCanAttack =
                    false;


                if (
                    mpManStatus
                ) {

                    mpManStatus.innerText =
                        "🩸 BITE! -10 Sanity.";

                }


                return;

            }


            // ---------------------------------------------
            // MISS
            // ---------------------------------------------

            if (
                data.result ===
                "miss"
            ) {

                mpManCanAttack =
                    false;


                if (
                    mpManStatus
                ) {

                    mpManStatus.innerText =
                        "❌ MISS! -1 Sanity.";

                }


                return;

            }


            // ---------------------------------------------
            // HIT
            // ---------------------------------------------

            if (
                data.result ===
                "hit"
            ) {

                mpManCanAttack =
                    false;


                createMultiplayerVictoryScreen(
                    "man"
                );


                return;

            }

        }


        // =================================================
        // MOSQUITO TURN
        // =================================================

        else if (
            data.type ===
            "mosquitoTurn"
        ) {

            if (
                window.multiplayerRole !==
                "mosquito"
            ) {

                return;

            }


            if (
                data.currentPosition
            ) {

                mpMosquitoCurrentRow =
                    Number(
                        data.currentPosition.row
                    );

                mpMosquitoCurrentCol =
                    Number(
                        data.currentPosition.col
                    );

            }


            enableMosquitoMovement(
                data
            );

        }


        // =================================================
        // MOSQUITO MOVE RESULT
        // =================================================

        else if (
            data.type ===
            "mosquitoMoveResult"
        ) {

            if (
                typeof data.row ===
                "number"
            ) {

                mpMosquitoCurrentRow =
                    data.row;

            }


            if (
                typeof data.col ===
                "number"
            ) {

                mpMosquitoCurrentCol =
                    data.col;

            }


            showMultiplayerMosquitoPosition();


            // ---------------------------------------------
            // CRITICAL:
            // Remove every blue movement tile.
            // ---------------------------------------------

            clearAllMosquitoMovementHighlights();

            lockMosquitoMovement();


            if (
                mpMosquitoStatus
            ) {

                mpMosquitoStatus.innerText =
                    "🦟 Waiting for the Man...";

            }

        }


        // =================================================
        // MOSQUITO MOVED
        // =================================================

        else if (
            data.type ===
            "mosquitoMoved"
        ) {

            // ---------------------------------------------
            // Clear movement highlights on Man's client
            // just in case.
            // ---------------------------------------------

            clearAllMosquitoMovementHighlights();


            mpManCanAttack =
                true;

            mpWaitingForAttackResult =
                false;


            if (mpManBoard) {

                mpManBoard.style.pointerEvents =
                    "auto";

                mpManBoard.style.opacity =
                    "1";

            }


            if (
                mpManStatus
            ) {

                mpManStatus.innerText =
                    "🦟 The Mosquito moved. Attack!";

            }

        }


        // =================================================
        // GAME OVER
        // =================================================

        else if (
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


            updateManHUD();

            updateMosquitoHUD();


            mpManCanAttack =
                false;

            mpMosquitoCanMove =
                false;


            clearAllMosquitoMovementHighlights();


            if (mpManBoard) {

                mpManBoard.style.pointerEvents =
                    "none";

            }


            if (mpMosquitoBoard) {

                mpMosquitoBoard.style.pointerEvents =
                    "none";

            }


            createMultiplayerVictoryScreen(
                data.winner
            );

        }


        // =================================================
        // RESTART WAITING
        // =================================================

        else if (
            data.type ===
            "restartWaiting"
        ) {

            mpRestartWaiting =
                true;

        }


        // =================================================
        // LEFT ROOM
        // =================================================

        else if (
            data.type ===
            "leftRoom"
        ) {

            closeMultiplayerVictoryScreen();


            resetMultiplayerRoundState();


            window.multiplayerRole =
                null;

            window.multiplayerRoomCode =
                null;


            hideAllMultiplayerScreens();

            hideNormalGameScreens();


            const mainMenu =
                document.getElementById(
                    "mainMenu"
                );


            if (mainMenu) {

                mainMenu.classList.remove(
                    "hidden"
                );

            }

        }


        // =================================================
        // OPPONENT LEFT
        // =================================================

        else if (
            data.type ===
            "opponentLeftRoom"
        ) {

            alert(
                "Your opponent left the room."
            );


            closeMultiplayerVictoryScreen();


            resetMultiplayerRoundState();


            window.multiplayerRole =
                null;

            window.multiplayerRoomCode =
                null;

        }


        // =================================================
        // ERROR
        // =================================================

        else if (
            data.type ===
            "error"
        ) {

            console.error(
                "❌ Multiplayer server error:",
                data.message
            );


            mpWaitingForAttackResult =
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


            if (mpJoinStatus) {

                mpJoinStatus.innerText =
                    "❌ " +
                    data.message;

            }


            if (mpManStatus) {

                mpManStatus.innerText =
                    "❌ " +
                    data.message;

            }


            if (
                mpMosquitoStatus
            ) {

                mpMosquitoStatus.innerText =
                    "❌ " +
                    data.message;

            }

        }


        // =================================================
        // DISCONNECT
        // =================================================

        else if (
            data.type ===
            "opponentDisconnected"
        ) {

            alert(
                "Your opponent disconnected."
            );


            closeMultiplayerVictoryScreen();


            resetMultiplayerRoundState();


            window.multiplayerRole =
                null;

            window.multiplayerRoomCode =
                null;

        }

    };


// ===================================================
// CREATE GAME
// ===================================================

if (mpCreateGameBtn) {

    mpCreateGameBtn.onclick =
        function() {

            if (
                mpSocket.readyState !==
                WebSocket.OPEN
            ) {

                if (
                    mpLobbyStatus
                ) {

                    mpLobbyStatus.innerText =
                        "❌ Not connected to server.";

                }

                return;

            }


            if (
                mpCreateGamePanel
            ) {

                mpCreateGamePanel.classList.remove(
                    "hidden"
                );

            }


            if (
                mpJoinGamePanel
            ) {

                mpJoinGamePanel.classList.add(
                    "hidden"
                );

            }


            if (
                mpLobbyStatus
            ) {

                mpLobbyStatus.innerText =
                    "Creating game...";

            }


            mpSend({

                type:
                    "createRoom"

            });

        };

}


// ===================================================
// JOIN GAME
// ===================================================

if (mpJoinGameBtn) {

    mpJoinGameBtn.onclick =
        function() {

            if (
                mpJoinGamePanel
            ) {

                mpJoinGamePanel.classList.remove(
                    "hidden"
                );

            }


            if (
                mpCreateGamePanel
            ) {

                mpCreateGamePanel.classList.add(
                    "hidden"
                );

            }


            if (
                mpJoinStatus
            ) {

                mpJoinStatus.innerText =
                    "";

            }


            if (
                mpRoomCodeInput
            ) {

                mpRoomCodeInput.value =
                    "";

                mpRoomCodeInput.focus();

            }

        };

}


// ===================================================
// JOIN ROOM
// ===================================================

if (mpJoinRoomBtn) {

    mpJoinRoomBtn.onclick =
        function() {

            const code =
                mpRoomCodeInput.value
                    .trim()
                    .toUpperCase();


            if (
                code.length !==
                6
            ) {

                mpJoinStatus.innerText =
                    "Enter a 6-character game code.";

                return;

            }


            if (
                mpSocket.readyState !==
                WebSocket.OPEN
            ) {

                mpJoinStatus.innerText =
                    "❌ Not connected to server.";

                return;

            }


            mpJoinStatus.innerText =
                "Joining game...";


            mpSend({

                type:
                    "joinRoom",

                roomCode:
                    code

            });

        };

}


// ===================================================
// ENTER KEY
// ===================================================

if (mpRoomCodeInput) {

    mpRoomCodeInput.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key ===
                "Enter"
            ) {

                mpJoinRoomBtn.click();

            }

        }
    );

}


// ===================================================
// BACK
// ===================================================

if (mpPlayerBackBtn) {

    mpPlayerBackBtn.onclick =
        function() {

            hideAllMultiplayerScreens();

            hideNormalGameScreens();

            closeMultiplayerVictoryScreen();


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


// ===================================================
// SOCKET CLOSE
// ===================================================

mpSocket.onclose =
    function() {

        window.multiplayerConnected =
            false;


        mpManCanAttack =
            false;

        mpWaitingForAttackResult =
            false;

        mpMosquitoCanMove =
            false;


        console.log(
            "❌ Disconnected from multiplayer server."
        );

    };


// ===================================================
// SOCKET ERROR
// ===================================================

mpSocket.onerror =
    function(error) {

        console.error(
            "❌ Multiplayer WebSocket error:",
            error
        );

    };
