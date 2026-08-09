// ============================================================
// MAN VS MOSQUITO - MULTIPLAYER
// ============================================================

const MP_WS_URL = "wss://man-vs-mosquito.onrender.com";

const MP_ROWS = 6;
const MP_COLS = 6;

// ============================================================
// SOCKET
// ============================================================

const mpSocket = new WebSocket(MP_WS_URL);

// ============================================================
// PLAYER / ROOM
// ============================================================

window.multiplayerRole = null;
window.multiplayerRoomCode = null;
window.multiplayerConnected = false;

// ============================================================
// GAME STATE
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

let mpSelectedMosquitoCell = null;

let mpGambleMode = false;
let mpRestartRequested = false;

let mpLastAttackCell = null;

// ============================================================
// DOM HELPER
// ============================================================

function mpGet(...ids) {
    for (const id of ids) {
        const el = document.getElementById(id);
        if (el) return el;
    }
    return null;
}

// ============================================================
// LOBBY ELEMENTS
// ============================================================

const mpCreateGameBtn = mpGet("createGameBtn");
const mpJoinGameBtn = mpGet("joinGameBtn");

const mpCreateGamePanel = mpGet("createGamePanel");
const mpJoinGamePanel = mpGet("joinGamePanel");

const mpRoomCode = mpGet("roomCode");
const mpRoomCodeInput = mpGet("roomCodeInput");

const mpJoinRoomBtn = mpGet("joinRoomBtn");

const mpLobbyStatus = mpGet("lobbyStatus");
const mpJoinStatus = mpGet("joinStatus");

const mpPlayerBackBtn = mpGet("playerBackBtn");

// ============================================================
// MULTIPLAYER SCREENS
// ============================================================

const mpManScreen = mpGet(
    "multiplayerManScreen",
    "mpManScreen"
);

const mpMosquitoScreen = mpGet(
    "multiplayerMosquitoScreen",
    "mpMosquitoScreen"
);

const mpLobbyScreen = mpGet(
    "playerModeMenu",
    "vsPlayerScreen"
);

// ============================================================
// BOARDS
// ============================================================

const mpManBoard = mpGet(
    "multiplayerManBoard",
    "mpManBoard"
);

const mpMosquitoBoard = mpGet(
    "multiplayerMosquitoBoard",
    "mpMosquitoBoard"
);

// ============================================================
// MAN HUD
// IMPORTANT: DOM VARIABLES HAVE "El" SUFFIX
// SO THEY NEVER COLLIDE WITH GAME STATE VARIABLES.
// ============================================================

const mpManSanityEl = mpGet(
    "multiplayerManSanity",
    "mpManSanity"
);

const mpManGambleEl = mpGet(
    "multiplayerManGamble",
    "mpManGamble"
);

const mpManTurnEl = mpGet(
    "multiplayerManTurn",
    "mpManTurn"
);

const mpGambleBtn = mpGet(
    "multiplayerGambleBtn",
    "mpGambleBtn"
);

const mpManStatus = mpGet(
    "multiplayerStatus",
    "mpManStatus"
);

// ============================================================
// MOSQUITO HUD
// ============================================================

const mpMosquitoSanityEl = mpGet(
    "multiplayerMosquitoManSanity",
    "mpMosquitoManSanity"
);

const mpMosquitoTurnEl = mpGet(
    "multiplayerMosquitoTurn",
    "mpMosquitoTurn"
);

const mpMosquitoStatus = mpGet(
    "multiplayerMosquitoStatus",
    "mpMosquitoStatus"
);

const mpMosquitoMovementStatus = mpGet(
    "multiplayerMosquitoMovementStatus"
);

// ============================================================
// MOSQUITO HIDE BUTTON
// ============================================================

const mpHideBtn = mpGet(
    "confirmMultiplayerMosquitoBtn",
    "multiplayerHideBtn",
    "confirmMosquitoBtn"
);

// ============================================================
// MOVEMENT BUTTONS
// ============================================================

let mpMovementControls = null;
let mpStayBtn = null;
let mpMoveBtn = null;

// ============================================================
// POSITION
// ============================================================

function mpPosition(row, col) {
    return String.fromCharCode(65 + row) + (col + 1);
}

function mpValid(row, col) {
    return (
        row >= 0 &&
        row < MP_ROWS &&
        col >= 0 &&
        col < MP_COLS
    );
}

function mpAdjacent(r1, c1, r2, c2) {
    return (
        Math.abs(r1 - r2) +
        Math.abs(c1 - c2) === 1
    );
}

