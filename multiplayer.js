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
// GLOBAL MULTIPLAYER STATE
// ============================================================

window.multiplayerRole = null;
window.multiplayerRoomCode = null;
window.multiplayerConnected = false;


// ============================================================
// ROUND STATE
// ============================================================

let mpRoundId = 0;

let mpManSanity = 100;
let mpManTurn = 1;
let mpBiteFreeTurns = 0;

let mpManCanAttack = false;
let mpWaitingForAttackResult = false;

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

let mpRestartRequested = false;


// ============================================================
// LOBBY ELEMENTS
// ============================================================

const mpCreateGameBtn =
    document.getElementById("createGameBtn");

const mpJoinGameBtn =
    document.getElementById("joinGameBtn");

const mpCreateGamePanel =
    document.getElementById("createGamePanel");

const mpJoinGamePanel =
    document.getElementById("joinGamePanel");

const mpRoomCode =
    document.getElementById("roomCode");

const mpRoomCodeInput =
    document.getElementById("roomCodeInput");

const mpJoinRoomBtn =
    document.getElementById("joinRoomBtn");

const mpLobbyStatus =
    document.getElementById("lobbyStatus");

const mpJoinStatus =
    document.getElementById("joinStatus");

const mpPlayerBackBtn =
    document.getElementById("playerBackBtn");


// ============================================================
// SCREENS
// ============================================================

const mpLobbyScreen =
    document.getElementById("playerModeMenu");

const mpManScreen =
    document.getElementById(
        "multiplayerManScreen"
    );

const mpMosquitoScreen =
    document.getElementById(
        "multiplayerMosquitoScreen"
    );


// ============================================================
// BOARDS
// ============================================================

const mpManBoard =
    document.getElementById(
        "multiplayerManBoard"
    );

const mpMosquitoBoard =
    document.getElementById(
        "multiplayerMosquitoBoard"
    );


// ============================================================
// BUTTONS / STATUS
// ============================================================

const mpHideBtn =
    document.getElementById(
        "multiplayerHideBtn"
    );

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


// ============================================================
// DYNAMIC MOVEMENT CONTROLS
// ============================================================

let mpMosquitoControls = null;
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
// HIDE ALL MULTIPLAYER SCREENS
// ============================================================

function hideMultiplayerScreens() {

    if (mpLobbyScreen) {

        mpLobbyScreen.classList.add(
            "hidden"
        );

    }

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


// ============================================================
// HIDE NORMAL GAME SCREENS
// ============================================================

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


// ============================================================
// CLOSE VICTORY
// ============================================================

function closeMultiplayerVictoryScreen() {

    const screen =
        document.getElementById(
            "mpVictoryScreen"
        );

    if (screen) {

        screen.remove();

    }

}


// ============================================================
// COMPLETE ROUND RESET
// ============================================================
//
// THIS IS THE ONLY FUNCTION THAT RESETS
// MULTIPLAYER ROUND STATE.
//
// ============================================================

function resetMultiplayerRound() {

    console.log(
        "🔄 COMPLETE MULTIPLAYER ROUND RESET"
    );


    mpRoundId++;


    mpManSanity = 100;

    mpManTurn = 1;

    mpBiteFreeTurns = 0;


    mpManCanAttack = false;

    mpWaitingForAttackResult = false;


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


    mpRestartRequested = false;


    window.multiplayerMosquitoReady =
        false;

    window.multiplayerManReady =
        false;


    clearMosquitoMovement();

    clearAttackHighlights();

    removeMosquitoControls();


    if (mpHideBtn) {

        mpHideBtn.disabled = true;

    }


    updateManHUD();

    updateMosquitoHUD();

}


// ============================================================
// REMOVE MOVEMENT CONTROLS
// ============================================================

function removeMosquitoControls() {

    if (mpMosquitoControls) {

        mpMosquitoControls.remove();

    }

    mpMosquitoControls = null;
    mpStayBtn = null;
    mpMoveBtn = null;

}


// ============================================================
// CLEAR MOVEMENT
// ============================================================

function clearMosquitoMovement() {

    const boards = [
        mpMosquitoBoard,
        mpManBoard
    ];

    boards.forEach(
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

                        cell.style.outline =
                            "";

                        cell.style.background =
                            "";

                    }
                );

        }
    );

}


// ============================================================
// CLEAR ATTACKS
// ============================================================

