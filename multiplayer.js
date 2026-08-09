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
// HTML
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
// HELPER — HIDE VS PLAYER LOBBY
// ===================================================

function hideMultiplayerLobby(){

    // VS Player menu

    if(
        typeof playerModeMenu !== "undefined" &&
        playerModeMenu
    ){

        playerModeMenu.classList.add(
            "hidden"
        );

    }


    // Create panel

    if(createGamePanel){

        createGamePanel.classList.add(
            "hidden"
        );

    }


    // Join panel

    if(joinGamePanel){

        joinGamePanel.classList.add(
            "hidden"
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
        JSON.parse(event.data);


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


        // ---------------------------------------------
        // HIDE MULTIPLAYER LOBBY
        // ---------------------------------------------

        hideMultiplayerLobby();


        // =============================================
        // MAN
        // =============================================

        if(data.role === "man"){

            console.log(
                "🧍 Opening multiplayer MAN game..."
            );


            // -----------------------------------------
            // Hide mosquito game
            // -----------------------------------------

            if(
                typeof mosquitoGameScreen !==
                    "undefined" &&
                mosquitoGameScreen
            ){

                mosquitoGameScreen.classList.add(
                    "hidden"
                );

            }


            // -----------------------------------------
            // Show man game
            // -----------------------------------------

            if(
                typeof gameScreen !==
                    "undefined" &&
                gameScreen
            ){

                gameScreen.classList.remove(
                    "hidden"
                );

            }


            // -----------------------------------------
            // Set multiplayer mode
            // -----------------------------------------

            if(
                typeof currentGameMode !==
                    "undefined"
            ){

                currentGameMode =
                    "multiplayer-man";

            }


            // -----------------------------------------
            // Optional HUD reset
            // -----------------------------------------

            if(
                typeof sanityValue !==
                    "undefined" &&
                sanityValue
            ){

                sanityValue.innerText =
                    "100%";

            }


            if(
                typeof turnValue !==
                    "undefined" &&
                turnValue
            ){

                turnValue.innerText =
                    "1";

            }


            console.log(
                "🧍 Multiplayer MAN screen opened."
            );

        }


        // =============================================
        // MOSQUITO
        // =============================================

        if(data.role === "mosquito"){

            console.log(
                "🦟 Opening multiplayer MOSQUITO game..."
            );


            // -----------------------------------------
            // Hide normal man game
            // -----------------------------------------

            if(
                typeof gameScreen !==
                    "undefined" &&
                gameScreen
            ){

                gameScreen.classList.add(
                    "hidden"
                );

            }


            // -----------------------------------------
            // Show mosquito game
            // -----------------------------------------

            if(
                typeof mosquitoGameScreen !==
                    "undefined" &&
                mosquitoGameScreen
            ){

                mosquitoGameScreen.classList.remove(
                    "hidden"
                );

            }


            // -----------------------------------------
            // Set multiplayer mode
            // -----------------------------------------

            if(
                typeof currentGameMode !==
                    "undefined"
            ){

                currentGameMode =
                    "multiplayer-mosquito";

            }


            // -----------------------------------------
            // Start mosquito screen fresh
            // -----------------------------------------

            if(
                typeof startMosquitoMode ===
                    "function"
            ){

                startMosquitoMode();

            }
            else{

                console.warn(
                    "⚠️ startMosquitoMode() not found."
                );

            }


            console.log(
                "🦟 Multiplayer MOSQUITO screen opened."
            );

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

        if(socket.readyState !== WebSocket.OPEN){

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

            joinStatus.innerText =
                "Enter a 6-character game code.";

            return;

        }


        if(socket.readyState !== WebSocket.OPEN){

            joinStatus.innerText =
                "❌ Not connected to server.";

            return;

        }


        joinStatus.innerText =
            "Joining game...";


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


        if(
            typeof mainMenu !== "undefined" &&
            mainMenu
        ){

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
        "WebSocket error:",
        error
    );

};
