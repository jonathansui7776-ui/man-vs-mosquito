// ===================================================
// MAN VS MOSQUITO
// MULTIPLAYER.JS
// ===================================================


// ===================================================
// WEBSOCKET CONNECTION
// ===================================================

const mpSocket = new WebSocket(
    "wss://man-vs-mosquito.onrender.com"
);


// ===================================================
// GLOBAL MULTIPLAYER STATE
// ===================================================

window.multiplayerRole = null;
window.multiplayerRoomCode = null;
window.multiplayerConnected = false;


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
    document.getElementById("multiplayerManScreen");

const mpMosquitoScreen =
    document.getElementById("multiplayerMosquitoScreen");


// ===================================================
// MULTIPLAYER BOARDS
// ===================================================

const mpManBoard =
    document.getElementById("multiplayerManBoard");

const mpMosquitoBoard =
    document.getElementById("multiplayerMosquitoBoard");


// ===================================================
// MULTIPLAYER BUTTONS
// ===================================================

const mpHideBtn =
    document.getElementById("multiplayerHideBtn");


// ===================================================
// MULTIPLAYER STATUS
// ===================================================

const mpManStatus =
    document.getElementById("mpManStatus");

const mpMosquitoStatus =
    document.getElementById("mpMosquitoStatus");

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
// BOARD SIZE
// ===================================================

const MP_ROWS = 5;
const MP_COLS = 5;


// ===================================================
// UTILITY
// ===================================================

function mpPosition(row, col) {

    return (
        String.fromCharCode(65 + row) +
        (col + 1)
    );

}


// ===================================================
// HIDE ALL MULTIPLAYER SCREENS
// ===================================================

function hideAllMultiplayerScreens() {

    if (mpManScreen) {

        mpManScreen.classList.add("hidden");

    }

    if (mpMosquitoScreen) {

        mpMosquitoScreen.classList.add("hidden");

    }

}


// ===================================================
// HIDE COMPUTER SCREENS
// ===================================================

function hideComputerScreens() {

    const gameScreen =
        document.getElementById("gameScreen");

    const mosquitoGameScreen =
        document.getElementById("mosquitoGameScreen");


    if (gameScreen) {

        gameScreen.classList.add("hidden");

    }

    if (mosquitoGameScreen) {

        mosquitoGameScreen.classList.add("hidden");

    }

}


// ===================================================
// FORCE BOARD GRID
// ===================================================

function setupMultiplayerBoardStyle(board) {

    if (!board) {
        return;
    }


    // -------------------------------------------
    // FORCE 5 × 5 CSS GRID
    // -------------------------------------------

    board.style.display = "grid";

    board.style.gridTemplateColumns =
        "repeat(5, 70px)";

    board.style.gridTemplateRows =
        "repeat(5, 70px)";

    board.style.gap = "5px";

    board.style.width = "max-content";

    board.style.height = "max-content";

    board.style.margin =
        "20px auto";


    board.style.boxSizing =
        "border-box";

}


// ===================================================
// STYLE CELL
// ===================================================

function setupMultiplayerCell(cell) {

    cell.style.width = "70px";

    cell.style.height = "70px";

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


    mpManBoard.innerHTML = "";

    mpSelectedManCell = null;


    // -------------------------------------------
    // FORCE GRID
    // -------------------------------------------

    setupMultiplayerBoardStyle(
        mpManBoard
    );


    // -------------------------------------------
    // CREATE 25 CELLS
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
                document.createElement("div");


            cell.className =
                "multiplayerCell";


            cell.dataset.row =
                row;

            cell.dataset.col =
                col;


            cell.dataset.position =
                mpPosition(row, col);


            cell.innerText =
                cell.dataset.position;


            setupMultiplayerCell(
                cell
            );


            cell.addEventListener(
                "click",
                function () {

                    selectManCell(cell);

                }
            );


            mpManBoard.appendChild(
                cell
            );

        }

    }


    console.log(
        "🧍 5×5 MULTIPLAYER MAN BOARD CREATED"
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


    mpMosquitoBoard.innerHTML = "";

    mpSelectedMosquitoCell = null;


    // -------------------------------------------
    // FORCE GRID
    // -------------------------------------------

    setupMultiplayerBoardStyle(
        mpMosquitoBoard
    );


    // -------------------------------------------
    // RESET HIDE BUTTON
    // -------------------------------------------

    if (mpHideBtn) {

        mpHideBtn.disabled = true;

    }


    // -------------------------------------------
    // CREATE 25 CELLS
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
                document.createElement("div");


            cell.className =
                "multiplayerCell";


            cell.dataset.row =
                row;

            cell.dataset.col =
                col;


            cell.dataset.position =
                mpPosition(row, col);


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
        "🦟 5×5 MULTIPLAYER MOSQUITO BOARD CREATED"
    );

}


