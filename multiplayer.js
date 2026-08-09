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


    // =========================================
    // ROOM CREATED
    // =========================================

    if(data.type === "roomCreated"){

        window.multiplayerRoomCode =
            data.roomCode;

        window.multiplayerRole =
            data.role;


        roomCode.innerText =
            data.roomCode;


        createGamePanel.classList.remove(
            "hidden"
        );

        joinGamePanel.classList.add(
            "hidden"
        );


        lobbyStatus.innerText =
            "Waiting for opponent...";


        console.log(
            "🧍 Your multiplayer role: MAN"
        );

    }


    // =========================================
    // PLAYER JOINED
    // =========================================

    if(data.type === "playerJoined"){

        lobbyStatus.innerText =
            "✅ Opponent connected!";


        console.log(
            "👥 Opponent joined."
        );

    }


    // =========================================
    // JOIN SUCCESS
    // =========================================

    if(data.type === "joinedRoom"){

        window.multiplayerRoomCode =
            data.roomCode;

        window.multiplayerRole =
            data.role;


        joinStatus.innerText =
            "✅ Joined game!";


        console.log(
            "Successfully joined room:",
            data.roomCode
        );


        console.log(
            "🦟 Your multiplayer role: MOSQUITO"
        );

    }


    // =========================================
    // GAME START
    // =========================================

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


        // -----------------------------------------
        // MAN
        // -----------------------------------------

        if(data.role === "man"){

            lobbyStatus.innerText =
                "🧍 You are the MAN!";


            joinStatus.innerText =
                "🧍 You are the MAN!";

        }


        // -----------------------------------------
        // MOSQUITO
        // -----------------------------------------

        if(data.role === "mosquito"){

            lobbyStatus.innerText =
                "🦟 You are the MOSQUITO!";


            joinStatus.innerText =
                "🦟 You are the MOSQUITO!";

        }


        /*
         * IMPORTANT:
         *
         * We are NOT starting the actual
         * game screens yet.
         *
         * First we are confirming that the
         * server correctly assigns roles.
         */
    }


    // =========================================
    // OPPONENT DISCONNECTED
    // =========================================

    if(data.type === "opponentDisconnected"){

        alert(
            "Your opponent disconnected."
        );


        window.multiplayerRole =
            null;

        window.multiplayerRoomCode =
            null;

    }


    // =========================================
    // SERVER ERROR
    // =========================================

    if(data.type === "error"){

        joinStatus.innerText =
            "❌ " + data.message;

    }

};


// ===================================================
// CREATE GAME
// ===================================================

if(createGameBtn){

    createGameBtn.onclick =
    function(){

        createGamePanel.classList.remove(
            "hidden"
        );

        joinGamePanel.classList.add(
            "hidden"
        );


        lobbyStatus.innerText =
            "Creating game...";


        if(socket.readyState !== WebSocket.OPEN){

            lobbyStatus.innerText =
                "❌ Not connected to server.";

            return;

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

        joinGamePanel.classList.remove(
            "hidden"
        );

        createGamePanel.classList.add(
            "hidden"
        );


        joinStatus.innerText =
            "";


        roomCodeInput.value =
            "";


        roomCodeInput.focus();

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

                joinRoomBtn.click();

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

        if(typeof playerModeMenu !== "undefined"){

            playerModeMenu.classList.add(
                "hidden"
            );

        }


        if(typeof mainMenu !== "undefined"){

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
