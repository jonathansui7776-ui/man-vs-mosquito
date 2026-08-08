const WebSocket = require("ws");

const server = new WebSocket.Server({
    port: 8080
});


console.log(
    "🦟 Man vs Mosquito server started!"
);

console.log(
    "WebSocket server running on port 8080"
);


// ===================================================
// ROOMS
// ===================================================

const rooms = new Map();


// ===================================================
// CREATE ROOM CODE
// ===================================================

function generateRoomCode(){

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    let code;


    do{

        code = "";

        for(let i = 0; i < 6; i++){

            code +=
                characters[
                    Math.floor(
                        Math.random() *
                        characters.length
                    )
                ];

        }

    }
    while(rooms.has(code));


    return code;

}


// ===================================================
// CONNECTION
// ===================================================

server.on(
    "connection",
    function(socket){

        console.log(
            "A player connected."
        );


        socket.roomCode = null;


        // =====================================
        // MESSAGE
        // =====================================

        socket.on(
            "message",
            function(message){

                let data;


                try{

                    data =
                        JSON.parse(
                            message.toString()
                        );

                }

                catch(error){

                    socket.send(
                        JSON.stringify({

                            type: "error",

                            message:
                                "Invalid message."

                        })
                    );

                    return;

                }


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

                            host: socket,

                            guest: null

                        }
                    );


                    socket.roomCode =
                        code;


                    socket.send(
                        JSON.stringify({

                            type:
                                "roomCreated",

                            roomCode:
                                code

                        })
                    );


                    console.log(
                        "Room created:",
                        code
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
                        data.roomCode;


                    const room =
                        rooms.get(code);


                    // -----------------------------
                    // ROOM DOESN'T EXIST
                    // -----------------------------

                    if(!room){

                        socket.send(
                            JSON.stringify({

                                type:
                                    "error",

                                message:
                                    "Game room not found."

                            })
                        );

                        return;

                    }


                    // -----------------------------
                    // ROOM FULL
                    // -----------------------------

                    if(room.guest){

                        socket.send(
                            JSON.stringify({

                                type:
                                    "error",

                                message:
                                    "This game is already full."

                            })
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


                    // Tell guest

                    socket.send(
                        JSON.stringify({

                            type:
                                "joinedRoom",

                            roomCode:
                                code

                        })
                    );


                    // Tell host

                    room.host.send(
                        JSON.stringify({

                            type:
                                "playerJoined"

                        })
                    );


                    console.log(
                        "Player joined room:",
                        code
                    );

                }

            }
        );


        // =====================================
        // DISCONNECT
        // =====================================

        socket.on(
            "close",
            function(){

                console.log(
                    "A player disconnected."
                );


                const code =
                    socket.roomCode;


                if(!code)
                    return;


                const room =
                    rooms.get(code);


                if(!room)
                    return;


                // Notify other player

                if(
                    room.host === socket &&
                    room.guest
                ){

                    room.guest.send(
                        JSON.stringify({

                            type:
                                "opponentDisconnected"

                        })
                    );

                }


                if(
                    room.guest === socket &&
                    room.host
                ){

                    room.host.send(
                        JSON.stringify({

                            type:
                                "opponentDisconnected"

                        })
                    );

                }


                rooms.delete(code);

            }
        );

    }
);