// ===================================================
// SELECT MAN CELL
// ===================================================

function selectManCell(cell) {

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
            "Selected square: " +
            position;

    }

}


// ===================================================
// SELECT MOSQUITO CELL
// ===================================================

function selectMosquitoCell(cell) {

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


    // -------------------------------------------
    // ENABLE HIDE BUTTON
    // -------------------------------------------

    if (mpHideBtn) {

        mpHideBtn.disabled = false;

    }

}


// ===================================================
// OPEN MULTIPLAYER MAN
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
            "❌ Multiplayer Man screen missing."
        );

        return;

    }


    mpManScreen.classList.remove(
        "hidden"
    );


    window.currentGameMode =
        "multiplayer-man";


    // -------------------------------------------
    // RESET HUD
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


    // -------------------------------------------
    // CREATE BOARD
    // -------------------------------------------

    createMultiplayerManBoard();


    console.log(
        "✅ MULTIPLAYER MAN SCREEN OPENED"
    );

}


// ===================================================
// OPEN MULTIPLAYER MOSQUITO
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
            "❌ Multiplayer Mosquito screen missing."
        );

        return;

    }


    mpMosquitoScreen.classList.remove(
        "hidden"
    );


    window.currentGameMode =
        "multiplayer-mosquito";


    // -------------------------------------------
    // RESET HUD
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


    // -------------------------------------------
    // CREATE BOARD
    // -------------------------------------------

    createMultiplayerMosquitoBoard();


    console.log(
        "✅ MULTIPLAYER MOSQUITO SCREEN OPENED"
    );

}


// ===================================================
// HIDE HERE BUTTON
// ===================================================

if (mpHideBtn) {

    mpHideBtn.onclick =
    function () {

        // ---------------------------------------
        // NO CELL SELECTED
        // ---------------------------------------

        if (!mpSelectedMosquitoCell) {

            console.warn(
                "⚠️ No mosquito square selected."
            );

            return;

        }


        // ---------------------------------------
        // GET POSITION
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
            position,
            "row:",
            row,
            "col:",
            col
        );


        // ---------------------------------------
        // LOCK BUTTON
        // ---------------------------------------

        mpHideBtn.disabled =
            true;


        // ---------------------------------------
        // UPDATE STATUS
        // ---------------------------------------

        if (mpMosquitoStatus) {

            mpMosquitoStatus.innerText =
                "🦟 Hidden at " +
                position +
                "!";

        }


        if (mpMosquitoMovementStatus) {

            mpMosquitoMovementStatus.innerText =
                "Waiting for The Man...";

        }


        // ---------------------------------------
        // SEND TO SERVER
        // ---------------------------------------

        if (
            mpSocket.readyState ===
            WebSocket.OPEN
        ) {

            mpSocket.send(
                JSON.stringify({

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

                })
            );


            console.log(
                "📤 Mosquito position sent:",
                position
            );

        }

        else {

            console.error(
                "❌ WebSocket is not connected."
            );

            mpHideBtn.disabled =
                false;

        }

    };

}


// ===================================================
// WEBSOCKET OPEN
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
// WEBSOCKET MESSAGE
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
            "mosquito";

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


        if (data.role === "man") {

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
    // MOSQUITO POSITION
    // =================================================

    else if (
        data.type ===
        "mosquitoPosition"
    ) {

        console.log(
            "🦟 Mosquito position received:",
            data.position
        );


        if (
            window.multiplayerRole ===
            "man"
        ) {

            if (mpManStatus) {

                mpManStatus.innerText =
                    "🦟 Mosquito has chosen a hiding place.";

            }

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

    }


    // =================================================
    // ERROR
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
// CREATE GAME BUTTON
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


        mpSocket.send(
            JSON.stringify({

                type:
                    "createRoom"

            })
        );


        console.log(
            "🎮 Create room request sent."
        );

    };

}


// ===================================================
// JOIN GAME BUTTON
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
// JOIN ROOM BUTTON
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


        mpSocket.send(
            JSON.stringify({

                type:
                    "joinRoom",

                roomCode:
                    code

            })
        );


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
// BACK BUTTON
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