// ============================================================
// SEND TO SERVER
// ============================================================

function mpSend(data) {
    if (mpSocket.readyState !== WebSocket.OPEN) {
        console.error("❌ Multiplayer socket is not open.");
        return false;
    }

    console.log("📤 Multiplayer:", data);
    mpSocket.send(JSON.stringify(data));
    return true;
}

// ============================================================
// HIDE ALL MULTIPLAYER SCREENS
// ============================================================

function mpHideScreens() {
    [
        mpManScreen,
        mpMosquitoScreen,
        mpLobbyScreen
    ].forEach(screen => {
        if (screen) {
            screen.classList.add("hidden");
        }
    });
}

// ============================================================
// HIDE NORMAL GAME SCREENS
// ============================================================

function mpHideNormalScreens() {
    [
        document.getElementById("gameScreen"),
        document.getElementById("mosquitoGameScreen")
    ].forEach(screen => {
        if (screen) {
            screen.classList.add("hidden");
        }
    });
}

// ============================================================
// CLEAR ATTACK VISUALS
// ============================================================

function mpClearAttackVisuals() {
    [
        mpManBoard,
        mpMosquitoBoard
    ].forEach(board => {
        if (!board) return;

        board.querySelectorAll(".multiplayerCell").forEach(cell => {
            cell.classList.remove("mpAttackRed");
            cell.classList.remove("mpAttackOrange");
            cell.classList.remove("mpAttackBlue");

            cell.style.background = "";
            cell.style.outline = "";
        });
    });

    mpLastAttackCell = null;
}

// ============================================================
// SHOW ONLY CURRENT ATTACK
// ============================================================

function mpShowAttack(row, col, result) {

    // Previous attack disappears.
    mpClearAttackVisuals();

    const boards = [
        mpManBoard,
        mpMosquitoBoard
    ];

    boards.forEach(board => {

        if (!board) return;

        const cell = board.querySelector(
            `[data-row="${row}"][data-col="${col}"]`
        );

        if (!cell) return;

        if (result === "bite") {
            cell.classList.add("mpAttackOrange");
            cell.style.background = "orange";
            cell.style.outline = "3px solid orange";
        } else {
            cell.classList.add("mpAttackRed");
            cell.style.background = "red";
            cell.style.outline = "3px solid red";
        }
    });
}

// ============================================================
// CLEAR MOSQUITO MOVEMENT
// ============================================================

function mpClearMovement() {

    [
        mpManBoard,
        mpMosquitoBoard
    ].forEach(board => {

        if (!board) return;

        board.querySelectorAll(
            ".mpMosquitoMoveAllowed"
        ).forEach(cell => {

            cell.classList.remove(
                "mpMosquitoMoveAllowed"
            );

            cell.style.background = "";
            cell.style.outline = "";
        });
    });
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
// RESET LOCAL ROUND
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

    mpSelectedMosquitoCell = null;

    mpGambleMode = false;
    mpRestartRequested = false;

    mpLastAttackCell = null;

    mpClearAttackVisuals();
    mpClearMovement();
    mpRemoveMovementControls();

    mpUpdateHUD();
}

// ============================================================
// UPDATE HUD
// ============================================================

function mpUpdateHUD() {

    if (mpManSanityEl) {
        mpManSanityEl.textContent =
            `${mpManSanity}%`;
    }

    if (mpManGambleEl) {
        mpManGambleEl.textContent =
            mpGambles;
    }

    if (mpManTurnEl) {
        mpManTurnEl.textContent =
            mpManTurn;
    }

    if (mpMosquitoSanityEl) {
        mpMosquitoSanityEl.textContent =
            `${mpManSanity}%`;
    }

    if (mpMosquitoTurnEl) {
        mpMosquitoTurnEl.textContent =
            mpManTurn;
    }
}

// ============================================================
// BOARD SETUP
// ============================================================

function mpStyleBoard(board) {

    if (!board) return;

    board.style.display = "grid";
    board.style.gridTemplateColumns =
        "repeat(6, 70px)";
    board.style.gridTemplateRows =
        "repeat(6, 70px)";
    board.style.gridAutoFlow = "row";
    board.style.gap = "5px";

    board.style.width = "445px";
    board.style.height = "445px";

    board.style.margin =
        "20px auto";
}

// ============================================================
// CREATE CELL
// ============================================================

