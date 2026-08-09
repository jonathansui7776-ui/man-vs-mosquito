// =========================================================
// MAN VS MOSQUITO
// MULTIPLAYER.JS
// =========================================================


// =========================================================
// WEBSOCKET
// =========================================================

const mpSocket = new WebSocket(
    "wss://man-vs-mosquito.onrender.com"
);


// =========================================================
// GLOBAL STATE
// =========================================================

window.multiplayerRole = null;
window.multiplayerRoomCode = null;
window.multiplayerConnected = false;

window.multiplayerMosquitoReady = false;
window.multiplayerManReady = false;


// =========================================================
// GAME STATE
// =========================================================

let mpManCanAttack = false;
let mpWaitingForAttackResult = false;

let mpManSanity = 100;
let mpManTurn = 1;

let mpBiteFreeTurns = 0;


// =========================================================
// MOSQUITO MOVEMENT STATE
// =========================================================

let mpMosquitoCanMove = false;

let mpMosquitoMoveReason = null;

let mpMosquitoCurrentRow = null;
let mpMosquitoCurrentCol = null;

let mpMosquitoSelectedCell = null;


// =========================================================
// BOARD
// =========================================================

const MP_ROWS = 6;
const MP_COLS = 6;


// =========================================================
// LOBBY
// =========================================================

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


// =========================================================
// SCREENS
// =========================================================

const mpManScreen =
    document.getElementById(
        "multiplayerManScreen"
    );

const mpMosquitoScreen =
    document.getElementById(
        "multiplayerMosquitoScreen"
    );


// =========================================================
// BOARDS
// =========================================================

const mpManBoard =
    document.getElementById(
        "multiplayerManBoard"
    );

const mpMosquitoBoard =
    document.getElementById(
        "multiplayerMosquitoBoard"
    );


// =========================================================
// ORIGINAL HIDE BUTTON
// =========================================================

const mpHideBtn =
    document.getElementById(
        "multiplayerHideBtn"
    );


// =========================================================
// STATUS
// =========================================================

const mpManStatus =
    document.getElementById(
        "mpManStatus"
    );

const mpMosquitoStatus =
    document.getElementById(
        "mpMosquitoStatus"
    );

const mpMosquitoMovementStatus =
    document.getElementById(
        "multiplayerMosquitoMovementStatus"
    );


// =========================================================
// MOVEMENT CONTROLS
// =========================================================

let mpMosquitoControls = null;

let mpStayBtn = null;

let mpMoveBtn = null;


// =========================================================
// POSITION
// =========================================================

function mpPosition(
    row,
    col
){

    return (
        String.fromCharCode(
            65 + row
        ) +
        (col + 1)
    );

}


// =========================================================
// SEND
// =========================================================

function mpSend(data){

    if(
        mpSocket.readyState !==
        WebSocket.OPEN
    ){

        console.error(
            "❌ Multiplayer socket is not open."
        );

        return false;

    }


    console.log(
        "📤 Client:",
        data
    );


    mpSocket.send(
        JSON.stringify(
            data
        )
    );


    return true;

}


// =========================================================
// HIDE SCREENS
// =========================================================

