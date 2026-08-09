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

                            mosquitoPosition:
                                null,

                            gameStarted:
                                false,

                            mosquitoReady:
                                false

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
                        !Number.isInteger(row) ||
                        !Number.isInteger(col) ||
                        row < 0 ||
                        row > 4 ||
                        col < 0 ||
                        col > 4
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
                    // GENERATE POSITION SERVER-SIDE
                    // -----------------------------

                    const position =
                        String.fromCharCode(
                            65 + row
                        ) +
                        (col + 1);


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
                    // DO NOT SEND:
                    // row
                    // col
                    // position
                    //
                    // The Man must NOT know
                    // where the Mosquito is.
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
