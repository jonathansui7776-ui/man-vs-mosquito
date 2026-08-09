// ==================================================
// MAN VS MOSQUITO
// MULTIPLAYER SERVER
// ==================================================

const http = require("http");
const WebSocket = require("ws");

// ===================================================
// PORT
// ===================================================

const PORT = process.env.PORT || 8080;

// ===================================================
// HTTP SERVER
// ===================================================

const httpServer = http.createServer(
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

const server = new WebSocket.Server({
    server: httpServer
});

console.log(
    "🦟 Man vs Mosquito multiplayer server started!"
);

// ===================================================
// ROOMS
// ===================================================

const rooms = new Map();

// ===================================================
// CONSTANTS
// ===================================================

const BOARD_SIZE = 6;
const INITIAL_SANITY = 100;
const BITE_DAMAGE = 10;
const MISS_DAMAGE = 1;

// ===================================================
// ROOM CODE
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
// SEND
// ===================================================

function send(socket, data){

    if(
        socket &&
        socket.readyState === WebSocket.OPEN
    ){

        socket.send(
            JSON.stringify(data)
        );

    }

}

// ===================================================
// BROADCAST
// ===================================================

function sendBoth(room, data){

    send(room.host, data);
    send(room.guest, data);

}

// ===================================================
// POSITION NAME
// ===================================================

function getPositionName(row, col){

    return (
        String.fromCharCode(65 + row) +
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
// ORTHOGONAL
// ===================================================

function isOrthogonallyAdjacent(
    row1,
    col1,
    row2,
    col2
){

    return (
        Math.abs(row1 - row2) +
        Math.abs(col1 - col2) === 1
    );

}

// ===================================================
// GET ROOM
// ===================================================

function getRoom(code){

    return rooms.get(
        String(code || "")
            .trim()
            .toUpperCase()
    );

}

// ===================================================
// RESET GAME STATE
// ===================================================

function resetGameState(room){

    room.gameStarted = false;

    room.gameState = "waiting";

    room.mosquitoPosition = null;

    room.mosquitoReady = false;

    room.manSanity = INITIAL_SANITY;

    room.turn = 0;

    room.biteFreeTurns = 0;

    room.lastAttack = null;

    room.lastAttackResult = null;

    room.mosquitoMoveReason = null;

    room.restartMan = false;

    room.restartMosquito = false;

}

// ===================================================
// START NEW ROUND
// ===================================================

function startNewRound(room){

    resetGameState(room);

    room.gameStarted = true;

    room.gameState = "mosquitoHiding";

    send(
        room.host,
        {
            type: "newRound",
            role: "man",
            roomCode: room.code
        }
    );

    send(
        room.guest,
        {
            type: "newRound",
            role: "mosquito",
            roomCode: room.code
        }
    );

    console.log(
        "🔄 New multiplayer round:",
        room.code
    );

}

// ===================================================
// SEND VICTORY
// ===================================================

function sendGameOver(
    room,
    winner,
    reason
){

    room.gameState =
        winner === "man"
            ? "manWon"
            : "mosquitoWon";

    sendBoth(
        room,
        {
            type: "gameOver",

            winner: winner,

            reason: reason,

            sanity:
                room.manSanity,

            turn:
                room.turn
        }
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

        socket.roomCode = null;
        socket.role = null;

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
                            type: "error",
                            message: "Invalid message."
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

                    const room = {

                        code: code,

                        host: socket,

                        guest: null,

                        hostRole: "man",

                        guestRole: "mosquito",

                        gameStarted: false,

                        gameState: "waiting",

                        mosquitoPosition: null,

                        mosquitoReady: false,

                        manSanity: INITIAL_SANITY,

                        turn: 0,

                        biteFreeTurns: 0,

                        lastAttack: null,

                        lastAttackResult: null,

                        mosquitoMoveReason: null,

                        restartMan: false,

                        restartMosquito: false

                    };

                    rooms.set(
                        code,
                        room
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

                    return;

                }

                // =================================================
                // JOIN ROOM
                // =================================================

                if(
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
                                type: "error",
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
                                type: "error",
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

                    room.turn = 0;

                    room.biteFreeTurns = 0;

                    room.lastAttack = null;

                    room.lastAttackResult = null;

                    room.mosquitoMoveReason =
                        null;

                    room.restartMan = false;

                    room.restartMosquito = false;

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

                    return;

                }

                // =================================================
                // MOSQUITO INITIAL POSITION
                // =================================================

                if(
                    data.type ===
                    "mosquitoPosition"
                ){

                    const room =
                        getRoom(
                            data.roomCode
                        );

                    if(!room){

                        send(
                            socket,
                            {
                                type: "error",
                                message:
                                    "Game room not found."
                            }
                        );

                        return;

                    }

                    if(
                        socket !== room.guest ||
                        socket.role !== "mosquito"
                    ){

                        send(
                            socket,
                            {
                                type: "error",
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
                                type: "error",
                                message:
                                    "The Mosquito cannot choose a hiding place right now."
                            }
                        );

                        return;

                    }

                    const row =
                        Number(data.row);

                    const col =
                        Number(data.col);

                    if(
                        !isValidCoordinate(
                            row,
                            col
                        )
                    ){

                        send(
                            socket,
                            {
                                type: "error",
                                message:
                                    "Invalid hiding position."
                            }
                        );

                        return;

                    }

                    room.mosquitoPosition = {

                        row: row,

                        col: col,

                        position:
                            getPositionName(
                                row,
                                col
                            )

                    };

                    room.mosquitoReady =
                        true;

                    room.gameState =
                        "manTurn";

                    room.turn = 0;

                    room.manSanity =
                        INITIAL_SANITY;

                    room.biteFreeTurns = 0;

                    console.log(
                        "🦟 Mosquito hidden:",
                        room.mosquitoPosition.position
                    );

                    // MOSQUITO ONLY
                    send(
                        room.guest,
                        {
                            type:
                                "mosquitoHidden"
                        }
                    );

                    // MAN ONLY
                    send(
                        room.host,
                        {
                            type:
                                "mosquitoReady",

                            sanity:
                                room.manSanity,

                            turn:
                                room.turn
                        }
                    );

                    return;

                }

                // =================================================
                // MAN ATTACK
                // =================================================

                if(
                    data.type ===
                    "manAttack"
                ){

                    const room =
                        getRoom(
                            data.roomCode
                        );

                    if(!room){

                        send(
                            socket,
                            {
                                type: "error",
                                message:
                                    "Game room not found."
                            }
                        );

                        return;

                    }

                    if(
                        socket !== room.host ||
                        socket.role !== "man"
                    ){

                        send(
                            socket,
                            {
                                type: "error",
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
                                type: "error",
                                message:
                                    "It is not the Man's turn."
                            }
                        );

                        return;

                    }

                    const attackRow =
                        Number(data.row);

                    const attackCol =
                        Number(data.col);

                    if(
                        !isValidCoordinate(
                            attackRow,
                            attackCol
                        )
                    ){

                        send(
                            socket,
                            {
                                type: "error",
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

                    room.turn += 1;

                    // ---------------------------------------------
                    // MULTIPLAYER-ONLY ATTACK STATE
                    // ---------------------------------------------

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

                        room.lastAttackResult =
                            "hit";

                        console.log(
                            "🎯 MAN HIT MOSQUITO:",
                            attackPosition
                        );

                        send(
                            room.host,
                            {
                                type:
                                    "attackResult",

                                result:
                                    "hit",

                                attackPosition:
                                    attackPosition,

                                attackRow:
                                    attackRow,

                                attackCol:
                                    attackCol,

                                sanity:
                                    room.manSanity,

                                turn:
                                    room.turn
                            }
                        );

                        send(
                            room.guest,
                            {
                                type:
                                    "attackResult",

                                result:
                                    "hit",

                                attackPosition:
                                    attackPosition,

                                attackRow:
                                    attackRow,

                                attackCol:
                                    attackCol,

                                sanity:
                                    room.manSanity,

                                turn:
                                    room.turn
                            }
                        );

                        sendGameOver(
                            room,
                            "man",
                            "hit"
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

                        room.lastAttackResult =
                            "bite";

                        room.manSanity -=
                            BITE_DAMAGE;

                        if(
                            room.manSanity < 0
                        ){

                            room.manSanity = 0;

                        }

                        room.biteFreeTurns = 0;

                        // ---------------------------------------------
                        // MOSQUITO WINS BY SANITY REACHING ZERO
                        // ---------------------------------------------

                        if(
                            room.manSanity <= 0
                        ){

                            sendBoth(
                                room,
                                {
                                    type:
                                        "attackResult",

                                    result:
                                        "bite",

                                    attackPosition:
                                        attackPosition,

                                    attackRow:
                                        attackRow,

                                    attackCol:
                                        attackCol,

                                    sanity:
                                        room.manSanity,

                                    turn:
                                        room.turn
                                }
                            );

                            sendGameOver(
                                room,
                                "mosquito",
                                "sanity"
                            );

                            return;

                        }

                        room.gameState =
                            "mosquitoMoveAfterBite";

                        room.mosquitoMoveReason =
                            "bite";

                        // MAN
                        send(
                            room.host,
                            {
                                type:
                                    "attackResult",

                                result:
                                    "bite",

                                attackPosition:
                                    attackPosition,

                                attackRow:
                                    attackRow,

                                attackCol:
                                    attackCol,

                                sanity:
                                    room.manSanity,

                                turn:
                                    room.turn,

                                message:
                                    "🩸 BITE! -10 Sanity."
                            }
                        );

                        // MOSQUITO
                        send(
                            room.guest,
                            {
                                type:
                                    "attackResult",

                                result:
                                    "bite",

                                attackPosition:
                                    attackPosition,

                                attackRow:
                                    attackRow,

                                attackCol:
                                    attackCol,

                                sanity:
                                    room.manSanity,

                                turn:
                                    room.turn
                            }
                        );

                        send(
                            room.guest,
                            {
                                type:
                                    "mosquitoTurn",

                                reason:
                                    "bite",

                                currentPosition:
                                    {
                                        row:
                                            mosquitoRow,

                                        col:
                                            mosquitoCol
                                    },

                                turn:
                                    room.turn
                            }
                        );

                        return;

                    }

                    // =================================================
                    // MISS
                    // =================================================

                    room.lastAttackResult =
                        "miss";

                    room.manSanity -=
                        MISS_DAMAGE;

                    if(
                        room.manSanity < 0
                    ){

                        room.manSanity = 0;

                    }

                    room.biteFreeTurns += 1;

                    // ---------------------------------------------
                    // SANITY ZERO
                    // ---------------------------------------------

                    if(
                        room.manSanity <= 0
                    ){

                        sendBoth(
                            room,
                            {
                                type:
                                    "attackResult",

                                result:
                                    "miss",

                                attackPosition:
                                    attackPosition,

                                attackRow:
                                    attackRow,

                                attackCol:
                                    attackCol,

                                sanity:
                                    room.manSanity,

                                turn:
                                    room.turn
                            }
                        );

                        sendGameOver(
                            room,
                            "mosquito",
                            "sanity"
                        );

                        return;

                    }

                    room.gameState =
                        "mosquitoMoveAfterMiss";

                    room.mosquitoMoveReason =
                        "miss";

                    // MAN
                    send(
                        room.host,
                        {
                            type:
                                "attackResult",

                            result:
                                "miss",

                            attackPosition:
                                attackPosition,

                            attackRow:
                                attackRow,

                            attackCol:
                                attackCol,

                            sanity:
                                room.manSanity,

                            turn:
                                room.turn,

                            biteFreeTurns:
                                room.biteFreeTurns
                        }
                    );

                    // MOSQUITO
                    send(
                        room.guest,
                        {
                            type:
                                "attackResult",

                            result:
                                "miss",

                            attackPosition:
                                attackPosition,

                            attackRow:
                                attackRow,

                            attackCol:
                                attackCol,

                            sanity:
                                room.manSanity,

                            turn:
                                room.turn,

                            biteFreeTurns:
                                room.biteFreeTurns
                        }
                    );

                    send(
                        room.guest,
                        {
                            type:
                                "mosquitoTurn",

                            reason:
                                "miss",

                            currentPosition:
                                {
                                    row:
                                        mosquitoRow,

                                    col:
                                        mosquitoCol
                                },

                            turn:
                                room.turn
                        }
                    );

                    return;

                }

                // =================================================
                // MOSQUITO MOVE
                // =================================================

                if(
                    data.type ===
                    "mosquitoMove"
                ){

                    const room =
                        getRoom(
                            data.roomCode
                        );

                    if(!room){

                        send(
                            socket,
                            {
                                type: "error",
                                message:
                                    "Game room not found."
                            }
                        );

                        return;

                    }

                    if(
                        socket !== room.guest ||
                        socket.role !== "mosquito"
                    ){

                        send(
                            socket,
                            {
                                type: "error",
                                message:
                                    "Only the Mosquito can move."
                            }
                        );

                        return;

                    }

                    if(
                        room.gameState !==
                            "mosquitoMoveAfterMiss" &&
                        room.gameState !==
                            "mosquitoMoveAfterBite"
                    ){

                        send(
                            socket,
                            {
                                type: "error",
                                message:
                                    "It is not the Mosquito's movement turn."
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

                                row:
                                    currentRow,

                                col:
                                    currentCol,

                                position:
                                    getPositionName(
                                        currentRow,
                                        currentCol
                                    )
                            }
                        );

                        send(
                            room.host,
                            {
                                type:
                                    "mosquitoMoved",

                                action:
                                    "stay"
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
                        Number(data.row);

                    const newCol =
                        Number(data.col);

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

                    // MISS = ORTHOGONAL
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
                                        "After a miss, move one square orthogonally."
                                }
                            );

                            return;

                        }

                    }

                    // BITE = ANYWHERE

                    room.mosquitoPosition = {

                        row:
                            newRow,

                        col:
                            newCol,

                        position:
                            getPositionName(
                                newRow,
                                newCol
                            )

                    };

                    room.gameState =
                        "manTurn";

                    room.mosquitoMoveReason =
                        null;

                    // MOSQUITO GETS SECRET POSITION
                    send(
                        room.guest,
                        {
                            type:
                                "mosquitoMoveResult",

                            action:
                                "move",

                            row:
                                newRow,

                            col:
                                newCol,

                            position:
                                room.mosquitoPosition.position
                        }
                    );

                    // MAN DOES NOT GET POSITION
                    send(
                        room.host,
                        {
                            type:
                                "mosquitoMoved",

                            action:
                                "move"
                        }
                    );

                    return;

                }

                // =================================================
                // RESTART REQUEST
                // =================================================

                if(
                    data.type ===
                    "restartGame"
                ){

                    const room =
                        getRoom(
                            data.roomCode
                        );

                    if(!room){

                        return;

                    }

                    if(
                        room.gameState !==
                            "manWon" &&
                        room.gameState !==
                            "mosquitoWon"
                    ){

                        send(
                            socket,
                            {
                                type:
                                    "error",

                                message:
                                    "The game is still running."
                            }
                        );

                        return;

                    }

                    if(
                        socket.role ===
                        "man"
                    ){

                        room.restartMan =
                            true;

                    }

                    if(
                        socket.role ===
                        "mosquito"
                    ){

                        room.restartMosquito =
                            true;

                    }

                    send(
                        socket,
                        {
                            type:
                                "restartWaiting",

                            waiting:
                                true
                        }
                    );

                    if(
                        room.restartMan &&
                        room.restartMosquito
                    ){

                        startNewRound(
                            room
                        );

                    }

                    return;

                }

                // =================================================
                // LEAVE ROOM
                // =================================================

                if(
                    data.type ===
                    "leaveRoom"
                ){

                    const room =
                        getRoom(
                            data.roomCode
                        );

                    if(!room){

                        send(
                            socket,
                            {
                                type:
                                    "leftRoom"
                            }
                        );

                        return;

                    }

                    const opponent =
                        socket === room.host
                            ? room.guest
                            : room.host;

                    send(
                        opponent,
                        {
                            type:
                                "opponentLeftRoom"
                        }
                    );

                    send(
                        socket,
                        {
                            type:
                                "leftRoom"
                        }
                    );

                    rooms.delete(
                        room.code
                    );

                    if(room.host){

                        room.host.roomCode =
                            null;

                    }

                    if(room.guest){

                        room.guest.roomCode =
                            null;

                    }

                    console.log(
                        "🚪 Room left:",
                        room.code
                    );

                    return;

                }

                // =================================================
                // UNKNOWN
                // =================================================

                send(
                    socket,
                    {
                        type:
                            "error",

                        message:
                            "Unknown message type."
                    }
                );

            }
        );

        // =================================================
        // DISCONNECT
        // =================================================

        socket.on(
            "close",
            function(){

                console.log(
                    "❌ Player disconnected."
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

                const opponent =
                    socket === room.host
                        ? room.guest
                        : room.host;

                send(
                    opponent,
                    {
                        type:
                            "opponentDisconnected"
                    }
                );

                rooms.delete(
                    code
                );

                console.log(
                    "🗑️ Room deleted:",
                    code
                );

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
