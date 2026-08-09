// =========================================================
// MAN VS MOSQUITO
// MULTIPLAYER.JS
// =========================================================


// =========================================================
// WEBSOCKET
// =========================================================

const mpSocket = new WebSocket(
    "wss://man-vs-mosquito.onrender.com"
);


// =========================================================
// GLOBAL MULTIPLAYER STATE
// =========================================================

window.multiplayerRole = null;

window.multiplayerRoomCode = null;

window.multiplayerConnected = false;

window.multiplayerMosquitoReady = false;

window.multiplayerManReady = false;


// =========================================================
// GAME STATE
// =========================================================

let mpManCanAttack = false;

let mpWaitingForAttackResult = false;

let mpManSanity = 100;

let mpManTurn = 1;

let mpBiteFreeTurns = 0;


// =========================================================
// BOARD SIZE
// =========================================================

const MP_ROWS = 6;

const MP_COLS = 6;


// =========================================================
// LOBBY ELEMENTS
// =========================================================

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


// =========================================================
// MULTIPLAYER SCREENS
// =========================================================

const mpManScreen =
    document.getElementById(
        "multiplayerManScreen"
    );

const mpMosquitoScreen =
    document.getElementById(
        "multiplayerMosquitoScreen"
    );


// =========================================================
// MULTIPLAYER BOARDS
// =========================================================

const mpManBoard =
    document.getElementById(
        "multiplayerManBoard"
    );

const mpMosquitoBoard =
    document.getElementById(
        "multiplayerMosquitoBoard"
    );


// =========================================================
// MOSQUITO HIDE BUTTON
// =========================================================

const mpHideBtn =
    document.getElementById(
        "multiplayerHideBtn"
    );


// =========================================================
// STATUS ELEMENTS
// =========================================================

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


// =========================================================
// MAN HUD
// =========================================================

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


// =========================================================
// MOSQUITO HUD
// =========================================================

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


// =========================================================
// SELECTED CELLS
// =========================================================

let mpSelectedManCell = null;

let mpSelectedMosquitoCell = null;


// =========================================================
// POSITION
//
// A1 A2 A3 A4 A5 A6
// B1 B2 B3 B4 B5 B6
// C1 C2 C3 C4 C5 C6
// D1 D2 D3 D4 D5 D6
// E1 E2 E3 E4 E5 E6
// F1 F2 F3 F4 F5 F6
// =========================================================

function mpPosition(row, col) {

    return (
        String.fromCharCode(
            65 + row
        ) +
        (col + 1)
    );

}


// =========================================================
// SEND MESSAGE
// =========================================================

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
        "📤 Client:",
        data
    );


    mpSocket.send(
        JSON.stringify(data)
    );


    return true;

}


// =========================================================
// HIDE MULTIPLAYER SCREENS
// =========================================================

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


// =========================================================
// HIDE NORMAL GAME SCREENS
// =========================================================

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


// =========================================================
// BOARD STYLE
// =========================================================

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
        "min-width",
        "445px",
        "important"
    );


    board.style.setProperty(
        "max-width",
        "445px",
        "important"
    );


    board.style.setProperty(
        "min-height",
        "445px",
        "important"
    );


    board.style.setProperty(
        "max-height",
        "445px",
        "important"
    );


    board.style.setProperty(
        "margin",
        "0 auto",
        "important"
    );


    board.style.setProperty(
        "padding",
        "0",
        "important"
    );


    board.style.setProperty(
        "box-sizing",
        "border-box",
        "important"
    );

}


// =========================================================
// CELL STYLE
// =========================================================

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
        "min-width",
        "70px",
        "important"
    );


    cell.style.setProperty(
        "max-width",
        "70px",
        "important"
    );


    cell.style.setProperty(
        "min-height",
        "70px",
        "important"
    );


    cell.style.setProperty(
        "max-height",
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

}


// =========================================================
// LABELS
// =========================================================

