// ===================================================
// MAN VS MOSQUITO
// MULTIPLAYER.JS
// ===================================================


// ===================================================
// CONNECTION
// ===================================================

const mpSocket =
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
// LOBBY ELEMENTS
// ===================================================

const mpCreateGameBtn =
    document.getElementById(
        "createGameBtn"
    );

const mpJoinGameBtn =
    document.getElementById(
        "joinGameBtn"
    );

const mpCreateGamePanel =
    document.getElementById(
        "createGamePanel"
    );

const mpJoinGamePanel =
    document.getElementById(
        "joinGamePanel"
    );

const mpRoomCode =
    document.getElementById(
        "roomCode"
    );

const mpRoomCodeInput =
    document.getElementById(
        "roomCodeInput"
    );

const mpJoinRoomBtn =
    document.getElementById(
        "joinRoomBtn"
    );

const mpLobbyStatus =
    document.getElementById(
        "lobbyStatus"
    );

const mpJoinStatus =
    document.getElementById(
        "joinStatus"
    );

const mpPlayerBackBtn =
    document.getElementById(
        "playerBackBtn"
    );


// ===================================================
// MULTIPLAYER SCREENS
// ===================================================

const mpLobbyScreen =
    document.getElementById(
        "playerModeMenu"
    );

const mpManScreen =
    document.getElementById(
        "multiplayerManScreen"
    );

const mpMosquitoScreen =
    document.getElementById(
        "multiplayerMosquitoScreen"
    );


// ===================================================
// HIDE MULTIPLAYER SCREENS
// ===================================================

function hideMultiplayerScreens(){

    if(mpLobbyScreen){

        mpLobbyScreen.classList.add(
            "hidden"
        );

    }


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
// SHOW MAN MULTIPLAYER SCREEN
// ===================================================

function showMultiplayerMan(){

    console.log(
        "🧍 Opening MULTIPLAYER MAN screen..."
    );


    hideMultiplayerScreens();


    if(mpManScreen){

        mpManScreen.classList.remove(
            "hidden"
        );


        console.log(
            "✅ Multiplayer Man screen opened."
        );

    }
    else{

        console.error(
            "❌ #multiplayerManScreen NOT FOUND"
        );

    }


    window.currentGameMode =
        "multiplayer-man";


    // ---------------------------------------------
    // Reset multiplayer HUD
    // ---------------------------------------------

    const sanity =
        document.getElementById(
            "multiplayerManSanity"
        );

    const gamble =
        document.getElementById(
            "multiplayerManGamble"
        );

    const turn =
        document.getElementById(
            "multiplayerManTurn"
        );

    const status =
        document.getElementById(
            "multiplayerStatus"
        );


    if(sanity){

        sanity.innerText =
            "100%";

    }


    if(gamble){

        gamble.innerText =
            "3";

    }


    if(turn){

        turn.innerText =
            "1";

    }


    if(status){

        status.innerText =
            "Waiting for Mosquito-chan...";

    }


    console.log(
        "🎮 Multiplayer Man ready."
    );

}


// ===================================================
// SHOW MOSQUITO MULTIPLAYER SCREEN
// ===================================================

function showMultiplayerMosquito(){

    console.log(
        "🦟 Opening MULTIPLAYER MOSQUITO screen..."
    );


    hideMultiplayerScreens();


    if(mpMosquitoScreen){

        mpMosquitoScreen.classList.remove(
            "hidden"
        );


        console.log(
            "✅ Multiplayer Mosquito screen opened."
        );

    }
    else{

        console.error(
            "❌ #multiplayerMosquitoScreen NOT FOUND"
        );

    }


    window.currentGameMode =
        "multiplayer-mosquito";


    // ---------------------------------------------
    // Reset multiplayer Mosquito HUD
    // ---------------------------------------------

    const sanity =
        document.getElementById(
            "multiplayerMosquitoManSanity"
        );

    const turn =
        document.getElementById(
            "multiplayerMosquitoTurn"
        );

    const status =
        document.getElementById(
            "multiplayerManStatus"
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


    console.log(
        "🎮 Multiplayer Mosquito ready."
    );

}


// ===================================================
// CONNECTION OPEN
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
// SERVER MESSAGES
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
            "🧍 Multiplayer role: MAN"
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
            "🦟 Multiplayer role: MOSQUITO"
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
        // Hide lobby
        // ---------------------------------------------

        if(mpLobbyScreen){

            mpLobbyScreen.classList.add(
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

            showMultiplayerMan();

        }


        // ---------------------------------------------
        // MOSQUITO
        // ---------------------------------------------

        if(
            data.role ===
            "mosquito"
        ){

            showMultiplayerMosquito();

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

    };

}


// ===================================================
// SHOW JOIN PANEL
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
// JOIN GAME
// ===================================================

if(mpJoinRoomBtn){

    mpJoinRoomBtn.onclick =
    function(){

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
// BACK
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

    };

}


// ===================================================
// DISCONNECTED
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
// CONNECTION ERROR
// ===================================================

mpSocket.onerror =
function(error){

    console.error(
        "❌ WebSocket error:",
        error
    );

};