function clearAttackHighlights() {

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


// ============================================================
// BOARD STYLE
// ============================================================

function setupBoard(board) {

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

}


// ============================================================
// CELL
// ============================================================

function createCell(row, col) {

    const cell =
        document.createElement(
            "div"
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

    cell.style.cursor =
        "pointer";

    cell.style.userSelect =
        "none";

    cell.style.fontWeight =
        "bold";


    return cell;

}


// ============================================================
// RESTORE CELL LABEL
// ============================================================

function restoreCell(cell) {

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
        cell.dataset.position;

}


// ============================================================
// CREATE MAN BOARD
// ============================================================

function createManBoard() {

    if (!mpManBoard) {

        return;

    }

    mpManBoard.innerHTML =
        "";

    mpSelectedManCell =
        null;

    setupBoard(
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
                createCell(
                    row,
                    col
                );


            cell.addEventListener(
                "click",
                function() {

                    manAttackCell(
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
// CREATE MOSQUITO BOARD
// ============================================================

function createMosquitoBoard() {

    if (!mpMosquitoBoard) {

        return;

    }

    mpMosquitoBoard.innerHTML =
        "";

    mpSelectedMosquitoCell =
        null;

    setupBoard(
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
                createCell(
                    row,
                    col
                );


            cell.addEventListener(
                "click",
                function() {

                    mosquitoCellClicked(
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
// SHOW MOSQUITO
// ============================================================

function showMosquito() {

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

                cell.classList.remove(
                    "mpMosquitoCurrent"
                );

                restoreCell(
                    cell
                );

            }
        );


    const cell =
        mpMosquitoBoard.querySelector(
            `[data-row="${mpMosquitoRow}"][data-col="${mpMosquitoCol}"]`
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


// ============================================================
// MOSQUITO CELL CLICK
// ============================================================

function mosquitoCellClicked(cell) {

    // --------------------------------------------------------
    // HIDING
    // --------------------------------------------------------

    if (
        !mpMosquitoReady &&
        !mpMosquitoCanMove
    ) {

        if (mpSelectedMosquitoCell) {

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
                "Selected hiding place: " +
                cell.dataset.position;

        }


        return;

    }


    // --------------------------------------------------------
    // MOVEMENT
    // --------------------------------------------------------

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


        if (mpSelectedMosquitoCell) {

            mpSelectedMosquitoCell.classList.remove(
                "movementSelected"
            );

        }


        mpSelectedMosquitoCell =
            cell;


        cell.classList.add(
            "movementSelected"
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

            if (
                mpMosquitoReady
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


            window.multiplayerMosquitoReady =
                true;


            mpMosquitoRow =
                row;

            mpMosquitoCol =
                col;


            showMosquito();


            mpHideBtn.disabled =
                true;


            mpMosquitoBoard.style.pointerEvents =
                "none";


            mpMosquitoBoard.style.opacity =
                "0.55";


            if (mpMosquitoStatus) {

                mpMosquitoStatus.innerText =
                    "🦟 Hidden! Waiting for the Man.";

            }

        };

}


// ============================================================
// MAN ATTACK
// ============================================================

function manAttackCell(cell) {

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


    mpSelectedManCell =
        cell;


    mpWaitingForAttackResult =
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


    const sent =
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


    if (!sent) {

        mpWaitingForAttackResult =
            false;

        mpManCanAttack =
            true;

        mpManBoard.style.pointerEvents =
            "auto";

    }

}


// ============================================================
// ACTIVATE MAN
// ============================================================

function activateMan() {

    mpManCanAttack =
        true;

    mpWaitingForAttackResult =
        false;

    window.multiplayerManReady =
        true;


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
// UPDATE MAN HUD
// ============================================================

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


// ============================================================
// UPDATE MOSQUITO HUD
// ============================================================

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


// ============================================================
// ATTACK VISUAL
// ============================================================

function showAttack(
    row,
    col,
    result
) {

    clearAttackHighlights();


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
                "bite"
            ) {

                cell.classList.add(
                    "mpMultiplayerAttackBite"
                );

                cell.style.background =
                    "orange";

            }

            else {

                cell.classList.add(
                    result ===
                    "hit"
                        ? "mpMultiplayerAttackHit"
                        : "mpMultiplayerAttackMiss"
                );

                cell.style.background =
                    "red";

            }

        }
    );


    mpLastAttackRow =
        row;

    mpLastAttackCol =
        col;

    mpLastAttackResult =
        result;

}


// ============================================================
// MOVEMENT CONTROLS
// ============================================================

function createMovementControls() {

    removeMosquitoControls();


    mpMosquitoControls =
        document.createElement(
            "div"
        );


    mpMosquitoControls.style.display =
        "flex";

    mpMosquitoControls.style.gap =
        "12px";

    mpMosquitoControls.style.justifyContent =
        "center";

    mpMosquitoControls.style.margin =
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

            mosquitoStay();

        };


    mpMoveBtn.onclick =
        function() {

            mosquitoMove();

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


// ============================================================
// HIGHLIGHT MOVEMENT
// ============================================================

function highlightMosquitoMovement(
    reason
) {

    clearMosquitoMovement();


    if (
        mpMosquitoRow === null ||
        mpMosquitoCol === null
    ) {

        return;

    }


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
                    row === mpMosquitoRow &&
                    col === mpMosquitoCol
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
                        "rgba(0,110,255,.45)";

                    cell.style.outline =
                        "3px solid blue";

                }

            }

        }


        return;

    }


    const dirs = [

        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]

    ];


    dirs.forEach(
        function(dir) {

            const row =
                mpMosquitoRow +
                dir[0];

            const col =
                mpMosquitoCol +
                dir[1];


            if (
                !mpValid(
                    row,
                    col
                )
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
                    "rgba(0,110,255,.45)";

                cell.style.outline =
                    "3px solid blue";

            }

        }
    );

}


// ============================================================
// ENABLE MOSQUITO MOVEMENT
// ============================================================

function enableMosquitoMovement(
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


    createMovementControls();


    if (mpMosquitoBoard) {

        mpMosquitoBoard.style.pointerEvents =
            "auto";

        mpMosquitoBoard.style.opacity =
            "1";

    }


    showMosquito();


    highlightMosquitoMovement(
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
            data.reason === "bite"
                ? "🩸 Bite! Stay or fly anywhere."
                : "❌ Miss! Stay or move orthogonally.";

    }

}


// ============================================================
// LOCK MOSQUITO
// ============================================================

function lockMosquito() {

    mpMosquitoCanMove =
        false;

    mpMosquitoMoveReason =
        null;

    mpSelectedMosquitoCell =
        null;


    clearMosquitoMovement();


    if (mpStayBtn) {

        mpStayBtn.disabled =
            true;

    }

    if (mpMoveBtn) {

        mpMoveBtn.disabled =
            true;

    }


    if (mpMosquitoBoard) {

        mpMosquitoBoard.style.pointerEvents =
            "none";

        mpMosquitoBoard.style.opacity =
            "0.55";

    }

}


// ============================================================
// STAY
// ============================================================

function mosquitoStay() {

    if (
        !mpMosquitoCanMove
    ) {

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

        lockMosquito();

    }

}


// ============================================================
// MOVE
// ============================================================

function mosquitoMove() {

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

        lockMosquito();

    }

}


// ============================================================
// OPEN MAN
// ============================================================

function openMultiplayerMan() {

    console.log(
        "🧍 OPENING FRESH MULTIPLAYER MAN SCREEN"
    );


    closeMultiplayerVictoryScreen();


    hideNormalGameScreens();

    hideMultiplayerScreens();


    if (!mpManScreen) {

        console.error(
            "❌ multiplayerManScreen missing."
        );

        return;

    }


    mpManScreen.classList.remove(
        "hidden"
    );


    window.currentGameMode =
        "multiplayer-man";


    // IMPORTANT:
    // DO NOT reset room/game state here.
    // Only the dedicated round reset does that.

    mpManCanAttack =
        false;

    mpWaitingForAttackResult =
        false;


    updateManHUD();


    createManBoard();


    if (mpManStatus) {

        mpManStatus.innerText =
            "Waiting for Mosquito...";

    }

}


// ============================================================
// OPEN MOSQUITO
// ============================================================

function openMultiplayerMosquito() {

    console.log(
        "🦟 OPENING FRESH MULTIPLAYER MOSQUITO SCREEN"
    );


    closeMultiplayerVictoryScreen();


    hideNormalGameScreens();

    hideMultiplayerScreens();


    if (!mpMosquitoScreen) {

        console.error(
            "❌ multiplayerMosquitoScreen missing."
        );

        return;

    }


    mpMosquitoScreen.classList.remove(
        "hidden"
    );


    window.currentGameMode =
        "multiplayer-mosquito";


    // --------------------------------------------------------
    // FRESH ROUND CLIENT STATE
    // --------------------------------------------------------

    mpMosquitoReady =
        false;

    mpMosquitoCanMove =
        false;

    mpMosquitoMoveReason =
        null;

    mpMosquitoRow =
        null;

    mpMosquitoCol =
        null;

    mpSelectedMosquitoCell =
        null;


    updateMosquitoHUD();


    createMosquitoBoard();


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
// VICTORY SCREEN
// ============================================================

function showVictory(
    winner
) {

    closeMultiplayerVictoryScreen();


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
        "rgba(0,0,0,.94)";

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
// SOCKET OPEN
// ============================================================

mpSocket.onopen =
    function() {

        window.multiplayerConnected =
            true;

        console.log(
            "🌐 Connected to multiplayer server."
        );

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
                "❌ Invalid server message:",
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


            resetMultiplayerRound();


            if (
                data.role ===
                "man"
            ) {

                openMultiplayerMan();

            }

            else {

                openMultiplayerMosquito();

            }


            return;

        }


        // ==================================================
        // NEW ROUND
        // ==================================================
        //
        // THIS IS THE IMPORTANT RESTART FIX.
        //
        // We do NOT merely change a few variables.
        //
        // We completely destroy the old client round,
        // remove the victory screen,
        // remove movement controls,
        // rebuild the correct board,
        // and restore the role-specific starting state.
        //
        // ==================================================

        if (
            data.type ===
            "newRound"
        ) {

            console.log(
                "🔄 NEW ROUND RECEIVED:",
                data
            );


            window.multiplayerRole =
                data.role;

            window.multiplayerRoomCode =
                data.roomCode ||
                window.multiplayerRoomCode;


            // ----------------------------------------------
            // Destroy old round completely
            // ----------------------------------------------

            closeMultiplayerVictoryScreen();

            clearMosquitoMovement();

            clearAttackHighlights();

            removeMosquitoControls();


            // ----------------------------------------------
            // Reset ALL local state
            // ----------------------------------------------

            resetMultiplayerRound();


            // ----------------------------------------------
            // Open a genuinely fresh screen
            // ----------------------------------------------

            if (
                data.role ===
                "man"
            ) {

                openMultiplayerMan();

            }

            else if (
                data.role ===
                "mosquito"
            ) {

                openMultiplayerMosquito();

            }


            console.log(
                "✅ FRESH ROUND READY"
            );


            return;

        }


        // ==================================================
        // MOSQUITO READY
        // ==================================================

        if (
            data.type ===
            "mosquitoReady"
        ) {

            if (
                window.multiplayerRole !==
                "man"
            ) {

                return;

            }


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


            updateManHUD();

            updateMosquitoHUD();

            activateMan();


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
                    "🦟 Hidden! Waiting for the Man.";

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

                showAttack(
                    data.attackRow,
                    data.attackCol,
                    data.result
                );

            }


            if (
                data.result ===
                "hit"
            ) {

                mpManCanAttack =
                    false;

                showVictory(
                    "man"
                );

                return;

            }


            if (
                data.result ===
                "bite"
            ) {

                mpManCanAttack =
                    false;


                if (mpManStatus) {

                    mpManStatus.innerText =
                        "🩸 BITE! -10 Sanity.";

                }

                return;

            }


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


            return;

        }


        // ==================================================
        // MOSQUITO TURN
        // ==================================================

        if (
            data.type ===
            "mosquitoTurn"
        ) {

            if (
                window.multiplayerRole !==
                "mosquito"
            ) {

                return;

            }


            enableMosquitoMovement(
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

            if (
                typeof data.row ===
                "number"
            ) {

                mpMosquitoRow =
                    data.row;

            }


            if (
                typeof data.col ===
                "number"
            ) {

                mpMosquitoCol =
                    data.col;

            }


            // ----------------------------------------------
            // Clear blue FIRST
            // ----------------------------------------------

            clearMosquitoMovement();


            lockMosquito();


            showMosquito();


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

            clearMosquitoMovement();


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


            updateManHUD();

            updateMosquitoHUD();


            mpManCanAttack =
                false;

            mpMosquitoCanMove =
                false;


            clearMosquitoMovement();


            if (mpManBoard) {

                mpManBoard.style.pointerEvents =
                    "none";

            }


            if (mpMosquitoBoard) {

                mpMosquitoBoard.style.pointerEvents =
                    "none";

            }


            showVictory(
                data.winner
            );


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
        // LEFT ROOM
        // ==================================================

        if (
            data.type ===
            "leftRoom"
        ) {

            closeMultiplayerVictoryScreen();

            resetMultiplayerRound();

            window.multiplayerRole =
                null;

            window.multiplayerRoomCode =
                null;


            hideMultiplayerScreens();


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

            closeMultiplayerVictoryScreen();

            alert(
                "Your opponent left the room."
            );


            resetMultiplayerRound();


            window.multiplayerRole =
                null;

            window.multiplayerRoomCode =
                null;


            return;

        }


        // ==================================================
        // OPPONENT DISCONNECTED
        // ==================================================

        if (
            data.type ===
            "opponentDisconnected"
        ) {

            alert(
                "Your opponent disconnected."
            );


            resetMultiplayerRound();


            window.multiplayerRole =
                null;

            window.multiplayerRoomCode =
                null;


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


            mpWaitingForAttackResult =
                false;


            if (
                mpJoinStatus
            ) {

                mpJoinStatus.innerText =
                    "❌ " +
                    data.message;

            }


            if (
                mpManStatus
            ) {

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


            mpSend({

                type:
                    "createRoom"

            });

        };

}


// ============================================================
// JOIN GAME
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
// ENTER KEY
// ============================================================

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


// ============================================================
// BACK
// ============================================================

if (mpPlayerBackBtn) {

    mpPlayerBackBtn.onclick =
        function() {

            hideMultiplayerScreens();

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
