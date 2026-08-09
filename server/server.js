// ============================================================
// MAN VS MOSQUITO
// MULTIPLAYER SERVER
// ============================================================

const http = require("http");
const WebSocket = require("ws");


// ============================================================
// CONFIG
// ============================================================

const PORT =
    process.env.PORT || 8080;

const BOARD_SIZE = 6;

const INITIAL_SANITY = 100;

const MISS_DAMAGE = 1;

const BITE_DAMAGE = 10;

const GAMBLE_DAMAGE = 20;

const INITIAL_GAMBLES = 3;


// ============================================================
// HTTP SERVER
// ============================================================

const httpServer =
    http.createServer(
        function(req, res) {

            res.writeHead(
                200,
                {
                    "Content-Type":
                        "text/plain"
                }
            );

            res.end(
                "🦟 Man vs Mosquito multiplayer server is running!"
            );

        }
    );


// ============================================================
// WEBSOCKET SERVER
// ============================================================

const server =
    new WebSocket.Server({
        server: httpServer
    });


console.log(
    "🦟 Man vs Mosquito multiplayer server started!"
);


// ============================================================
// ROOMS
// ============================================================

const rooms =
    new Map();


// ============================================================
// ROOM RECONNECT TIME
// ============================================================

const RECONNECT_GRACE_MS =
    120000;


// ============================================================
// ROOM CODE
// ============================================================

function generateRoomCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code;

    do {

        code = "";

        for (
            let i = 0;
            i < 6;
            i++
        ) {

            code +=
                characters[
                    Math.floor(
                        Math.random() *
                        characters.length
                    )
                ];

        }

    }
    while (
        rooms.has(code)
    );

    return code;

}


// ============================================================
// SEND
// ============================================================

function send(
    socket,
    data
) {

    if (
        socket &&
        socket.readyState ===
        WebSocket.OPEN
    ) {

        socket.send(
            JSON.stringify(data)
        );

    }

}


// ============================================================
// SEND BOTH
// ============================================================

function sendBoth(
    room,
    data
) {

    send(
        room.host,
        data
    );

    send(
        room.guest,
        data
    );

}


// ============================================================
// POSITION
//
// IMPORTANT:
// row 0 = A
// row 1 = B
// ...
// row 5 = F
//
// col 0 = 1
// col 1 = 2
// ...
// col 5 = 6
// ============================================================

function getPositionName(
    row,
    col
) {

    return (
        String.fromCharCode(
            65 + row
        ) +
        (col + 1)
    );

}


// ============================================================
// VALID COORDINATE
// ============================================================

function isValidCoordinate(
    row,
    col
) {

    return (
        Number.isInteger(row) &&
        Number.isInteger(col) &&
        row >= 0 &&
        row < BOARD_SIZE &&
        col >= 0 &&
        col < BOARD_SIZE
    );

}


// ============================================================
// ORTHOGONAL ADJACENCY
// ============================================================

function isOrthogonallyAdjacent(
    row1,
    col1,
    row2,
    col2
) {

    return (
        Math.abs(
            row1 - row2
        ) +

        Math.abs(
            col1 - col2
        ) === 1
    );

}


// ============================================================
// GET ROOM
// ============================================================

function getRoom(
    roomCode
) {

    return rooms.get(
        String(
            roomCode || ""
        )
        .trim()
        .toUpperCase()
    );

}


// ============================================================
// RESET ROUND
// ============================================================

function resetRound(
    room
) {

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

    room.gambles =
        INITIAL_GAMBLES;

    room.mosquitoMoveReason =
        null;

    room.lastAttack =
        null;

    room.lastAttackResult =
        null;

    room.lastHintType =
        null;

    room.restartMan =
        false;

    room.restartMosquito =
        false;

    room.rejoiningMan =
        false;

    room.rejoiningMosquito =
        false;

}


// ============================================================
// SEND NEW ROUND
// ============================================================

function sendNewRound(
    room
) {

    resetRound(
        room
    );


    send(
        room.host,
        {
            type:
                "newRound",

            role:
                "man",

            roomCode:
                room.code
        }
    );


    send(
        room.guest,
        {
            type:
                "newRound",

            role:
                "mosquito",

            roomCode:
                room.code
        }
    );


    console.log(
        "🆕 New round started:",
        room.code
    );

}


