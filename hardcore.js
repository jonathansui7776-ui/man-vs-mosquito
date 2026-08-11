/* =========================================================
   ULTIMATE HARDCORE HORROR MODE
   =========================================================

   PLAYER:
       Innocent Mosquito

   ENEMY:
       Demonic AI Man

   BOARD:
       6 x 6

   SAFE:
       B2 - E5

   OUTER RING:
       LETHAL, BUT FULLY WALKABLE

   MOVEMENT:
       Normal:
           Orthogonal only.

       After bite:
           ONE complete free-flight movement.
           Any of the 36 cells may be selected.

   MAN ATTACK:
       Exactly 1 red tile.

   GAMBLE:
       Exactly one 2x2 red area.

   BLOOD:
       Can spawn ANYWHERE.

       Visible ONLY while torch is lit.

       Remains stored after darkness returns.

   SCARY2:
       Can spawn ONLY inside safe 4x4.

   SANITY:
       Starts at -100%

       Normal miss       +1
       Gamble miss       +20
       Blood             +10
       Adjacent attack   +10

       Reaching 0:
           MOSQUITO WINS

   AUDIO:
       Hardcore:
           music/horror.mp3

       Jumpscare:
           music/jumpscare.mp3

       Normal menu:
           music/lounge.mp3
   ========================================================= */


// =========================================================
// ELEMENTS
// =========================================================

const hcScreen =
    document.getElementById(
        "hardcoreScreen"
    );

const hcBoard =
    document.getElementById(
        "hardcoreBoard"
    );

const hcStatus =
    document.getElementById(
        "hardcoreStatus"
    );

const hcTurnEl =
    document.getElementById(
        "hardcoreTurn"
    );

const hcGamblesEl =
    document.getElementById(
        "hardcoreGambles"
    );

const hcStayBtn =
    document.getElementById(
        "hardcoreStayBtn"
    );

const hcTorchBtn =
    document.getElementById(
        "hardcoreTorchBtn"
    );

const hcGambleBtn =
    document.getElementById(
        "hardcoreGambleBtn"
    );

const hcControls =
    document.getElementById(
        "hardcoreControls"
    );

const hcCornerControls =
    document.getElementById(
        "hardcoreCornerControls"
    );

const hcJumpscare =
    document.getElementById(
        "hardcoreJumpscare"
    );

const hcScaryImage =
    document.getElementById(
        "hardcoreScaryImage"
    );

const hcDeathScreen =
    document.getElementById(
        "hardcoreDeathScreen"
    );

const hcDeathMenuBtn =
    document.getElementById(
        "hardcoreDeathMenuBtn"
    );

const hcHardcoreBtn =
    document.getElementById(
        "hardcoreBtn"
    );


// =========================================================
// CONSTANTS
// =========================================================

const HC_SIZE =
    6;


/*
   Safe central 4x4:

       B2 B3 B4 B5
       C2 C3 C4 C5
       D2 D3 D4 D5
       E2 E3 E4 E5

   Everything else is lethal.
*/

const HC_SAFE_MIN_ROW =
    1;

const HC_SAFE_MAX_ROW =
    4;

const HC_SAFE_MIN_COL =
    1;

const HC_SAFE_MAX_COL =
    4;


const HC_GAMBLE_CHANCE =
    0.12;


const HC_CANDLE_DURATION =
    3000;


const HC_JUMPSCARE_DURATION =
    2800;


// =========================================================
// GAME STATE
// =========================================================

let hcRunning =
    false;

let hcChoosingStart =
    false;

let hcSelectedStart =
    null;

let hcTurn =
    1;

let hcMosquito =
    null;

let hcMan =
    null;

let hcMoveTiles =
    [];

let hcAttackTiles =
    [];

let hcBloodTiles =
    [];

let hcScaryTiles =
    [];

let hcBoardLit =
    false;

let hcCandleBusy =
    false;

let hcGambles =
    5;

let hcManSanity =
    -100;

let hcJumpscareTimeout =
    null;

let hcCandleTimeout =
    null;

let hcFreeFlight =
    false;


// =========================================================
// AUDIO
// =========================================================

const hcHorrorMusic =
    new Audio(
        "music/horror.mp3"
    );

const hcJumpscareAudio =
    new Audio(
        "music/jumpscare.mp3"
    );


hcHorrorMusic.loop =
    true;

hcHorrorMusic.volume =
    0.65;

hcJumpscareAudio.volume =
    1.0;

hcHorrorMusic.preload =
    "auto";

hcJumpscareAudio.preload =
    "auto";


// =========================================================
// START HORROR MUSIC
// =========================================================

function hcStartHorrorMusic() {

    window.hardcoreActive =
        true;


    if (
        typeof window.stopGameMusic ===
        "function"
    ) {

        window.stopGameMusic();

    }


    document
        .querySelectorAll("audio")
        .forEach(
            function(audio) {

                const source =
                    (
                        audio.currentSrc ||
                        audio.src ||
                        ""
                    ).toLowerCase();


                if (
                    source.includes(
                        "lounge.mp3"
                    ) ||
                    source.includes(
                        "phase1.mp3"
                    ) ||
                    source.includes(
                        "phase2.mp3"
                    ) ||
                    source.includes(
                        "phase3.mp3"
                    )
                ) {

                    audio.pause();

                    audio.currentTime =
                        0;

                }

            }
        );


    hcJumpscareAudio.pause();

    hcJumpscareAudio.currentTime =
        0;


    hcHorrorMusic.pause();

    hcHorrorMusic.currentTime =
        0;


    hcHorrorMusic.play().catch(
        function(error) {

            console.log(
                "Hardcore music waiting for interaction:",
                error
            );

        }
    );

}


