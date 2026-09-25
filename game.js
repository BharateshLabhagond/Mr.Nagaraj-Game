/* =========================================================
   SNAKE XENZIA
   SMOOTH RETRO SNAKE
========================================================= */


/* =========================================================
   CANVAS
========================================================= */

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");

/* =========================================================
   MR.NAGESHA GLOBAL COUNTER
========================================================= */

const COUNTER_API =
    "https://script.google.com/macros/s/AKfycbzUSyZKxgPRjN5MJcTS9Bt0QpxtGsb-eo9FmgxG-Qf0O_p9i2ygb8-65WsnN3crlpX9Xw/exec";


function recordGameStart() {

    fetch(
        COUNTER_API + "?event=game_start",
        {
            method: "GET",
            mode: "no-cors"
        }
    ).catch(() => {
        // Ignore counter errors.
    });

}


function recordShare() {

    fetch(
        COUNTER_API + "?event=share",
        {
            method: "GET",
            mode: "no-cors"
        }
    ).catch(() => {
        // Ignore counter errors.
    });

}

const WIDTH =
    canvas.width;

const HEIGHT =
    canvas.height;


/* =========================================================
   GAME SETTINGS
========================================================= */

const INITIAL_SPEED = 105;

const SEGMENT_SPACING = 12;

const INITIAL_LENGTH = 7;

const SMALL_FOOD_RADIUS = 7;

const BIG_FOOD_RADIUS = 12;


/*
    Big-food lifetime.
*/

const BIG_FOOD_DURATION = 8000;


/*
    Maximum big-food bonus.
*/

const MAX_BIG_FOOD_SCORE = 100;


/*
    Collision distance.
*/

const BODY_COLLISION_DISTANCE = 8;


/* =========================================================
   GAME VARIABLES
========================================================= */

let head = {

    x: WIDTH / 2,

    y: HEIGHT / 2

};


let directionAngle = 0;

let targetAngle = 0;


let snakeSpeed =
    INITIAL_SPEED;


let path = [];


let smallFood = null;

let bigFood = null;


let smallFoodCount = 0;


let score = 0;

let currentLength = INITIAL_LENGTH;


let highScore =
    Number(
        localStorage.getItem(
            "classicSnakeHighScore"
        )
    ) || 0;


let level = 1;


let gameRunning = false;

let paused = false;


/*
    Used during 3-2-1 countdown.
*/

let countdownActive = false;


/*
    Animation.
*/

let animationFrame = null;

let lastFrameTime = 0;


/*
    Big-food timer.
*/

let bigFoodStartTime = 0;

let bigFoodTimer = null;


/*
    Big-food pulse animation.
*/

let pulseTime = 0;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const scoreElement =
    document.getElementById("score");

const levelElement =
    document.getElementById("level");

const foodCounterElement =
    document.getElementById("foodCounter");

const timerBar =
    document.getElementById("timerBar");

const timerText =
    document.getElementById("timerText");


const startScreen =
    document.getElementById("startScreen");

const pauseScreen =
    document.getElementById("pauseScreen");

const gameOverScreen =
    document.getElementById("gameOverScreen");


const finalScore =
    document.getElementById("finalScore");

const finalHigh =
    document.getElementById("finalHigh");


const startButton =
    document.getElementById("startButton");

const restartButton =
    document.getElementById("restartButton");

const mobilePauseButton =
    document.getElementById(
        "mobilePauseButton"
    );

const soundButton =
    document.getElementById("soundButton");

const okButton =
    document.getElementById("okButton");


/* =========================================================
   RETRO SOUND EFFECTS
   Uses the user's supplied WAV files for food/game-over.
========================================================= */

let audioContext = null;
let soundMuted = false;

const smallFoodAudio =
    new Audio("./eat_small_food_.wav");

const bigFoodAudio =
    new Audio("./eat_big_food.wav");

const gameOverAudio =
    new Audio("./game_over.wav");

smallFoodAudio.preload = "auto";
bigFoodAudio.preload = "auto";
gameOverAudio.preload = "auto";

function getAudioContext() {

    const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContextClass) {
        return null;
    }

    if (!audioContext) {
        audioContext =
            new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    return audioContext;
}

function playTone(
    startFrequency,
    endFrequency,
    duration,
    volume = 0.035,
    type = "square"
) {

    if (soundMuted) {
        return;
    }

    const audio =
        getAudioContext();

    if (!audio) {
        return;
    }

    const now =
        audio.currentTime;

    const oscillator =
        audio.createOscillator();

    const gain =
        audio.createGain();

    oscillator.type =
        type;

    oscillator.frequency.setValueAtTime(
        startFrequency,
        now
    );

    oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(40, endFrequency),
        now + duration
    );

    gain.gain.setValueAtTime(
        0.0001,
        now
    );

    gain.gain.exponentialRampToValueAtTime(
        volume,
        now + 0.008
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + duration
    );

    oscillator.connect(gain);
    gain.connect(audio.destination);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.01);
}