function hideAllMultiplayerScreens(){

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


// =========================================================
// HIDE NORMAL SCREENS
// =========================================================

function hideNormalGameScreens(){

    const gameScreen =
        document.getElementById(
            "gameScreen"
        );

    const mosquitoGameScreen =
        document.getElementById(
            "mosquitoGameScreen"
        );


    if(gameScreen){

        gameScreen.classList.add(
            "hidden"
        );

    }


    if(mosquitoGameScreen){

        mosquitoGameScreen.classList.add(
            "hidden"
        );

    }

}


// =========================================================
// BOARD STYLE
// =========================================================

function setupMultiplayerBoardStyle(
    board
){

    if(!board){

        return;

    }


    board.style.setProperty(
        "display",
        "grid",
        "important"
    );


    board.style.setProperty(
        "grid-template-columns",
        "repeat(6, 70px)",
        "important"
    );


    board.style.setProperty(
        "grid-template-rows",
        "repeat(6, 70px)",
        "important"
    );


    board.style.setProperty(
        "grid-auto-flow",
        "row",
        "important"
    );


    board.style.setProperty(
        "gap",
        "5px",
        "important"
    );


    board.style.setProperty(
        "width",
        "445px",
        "important"
    );


    board.style.setProperty(
        "height",
        "445px",
        "important"
    );


    board.style.setProperty(
        "margin",
        "0 auto",
        "important"
    );


    board.style.setProperty(
        "padding",
        "0",
        "important"
    );


    board.style.setProperty(
        "box-sizing",
        "border-box",
        "important"
    );

}


// =========================================================
// CELL STYLE
// =========================================================

function setupMultiplayerCell(
    cell
){

    cell.style.setProperty(
        "width",
        "70px",
        "important"
    );


    cell.style.setProperty(
        "height",
        "70px",
        "important"
    );


    cell.style.setProperty(
        "box-sizing",
        "border-box",
        "important"
    );


    cell.style.display =
        "flex";

    cell.style.alignItems =
        "center";

    cell.style.justifyContent =
        "center";

    cell.style.cursor =
        "pointer";

    cell.style.userSelect =
        "none";

    cell.style.fontWeight =
        "bold";

    cell.style.fontSize =
        "18px";

}


// =========================================================
// CREATE CELL
// =========================================================

function createMultiplayerCell(
    row,
    col
){

    const cell =
        document.createElement(
            "div"
        );


    cell.className =
        "multiplayerCell";


    const position =
        mpPosition(
            row,
            col
        );


    cell.dataset.row =
        row;

    cell.dataset.col =
        col;

    cell.dataset.position =
        position;


    cell.innerText =
        position;


    setupMultiplayerCell(
        cell
    );


    return cell;

}


// =========================================================
// CREATE MAN BOARD
// =========================================================

function createMultiplayerManBoard(){

    if(!mpManBoard){

        console.error(
            "❌ multiplayerManBoard not found."
        );

        return;

    }


    mpManBoard.innerHTML =
        "";


    setupMultiplayerBoardStyle(
        mpManBoard
    );


    for(
        let row = 0;
        row < MP_ROWS;
        row++
    ){

        for(
            let col = 0;
            col < MP_COLS;
            col++
        ){

            const cell =
                createMultiplayerCell(
                    row,
                    col
                );


            cell.addEventListener(
                "click",
                function(){

                    selectManCell(
                        cell
                    );

                }
            );


            mpManBoard.appendChild(
                cell
            );

        }

    }


    mpManBoard.style.pointerEvents =
        "none";

    mpManBoard.style.opacity =
        "0.55";


    console.log(
        "🧍 6×6 MULTIPLAYER MAN BOARD CREATED"
    );

}


// =========================================================
// CREATE MOSQUITO BOARD
// =========================================================

function createMultiplayerMosquitoBoard(){

    if(!mpMosquitoBoard){

        console.error(
            "❌ multiplayerMosquitoBoard not found."
        );

        return;

    }


    mpMosquitoBoard.innerHTML =
        "";


    setupMultiplayerBoardStyle(
        mpMosquitoBoard
    );


    for(
        let row = 0;
        row < MP_ROWS;
        row++
    ){

        for(
            let col = 0;
            col < MP_COLS;
            col++
        ){

            const cell =
                createMultiplayerCell(
                    row,
                    col
                );


            cell.addEventListener(
                "click",
                function(){

                    selectMosquitoCell(
                        cell
                    );

                }
            );


            mpMosquitoBoard.appendChild(
                cell
            );

        }

    }


    console.log(
        "🦟 6×6 MULTIPLAYER MOSQUITO BOARD CREATED"
    );

}


// =========================================================
// MAN SELECT / ATTACK
// =========================================================

function selectManCell(
    cell
){

    if(
        !window.multiplayerManReady
    ){

        return;

    }


    if(
        !mpManCanAttack
    ){

        return;

    }


    if(
        mpWaitingForAttackResult
    ){

        return;

    }


    const row =
        Number(
            cell.dataset.row
        );


    const col =
        Number(
            cell.dataset.col
        );


    const position =
        cell.dataset.position;


    console.log(
        "🧍 MAN SELECTED:",
        position
    );


    // ---------------------------------------------
    // VISUAL SELECTION
    // ---------------------------------------------

    const oldSelected =
        mpManBoard.querySelector(
            ".selected"
        );


    if(oldSelected){

        oldSelected.classList.remove(
            "selected"
        );

    }


    cell.classList.add(
        "selected"
    );


    // ---------------------------------------------
    // LOCK
    // ---------------------------------------------

    mpManCanAttack =
        false;

    mpWaitingForAttackResult =
        true;


    mpManBoard.style.pointerEvents =
        "none";


    if(mpManStatus){

        mpManStatus.innerText =
            "⚔️ Attacking " +
            position +
            "...";

    }


    // ---------------------------------------------
    // SEND
    // ---------------------------------------------

    const sent =
        mpSend({

            type:
                "manAttack",

            roomCode:
                window.multiplayerRoomCode,

            row:
                row,

            col:
                col

        });


    if(!sent){

        mpManCanAttack =
            true;

        mpWaitingForAttackResult =
            false;


        mpManBoard.style.pointerEvents =
            "auto";

    }

}


// =========================================================
// MOSQUITO INITIAL SELECTION
// =========================================================

function selectMosquitoCell(
    cell
){

    // ---------------------------------------------
    // INITIAL HIDING
    // ---------------------------------------------

    if(
        !window.multiplayerMosquitoReady &&
        !mpMosquitoCanMove
    ){

        const oldSelected =
            mpMosquitoBoard.querySelector(
                ".selected"
            );


        if(oldSelected){

            oldSelected.classList.remove(
                "selected"
            );

        }


        cell.classList.add(
            "selected"
        );


        mpMosquitoSelectedCell =
            cell;


        if(mpHideBtn){

            mpHideBtn.disabled =
                false;

        }


        const position =
            cell.dataset.position;


        if(mpMosquitoStatus){

            mpMosquitoStatus.innerText =
                "Selected hiding place: " +
                position;

        }


        console.log(
            "🦟 MOSQUITO SELECTED:",
            position
        );


        return;

    }


    // ---------------------------------------------
    // MOVEMENT
    // ---------------------------------------------

    if(
        mpMosquitoCanMove
    ){

        selectMosquitoMovementCell(
            cell
        );

    }

}


// =========================================================
// SELECT MOVEMENT CELL
// =========================================================

function selectMosquitoMovementCell(
    cell
){

    if(
        !mpMosquitoCanMove
    ){

        return;

    }


    const row =
        Number(
            cell.dataset.row
        );


    const col =
        Number(
            cell.dataset.col
        );


    // ---------------------------------------------
    // BITE
    // ANYWHERE IS VALID
    // ---------------------------------------------

    if(
        mpMosquitoMoveReason ===
        "bite"
    ){

        selectMovementCellVisual(
            cell
        );


        return;

    }


    // ---------------------------------------------
    // MISS
    // ORTHOGONAL ONLY
    // ---------------------------------------------

    if(
        mpMosquitoMoveReason ===
        "miss"
    ){

        const distance =
            Math.abs(
                row -
                mpMosquitoCurrentRow
            ) +
            Math.abs(
                col -
                mpMosquitoCurrentCol
            );


        if(
            distance !==
            1
        ){

            if(
                mpMosquitoMovementStatus
            ){

                mpMosquitoMovementStatus.innerText =
                    "❌ After a miss, you can only move one square up, down, left or right.";

            }


            return;

        }


        selectMovementCellVisual(
            cell
        );

    }

}


// =========================================================
// MOVEMENT VISUAL
// =========================================================

function selectMovementCellVisual(
    cell
){

    const oldSelected =
        mpMosquitoBoard.querySelector(
            ".movementSelected"
        );


    if(oldSelected){

        oldSelected.classList.remove(
            "movementSelected"
        );

    }


    cell.classList.add(
        "movementSelected"
    );


    mpMosquitoSelectedCell =
        cell;


    if(mpMoveBtn){

        mpMoveBtn.disabled =
            false;

    }


    if(mpMosquitoMovementStatus){

        mpMosquitoMovementStatus.innerText =
            "Selected " +
            cell.dataset.position +
            ". Press Move.";

    }


    console.log(
        "🦟 MOSQUITO MOVE SELECTED:",
        cell.dataset.position
    );

}


// =========================================================
// ACTIVATE MAN
// =========================================================

function activateManBoard(){

    window.multiplayerManReady =
        true;


    mpManCanAttack =
        true;

    mpWaitingForAttackResult =
        false;


    if(mpManBoard){

        mpManBoard.style.pointerEvents =
            "auto";

        mpManBoard.style.opacity =
            "1";

    }


    if(mpManStatus){

        mpManStatus.innerText =
            "🦟 Mosquito is hidden. Attack a square!";

    }


    console.log(
        "🧍 MAN BOARD ACTIVATED"
    );

}


// =========================================================
// CREATE MOVEMENT CONTROLS
// =========================================================

function createMosquitoMovementControls(){

    if(
        mpMosquitoControls
    ){

        return;

    }


    mpMosquitoControls =
        document.createElement(
            "div"
        );


    mpMosquitoControls.id =
        "multiplayerMosquitoControls";


    mpMosquitoControls.style.margin =
        "20px auto";


    mpMosquitoControls.style.display =
        "flex";


    mpMosquitoControls.style.justifyContent =
        "center";


    mpMosquitoControls.style.gap =
        "12px";


    // ---------------------------------------------
    // STAY
    // ---------------------------------------------

    mpStayBtn =
        document.createElement(
            "button"
        );


    mpStayBtn.innerText =
        "🦟 Stay";


    mpStayBtn.disabled =
        true;


    mpStayBtn.onclick =
        function(){

            sendMosquitoStay();

        };


    // ---------------------------------------------
    // MOVE
    // ---------------------------------------------

    mpMoveBtn =
        document.createElement(
            "button"
        );


    mpMoveBtn.innerText =
        "🦟 Move Here";


    mpMoveBtn.disabled =
        true;


    mpMoveBtn.onclick =
        function(){

            sendMosquitoMove();

        };


    mpMosquitoControls.appendChild(
        mpStayBtn
    );


    mpMosquitoControls.appendChild(
        mpMoveBtn
    );


    if(
        mpMosquitoBoard &&
        mpMosquitoBoard.parentNode
    ){

        mpMosquitoBoard.parentNode.insertBefore(
            mpMosquitoControls,
            mpMosquitoBoard.nextSibling
        );

    }

}


// =========================================================
// ENABLE MOSQUITO MOVEMENT
// =========================================================

function enableMosquitoMovement(
    data
){

    mpMosquitoCanMove =
        true;


    mpMosquitoMoveReason =
        data.reason;


    mpMosquitoCurrentRow =
        Number(
            data.currentPosition.row
        );


    mpMosquitoCurrentCol =
        Number(
            data.currentPosition.col
        );


    mpMosquitoSelectedCell =
        null;


    createMosquitoMovementControls();


    // ---------------------------------------------
    // CLEAR OLD SELECTION
    // ---------------------------------------------

    const oldSelected =
        mpMosquitoBoard.querySelectorAll(
            ".selected, .movementSelected"
        );


    oldSelected.forEach(
        function(cell){

            cell.classList.remove(
                "selected"
            );

            cell.classList.remove(
                "movementSelected"
            );

        }
    );


    // ---------------------------------------------
    // ENABLE BOARD
    // ---------------------------------------------

    if(mpMosquitoBoard){

        mpMosquitoBoard.style.pointerEvents =
            "auto";

        mpMosquitoBoard.style.opacity =
            "1";

    }


    // ---------------------------------------------
    // STAY
    // ---------------------------------------------

    if(mpStayBtn){

        mpStayBtn.disabled =
            false;

    }


    if(mpMoveBtn){

        mpMoveBtn.disabled =
            true;

    }


    // ---------------------------------------------
    // STATUS
    // ---------------------------------------------

    if(
        mpMosquitoStatus
    ){

        if(
            data.reason ===
            "bite"
        ){

            mpMosquitoStatus.innerText =
                "🩸 You were detected! You may STAY or FLY anywhere.";

        }

        else{

            mpMosquitoStatus.innerText =
                "❌ Man missed. You may STAY or move one square orthogonally.";

        }

    }


    if(
        mpMosquitoMovementStatus
    ){

        if(
            data.reason ===
            "bite"
        ){

            mpMosquitoMovementStatus.innerText =
                "Select ANY square, or press Stay.";

        }

        else{

            mpMosquitoMovementStatus.innerText =
                "Select an adjacent square, or press Stay.";

        }

    }


    console.log(
        "🦟 MOSQUITO MOVEMENT ENABLED:",
        data.reason
    );

}


// =========================================================
// SEND STAY
// =========================================================

function sendMosquitoStay(){

    if(
        !mpMosquitoCanMove
    ){

        return;

    }


    const sent =
        mpSend({

            type:
                "mosquitoMove",

            roomCode:
                window.multiplayerRoomCode,

            action:
                "stay"

        });


    if(!sent){

        return;

    }


    lockMosquitoMovement();

}


// =========================================================
// SEND MOVE
// =========================================================

function sendMosquitoMove(){

    if(
        !mpMosquitoCanMove
    ){

        return;

    }


    if(
        !mpMosquitoSelectedCell
    ){

        if(
            mpMosquitoMovementStatus
        ){

            mpMosquitoMovementStatus.innerText =
                "Select a square first.";

        }

        return;

    }


    const row =
        Number(
            mpMosquitoSelectedCell.dataset.row
        );


    const col =
        Number(
            mpMosquitoSelectedCell.dataset.col
        );


    const sent =
        mpSend({

            type:
                "mosquitoMove",

            roomCode:
                window.multiplayerRoomCode,

            action:
                "move",

            row:
                row,

            col:
                col

        });


    if(!sent){

        return;

    }


    lockMosquitoMovement();

}


// =========================================================
// LOCK MOSQUITO MOVEMENT
// =========================================================

function lockMosquitoMovement(){

    mpMosquitoCanMove =
        false;


    if(mpStayBtn){

        mpStayBtn.disabled =
            true;

    }


    if(mpMoveBtn){

        mpMoveBtn.disabled =
            true;

    }


    if(mpMosquitoBoard){

        mpMosquitoBoard.style.pointerEvents =
            "none";

        mpMosquitoBoard.style.opacity =
            "0.55";

    }


    if(mpMosquitoStatus){

        mpMosquitoStatus.innerText =
            "🦟 Waiting for the Man...";

    }


    if(mpMosquitoMovementStatus){

        mpMosquitoMovementStatus.innerText =
            "Your move is complete.";

    }

}


// =========================================================
// OPEN MAN
// =========================================================

function openMultiplayerMan(){

    hideNormalGameScreens();

    hideAllMultiplayerScreens();


    if(!mpManScreen){

        console.error(
            "❌ multiplayerManScreen not found."
        );

        return;

    }


    mpManScreen.classList.remove(
        "hidden"
    );


    window.currentGameMode =
        "multiplayer-man";


    window.multiplayerManReady =
        false;


    window.multiplayerMosquitoReady =
        false;


    mpManCanAttack =
        false;


    mpWaitingForAttackResult =
        false;


    mpManSanity =
        100;


    mpManTurn =
        1;


    mpBiteFreeTurns =
        0;


    updateManHUD();


    if(mpManStatus){

        mpManStatus.innerText =
            "Waiting for Mosquito...";

    }


    createMultiplayerManBoard();


    console.log(
        "🧍 OPENING MULTIPLAYER MAN"
    );

}


// =========================================================
// OPEN MOSQUITO
// =========================================================

function openMultiplayerMosquito(){

    hideNormalGameScreens();

    hideAllMultiplayerScreens();


    if(!mpMosquitoScreen){

        console.error(
            "❌ multiplayerMosquitoScreen not found."
        );

        return;

    }


    mpMosquitoScreen.classList.remove(
        "hidden"
    );


    window.currentGameMode =
        "multiplayer-mosquito";


    window.multiplayerMosquitoReady =
        false;


    window.multiplayerManReady =
        false;


    mpMosquitoCanMove =
        false;


    mpMosquitoMoveReason =
        null;


    mpManSanity =
        100;


    mpManTurn =
        1;


    updateMosquitoHUD();


    if(mpMosquitoStatus){

        mpMosquitoStatus.innerText =
            "Choose your hiding place.";

    }


    if(mpMosquitoMovementStatus){

        mpMosquitoMovementStatus.innerText =
            "";

    }


    createMultiplayerMosquitoBoard();


    createMosquitoMovementControls();


    if(mpMosquitoControls){

        mpMosquitoControls.style.display =
            "none";

    }


    console.log(
        "🦟 OPENING MULTIPLAYER MOSQUITO"
    );

}


// =========================================================
// MAN HUD
// =========================================================

function updateManHUD(){

    const sanity =
        document.getElementById(
            "mpManSanity"
        );

    const turn =
        document.getElementById(
            "mpManTurn"
        );


    if(sanity){

        sanity.innerText =
            mpManSanity +
            "%";

    }


    if(turn){

        turn.innerText =
            mpManTurn;

    }

}


// =========================================================
// MOSQUITO HUD
// =========================================================

function updateMosquitoHUD(){

    const sanity =
        document.getElementById(
            "mpMosquitoSanity"
        );

    const turn =
        document.getElementById(
            "mpMosquitoTurn"
        );


    if(sanity){

        sanity.innerText =
            mpManSanity +
            "%";

    }


    if(turn){

        turn.innerText =
            mpManTurn;

    }

}


// =========================================================
// INITIAL HIDE BUTTON
// =========================================================

if(mpHideBtn){

    mpHideBtn.onclick =
        function(){

            if(
                window.multiplayerMosquitoReady
            ){

                return;

            }


            if(
                !mpMosquitoSelectedCell
            ){

                if(mpMosquitoStatus){

                    mpMosquitoStatus.innerText =
                        "Select a square first.";

                }

                return;

            }


            const row =
                Number(
                    mpMosquitoSelectedCell.dataset.row
                );


            const col =
                Number(
                    mpMosquitoSelectedCell.dataset.col
                );


            const position =
                mpMosquitoSelectedCell.dataset.position;


            const sent =
                mpSend({

                    type:
                        "mosquitoPosition",

                    roomCode:
                        window.multiplayerRoomCode,

                    row:
                        row,

                    col:
                        col

                });


            if(!sent){

                return;

            }


            window.multiplayerMosquitoReady =
                true;


            if(mpHideBtn){

                mpHideBtn.disabled =
                    true;

            }


            if(mpMosquitoBoard){

                mpMosquitoBoard.style.pointerEvents =
                    "none";

                mpMosquitoBoard.style.opacity =
                    "0.55";

            }


            if(mpMosquitoStatus){

                mpMosquitoStatus.innerText =
                    "🦟 Hidden! The hunt has started.";

            }


            if(mpMosquitoMovementStatus){

                mpMosquitoMovementStatus.innerText =
                    "The Man is hunting...";

            }


            console.log(
                "📤 MOSQUITO POSITION SENT:",
                position
            );

        };

}


// =========================================================
// SOCKET OPEN
// =========================================================

mpSocket.onopen =
function(){

    window.multiplayerConnected =
        true;


    console.log(
        "🌐 Connected to multiplayer server!"
    );

};


// =========================================================
// SOCKET MESSAGE
// =========================================================

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


    // =====================================================
    // ROOM CREATED
    // =====================================================

    if(
        data.type ===
        "roomCreated"
    ){

        window.multiplayerRole =
            data.role || "man";


        window.multiplayerRoomCode =
            data.roomCode;


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

    }


    // =====================================================
    // PLAYER JOINED
    // =====================================================

    else if(
        data.type ===
        "playerJoined"
    ){

        if(mpLobbyStatus){

            mpLobbyStatus.innerText =
                "✅ Opponent connected!";

        }

    }


    // =====================================================
    // JOINED ROOM
    // =====================================================

    else if(
        data.type ===
        "joinedRoom"
    ){

        window.multiplayerRole =
            data.role ||
            "mosquito";


        window.multiplayerRoomCode =
            data.roomCode;


        if(mpJoinStatus){

            mpJoinStatus.innerText =
                "✅ Joined game!";

        }

    }


    // =====================================================
    // GAME START
    // =====================================================

    else if(
        data.type ===
        "gameStart"
    ){

        window.multiplayerRole =
            data.role;


        window.multiplayerRoomCode =
            data.roomCode;


        if(
            data.role ===
            "man"
        ){

            openMultiplayerMan();

        }

        else if(
            data.role ===
            "mosquito"
        ){

            openMultiplayerMosquito();

        }

    }


    // =====================================================
    // MOSQUITO READY
    // =====================================================

    else if(
        data.type ===
        "mosquitoReady"
    ){

        if(
            window.multiplayerRole !==
            "man"
        ){

            return;

        }


        window.multiplayerManReady =
            true;


        window.multiplayerMosquitoReady =
            true;


        activateManBoard();

    }


    // =====================================================
    // MOSQUITO HIDDEN CONFIRMATION
    // =====================================================

    else if(
        data.type ===
        "mosquitoHidden"
    ){

        if(
            mpMosquitoStatus
        ){

            mpMosquitoStatus.innerText =
                "🦟 Hidden! Waiting for the Man.";

        }

    }


    // =====================================================
    // ATTACK RESULT
    // =====================================================

    else if(
        data.type ===
        "attackResult"
    ){

        mpWaitingForAttackResult =
            false;


        if(
            typeof data.sanity ===
            "number"
        ){

            mpManSanity =
                data.sanity;

        }


        if(
            typeof data.turn ===
            "number"
        ){

            mpManTurn =
                data.turn + 1;

        }


        if(
            typeof data.biteFreeTurns ===
            "number"
        ){

            mpBiteFreeTurns =
                data.biteFreeTurns;

        }


        updateManHUD();


        // ---------------------------------------------
        // HIT
        // ---------------------------------------------

        if(
            data.result ===
            "hit"
        ){

            mpManCanAttack =
                false;


            if(mpManBoard){

                mpManBoard.style.pointerEvents =
                    "none";

            }


            if(mpManStatus){

                mpManStatus.innerText =
                    "🎯 HIT! You caught the Mosquito!";

            }


            return;

        }


        // ---------------------------------------------
        // BITE
        // ---------------------------------------------

        if(
            data.result ===
            "bite"
        ){

            mpManCanAttack =
                false;


            if(mpManBoard){

                mpManBoard.style.pointerEvents =
                    "none";

            }


            if(mpManStatus){

                mpManStatus.innerText =
                    "🩸 BITE! -10 Sanity. Mosquito's turn.";

            }


            return;

        }


        // ---------------------------------------------
        // MISS
        // ---------------------------------------------

        if(
            data.result ===
            "miss"
        ){

            mpManCanAttack =
                false;


            if(mpManBoard){

                mpManBoard.style.pointerEvents =
                    "none";

            }


            if(mpManStatus){

                mpManStatus.innerText =
                    "❌ MISS! -1 Sanity. Mosquito's turn.";

            }


            return;

        }

    }


    // =====================================================
    // MOSQUITO TURN
    // =====================================================

    else if(
        data.type ===
        "mosquitoTurn"
    ){

        if(
            window.multiplayerRole !==
            "mosquito"
        ){

            return;

        }


        // ---------------------------------------------
        // STORE SECRET POSITION LOCALLY
        // ---------------------------------------------

        mpMosquitoCurrentRow =
            Number(
                data.currentPosition.row
            );


        mpMosquitoCurrentCol =
            Number(
                data.currentPosition.col
            );


        // ---------------------------------------------
        // SHOW MOVEMENT CONTROLS
        // ---------------------------------------------

        if(mpMosquitoControls){

            mpMosquitoControls.style.display =
                "flex";

        }


        enableMosquitoMovement(
            data
        );


        console.log(
            "🦟 MOSQUITO TURN:",
            data.reason
        );

    }


    // =====================================================
    // MOSQUITO MOVE RESULT
    // =====================================================

    else if(
        data.type ===
        "mosquitoMoveResult"
    ){

        mpMosquitoCanMove =
            false;


        if(
            typeof data.row ===
            "number"
        ){

            mpMosquitoCurrentRow =
                data.row;

        }


        if(
            typeof data.col ===
            "number"
        ){

            mpMosquitoCurrentCol =
                data.col;

        }


        if(mpMosquitoControls){

            mpMosquitoControls.style.display =
                "none";

        }


        if(mpMosquitoBoard){

            mpMosquitoBoard.style.pointerEvents =
                "none";

            mpMosquitoBoard.style.opacity =
                "0.55";

        }


        if(mpMosquitoStatus){

            mpMosquitoStatus.innerText =
                "🦟 Waiting for the Man...";

        }


        if(mpMosquitoMovementStatus){

            mpMosquitoMovementStatus.innerText =
                data.message ||
                "The Man's turn.";

        }

    }


    // =====================================================
    // MOSQUITO MOVED — MAN SIDE
    // =====================================================

    else if(
        data.type ===
        "mosquitoMoved"
    ){

        mpManCanAttack =
            true;


        mpWaitingForAttackResult =
            false;


        if(mpManBoard){

            mpManBoard.style.pointerEvents =
                "auto";

            mpManBoard.style.opacity =
                "1";

        }


        if(mpManStatus){

            mpManStatus.innerText =
                data.message ||
                "🦟 The Mosquito moved. Attack!";

        }


        console.log(
            "🧍 MAN TURN RESTORED"
        );

    }


    // =====================================================
    // GAME OVER
    // =====================================================

    else if(
        data.type ===
        "gameOver"
    ){

        if(
            data.winner ===
            "man"
        ){

            if(
                window.multiplayerRole ===
                "man"
            ){

                if(mpManStatus){

                    mpManStatus.innerText =
                        "🎯 YOU WIN! You caught the Mosquito!";

                }

            }

            else{

                if(mpMosquitoStatus){

                    mpMosquitoStatus.innerText =
                        "💀 You were caught!";

                }

            }

        }

    }


    // =====================================================
    // ERROR
    // =====================================================

    else if(
        data.type ===
        "error"
    ){

        console.error(
            "❌ SERVER ERROR:",
            data.message
        );


        mpWaitingForAttackResult =
            false;


        if(
            window.multiplayerRole ===
            "man"
        ){

            mpManCanAttack =
                true;


            if(mpManBoard){

                mpManBoard.style.pointerEvents =
                    "auto";

            }

        }


        if(mpJoinStatus){

            mpJoinStatus.innerText =
                "❌ " +
                data.message;

        }


        if(mpManStatus){

            mpManStatus.innerText =
                "❌ " +
                data.message;

        }


        if(mpMosquitoStatus){

            mpMosquitoStatus.innerText =
                "❌ " +
                data.message;

        }

    }


    // =====================================================
    // OPPONENT DISCONNECTED
    // =====================================================

    else if(
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

        window.multiplayerManReady =
            false;

        window.multiplayerMosquitoReady =
            false;

        mpManCanAttack =
            false;

        mpWaitingForAttackResult =
            false;

        mpMosquitoCanMove =
            false;

    }

};


