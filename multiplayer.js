// ===================================================
// MAN VS MOSQUITO
// MULTIPLAYER.JS
// ===================================================


// ===================================================
// CONNECTION
// ===================================================

const socket =
    new WebSocket("wss://man-vs-mosquito.onrender.com");


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

    }


    // =========================================
    // PLAYER JOINED
    // =========================================

    if(data.type === "playerJoined"){

        lobbyStatus.innerText =
            "✅ Opponent connected!";

        console.log(
            "Opponent joined room."
        );

    }


    // =========================================
    // JOIN SUCCESS
    // =========================================

    if(data.type === "joinedRoom"){

        joinStatus.innerText =
            "✅ Joined game!";

        console.log(
            "Successfully joined room:",
            data.roomCode
        );

    }


    // =========================================
    // OPPONENT DISCONNECTED
    // =========================================

    if(data.type === "opponentDisconnected"){

        alert(
            "Your opponent disconnected."
        );

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


        socket.send(
            JSON.stringify({

                type: "createRoom"

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


        joinStatus.innerText = "";


        roomCodeInput.value = "";


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


        joinStatus.innerText =
            "Joining game...";


        socket.send(
            JSON.stringify({

                type: "joinRoom",

                roomCode: code

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

        if(playerModeMenu){

            playerModeMenu.classList.add(
                "hidden"
            );

        }


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