/*
   Play one of the supplied WAV files.
*/
function playAudioAsset(audioElement) {

    if (soundMuted || !audioElement) {
        return;
    }

    audioElement.currentTime = 0;

    const result =
        audioElement.play();

    if (result &&
        typeof result.catch === "function") {

        result.catch(
            error => {
                console.warn(
                    "Audio playback was blocked:",
                    error
                );
            }
        );

    }

}

/*
   SNAKE EATS SMALL FOOD
   Uses: eat_small_food_.wav
*/
function playFoodSound() {

    playAudioAsset(
        smallFoodAudio
    );

}

/*
   SNAKE EATS BIG FOOD
   Uses: eat_big_food.wav
*/
function playBigFoodSound() {

    playAudioAsset(
        bigFoodAudio
    );

}

/*
   GAME OVER
   Uses: game_over.wav
*/
function playGameOverSound() {

    playAudioAsset(
        gameOverAudio
    );

}

function updateSoundButton() {

    if (!soundButton) {
        return;
    }

    soundButton.textContent =
        soundMuted ? "UNMUTE" : "MUTE";

    soundButton.setAttribute(
        "aria-label",
        soundMuted
            ? "Unmute sound"
            : "Mute sound"
    );

}

if (soundButton) {

    soundButton.addEventListener(
        "click",
        () => {

            soundMuted =
                !soundMuted;

            updateSoundButton();

        }
    );

}

updateSoundButton();


/* =========================================================
   SCORE FORMAT
========================================================= */

function formatScore(value) {

    return String(value)
        .padStart(4, "0");

}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    scoreElement.textContent =
        formatScore(score);


    levelElement.textContent =
        `LV ${String(level).padStart(2, "0")}`;


    foodCounterElement.textContent =
        `${smallFoodCount}/5`;

}


/* =========================================================
   INITIALIZE
========================================================= */

function initializeGame() {

    head = {

        x: WIDTH / 2,

        y: HEIGHT / 2

    };


    directionAngle = 0;

    targetAngle = 0;


    snakeSpeed = INITIAL_SPEED;


    score = 0;

    currentLength = INITIAL_LENGTH;

    level = 1;

    smallFoodCount = 0;


    path = [];


    /*
        Create initial body path.
    */

    for (
        let i = 0;
        i < INITIAL_LENGTH * SEGMENT_SPACING;
        i += 2
    ) {

        path.push({

            x: head.x - i,

            y: head.y

        });

    }


    smallFood =
        createFood();


    bigFood = null;


    pulseTime = 0;


    stopBigFoodTimer();

    resetTimerDisplay();


    updateHUD();

    drawGame();

}


/* =========================================================
   START GAME
========================================================= */

function startGame() {

    recordGameStart();
   
    stopAnimation();

    stopBigFoodTimer();


    initializeGame();


    gameRunning = true;

    paused = false;

    countdownActive = false;


    startScreen.classList.add(
        "hidden"
    );

    pauseScreen.classList.add(
        "hidden"
    );

    gameOverScreen.classList.add(
        "hidden"
    );



    updatePauseButton();


    lastFrameTime =
        performance.now();


    animationFrame =
        requestAnimationFrame(
            gameLoop
        );

}


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop(timestamp) {

    if (!gameRunning) {

        return;

    }


    let delta =
        timestamp -
        lastFrameTime;


    lastFrameTime =
        timestamp;


    /*
        Avoid huge jumps.
    */

    delta =
        Math.min(
            delta,
            40
        );


    /*
        Game movement only occurs
        when not paused and not
        in countdown.
    */

    if (
        !paused &&
        !countdownActive
    ) {

        updateSnake(delta);

    }


    /*
        Continue the subtle big-food
        pulse even during normal
        rendering.
    */

    pulseTime +=
        delta;


    drawGame();


    animationFrame =
        requestAnimationFrame(
            gameLoop
        );

}


/* =========================================================
   UPDATE SNAKE
========================================================= */

function updateSnake(delta) {

    const distance =
        snakeSpeed *
        (delta / 1000);


    /*
        Smooth turning.
    */

    directionAngle =
        smoothAngle(
            directionAngle,
            targetAngle,
            0.35
        );


    /*
        Move continuously.
    */

    head.x +=
        Math.cos(directionAngle) *
        distance;


    head.y +=
        Math.sin(directionAngle) *
        distance;


    /*
        Screen wrapping.
    */

    head.x =
        wrap(
            head.x,
            WIDTH
        );


    head.y =
        wrap(
            head.y,
            HEIGHT
        );


    /*
        Record actual path.
    */

    recordPath();


    /*
        Check foods.
    */

    checkFoodCollision();


    /*
        Self collision.
    */

    if (
        checkBodyCollision()
    ) {

        endGame();

    }

}


/* =========================================================
   RECORD HEAD PATH
========================================================= */

function recordPath() {

    const last =
        path[0];


    if (
        !last ||
        distanceBetween(
            head,
            last
        ) >= 2
    ) {

        path.unshift({

            x: head.x,

            y: head.y

        });

    }


    const maximumPath =
        getSnakeLength() *
        SEGMENT_SPACING +
        100;


    while (
        path.length >
        maximumPath
    ) {

        path.pop();

    }

}