// =========================================================
// CREATE GAME
// =========================================================

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


        mpSend({

            type:
                "createRoom"

        });

    };

}


// =========================================================
// JOIN GAME
// =========================================================

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


// =========================================================
// JOIN ROOM
// =========================================================

if(mpJoinRoomBtn){

    mpJoinRoomBtn.onclick =
    function(){

        if(!mpRoomCodeInput){

            return;

        }


        const code =
            mpRoomCodeInput.value
                .trim()
                .toUpperCase();


        if(
            code.length !==
            6
        ){

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


        mpSend({

            type:
                "joinRoom",

            roomCode:
                code

        });

    };

}


// =========================================================
// ENTER KEY
// =========================================================

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


// =========================================================
// BACK
// =========================================================

if(mpPlayerBackBtn){

    mpPlayerBackBtn.onclick =
    function(){

        hideAllMultiplayerScreens();

        hideNormalGameScreens();


        const mainMenu =
            document.getElementById(
                "mainMenu"
            );


        if(mainMenu){

            mainMenu.classList.remove(
                "hidden"
            );

        }


        window.multiplayerRole =
            null;

        window.multiplayerRoomCode =
            null;

        window.multiplayerManReady =
            false;

        window.multiplayerMosquitoReady =
            false;

        mpManCanAttack =
            false;

        mpWaitingForAttackResult =
            false;

        mpMosquitoCanMove =
            false;

    };

}


// =========================================================
// SOCKET CLOSE
// =========================================================

mpSocket.onclose =
function(){

    window.multiplayerConnected =
        false;

    mpManCanAttack =
        false;

    mpWaitingForAttackResult =
        false;

    mpMosquitoCanMove =
        false;


    console.log(
        "❌ Disconnected from multiplayer server."
    );

};


// =========================================================
// SOCKET ERROR
// =========================================================

mpSocket.onerror =
function(error){

    console.error(
        "❌ Multiplayer WebSocket error:",
        error
    );

};
