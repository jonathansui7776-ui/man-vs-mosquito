// ===================================================
// MAN VS MOSQUITO
// MULTIPLAYER.JS
// ===================================================


// ===================================================
// CONNECTION
// ===================================================

const socket =
    new WebSocket(
        "wss://man-vs-mosquito.onrender.com"
    );


// ===================================================
// MULTIPLAYER STATE
// ===================================================

window.multiplayerRole = null;

window.multiplayerRoomCode = null;

window.multiplayerConnected = false;


// ===================================================
// HTML — MULTIPLAYER LOBBY
// ===================================================

const createGameBtn =
    document.getElementById("createGameBtn");

const joinGameBtn =
    document.getElementById("joinGameBtn");

const createGamePanel =
    document.getElementById("createGamePanel");

const joinGamePanel =
    document.getElementById("joinGamePanel");

const roomCode =
    document.getElementById("roomCode");

const roomCodeInput =
    document.getElementById("roomCodeInput");

const joinRoomBtn =
    document.getElementById("joinRoomBtn");

const lobbyStatus =
    document.getElementById("lobbyStatus");

const joinStatus =
    document.getElementById("joinStatus");

const playerBackBtn =
    document.getElementById("playerBackBtn");


// ===================================================
// FIND GAME SCREENS FROM THEIR BOARDS
// ===================================================

function getManGameScreen(){

    const board =
        document.getElementById("gameBoard");


    if(!board){

        console.error(
            "❌ #gameBoard was not found."
        );

        return null;

    }


    const screen =
        board.closest(".screen");


    if(!screen){

        console.error(
            "❌ #gameBoard exists, but it has no .screen parent."
        );

    }


    return screen;

}


function getMosquitoGameScreen(){

    const board =
        document.getElementById(
            "mosquitoBoard"
        );


    if(!board){

        console.error(
            "❌ #mosquitoBoard was not found."
        );

        return null;

    }


    const screen =
        board.closest(".screen");


    if(!screen){

        console.error(
            "❌ #mosquitoBoard exists, but it has no .screen parent."
        );

    }


    return screen;

}


// ===================================================
// HIDE ALL SCREENS
// ===================================================

function hideAllScreens(){

    const screens =
        document.querySelectorAll(
            ".screen"
        );


    screens.forEach(
        function(screen){

            screen.classList.add(
                "hidden"
            );

        }
    );

}


// ===================================================
// OPEN MAN MULTIPLAYER GAME
// ===================================================

function openMultiplayerManGame(){

    console.log(
        "🧍 Opening multiplayer MAN game..."
    );


    const manScreen =
        getManGameScreen();


    const mosquitoScreen =
        getMosquitoGameScreen();


    // -----------------------------------------------
    // CHECK
    // -----------------------------------------------

    if(!manScreen){

        console.error(
            "❌ Cannot open Man game: screen not found."
        );

        return;

    }


    // -----------------------------------------------
    // Hide all screens
    // -----------------------------------------------

    hideAllScreens();


    // -----------------------------------------------
    // Show Man screen
    // -----------------------------------------------

    manScreen.classList.remove(
        "hidden"
    );


    // -----------------------------------------------
    // Make absolutely sure mosquito screen is hidden
    // -----------------------------------------------

    if(mosquitoScreen){

        mosquitoScreen.classList.add(
            "hidden"
        );

    }


    // -----------------------------------------------
    // Multiplayer mode
    // -----------------------------------------------

    window.currentGameMode =
        "multiplayer-man";


    // -----------------------------------------------
    // Reset HUD
    // -----------------------------------------------

    const sanity =
        document.getElementById(
            "sanityValue"
        );

    const turn =
        document.getElementById(
            "turnValue"
        );


    if(sanity){

        sanity.innerText =
            "100%";

    }


    if(turn){

        turn.innerText =
            "1";

    }


    console.log(
        "✅ MAN GAME SCREEN OPENED"
    );


    console.log(
        "Screen element:",
        manScreen
    );

}


// ===================================================
// OPEN MOSQUITO MULTIPLAYER GAME
// ===================================================

function openMultiplayerMosquitoGame(){

    console.log(
        "🦟 Opening multiplayer MOSQUITO game..."
    );


    const mosquitoScreen =
        getMosquitoGameScreen();


    const manScreen =
        getManGameScreen();


    // -----------------------------------------------
    // CHECK
    // -----------------------------------------------

    if(!mosquitoScreen){

        console.error(
            "❌ Cannot open Mosquito game: screen not found."
        );

        return;

    }


    // -----------------------------------------------
    // Hide all screens
    // -----------------------------------------------

    hideAllScreens();


    // -----------------------------------------------
    // Set multiplayer mode BEFORE starting
    // -----------------------------------------------

    window.currentGameMode =
        "multiplayer-mosquito";


    // -----------------------------------------------
    // Start mosquito mode
    // -----------------------------------------------

    if(
        typeof startMosquitoMode ===
        "function"
    ){

        console.log(
            "🦟 Starting Mosquito mode..."
        );


        startMosquitoMode();

    }
    else{

        console.warn(
            "⚠️ startMosquitoMode() was not found."
        );

    }


    // -----------------------------------------------
    // IMPORTANT:
    // startMosquitoMode() may change visibility.
    // Show the correct screen AFTER it runs.
    // -----------------------------------------------

    hideAllScreens();


    mosquitoScreen.classList.remove(
        "hidden"
    );


    // -----------------------------------------------
    // Make absolutely sure Man screen is hidden
    // -----------------------------------------------

    if(manScreen){

        manScreen.classList.add(
            "hidden"
        );

    }


    console.log(
        "✅ MOSQUITO GAME SCREEN OPENED"
    );


    console.log(
        "Screen element:",
        mosquitoScreen
    );

}