/* =========================================================
   SNAKE LENGTH
========================================================= */

function getSnakeLength() {

    return currentLength;

}


/* =========================================================
   BODY POSITION
========================================================= */

function getBodyPosition(index) {

    if (
        index === 0
    ) {

        return {

            x: head.x,

            y: head.y

        };

    }


    const targetDistance =
        index *
        SEGMENT_SPACING;


    let travelled = 0;


    for (
        let i = 0;
        i < path.length - 1;
        i++
    ) {

        const current =
            path[i];

        const next =
            path[i + 1];


        const segmentDistance =
            distanceBetweenWrapped(
                current,
                next
            );


        if (
            travelled +
            segmentDistance >=
            targetDistance
        ) {

            const remaining =
                targetDistance -
                travelled;


            const ratio =
                segmentDistance === 0
                    ? 0
                    : remaining /
                      segmentDistance;


            return interpolateWrapped(
                current,
                next,
                ratio
            );

        }


        travelled +=
            segmentDistance;

    }


    return path[
        path.length - 1
    ] || head;

}


/* =========================================================
   FOOD COLLISION
========================================================= */

function checkFoodCollision() {

    /*
        SMALL FOOD
    */

    if (
        smallFood &&
        wrappedDistance(
            head,
            smallFood
        ) <=
        SMALL_FOOD_RADIUS + 8
    ) {

        catchSmallFood();

    }


    /*
        BIG FOOD
    */

    if (
        bigFood &&
        wrappedDistance(
            head,
            bigFood
        ) <=
        BIG_FOOD_RADIUS + 9
    ) {

        catchBigFood();

    }

}


/* =========================================================
   SMALL FOOD
========================================================= */

function catchSmallFood() {

    playFoodSound();

    score += 10;
    
    currentLength += 1;


    smallFoodCount++;


    /*
        Every fifth small food
        creates the big food.

        The small food remains
        independently active.
    */

    if (
        smallFoodCount >= 5 &&
        !bigFood
    ) {

        spawnBigFood();

    }


    /*
        Create another small food.
    */

    smallFood =
        createFood();


    level =
        Math.floor(
            score / 50
        ) + 1;


    updateSpeed();

    updateHighScore();

    updateHUD();

}


/* =========================================================
   BIG FOOD
========================================================= */

function spawnBigFood() {

    bigFood =
        createFood();


    bigFoodStartTime =
        performance.now();


    startBigFoodTimer();

}


/* =========================================================
   BIG FOOD TIMER
========================================================= */

function startBigFoodTimer() {

    stopBigFoodTimer();


    bigFoodTimer =
        requestAnimationFrame(
            updateBigFoodTimer
        );

}


/* =========================================================
   UPDATE BIG FOOD TIMER
========================================================= */

function updateBigFoodTimer(timestamp) {

    if (
        !bigFood ||
        !gameRunning

    ) {

        resetTimerDisplay();

        return;

    }


    /*
        CRITICAL:

        Do nothing while paused or
        during 3-2-1 countdown.

        Therefore the timer does NOT
        lose those pause seconds.
    */

    if (
        paused ||
        countdownActive
    ) {

        bigFoodTimer =
            requestAnimationFrame(
                updateBigFoodTimer
            );

        return;

    }


    const elapsed =
        timestamp -
        bigFoodStartTime;


    const remaining =
        Math.max(
            0,
            BIG_FOOD_DURATION -
            elapsed
        );


    const percentage =
        remaining /
        BIG_FOOD_DURATION;


    timerBar.style.width =
        `${percentage * 100}%`;


    timerText.textContent =
        Math.ceil(
            remaining / 1000
        );


    /*
        Time expired.
    */

    if (
    remaining <= 0
) {

    bigFood = null;

    /*
        Big food was missed.
        Start a fresh 5-small-food cycle.
    */

    smallFoodCount = 0;

    updateHUD();

    stopBigFoodTimer();

    resetTimerDisplay();

    return;

}


    bigFoodTimer =
        requestAnimationFrame(
            updateBigFoodTimer
        );

}


/* =========================================================
   CATCH BIG FOOD
========================================================= */

function catchBigFood() {

    playBigFoodSound();

    const elapsed =
        performance.now() -
        bigFoodStartTime;


    const remaining =
        Math.max(
            0,
            BIG_FOOD_DURATION -
            elapsed
        );


    const percentage =
        remaining /
        BIG_FOOD_DURATION;


    /*
        Faster = higher bonus.
    */

    let bonus =
        Math.round(
            MAX_BIG_FOOD_SCORE *
            percentage
        );


   bonus =
        Math.max(
            10,
            bonus
        );


    score += bonus;
    
    currentLength += 2;


    /*
        Big food disappears.
    */

    /*
        Big food disappears.
    */

    bigFood = null;


    stopBigFoodTimer();

    resetTimerDisplay();


    /*
        Start a fresh 5-food cycle.
    */

    smallFoodCount = 0;


    level =
        Math.floor(
            score / 50
        ) + 1;


    updateSpeed();

    updateHighScore();

    updateHUD();

}


/* =========================================================
   CREATE FOOD
========================================================= */