// =========================================================
// RESUME HORROR MUSIC
// =========================================================

function hcResumeHorrorMusic() {

    if (
        !hcRunning
    ) {

        return;

    }


    hcHorrorMusic.play().catch(
        function(error) {

            console.log(
                "Could not resume horror music:",
                error
            );

        }
    );

}


// =========================================================
// PLAY JUMPSCARE AUDIO
// =========================================================

function hcPlayJumpscareAudio() {

    hcHorrorMusic.pause();


    hcJumpscareAudio.pause();

    hcJumpscareAudio.currentTime =
        0;


    hcJumpscareAudio.play().catch(
        function(error) {

            console.log(
                "Jumpscare audio waiting for interaction:",
                error
            );

        }
    );

}


// =========================================================
// STOP HARDCORE AUDIO
// =========================================================

function hcStopHorrorMusic() {

    hcHorrorMusic.pause();

    hcHorrorMusic.currentTime =
        0;


    hcJumpscareAudio.pause();

    hcJumpscareAudio.currentTime =
        0;

}


// =========================================================
// RETURN TO MENU
// =========================================================

function hcReturnToMenu() {

    hcStopHorrorMusic();


    window.hardcoreActive =
        false;


    if (hcScreen) {

        hcScreen.classList.add(
            "hidden"
        );

    }


    if (hcDeathScreen) {

        hcDeathScreen.classList.add(
            "hidden"
        );

    }


    const mainMenu =
        document.getElementById(
            "mainMenu"
        );


    if (mainMenu) {

        mainMenu.classList.remove(
            "hidden"
        );

    }


    if (
        typeof window.playMainMenuMusic ===
        "function"
    ) {

        window.playMainMenuMusic();

    }

}


// =========================================================
// COORDINATES
// =========================================================

function hcCellToXY(cell) {

    if (!cell) {

        return {
            row: 0,
            col: 0
        };

    }


    return {

        row:
            cell.charCodeAt(0) -
            65,

        col:
            Number(
                cell.substring(1)
            ) - 1

    };

}


function hcXYToCell(row, col) {

    return (
        String.fromCharCode(
            65 + row
        ) +
        String(col + 1)
    );

}


// =========================================================
// SAFE CELL
// =========================================================

function hcIsSafeCell(cell) {

    if (!cell) {

        return false;

    }


    const {
        row,
        col
    } =
        hcCellToXY(cell);


    return (

        row >= HC_SAFE_MIN_ROW &&

        row <= HC_SAFE_MAX_ROW &&

        col >= HC_SAFE_MIN_COL &&

        col <= HC_SAFE_MAX_COL

    );

}


// =========================================================
// OUTER CELL
// =========================================================

function hcIsOuterCell(cell) {

    return !hcIsSafeCell(cell);

}


// =========================================================
// RANDOM CELL
// =========================================================

function hcRandomCell() {

    const row =
        Math.floor(
            Math.random() *
            HC_SIZE
        );

    const col =
        Math.floor(
            Math.random() *
            HC_SIZE
        );


    return hcXYToCell(
        row,
        col
    );

}


// =========================================================
// RANDOM SAFE CELL
// =========================================================

function hcRandomSafeCell() {

    const row =
        HC_SAFE_MIN_ROW +
        Math.floor(
            Math.random() *
            (
                HC_SAFE_MAX_ROW -
                HC_SAFE_MIN_ROW +
                1
            )
        );


    const col =
        HC_SAFE_MIN_COL +
        Math.floor(
            Math.random() *
            (
                HC_SAFE_MAX_COL -
                HC_SAFE_MIN_COL +
                1
            )
        );


    return hcXYToCell(
        row,
        col
    );

}


// =========================================================
// RANDOM EMPTY CELL
// =========================================================

function hcRandomEmptyCell(
    safeOnly = false
) {

    const possible =
        [];


    for (
        let row = 0;
        row < HC_SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < HC_SIZE;
            col++
        ) {

            const cell =
                hcXYToCell(
                    row,
                    col
                );


            if (
                safeOnly &&
                !hcIsSafeCell(cell)
            ) {

                continue;

            }


            if (
                cell === hcMosquito ||
                cell === hcMan
            ) {

                continue;

            }


            if (
                hcBloodTiles.includes(
                    cell
                )
            ) {

                continue;

            }


            if (
                hcScaryTiles.includes(
                    cell
                )
            ) {

                continue;

            }


            possible.push(
                cell
            );

        }

    }


    if (
        possible.length === 0
    ) {

        return safeOnly
            ? hcRandomSafeCell()
            : hcRandomCell();

    }


    return possible[
        Math.floor(
            Math.random() *
            possible.length
        )
    ];

}


// =========================================================
// DISTANCE
// =========================================================

function hcDistance(a, b) {

    if (
        !a ||
        !b
    ) {

        return Infinity;

    }


    const A =
        hcCellToXY(a);

    const B =
        hcCellToXY(b);


    return (

        Math.abs(
            A.row -
            B.row
        ) +

        Math.abs(
            A.col -
            B.col
        )

    );

}


// =========================================================
// ORTHOGONAL ADJACENCY
// =========================================================

function hcIsOrthogonallyAdjacent(
    a,
    b
) {

    return (
        hcDistance(a, b) === 1
    );

}


