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
// BOARD
// ===================================================

const BOARD_SIZE = 6;


// ===================================================
// SANITY
// ===================================================

const INITIAL_SANITY = 100;


// ===================================================
// ROOM CODE
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
// SEND
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
// VALID COORDINATE
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
// ORTHOGONAL ADJACENCY
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
// GET ORTHOGONAL MOVES
// ===================================================

function getOrthogonalMoves(row, col){

    const moves = [];

    const directions = [

        {
            row: -1,
            col: 0
        },

        {
            row: 1,
            col: 0
        },

        {
            row: 0,
            col: -1
        },

        {
            row: 0,
            col: 1
        }

    ];


    for(
        const direction of directions
    ){

        const newRow =
            row +
            direction.row;

        const newCol =
            col +
            direction.col;


        if(
            isValidCoordinate(
                newRow,
                newCol
            )
        ){

            moves.push({

                row:
                    newRow,

                col:
                    newCol

            });

        }

    }


    return moves;

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


        // =================================================
        // MESSAGE
        // =================================================

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


                // =================================================
                // CREATE ROOM
                // =================================================

                if(
                    data.type ===
                    "createRoom"
                ){

                    const code =
                        generateRoomCode();


                    rooms.set(
                        code,
                        {

                            host:
                                socket,

                            guest:
                                null,

                            hostRole:
                                "man",

                            guestRole:
                                "mosquito",

                            gameStarted:
                                false,

                            gameState:
                                "waiting",

                            mosquitoPosition:
                                null,

                            mosquitoReady:
                                false,

                            manSanity:
                                INITIAL_SANITY,

                            turn:
                                0,

                            biteFreeTurns:
                                0,

                            lastAttack:
                                null,

                            mosquitoMoveReason:
                                null

                        }
                    );


                    socket.roomCode =
                        code;

                    socket.role =
                        "man";


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


                // =================================================
                // JOIN ROOM
                // =================================================

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


                    room.guest =
                        socket;


                    socket.roomCode =
                        code;

                    socket.role =
                        "mosquito";


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


                    // =============================================
                    // START GAME
                    // =============================================

                    room.gameStarted =
                        true;

                    room.gameState =
                        "mosquitoHiding";

                    room.mosquitoPosition =
                        null;

                    room.mosquitoReady =
                        false;

                    room.manSanity =
                        INITIAL_SANITY;

                    room.turn =
                        0;

                    room.biteFreeTurns =
                        0;

                    room.lastAttack =
                        null;

                    room.mosquitoMoveReason =
                        null;


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


                // =================================================
                // MOSQUITO INITIAL POSITION
                // =================================================

                else if(
                    data.type ===
                    "mosquitoPosition"
                ){

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
                                    "The Mosquito cannot choose a hiding place right now."

                            }
                        );

                        return;

                    }


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


                    const row =
                        Number(
                            data.row
                        );


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


                    const position =
                        getPositionName(
                            row,
                            col
                        );


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


                    room.manSanity =
                        INITIAL_SANITY;


                    room.biteFreeTurns =
                        0;


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


                    send(
                        room.guest,
                        {

                            type:
                                "mosquitoHidden"

                        }
                    );


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


                // =================================================
                // MAN ATTACK
                // =================================================

                else if(
                    data.type ===
                    "manAttack"
                ){

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


                    room.turn +=
                        1;


                    room.lastAttack = {

                        row:
                            attackRow,

                        col:
                            attackCol,

                        position:
                            attackPosition

                    };


                    // =================================================
                    // EXACT HIT
                    // =================================================

                    if(
                        attackRow ===
                            mosquitoRow &&
                        attackCol ===
                            mosquitoCol
                    ){

                        console.log(
                            "🎯 MAN HIT MOSQUITO!"
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


                    // =================================================
                    // BITE
                    // =================================================

                    if(
                        isOrthogonallyAdjacent(
                            attackRow,
                            attackCol,
                            mosquitoRow,
                            mosquitoCol
                        )
                    ){

                        room.manSanity -=
                            10;


                        if(
                            room.manSanity <
                            0
                        ){

                            room.manSanity =
                                0;

                        }


                        room.biteFreeTurns =
                            0;


                        room.gameState =
                            "mosquitoMoveAfterBite";


                        room.mosquitoMoveReason =
                            "bite";


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


                        send(
                            room.guest,
                            {

                                type:
                                    "mosquitoTurn",

                                reason:
                                    "bite",

                                turn:
                                    room.turn,

                                canFlyAnywhere:
                                    true,

                                currentPosition:
                                    {
                                        row:
                                            mosquitoRow,

                                        col:
                                            mosquitoCol
                                    },

                                message:
                                    "🩸 The Man detected a bite. Stay or fly anywhere."

                            }
                        );


                        return;

                    }


                    // =================================================
                    // MISS
                    // =================================================

                    room.manSanity -=
                        1;


                    if(
                        room.manSanity <
                        0
                    ){

                        room.manSanity =
                            0;

                    }


                    room.biteFreeTurns +=
                        1;


                    room.gameState =
                        "mosquitoMoveAfterMiss";


                    room.mosquitoMoveReason =
                        "miss";


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


                    send(
                        room.guest,
                        {

                            type:
                                "mosquitoTurn",

                            reason:
                                "miss",

                            turn:
                                room.turn,

                            canFlyAnywhere:
                                false,

                            currentPosition:
                                {
                                    row:
                                        mosquitoRow,

                                    col:
                                        mosquitoCol
                                },

                            message:
                                "❌ The Man missed. Stay or move one square orthogonally."

                        }
                    );

                }


                // =================================================
                // MOSQUITO MOVE
                // =================================================

                else if(
                    data.type ===
                    "mosquitoMove"
                ){

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


                    // ---------------------------------------------
                    // ONLY MOSQUITO
                    // ---------------------------------------------

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
                                    "Only the Mosquito can move."

                            }
                        );

                        return;

                    }


                    // ---------------------------------------------
                    // VALID GAME STATES
                    // ---------------------------------------------

                    if(
                        room.gameState !==
                            "mosquitoMoveAfterMiss" &&
                        room.gameState !==
                            "mosquitoMoveAfterBite"
                    ){

                        send(
                            socket,
                            {

                                type:
                                    "error",

                                message:
                                    "It is not the Mosquito's movement turn."

                            }
                        );

                        return;

                    }


                    if(
                        !room.mosquitoPosition
                    ){

                        send(
                            socket,
                            {

                                type:
                                    "error",

                                message:
                                    "Mosquito position is unavailable."

                            }
                        );

                        return;

                    }


                    const reason =
                        room.mosquitoMoveReason;


                    const currentRow =
                        room.mosquitoPosition.row;


                    const currentCol =
                        room.mosquitoPosition.col;


                    const action =
                        String(
                            data.action || ""
                        )
                        .trim()
                        .toLowerCase();


                    // =================================================
                    // STAY
                    // =================================================

                    if(
                        action ===
                        "stay"
                    ){

                        console.log(
                            "🦟 MOSQUITO STAYS"
                        );


                        console.log(
                            "Room:",
                            code
                        );


                        console.log(
                            "Position:",
                            room.mosquitoPosition.position
                        );


                        // ---------------------------------------------
                        // MAN TURN
                        // ---------------------------------------------

                        room.gameState =
                            "manTurn";


                        room.mosquitoMoveReason =
                            null;


                        send(
                            room.guest,
                            {

                                type:
                                    "mosquitoMoveResult",

                                action:
                                    "stay",

                                position:
                                    room.mosquitoPosition.position,

                                message:
                                    "🦟 You stayed. The Man's turn."

                            }
                        );


                        send(
                            room.host,
                            {

                                type:
                                    "mosquitoMoved",

                                action:
                                    "stay",

                                message:
                                    "🦟 The Mosquito stayed. Your turn."

                            }
                        );


                        return;

                    }


                    // =================================================
                    // MOVE
                    // =================================================

                    if(
                        action !==
                        "move"
                    ){

                        send(
                            socket,
                            {

                                type:
                                    "error",

                                message:
                                    "Choose Stay or Move."

                            }
                        );

                        return;

                    }


                    const newRow =
                        Number(
                            data.row
                        );


                    const newCol =
                        Number(
                            data.col
                        );


                    if(
                        !isValidCoordinate(
                            newRow,
                            newCol
                        )
                    ){

                        send(
                            socket,
                            {

                                type:
                                    "error",

                                message:
                                    "Invalid movement position."

                            }
                        );

                        return;

                    }


                    // =================================================
                    // MISS = ORTHOGONAL ONLY
                    // =================================================

                    if(
                        reason ===
                        "miss"
                    ){

                        if(
                            !isOrthogonallyAdjacent(
                                currentRow,
                                currentCol,
                                newRow,
                                newCol
                            )
                        ){

                            send(
                                socket,
                                {

                                    type:
                                        "error",

                                    message:
                                        "After a miss, the Mosquito can only move one square orthogonally."

                                }
                            );

                            return;

                        }

                    }


                    // =================================================
                    // BITE = ANYWHERE
                    // =================================================

                    if(
                        reason ===
                        "bite"
                    ){

                        // Any valid square is allowed.
                        // No adjacency restriction.

                    }


                    // =================================================
                    // UPDATE SECRET POSITION
                    // =================================================

                    const newPosition =
                        getPositionName(
                            newRow,
                            newCol
                        );


                    room.mosquitoPosition = {

                        row:
                            newRow,

                        col:
                            newCol,

                        position:
                            newPosition

                    };


                    room.gameState =
                        "manTurn";


                    room.mosquitoMoveReason =
                        null;


                    console.log(
                        "🦟 MOSQUITO MOVED"
                    );


                    console.log(
                        "Room:",
                        code
                    );


                    console.log(
                        "Reason:",
                        reason
                    );


                    console.log(
                        "New position:",
                        newPosition
                    );


                    // =================================================
                    // TELL MOSQUITO
                    // =================================================

                    send(
                        room.guest,
                        {

                            type:
                                "mosquitoMoveResult",

                            action:
                                "move",

                            position:
                                newPosition,

                            row:
                                newRow,

                            col:
                                newCol,

                            message:
                                "🦟 Movement complete. The Man's turn."

                        }
                    );


                    // =================================================
                    // TELL MAN
                    //
                    // IMPORTANT:
                    // DO NOT SEND POSITION.
                    // =================================================

                    send(
                        room.host,
                        {

                            type:
                                "mosquitoMoved",

                            action:
                                "move",

                            message:
                                "🦟 The Mosquito moved. Your turn."

                        }
                    );


                    return;

                }


                // =================================================
                // UNKNOWN MESSAGE
                // =================================================

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


        // =================================================
        // DISCONNECT
        // =================================================

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

                    room.lastAttack =
                        null;

                    room.mosquitoMoveReason =
                        null;


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
