// ===================================================
// MAN VS MOSQUITO
// MULTIPLAYER.JS
// ===================================================


// ===================================================
// WEBSOCKET
// ===================================================

const mpSocket = new WebSocket(
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
// BOARD
// ===================================================

const MP_ROWS = 6;
const MP_COLS = 6;


// ===================================================
// LOBBY ELEMENTS
// ===================================================

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


// ===================================================
// MULTIPLAYER SCREENS
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
// MULTIPLAYER BOARDS
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
// MULTIPLAYER BUTTON
// ===================================================

const mpHideBtn =
    document.getElementById(
        "multiplayerHideBtn"
    );


// ===================================================
// STATUS ELEMENTS
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
// SELECTED CELLS
// ===================================================

let mpSelectedManCell = null;
let mpSelectedMosquitoCell = null;


// ===================================================
// POSITION
// A1 - F6
// ===================================================

function mpPosition(row, col) {

    const letter =
        String.fromCharCode(
            65 + row
        );

    return (
        letter +
        (col + 1)
    );

}


// ===================================================
// SEND MESSAGE
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


    mpSocket.send(
        JSON.stringify(data)
    );

    return true;

}


// ===================================================
// HIDE ALL MULTIPLAYER SCREENS
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
// HIDE COMPUTER SCREENS
// ===================================================

function hideComputerScreens() {

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


    board.style.display =
        "grid";


    board.style.gridTemplateColumns =
        "repeat(6, 70px)";


    board.style.gridTemplateRows =
        "repeat(6, 70px)";


    board.style.gap =
        "5px";


    board.style.width =
        "max-content";


    board.style.height =
        "max-content";


    board.style.margin =
        "25px auto";


    board.style.boxSizing =
        "border-box";

}


// ===================================================
// CELL STYLE
// ===================================================

function setupMultiplayerCell(cell) {

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


    cell.style.cursor =
        "pointer";


    cell.style.userSelect =
        "none";


    cell.style.fontWeight =
        "bold";


    cell.style.fontSize =
        "18px";

}


// ===================================================
// CREATE MAN BOARD
// ===================================================

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


    // -------------------------------------------
    // 6 × 6
    // -------------------------------------------

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


            setupMultiplayerCell(
                cell
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


    // -------------------------------------------
    // LOCK UNTIL MOSQUITO HIDES
    // -------------------------------------------

    mpManBoard.style.pointerEvents =
        "none";


    mpManBoard.style.opacity =
        "0.55";


    console.log(
        "🧍 6×6 MULTIPLAYER MAN BOARD CREATED"
    );

}


// ===================================================
// CREATE MOSQUITO BOARD
// ===================================================

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


    if (mpHideBtn) {

        mpHideBtn.disabled =
            true;

    }


    // -------------------------------------------
    // 6 × 6
    // -------------------------------------------

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


            setupMultiplayerCell(
                cell
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


// ===================================================
// MAN SELECT
// ===================================================

function selectManCell(cell) {

    // -------------------------------------------
    // WAIT FOR MOSQUITO
    // -------------------------------------------

    if (
        !window.multiplayerManReady
    ) {

        console.log(
            "⏳ Waiting for Mosquito to hide."
        );

        if (mpManStatus) {

            mpManStatus.innerText =
                "Waiting for Mosquito...";

        }

        return;

    }


    // -------------------------------------------
    // REMOVE OLD SELECTION
    // -------------------------------------------

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


    const position =
        cell.dataset.position;


    console.log(
        "🧍 MAN SELECTED:",
        position
    );


    if (mpManStatus) {

        mpManStatus.innerText =
            "You selected " +
            position +
            ".";

    }


    // -------------------------------------------
    // IMPORTANT:
    // Don't reveal mosquito position.
    // The actual attack/movement system
    // can be added next.
    // -------------------------------------------

}


// ===================================================
// MOSQUITO SELECT
// ===================================================

function selectMosquitoCell(cell) {

    if (
        window.multiplayerMosquitoReady
    ) {

        return;

    }


    // -------------------------------------------
    // REMOVE OLD SELECTION
    // -------------------------------------------

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


// ===================================================
// ACTIVATE MAN BOARD
// ===================================================

function activateManBoard() {

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
            "🦟 Mosquito is hidden. Find it!";

    }


    console.log(
        "🧍 MAN BOARD ACTIVATED"
    );

}


// ===================================================
// OPEN MAN SCREEN
// ===================================================

function openMultiplayerMan() {

    console.log(
        "================================="
    );

    console.log(
        "🧍 OPENING MULTIPLAYER MAN"
    );


    hideComputerScreens();

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


    // -------------------------------------------
    // HUD
    // -------------------------------------------

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
            "100%";

    }


    if (turn) {

        turn.innerText =
            "1";

    }


    if (mpManStatus) {

        mpManStatus.innerText =
            "Waiting for Mosquito...";

    }


    createMultiplayerManBoard();


    console.log(
        "✅ MULTIPLAYER MAN SCREEN OPENED"
    );

}


// ===================================================
// OPEN MOSQUITO SCREEN
// ===================================================

function openMultiplayerMosquito() {

    console.log(
        "================================="
    );

    console.log(
        "🦟 OPENING MULTIPLAYER MOSQUITO"
    );


    hideComputerScreens();

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


    // -------------------------------------------
    // HUD
    // -------------------------------------------

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
            "100%";

    }


    if (turn) {

        turn.innerText =
            "1";

    }


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