// ===================================================
// CONNECTION OPEN
// ===================================================

socket.onopen =
function(){

    window.multiplayerConnected =
        true;


    console.log(
        "🌐 Connected to multiplayer server!"
    );

};


// ===================================================
// SERVER MESSAGES
// ===================================================

socket.onmessage =
function(event){

    const data =
        JSON.parse(
            event.data
        );


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


        if(roomCode){

            roomCode.innerText =
                data.roomCode;

        }


        if(createGamePanel){

            createGamePanel.classList.remove(
                "hidden"
            );

        }


        if(joinGamePanel){

            joinGamePanel.classList.add(
                "hidden"
            );

        }


        if(lobbyStatus){

            lobbyStatus.innerText =
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

        if(lobbyStatus){

            lobbyStatus.innerText =
                "✅ Opponent connected!";

        }


        console.log(
            "👥 Opponent joined."
        );

    }


    // =================================================
    // JOIN SUCCESS
    // =================================================

    if(
        data.type ===
        "joinedRoom"
    ){

        window.multiplayerRoomCode =
            data.roomCode;

        window.multiplayerRole =
            "mosquito";


        if(joinStatus){

            joinStatus.innerText =
                "✅ Joined game!";

        }


        console.log(
            "Successfully joined room:",
            data.roomCode
        );


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
        // HIDE LOBBY
        // ---------------------------------------------

        if(createGamePanel){

            createGamePanel.classList.add(
                "hidden"
            );

        }


        if(joinGamePanel){

            joinGamePanel.classList.add(
                "hidden"
            );

        }


        // ---------------------------------------------
        // MAN
        // ---------------------------------------------

        if(
            data.role ===
            "man"
        ){

            openMultiplayerManGame();

        }


        // ---------------------------------------------
        // MOSQUITO
        // ---------------------------------------------

        if(
            data.role ===
            "mosquito"
        ){

            openMultiplayerMosquitoGame();

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

        if(joinStatus){

            joinStatus.innerText =
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

if(createGameBtn){

    createGameBtn.onclick =
    function(){

        if(
            socket.readyState !==
            WebSocket.OPEN
        ){

            if(lobbyStatus){

                lobbyStatus.innerText =
                    "❌ Not connected to server.";

            }

            return;

        }


        if(createGamePanel){

            createGamePanel.classList.remove(
                "hidden"
            );

        }


        if(joinGamePanel){

            joinGamePanel.classList.add(
                "hidden"
            );

        }


        if(lobbyStatus){

            lobbyStatus.innerText =
                "Creating game...";

        }


        socket.send(
            JSON.stringify({

                type:
                    "createRoom"

            })
        );

    };

}


// ===================================================
// SHOW JOIN PANEL
// ===================================================

if(joinGameBtn){

    joinGameBtn.onclick =
    function(){

        if(joinGamePanel){

            joinGamePanel.classList.remove(
                "hidden"
            );

        }


        if(createGamePanel){

            createGamePanel.classList.add(
                "hidden"
            );

        }


        if(joinStatus){

            joinStatus.innerText =
                "";

        }


        if(roomCodeInput){

            roomCodeInput.value =
                "";

            roomCodeInput.focus();

        }

    };

}


// ===================================================
// JOIN GAME
// ===================================================

if(joinRoomBtn){

    joinRoomBtn.onclick =
    function(){

        const code =
            roomCodeInput.value
            .trim()
            .toUpperCase();


        if(code.length !== 6){

            if(joinStatus){

                joinStatus.innerText =
                    "Enter a 6-character game code.";

            }

            return;

        }


        if(
            socket.readyState !==
            WebSocket.OPEN
        ){

            if(joinStatus){

                joinStatus.innerText =
                    "❌ Not connected to server.";

            }

            return;

        }


        if(joinStatus){

            joinStatus.innerText =
                "Joining game...";

        }


        socket.send(
            JSON.stringify({

                type:
                    "joinRoom",

                roomCode:
                    code

            })
        );

    };

}


// ===================================================
// ENTER KEY
// ===================================================

if(roomCodeInput){

    roomCodeInput.addEventListener(
        "keydown",
        function(event){

            if(
                event.key ===
                "Enter"
            ){

                if(joinRoomBtn){

                    joinRoomBtn.click();

                }

            }

        }
    );

}


// ===================================================
// BACK BUTTON
// ===================================================

if(playerBackBtn){

    playerBackBtn.onclick =
    function(){

        if(createGamePanel){

            createGamePanel.classList.add(
                "hidden"
            );

        }


        if(joinGamePanel){

            joinGamePanel.classList.add(
                "hidden"
            );

        }


        const screens =
            document.querySelectorAll(
                ".screen"
            );


        screens.forEach(
            function(screen){

                screen.classList.add(
                    "hidden"
                );

            }
        );


        const mainMenu =
            document.getElementById(
                "mainMenu"
            );


        if(mainMenu){

            mainMenu.classList.remove(
                "hidden"
            );

        }

    };

}


// ===================================================
// DISCONNECTED
// ===================================================

socket.onclose =
function(){

    window.multiplayerConnected =
        false;


    console.log(
        "❌ Disconnected from server."
    );

};


// ===================================================
// CONNECTION ERROR
// ===================================================

socket.onerror =
function(error){

    console.error(
        "❌ WebSocket error:",
        error
    );

};