// ============================================================
// GAME OVER
// ============================================================

function sendGameOver(
    room,
    winner,
    reason
) {

    room.gameState =
        winner === "man"
            ? "manWon"
            : "mosquitoWon";


    room.gameStarted =
        false;


    sendBoth(
        room,
        {
            type:
                "gameOver",

            winner:
                winner,

            reason:
                reason,

            sanity:
                room.manSanity,

            turn:
                room.turn
        }
    );


    console.log(
        "🏁 GAME OVER:",
        room.code,
        winner,
        reason
    );

}


// ============================================================
// HINT GENERATION
//
// Every 5 turns without a bite:
//
// Above 50%:
//   one true row/column.
//
// Below 50%:
//   1 truth + lies.
//
// 49-41 = 1 lie
// 40-31 = 2 lies
// 30-21 = 3 lies
// 20-11 = 4 lies
// 10-1  = 5 lies
//
// It is ALWAYS either a row OR a column.
// ============================================================

function generateHint(
    room
) {

    if (
        !room.mosquitoPosition
    ) {

        return null;

    }


    // Alternate row / column.

    const type =
        room.lastHintType === "row"
            ? "column"
            : "row";


    room.lastHintType =
        type;


    const truthValue =
        type === "row"
            ? room.mosquitoPosition.row
            : room.mosquitoPosition.col;


    const truthText =
        type === "row"
            ? "Row " +
              (truthValue + 1)

            : "Column " +
              String.fromCharCode(
                  65 + truthValue
              );


    // =========================================
    // ABOVE 50
    // =========================================

    if (
        room.manSanity >= 50
    ) {

        return {
            type:
                type,

            message:
                "🧠 Hint: " +
                truthText
        };

    }


    // =========================================
    // BELOW 50
    // =========================================

    const lieCount =
        Math.floor(
            (50 - room.manSanity) /
            10
        ) + 1;


    const lies = [];


    if (
        type === "row"
    ) {

        for (
            let row = 0;
            row < BOARD_SIZE;
            row++
        ) {

            if (
                row === truthValue
            ) {

                continue;

            }


            lies.push(
                "Row " +
                (row + 1)
            );

        }

    }

    else {

        for (
            let col = 0;
            col < BOARD_SIZE;
            col++
        ) {

            if (
                col === truthValue
            ) {

                continue;

            }


            lies.push(
                "Column " +
                String.fromCharCode(
                    65 + col
                )
            );

        }

    }


    // Shuffle lies.

    lies.sort(
        function() {

            return (
                Math.random() -
                0.5
            );

        }
    );


    const clues = [

        truthText

    ];


    for (
        let i = 0;
        i < lieCount;
        i++
    ) {

        clues.push(
            lies[i]
        );

    }


    clues.sort(
        function() {

            return (
                Math.random() -
                0.5
            );

        }
    );


    return {

        type:
            type,

        message:
            "🧠 MAD MAN'S INFORMATION:\n" +
            clues.join(
                "\n"
            )

    };

}


// ============================================================
// CREATE ROOM
// ============================================================

