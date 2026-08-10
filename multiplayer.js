// ============================================================
// MAN VS MOSQUITO
// MULTIPLAYER.JS
// ============================================================

const MP_WS_URL =
    "wss://man-vs-mosquito.onrender.com";

const MP_ROWS = 6;
const MP_COLS = 6;


// ============================================================
// WEBSOCKET
// ============================================================

const mpSocket =
    new WebSocket(MP_WS_URL);


// ============================================================
// GLOBAL MULTIPLAYER IDENTITY
// ============================================================

window.multiplayerRole = null;
window.multiplayerRoomCode = null;
window.multiplayerConnected = false;


// ============================================================
// MULTIPLAYER STATE
// ============================================================

let mpManSanity = 100;

let mpManTurn = 1;

let mpGambles = 3;

let mpMissStreak = 0;

let mpManCanAttack = false;

let mpWaitingForResult = false;

let mpGambleMode = false;


// ============================================================
// MOSQUITO STATE
// ============================================================

let mpMosquitoReady = false;

let mpMosquitoCanMove = false;

let mpMosquitoMoveReason = null;

let mpMosquitoRow = null;

let mpMosquitoCol = null;


// ============================================================
// SELECTION STATE
// ============================================================

let mpSelectedManCell = null;

let mpSelectedMosquitoCell = null;


// ============================================================
// RESTART STATE
// ============================================================

let mpRestartRequested = false;


// ============================================================
// MOVEMENT CONTROLS
// ============================================================

let mpMovementControls = null;

let mpStayBtn = null;

let mpMoveBtn = null;


// ============================================================
// DOM HELPER
// ============================================================

function mpGet(...ids) {

    for (
        const id of ids
    ) {

        const element =
            document.getElementById(id);

        if (element) {

            return element;

        }

    }

    return null;

}


// ============================================================
// LOBBY ELEMENTS
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

const mpManSanityEl =
    mpGet(
        "mpManSanity",
        "multiplayerManSanity"
    );

const mpManGambleEl =
    mpGet(
        "mpManGamble",
        "multiplayerManGamble"
    );

const mpManTurnEl =
    mpGet(
        "mpManTurn",
        "multiplayerManTurn"
    );

const mpGambleBtn =
    mpGet(
        "multiplayerGambleBtn"
    );

const mpManStatus =
    mpGet(
        "mpManStatus",
        "multiplayerStatus"
    );


// ============================================================
// MOSQUITO HUD
// ============================================================

const mpMosquitoSanityEl =
    mpGet(
        "mpMosquitoSanity",
        "multiplayerMosquitoManSanity"
    );

const mpMosquitoTurnEl =
    mpGet(
        "mpMosquitoTurn",
        "multiplayerMosquitoTurn"
    );

