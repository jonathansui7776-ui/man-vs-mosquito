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
// GET GAME SCREENS
// ===================================================

function getMainMenu(){

    return document.getElementById(
        "mainMenu"
    );

}


function getPlayerModeMenu(){

    return document.getElementById(
        "playerModeMenu"
    );

}


function getGameScreen(){

    return document.getElementById(
        "gameScreen"
    );

}


function getMosquitoGameScreen(){

    return document.getElementById(
        "mosquitoGameScreen"
    );

}


// ===================================================
// HIDE MULTIPLAYER LOBBY
// ===================================================

function hideMultiplayerLobby(){

    const playerModeMenu =
        getPlayerModeMenu();

    const createPanel =
        document.getElementById(
            "createGamePanel"
        );

    const joinPanel =
        document.getElementById(
            "joinGamePanel"
        );


    if(playerModeMenu){

        playerModeMenu.classList.add(
            "hidden"
        );

    }


    if(createPanel){

        createPanel.classList.add(
            "hidden"
        );

    }


    if(joinPanel){

        joinPanel.classList.add(
            "hidden"
        );

    }

}


// ===================================================
// HIDE ALL GAME SCREENS
// ===================================================

function hideAllGameScreens(){

    const gameScreen =
        getGameScreen();

    const mosquitoGameScreen =
        getMosquitoGameScreen();


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
// OPEN MAN GAME
// ===================================================

function openMultiplayerManGame(){

    console.log(
        "🧍 Opening multiplayer MAN game..."
    );


    // Hide everything first

    hideAllGameScreens();


    const mainMenu =
        getMainMenu();

    const playerModeMenu =
        getPlayerModeMenu();

    const gameScreen =
        getGameScreen();


    // Hide main menu

    if(mainMenu){

        mainMenu.classList.add(
            "hidden"
        );

    }


    // Hide VS Player menu

    if(playerModeMenu){

        playerModeMenu.classList.add(
            "hidden"
        );

    }


    // Show Man game

    if(gameScreen){

        gameScreen.classList.remove(
            "hidden"
        );


        console.log(
            "✅ #gameScreen is now visible."
        );

    }
    else{

        console.error(
            "❌ ERROR: #gameScreen was not found."
        );

    }


    // Multiplayer mode

    window.currentGameMode =
        "multiplayer-man";


    // Reset visible HUD

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
        "🧍 Multiplayer Man screen opened."
    );

}


// ===================================================
// OPEN MOSQUITO GAME
// ===================================================

function openMultiplayerMosquitoGame(){

    console.log(
        "🦟 Opening multiplayer MOSQUITO game..."
    );


    // Hide everything first

    hideAllGameScreens();


    const mainMenu =
        getMainMenu();

    const playerModeMenu =
        getPlayerModeMenu();

    const mosquitoGameScreen =
        getMosquitoGameScreen();


    // Hide main menu

    if(mainMenu){

        mainMenu.classList.add(
            "hidden"
        );

    }


    // Hide VS Player menu

    if(playerModeMenu){

        playerModeMenu.classList.add(
            "hidden"
        );

    }


    // Show Mosquito game

    if(mosquitoGameScreen){

        mosquitoGameScreen.classList.remove(
            "hidden"
        );


        console.log(
            "✅ #mosquitoGameScreen is now visible."
        );

    }
    else{

        console.error(
            "❌ ERROR: #mosquitoGameScreen was not found."
        );

    }


    // Multiplayer mode

    window.currentGameMode =
        "multiplayer-mosquito";


    // Start mosquito mode fresh

    if(
        typeof startMosquitoMode ===
        "function"
    ){

        startMosquitoMode();


        console.log(
            "🦟 Mosquito mode initialized."
        );

    }
    else{

        console.error(
            "❌ ERROR: startMosquitoMode() was not found."
        );

    }

}


// ===================================================
// CONNECTION OPEN
// ===================================================

socket.onopen = function(){

    window.multiplayerConnected =
        true;


    console.log(
        "🌐 Connected to multiplayer server!"
    );

};


// ===================================================
// SERVER MESSAGES
// ===================================================

socket.onmessage = function(event){

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

    if(data.type === "roomCreated"){

        window.multiplayerRoomCode =
            data.roomCode;

        window.multiplayerRole =
            data.role;


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

    if(data.type === "playerJoined"){

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

    if(data.type === "joinedRoom"){

        window.multiplayerRoomCode =
            data.roomCode;

        window.multiplayerRole =
            data.role;


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

    if(data.type === "gameStart"){

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


        // Hide VS Player lobby

        hideMultiplayerLobby();


        // ---------------------------------------------
        // MAN
        // ---------------------------------------------

        if(data.role === "man"){

            openMultiplayerManGame();

        }


        // ---------------------------------------------
        // MOSQUITO
        // ---------------------------------------------

        if(data.role === "mosquito"){

            openMultiplayerMosquitoGame();

        }

    }


    // =================================================
    // OPPONENT DISCONNECTED
    // =================================================

    if(data.type === "opponentDisconnected"){

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

    if(data.type === "error"){

        if(joinStatus){

            joinStatus.innerText =
                "❌ " + data.message;

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
// ENTER KEY FOR JOIN
// ===================================================

if(roomCodeInput){

    roomCodeInput.addEventListener(
        "keydown",
        function(event){

            if(event.key === "Enter"){

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

        hideMultiplayerLobby();


        const mainMenu =
            getMainMenu();


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

socket.onclose = function(){

    window.multiplayerConnected =
        false;


    console.log(
        "❌ Disconnected from server."
    );

};


// ===================================================
// CONNECTION ERROR
// ===================================================

socket.onerror = function(error){

    console.error(
        "❌ WebSocket error:",
        error
    );

};