function createRoom(
    socket
) {

    const code =
        generateRoomCode();


    const room = {

        code:
            code,

        host:
            socket,

        guest:
            null,


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

        gambles:
            INITIAL_GAMBLES,


        mosquitoMoveReason:
            null,


        lastAttack:
            null,

        lastAttackResult:
            null,

        lastHintType:
            null,


        restartMan:
            false,

        restartMosquito:
            false,


        rejoiningMan:
            false,

        rejoiningMosquito:
            false,


        reconnectTimer:
            null

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

}


// ============================================================
// START ROOM AFTER JOIN
// ============================================================

function startRoom(
    room
) {

    resetRound(
        room
    );


    send(
        room.host,
        {
            type:
                "gameStart",

            role:
                "man",

            roomCode:
                room.code
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
                room.code
        }
    );


    console.log(
        "🎮 Game started:",
        room.code
    );

}


// ============================================================
// HANDLE CONNECTION
// ============================================================

server.on(
    "connection",
    function(socket) {

        console.log(
            "🌐 Player connected."
        );


        socket.roomCode =
            null;

        socket.role =
            null;


        // ========================================================
        // MESSAGE
        // ========================================================

        socket.on(
            "message",
            function(message) {

                let data;


                try {

                    data =
                        JSON.parse(
                            message.toString()
                        );

                }

                catch(error) {

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

                if (
                    data.type ===
                    "createRoom"
                ) {

                    createRoom(
                        socket
                    );

                    return;

                }


                // =================================================
                // JOIN ROOM
                // =================================================

                if (
                    data.type ===
                    "joinRoom"
                ) {

                    const code =
                        String(
                            data.roomCode ||
                            ""
                        )
                        .trim()
                        .toUpperCase();


                    const room =
                        rooms.get(
                            code
                        );


                    if (!room) {

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


                    if (
                        room.guest
                    ) {

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


                    startRoom(
                        room
                    );


                    return;

                }


                // =================================================
                // REJOIN ROOM
                // =================================================

                if (
                    data.type ===
                    "rejoinRoom"
                ) {

                    const code =
                        String(
                            data.roomCode ||
                            ""
                        )
                        .trim()
                        .toUpperCase();


                    const role =
                        data.role;


                    const room =
                        rooms.get(
                            code
                        );


                    if (!room) {

                        send(
                            socket,
                            {
                                type:
                                    "error",

                                message:
                                    "Restart room no longer exists."
                            }
                        );

                        return;

                    }


                    if (
                        role !== "man" &&
                        role !== "mosquito"
                    ) {

                        send(
                            socket,
                            {
                                type:
                                    "error",

                                message:
                                    "Invalid multiplayer role."
                            }
                        );

                        return;

                    }


                    // ---------------------------------------------
                    // Replace disconnected socket.
                    // ---------------------------------------------

                    if (
                        role === "man"
                    ) {

                        room.host =
                            socket;

                        room.rejoiningMan =
                            true;

                    }

                    else {

                        room.guest =
                            socket;

                        room.rejoiningMosquito =
                            true;

                    }


                    socket.roomCode =
                        code;

                    socket.role =
                        role;


                    send(
                        socket,
                        {
                            type:
                                "rejoinAccepted",

                            role:
                                role,

                            roomCode:
                                code
                        }
                    );


                    console.log(
                        "🔁 Player rejoined:",
                        code,
                        role
                    );


                    // ---------------------------------------------
                    // If both players have rejoined after restart,
                    // begin a completely fresh round.
                    // ---------------------------------------------

                    if (
                        room.rejoiningMan &&
                        room.rejoiningMosquito
                    ) {

                        room.rejoiningMan =
                            false;

                        room.rejoiningMosquito =
                            false;


                        sendNewRound(
                            room
                        );

                    }


                    return;

                }


                // =================================================
                // MOSQUITO INITIAL POSITION
                // =================================================

                if (
                    data.type ===
                    "mosquitoPosition"
                ) {

                    const room =
                        getRoom(
                            data.roomCode
                        );


                    if (!room) {

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


                    if (
                        socket !==
                            room.guest ||
                        socket.role !==
                            "mosquito"
                    ) {

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


                    if (
                        room.gameState !==
                        "mosquitoHiding"
                    ) {

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


                    const row =
                        Number(
                            data.row
                        );

                    const col =
                        Number(
                            data.col
                        );


                    if (
                        !isValidCoordinate(
                            row,
                            col
                        )
                    ) {

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


                    room.mosquitoPosition = {

                        row:
                            row,

                        col:
                            col,

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


                    room.turn =
                        0;

                    room.manSanity =
                        INITIAL_SANITY;

                    room.biteFreeTurns =
                        0;

                    room.lastHintType =
                        null;


                    console.log(
                        "🦟 Mosquito hidden:",
                        room.code,
                        room.mosquitoPosition.position
                    );


                    // Mosquito confirmation.

                    send(
                        room.guest,
                        {
                            type:
                                "mosquitoHidden",

                            sanity:
                                room.manSanity,

                            turn:
                                room.turn
                        }
                    );


                    // Man is now allowed to attack.

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
                // MAN NORMAL ATTACK
                // =================================================

                if (
                    data.type ===
                    "manAttack"
                ) {

                    const room =
                        getRoom(
                            data.roomCode
                        );


                    if (!room) {

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


                    if (
                        socket !==
                        room.host ||
                        socket.role !==
                        "man"
                    ) {

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


                    if (
                        room.gameState !==
                        "manTurn"
                    ) {

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


                    const attackRow =
                        Number(
                            data.row
                        );

                    const attackCol =
                        Number(
                            data.col
                        );


                    if (
                        !isValidCoordinate(
                            attackRow,
                            attackCol
                        )
                    ) {

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


                    const attackPosition =
                        getPositionName(
                            attackRow,
                            attackCol
                        );


                    const mosquitoRow =
                        room.mosquitoPosition.row;

                    const mosquitoCol =
                        room.mosquitoPosition.col;


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

                    if (
                        attackRow ===
                            mosquitoRow &&

                        attackCol ===
                            mosquitoCol
                    ) {

                        room.lastAttackResult =
                            "hit";


                        sendBoth(
                            room,
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

                    if (
                        isOrthogonallyAdjacent(
                            attackRow,
                            attackCol,
                            mosquitoRow,
                            mosquitoCol
                        )
                    ) {

                        room.lastAttackResult =
                            "bite";


                        room.manSanity -=
                            BITE_DAMAGE;


                        if (
                            room.manSanity < 0
                        ) {

                            room.manSanity =
                                0;

                        }


                        room.biteFreeTurns =
                            0;


                        // ---------------------------------------------
                        // SANITY ZERO
                        // ---------------------------------------------

                        if (
                            room.manSanity <= 0
                        ) {

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
                                    room.turn,

                                message:
                                    "🩸 BITE! -10 Sanity."
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
                    // NORMAL MISS
                    // =================================================

                    room.lastAttackResult =
                        "miss";


                    room.manSanity -=
                        MISS_DAMAGE;


                    if (
                        room.manSanity < 0
                    ) {

                        room.manSanity =
                            0;

                    }


                    room.biteFreeTurns +=
                        1;


                    // ---------------------------------------------
                    // SANITY ZERO
                    // ---------------------------------------------

                    if (
                        room.manSanity <= 0
                    ) {

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
                                    room.turn,

                                biteFreeTurns:
                                    room.biteFreeTurns
                            }
                        );


                        sendGameOver(
                            room,
                            "mosquito",
                            "sanity"
                        );


                        return;

                    }


                    // ---------------------------------------------
                    // SEND MISS
                    // ---------------------------------------------

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
                                room.turn,

                            biteFreeTurns:
                                room.biteFreeTurns
                        }
                    );


                    // ---------------------------------------------
                    // FIVE MISS/BITE-FREE TURNS
                    // ---------------------------------------------

                    if (
                        room.biteFreeTurns >=
                        5
                    ) {

                        const hint =
                            generateHint(
                                room
                            );


                        room.biteFreeTurns =
                            0;


                        if (
                            hint
                        ) {

                            send(
                                room.host,
                                {
                                    type:
                                        "hint",

                                    hintType:
                                        hint.type,

                                    message:
                                        hint.message
                                }
                            );

                        }

                    }


                    // ---------------------------------------------
                    // MOSQUITO MOVES
                    // ---------------------------------------------

                    room.gameState =
                        "mosquitoMoveAfterMiss";


                    room.mosquitoMoveReason =
                        "miss";


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
                // MAD MAN'S GAMBLE
                // =================================================

                if (
                    data.type ===
                    "manGamble"
                ) {

                    const room =
                        getRoom(
                            data.roomCode
                        );


                    if (!room) {

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


                    if (
                        socket !==
                        room.host ||
                        socket.role !==
                        "man"
                    ) {

                        send(
                            socket,
                            {
                                type:
                                    "error",

                                message:
                                    "Only the Man can use the Gamble."
                            }
                        );

                        return;

                    }


                    if (
                        room.gameState !==
                        "manTurn"
                    ) {

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


                    if (
                        room.gambles <= 0
                    ) {

                        send(
                            socket,
                            {
                                type:
                                    "error",

                                message:
                                    "No Gambles remaining."
                            }
                        );

                        return;

                    }


                    const topRow =
                        Number(
                            data.row
                        );

                    const leftCol =
                        Number(
                            data.col
                        );


                    // Top-left must be A1-E5.

                    if (
                        !isValidCoordinate(
                            topRow,
                            leftCol
                        ) ||

                        topRow > 4 ||
                        leftCol > 4
                    ) {

                        send(
                            socket,
                            {
                                type:
                                    "error",

                                message:
                                    "Gamble top-left must be A1-E5."
                            }
                        );

                        return;

                    }


                    room.gambles -=
                        1;


                    room.turn +=
                        1;


                    room.lastAttack = {

                        row:
                            topRow,

                        col:
                            leftCol,

                        position:
                            getPositionName(
                                topRow,
                                leftCol
                            )

                    };


                    const gambleArea = [

                        [
                            topRow,
                            leftCol
                        ],

                        [
                            topRow,
                            leftCol + 1
                        ],

                        [
                            topRow + 1,
                            leftCol
                        ],

                        [
                            topRow + 1,
                            leftCol + 1
                        ]

                    ];


                    const gambleHit =
                        gambleArea.some(
                            function(cell) {

                                return (
                                    cell[0] ===
                                        room.mosquitoPosition.row &&

                                    cell[1] ===
                                        room.mosquitoPosition.col
                                );

                            }
                        );


                    // =================================================
                    // GAMBLE HIT
                    // =================================================

                    if (
                        gambleHit
                    ) {

                        room.lastAttackResult =
                            "gambleHit";


                        sendBoth(
                            room,
                            {
                                type:
                                    "attackResult",

                                result:
                                    "gambleHit",

                                attackRow:
                                    topRow,

                                attackCol:
                                    leftCol,

                                sanity:
                                    room.manSanity,

                                turn:
                                    room.turn,

                                gambles:
                                    room.gambles
                            }
                        );


                        sendGameOver(
                            room,
                            "man",
                            "gamble"
                        );


                        return;

                    }


                    // =================================================
                    // GAMBLE MISS
                    // =================================================

                    room.lastAttackResult =
                        "gambleMiss";


                    room.manSanity -=
                        GAMBLE_DAMAGE;


                    if (
                        room.manSanity < 0
                    ) {

                        room.manSanity =
                            0;

                    }


                    // Gamble miss does NOT count as
                    // one of the normal five bite-free turns.

                    room.biteFreeTurns =
                        room.biteFreeTurns;


                    sendBoth(
                        room,
                        {
                            type:
                                "attackResult",

                            result:
                                "gambleMiss",

                            attackRow:
                                topRow,

                            attackCol:
                                leftCol,

                            sanity:
                                room.manSanity,

                            turn:
                                room.turn,

                            gambles:
                                room.gambles,

                            biteFreeTurns:
                                room.biteFreeTurns
                        }
                    );


                    // ---------------------------------------------
                    // SANITY ZERO
                    // ---------------------------------------------

                    if (
                        room.manSanity <= 0
                    ) {

                        sendGameOver(
                            room,
                            "mosquito",
                            "sanity"
                        );

                        return;

                    }


                    // ---------------------------------------------
                    // MOSQUITO MOVES
                    // ---------------------------------------------

                    room.gameState =
                        "mosquitoMoveAfterMiss";


                    room.mosquitoMoveReason =
                        "miss";


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
                                        room.mosquitoPosition.row,

                                    col:
                                        room.mosquitoPosition.col
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

                if (
                    data.type ===
                    "mosquitoMove"
                ) {

                    const room =
                        getRoom(
                            data.roomCode
                        );


                    if (!room) {

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


                    if (
                        socket !==
                        room.guest ||
                        socket.role !==
                        "mosquito"
                    ) {

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


                    if (
                        room.gameState !==
                            "mosquitoMoveAfterMiss" &&

                        room.gameState !==
                            "mosquitoMoveAfterBite"
                    ) {

                        send(
                            socket,
                            {
                                type:
                                    "error",

                                message:
                                    "The Mosquito cannot move right now."
                            }
                        );

                        return;

                    }


                    const reason =
                        room.mosquitoMoveReason;


                    // =================================================
                    // STAY
                    // =================================================

                    if (
                        data.action ===
                        "stay"
                    ) {

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
                                    room.mosquitoPosition.row,

                                col:
                                    room.mosquitoPosition.col,

                                position:
                                    room.mosquitoPosition.position
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

                    if (
                        data.action !==
                        "move"
                    ) {

                        send(
                            socket,
                            {
                                type:
                                    "error",

                                message:
                                    "Invalid mosquito movement."
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


                    if (
                        !isValidCoordinate(
                            newRow,
                            newCol
                        )
                    ) {

                        send(
                            socket,
                            {
                                type:
                                    "error",

                                message:
                                    "Invalid mosquito destination."
                            }
                        );

                        return;

                    }


                    const oldRow =
                        room.mosquitoPosition.row;

                    const oldCol =
                        room.mosquitoPosition.col;


                    // ---------------------------------------------
                    // AFTER NORMAL MISS:
                    // ORTHOGONAL ONLY
                    // ---------------------------------------------

                    if (
                        reason ===
                        "miss"
                    ) {

                        if (
                            !isOrthogonallyAdjacent(
                                oldRow,
                                oldCol,
                                newRow,
                                newCol
                            )
                        ) {

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


                    // ---------------------------------------------
                    // AFTER BITE:
                    // ANYWHERE
                    // ---------------------------------------------

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


                    // Mosquito gets exact position.

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


                    // Man only gets "moved".

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
                // RESTART
                //
                // BOTH PLAYERS MUST CLICK RESTART.
                // =================================================

                if (
                    data.type ===
                    "restartGame"
                ) {

                    const room =
                        getRoom(
                            data.roomCode
                        );


                    if (!room) {

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


                    if (
                        room.gameState !==
                            "manWon" &&

                        room.gameState !==
                            "mosquitoWon"
                    ) {

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


                    if (
                        socket.role ===
                        "man"
                    ) {

                        room.restartMan =
                            true;

                    }


                    if (
                        socket.role ===
                        "mosquito"
                    ) {

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


                    console.log(
                        "🔄 Restart request:",
                        room.code,
                        "Man:",
                        room.restartMan,
                        "Mosquito:",
                        room.restartMosquito
                    );


                    // ---------------------------------------------
                    // BOTH READY
                    // ---------------------------------------------

                    if (
                        room.restartMan &&
                        room.restartMosquito
                    ) {

                        // Do NOT simply reset the room here.
                        //
                        // The client is going to reload and
                        // rejoin through sessionStorage.
                        //
                        // Keep the room alive.

                        sendBoth(
                            room,
                            {
                                type:
                                    "restartNow"
                            }
                        );


                        console.log(
                            "🔄 BOTH PLAYERS READY FOR RESTART:",
                            room.code
                        );

                    }


                    return;

                }


                // =================================================
                // LEAVE ROOM
                // =================================================

                if (
                    data.type ===
                    "leaveRoom"
                ) {

                    const room =
                        getRoom(
                            data.roomCode
                        );


                    if (!room) {

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


                    if (
                        room.host
                    ) {

                        room.host.roomCode =
                            null;

                    }


                    if (
                        room.guest
                    ) {

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
                // UNKNOWN MESSAGE
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


        // ========================================================
        // DISCONNECT
        // ========================================================

        socket.on(
            "close",
            function() {

                console.log(
                    "❌ Player disconnected."
                );


                const code =
                    socket.roomCode;


                if (!code) {

                    return;

                }


                const room =
                    rooms.get(
                        code
                    );


                if (!room) {

                    return;

                }


                const role =
                    socket.role;


                // ---------------------------------------------
                // Keep room alive for restart/reconnect.
                // ---------------------------------------------

                if (
                    role === "man"
                ) {

                    room.host =
                        null;

                }


                if (
                    role === "mosquito"
                ) {

                    room.guest =
                        null;

                }


                const opponent =
                    role === "man"
                        ? room.guest
                        : room.host;


                send(
                    opponent,
                    {
                        type:
                            "opponentDisconnected"
                    }
                );


                // ---------------------------------------------
                // Don't destroy room immediately.
                //
                // This is important because multiplayer.js
                // performs a real page reload during restart
                // and then sends rejoinRoom.
                // ---------------------------------------------

                if (
                    room.reconnectTimer
                ) {

                    clearTimeout(
                        room.reconnectTimer
                    );

                }


                room.reconnectTimer =
                    setTimeout(
                        function() {

                            // If the missing player still
                            // hasn't returned, delete room.

                            if (
                                !room.host ||
                                !room.guest
                            ) {

                                rooms.delete(
                                    room.code
                                );

                                console.log(
                                    "🗑️ Room expired:",
                                    room.code
                                );

                            }

                        },
                        RECONNECT_GRACE_MS
                    );


            }
        );

    }
);


// ============================================================
// START SERVER
// ============================================================

httpServer.listen(
    PORT,
    "0.0.0.0",
    function() {

        console.log(
            "🌐 Server listening on 0.0.0.0:" +
            PORT
        );

    }
);
