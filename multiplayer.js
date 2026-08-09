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
// MULTIPLAYER BUTTONS
// ===================================================

const mpHideBtn =
    document.getElementById(
        "multiplayerHideBtn"
    );


// ===================================================
// MULTIPLAYER STATUS
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

let mpSelectedMosquitoCell = null;

let mpSelectedManCell = null;


// ===================================================
// 5 × 5 SIZE
// ===================================================

const MP_ROWS = 5;
const MP_COLS = 5;


// ===================================================
// HIDE ALL SCREENS
// ===================================================

function hideAllMultiplayerScreens(){

    if(mpManScreen){

        mpManScreen.classList.add(
            "hidden"
        );

    }

    if(mpMosquitoScreen){

        mpMosquitoScreen.classList.add(
            "hidden"
        );

    }

}


// ===================================================
// HIDE COMPUTER SCREENS
// ===================================================

function hideComputerScreens(){

    const gameScreen =
        document.getElementById(
            "gameScreen"
        );

    const mosquitoGameScreen =
        document.getElementById(
            "mosquitoGameScreen"
        );


    if(gameScreen){

        gameScreen.classList.add(
            "hidden"
        );

    }


    if(mosquitoGameScreen){

        mosquitoGameScreen.classList.add(
            "hidden"
        );

    }

}


// ===================================================
// CREATE 5 × 5 MAN BOARD
// ===================================================