// ===================================================
// HIDE HERE
// ===================================================

if (mpHideBtn) {

    mpHideBtn.onclick =
    function () {

        // ---------------------------------------
        // ALREADY HIDDEN
        // ---------------------------------------

        if (
            window.multiplayerMosquitoReady
        ) {

            return;

        }


        // ---------------------------------------
        // NO CELL
        // ---------------------------------------

        if (!mpSelectedMosquitoCell) {

            console.warn(
                "⚠️ Select a square first."
            );

            if (mpMosquitoStatus) {

                mpMosquitoStatus.innerText =
                    "Select a square first.";

            }

            return;

        }


        // ---------------------------------------
        // POSITION
        // ---------------------------------------

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


        // ---------------------------------------
        // SEND
        // ---------------------------------------

        const sent =
            mpSend({

                type:
                    "mosquitoPosition",

                roomCode:
                    window.multiplayerRoomCode,

                row:
                    row,

                col:
                    col,

                position:
                    position

            });


        if (!sent) {

            if (mpMosquitoStatus) {

                mpMosquitoStatus.innerText =
                    "❌ Connection lost.";

            }

            return;

        }


        // ---------------------------------------
        // LOCK MOSQUITO
        // ---------------------------------------

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


        // ---------------------------------------
        // STATUS
        // ---------------------------------------

        if (mpMosquitoStatus) {

            mpMosquitoStatus.innerText =
                "🦟 Hidden! The hunt has started.";

        }


        if (mpMosquitoMovementStatus) {

            mpMosquitoMovementStatus.innerText =
                "Waiting for The Man...";

        }


        console.log(
            "📤 MOSQUITO POSITION SENT:",
            position
        );

    };

}


// ===================================================
// SOCKET OPEN
// ===================================================

mpSocket.onopen =
function () {

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


    // =================================================
    // ROOM CREATED
    // =================================================

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


        console.log(
            "👥 Opponent joined."
        );

    }


    // =================================================
    // JOINED ROOM
    // =================================================

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


        else {

            console.error(
                "❌ Unknown multiplayer role:",
                data.role
            );

        }

    }


    // =================================================
    // ⭐ MOSQUITO READY
    // =================================================
    //
    // THIS IS THE IMPORTANT FIX.
    //
    // Your server sends:
    //
    // {
    //     type: "mosquitoReady"
    // }
    //
    // The previous multiplayer.js didn't handle it.
    //
    // =================================================

    else if (
        data.type ===
        "mosquitoReady"
    ) {

        console.log(
            "🦟 MOSQUITO READY MESSAGE RECEIVED"
        );


        // ---------------------------------------------
        // ONLY THE MAN SHOULD REACT
        // ---------------------------------------------

        if (
            window.multiplayerRole !==
            "man"
        ) {

            console.log(
                "Ignoring mosquitoReady because player is not MAN."
            );

            return;

        }


        window.multiplayerManReady =
            true;


        window.multiplayerMosquitoReady =
            true;


        // ---------------------------------------------
        // ACTIVATE MAN BOARD
        // ---------------------------------------------

        activateManBoard();


        // ---------------------------------------------
        // OPTIONAL POSITION DISPLAY
        // ---------------------------------------------
        //
        // DO NOT display data.position here.
        //
        // The Man should NOT know where
        // the Mosquito is hiding.
        //
        // ---------------------------------------------

        console.log(
            "🧍 The Man can now begin hunting."
        );

    }


    // =================================================
    // MOSQUITO POSITION
    // =================================================
    //
    // Supports older server behaviour too.
    //
    // =================================================

    else if (
        data.type ===
        "mosquitoPosition"
    ) {

        console.log(
            "🦟 Mosquito position received."
        );


        // ---------------------------------------------
        // MAN
        // ---------------------------------------------

        if (
            window.multiplayerRole ===
            "man"
        ) {

            activateManBoard();

        }

    }


    // =================================================
    // OPPONENT DISCONNECTED
    // =================================================

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

    }


    // =================================================
    // SERVER ERROR
    // =================================================

    else if (
        data.type ===
        "error"
    ) {

        console.error(
            "❌ Server error:",
            data.message
        );


        if (mpJoinStatus) {

            mpJoinStatus.innerText =
                "❌ " +
                data.message;

        }

    }

};


// ===================================================
// CREATE GAME
// ===================================================

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


// ===================================================
// JOIN GAME
// ===================================================

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


// ===================================================
// JOIN ROOM
// ===================================================

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


// ===================================================
// ENTER KEY
// ===================================================

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


// ===================================================
// BACK
// ===================================================

if (mpPlayerBackBtn) {

    mpPlayerBackBtn.onclick =
    function () {

        hideAllMultiplayerScreens();

        hideComputerScreens();


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


        console.log(
            "🏠 Returned to main menu."
        );

    };

}


// ===================================================
// SOCKET CLOSE
// ===================================================

mpSocket.onclose =
function () {

    window.multiplayerConnected =
        false;


    console.log(
        "❌ Disconnected from multiplayer server."
    );

};


// ===================================================
// SOCKET ERROR
// ===================================================

mpSocket.onerror =
function (error) {

    console.error(
        "❌ Multiplayer WebSocket error:",
        error
    );

};