// =========================================================
// BUILD BOARD
// =========================================================

function hcBuildBoard() {

    if (!hcBoard) {

        return;

    }


    hcBoard.innerHTML =
        "";


    for (
        let row = 0;
        row < HC_SIZE;
        row++
    ) {

        for (
            let col = 0;
            col < HC_SIZE;
            col++
        ) {

            const cell =
                document.createElement(
                    "div"
                );


            const id =
                hcXYToCell(
                    row,
                    col
                );


            cell.className =
                "hardcoreCell";


            cell.dataset.cell =
                id;


            if (
                hcIsOuterCell(id)
            ) {

                cell.classList.add(
                    "hardcoreOuterCell"
                );

            }

            else {

                cell.classList.add(
                    "hardcoreSafeCell"
                );

            }


            hcBoard.appendChild(
                cell
            );

        }

    }

}


// =========================================================
// STARTING POSITION UI
// =========================================================

function hcCreateStartSelector() {

    /*
       Remove any old selector.
    */

    const oldSelector =
        document.getElementById(
            "hardcoreStartSelector"
        );


    if (oldSelector) {

        oldSelector.remove();

    }


    const selector =
        document.createElement(
            "div"
        );


    selector.id =
        "hardcoreStartSelector";


    selector.style.textAlign =
        "center";

    selector.style.marginTop =
        "15px";


    const message =
        document.createElement(
            "p"
        );


    message.id =
        "hardcoreStartMessage";


    message.textContent =
        "🦟 Choose Mosquito-chan's starting position";


    selector.appendChild(
        message
    );


    const confirm =
        document.createElement(
            "button"
        );


    confirm.id =
        "hardcoreStartConfirm";


    confirm.textContent =
        "🦟 Start Here";


    confirm.disabled =
        true;


    confirm.style.margin =
        "8px";


    selector.appendChild(
        confirm
    );


    /*
       Put selector immediately below board.
    */

    if (hcBoard) {

        hcBoard.parentNode.insertBefore(
            selector,
            hcBoard.nextSibling
        );

    }


    confirm.addEventListener(
        "click",
        function() {

            hcConfirmStartingPosition();

        }
    );

}


// =========================================================
// UPDATE START SELECTOR
// =========================================================

function hcUpdateStartSelector() {

    const message =
        document.getElementById(
            "hardcoreStartMessage"
        );

    const confirm =
        document.getElementById(
            "hardcoreStartConfirm"
        );


    if (!message || !confirm) {

        return;

    }


    if (
        hcSelectedStart
    ) {

        message.textContent =
            "Starting position: " +
            hcSelectedStart;


        confirm.disabled =
            false;

    }

    else {

        message.textContent =
            "🦟 Choose Mosquito-chan's starting position";


        confirm.disabled =
            true;

    }

}


// =========================================================
// REMOVE START SELECTOR
// =========================================================

function hcRemoveStartSelector() {

    const selector =
        document.getElementById(
            "hardcoreStartSelector"
        );


    if (selector) {

        selector.remove();

    }

}


// =========================================================
// CHOOSE STARTING POSITION
// =========================================================

function hcChooseStartingPosition(
    cell
) {

    if (
        !hcChoosingStart
    ) {

        return;

    }


    /*
       Starting position must be safe.

       The player should not instantly lose
       before the game even begins.
    */

    if (
        !hcIsSafeCell(cell)
    ) {

        if (hcStatus) {

            hcStatus.textContent =
                "You cannot start in the darkness outside the safe area.";

        }

        return;

    }


    hcSelectedStart =
        cell;


    hcUpdateStartSelector();


    hcRenderBoard();

}


// =========================================================
// CONFIRM START
// =========================================================

function hcConfirmStartingPosition() {

    if (
        !hcChoosingStart ||
        !hcSelectedStart
    ) {

        return;

    }


    /*
       Assign the player's chosen position.
    */

    hcMosquito =
        hcSelectedStart;


    hcSelectedStart =
        null;


    hcChoosingStart =
        false;


    hcRemoveStartSelector();


    /*
       Now the actual game begins.
    */

    hcRunning =
        true;


    /*
       Initial movement is orthogonal.
    */

    hcFreeFlight =
        false;


    hcCalculateMoveTiles();


    hcGenerateManAttack();


    hcUpdateHUD();

    hcRenderBoard();


    if (hcStatus) {

        hcStatus.textContent =
            "Something is hunting you.";

    }


    /*
       Make sure horror music is playing.
    */

    hcResumeHorrorMusic();

}


// =========================================================
// SANITY DISPLAY
// =========================================================

function hcEnsureSanityDisplay() {

    const existing =
        document.querySelector(
            "#hardcoreManSanity, #hardcoreSanity"
        );


    if (existing) {

        return;

    }


    if (!hcScreen) {

        return;

    }


    const box =
        document.createElement(
            "div"
        );


    box.id =
        "hardcoreSanityBox";


    box.className =
        "hudBox";


    box.innerHTML =
        '🧠 Man\'s Sanity ' +
        '<span id="hardcoreManSanity">-100%</span>';


    hcScreen.insertBefore(
        box,
        hcScreen.firstChild
    );

}


// =========================================================
// UPDATE HUD
// =========================================================