function createFood() {

    let food;

    let attempts = 0;


    do {

        food = {

            x:
                Math.random() *
                WIDTH,

            y:
                Math.random() *
                HEIGHT

        };


        attempts++;

    }
    while (
        foodTooCloseToSnake(food) &&
        attempts < 1000
    );


    return food;

}


/* =========================================================
   FOOD POSITION
========================================================= */

function foodTooCloseToSnake(food) {

    if (
        wrappedDistance(
            food,
            head
        ) < 30
    ) {

        return true;

    }


    const length =
        getSnakeLength();


    for (
        let i = 1;
        i < length;
        i++
    ) {

        const body =
            getBodyPosition(i);


        if (
            wrappedDistance(
                food,
                body
            ) < 20
        ) {

            return true;

        }

    }


    /*
        Don't place the new food
        directly on existing food.
    */

    if (
        smallFood &&
        wrappedDistance(
            food,
            smallFood
        ) < 25
    ) {

        return true;

    }


    if (
        bigFood &&
        wrappedDistance(
            food,
            bigFood
        ) < 25
    ) {

        return true;

    }


    return false;

}


/* =========================================================
   SELF COLLISION
========================================================= */

function checkBodyCollision() {

    const length =
        getSnakeLength();


    for (
        let i = 5;
        i < length;
        i++
    ) {

        const body =
            getBodyPosition(i);


        if (
            wrappedDistance(
                head,
                body
            ) <
            BODY_COLLISION_DISTANCE
        ) {

            return true;

        }

    }


    return false;

}


/* =========================================================
   SPEED
========================================================= */

function updateSpeed() {
    snakeSpeed = INITIAL_SPEED;
}


/* =========================================================
   HIGH SCORE
========================================================= */

function updateHighScore() {

    if (
        score > highScore
    ) {

        highScore =
            score;


        localStorage.setItem(
            "classicSnakeHighScore",
            highScore
        );

    }

}


/* =========================================================
   DRAW GAME
========================================================= */

function drawGame() {

    clearCanvas();

    drawLCDTexture();

    drawSmallFood();

    drawBigFood();

    drawSnake();

}


/* =========================================================
   CLEAR CANVAS
========================================================= */

function clearCanvas() {

    ctx.fillStyle =
        "#b8b51d";


    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );

}


/* =========================================================
   LCD TEXTURE
========================================================= */

function drawLCDTexture() {

    ctx.fillStyle =
        "rgba(60, 58, 0, 0.025)";


    for (
        let y = 0;
        y < HEIGHT;
        y += 4
    ) {

        ctx.fillRect(
            0,
            y,
            WIDTH,
            1
        );

    }

}


/* =========================================================
   DRAW SNAKE
========================================================= */

function drawSnake() {

    const length =
        getSnakeLength();


    for (
        let i = length - 1;
        i >= 0;
        i--
    ) {

        const segment =
            getBodyPosition(i);


        const size = 11;


        let angle =
            directionAngle;


        if (
            i > 0
        ) {

            const previous =
                getBodyPosition(
                    Math.max(
                        0,
                        i - 1
                    )
                );


            angle =
                Math.atan2(

                    previous.y - segment.y,

                    previous.x - segment.x

                );

        }


        ctx.save();


        ctx.translate(
            segment.x,
            segment.y
        );


        ctx.rotate(angle);


        /*
            Main body.
        */

        ctx.fillStyle =
            "#373506";


        ctx.fillRect(

            -size / 2,
            -size / 2,

            size,
            size

        );


        /*
            Connecting part.

            This makes the body look
            continuous rather than
            like separate blocks.
        */

        ctx.fillRect(

            -size / 2 - 3,
            -size / 2 + 2,

            7,
            size - 4

        );


        /*
            Head.
        */

        if (
            i === 0
        ) {

            drawHead(size);

        }


        ctx.restore();

    }

}


/* =========================================================
   HEAD
========================================================= */
/* =========================================================
   HEAD
========================================================= */

function drawHead(size) {

    /*
        Identify main visual details based on retro photo.
    */

    const headColor = "#292704"; // Dark green/black
    const eyeColor = "#b8b51d";  // Matches LCD background
    const pixelSize = size / 4;  // Define a standard "pixel" unit for features

    /*
        Main, blocky head square.
    */

    ctx.fillStyle = headColor;
    ctx.fillRect(-size / 2, -size / 2, size, size);

    /*
        Retro, single side-view eye.
        Renders a single background-colored pixel on the side of the dark head.
    */

    ctx.fillStyle = eyeColor;
    ctx.fillRect(pixelSize, -pixelSize * 1.5, pixelSize, pixelSize);

    /*
        Pixelated forked tongue, extending forward.
    */

    // Set tongue color (slightly darker than main head)
    ctx.fillStyle = "#1e1c03";

    // Stem of the tongue
    ctx.fillRect(size / 2, -pixelSize / 2, pixelSize, pixelSize);

    // Forks
    ctx.fillRect(size / 2 + pixelSize, -pixelSize * 1.5, pixelSize, pixelSize);
    ctx.fillRect(size / 2 + pixelSize, pixelSize * 0.5, pixelSize, pixelSize);

    // Tips
    ctx.fillRect(size / 2 + 2 * pixelSize, -pixelSize * 2, pixelSize, pixelSize);
    ctx.fillRect(size / 2 + 2 * pixelSize, pixelSize, pixelSize, pixelSize);

}