function mpCreateCell(row, col) {

    const cell =
        document.createElement("button");

    cell.className =
        "multiplayerCell";

    cell.dataset.row = row;
    cell.dataset.col = col;
    cell.dataset.position =
        mpPosition(row, col);

    cell.textContent =
        mpPosition(row, col);

    cell.style.width = "70px";
    cell.style.height = "70px";
    cell.style.boxSizing = "border-box";

    cell.style.display = "flex";
    cell.style.alignItems = "center";
    cell.style.justifyContent = "center";

    cell.style.position = "relative";

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
    mpStyleBoard(mpManBoard);

    /*
        IMPORTANT:
        row-major ordering:

        A1 A2 A3 A4 A5 A6
        B1 B2 B3 B4 B5 B6
        C1 C2 C3 C4 C5 C6
        D1 D2 D3 D4 D5 D6
        E1 E2 E3 E4 E5 E6
        F1 F2 F3 F4 F5 F6
    */

    for (let row = 0; row < 6; row++) {

        for (let col = 0; col < 6; col++) {

            const cell =
                mpCreateCell(row, col);

            cell.addEventListener(
                "click",
                () => mpManAttack(cell)
            );

            mpManBoard.appendChild(cell);
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

    mpMosquitoBoard.innerHTML = "";
    mpStyleBoard(mpMosquitoBoard);

    for (let row = 0; row < 6; row++) {

        for (let col = 0; col < 6; col++) {

            const cell =
                mpCreateCell(row, col);

            cell.addEventListener(
                "click",
                () => mpMosquitoCellClicked(cell)
            );

            mpMosquitoBoard.appendChild(cell);
        }
    }
}

// ============================================================
// GET CELL
// ============================================================

function mpCell(board, row, col) {

    if (!board) return null;

    return board.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
    );
}

// ============================================================
// DRAW MOSQUITO
// ============================================================

function mpDrawMosquito() {

    if (!mpMosquitoBoard) return;

    mpMosquitoBoard
        .querySelectorAll(".mpMosquitoImage")
        .forEach(img => img.remove());

    for (const cell of
        mpMosquitoBoard.querySelectorAll(
            ".multiplayerCell"
        )) {

        if (
            Number(cell.dataset.row) ===
                mpMosquitoRow &&
            Number(cell.dataset.col) ===
                mpMosquitoCol
        ) {

            cell.textContent = "";

            const img =
                document.createElement("img");

            img.className =
                "mpMosquitoImage";

            img.src =
                "images/mosquitochan.png";

            img.alt =
                "Mosquito-chan";

            img.style.width = "52px";
            img.style.height = "52px";
            img.style.objectFit = "contain";
            img.style.pointerEvents = "none";

            cell.appendChild(img);

        } else {

            /*
                Restore the coordinate text.
                This prevents A1/B1/etc disappearing
                after every mosquito movement.
            */

            if (
                !cell.querySelector(
                    ".mpMosquitoImage"
                )
            ) {

                cell.textContent =
                    cell.dataset.position;
            }
        }
    }
}

// ============================================================
// MOSQUITO CELL CLICK
// ============================================================

function mpMosquitoCellClicked(cell) {

    if (!mpMosquitoCanMove) {

        if (!mpMosquitoReady) {

            mpSelectedMosquitoCell =
                cell;

            mpMosquitoBoard
                .querySelectorAll(
                    ".selected"
                )
                .forEach(c =>
                    c.classList.remove(
                        "selected"
                    )
                );

            cell.classList.add(
                "selected"
            );

            if (mpHideBtn) {
                mpHideBtn.disabled =
                    false;
            }

            if (mpMosquitoStatus) {
                mpMosquitoStatus.textContent =
                    "Selected: " +
                    cell.dataset.position;
            }
        }

        return;
    }

    if (
        !cell.classList.contains(
            "mpMosquitoMoveAllowed"
        )
    ) {
        return;
    }

    mpSelectedMosquitoCell = cell;

    if (mpMoveBtn) {
        mpMoveBtn.disabled = false;
    }
}

// ============================================================
// HIDE MOSQUITO
// ============================================================

if (mpHideBtn) {

    mpHideBtn.addEventListener(
        "click",
        function() {

            if (mpMosquitoReady) {
                return;
            }

            if (!mpSelectedMosquitoCell) {

                if (mpMosquitoStatus) {
                    mpMosquitoStatus.textContent =
                        "Choose a hiding square first.";
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

            if (!mpSend({
                type: "mosquitoPosition",
                roomCode:
                    window.multiplayerRoomCode,
                row: row,
                col: col
            })) {
                return;
            }

            mpMosquitoRow = row;
            mpMosquitoCol = col;

            mpMosquitoReady = true;

            mpHideBtn.disabled = true;

            mpMosquitoBoard.style.pointerEvents =
                "none";

            mpMosquitoBoard.style.opacity =
                "0.55";

            mpDrawMosquito();

            if (mpMosquitoStatus) {
                mpMosquitoStatus.textContent =
                    "🦟 Hidden! Waiting for the Man.";
            }
        }
    );
}

// ============================================================
// MAN ATTACK
// ============================================================

function mpManAttack(cell) {

    if (!mpManCanAttack) return;
    if (mpWaitingForResult) return;

    const row =
        Number(cell.dataset.row);

    const col =
        Number(cell.dataset.col);

    // ------------------------------------------
    // GAMBLE
    // ------------------------------------------

    if (mpGambleMode) {

        mpPerformGamble(row, col);
        return;
    }

    mpWaitingForResult = true;
    mpManCanAttack = false;

    if (mpManBoard) {
        mpManBoard.style.pointerEvents =
            "none";
    }

    if (mpManStatus) {
        mpManStatus.textContent =
            `⚔️ Attacking ${cell.dataset.position}...`;
    }

    mpSend({
        type: "manAttack",
        roomCode:
            window.multiplayerRoomCode,
        row: row,
        col: col
    });
}

// ============================================================
// GAMBLE BUTTON
// ============================================================

if (mpGambleBtn) {

    mpGambleBtn.addEventListener(
        "click",
        function() {

            if (!mpManCanAttack) {
                return;
            }

            if (mpGambles <= 0) {

                if (mpManStatus) {
                    mpManStatus.textContent =
                        "No Mad Man's Gambles remaining.";
                }

                return;
            }

            mpGambleMode = true;

            if (mpManStatus) {
                mpManStatus.textContent =
                    "🎲 GAMBLE: choose the top-left square of a 2×2 area (A1–E5).";
            }
        }
    );
}

// ============================================================
// GAMBLE
// ============================================================

function mpPerformGamble(row, col) {

    if (row > 4 || col > 4) {

        if (mpManStatus) {
            mpManStatus.textContent =
                "The 2×2 gamble must fit inside the board. Choose A1–E5.";
        }

        return;
    }

    mpGambleMode = false;
    mpWaitingForResult = true;
    mpManCanAttack = false;

    if (mpManBoard) {
        mpManBoard.style.pointerEvents =
            "none";
    }

    // Highlight the four gamble squares blue.

    mpClearAttackVisuals();

    const cells = [
        [row, col],
        [row, col + 1],
        [row + 1, col],
        [row + 1, col + 1]
    ];

    cells.forEach(([r, c]) => {

        const cell =
            mpCell(mpManBoard, r, c);

        if (!cell) return;

        cell.classList.add(
            "mpAttackBlue"
        );

        cell.style.background =
            "dodgerblue";

        cell.style.outline =
            "3px solid dodgerblue";
    });

    mpSend({
        type: "manGamble",
        roomCode:
            window.multiplayerRoomCode,
        row: row,
        col: col
    });
}

// ============================================================
// ACTIVATE MAN
// ============================================================

function mpActivateMan() {

    mpManCanAttack = true;
    mpWaitingForResult = false;

    if (mpManBoard) {

        mpManBoard.style.pointerEvents =
            "auto";

        mpManBoard.style.opacity =
            "1";
    }

    if (mpManStatus) {
        mpManStatus.textContent =
            "🦟 The hunt has started. Attack!";
    }
}

// ============================================================
// CREATE MOSQUITO MOVEMENT CONTROLS
// ============================================================

function mpCreateMovementControls() {

    mpRemoveMovementControls();

    mpMovementControls =
        document.createElement("div");

    mpMovementControls.className =
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
        document.createElement("button");

    mpStayBtn.textContent =
        "🦟 Stay";

    mpMoveBtn =
        document.createElement("button");

    mpMoveBtn.textContent =
        "🦟 Move Here";

    mpMoveBtn.disabled =
        true;

    mpStayBtn.addEventListener(
        "click",
        mpMosquitoStay
    );

    mpMoveBtn.addEventListener(
        "click",
        mpMosquitoMove
    );

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
// HIGHLIGHT LEGAL MOVEMENT
// ============================================================

function mpHighlightMovement(
    reason,
    currentRow,
    currentCol
) {

    mpClearMovement();

    // ------------------------------------------
    // BITE:
    // MOSQUITO CAN FLY ANYWHERE
    // ------------------------------------------

    if (reason === "bite") {

        for (let row = 0; row < 6; row++) {

            for (let col = 0; col < 6; col++) {

                if (
                    row === currentRow &&
                    col === currentCol
                ) {
                    continue;
                }

                const cell =
                    mpCell(
                        mpMosquitoBoard,
                        row,
                        col
                    );

                if (!cell) continue;

                cell.classList.add(
                    "mpMosquitoMoveAllowed"
                );

                cell.style.background =
                    "rgba(0, 100, 255, 0.45)";

                cell.style.outline =
                    "3px solid #1683ff";
            }
        }

        return;
    }

    // ------------------------------------------
    // MISS:
    // ORTHOGONAL ONLY
    // ------------------------------------------

    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    directions.forEach(
        ([dr, dc]) => {

            const row =
                currentRow + dr;

            const col =
                currentCol + dc;

            if (!mpValid(row, col)) {
                return;
            }

            const cell =
                mpCell(
                    mpMosquitoBoard,
                    row,
                    col
                );

            if (!cell) return;

            cell.classList.add(
                "mpMosquitoMoveAllowed"
            );

            cell.style.background =
                "rgba(0, 100, 255, 0.45)";

            cell.style.outline =
                "3px solid #1683ff";
        }
    );
}

// ============================================================
// ENABLE MOSQUITO MOVEMENT
// ============================================================

function mpEnableMosquitoMovement(data) {

    mpMosquitoCanMove = true;

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

    mpSelectedMosquitoCell = null;

    mpCreateMovementControls();

    mpMosquitoBoard.style.pointerEvents =
        "auto";

    mpMosquitoBoard.style.opacity =
        "1";

    mpDrawMosquito();

    mpHighlightMovement(
        data.reason,
        mpMosquitoRow,
        mpMosquitoCol
    );

    if (mpMosquitoMovementStatus) {

        if (data.reason === "bite") {

            mpMosquitoMovementStatus.textContent =
                "🩸 BITE! You may stay or fly anywhere.";

        } else {

            mpMosquitoMovementStatus.textContent =
                "❌ MISS! You may stay or move one square orthogonally.";
        }
    }
}

// ============================================================
// LOCK MOSQUITO
// ============================================================

function mpLockMosquito() {

    mpMosquitoCanMove = false;
    mpMosquitoMoveReason = null;
    mpSelectedMosquitoCell = null;

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
        type: "mosquitoMove",
        roomCode:
            window.multiplayerRoomCode,
        action: "stay"
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

        if (mpMosquitoMovementStatus) {
            mpMosquitoMovementStatus.textContent =
                "Choose a blue square first.";
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

    mpSend({
        type: "mosquitoMove",
        roomCode:
            window.multiplayerRoomCode,
        action: "move",
        row: row,
        col: col
    });
}

// ============================================================
// OPEN MAN SCREEN
// ============================================================

function mpOpenMan() {

    mpHideNormalScreens();
    mpHideScreens();

    mpRemoveVictory();

    if (!mpManScreen) {
        console.error(
            "❌ Multiplayer Man screen not found."
        );
        return;
    }

    mpManScreen.classList.remove(
        "hidden"
    );

    mpCreateManBoard();

    mpUpdateHUD();

    mpManCanAttack = false;
    mpWaitingForResult = false;

    if (mpManStatus) {
        mpManStatus.textContent =
            "Waiting for Mosquito...";
    }
}

// ============================================================
// OPEN MOSQUITO SCREEN
// ============================================================

function mpOpenMosquito() {

    mpHideNormalScreens();
    mpHideScreens();

    mpRemoveVictory();

    if (!mpMosquitoScreen) {
        console.error(
            "❌ Multiplayer Mosquito screen not found."
        );
        return;
    }

    mpMosquitoScreen.classList.remove(
        "hidden"
    );

    mpCreateMosquitoBoard();

    if (mpHideBtn) {
        mpHideBtn.disabled = true;
    }

    if (mpMosquitoStatus) {
        mpMosquitoStatus.textContent =
            "Choose your hiding place.";
    }

    if (mpMosquitoMovementStatus) {
        mpMosquitoMovementStatus.textContent =
            "";
    }
}

// ============================================================
// VICTORY SCREEN
// ============================================================

function mpRemoveVictory() {

    const old =
        document.getElementById(
            "mpVictoryScreen"
        );

    if (old) {
        old.remove();
    }
}

// ============================================================
// SHOW VICTORY
// ============================================================

function mpShowVictory(winner) {

    mpRemoveVictory();

    mpManCanAttack = false;
    mpMosquitoCanMove = false;

    mpClearMovement();
    mpRemoveMovementControls();

    const screen =
        document.createElement("div");

    screen.id =
        "mpVictoryScreen";

    screen.style.position =
        "fixed";

    screen.style.inset =
        "0";

    screen.style.zIndex =
        "999999";

    screen.style.background =
        "rgba(0,0,0,0.96)";

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
        document.createElement("h1");

    const image =
        document.createElement("img");

    const restart =
        document.createElement("button");

    const leave =
        document.createElement("button");

    if (winner === "man") {

        title.textContent =
            "🎯 THE MAN WINS!";

        image.src =
            "images/manwin.png";

    } else {

        title.textContent =
            "🦟 MOSQUITO-CHAN WINS!";

        image.src =
            "images/mosquitowin.png";
    }

    image.alt =
        "Victory";

    image.style.maxWidth =
        "360px";

    image.style.maxHeight =
        "360px";

    image.style.objectFit =
        "contain";

    restart.textContent =
        "🔄 Restart";

    leave.textContent =
        "🚪 Leave Room";

    restart.style.margin =
        "10px";

    leave.style.margin =
        "10px";

    restart.addEventListener(
        "click",
        function() {

            if (mpRestartRequested) {
                return;
            }

            mpRestartRequested = true;

            restart.disabled = true;

            restart.textContent =
                "⏳ Waiting for opponent...";

            mpSend({
                type: "restartGame",
                roomCode:
                    window.multiplayerRoomCode
            });
        }
    );

    leave.addEventListener(
        "click",
        function() {

            mpSend({
                type: "leaveRoom",
                roomCode:
                    window.multiplayerRoomCode
            });
        }
    );

    screen.appendChild(title);
    screen.appendChild(image);
    screen.appendChild(restart);
    screen.appendChild(leave);

    document.body.appendChild(screen);
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
        return;
    }

    sessionStorage.removeItem(
        "mpRestartRoom"
    );

    sessionStorage.removeItem(
        "mpRestartRole"
    );

    window.multiplayerRoomCode =
        room;

    window.multiplayerRole =
        role;

    console.log(
        "🔁 Rejoining after restart:",
        room,
        role
    );

    mpSend({
        type: "rejoinRoom",
        roomCode: room,
        role: role
    });
}

// ============================================================
// SOCKET OPEN
// ============================================================

mpSocket.addEventListener(
    "open",
    function() {

        window.multiplayerConnected =
            true;

        console.log(
            "🌐 Connected to multiplayer server!"
        );

        mpCheckRejoin();
    }
);

// ============================================================
// SOCKET MESSAGE
// ============================================================

mpSocket.addEventListener(
    "message",
    function(event) {

        let data;

        try {
            data =
                JSON.parse(
                    event.data
                );
        } catch (error) {

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

        // =====================================================
        // ROOM CREATED
        // =====================================================

        if (data.type === "roomCreated") {

            window.multiplayerRole =
                "man";

            window.multiplayerRoomCode =
                data.roomCode;

            if (mpRoomCode) {
                mpRoomCode.textContent =
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
                mpLobbyStatus.textContent =
                    "Waiting for opponent...";
            }

            return;
        }

        // =====================================================
        // JOINED
        // =====================================================

        if (data.type === "joinedRoom") {

            window.multiplayerRole =
                "mosquito";

            window.multiplayerRoomCode =
                data.roomCode;

            if (mpJoinStatus) {
                mpJoinStatus.textContent =
                    "✅ Joined game!";
            }

            return;
        }

        // =====================================================
        // PLAYER JOINED
        // =====================================================

        if (data.type === "playerJoined") {

            if (mpLobbyStatus) {
                mpLobbyStatus.textContent =
                    "✅ Opponent connected!";
            }

            return;
        }

        // =====================================================
        // GAME START
        // =====================================================

        if (data.type === "gameStart") {

            window.multiplayerRole =
                data.role;

            window.multiplayerRoomCode =
                data.roomCode;

            mpResetLocalRound();

            if (data.role === "man") {
                mpOpenMan();
            } else {
                mpOpenMosquito();
            }

            return;
        }

        // =====================================================
        // REJOIN ACCEPTED
        // =====================================================

        if (data.type === "rejoinAccepted") {

            window.multiplayerRole =
                data.role;

            window.multiplayerRoomCode =
                data.roomCode;

            console.log(
                "✅ Rejoin accepted."
            );

            return;
        }

        // =====================================================
        // NEW ROUND
        // =====================================================

        if (data.type === "newRound") {

            console.log(
                "🆕 New multiplayer round."
            );

            window.multiplayerRole =
                data.role;

            window.multiplayerRoomCode =
                data.roomCode;

            mpResetLocalRound();

            if (data.role === "man") {
                mpOpenMan();
            } else {
                mpOpenMosquito();
            }

            return;
        }

        // =====================================================
        // RESTART NOW
        // =====================================================

        if (data.type === "restartNow") {

            console.log(
                "🔄 BOTH PLAYERS READY - RELOADING."
            );

            sessionStorage.setItem(
                "mpRestartRoom",
                window.multiplayerRoomCode
            );

            sessionStorage.setItem(
                "mpRestartRole",
                window.multiplayerRole
            );

            /*
                This is the important part.

                We do NOT try to reset the old
                multiplayer JavaScript state.

                We reload the page and rejoin.
            */

            window.location.reload();

            return;
        }

        // =====================================================
        // RESTART WAITING
        // =====================================================

        if (data.type === "restartWaiting") {

            mpRestartRequested = true;

            return;
        }

        // =====================================================
        // MOSQUITO READY
        // =====================================================

        if (data.type === "mosquitoReady") {

            mpManSanity =
                Number(
                    data.sanity ?? 100
                );

            mpManTurn =
                Number(
                    data.turn ?? 0
                ) + 1;

            mpMissStreak = 0;

            mpUpdateHUD();

            mpActivateMan();

            return;
        }

        // =====================================================
        // MOSQUITO HIDDEN
        // =====================================================

        if (data.type === "mosquitoHidden") {

            if (mpMosquitoStatus) {
                mpMosquitoStatus.textContent =
                    "🦟 Hidden! The hunt has started.";
            }

            return;
        }

        // =====================================================
        // ATTACK RESULT
        // =====================================================

        if (data.type === "attackResult") {

            mpWaitingForResult = false;

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

            // ---------------------------------------------
            // EXACT HIT
            // ---------------------------------------------

            if (data.result === "hit") {

                mpShowVictory("man");

                return;
            }

            // ---------------------------------------------
            // BITE
            // ---------------------------------------------

            if (data.result === "bite") {

                mpManCanAttack = false;

                if (mpManStatus) {
                    mpManStatus.textContent =
                        "🩸 BITE! -10 sanity. Mosquito can fly anywhere.";
                }

                return;
            }

            // ---------------------------------------------
            // NORMAL MISS
            // ---------------------------------------------

            if (data.result === "miss") {

                mpManCanAttack = false;

                if (mpManStatus) {
                    mpManStatus.textContent =
                        "❌ MISS! -1 sanity.";
                }

                return;
            }

            // ---------------------------------------------
            // GAMBLE HIT
            // ---------------------------------------------

            if (data.result === "gambleHit") {

                mpShowVictory("man");

                return;
            }

            // ---------------------------------------------
            // GAMBLE MISS
            // ---------------------------------------------

            if (data.result === "gambleMiss") {

                mpManCanAttack = false;

                if (mpManStatus) {
                    mpManStatus.textContent =
                        "💀 MAD MAN'S GAMBLE FAILED! -20 sanity.";
                }

                return;
            }

            return;
        }

        // =====================================================
        // HINT
        // =====================================================

        if (data.type === "hint") {

            if (mpManStatus) {
                mpManStatus.textContent =
                    data.message;
            }

            mpMissStreak = 0;

            return;
        }

        // =====================================================
        // MOSQUITO TURN
        // =====================================================

        if (data.type === "mosquitoTurn") {

            mpEnableMosquitoMovement(data);

            return;
        }

        // =====================================================
        // MOSQUITO MOVE RESULT
        // =====================================================

        if (
            data.type ===
            "mosquitoMoveResult"
        ) {

            mpMosquitoRow =
                Number(data.row);

            mpMosquitoCol =
                Number(data.col);

            mpLockMosquito();

            mpDrawMosquito();

            if (mpMosquitoStatus) {
                mpMosquitoStatus.textContent =
                    "🦟 Waiting for the Man...";
            }

            return;
        }

        // =====================================================
        // MOSQUITO MOVED
        // =====================================================

        if (data.type === "mosquitoMoved") {

            /*
                IMPORTANT:
                Remove ALL blue movement tiles
                when Mosquito has finished moving.
            */

            mpClearMovement();

            mpRemoveMovementControls();

            mpManCanAttack = true;
            mpWaitingForResult = false;

            if (mpManBoard) {

                mpManBoard.style.pointerEvents =
                    "auto";

                mpManBoard.style.opacity =
                    "1";
            }

            if (mpManStatus) {
                mpManStatus.textContent =
                    "🦟 Mosquito moved. Attack!";
            }

            return;
        }

        // =====================================================
        // GAME OVER
        // =====================================================

        if (data.type === "gameOver") {

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

            mpUpdateHUD();

            mpManCanAttack = false;
            mpMosquitoCanMove = false;

            mpClearMovement();
            mpRemoveMovementControls();

            mpShowVictory(
                data.winner
            );

            return;
        }

        // =====================================================
        // LEFT ROOM
        // =====================================================

        if (data.type === "leftRoom") {

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

        // =====================================================
        // OPPONENT LEFT
        // =====================================================

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

        // =====================================================
        // OPPONENT DISCONNECTED
        // =====================================================

        if (
            data.type ===
            "opponentDisconnected"
        ) {

            console.warn(
                "⚠️ Opponent disconnected."
            );

            if (mpManStatus) {
                mpManStatus.textContent =
                    "⚠️ Opponent disconnected.";
            }

            if (mpMosquitoStatus) {
                mpMosquitoStatus.textContent =
                    "⚠️ Opponent disconnected.";
            }

            return;
        }

        // =====================================================
        // ERROR
        // =====================================================

        if (data.type === "error") {

            console.error(
                "❌ Server error:",
                data.message
            );

            mpWaitingForResult = false;

            if (mpManStatus) {
                mpManStatus.textContent =
                    "❌ " + data.message;
            }

            if (mpMosquitoStatus) {
                mpMosquitoStatus.textContent =
                    "❌ " + data.message;
            }

            if (mpJoinStatus) {
                mpJoinStatus.textContent =
                    "❌ " + data.message;
            }

            return;
        }
    }
);

// ============================================================
// CREATE GAME
// ============================================================

if (mpCreateGameBtn) {

    mpCreateGameBtn.addEventListener(
        "click",
        function() {

            if (
                mpSocket.readyState !==
                WebSocket.OPEN
            ) {

                if (mpLobbyStatus) {
                    mpLobbyStatus.textContent =
                        "❌ Server not connected yet.";
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
                type: "createRoom"
            });
        }
    );
}

// ============================================================
// JOIN GAME BUTTON
// ============================================================

if (mpJoinGameBtn) {

    mpJoinGameBtn.addEventListener(
        "click",
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
                mpRoomCodeInput.value = "";
                mpRoomCodeInput.focus();
            }
        }
    );
}

// ============================================================
// JOIN ROOM
// ============================================================

if (mpJoinRoomBtn) {

    mpJoinRoomBtn.addEventListener(
        "click",
        function() {

            const code =
                mpRoomCodeInput
                    ? mpRoomCodeInput.value
                        .trim()
                        .toUpperCase()
                    : "";

            if (
                !code ||
                code.length !== 6
            ) {

                if (mpJoinStatus) {
                    mpJoinStatus.textContent =
                        "Enter a 6-character game code.";
                }

                return;
            }

            mpSend({
                type: "joinRoom",
                roomCode: code
            });
        }
    );
}

// ============================================================
// ENTER TO JOIN
// ============================================================

if (mpRoomCodeInput) {

    mpRoomCodeInput.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

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

    mpPlayerBackBtn.addEventListener(
        "click",
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
        }
    );
}

// ============================================================
// SOCKET CLOSE
// ============================================================

mpSocket.addEventListener(
    "close",
    function() {

        window.multiplayerConnected =
            false;

        mpManCanAttack = false;
        mpMosquitoCanMove = false;

        console.log(
            "❌ Disconnected from multiplayer server."
        );
    }
);

// ============================================================
// SOCKET ERROR
// ============================================================

mpSocket.addEventListener(
    "error",
    function(error) {

        console.error(
            "❌ Multiplayer WebSocket error:",
            error
        );
    }
);