function hcUpdateHUD() {

    if (hcTurnEl) {

        hcTurnEl.textContent =
            hcTurn;

    }


    if (hcGamblesEl) {

        hcGamblesEl.textContent =
            hcGambles;

    }


    hcEnsureSanityDisplay();


    document
        .querySelectorAll(
            "#hardcoreManSanity, #hardcoreSanity"
        )
        .forEach(
            function(element) {

                element.textContent =
                    hcManSanity + "%";

            }
        );

}


// =========================================================
// CHANGE SANITY
// =========================================================

function hcChangeSanity(amount) {

    if (
        !hcRunning
    ) {

        return;

    }


    hcManSanity +=
        amount;


    if (
        hcManSanity > 0
    ) {

        hcManSanity =
            0;

    }


    hcUpdateHUD();


    if (
        hcManSanity >= 0
    ) {

        hcMosquitoWins();

    }

}


// =========================================================
// RENDER BOARD
// =========================================================

function hcRenderBoard() {

    if (!hcBoard) {

        return;

    }


    const cells =
        hcBoard.querySelectorAll(
            ".hardcoreCell"
        );


    cells.forEach(
        function(cell) {

            const id =
                cell.dataset.cell;


            const outer =
                hcIsOuterCell(id);


            cell.className =
                "hardcoreCell";


            if (outer) {

                cell.classList.add(
                    "hardcoreOuterCell"
                );

            }

            else {

                cell.classList.add(
                    "hardcoreSafeCell"
                );

            }


            cell.innerHTML =
                "";


            /*
               DARK / LIGHT
            */

            if (
                hcBoardLit
            ) {

                cell.classList.add(
                    "hardcoreIlluminated"
                );

            }

            else {

                cell.classList.add(
                    "hardcoreDark"
                );

            }


            /*
               STARTING POSITION SELECTION
            */

            if (
                hcChoosingStart &&
                id === hcSelectedStart
            ) {

                cell.classList.add(
                    "hardcoreStartSelected"
                );

            }


            /*
               MAN ATTACK
            */

            if (
                hcAttackTiles.includes(
                    id
                )
            ) {

                cell.classList.add(
                    "hardcoreAttackTile"
                );

            }


            /*
               POSSIBLE MOVEMENT

               Normal:
                   Orthogonal adjacent cells.

               Free flight:
                   ALL 6x6 cells.

               Outer cells remain legal but lethal.
            */

            if (
                hcMoveTiles.includes(
                    id
                )
            ) {

                cell.classList.add(
                    "hardcoreMoveTile"
                );

            }


            /*
               BLOOD

               IMPORTANT:

               Blood remains in hcBloodTiles
               after the torch goes out.

               It is NOT visible while dark.
            */

            if (
                hcBoardLit &&
                hcBloodTiles.includes(
                    id
                )
            ) {

                const blood =
                    document.createElement(
                        "div"
                    );


                blood.className =
                    "hardcoreBlood";


                blood.textContent =
                    "🩸";


                cell.appendChild(
                    blood
                );

            }


            /*
               SCARY2

               ONLY SAFE AREA.
               ONLY VISIBLE WHILE LIT.
            */

            if (
                hcScaryTiles.includes(id) &&
                hcBoardLit &&
                hcIsSafeCell(id)
            ) {

                const scary =
                    document.createElement(
                        "img"
                    );


                scary.src =
                    "images/scary2.png";


                scary.className =
                    "hardcoreScarySprite";


                scary.alt =
                    "";


                cell.appendChild(
                    scary
                );

            }


            /*
               MOSQUITO
            */

            if (
                id === hcMosquito ||
                (
                    hcChoosingStart &&
                    id === hcSelectedStart
                )
            ) {

                const mosquito =
                    document.createElement(
                        "img"
                    );


                mosquito.src =
                    "images/mosquitochan.png";


                mosquito.className =
                    "hardcoreMosquitoSprite";


                mosquito.alt =
                    "Mosquito-chan";


                cell.appendChild(
                    mosquito
                );

            }

        }
    );

}


// =========================================================
// CALCULATE MOVEMENT
// =========================================================

function hcCalculateMoveTiles() {

    hcMoveTiles =
        [];


    if (
        !hcMosquito
    ) {

        return;

    }


    /*
       =====================================================
       FREE FLIGHT
       =====================================================

       After a bite:

       ALL 36 cells are possible.

       This includes the outer ring.

       Outer ring is still lethal.
    */

    if (
        hcFreeFlight
    ) {

        for (
            let row = 0;
            row < HC_SIZE;
            row++
        ) {

            for (
                let col = 0;
                col < HC_SIZE;
                col++
            ) {

                const target =
                    hcXYToCell(
                        row,
                        col
                    );


                if (
                    target !== hcMosquito
                ) {

                    hcMoveTiles.push(
                        target
                    );

                }

            }

        }


        return;

    }


    /*
       =====================================================
       NORMAL MOVEMENT
       =====================================================

       Orthogonal only.

       Center = 4
       Edge   = 3
       Corner = 2
    */

    const {
        row,
        col
    } =
        hcCellToXY(
            hcMosquito
        );


    const directions = [

        [-1, 0],

        [1, 0],

        [0, -1],

        [0, 1]

    ];


    for (
        const direction
        of directions
    ) {

        const newRow =
            row +
            direction[0];

        const newCol =
            col +
            direction[1];


        if (
            newRow < 0 ||
            newRow >= HC_SIZE ||
            newCol < 0 ||
            newCol >= HC_SIZE
        ) {

            continue;

        }


        const target =
            hcXYToCell(
                newRow,
                newCol
            );


        hcMoveTiles.push(
            target
        );

    }

}