function createMultiplayerManBoard(){

    if(!mpManBoard){

        console.error(
            "❌ multiplayerManBoard not found."
        );

        return;

    }


    mpManBoard.innerHTML = "";

    mpSelectedManCell = null;


    for(
        let row = 0;
        row < MP_ROWS;
        row++
    ){

        for(
            let col = 0;
            col < MP_COLS;
            col++
        ){

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
                String.fromCharCode(
                    65 + row
                ) + (col + 1);


            cell.innerText =
                cell.dataset.position;


            cell.addEventListener(
                "click",
                function(){

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


    console.log(
        "🧍 5×5 MULTIPLAYER MAN BOARD CREATED"
    );

}


// ===================================================
// CREATE 5 × 5 MOSQUITO BOARD
// ===================================================

function createMultiplayerMosquitoBoard(){

    if(!mpMosquitoBoard){

        console.error(
            "❌ multiplayerMosquitoBoard not found."
        );

        return;

    }


    mpMosquitoBoard.innerHTML = "";

    mpSelectedMosquitoCell = null;


    if(mpHideBtn){

        mpHideBtn.disabled = true;

    }


    for(
        let row = 0;
        row < MP_ROWS;
        row++
    ){

        for(
            let col = 0;
            col < MP_COLS;
            col++
        ){

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
                String.fromCharCode(
                    65 + row
                ) + (col + 1);


            cell.innerText =
                cell.dataset.position;


            cell.addEventListener(
                "click",
                function(){

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
// MAN CELL SELECT
// ===================================================

function selectManCell(cell){

    if(mpSelectedManCell){

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


    if(mpManStatus){

        mpManStatus.innerText =
            "Selected square: " +
            position;

    }

}


// ===================================================
// MOSQUITO CELL SELECT
// ===================================================

function selectMosquitoCell(cell){

    if(mpSelectedMosquitoCell){

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


    if(mpMosquitoStatus){

        mpMosquitoStatus.innerText =
            "Selected hiding place: " +
            position;

    }


    if(mpMosquitoMovementStatus){

        mpMosquitoMovementStatus.innerText =
            "You selected " +
            position +
            ". Press Hide Here.";

    }


    if(mpHideBtn){

        mpHideBtn.disabled =
            false;

    }

}


// ===================================================
// OPEN MULTIPLAYER MAN SCREEN
// ===================================================

function openMultiplayerMan(){

    console.log(
        "================================="
    );

    console.log(
        "🧍 OPENING MULTIPLAYER MAN"
    );


    hideComputerScreens();

    hideAllMultiplayerScreens();


    if(!mpManScreen){

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


    // RESET HUD

    const sanity =
        document.getElementById(
            "mpManSanity"
        );

    const turn =
        document.getElementById(
            "mpManTurn"
        );


    if(sanity){

        sanity.innerText =
            "100%";

    }


    if(turn){

        turn.innerText =
            "1";

    }


    if(mpManStatus){

        mpManStatus.innerText =
            "Waiting for Mosquito...";

    }


    createMultiplayerManBoard();


    console.log(
        "✅ MULTIPLAYER MAN SCREEN OPENED"
    );

    console.log(
        "================================="
    );

}


// ===================================================
// OPEN MULTIPLAYER MOSQUITO SCREEN
// ===================================================

function openMultiplayerMosquito(){

    console.log(
        "================================="
    );

    console.log(
        "🦟 OPENING MULTIPLAYER MOSQUITO"
    );


    hideComputerScreens();

    hideAllMultiplayerScreens();


    if(!mpMosquitoScreen){

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


    // RESET HUD

    const sanity =
        document.getElementById(
            "mpMosquitoSanity"
        );

    const turn =
        document.getElementById(
            "mpMosquitoTurn"
        );


    if(sanity){

        sanity.innerText =
            "100%";

    }


    if(turn){

        turn.innerText =
            "1";

    }


    if(mpMosquitoStatus){

        mpMosquitoStatus.innerText =
            "Choose your hiding place.";

    }


    if(mpMosquitoMovementStatus){

        mpMosquitoMovementStatus.innerText =
            "";

    }


    createMultiplayerMosquitoBoard();


    console.log(
        "✅ MULTIPLAYER MOSQUITO SCREEN OPENED"
    );

    console.log(
        "================================="
    );

}


// ===================================================
// HIDE HERE
// ===================================================

if(mpHideBtn){

    mpHideBtn.onclick =
    function(){

        if(!mpSelectedMosquitoCell){

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
            position,
            "row:",
            row,
            "col:",
            col
        );


        // LOCK SELECTION

        mpHideBtn.disabled =
            true;


        if(mpMosquitoStatus){

            mpMosquitoStatus.innerText =
                "🦟 Hidden at " +
                position +
                "!";

        }


        if(mpMosquitoMovementStatus){

            mpMosquitoMovementStatus.innerText =
                "Waiting for The Man...";

        }


        // ------------------------------------------------
        // SEND POSITION TO SERVER
        // ------------------------------------------------
        // The server must later be updated to handle
        // this message and send it to the Man player.

        if(
            mpSocket.readyState ===
            WebSocket.OPEN
        ){

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
                "📤 Mosquito position sent to server."
            );

        }

    };

}


// ===================================================
// WEBSOCKET OPEN
// ===================================================

mpSocket.onopen =
function(){

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
function(event){

    let data;


    try{

        data =
            JSON.parse(
                event.data
            );

    }

    catch(error){

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

    if(
        data.type ===
        "roomCreated"
    ){

        window.multiplayerRole =
            "man";

        window.multiplayerRoomCode =
            data.roomCode;


        if(mpRoomCode){

            mpRoomCode.innerText =
                data.roomCode;

        }


        if(mpCreateGamePanel){

            mpCreateGamePanel.classList.remove(
                "hidden"
            );

        }


        if(mpJoinGamePanel){

            mpJoinGamePanel.classList.add(
                "hidden"
            );

        }


        if(mpLobbyStatus){

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

    if(
        data.type ===
        "playerJoined"
    ){

        if(mpLobbyStatus){

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

    if(
        data.type ===
        "joinedRoom"
    ){

        window.multiplayerRole =
            "mosquito";

        window.multiplayerRoomCode =
            data.roomCode;


        if(mpJoinStatus){

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

    if(
        data.type ===
        "gameStart"
    ){

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


        if(
            data.role ===
            "man"
        ){

            openMultiplayerMan();

        }


        else if(
            data.role ===
            "mosquito"
        ){

            openMultiplayerMosquito();

        }


        else{

            console.error(
                "❌ Unknown role:",
                data.role
            );

        }

    }


    // =================================================
    // MOSQUITO POSITION RECEIVED
    // =================================================

    if(
        data.type ===
        "mosquitoPosition"
    ){

        console.log(
            "🦟 Mosquito position received:",
            data.position
        );


        if(
            window.multiplayerRole ===
            "man"
        ){

            if(mpManStatus){

                mpManStatus.innerText =
                    "Mosquito has chosen a hiding place.";

            }

        }

    }


    // =================================================
    // OPPONENT DISCONNECTED
    // =================================================

    if(
        data.type ===
        "opponentDisconnected"
    ){

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

    if(
        data.type ===
        "error"
    ){

        console.error(
            "❌ Server error:",
            data.message
        );


        if(mpJoinStatus){

            mpJoinStatus.innerText =
                "❌ " +
                data.message;

        }

    }

};


// ===================================================
// CREATE GAME BUTTON
// ===================================================

if(mpCreateGameBtn){

    mpCreateGameBtn.onclick =
    function(){

        if(
            mpSocket.readyState !==
            WebSocket.OPEN
        ){

            if(mpLobbyStatus){

                mpLobbyStatus.innerText =
                    "❌ Not connected to server.";

            }

            return;

        }


        if(mpCreateGamePanel){

            mpCreateGamePanel.classList.remove(
                "hidden"
            );

        }


        if(mpJoinGamePanel){

            mpJoinGamePanel.classList.add(
                "hidden"
            );

        }


        if(mpLobbyStatus){

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

if(mpJoinGameBtn){

    mpJoinGameBtn.onclick =
    function(){

        if(mpJoinGamePanel){

            mpJoinGamePanel.classList.remove(
                "hidden"
            );

        }


        if(mpCreateGamePanel){

            mpCreateGamePanel.classList.add(
                "hidden"
            );

        }


        if(mpJoinStatus){

            mpJoinStatus.innerText =
                "";

        }


        if(mpRoomCodeInput){

            mpRoomCodeInput.value =
                "";

            mpRoomCodeInput.focus();

        }

    };

}


// ===================================================
// JOIN ROOM
// ===================================================

if(mpJoinRoomBtn){

    mpJoinRoomBtn.onclick =
    function(){

        if(!mpRoomCodeInput){

            return;

        }


        const code =
            mpRoomCodeInput.value
                .trim()
                .toUpperCase();


        if(code.length !== 6){

            if(mpJoinStatus){

                mpJoinStatus.innerText =
                    "Enter a 6-character game code.";

            }

            return;

        }


        if(
            mpSocket.readyState !==
            WebSocket.OPEN
        ){

            if(mpJoinStatus){

                mpJoinStatus.innerText =
                    "❌ Not connected to server.";

            }

            return;

        }


        if(mpJoinStatus){

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

if(mpRoomCodeInput){

    mpRoomCodeInput.addEventListener(
        "keydown",
        function(event){

            if(
                event.key ===
                "Enter"
            ){

                if(mpJoinRoomBtn){

                    mpJoinRoomBtn.click();

                }

            }

        }
    );

}


// ===================================================
// BACK BUTTON
// ===================================================

if(mpPlayerBackBtn){

    mpPlayerBackBtn.onclick =
    function(){

        hideAllMultiplayerScreens();

        hideComputerScreens();


        const mainMenu =
            document.getElementById(
                "mainMenu"
            );


        if(mainMenu){

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
function(){

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
function(error){

    console.error(
        "❌ Multiplayer WebSocket error:",
        error
    );

};
