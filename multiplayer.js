// ===================================================
// MAN VS MOSQUITO
// MULTIPLAYER.JS
// ===================================================


// ===================================================
// CONNECTION
// ===================================================

const mpSocket = new WebSocket(
    "wss://man-vs-mosquito.onrender.com"
);


// ===================================================
// MULTIPLAYER STATE
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

const mpLobbyScreen =
    document.getElementById("playerModeMenu");

const mpManScreen =
    document.getElementById("multiplayerManScreen");

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
// MULTIPLAYER GAME STATE
// ===================================================

let mpManSelectedCell = null;

let mpMosquitoSelectedCell = null;


// ===================================================
// HIDE EVERYTHING RELATED TO MULTIPLAYER
// ===================================================

function hideMultiplayerScreens(){

    if(mpLobbyScreen){

        mpLobbyScreen.classList.add("hidden");

    }

    if(mpManScreen){

        mpManScreen.classList.add("hidden");

    }

    if(mpMosquitoScreen){

        mpMosquitoScreen.classList.add("hidden");

    }

}


// ===================================================
// CREATE 5 × 5 MAN BOARD
// ===================================================

function createMultiplayerManBoard(){

    if(!mpManBoard){

        console.error(
            "❌ multiplayerManBoard was not found."
        );

        return;

    }


    mpManBoard.innerHTML = "";

    mpManSelectedCell = null;


    for(let row = 0; row < 5; row++){

        for(let col = 0; col < 5; col++){

            const cell =
                document.createElement("div");


            cell.className =
                "multiplayerCell";


            cell.dataset.row =
                row;

            cell.dataset.col =
                col;


            cell.addEventListener(
                "click",
                function(){

                    selectMultiplayerManCell(
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
            "❌ multiplayerMosquitoBoard was not found."
        );

        return;

    }


    mpMosquitoBoard.innerHTML = "";

    mpMosquitoSelectedCell = null;


    for(let row = 0; row < 5; row++){

        for(let col = 0; col < 5; col++){

            const cell =
                document.createElement("div");


            cell.className =
                "multiplayerCell";


            cell.dataset.row =
                row;

            cell.dataset.col =
                col;


            cell.addEventListener(
                "click",
                function(){

                    selectMultiplayerMosquitoCell(
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
// MAN CELL CLICK
// ===================================================

function selectMultiplayerManCell(cell){

    // Remove previous selection

    if(mpManSelectedCell){

        mpManSelectedCell.classList.remove(
            "selected"
        );

    }


    // Select new cell

    mpManSelectedCell =
        cell;


    cell.classList.add(
        "selected"
    );


    console.log(
        "🧍 MAN SELECTED:",
        "row =",
        cell.dataset.row,
        "col =",
        cell.dataset.col
    );

}


// ===================================================
// MOSQUITO CELL CLICK
// ===================================================

function selectMultiplayerMosquitoCell(cell){

    // Remove previous selection

    if(mpMosquitoSelectedCell){

        mpMosquitoSelectedCell.classList.remove(
            "selected"
        );

    }


    // Select new cell

    mpMosquitoSelectedCell =
        cell;


    cell.classList.add(
        "selected"
    );


    console.log(
        "🦟 MOSQUITO SELECTED:",
        "row =",
        cell.dataset.row,
        "col =",
        cell.dataset.col
    );

}


// ===================================================
// SHOW UNIQUE MULTIPLAYER MAN SCREEN
// ===================================================

function showMultiplayerMan(){

    console.log(
        "================================="
    );

    console.log(
        "🧍 OPENING UNIQUE MULTIPLAYER MAN"
    );


    // Hide multiplayer lobby

    if(mpLobbyScreen){

        mpLobbyScreen.classList.add(
            "hidden"
        );

    }


    // Hide mosquito multiplayer screen

    if(mpMosquitoScreen){

        mpMosquitoScreen.classList.add(
            "hidden"
        );

    }


    // IMPORTANT:
    // We deliberately DO NOT TOUCH:
    //
    // gameScreen
    // mosquitoGameScreen
    // gameBoard
    // mosquitoBoard
    //
    // Those belong to VS Computer.


    // Show multiplayer Man

    if(!mpManScreen){

        console.error(
            "❌ multiplayerManScreen NOT FOUND"
        );

        return;

    }


    mpManScreen.classList.remove(
        "hidden"
    );


    window.currentGameMode =
        "multiplayer-man";


    // Reset HUD

    const sanity =
        document.getElementById(
            "mpManSanity"
        );

    const turn =
        document.getElementById(
            "mpManTurn"
        );

    const status =
        document.getElementById(
            "mpManStatus"
        );


    if(sanity){

        sanity.innerText =
            "100%";

    }


    if(turn){

        turn.innerText =
            "1";

    }


    if(status){

        status.innerText =
            "Waiting for Mosquito...";

    }


    // Create board

    createMultiplayerManBoard();


    console.log(
        "✅ UNIQUE MULTIPLAYER MAN SCREEN OPENED"
    );

    console.log(
        "================================="
    );

}


// ===================================================
// SHOW UNIQUE MULTIPLAYER MOSQUITO SCREEN
// ===================================================

function showMultiplayerMosquito(){

    console.log(
        "================================="
    );

    console.log(
        "🦟 OPENING UNIQUE MULTIPLAYER MOSQUITO"
    );


    // Hide multiplayer lobby

    if(mpLobbyScreen){

        mpLobbyScreen.classList.add(
            "hidden"
        );

    }


    // Hide Man multiplayer screen

    if(mpManScreen){

        mpManScreen.classList.add(
            "hidden"
        );

    }


    // IMPORTANT:
    // We deliberately DO NOT TOUCH:
    //
    // gameScreen
    // mosquitoGameScreen
    // gameBoard
    // mosquitoBoard
    //
    // Those belong to VS Computer.


    // Show multiplayer Mosquito

    if(!mpMosquitoScreen){

        console.error(
            "❌ multiplayerMosquitoScreen NOT FOUND"
        );

        return;

    }


    mpMosquitoScreen.classList.remove(
        "hidden"
    );


    window.currentGameMode =
        "multiplayer-mosquito";


    // Reset HUD

    const sanity =
        document.getElementById(
            "mpMosquitoSanity"
        );

    const turn =
        document.getElementById(
            "mpMosquitoTurn"
        );

    const status =
        document.getElementById(
            "mpMosquitoStatus"
        );


    if(sanity){

        sanity.innerText =
            "100%";

    }


    if(turn){

        turn.innerText =
            "1";

    }


    if(status){

        status.innerText =
            "Waiting for The Man...";

    }


    // Create board

    createMultiplayerMosquitoBoard();


    console.log(
        "✅ UNIQUE MULTIPLAYER MOSQUITO SCREEN OPENED"
    );

    console.log(
        "================================="
    );

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
// SERVER MESSAGE
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
            "❌ Could not parse server message:",
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

        window.multiplayerRoomCode =
            data.roomCode;


        window.multiplayerRole =
            "man";


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

        window.multiplayerRoomCode =
            data.roomCode;


        window.multiplayerRole =
            "mosquito";


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


        // ---------------------------------------------
        // MAN
        // ---------------------------------------------

        if(
            data.role ===
            "man"
        ){

            showMultiplayerMan();

        }


        // ---------------------------------------------
        // MOSQUITO
        // ---------------------------------------------

        else if(
            data.role ===
            "mosquito"
        ){

            showMultiplayerMosquito();

        }


        else{

            console.error(
                "❌ Unknown multiplayer role:",
                data.role
            );

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
    // SERVER ERROR
    // =================================================

    if(
        data.type ===
        "error"
    ){

        if(mpJoinStatus){

            mpJoinStatus.innerText =
                "❌ " +
                data.message;

        }


        console.error(
            "❌ Server error:",
            data.message
        );

    }

};


// ===================================================
// CREATE GAME
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

            console.error(
                "❌ WebSocket is not open."
            );

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
// JOIN GAME PANEL
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
            mpRoomCodeInput
                .value
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
            "🔗 Join room request sent:",
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

        hideMultiplayerScreens();


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

    };

}


// ===================================================
// WEBSOCKET CLOSE
// ===================================================

mpSocket.onclose =
function(){

    window.multiplayerConnected =
        false;


    console.log(
        "❌ Disconnected from server."
    );

};


// ===================================================
// WEBSOCKET ERROR
// ===================================================

mpSocket.onerror =
function(error){

    console.error(
        "❌ WebSocket error:",
        error
    );

};