// =========================================================
// GENERATE NORMAL ATTACK
// =========================================================

function hcGenerateManAttack() {

    hcAttackTiles =
        [];


    const attackTile =
        hcRandomEmptyCell(
            true
        );


    hcAttackTiles.push(
        attackTile
    );

}


// =========================================================
// GENERATE GAMBLE ATTACK
// =========================================================

function hcGenerateGambleAttack() {

    hcAttackTiles =
        [];


    const startRow =
        HC_SAFE_MIN_ROW +
        Math.floor(
            Math.random() *
            3
        );


    const startCol =
        HC_SAFE_MIN_COL +
        Math.floor(
            Math.random() *
            3
        );


    for (
        let row = startRow;
        row <= startRow + 1;
        row++
    ) {

        for (
            let col = startCol;
            col <= startCol + 1;
            col++
        ) {

            hcAttackTiles.push(
                hcXYToCell(
                    row,
                    col
                )
            );

        }

    }

}


// =========================================================
// ATTACK ADJACENCY
// =========================================================

function hcAttackIsAdjacentToMosquito() {

    return hcAttackTiles.some(
        function(tile) {

            return hcIsOrthogonallyAdjacent(
                tile,
                hcMosquito
            );

        }
    );

}


// =========================================================
// MOVE MAN TOWARD MOSQUITO
// =========================================================

function hcMoveManTowardMosquito() {

    if (
        !hcMan ||
        !hcMosquito
    ) {

        return hcMan;

    }


    const A =
        hcCellToXY(
            hcMan
        );

    const B =
        hcCellToXY(
            hcMosquito
        );


    let row =
        A.row;

    let col =
        A.col;


    const rowDistance =
        Math.abs(
            B.row -
            A.row
        );

    const colDistance =
        Math.abs(
            B.col -
            A.col
        );


    if (
        rowDistance >= colDistance &&
        rowDistance > 0
    ) {

        row +=
            B.row > row
                ? 1
                : -1;

    }

    else if (
        colDistance > 0
    ) {

        col +=
            B.col > col
                ? 1
                : -1;

    }


    const target =
        hcXYToCell(
            row,
            col
        );


    if (
        hcIsSafeCell(target)
    ) {

        return target;

    }


    return hcMan;

}


// =========================================================
// RANDOM MAN MOVE
// =========================================================

function hcRandomManMove() {

    if (
        !hcMan
    ) {

        return null;

    }


    const {
        row,
        col
    } =
        hcCellToXY(
            hcMan
        );


    const choices =
        [];


    if (
        row > HC_SAFE_MIN_ROW
    ) {

        choices.push(
            hcXYToCell(
                row - 1,
                col
            )
        );

    }


    if (
        row < HC_SAFE_MAX_ROW
    ) {

        choices.push(
            hcXYToCell(
                row + 1,
                col
            )
        );

    }


    if (
        col > HC_SAFE_MIN_COL
    ) {

        choices.push(
            hcXYToCell(
                row,
                col - 1
            )
        );

    }


    if (
        col < HC_SAFE_MAX_COL
    ) {

        choices.push(
            hcXYToCell(
                row,
                col + 1
            )
        );

    }


    const safeChoices =
        choices.filter(
            function(cell) {

                return (
                    cell !== hcMosquito
                );

            }
        );


    const pool =
        safeChoices.length
            ? safeChoices
            : choices;


    if (!pool.length) {

        return hcMan;

    }


    return pool[
        Math.floor(
            Math.random() *
            pool.length
        )
    ];

}


// =========================================================
// MAN TURN
// =========================================================

function hcManTurn() {

    if (
        !hcRunning
    ) {

        return;

    }


    /*
       MAN MOVEMENT
    */

    const distance =
        hcDistance(
            hcMan,
            hcMosquito
        );


    if (
        distance <= 3 ||
        Math.random() < 0.65
    ) {

        hcMan =
            hcMoveManTowardMosquito();

    }

    else {

        hcMan =
            hcRandomManMove();

    }


    /*
       DIRECT CONTACT
    */

    if (
        hcMan === hcMosquito
    ) {

        hcFoundMosquito();

        return;

    }


    /*
       CHOOSE ATTACK
    */

    let usedGamble =
        false;


    if (
        hcGambles > 0 &&
        Math.random() <
        HC_GAMBLE_CHANCE
    ) {

        usedGamble =
            true;

        hcGambles--;


        hcGenerateGambleAttack();

    }

    else {

        hcGenerateManAttack();

    }


    /*
       DIRECT HIT
    */

    if (
        hcAttackTiles.includes(
            hcMosquito
        )
    ) {

        hcFoundMosquito();

        return;

    }


    /*
       ADJACENT ATTACK = BITE
    */

    if (
        hcAttackIsAdjacentToMosquito()
    ) {

        hcBite();

        return;

    }


    /*
       MISS
    */

    if (
        usedGamble
    ) {

        hcManSanity +=
            20;


        if (hcStatus) {

            hcStatus.textContent =
                "MAD MAN'S GAMBLE MISSED.";

        }

    }

    else {

        hcManSanity +=
            1;


        if (hcStatus) {

            hcStatus.textContent =
                "The Man missed.";

        }

    }


    if (
        hcManSanity > 0
    ) {

        hcManSanity =
            0;

    }


    hcUpdateHUD();


    if (
        hcManSanity >= 0
    ) {

        hcMosquitoWins();

        return;

    }


    hcCalculateMoveTiles();

    hcRenderBoard();

}