/* =========================================================
   SMALL FOOD
========================================================= */

/* =========================================================
   DRAW SMALL FOOD (Pixel Apple)
========================================================= */

function drawSmallFood() {

    if (!smallFood) {

        return;

    }

    /*
        RENDER A RETRO PIXEL APPLE (image_1.png).
    */

    // Hardcode dark color for all dark parts of the apple.
    const darkColor = "#373506"; // Dark body, stem, and forks.

    // Draw the precise pixel apple shape.
    drawPixelApple(
        smallFood.x,
        smallFood.y,
        SMALL_FOOD_RADIUS,
        darkColor
    );

}

// Helper to draw the precise pixel pattern from image_1.png.
function drawPixelApple(x, y, radius, darkColor) {
    // Pixel scaling to fit defined food radius.
    const pixelSize = Math.max(1, Math.round(radius / 4));

    // Define a map of dark pixels.
    // '1' draws a dark pixel of color darkColor.
    // ' ' (space) draws nothing, revealing the background (creates the reflection hole and gaps).
    const pattern = [
        "    1 1  ", // Stem forks
        "     1   ", // Stem stem
        "   1111  ", // Body top row
        "  11111  ", // Body
        " 1 11111 ", // Body with internal reflection (bite hole)
        " 1111111 ", // Body
        "  11111  ", // Body bottom row
    ];

    const width = pattern[0].length * pixelSize;
    const height = pattern.length * pixelSize;
    const startX = Math.round(x - width / 2);
    const startY = Math.round(y - height / 2);

    // Iteratively draw dark pixels only.
    for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
            if (pattern[row][col] === "1") {
                ctx.fillStyle = darkColor;
                ctx.fillRect(startX + col * pixelSize, startY + row * pixelSize, pixelSize, pixelSize);
            }
        }
    }
}


/* =========================================================
   BIG FOOD
========================================================= */

function drawBigFood() {

    if (!bigFood) {

        return;

    }


    /*
        Smooth pulse.

        Range:
        approximately 0.92 -> 1.08
    */

    const pulse =
    1 +
    Math.sin(
        pulseTime * 0.006
    ) *
    0.20;


    /*
        ONLY THE BIG BUBBLE.

        No plus sign.
    */

    

    drawPixelBubble(

        bigFood.x,

        bigFood.y,

        BIG_FOOD_RADIUS,

        pulse,
        "#d00000"
    );

}


/* =========================================================
   PIXEL BUBBLE
========================================================= */

function drawPixelBubble(x, y, radius, scale = 1,color = "#373506") {

    const pixelSize = Math.max(
        1,
        Math.round(radius * scale / 4)
    );

    const pattern = [
        "  111  ",
        " 11111 ",
        "1111111",
        "1111111",
        "1111111",
        " 11111 ",
        "  111  "
    ];

    const width =
        pattern[0].length * pixelSize;

    const height =
        pattern.length * pixelSize;

    const startX =
        Math.round(x - width / 2);

    const startY =
        Math.round(y - height / 2);

    ctx.fillStyle = color;

    for (
        let row = 0;
        row < pattern.length;
        row++
    ) {

        for (
            let col = 0;
            col < pattern[row].length;
            col++
        ) {

            if (pattern[row][col] === "1") {

                ctx.fillRect(
                    startX + col * pixelSize,
                    startY + row * pixelSize,
                    pixelSize,
                    pixelSize
                );

            }
        }
    }
}

/* =========================================================
   CHANGE DIRECTION
========================================================= */

function changeDirection(
    newAngle
) {

    const difference =
        normalizeAngle(
            newAngle -
            directionAngle
        );


    /*
        Prevent immediate reverse.
    */

    if (
        Math.abs(difference) >
        Math.PI * 0.75
    ) {

        return;

    }


    targetAngle =
        newAngle;

}


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();


        /*
            Prevent page scrolling
            when using arrows or space.
        */

        if (
            key === "arrowup" ||
            key === "arrowdown" ||
            key === "arrowleft" ||
            key === "arrowright" ||
            key === " "
        ) {

            event.preventDefault();

        }


        /*
            Arrow controls.
        */

        if (
            key === "arrowup"
        ) {

            changeDirection(
                -Math.PI / 2
            );

        }


        else if (
            key === "arrowdown"
        ) {

            changeDirection(
                Math.PI / 2
            );

        }


        else if (
            key === "arrowleft"
        ) {

            changeDirection(
                Math.PI
            );

        }


        else if (
            key === "arrowright"
        ) {

            changeDirection(
                0
            );

        }


        /*
            SPACE CONTROL
        */

        else if (
            key === " "
        ) {

            handleSpace();

        }

    }
);


/* =========================================================
   TOUCH SWIPE CONTROLS
========================================================= */

let touchStartX = 0;
let touchStartY = 0;

