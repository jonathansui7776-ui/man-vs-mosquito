// ===================================================
// MAN VS MOSQUITO
// MULTIPLAYER SERVER
// ===================================================

const http = require("http");
const WebSocket = require("ws");


// ===================================================
// PORT
// ===================================================

const PORT =
    process.env.PORT || 8080;


// ===================================================
// HTTP SERVER
// ===================================================

const httpServer =
    http.createServer(
        function(req, res){

            res.writeHead(200, {
                "Content-Type": "text/plain"
            });

            res.end(
                "🦟 Man vs Mosquito multiplayer server is running!"
            );

        }
    );


// ===================================================
// WEBSOCKET SERVER
// ===================================================

const server =
    new WebSocket.Server({
        server: httpServer
    });


console.log(
    "🦟 Man vs Mosquito server started!"
);


// ===================================================
// ROOMS
// ===================================================

const rooms =
    new Map();


// ===================================================
// BOARD SIZE
// ===================================================

const BOARD_SIZE = 6;


// ===================================================
// INITIAL SANITY
// ===================================================

const INITIAL_SANITY = 100;


// ===================================================
// CREATE ROOM CODE
// ===================================================

function generateRoomCode(){

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code;


    do{

        code = "";


        for(
            let i = 0;
            i < 6;
            i++
        ){

            code +=
                characters[
                    Math.floor(
                        Math.random() *
                        characters.length
                    )
                ];

        }

    }
    while(
        rooms.has(code)
    );


    return code;

}


// ===================================================
// SEND JSON
// ===================================================

function send(socket, data){

    if(
        socket &&
        socket.readyState ===
        WebSocket.OPEN
    ){

        socket.send(
            JSON.stringify(data)
        );

    }

}


// ===================================================
// POSITION NAME
// ===================================================

function getPositionName(row, col){

    return (
        String.fromCharCode(
            65 + row
        ) +
        (col + 1)
    );

}


// ===================================================
// VALIDATE BOARD COORDINATES
// ===================================================

function isValidCoordinate(row, col){

    return (
        Number.isInteger(row) &&
        Number.isInteger(col) &&
        row >= 0 &&
        row < BOARD_SIZE &&
        col >= 0 &&
        col < BOARD_SIZE
    );

}


// ===================================================
// CHECK SIDE-ADJACENCY
// ===================================================
//
// TRUE ONLY IF:
//
// up
// down
// left
// right
//
// Diagonals are NOT adjacent.
//
// ===================================================

function isOrthogonallyAdjacent(
    row1,
    col1,
    row2,
    col2
){

    const rowDifference =
        Math.abs(
            row1 - row2
        );


    const colDifference =
        Math.abs(
            col1 - col2
        );


    return (
        rowDifference +
        colDifference ===
        1
    );

}


// ===================================================
// CONNECTION
// ===================================================