// =========================================================
// MOVE MOSQUITO
// =========================================================

function hcMoveMosquito(target) {

    if (
        !hcRunning
    ) {

        return;

    }


    if (
        hcCandleBusy
    ) {

        return;

    }


    /*
       Target must be legal.

       Normal movement:
           orthogonal.

       Free flight:
           anywhere on 6x6.
    */

    if (
        !hcMoveTiles.includes(
            target
        )
    ) {

        return;

    }


    const wasFreeFlight =
        hcFreeFlight;


    /*
       OUTER RING = DEATH
    */

    if (
        hcIsOuterCell(target)
    ) {

        hcMosquito =
            target;


        hcFreeFlight =
            false;


        hcOuterRegionDeath();

        return;

    }


    /*
       MOVE
    */

    hcMosquito =
        target;


    /*
       A free-flight turn is consumed
       immediately after the move.
    */

    if (
        wasFreeFlight
    ) {

        hcFreeFlight =
            false;

    }


    /*
       MAN TILE = BITE
    */

    if (
        hcMosquito === hcMan
    ) {

        hcBite();

        return;

    }


    /*
       BLOOD
    */

    hcCheckBloodTile();


    if (
        !hcRunning
    ) {

        return;

    }


    /*
       SCARY2
    */

    if (
        hcScaryTiles.includes(
            hcMosquito
        )
    ) {

        hcScaryJumpscare();

        return;

    }


    /*
       NORMAL END
    */

    hcEndMosquitoTurn();

}


// =========================================================
// CHECK BLOOD
// =========================================================

function hcCheckBloodTile() {

    if (
        !hcMosquito
    ) {

        return;

    }


    const index =
        hcBloodTiles.indexOf(
            hcMosquito
        );


    if (
        index === -1
    ) {

        return;

    }


    /*
       Blood disappears permanently
       once Mosquito lands on it.
    */

    hcBloodTiles.splice(
        index,
        1
    );


    hcManSanity +=
        10;


    if (
        hcManSanity > 0
    ) {

        hcManSanity =
            0;

    }


    hcUpdateHUD();


    if (hcStatus) {

        hcStatus.textContent =
            "The blood is disturbed. The Man's sanity rises.";

    }


    if (
        hcManSanity >= 0
    ) {

        hcMosquitoWins();

        return;

    }


    hcRenderBoard();

}


// =========================================================
// BOARD CLICK
// =========================================================

if (hcBoard) {

    hcBoard.addEventListener(
        "click",
        function(event) {

            const cell =
                event.target.closest(
                    ".hardcoreCell"
                );


            if (!cell) {

                return;

            }


            const cellId =
                cell.dataset.cell;


            /*
               STARTING POSITION MODE
            */

            if (
                hcChoosingStart
            ) {

                hcChooseStartingPosition(
                    cellId
                );

                return;

            }


            /*
               NORMAL GAME MODE
            */

            hcMoveMosquito(
                cellId
            );

        }
    );

}


// =========================================================
// STAY
// =========================================================

if (hcStayBtn) {

    hcStayBtn.addEventListener(
        "click",
        function() {

            if (
                !hcRunning ||
                hcCandleBusy
            ) {

                return;

            }


            hcEndMosquitoTurn();

        }
    );

}


// =========================================================
// END MOSQUITO TURN
// =========================================================

function hcEndMosquitoTurn() {

    if (
        !hcRunning
    ) {

        return;

    }


    /*
       Old attack disappears.
    */

    hcAttackTiles =
        [];


    /*
       Darkness returns.
    */

    hcBoardLit =
        false;


    /*
       New turn.
    */

    hcTurn++;


    /*
       Man gets turn.
    */

    hcManTurn();


    if (
        !hcRunning
    ) {

        return;

    }


    /*
       Recalculate movement.

       If no new bite happened,
       hcFreeFlight is already false.
    */

    hcCalculateMoveTiles();


    hcUpdateHUD();

    hcRenderBoard();

}


// =========================================================
// TORCH BUTTON
// =========================================================

if (hcTorchBtn) {

    hcTorchBtn.addEventListener(
        "click",
        function() {

            hcLightCandle();

        }
    );

}


// =========================================================
// LIGHT TORCH
// =========================================================

function hcLightCandle() {

    if (
        !hcRunning ||
        hcCandleBusy
    ) {

        return;

    }


    hcCandleBusy =
        true;


    /*
       Lighting consumes a turn.
    */

    hcTurn++;


    /*
       Entire board becomes visible.
    */

    hcBoardLit =
        true;


    clearTimeout(
        hcCandleTimeout
    );


    /*
       Blood OR Scary2 appears.

       Blood may be anywhere.

       Scary2 only safe.
    */

    if (
        Math.random() < 0.65
    ) {

        hcSpawnBlood();

    }

    else {

        hcSpawnScary2();

    }


    hcCalculateMoveTiles();

    hcUpdateHUD();

    hcRenderBoard();


    if (hcStatus) {

        hcStatus.textContent =
            "The light reveals what was hiding...";

    }


    hcCandleTimeout =
        setTimeout(
            function() {

                if (
                    !hcRunning
                ) {

                    return;

                }


                /*
                   Darkness returns.

                   IMPORTANT:

                   hcBloodTiles is NOT cleared.

                   Blood remains in memory and can
                   be revealed again by a future torch.
                */

                hcBoardLit =
                    false;


                hcCandleBusy =
                    false;


                hcAttackTiles =
                    [];


                hcRenderBoard();


                /*
                   Man takes his turn.
                */

                hcManTurn();


                if (
                    !hcRunning
                ) {

                    return;

                }


                hcCalculateMoveTiles();

                hcUpdateHUD();

                hcRenderBoard();

            },
            HC_CANDLE_DURATION
        );

}