const SWIPE_THRESHOLD = 25;

canvas.addEventListener(
    "touchstart",
    event => {

        const touch = event.touches[0];

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;

    },
    { passive: true }
);


canvas.addEventListener(
    "touchend",
    event => {

        const touch = event.changedTouches[0];

        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;

        const deltaX =
            touchEndX - touchStartX;

        const deltaY =
            touchEndY - touchStartY;


        // Ignore very small touches/taps
        if (
            Math.abs(deltaX) < SWIPE_THRESHOLD &&
            Math.abs(deltaY) < SWIPE_THRESHOLD
        ) {
            return;
        }


        // Horizontal swipe
        if (
            Math.abs(deltaX) >
            Math.abs(deltaY)
        ) {

            if (deltaX > 0) {

                // Swipe RIGHT
                changeDirection(0);

            } else {

                // Swipe LEFT
                changeDirection(Math.PI);

            }

        }

        // Vertical swipe
        else {

            if (deltaY > 0) {

                // Swipe DOWN
                changeDirection(Math.PI / 2);

            } else {

                // Swipe UP
                changeDirection(-Math.PI / 2);

            }

        }

    },
    { passive: true }
);

/* =========================================================
   SPACE CONTROL
========================================================= */

function handleSpace() {

    /*
        Game hasn't started
    */

    if (!gameRunning) {

        startGame();

        return;

    }


    /*
        Pause
    */

    if (!paused) {

        pauseGame();

        return;

    }


    /*
        Resume immediately
        No 3-2-1 countdown
    */

    resumeGameImmediately();

}


/* =========================================================
   PAUSE
========================================================= */

function pauseGame() {

    if (
        !gameRunning ||
        paused ||
        countdownActive
    ) {

        return;

    }


    paused = true;


    pauseScreen.classList.remove(
        "hidden"
    );


    updatePauseButton();


    /*
        The important part:

        We do NOT alter bigFoodStartTime.

        Therefore the big-food timer effectively
        freezes while paused.
    */

}



/* =========================================================
   RESUME IMMEDIATELY
========================================================= */

function resumeGameImmediately() {

    if (
        !gameRunning ||
        !paused
    ) {

        return;

    }


    pauseScreen.classList.add(
        "hidden"
    );


    countdownActive = false;

    paused = false;


    lastFrameTime =
        performance.now();


    updatePauseButton();

}


/* =========================================================
   MOBILE PAUSE BUTTON
========================================================= */

mobilePauseButton.addEventListener(
    "click",
    () => {

        if (!gameRunning) {

            startGame();

            return;

        }


        if (!paused) {

            pauseGame();

        }

        else {

            resumeGameImmediately();

        }

    }
);

/* =========================================================
   OK BUTTON
========================================================= */

if (okButton) {

    okButton.addEventListener(
        "click",
        () => {

            /*
                Start screen
            */

            if (!gameRunning) {

                startGame();

                return;

            }


            /*
                Playing
            */

            if (!paused) {

                pauseGame();

                return;

            }


            /*
                Paused
            */

            resumeGameImmediately();

        }
    );

}
/* =========================================================
   UPDATE MOBILE BUTTON
========================================================= */

function updatePauseButton() {

    if (!gameRunning) {

        mobilePauseButton.textContent =
            "START";

        return;

    }


    if (paused) {

        mobilePauseButton.textContent =
            "RESUME";

    }

    else {

        mobilePauseButton.textContent =
            "PAUSE";

    }

}


/* =========================================================
   NAVIGATION BUTTONS
========================================================= */

document
    .querySelectorAll(
        ".nav-button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const direction =
                        button.dataset.direction;


                    if (
                        direction === "up"
                    ) {

                        changeDirection(
                            -Math.PI / 2
                        );

                    }


                    else if (
                        direction === "down"
                    ) {

                        changeDirection(
                            Math.PI / 2
                        );

                    }


                    else if (
                        direction === "left"
                    ) {

                        changeDirection(
                            Math.PI
                        );

                    }


                    else if (
                        direction === "right"
                    ) {

                        changeDirection(
                            0
                        );

                    }

                }
            );

        }
    );


/* =========================================================
   START BUTTON
========================================================= */

startButton.addEventListener(
    "click",
    startGame
);


/* =========================================================
   RESTART BUTTON
========================================================= */

restartButton.addEventListener(
    "click",
    startGame
);


/* =========================================================
   GAME OVER
========================================================= */

function endGame() {

    playGameOverSound();

    gameRunning = false;

    paused = false;

    countdownActive = false;


    stopAnimation();

    stopBigFoodTimer();


    updateHighScore();


    finalScore.textContent =
        formatScore(score);


    finalHigh.textContent =
        formatScore(highScore);


    gameOverScreen.classList.remove(
        "hidden"
    );




    pauseScreen.classList.add(
        "hidden"
    );


    updatePauseButton();

}


/* =========================================================
   STOP ANIMATION
========================================================= */

function stopAnimation() {

    if (
        animationFrame
    ) {

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame = null;

    }

}


/* =========================================================
   STOP BIG FOOD TIMER
========================================================= */