function setupMultiplayerLabels(screen) {

    if (!screen) {

        return;

    }


    const columnLabels =
        screen.querySelector(
            ".multiplayerColumnLabels"
        );


    const rowLabels =
        screen.querySelector(
            ".multiplayerRowLabels"
        );


    // ---------------------------------------------
    // COLUMNS
    // ---------------------------------------------

    if (columnLabels) {

        columnLabels.innerHTML =
            "";


        for (
            let col = 1;
            col <= 6;
            col++
        ) {

            const label =
                document.createElement(
                    "span"
                );


            label.innerText =
                col;


            columnLabels.appendChild(
                label
            );

        }

    }


    // ---------------------------------------------
    // ROWS
    // ---------------------------------------------

    if (rowLabels) {

        rowLabels.innerHTML =
            "";


        for (
            let row = 0;
            row < 6;
            row++
        ) {

            const label =
                document.createElement(
                    "span"
                );


            label.innerText =
                String.fromCharCode(
                    65 + row
                );


            rowLabels.appendChild(
                label
            );

        }

    }

}


// =========================================================
// CREATE CELL
// =========================================================

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


// =========================================================
// CREATE MAN BOARD
// =========================================================

function createMultiplayerManBoard() {

    if (!mpManBoard) {

        console.error(
            "❌ multiplayerManBoard not found."
        );

        return;

    }


    mpManBoard.innerHTML =
        "";


    mpSelectedManCell =
        null;


    setupMultiplayerBoardStyle(
        mpManBoard
    );


    setupMultiplayerLabels(
        mpManScreen
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
                function () {

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


    // ---------------------------------------------
    // LOCK BOARD UNTIL MOSQUITO HIDES
    // ---------------------------------------------

    mpManBoard.style.pointerEvents =
        "none";


    mpManBoard.style.opacity =
        "0.55";


    console.log(
        "🧍 6×6 MULTIPLAYER MAN BOARD CREATED"
    );

}


// =========================================================
// CREATE MOSQUITO BOARD
// =========================================================

function createMultiplayerMosquitoBoard() {

    if (!mpMosquitoBoard) {

        console.error(
            "❌ multiplayerMosquitoBoard not found."
        );

        return;

    }


    mpMosquitoBoard.innerHTML =
        "";


    mpSelectedMosquitoCell =
        null;


    setupMultiplayerBoardStyle(
        mpMosquitoBoard
    );


    setupMultiplayerLabels(
        mpMosquitoScreen
    );


    if (mpHideBtn) {

        mpHideBtn.disabled =
            true;

    }


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
                function () {

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


    console.log(
        "🦟 6×6 MULTIPLAYER MOSQUITO BOARD CREATED"
    );

}


// =========================================================
// MAN SELECT + ATTACK
// =========================================================

function selectManCell(cell) {

    // ---------------------------------------------
    // WAITING FOR MOSQUITO
    // ---------------------------------------------

    if (
        !window.multiplayerManReady
    ) {

        if (mpManStatus) {

            mpManStatus.innerText =
                "Waiting for Mosquito...";

        }

        return;

    }


    // ---------------------------------------------
    // WAITING FOR PREVIOUS ATTACK
    // ---------------------------------------------

    if (
        mpWaitingForAttackResult
    ) {

        if (mpManStatus) {

            mpManStatus.innerText =
                "⏳ Waiting for the attack result...";

        }

        return;

    }


    // ---------------------------------------------
    // MUST BE ALLOWED TO ATTACK
    // ---------------------------------------------

    if (!mpManCanAttack) {

        if (mpManStatus) {

            mpManStatus.innerText =
                "Wait for your turn.";

        }

        return;

    }


    // ---------------------------------------------
    // REMOVE OLD SELECTION
    // ---------------------------------------------

    if (mpSelectedManCell) {

        mpSelectedManCell.classList.remove(
            "selected"
        );

    }


    mpSelectedManCell =
        cell;


    cell.classList.add(
        "selected"
    );


    // ---------------------------------------------
    // GET COORDINATES
    // ---------------------------------------------

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


    console.log(
        "🧍 MAN SELECTED:",
        position
    );


    // ---------------------------------------------
    // LOCK ATTACKS
    // ---------------------------------------------

    mpWaitingForAttackResult =
        true;


    mpManCanAttack =
        false;


    mpManBoard.style.pointerEvents =
        "none";


    // ---------------------------------------------
    // STATUS
    // ---------------------------------------------

    if (mpManStatus) {

        mpManStatus.innerText =
            "⚔️ Attacking " +
            position +
            "...";

    }


    // ---------------------------------------------
    // SEND ATTACK TO SERVER
    // ---------------------------------------------

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


    // ---------------------------------------------
    // SEND FAILED
    // ---------------------------------------------

    if (!sent) {

        mpWaitingForAttackResult =
            false;


        mpManCanAttack =
            true;


        mpManBoard.style.pointerEvents =
            "auto";


        if (mpManStatus) {

            mpManStatus.innerText =
                "❌ Connection lost.";

        }


        return;

    }


    console.log(
        "⚔️ MAN ATTACK SENT:",
        position,
        "row:",
        row,
        "col:",
        col
    );

}


// =========================================================
// MOSQUITO SELECT
// =========================================================

function selectMosquitoCell(cell) {

    if (
        window.multiplayerMosquitoReady
    ) {

        return;

    }


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


    const position =
        cell.dataset.position;


    console.log(
        "🦟 MOSQUITO SELECTED:",
        position
    );


    if (mpMosquitoStatus) {

        mpMosquitoStatus.innerText =
            "Selected hiding place: " +
            position;

    }


    if (mpMosquitoMovementStatus) {

        mpMosquitoMovementStatus.innerText =
            "You selected " +
            position +
            ". Press Hide Here.";

    }


    if (mpHideBtn) {

        mpHideBtn.disabled =
            false;

    }

}


// =========================================================
// ACTIVATE MAN BOARD
// =========================================================

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


    console.log(
        "🧍 MAN BOARD ACTIVATED"
    );

}


// =========================================================
// OPEN MAN SCREEN
// =========================================================

function openMultiplayerMan() {

    console.log(
        "================================="
    );


    console.log(
        "🧍 OPENING MULTIPLAYER MAN"
    );


    hideNormalGameScreens();

    hideAllMultiplayerScreens();


    if (!mpManScreen) {

        console.error(
            "❌ multiplayerManScreen not found."
        );

        return;

    }


    mpManScreen.classList.remove(
        "hidden"
    );


    window.currentGameMode =
        "multiplayer-man";


    window.multiplayerManReady =
        false;


    window.multiplayerMosquitoReady =
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


    updateManHUD();


    if (mpManStatus) {

        mpManStatus.innerText =
            "Waiting for Mosquito...";

    }


    createMultiplayerManBoard();


    console.log(
        "✅ MULTIPLAYER MAN SCREEN OPENED"
    );

}


// =========================================================
// OPEN MOSQUITO SCREEN
// =========================================================

function openMultiplayerMosquito() {

    console.log(
        "================================="
    );


    console.log(
        "🦟 OPENING MULTIPLAYER MOSQUITO"
    );


    hideNormalGameScreens();

    hideAllMultiplayerScreens();


    if (!mpMosquitoScreen) {

        console.error(
            "❌ multiplayerMosquitoScreen not found."
        );

        return;

    }


    mpMosquitoScreen.classList.remove(
        "hidden"
    );


    window.currentGameMode =
        "multiplayer-mosquito";


    window.multiplayerMosquitoReady =
        false;


    window.multiplayerManReady =
        false;


    mpManSanity =
        100;


    mpManTurn =
        1;


    mpBiteFreeTurns =
        0;


    updateMosquitoHUD();


    if (mpMosquitoStatus) {

        mpMosquitoStatus.innerText =
            "Choose your hiding place.";

    }


    if (mpMosquitoMovementStatus) {

        mpMosquitoMovementStatus.innerText =
            "";

    }


    createMultiplayerMosquitoBoard();


    console.log(
        "✅ MULTIPLAYER MOSQUITO SCREEN OPENED"
    );

}


// =========================================================
// HIDE HERE BUTTON
// =========================================================

if (mpHideBtn) {

    mpHideBtn.onclick =
    function () {

        if (
            window.multiplayerMosquitoReady
        ) {

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


        const position =
            mpSelectedMosquitoCell.dataset.position;


        console.log(
            "🦟 HIDING AT:",
            position
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

            if (mpMosquitoStatus) {

                mpMosquitoStatus.innerText =
                    "❌ Connection lost.";

            }

            return;

        }


        window.multiplayerMosquitoReady =
            true;


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
                "🦟 Hidden! The hunt has started.";

        }


        if (mpMosquitoMovementStatus) {

            mpMosquitoMovementStatus.innerText =
                "The Man is hunting...";

        }


        console.log(
            "📤 MOSQUITO POSITION SENT:",
            position
        );

    };

}


// =========================================================
// SOCKET OPEN
// =========================================================

mpSocket.onopen =
function () {

    window.multiplayerConnected =
        true;


    console.log(
        "🌐 Connected to multiplayer server!"
    );

};


// =========================================================
// SOCKET MESSAGE
// =========================================================

mpSocket.onmessage =
function (event) {

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


    // =====================================================
    // ROOM CREATED
    // =====================================================

    if (
        data.type ===
        "roomCreated"
    ) {

        window.multiplayerRole =
            data.role || "man";


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

    }


    // =====================================================
    // PLAYER JOINED
    // =====================================================

    else if (
        data.type ===
        "playerJoined"
    ) {

        if (mpLobbyStatus) {

            mpLobbyStatus.innerText =
                "✅ Opponent connected!";

        }


        console.log(
            "👥 Opponent joined."
        );

    }


    // =====================================================
    // JOINED ROOM
    // =====================================================

    else if (
        data.type ===
        "joinedRoom"
    ) {

        window.multiplayerRole =
            data.role || "mosquito";


        window.multiplayerRoomCode =
            data.roomCode;


        if (mpJoinStatus) {

            mpJoinStatus.innerText =
                "✅ Joined game!";

        }


        console.log(
            "🦟 Your multiplayer role: MOSQUITO"
        );

    }


    // =====================================================
    // GAME START
    // =====================================================

    else if (
        data.type ===
        "gameStart"
    ) {

        window.multiplayerRole =
            data.role;


        window.multiplayerRoomCode =
            data.roomCode;


        console.log(
            "================================="
        );


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


        console.log(
            "================================="
        );


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

    }


    // =====================================================
    // MOSQUITO READY
    // =====================================================

    else if (
        data.type ===
        "mosquitoReady"
    ) {

        console.log(
            "🦟 MOSQUITO READY RECEIVED"
        );


        if (
            window.multiplayerRole !==
            "man"
        ) {

            return;

        }


        window.multiplayerManReady =
            true;


        window.multiplayerMosquitoReady =
            true;


        activateManBoard();


        console.log(
            "🧍 THE HUNT HAS STARTED"
        );

    }


    // =====================================================
    // ATTACK RESULT
    // =====================================================

    else if (
        data.type ===
        "attackResult"
    ) {

        console.log(
            "⚔️ ATTACK RESULT:",
            data
        );


        // ---------------------------------------------
        // UNLOCK STATE
        // ---------------------------------------------

        mpWaitingForAttackResult =
            false;


        // ---------------------------------------------
        // UPDATE SERVER STATE
        // ---------------------------------------------

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


        // =================================================
        // HIT
        // =================================================

        if (
            data.result ===
            "hit"
        ) {

            mpManCanAttack =
                false;


            if (mpManBoard) {

                mpManBoard.style.pointerEvents =
                    "none";

            }


            if (mpManStatus) {

                mpManStatus.innerText =
                    "🎯 HIT! You caught the Mosquito!";

            }


            console.log(
                "🎯 MAN WON"
            );


            return;

        }


        // =================================================
        // BITE
        // =================================================

        if (
            data.result ===
            "bite"
        ) {

            mpManCanAttack =
                false;


            if (mpManBoard) {

                mpManBoard.style.pointerEvents =
                    "none";

            }


            if (mpManStatus) {

                mpManStatus.innerText =
                    "🩸 BITE! -10 Sanity. Mosquito's turn.";

            }


            console.log(
                "🩸 MAN WAS BITTEN"
            );


            return;

        }


        // =================================================
        // MISS
        // =================================================

        if (
            data.result ===
            "miss"
        ) {

            mpManCanAttack =
                false;


            if (mpManBoard) {

                mpManBoard.style.pointerEvents =
                    "none";

            }


            if (mpManStatus) {

                mpManStatus.innerText =
                    "❌ MISS! -1 Sanity. Mosquito's turn.";

            }


            console.log(
                "❌ MAN MISSED"
            );


            return;

        }

    }


    // =====================================================
    // MOSQUITO TURN
    // =====================================================

    else if (
        data.type ===
        "mosquitoTurn"
    ) {

        console.log(
            "🦟 MOSQUITO TURN:",
            data
        );


        if (
            window.multiplayerRole !==
            "mosquito"
        ) {

            return;

        }


        if (mpMosquitoStatus) {

            mpMosquitoStatus.innerText =
                "🦟 Your turn.";

        }


        if (mpMosquitoMovementStatus) {

            mpMosquitoMovementStatus.innerText =
                data.message ||
                "Choose what to do.";

        }


        console.log(
            "🦟 Mosquito may now act."
        );

    }


    // =====================================================
    // GAME OVER
    // =====================================================

    else if (
        data.type ===
        "gameOver"
    ) {

        console.log(
            "🏁 GAME OVER:",
            data
        );


        if (
            data.winner ===
            "man"
        ) {

            if (
                window.multiplayerRole ===
                "man"
            ) {

                if (mpManStatus) {

                    mpManStatus.innerText =
                        "🎯 YOU WIN! You caught the Mosquito!";

                }

            }


            else if (
                window.multiplayerRole ===
                "mosquito"
            ) {

                if (mpMosquitoStatus) {

                    mpMosquitoStatus.innerText =
                        "💀 You were caught!";

                }

            }

        }

    }


    // =====================================================
    // OPPONENT DISCONNECTED
    // =====================================================

    else if (
        data.type ===
        "opponentDisconnected"
    ) {

        alert(
            "Your opponent disconnected."
        );


        window.multiplayerRole =
            null;


        window.multiplayerRoomCode =
            null;


        window.multiplayerManReady =
            false;


        window.multiplayerMosquitoReady =
            false;


        mpManCanAttack =
            false;


        mpWaitingForAttackResult =
            false;

    }


    // =====================================================
    // ERROR
    // =====================================================

    else if (
        data.type ===
        "error"
    ) {

        console.error(
            "❌ SERVER ERROR:",
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

    }

};


// =========================================================
// CREATE GAME
// =========================================================

if (mpCreateGameBtn) {

    mpCreateGameBtn.onclick =
    function () {

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


        console.log(
            "🎮 Create room request sent."
        );

    };

}


// =========================================================
// JOIN GAME
// =========================================================

if (mpJoinGameBtn) {

    mpJoinGameBtn.onclick =
    function () {

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


// =========================================================
// JOIN ROOM
// =========================================================

if (mpJoinRoomBtn) {

    mpJoinRoomBtn.onclick =
    function () {

        if (!mpRoomCodeInput) {

            return;

        }


        const code =
            mpRoomCodeInput.value
                .trim()
                .toUpperCase();


        if (code.length !== 6) {

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


        console.log(
            "🔗 Join request sent:",
            code
        );

    };

}


// =========================================================
// ENTER KEY
// =========================================================

if (mpRoomCodeInput) {

    mpRoomCodeInput.addEventListener(
        "keydown",
        function (event) {

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


// =========================================================
// BACK BUTTON
// =========================================================

if (mpPlayerBackBtn) {

    mpPlayerBackBtn.onclick =
    function () {

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


        window.multiplayerRole =
            null;


        window.multiplayerRoomCode =
            null;


        window.multiplayerManReady =
            false;


        window.multiplayerMosquitoReady =
            false;


        mpManCanAttack =
            false;


        mpWaitingForAttackResult =
            false;


        console.log(
            "🏠 Returned to main menu."
        );

    };

}


// =========================================================
// SOCKET CLOSE
// =========================================================

mpSocket.onclose =
function () {

    window.multiplayerConnected =
        false;


    mpManCanAttack =
        false;


    mpWaitingForAttackResult =
        false;


    console.log(
        "❌ Disconnected from multiplayer server."
    );

};


// =========================================================
// SOCKET ERROR
// =========================================================

mpSocket.onerror =
function (error) {

    console.error(
        "❌ Multiplayer WebSocket error:",
        error
    );

};