// =========================================================
// SPAWN BLOOD
// =========================================================

function hcSpawnBlood() {

    const bloodCell =
        hcRandomEmptyCell(
            false
        );


    if (
        !hcBloodTiles.includes(
            bloodCell
        )
    ) {

        hcBloodTiles.push(
            bloodCell
        );

    }


    if (hcStatus) {

        hcStatus.textContent =
            "A drop of blood...";

    }

}


// =========================================================
// SPAWN SCARY2
// =========================================================

function hcSpawnScary2() {

    const scaryCell =
        hcRandomEmptyCell(
            true
        );


    if (
        !hcScaryTiles.includes(
            scaryCell
        )
    ) {

        hcScaryTiles.push(
            scaryCell
        );

    }


    if (hcStatus) {

        hcStatus.textContent =
            "Something moved in the light.";

    }

}


// =========================================================
// GENERIC JUMPSCARE
// =========================================================

function hcShowJumpscare(
    imagePath,
    callback
) {

    hcRunning =
        false;


    clearTimeout(
        hcCandleTimeout
    );


    hcPlayJumpscareAudio();


    if (hcScaryImage) {

        hcScaryImage.src =
            imagePath;

    }


    if (hcJumpscare) {

        hcJumpscare.classList.remove(
            "hidden"
        );

    }


    clearTimeout(
        hcJumpscareTimeout
    );


    hcJumpscareTimeout =
        setTimeout(
            function() {

                if (hcJumpscare) {

                    hcJumpscare.classList.add(
                        "hidden"
                    );

                }


                if (callback) {

                    callback();

                }

            },
            HC_JUMPSCARE_DURATION
        );

}


// =========================================================
// SCARY2 JUMPSCARE
// =========================================================

function hcScaryJumpscare() {

    if (
        !hcRunning
    ) {

        return;

    }


    /*
       Remove the triggered scary tile.

       It has been found.
    */

    const index =
        hcScaryTiles.indexOf(
            hcMosquito
        );


    if (
        index !== -1
    ) {

        hcScaryTiles.splice(
            index,
            1
        );

    }


    hcShowJumpscare(
        "images/scary2.png",
        function() {

            hcDeath();

        }
    );

}


// =========================================================
// OUTER REGION DEATH
// =========================================================

function hcOuterRegionDeath() {

    if (
        !hcRunning
    ) {

        return;

    }


    if (hcStatus) {

        hcStatus.textContent =
            "YOU STEPPED INTO THE DARK.";

    }


    hcShowJumpscare(
        "images/scary1.png",
        function() {

            hcDeath();

        }
    );

}


// =========================================================
// BITE
// =========================================================

function hcBite() {

    if (
        !hcRunning
    ) {

        return;

    }


    /*
       Man gains 10 sanity.
    */

    hcManSanity +=
        10;


    if (
        hcManSanity > 0
    ) {

        hcManSanity =
            0;

    }


    hcUpdateHUD();


    /*
       If bite pushed sanity to zero,
       Mosquito wins.
    */

    if (
        hcManSanity >= 0
    ) {

        hcMosquitoWins();

        return;

    }


    /*
       Jumpscare.
    */

    hcShowJumpscare(
        "images/scary1.png",
        function() {

            hcRunning =
                true;

            hcCandleBusy =
                false;

            hcBoardLit =
                false;


            /*
               =================================================
               FREE FLIGHT
               =================================================

               Bite grants ONE full free-flight movement.

               ALL 36 cells become selectable.

               After the next movement,
               hcFreeFlight becomes false.
            */

            hcFreeFlight =
                true;


            /*
               Old red attack disappears.
            */

            hcAttackTiles =
                [];


            /*
               Show every 6x6 cell.
            */

            hcCalculateMoveTiles();


            hcTurn++;


            hcUpdateHUD();

            hcRenderBoard();


            hcResumeHorrorMusic();


            if (hcStatus) {

                hcStatus.textContent =
                    "THE MAN WAS BITTEN. FLY.";

            }

        }
    );

}


// =========================================================
// MAN FOUND MOSQUITO
// =========================================================

function hcFoundMosquito() {

    if (
        !hcRunning
    ) {

        return;

    }


    hcShowJumpscare(
        "images/scary1.png",
        function() {

            hcDeath();

        }
    );

}


// =========================================================
// DEATH
// =========================================================

function hcDeath() {

    hcRunning =
        false;

    hcChoosingStart =
        false;

    hcSelectedStart =
        null;


    clearTimeout(
        hcCandleTimeout
    );


    clearTimeout(
        hcJumpscareTimeout
    );


    hcMoveTiles =
        [];

    hcAttackTiles =
        [];


    hcBoardLit =
        false;

    hcCandleBusy =
        false;

    hcFreeFlight =
        false;


    hcRemoveStartSelector();


    hcStopHorrorMusic();


    hcRenderBoard();


    if (hcDeathScreen) {

        hcDeathScreen.classList.remove(
            "hidden"
        );

    }

}


// =========================================================
// MOSQUITO WINS
// =========================================================