function stopBigFoodTimer() {

    if (
        bigFoodTimer
    ) {

        cancelAnimationFrame(
            bigFoodTimer
        );

        bigFoodTimer = null;

    }

}


/* =========================================================
   RESET TIMER DISPLAY
========================================================= */

function resetTimerDisplay() {

    timerBar.style.width =
        "0%";

    timerText.textContent =
        "—";

}


/* =========================================================
   WRAP
========================================================= */

function wrap(
    value,
    max
) {

    if (
        value < 0
    ) {

        return value + max;

    }


    if (
        value >= max
    ) {

        return value - max;

    }


    return value;

}


/* =========================================================
   DISTANCE
========================================================= */

function distanceBetween(
    a,
    b
) {

    return Math.sqrt(

        Math.pow(
            a.x - b.x,
            2
        ) +

        Math.pow(
            a.y - b.y,
            2
        )

    );

}


/* =========================================================
   WRAPPED DISTANCE
========================================================= */

function wrappedDistance(
    a,
    b
) {

    let dx =
        Math.abs(
            a.x - b.x
        );


    let dy =
        Math.abs(
            a.y - b.y
        );


    dx =
        Math.min(
            dx,
            WIDTH - dx
        );


    dy =
        Math.min(
            dy,
            HEIGHT - dy
        );


    return Math.sqrt(
        dx * dx +
        dy * dy
    );

}


/* =========================================================
   WRAPPED PATH DISTANCE
========================================================= */

function distanceBetweenWrapped(
    a,
    b
) {

    return wrappedDistance(
        a,
        b
    );

}


/* =========================================================
   INTERPOLATE WRAPPED
========================================================= */

function interpolateWrapped(
    a,
    b,
    ratio
) {

    let dx =
        b.x - a.x;

    let dy =
        b.y - a.y;


    if (
        Math.abs(dx) >
        WIDTH / 2
    ) {

        if (
            dx > 0
        ) {

            dx -= WIDTH;

        }

        else {

            dx += WIDTH;

        }

    }


    if (
        Math.abs(dy) >
        HEIGHT / 2
    ) {

        if (
            dy > 0
        ) {

            dy -= HEIGHT;

        }

        else {

            dy += HEIGHT;

        }

    }


    return {

        x:
            wrap(
                a.x +
                dx * ratio,
                WIDTH
            ),

        y:
            wrap(
                a.y +
                dy * ratio,
                HEIGHT
            )

    };

}


/* =========================================================
   ANGLE NORMALIZATION
========================================================= */

function normalizeAngle(
    angle
) {

    while (
        angle > Math.PI
    ) {

        angle -=
            Math.PI * 2;

    }


    while (
        angle < -Math.PI
    ) {

        angle +=
            Math.PI * 2;

    }


    return angle;

}


/* =========================================================
   SMOOTH ANGLE
========================================================= */

function smoothAngle(
    current,
    target,
    amount
) {

    const difference =
        normalizeAngle(
            target -
            current
        );


    return normalizeAngle(

        current +
        difference *
        amount

    );

}

/* =========================================================
   SHARE BUTTON
========================================================= */

/* =========================================================
   SHARE MR.NAGESHA
========================================================= */

const shareButton =
    document.getElementById("shareButton");

if (shareButton) {

    shareButton.addEventListener(
        "click",
        async () => {

           recordShare();
            const currentHighScore =
                formatScore(highScore);

            const shareData = {

                title:
                    "MR.Nagesha",

                text:
                    `🎮 This is my highest score in MR.Nagesha: ${currentHighScore}\nTry to beat me! 😎`,

                url:
                    window.location.href

            };


            try {

                if (navigator.share) {

                    await navigator.share(
                        shareData
                    );

                } else {

                    await navigator.clipboard.writeText(
                        `${shareData.text}\n${shareData.url}`
                    );

                    alert(
                        "MR.Nagesha score and link copied! Share it with your friends."
                    );

                }

            }

            catch (error) {

                if (
                    error.name !==
                    "AbortError"
                ) {

                    console.error(
                        "Share failed:",
                        error
                    );

                    try {

                        await navigator.clipboard.writeText(
                            `${shareData.text}\n${shareData.url}`
                        );

                        alert(
                            "MR.Nagesha score and link copied! Share it with your friends."
                        );

                    }

                    catch (copyError) {

                        alert(
                            "Please copy the game link and share it with your friends."
                        );

                    }

                }

            }

        }
    );

}

/* =========================================================
   BUTTON PRESS FEEDBACK
   ========================================================= */

document
    .querySelectorAll(
        ".nav-button, .lcd-button, .physical-button, .ok-button, #shareButton"
    )
    .forEach(
        button => {

            const press = () => {

                button.classList.add(
                    "button-pressed"
                );


            };

            const release = () => {

                button.classList.remove(
                    "button-pressed"
                );

            };

            button.addEventListener(
                "pointerdown",
                press
            );

            button.addEventListener(
                "pointerup",
                release
            );

            button.addEventListener(
                "pointercancel",
                release
            );

            button.addEventListener(
                "pointerleave",
                release
            );

        }
    );


