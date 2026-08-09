// ===================================================
// MAN VS MOSQUITO
// MULTIPLAYER SERVER
// ===================================================

const http = require("http");
const WebSocket = require("ws");


// ===================================================
// CONFIG
// ===================================================

const PORT =
    process.env.PORT || 8080;

const BOARD_SIZE =
    6;

const INITIAL_SANITY =
    100;

const BITE_DAMAGE =
    10;

const MISS_DAMAGE =
    1;

const INITIAL_GAMBLES =
    3;


// ===================================================
// HTTP
// ===================================================

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


// ===================================================
// WEBSOCKET
// ===================================================

const server =
    new WebSocket.Server({
        server:
            httpServer
    });


console.log(
    "🦟 Multiplayer server started."
);


// ===================================================
// ROOMS
// ===================================================

const rooms =
    new Map();


// ===================================================
// ROOM CODE
// ===================================================

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


// ===================================================
// SEND
// ===================================================

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


// ===================================================
// SEND BOTH
// ===================================================

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


// ===================================================
// POSITION
// ===================================================

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


// ===================================================
// VALID COORDINATE
// ===================================================

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


// ===================================================
// ORTHOGONAL
// ===================================================

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


// ===================================================
// ROOM
// ===================================================

function getRoom(code) {

    return rooms.get(
        String(
            code || ""
        )
        .trim()
        .toUpperCase()
    );

}


// ===================================================
// RESET ROUND
// ===================================================

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

    room.restartMan =
        false;

    room.restartMosquito =
        false;

    room.restarting =
        false;

    room.reconnectTimer =
        null;

}


// ===================================================
// START NEW ROUND
// ===================================================

function startNewRound(
    room
) {

    console.log(
        "🆕 STARTING COMPLETELY FRESH ROUND:",
        room.code
    );

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

}


// ===================================================
// GAME OVER
// ===================================================

function sendGameOver(
    room,
    winner,
    reason
) {

    room.gameState =
        winner === "man"
            ? "manWon"
            : "mosquitoWon";

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

}


// ===================================================
// HINT GENERATOR
// ===================================================
//
// BOARD ORIENTATION:
//
//        1  2  3  4  5  6
//     A  A1 A2 A3 A4 A5 A6
//     B  B1 B2 B3 B4 B5 B6
//     C  C1 C2 C3 C4 C5 C6
//     D  D1 D2 D3 D4 D5 D6
//     E  E1 E2 E3 E4 E5 E6
//     F  F1 F2 F3 F4 F5 F6
//
// row = letter
// col = number
//
// Every 5 turns without a bite:
//
// >= 50 sanity:
//     ONE true row OR column
//
// < 50 sanity:
//     ONE truth + lies
//
// 49-40 = 1 lie
// 39-30 = 2 lies
// 29-20 = 3 lies
// 19-10 = 4 lies
// 9-0   = 5 lies
//
// ===================================================

function generateHint(
    room
) {

    const row =
        room.mosquitoPosition.row;

    const col =
        room.mosquitoPosition.col;

    const letters =
        "ABCDEF";


    // =================================================
    // CORRECT COORDINATE ORIENTATION
    // =================================================

    const trueRow =
        "Row " +
        letters[row];

    const trueColumn =
        "Column " +
        (col + 1);


    const truths = [

        trueRow,

        trueColumn

    ];


    // =================================================
    // 50% OR ABOVE
    // =================================================

    if (
        room.manSanity >=
        50
    ) {

        const truth =
            truths[
                Math.floor(
                    Math.random() *
                    truths.length
                )
            ];


        return {

            type:
                "hint",

            message:
                "🦟 Fine...\n" +
                truth

        };

    }


    // =================================================
    // GENERATE LIES
    // =================================================

    const lies = [];


    // -------------------------------------------------
    // ROW LIES
    // -------------------------------------------------

    for (
        let r = 0;
        r < BOARD_SIZE;
        r++
    ) {

        if (
            r !== row
        ) {

            lies.push(
                "Row " +
                letters[r]
            );

        }

    }


    // -------------------------------------------------
    // COLUMN LIES
    // -------------------------------------------------

    for (
        let c = 0;
        c < BOARD_SIZE;
        c++
    ) {

        if (
            c !== col
        ) {

            lies.push(
                "Column " +
                (c + 1)
            );

        }

    }


    // =================================================
    // NUMBER OF LIES
    // =================================================

    const lieCount =
        Math.floor(
            (49 - room.manSanity) /
            10
        ) + 1;


    // =================================================
    // SHUFFLE LIES
    // =================================================

    lies.sort(
        function() {

            return (
                Math.random() -
                0.5
            );

        }
    );


    // =================================================
    // ONE TRUE CLUE
    // =================================================

    const clues = [

        truths[
            Math.floor(
                Math.random() *
                truths.length
            )
        ]

    ];


    // =================================================
    // ADD LIES
    // =================================================

    for (
        let i = 0;
        i < lieCount;
        i++
    ) {

        if (
            lies[i]
        ) {

            clues.push(
                lies[i]
            );

        }

    }


    // =================================================
    // SHUFFLE TRUTH + LIES
    // =================================================

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
            "hint",

        message:
            "🦟 Hmm... Maybe this helps...\n\n" +
            clues.join("\n")

    };

}