function hcMosquitoWins() {

    if (
        !hcRunning
    ) {

        return;

    }


    hcRunning =
        false;

    hcChoosingStart =
        false;

    hcSelectedStart =
        null;


    clearTimeout(
        hcCandleTimeout
    );


    clearTimeout(
        hcJumpscareTimeout
    );


    hcMoveTiles =
        [];

    hcAttackTiles =
        [];


    hcBoardLit =
        false;

    hcCandleBusy =
        false;

    hcFreeFlight =
        false;


    hcRemoveStartSelector();


    hcStopHorrorMusic();


    hcUpdateHUD();

    hcRenderBoard();


    const title =
        document.getElementById(
            "hardcoreDeathTitle"
        );

    const message =
        document.getElementById(
            "hardcoreDeathMessage"
        );


    if (title) {

        title.textContent =
            "🦟 MOSQUITO WINS";

    }


    if (message) {

        message.textContent =
            "The Man's sanity has completely collapsed.";

    }


    if (hcDeathScreen) {

        hcDeathScreen.classList.remove(
            "hidden"
        );

    }

}


// =========================================================
// DEATH SCREEN → MENU
// =========================================================

if (hcDeathMenuBtn) {

    hcDeathMenuBtn.addEventListener(
        "click",
        function() {

            hcReturnToMenu();

        }
    );

}


// =========================================================
// MANUAL GAMBLE
// =========================================================

if (hcGambleBtn) {

    hcGambleBtn.addEventListener(
        "click",
        function() {

            if (
                !hcRunning ||
                hcGambles <= 0
            ) {

                return;

            }


            hcGambles--;


            /*
               Old red attack disappears.
            */

            hcAttackTiles =
                [];


            /*
               Generate 2x2 attack.
            */

            hcGenerateGambleAttack();


            /*
               Direct hit.
            */

            if (
                hcAttackTiles.includes(
                    hcMosquito
                )
            ) {

                hcFoundMosquito();

                return;

            }


            /*
               Adjacent = bite.
            */

            if (
                hcAttackIsAdjacentToMosquito()
            ) {

                hcBite();

                return;

            }


            /*
               Gamble miss = +20 sanity.
            */

            hcManSanity +=
                20;


            if (
                hcManSanity > 0
            ) {

                hcManSanity =
                    0;

            }


            hcUpdateHUD();


            if (
                hcManSanity >= 0
            ) {

                hcMosquitoWins();

                return;

            }


            hcCalculateMoveTiles();

            hcRenderBoard();


            if (hcStatus) {

                hcStatus.textContent =
                    "MAD MAN'S GAMBLE MISSED.";

            }

        }
    );

}


// =========================================================
// START HARDCORE
// =========================================================

if (hcHardcoreBtn) {

    hcHardcoreBtn.addEventListener(
        "click",
        function() {

            /*
               Stop normal music.
            */

            hcStartHorrorMusic();


            /*
               Hide all screens.
            */

            document
                .querySelectorAll(
                    ".screen"
                )
                .forEach(
                    function(screen) {

                        screen.classList.add(
                            "hidden"
                        );

                    }
                );


            /*
               Show Hardcore screen.
            */

            if (hcScreen) {

                hcScreen.classList.remove(
                    "hidden"
                );

            }


            /*
               RESET GAME.
            */

            hcRunning =
                false;


            hcChoosingStart =
                true;


            hcSelectedStart =
                null;


            hcTurn =
                1;


            hcGambles =
                5;


            hcManSanity =
                -100;


            /*
               IMPORTANT:

               Mosquito is NOT randomly spawned anymore.
            */

            hcMosquito =
                null;


            /*
               Man still spawns randomly.
            */

            hcMan =
                null;


            hcMoveTiles =
                [];

            hcAttackTiles =
                [];

            hcBloodTiles =
                [];

            hcScaryTiles =
                [];

            hcBoardLit =
                false;

            hcCandleBusy =
                false;

            hcFreeFlight =
                false;


            clearTimeout(
                hcCandleTimeout
            );


            clearTimeout(
                hcJumpscareTimeout
            );


            hcJumpscareAudio.pause();

            hcJumpscareAudio.currentTime =
                0;


            if (hcJumpscare) {

                hcJumpscare.classList.add(
                    "hidden"
                );

            }


            if (hcDeathScreen) {

                hcDeathScreen.classList.add(
                    "hidden"
                );

            }


            const title =
                document.getElementById(
                    "hardcoreDeathTitle"
                );

            const message =
                document.getElementById(
                    "hardcoreDeathMessage"
                );


            if (title) {

                title.textContent =
                    "THE MAN FOUND YOU";

            }


            if (message) {

                message.textContent =
                    "";

            }


            /*
               Man starts randomly in safe area.
            */

            hcMan =
                hcRandomSafeCell();


            /*
               Build board.
            */

            hcBuildBoard();


            /*
               No attack yet.

               The game has not actually started
               until the player chooses a position.
            */

            hcAttackTiles =
                [];


            /*
               Create starting-position UI.
            */

            hcCreateStartSelector();


            /*
               Show starting board.
            */

            hcEnsureSanityDisplay();

            hcUpdateHUD();

            hcRenderBoard();


            if (hcStatus) {

                hcStatus.textContent =
                    "Choose where Mosquito-chan begins.";

            }


            if (hcCornerControls) {

                hcCornerControls.classList.add(
                    "hidden"
                );

            }

        }
    );

}


// =========================================================
// INITIALIZE
// =========================================================

hcBuildBoard();

hcEnsureSanityDisplay();

hcUpdateHUD();