const mpMosquitoStatus =
    mpGet(
        "mpMosquitoStatus",
        "multiplayerMosquitoStatus"
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
// POSITION
// A1 - F6
// ============================================================

function mpPosition(
    row,
    col
) {

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

function mpValid(
    row,
    col
) {

    return (
        Number.isInteger(row) &&
        Number.isInteger(col) &&
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
// HIDE MULTIPLAYER SCREENS
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
// HIDE NORMAL GAME SCREENS
// IMPORTANT:
// Does NOT touch mainMenu or modeMenu.
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
// CLEAR MOVEMENT HIGHLIGHTS
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
// CLEAR SELECTED CELLS
// ============================================================

function mpClearSelections() {

    [
        mpSelectedManCell,
        mpSelectedMosquitoCell
    ]
    .forEach(
        function(cell) {

            if (cell) {

                cell.classList.remove(
                    "selected"
                );

            }

        }
    );


    mpSelectedManCell =
        null;

    mpSelectedMosquitoCell =
        null;

}


// ============================================================
// REMOVE MOVEMENT CONTROLS
// ============================================================

function mpRemoveMovementControls() {

    if (
        mpMovementControls
    ) {

        mpMovementControls.remove();

    }


    mpMovementControls =
        null;

    mpStayBtn =
        null;

    mpMoveBtn =
        null;

}


// ============================================================
// REMOVE VICTORY
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
// RESET LOCAL ROUND
// ============================================================

function mpResetLocalRound() {

    mpManSanity =
        100;
    
        updateSanityMusic(100);

    mpManTurn =
        1;

    mpGambles =
        3;

    mpMissStreak =
        0;

    mpManCanAttack =
        false;

    mpWaitingForResult =
        false;

    mpGambleMode =
        false;


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


    mpSelectedManCell =
        null;

    mpSelectedMosquitoCell =
        null;


    mpRestartRequested =
        false;


    mpClearMovement();

    mpClearAttackHighlights();

    mpClearSelections();

    mpRemoveMovementControls();

    mpUpdateHUD();

}


// ============================================================
// HUD
// ============================================================

function mpUpdateHUD() {

    if (mpManSanityEl) {

        mpManSanityEl.innerText =
            mpManSanity + "%";

    }


    if (mpManGambleEl) {

        mpManGambleEl.innerText =
            mpGambles;

    }


    if (mpManTurnEl) {

        mpManTurnEl.innerText =
            mpManTurn;

    }


    // IMPORTANT:
    // Mosquito sees the SAME sanity value.

    if (mpMosquitoSanityEl) {

        mpMosquitoSanityEl.innerText =
            mpManSanity + "%";

    }


    if (mpMosquitoTurnEl) {

        mpMosquitoTurnEl.innerText =
            mpManTurn;

    }

}


// ============================================================
// BOARD SETUP
// ============================================================

function mpSetupBoard(
    board
) {

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

function mpCreateCell(
    row,
    col
) {

    const cell =
        document.createElement(
            "button"
        );


    cell.type =
        "button";


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
// CREATE MAN BOARD
// ============================================================

function mpCreateManBoard() {

    if (!mpManBoard) {

        console.error(
            "❌ multiplayerManBoard not found."
        );

        return;

    }


    mpManBoard.innerHTML =
        "";


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


    mpMosquitoBoard.innerHTML =
        "";


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
// SHOW MOSQUITO
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
// MOSQUITO CELL CLICK
// ============================================================

function mpMosquitoCellClicked(
    cell
) {

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
// MAN CELL CLICK
// ============================================================

function mpManCellClicked(
    cell
) {

    if (
        !mpManCanAttack
    ) {

        return;

    }


    if (
        mpWaitingForResult
    ) {

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
    // GAMBLE MODE
    // ------------------------------------------

    if (
        mpGambleMode
    ) {

        mpPerformGamble(
            row,
            col
        );

        return;

    }


    // ------------------------------------------
    // NORMAL ATTACK
    // ------------------------------------------

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


            mpClearGambleHighlight();


            if (mpManStatus) {

                mpManStatus.innerText =
                    "🎲 Gamble ready! Choose the TOP-LEFT square of a 2×2 area (A1–E5).";

            }

        };

}


// ============================================================
// CLEAR GAMBLE HIGHLIGHT
// ============================================================

function mpClearGambleHighlight() {

    if (!mpManBoard) {

        return;

    }


    mpManBoard
        .querySelectorAll(
            ".mpAttackBlue"
        )
        .forEach(
            function(cell) {

                cell.classList.remove(
                    "mpAttackBlue"
                );

                cell.style.background =
                    "";

            }
        );

}


// ============================================================
// SHOW GAMBLE AREA
// ============================================================

function mpShowGambleArea(
    row,
    col
) {

    mpClearGambleHighlight();


    const area = [

        [row, col],

        [
            row,
            col + 1
        ],

        [
            row + 1,
            col
        ],

        [
            row + 1,
            col + 1
        ]

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

}


// ============================================================
// PERFORM GAMBLE
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
                "Choose a top-left square from A1 to E5.";

        }

        return;

    }


    if (
        mpGambles <= 0
    ) {

        return;

    }


    mpShowGambleArea(
        row,
        col
    );


    mpGambleMode =
        false;


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
            "🎲 MAD MAN'S GAMBLE!";

    }


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

    mpGambleMode =
        false;


    mpClearGambleHighlight();


    if (mpManBoard) {

        mpManBoard.style.pointerEvents =
            "auto";

        mpManBoard.style.opacity =
            "1";

    }


    if (mpGambleBtn) {

        mpGambleBtn.disabled =
            mpGambles <= 0;

    }


    if (mpManStatus) {

        mpManStatus.innerText =
            "🦟 Mosquito is hidden. Attack!";

    }

}


// ============================================================
// SHOW ATTACK
// ============================================================
//
// Red = normal attack
// Orange = bite
//
// Only the latest attack remains.
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


    mpMovementControls.id =
        "mpMovementControls";


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


    mpStayBtn.type =
        "button";


    mpStayBtn.innerText =
        "🦟 Stay";


    mpMoveBtn =
        document.createElement(
            "button"
        );


    mpMoveBtn.type =
        "button";


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


    if (
        mpMosquitoBoard
    ) {

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
    // BITE
    // Mosquito can fly anywhere.
    // ------------------------------------------

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


    // ------------------------------------------
    // MISS
    // Orthogonal only.
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
// ENABLE MOSQUITO MOVEMENT
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


    if (
        mpMosquitoMovementStatus
    ) {

        if (
            data.reason ===
            "bite"
        ) {

            mpMosquitoMovementStatus.innerText =
                "🩸 BITE! Stay or fly anywhere.";

        }

        else {

            mpMosquitoMovementStatus.innerText =
                "❌ MISS! Stay or move one square orthogonally.";

        }

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


    mpLockMosquito();


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
            mpSelectedMosquitoCell.dataset.row
        );


    const col =
        Number(
            mpSelectedMosquitoCell.dataset.col
        );


    mpLockMosquito();


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

    mpRemoveVictory();

    mpHideNormalScreens();

    mpHideScreens();


    if (!mpManScreen) {

        console.error(
            "❌ #multiplayerManScreen not found."
        );

        return;

    }


    mpManScreen.classList.remove(
        "hidden"
    );


    mpCreateManBoard();


    mpManCanAttack =
        false;

    mpWaitingForResult =
        false;

    mpGambleMode =
        false;


    mpUpdateHUD();


    if (mpManStatus) {

        mpManStatus.innerText =
            "Waiting for Mosquito...";

    }

}


// ============================================================
// OPEN MOSQUITO SCREEN
// ============================================================

function mpOpenMosquito() {

    mpRemoveVictory();

    mpHideNormalScreens();

    mpHideScreens();


    if (!mpMosquitoScreen) {

        console.error(
            "❌ #multiplayerMosquitoScreen not found."
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


    mpUpdateHUD();

}


// ============================================================
// VICTORY SCREEN
// ============================================================

function mpShowVictory(
    winner
) {

    mpRemoveVictory();


    mpManCanAttack =
        false;

    mpMosquitoCanMove =
        false;

    mpGambleMode =
        false;


    mpClearMovement();

    mpClearGambleHighlight();

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

    screen.style.padding =
        "20px";


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
            "🎯 THE MAN WINS!";

        image.src =
            "images/manwin.png";

        message.innerText =
            "The Man found Mosquito-chan!";

    }

    else {

        title.innerText =
            "🦟 MOSQUITO-CHAN WINS!";

        image.src =
            "images/mosquitowin.png";

        message.innerText =
            "The Man's sanity has reached zero.";

    }


    image.alt =
        "Game result";


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


            if (
                !window.multiplayerRoomCode ||
                !window.multiplayerRole
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
        message
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


    console.log(
        "🔁 Rejoining:",
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
        // JOINED ROOM
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
                "🆕 New multiplayer round."
            );


            window.multiplayerRole =
                data.role;


            window.multiplayerRoomCode =
                data.roomCode;


            sessionStorage.removeItem(
                "mpRestartRoom"
            );


            sessionStorage.removeItem(
                "mpRestartRole"
            );


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
                "🔄 Both players ready. Reloading..."
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


            if (
                typeof data.gambles ===
                "number"
            ) {

                mpGambles =
                    data.gambles;

            }


            mpUpdateHUD();

            updateSanityMusic(mpManSanity);


            // ------------------------------------------
            // Normal attack visual
            // ------------------------------------------

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
            // Gamble visual
            // ------------------------------------------

            if (
                data.result ===
                    "gambleHit" ||

                data.result ===
                    "gambleMiss"
            ) {

                mpClearAttackHighlights();

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


                mpClearGambleHighlight();


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


            if (mpGambleBtn) {

                mpGambleBtn.disabled =
                    mpGambles <= 0;

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

            updateSanityMusic(mpManSanity);


            mpManCanAttack =
                false;

            mpMosquitoCanMove =
                false;


            mpClearMovement();

            mpRemoveMovementControls();


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

            mpHideNormalScreens();


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
        // SERVER ERROR
        // ==================================================

        if (
            data.type ===
            "error"
        ) {

            console.error(
                "❌ Multiplayer server:",
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
                        "❌ Server not connected.";

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
// BACK FROM VS PLAYER
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


        console.warn(
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