// ===================================================
// CONNECTION
// ===================================================

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


        // =================================================
        // MESSAGE
        // =================================================

        socket.on(
            "message",
            function(rawMessage) {

                let data;


                try {

                    data =
                        JSON.parse(
                            rawMessage.toString()
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

                        restartMan:
                            false,

                        restartMosquito:
                            false,

                        restarting:
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


                    resetRound(
                        room
                    );


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
                                "playerJoined"
                        }
                    );


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
                        "🎮 Game started:",
                        code
                    );


                    return;

                }


                // =================================================
                // REJOIN AFTER RESTART
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


                    if (
                        role === "man"
                    ) {

                        room.host =
                            socket;

                    }
                    else {

                        room.guest =
                            socket;

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

                            roomCode:
                                code,

                            role:
                                role
                        }
                    );


                    console.log(
                        "🔁 Player rejoined:",
                        code,
                        role
                    );


                    if (
                        room.host &&
                        room.guest
                    ) {

                        if (
                            room.reconnectTimer
                        ) {

                            clearTimeout(
                                room.reconnectTimer
                            );

                            room.reconnectTimer =
                                null;

                        }


                        startNewRound(
                            room
                        );

                    }


                    return;

                }


                // =================================================
                // MOSQUITO POSITION
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
                        return;
                    }


                    if (
                        socket !==
                        room.guest
                    ) {

                        send(
                            socket,
                            {
                                type:
                                    "error",

                                message:
                                    "Only the Mosquito can hide."
                            }
                        );

                        return;

                    }


                    if (
                        room.gameState !==
                        "mosquitoHiding"
                    ) {

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
                                "mosquitoReady",

                            sanity:
                                room.manSanity,

                            turn:
                                room.turn
                        }
                    );


                    console.log(
                        "🦟 Mosquito hidden:",
                        room.mosquitoPosition.position
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
                        return;
                    }


                    if (
                        socket !==
                        room.host
                    ) {
                        return;
                    }


                    if (
                        room.gameState !==
                        "manTurn"
                    ) {

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


                    const mosquitoRow =
                        room.mosquitoPosition.row;

                    const mosquitoCol =
                        room.mosquitoPosition.col;


                    const attackPosition =
                        getPositionName(
                            attackRow,
                            attackCol
                        );


                    room.turn++;


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

                                attackRow:
                                    attackRow,

                                attackCol:
                                    attackCol,

                                attackPosition:
                                    attackPosition,

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


                        if (
                            room.manSanity <=
                            0
                        ) {

                            sendBoth(
                                room,
                                {
                                    type:
                                        "attackResult",

                                    result:
                                        "bite",

                                    attackRow:
                                        attackRow,

                                    attackCol:
                                        attackCol,

                                    attackPosition:
                                        attackPosition,

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

                                attackRow:
                                    attackRow,

                                attackCol:
                                    attackCol,

                                attackPosition:
                                    attackPosition,

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


                    room.biteFreeTurns++;


                    // =================================================
                    // SANITY ZERO
                    // =================================================

                    if (
                        room.manSanity <=
                        0
                    ) {

                        sendBoth(
                            room,
                            {
                                type:
                                    "attackResult",

                                result:
                                    "miss",

                                attackRow:
                                    attackRow,

                                attackCol:
                                    attackCol,

                                attackPosition:
                                    attackPosition,

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


                    // =================================================
                    // EVERY 5 MISS COUNTER
                    // =================================================

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


                        room.gameState =
                            "mosquitoMoveAfterMiss";

                        room.mosquitoMoveReason =
                            "miss";


                        sendBoth(
                            room,
                            {
                                type:
                                    "attackResult",

                                result:
                                    "miss",

                                attackRow:
                                    attackRow,

                                attackCol:
                                    attackCol,

                                attackPosition:
                                    attackPosition,

                                sanity:
                                    room.manSanity,

                                turn:
                                    room.turn,

                                biteFreeTurns:
                                    0
                            }
                        );


                        // Hint goes to Man.
                        send(
                            room.host,
                            hint
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


                        console.log(
                            "🔎 FIVE MISS HINT:",
                            room.code,
                            hint.message
                        );


                        return;

                    }


                    // =================================================
                    // NORMAL MISS
                    // =================================================

                    room.gameState =
                        "mosquitoMoveAfterMiss";

                    room.mosquitoMoveReason =
                        "miss";


                    sendBoth(
                        room,
                        {
                            type:
                                "attackResult",

                            result:
                                "miss",

                            attackRow:
                                attackRow,

                            attackCol:
                                attackCol,

                            attackPosition:
                                attackPosition,

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
                        return;
                    }


                    if (
                        socket !==
                        room.host
                    ) {
                        return;
                    }


                    if (
                        room.gameState !==
                        "manTurn"
                    ) {
                        return;
                    }


                    if (
                        room.gambles <=
                        0
                    ) {

                        send(
                            socket,
                            {
                                type:
                                    "error",

                                message:
                                    "No Gambles Remaining."
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


                    if (
                        topRow < 0 ||
                        topRow > 4 ||
                        leftCol < 0 ||
                        leftCol > 4
                    ) {

                        send(
                            socket,
                            {
                                type:
                                    "error",

                                message:
                                    "Choose a top-left square from A1 to E5."
                            }
                        );

                        return;

                    }


                    room.gambles--;

                    room.turn++;


                    const mosquitoRow =
                        room.mosquitoPosition.row;

                    const mosquitoCol =
                        room.mosquitoPosition.col;


                    const area = [

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


                    const hit =
                        area.some(
                            function(position) {

                                return (
                                    position[0] ===
                                        mosquitoRow &&
                                    position[1] ===
                                        mosquitoCol
                                );

                            }
                        );


                    // =================================================
                    // GAMBLE HIT
                    // =================================================

                    if (hit) {

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
                        20;


                    if (
                        room.manSanity < 0
                    ) {

                        room.manSanity =
                            0;

                    }


                    if (
                        room.manSanity <=
                        0
                    ) {

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
                                    room.gambles
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
                                room.gambles
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

                if (
                    data.type ===
                    "mosquitoMove"
                ) {

                    const room =
                        getRoom(
                            data.roomCode
                        );


                    if (!room) {
                        return;
                    }


                    if (
                        socket !==
                        room.guest
                    ) {
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
                            data.action ||
                            ""
                        )
                        .trim()
                        .toLowerCase();


                    // =================================================
                    // STAY
                    // =================================================

                    if (
                        action ===
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

                    if (
                        action !==
                        "move"
                    ) {

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
                                    "Invalid movement position."
                            }
                        );

                        return;

                    }


                    // =================================================
                    // AFTER MISS:
                    // ONE ORTHOGONAL SQUARE ONLY
                    // =================================================

                    if (
                        reason ===
                        "miss"
                    ) {

                        if (
                            !isOrthogonallyAdjacent(
                                currentRow,
                                currentCol,
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


                    // =================================================
                    // AFTER BITE:
                    // ANYWHERE
                    // =================================================

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
                                    "Game is still running."
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


                    console.log(
                        "🔄 Restart request:",
                        room.code,
                        "Man:",
                        room.restartMan,
                        "Mosquito:",
                        room.restartMosquito
                    );


                    send(
                        socket,
                        {
                            type:
                                "restartWaiting"
                        }
                    );


                    if (
                        room.restartMan &&
                        room.restartMosquito
                    ) {

                        room.restarting =
                            true;


                        console.log(
                            "🔄 BOTH PLAYERS READY:",
                            room.code
                        );


                        sendBoth(
                            room,
                            {
                                type:
                                    "restartNow",

                                roomCode:
                                    room.code
                            }
                        );


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

                                    const currentRoom =
                                        rooms.get(
                                            room.code
                                        );


                                    if (
                                        !currentRoom
                                    ) {

                                        return;

                                    }


                                    if (
                                        currentRoom.restarting
                                    ) {

                                        console.log(
                                            "⏱️ Restart reconnect timeout:",
                                            currentRoom.code
                                        );


                                        send(
                                            currentRoom.host,
                                            {
                                                type:
                                                    "error",

                                                message:
                                                    "Restart timed out. Please create a new room."
                                            }
                                        );


                                        send(
                                            currentRoom.guest,
                                            {
                                                type:
                                                    "error",

                                                message:
                                                    "Restart timed out. Please create a new room."
                                            }
                                        );


                                        rooms.delete(
                                            currentRoom.code
                                        );

                                    }

                                },
                                30000
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
                        socket ===
                            room.host
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


                    if (
                        room.reconnectTimer
                    ) {

                        clearTimeout(
                            room.reconnectTimer
                        );

                    }


                    rooms.delete(
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
                            "Unknown message type: " +
                            data.type
                    }
                );

            }
        );


        // =================================================
        // DISCONNECT
        // =================================================

        socket.on(
            "close",
            function() {

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


                console.log(
                    "❌ Player disconnected:",
                    code,
                    socket.role
                );


                // =================================================
                // DURING RESTART
                // KEEP ROOM ALIVE
                // =================================================

                if (
                    room.restarting
                ) {

                    if (
                        socket ===
                        room.host
                    ) {

                        room.host =
                            null;

                    }


                    if (
                        socket ===
                        room.guest
                    ) {

                        room.guest =
                            null;

                    }


                    console.log(
                        "🔄 Socket disconnected for restart. Room preserved:",
                        code
                    );


                    return;

                }


                // =================================================
                // NORMAL DISCONNECT
                // =================================================

                const opponent =
                    socket ===
                        room.host
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
    function() {

        console.log(
            "🌐 Server listening on port:",
            PORT
        );

    }
);