server.on(
    "connection",
    function(socket){

        console.log(
            "🌐 A player connected."
        );


        socket.roomCode =
            null;

        socket.role =
            null;


        // =========================================
        // MESSAGE
        // =========================================

        socket.on(
            "message",
            function(message){

                let data;


                // =================================
                // PARSE MESSAGE
                // =================================

                try{

                    data =
                        JSON.parse(
                            message.toString()
                        );

                }

                catch(error){

                    send(
                        socket,
                        {

                            type:
                                "error",

                            message:
                                "Invalid message."

                        }
                    );

                    return;

                }


                console.log(
                    "📨 Message:",
                    data.type
                );


                // =================================
                // CREATE ROOM
                // =================================

                if(
                    data.type ===
                    "createRoom"
                ){

                    const code =
                        generateRoomCode();


                    rooms.set(
                        code,
                        {

                            // -------------------------
                            // PLAYERS
                            // -------------------------

                            host:
                                socket,

                            guest:
                                null,


                            // -------------------------
                            // ROLES
                            // -------------------------

                            hostRole:
                                "man",

                            guestRole:
                                "mosquito",


                            // -------------------------
                            // GAME STATE
                            // -------------------------

                            gameStarted:
                                false,

                            gameState:
                                "waiting",


                            // -------------------------
                            // MOSQUITO
                            // -------------------------

                            mosquitoPosition:
                                null,

                            mosquitoReady:
                                false,


                            // -------------------------
                            // MAN
                            // -------------------------

                            manSanity:
                                INITIAL_SANITY,

                            turn:
                                0,

                            biteFreeTurns:
                                0

                        }
                    );


                    socket.roomCode =
                        code;

                    socket.role =
                        "man";


                    // -----------------------------
                    // TELL HOST
                    // -----------------------------

                    send(
                        socket,
                        {

                            type:
                                "roomCreated",

                            roomCode:
                                code,

                            role:
                                "man"

                        }
                    );


                    console.log(
                        "🎮 Room created:",
                        code
                    );

                    console.log(
                        "🧍 Host role: MAN"
                    );

                }


                // =================================
                // JOIN ROOM
                // =================================

                else if(
                    data.type ===
                    "joinRoom"
                ){

                    const code =
                        String(
                            data.roomCode || ""
                        )
                        .trim()
                        .toUpperCase();


                    const room =
                        rooms.get(code);


                    // -----------------------------
                    // ROOM NOT FOUND
                    // -----------------------------

                    if(!room){

                        send(
                            socket,
                            {

                                type:
                                    "error",

                                message:
                                    "Game room not found."

                            }
                        );

                        return;

                    }


                    // -----------------------------
                    // ROOM FULL
                    // -----------------------------

                    if(room.guest){

                        send(
                            socket,
                            {

                                type:
                                    "error",

                                message:
                                    "This game is already full."

                            }
                        );

                        return;

                    }


                    // -----------------------------
                    // JOIN
                    // -----------------------------

                    room.guest =
                        socket;


                    socket.roomCode =
                        code;

                    socket.role =
                        "mosquito";


                    // -----------------------------
                    // TELL GUEST
                    // -----------------------------

                    send(
                        socket,
                        {

                            type:
                                "joinedRoom",

                            roomCode:
                                code,

                            role:
                                "mosquito"

                        }
                    );


                    // -----------------------------
                    // TELL HOST
                    // -----------------------------

                    send(
                        room.host,
                        {

                            type:
                                "playerJoined",

                            role:
                                "man"

                        }
                    );


                    console.log(
                        "👥 Player joined room:",
                        code
                    );

                    console.log(
                        "🧍 Host role: MAN"
                    );

                    console.log(
                        "🦟 Guest role: MOSQUITO"
                    );


                    // =================================
                    // START MULTIPLAYER GAME
                    // =================================

                    room.gameStarted =
                        true;

                    room.gameState =
                        "mosquitoHiding";


                    room.manSanity =
                        INITIAL_SANITY;

                    room.turn =
                        0;

                    room.biteFreeTurns =
                        0;


                    send(
                        room.host,
                        {

                            type:
                                "gameStart",

                            role:
                                "man",

                            roomCode:
                                code

                        }
                    );


                    send(
                        room.guest,
                        {

                            type:
                                "gameStart",

                            role:
                                "mosquito",

                            roomCode:
                                code

                        }
                    );


                    console.log(
                        "🎮 Multiplayer game starting:",
                        code
                    );

                }


                // =================================
                // MOSQUITO HIDING POSITION
                // =================================

                else if(
                    data.type ===
                    "mosquitoPosition"
                ){

                    // -----------------------------
                    // CHECK ROOM
                    // -----------------------------

                    const code =
                        String(
                            data.roomCode || ""
                        )
                        .trim()
                        .toUpperCase();


                    const room =
                        rooms.get(code);


                    if(!room){

                        send(
                            socket,
                            {

                                type:
                                    "error",

                                message:
                                    "Game room not found."

                            }
                        );

                        return;

                    }


                    // -----------------------------
                    // ONLY MOSQUITO
                    // -----------------------------

                    if(
                        socket !==
                        room.guest ||
                        socket.role !==
                        "mosquito"
                    ){

                        send(
                            socket,
                            {

                                type:
                                    "error",

                                message:
                                    "Only the Mosquito can choose the hiding place."

                            }
                        );

                        return;

                    }


                    // -----------------------------
                    // GAME STATE
                    // -----------------------------

                    if(
                        room.gameState !==
                        "mosquitoHiding"
                    ){

                        send(
                            socket,
                            {

                                type:
                                    "error",

                                message:
                                    "The Mosquito cannot choose a new hiding place right now."

                            }
                        );

                        return;

                    }


                    // -----------------------------
                    // PREVENT SECOND SELECTION
                    // -----------------------------

                    if(
                        room.mosquitoReady
                    ){

                        send(
                            socket,
                            {

                                type:
                                    "error",

                                message:
                                    "The hiding place has already been selected."

                            }
                        );

                        return;

                    }


                    // -----------------------------
                    // VALIDATE ROW
                    // -----------------------------

                    const row =
                        Number(
                            data.row
                        );


                    // -----------------------------
                    // VALIDATE COLUMN
                    // -----------------------------

                    const col =
                        Number(
                            data.col
                        );


                    if(
                        !isValidCoordinate(
                            row,
                            col
                        )
                    ){

                        send(
                            socket,
                            {

                                type:
                                    "error",

                                message:
                                    "Invalid hiding position."

                            }
                        );

                        return;

                    }


                    // -----------------------------
                    // SERVER GENERATES POSITION
                    // -----------------------------

                    const position =
                        getPositionName(
                            row,
                            col
                        );


                    // -----------------------------
                    // STORE SECRET POSITION
                    // -----------------------------

                    room.mosquitoPosition = {

                        row:
                            row,

                        col:
                            col,

                        position:
                            position

                    };


                    room.mosquitoReady =
                        true;


                    room.gameState =
                        "manTurn";


                    room.turn =
                        0;


                    room.biteFreeTurns =
                        0;


                    room.manSanity =
                        INITIAL_SANITY;


                    console.log(
                        "🦟 Mosquito has hidden."
                    );

                    console.log(
                        "Room:",
                        code
                    );

                    console.log(
                        "Position:",
                        position
                    );


                    // =================================
                    // TELL MOSQUITO
                    // =================================

                    send(
                        room.guest,
                        {

                            type:
                                "mosquitoHidden"

                        }
                    );


                    // =================================
                    // TELL MAN
                    // =================================
                    //
                    // IMPORTANT:
                    //
                    // NEVER SEND:
                    //
                    // row
                    // col
                    // position
                    //
                    // =================================

                    send(
                        room.host,
                        {

                            type:
                                "mosquitoReady"

                        }
                    );


                    console.log(
                        "🧍 Man notified:"
                    );

                    console.log(
                        "The hunt has started."
                    );

                }


                // =================================
                // MAN ATTACK
                // =================================

                else if(
                    data.type ===
                    "manAttack"
                ){

                    // -----------------------------
                    // CHECK ROOM
                    // -----------------------------

                    const code =
                        String(
                            data.roomCode || ""
                        )
                        .trim()
                        .toUpperCase();


                    const room =
                        rooms.get(code);


                    if(!room){

                        send(
                            socket,
                            {

                                type:
                                    "error",

                                message:
                                    "Game room not found."

                            }
                        );

                        return;

                    }


                    // -----------------------------
                    // ONLY MAN
                    // -----------------------------

                    if(
                        socket !==
                        room.host ||
                        socket.role !==
                        "man"
                    ){

                        send(
                            socket,
                            {

                                type:
                                    "error",

                                message:
                                    "Only the Man can attack."

                            }
                        );

                        return;

                    }


                    // -----------------------------
                    // MUST BE MAN'S TURN
                    // -----------------------------

                    if(
                        room.gameState !==
                        "manTurn"
                    ){

                        send(
                            socket,
                            {

                                type:
                                    "error",

                                message:
                                    "It is not the Man's turn."

                            }
                        );

                        return;

                    }


                    // -----------------------------
                    // MOSQUITO MUST BE HIDDEN
                    // -----------------------------

                    if(
                        !room.mosquitoReady ||
                        !room.mosquitoPosition
                    ){

                        send(
                            socket,
                            {

                                type:
                                    "error",

                                message:
                                    "The Mosquito has not hidden yet."

                            }
                        );

                        return;

                    }


                    // -----------------------------
                    // VALIDATE ATTACK
                    // -----------------------------

                    const attackRow =
                        Number(
                            data.row
                        );


                    const attackCol =
                        Number(
                            data.col
                        );


                    if(
                        !isValidCoordinate(
                            attackRow,
                            attackCol
                        )
                    ){

                        send(
                            socket,
                            {

                                type:
                                    "error",

                                message:
                                    "Invalid attack position."

                            }
                        );

                        return;

                    }


                    // -----------------------------
                    // GET MOSQUITO POSITION
                    // -----------------------------

                    const mosquitoRow =
                        room.mosquitoPosition.row;


                    const mosquitoCol =
                        room.mosquitoPosition.col;


                    const attackPosition =
                        getPositionName(
                            attackRow,
                            attackCol
                        );


                    const mosquitoPosition =
                        room.mosquitoPosition.position;


                    // -----------------------------
                    // ADVANCE TURN
                    // -----------------------------

                    room.turn += 1;


                    // =================================
                    // EXACT HIT
                    // =================================

                    if(
                        attackRow ===
                            mosquitoRow &&
                        attackCol ===
                            mosquitoCol
                    ){

                        console.log(
                            "🎯 MAN HIT MOSQUITO!"
                        );

                        console.log(
                            "Room:",
                            code
                        );

                        console.log(
                            "Turn:",
                            room.turn
                        );

                        console.log(
                            "Position:",
                            mosquitoPosition
                        );


                        room.gameState =
                            "manWon";


                        send(
                            room.host,
                            {

                                type:
                                    "attackResult",

                                result:
                                    "hit",

                                attackPosition:
                                    attackPosition,

                                turn:
                                    room.turn,

                                sanity:
                                    room.manSanity,

                                message:
                                    "🎯 HIT! You caught the Mosquito!"

                            }
                        );


                        send(
                            room.guest,
                            {

                                type:
                                    "gameOver",

                                winner:
                                    "man",

                                result:
                                    "hit",

                                attackPosition:
                                    attackPosition,

                                turn:
                                    room.turn,

                                message:
                                    "🎯 The Man caught you!"

                            }
                        );


                        return;

                    }


                    // =================================
                    // BITE
                    // =================================

                    if(
                        isOrthogonallyAdjacent(
                            attackRow,
                            attackCol,
                            mosquitoRow,
                            mosquitoCol
                        )
                    ){

                        // -----------------------------
                        // SANITY -10
                        // -----------------------------

                        room.manSanity -=
                            10;


                        if(
                            room.manSanity <
                            0
                        ){

                            room.manSanity =
                                0;

                        }


                        // -----------------------------
                        // RESET BITE-FREE COUNTER
                        // -----------------------------

                        room.biteFreeTurns =
                            0;


                        console.log(
                            "🩸 BITE!"
                        );

                        console.log(
                            "Room:",
                            code
                        );

                        console.log(
                            "Turn:",
                            room.turn
                        );

                        console.log(
                            "Attack:",
                            attackPosition
                        );

                        console.log(
                            "Mosquito:",
                            mosquitoPosition
                        );

                        console.log(
                            "Sanity:",
                            room.manSanity
                        );


                        // --------------------------------
                        // FOR NOW:
                        // GAME WAITS FOR NEXT MOVEMENT
                        // SYSTEM.
                        // --------------------------------

                        room.gameState =
                            "mosquitoMoveAfterBite";


                        // -----------------------------
                        // TELL MAN
                        // -----------------------------

                        send(
                            room.host,
                            {

                                type:
                                    "attackResult",

                                result:
                                    "bite",

                                attackPosition:
                                    attackPosition,

                                turn:
                                    room.turn,

                                sanity:
                                    room.manSanity,

                                message:
                                    "🩸 BITE! The Mosquito is nearby! -10 Sanity."

                            }
                        );


                        // -----------------------------
                        // TELL MOSQUITO
                        // -----------------------------

                        send(
                            room.guest,
                            {

                                type:
                                    "mosquitoTurn",

                                reason:
                                    "bite",

                                turn:
                                    room.turn,

                                message:
                                    "🩸 The Man detected a bite. You may move."

                            }
                        );


                        return;

                    }


                    // =================================
                    // NORMAL MISS
                    // =================================
                    //
                    // MISS = -1 SANITY
                    //
                    // =================================

                    room.manSanity -=
                        1;


                    if(
                        room.manSanity <
                        0
                    ){

                        room.manSanity =
                            0;

                    }


                    // -----------------------------
                    // INCREMENT BITE-FREE TURNS
                    // -----------------------------

                    room.biteFreeTurns +=
                        1;


                    console.log(
                        "❌ MAN MISSED."
                    );

                    console.log(
                        "Room:",
                        code
                    );

                    console.log(
                        "Turn:",
                        room.turn
                    );

                    console.log(
                        "Attack:",
                        attackPosition
                    );

                    console.log(
                        "Sanity:",
                        room.manSanity
                    );

                    console.log(
                        "Bite-free turns:",
                        room.biteFreeTurns
                    );


                    room.gameState =
                        "mosquitoMoveAfterMiss";


                    // -----------------------------
                    // TELL MAN
                    // -----------------------------

                    send(
                        room.host,
                        {

                            type:
                                "attackResult",

                            result:
                                "miss",

                            attackPosition:
                                attackPosition,

                            turn:
                                room.turn,

                            sanity:
                                room.manSanity,

                            biteFreeTurns:
                                room.biteFreeTurns,

                            message:
                                "❌ MISS! -1 Sanity."

                        }
                    );


                    // -----------------------------
                    // TELL MOSQUITO
                    // -----------------------------

                    send(
                        room.guest,
                        {

                            type:
                                "mosquitoTurn",

                            reason:
                                "miss",

                            turn:
                                room.turn,

                            message:
                                "❌ The Man missed. Your turn."

                        }
                    );

                }

                // =================================
                // UNKNOWN MESSAGE
                // =================================

                else{

                    send(
                        socket,
                        {

                            type:
                                "error",

                            message:
                                "Unknown message type."

                        }
                    );


                    console.log(
                        "⚠️ Unknown message:",
                        data.type
                    );

                }

            }
        );


        // =========================================
        // DISCONNECT
        // =========================================

        socket.on(
            "close",
            function(){

                console.log(
                    "❌ A player disconnected."
                );


                const code =
                    socket.roomCode;


                if(!code){

                    return;

                }


                const room =
                    rooms.get(code);


                if(!room){

                    return;

                }


                // -----------------------------
                // HOST DISCONNECTED
                // -----------------------------

                if(
                    room.host ===
                    socket
                ){

                    if(room.guest){

                        send(
                            room.guest,
                            {

                                type:
                                    "opponentDisconnected"

                            }
                        );

                    }


                    rooms.delete(
                        code
                    );


                    console.log(
                        "🗑️ Room deleted:",
                        code
                    );


                    return;

                }


                // -----------------------------
                // GUEST DISCONNECTED
                // -----------------------------

                if(
                    room.guest ===
                    socket
                ){

                    if(room.host){

                        send(
                            room.host,
                            {

                                type:
                                    "opponentDisconnected"

                            }
                        );

                    }


                    room.guest =
                        null;


                    room.mosquitoPosition =
                        null;


                    room.mosquitoReady =
                        false;


                    room.gameStarted =
                        false;


                    room.gameState =
                        "waiting";


                    room.manSanity =
                        INITIAL_SANITY;


                    room.turn =
                        0;


                    room.biteFreeTurns =
                        0;


                    console.log(
                        "👥 Guest left room:",
                        code
                    );

                }

            }
        );

    }
);


// ===================================================
// START SERVER
// ===================================================

httpServer.listen(
    PORT,
    "0.0.0.0",
    function(){

        console.log(
            "🌐 Server listening on 0.0.0.0:" +
            PORT
        );

    }
);