/* =========================================================
   INITIAL STATE
========================================================= */

updateHUD();

initializeGame();

updatePauseButton();

/* =========================================================
   RESPONSIVE VIEWPORT FIT
   Keeps the complete phone UI visible on laptop and mobile.
========================================================= */

function fitGameToScreen() {
    const page = document.querySelector(".page");
    const phone = document.querySelector(".phone");

    if (!page || !phone) return;

    page.style.transform = "none";
    page.style.transformOrigin = "center center";

    const vw = window.visualViewport
        ? window.visualViewport.width
        : window.innerWidth;

    const vh = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;

    const margin = 8;
    const availableWidth = Math.max(0, vw - margin * 2);
    const availableHeight = Math.max(0, vh - margin * 2);

    const pageWidth = page.offsetWidth;
    const pageHeight = page.offsetHeight;

    if (!pageWidth || !pageHeight) return;

    const scale = Math.min(
        1,
        availableWidth / pageWidth,
        availableHeight / pageHeight
    );

    page.style.transform = `scale(${scale})`;
}

window.addEventListener("load", () => {
    requestAnimationFrame(fitGameToScreen);
});

window.addEventListener("resize", fitGameToScreen);
window.addEventListener("orientationchange", () => {
    setTimeout(fitGameToScreen, 150);
});

if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", fitGameToScreen);
}

setTimeout(fitGameToScreen, 100);




/* =========================================================
   PWA INSTALL SYSTEM
   ========================================================= */

let deferredInstallPrompt = null;

const installPopup =
    document.getElementById("installPopup");

const installYesButton =
    document.getElementById("installYesButton");

const installNoButton =
    document.getElementById("installNoButton");

const installAppButton =
    document.getElementById("installAppButton");


/*
   Check whether the game is already installed.
*/

function isAppInstalled() {

    return (
        window.matchMedia(
            "(display-mode: standalone)"
        ).matches ||

        window.navigator.standalone === true
    );
}


/*
   Hide install controls.
*/

function hideInstallControls() {

    if (installPopup) {
        installPopup.classList.add("hidden");
    }

    if (installAppButton) {
        installAppButton.classList.add("hidden");
    }
}


/*
   Browser provides the real PWA
   installation prompt.
*/

window.addEventListener(
    "beforeinstallprompt",
    event => {

        event.preventDefault();

        deferredInstallPrompt = event;


        /*
           If already installed,
           don't show anything.
        */

        if (isAppInstalled()) {

            hideInstallControls();

            return;
        }


        /*
           Show bottom-right install
           button.

           The first popup is handled
           separately below.
        */

        if (installAppButton) {

            installAppButton.classList.remove(
                "hidden"
            );

        }


        /*
           Show first-time popup only.
        */

        const popupAlreadyShown =
            localStorage.getItem(
                "mrNageshaInstallAsked"
            );

        if (!popupAlreadyShown) {

            setTimeout(() => {

                if (installPopup) {

                    installPopup.classList.remove(
                        "hidden"
                    );

                }

            }, 1200);

        }

    }
);


/*
   YES
*/

if (installYesButton) {

    installYesButton.addEventListener(
        "click",
        async () => {

            /*
               Never show the popup again.
            */

            localStorage.setItem(
                "mrNageshaInstallAsked",
                "yes"
            );


            if (!deferredInstallPrompt) {

                hideInstallControls();

                return;
            }


            try {

                await deferredInstallPrompt.prompt();

                const result =
                    await deferredInstallPrompt.userChoice;

                console.log(
                    "Install result:",
                    result.outcome
                );

            }
            catch (error) {

                console.error(
                    "Installation failed:",
                    error
                );

            }


            deferredInstallPrompt = null;

            hideInstallControls();

        }
    );

}


/*
   NO
*/

if (installNoButton) {

    installNoButton.addEventListener(
        "click",
        () => {

            /*
               User said NO.

               Remember permanently so
               popup never appears again.
            */

            localStorage.setItem(
                "mrNageshaInstallAsked",
                "no"
            );


            if (installPopup) {

                installPopup.classList.add(
                    "hidden"
                );

            }

        }
    );

}


/*
   Bottom-right install button.
*/

if (installAppButton) {

    installAppButton.addEventListener(
        "click",
        async () => {

            if (!deferredInstallPrompt) {

                return;
            }


            try {

                await deferredInstallPrompt.prompt();

                const result =
                    await deferredInstallPrompt.userChoice;

                console.log(
                    "Install result:",
                    result.outcome
                );

            }
            catch (error) {

                console.error(
                    "Installation failed:",
                    error
                );

            }


            deferredInstallPrompt = null;

            installAppButton.classList.add(
                "hidden"
            );

        }
    );

}


/*
   When installation succeeds.
*/

window.addEventListener(
    "appinstalled",
    () => {

        localStorage.setItem(
            "mrNageshaInstallAsked",
            "installed"
        );

        hideInstallControls();

        console.log(
            "MR.Nagesha installed successfully."
        );

    }
);


/*
   If already running as an installed app,
   don't show the install controls.
*/

if (isAppInstalled()) {

    hideInstallControls();

}
