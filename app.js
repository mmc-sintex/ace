/* =====================================================
   PIXEL FIGHTERS
   VERSION 1
===================================================== */


/* =====================================================
   GAME SETTINGS
===================================================== */

const game = {

    mode: 1,

    difficulty: 50,

    player1Control: "keyboard",

    player2Control: "keyboard",

    maxHealth: 100,

    health1: 100,

    health2: 100,

    timer: 99,

    running: false,

    keys: {},

    gamepads: [],

    fighters: {

        p1: {
            x: 25,
            y: 0,
            velocityY: 0,

            jumping: false,
            punching: false,
            kicking: false,
            blocking: false,

            facing: 1
        },

        p2: {
            x: 70,
            y: 0,
            velocityY: 0,

            jumping: false,
            punching: false,
            kicking: false,
            blocking: false,

            facing: -1
        }

    }

};


/* =====================================================
   ELEMENTS
===================================================== */

const menu =
    document.getElementById("menu");

const fight =
    document.getElementById("fight");

const difficulty =
    document.getElementById("difficulty");

const difficultyValue =
    document.getElementById("difficultyValue");

const difficultyBox =
    document.getElementById("difficultyBox");

const player2Controls =
    document.getElementById("player2Controls");

const startButton =
    document.getElementById("startButton");

const fighter1 =
    document.getElementById("fighter1");

const fighter2 =
    document.getElementById("fighter2");

const health1 =
    document.getElementById("health1");

const health2 =
    document.getElementById("health2");

const timerElement =
    document.getElementById("timer");

const fightMessage =
    document.getElementById("fightMessage");

const touchControls =
    document.getElementById("touchControls");


/* =====================================================
   PLAYER MODE
===================================================== */

document.querySelectorAll(".choice")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".choice")
                .forEach(b =>
                    b.classList.remove("active")
                );

            button.classList.add("active");

            game.mode =
                Number(button.dataset.mode);

            if (game.mode === 2) {

                player2Controls
                    .classList.remove("hidden");

                difficultyBox
                    .classList.add("hidden");

            } else {

                player2Controls
                    .classList.add("hidden");

                difficultyBox
                    .classList.remove("hidden");

            }

        });

    });


/* =====================================================
   DIFFICULTY
===================================================== */

difficulty.addEventListener("input", () => {

    game.difficulty =
        Number(difficulty.value);

    difficultyValue.textContent =
        game.difficulty;

});


/* =====================================================
   PLAYER 1 CONTROL
===================================================== */

document.querySelectorAll(".control-choice")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".control-choice")
                .forEach(b =>
                    b.classList.remove("active")
                );

            button.classList.add("active");

            game.player1Control =
                button.dataset.control;

        });

    });


/* =====================================================
   PLAYER 2 CONTROL
===================================================== */

document.querySelectorAll(".control2-choice")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".control2-choice")
                .forEach(b =>
                    b.classList.remove("active")
                );

            button.classList.add("active");

            game.player2Control =
                button.dataset.control2;

        });

    });


/* =====================================================
   START
===================================================== */

startButton.addEventListener("click", startGame);


function startGame() {

    game.running = true;

    game.health1 =
        game.maxHealth;

    game.health2 =
        game.maxHealth;

    game.timer = 99;

    game.fighters.p1.x = 25;
    game.fighters.p2.x = 70;

    game.fighters.p1.y = 0;
    game.fighters.p2.y = 0;

    menu.classList.add("hidden");

    fight.classList.remove("hidden");

    health1.style.width = "100%";
    health2.style.width = "100%";

    timerElement.textContent = "99";

    configureTouch();

    showFightMessage();

    gameLoop();

    startTimer();

}


/* =====================================================
   FIGHT MESSAGE
===================================================== */

function showFightMessage() {

    fightMessage.textContent = "READY!";

    setTimeout(() => {

        if (!game.running) return;

        fightMessage.textContent = "FIGHT!";

    }, 900);

    setTimeout(() => {

        fightMessage.textContent = "";

    }, 1600);

}


/* =====================================================
   TIMER
===================================================== */

let timerInterval = null;

function startTimer() {

    clearInterval(timerInterval);

    timerInterval =
        setInterval(() => {

            if (!game.running)
                return;

            game.timer--;

            timerElement.textContent =
                game.timer;

            if (game.timer <= 0) {

                endRound();

            }

        }, 1000);

}


/* =====================================================
   KEYBOARD
===================================================== */

window.addEventListener("keydown", event => {

    game.keys[event.code] = true;

    /*
        PLAYER 1

        A = left
        D = right
        W = jump
        F = punch
        G = kick
        S = block
    */

    if (game.player1Control === "keyboard") {

        if (event.code === "KeyF")
            punch(1);

        if (event.code === "KeyG")
            kick(1);

    }


    /*
        PLAYER 2

        ArrowLeft
        ArrowRight
        ArrowUp
        N = punch
        M = kick
        ArrowDown = block
    */

    if (
        game.mode === 2 &&
        game.player2Control === "keyboard"
    ) {

        if (event.code === "KeyN")
            punch(2);

        if (event.code === "KeyM")
            kick(2);

    }

});


window.addEventListener("keyup", event => {

    game.keys[event.code] = false;

});


/* =====================================================
   TOUCH CONTROLS
===================================================== */

function configureTouch() {

    if (
        game.player1Control === "touch" ||
        game.player2Control === "touch"
    ) {

        touchControls
            .classList.remove("hidden");

    } else {

        touchControls
            .classList.add("hidden");

    }

}


document
    .querySelectorAll(".touch-controls button")
    .forEach(button => {

        const key =
            button.dataset.key;

        button.addEventListener(
            "pointerdown",
            event => {

                event.preventDefault();

                game.keys["TOUCH_" + key] = true;

                if (key === "punch")
                    punch(1);

                if (key === "kick")
                    kick(1);

            }
        );

        button.addEventListener(
            "pointerup",
            event => {

                event.preventDefault();

                game.keys["TOUCH_" + key] = false;

            }
        );

        button.addEventListener(
            "pointercancel",
            () => {

                game.keys["TOUCH_" + key] = false;

            }
        );

    });


/* =====================================================
   GAMEPAD
===================================================== */

window.addEventListener(
    "gamepadconnected",
    event => {

        console.log(
            "Gamepad connected:",
            event.gamepad.id
        );

    }
);


function readGamepads() {

    game.gamepads =
        navigator.getGamepads
            ? navigator.getGamepads()
            : [];

    game.gamepads.forEach(
        (pad, index) => {

            if (!pad)
                return;

            const left =
                pad.axes[0] < -0.3;

            const right =
                pad.axes[0] > 0.3;

            const jump =
                pad.buttons[0]?.pressed;

            const punchButton =
                pad.buttons[2]?.pressed;

            const kickButton =
                pad.buttons[3]?.pressed;


            if (
                game.player1Control === "gamepad" &&
                index === 0
            ) {

                game.keys.GP1_LEFT = left;
                game.keys.GP1_RIGHT = right;

                if (jump)
                    jumpPlayer(1);

                if (punchButton)
                    punch(1);

                if (kickButton)
                    kick(1);

            }


            if (
                game.mode === 2 &&
                game.player2Control === "gamepad" &&
                index === 1
            ) {

                game.keys.GP2_LEFT = left;
                game.keys.GP2_RIGHT = right;

                if (jump)
                    jumpPlayer(2);

                if (punchButton)
                    punch(2);

                if (kickButton)
                    kick(2);

            }

        }
    );

}


/* =====================================================
   MOVEMENT
===================================================== */

function updateMovement() {

    if (!game.running)
        return;


    /* PLAYER 1 */

    if (
        game.player1Control === "keyboard"
    ) {

        if (
            game.keys.KeyA
        ) {
            movePlayer(1, -1);
        }

        if (
            game.keys.KeyD
        ) {
            movePlayer(1, 1);
        }

        if (
            game.keys.KeyW
        ) {
            jumpPlayer(1);
        }

    }


    if (
        game.player1Control === "touch"
    ) {

        if (
            game.keys.TOUCH_left
        ) {
            movePlayer(1, -1);
        }

        if (
            game.keys.TOUCH_right
        ) {
            movePlayer(1, 1);
        }

        if (
            game.keys.TOUCH_jump
        ) {
            jumpPlayer(1);
        }

    }


    if (
        game.player1Control === "gamepad"
    ) {

        if (game.keys.GP1_LEFT)
            movePlayer(1, -1);

        if (game.keys.GP1_RIGHT)
            movePlayer(1, 1);

    }


    /* PLAYER 2 */

    if (game.mode === 2) {

        if (
            game.player2Control === "keyboard"
        ) {

            if (game.keys.ArrowLeft)
                movePlayer(2, -1);

            if (game.keys.ArrowRight)
                movePlayer(2, 1);

            if (game.keys.ArrowUp)
                jumpPlayer(2);

        }


        if (
            game.player2Control === "gamepad"
        ) {

            if (game.keys.GP2_LEFT)
                movePlayer(2, -1);

            if (game.keys.GP2_RIGHT)
                movePlayer(2, 1);

        }

    } else {

        updateAI();

    }

}


/* =====================================================
   MOVE
===================================================== */

function movePlayer(player, direction) {

    const fighter =
        game.fighters[
            player === 1
                ? "p1"
                : "p2"
        ];

    if (fighter.punching)
        return;

    if (fighter.kicking)
        return;

    const speed = 0.65;

    fighter.x +=
        direction * speed;

    fighter.x =
        Math.max(
            5,
            Math.min(
                90,
                fighter.x
            )
        );

    if (direction !== 0) {

        fighter.facing =
            direction;

    }

}


/* =====================================================
   JUMP
===================================================== */

function jumpPlayer(player) {

    const fighter =
        game.fighters[
            player === 1
                ? "p1"
                : "p2"
        ];

    if (fighter.jumping)
        return;

    fighter.jumping = true;

    fighter.velocityY = 13;

}


/* =====================================================
   PHYSICS
===================================================== */

function updatePhysics() {

    ["p1", "p2"].forEach(id => {

        const fighter =
            game.fighters[id];

        if (!fighter.jumping)
            return;

        fighter.y +=
            fighter.velocityY;

        fighter.velocityY -=
            0.7;

        if (fighter.y <= 0) {

            fighter.y = 0;

            fighter.velocityY = 0;

            fighter.jumping = false;

        }

    });

}


/* =====================================================
   AI
===================================================== */

let aiDecisionTimer = 0;

function updateAI() {

    const ai =
        game.fighters.p2;

    const player =
        game.fighters.p1;

    /*
       Difficulty 1 → کند و کم‌دقت
       Difficulty 100 → سریع و دقیق

       بعداً سیستم AI کامل‌تر می‌شود.
    */

    aiDecisionTimer--;

    const distance =
        Math.abs(
            ai.x - player.x
        );


    if (aiDecisionTimer <= 0) {

        /*
            هرچه سختی بیشتر باشد
            فاصله تصمیم‌ها کمتر می‌شود.
        */

        const reaction =
            900 -
            game.difficulty * 8;

        aiDecisionTimer =
            Math.max(
                80,
                reaction
            );


        /*
            حرکت به سمت بازیکن
        */

        if (distance > 9) {

            if (ai.x > player.x)
                movePlayer(2, -1);
            else
                movePlayer(2, 1);

        } else {

            /*
                احتمال حمله
                با سختی بیشتر افزایش پیدا می‌کند.
            */

            const accuracy =
                game.difficulty / 100;

            if (
                Math.random()
                < accuracy
            ) {

                if (
                    Math.random() < .5
                )
                    punch(2);
                else
                    kick(2);

            }

        }

    }

}


/* =====================================================
   ATTACK
===================================================== */

function punch(player) {

    if (!game.running)
        return;

    const fighter =
        game.fighters[
            player === 1
                ? "p1"
                : "p2"
        ];

    if (
        fighter.punching ||
        fighter.kicking
    )
        return;

    fighter.punching = true;

    const element =
        player === 1
            ? fighter1
            : fighter2;

    element.classList.add(
        "punching"
    );

    setTimeout(() => {

        checkHit(
            player,
            7,
            11
        );

    }, 100);


    setTimeout(() => {

        fighter.punching = false;

        element.classList.remove(
            "punching"
        );

    }, 300);

}


function kick(player) {

    if (!game.running)
        return;

    const fighter =
        game.fighters[
            player === 1
                ? "p1"
                : "p2"
        ];

    if (
        fighter.punching ||
        fighter.kicking
    )
        return;

    fighter.kicking = true;

    const element =
        player === 1
            ? fighter1
            : fighter2;

    element.classList.add(
        "kicking"
    );

    setTimeout(() => {

        checkHit(
            player,
            10,
            13
        );

    }, 130);


    setTimeout(() => {

        fighter.kicking = false;

        element.classList.remove(
            "kicking"
        );

    }, 380);

}


/* =====================================================
   HIT DETECTION
===================================================== */

function checkHit(
    attacker,
    damage,
    range
) {

    const a =
        game.fighters[
            attacker === 1
                ? "p1"
                : "p2"
        ];

    const defender =
        game.fighters[
            attacker === 1
                ? "p2"
                : "p1"
        ];

    const distance =
        Math.abs(
            a.x - defender.x
        );

    if (
        distance <= range &&
        !defender.blocking
    ) {

        if (attacker === 1) {

            game.health2 =
                Math.max(
                    0,
                    game.health2 - damage
                );

            health2.style.width =
                game.health2 + "%";

            fighter2.classList.add(
                "hit"
            );

            setTimeout(() => {
                fighter2.classList.remove(
                    "hit"
                );
            }, 400);

        } else {

            game.health1 =
                Math.max(
                    0,
                    game.health1 - damage
                );

            health1.style.width =
                game.health1 + "%";

            fighter1.classList.add(
                "hit"
            );

            setTimeout(() => {
                fighter1.classList.remove(
                    "hit"
                );
            }, 400);

        }


        if (
            game.health1 <= 0 ||
            game.health2 <= 0
        ) {

            endRound();

        }

    }

}


/* =====================================================
   GAME LOOP
===================================================== */

function gameLoop() {

    if (!game.running)
        return;

    readGamepads();

    updateMovement();

    updatePhysics();

    render();

    requestAnimationFrame(
        gameLoop
    );

}


/* =====================================================
   RENDER
===================================================== */

function render() {

    const p1 =
        game.fighters.p1;

    const p2 =
        game.fighters.p2;


    fighter1.style.left =
        p1.x + "%";

    fighter2.style.left =
        p2.x + "%";


    fighter1.style.bottom =
        `calc(25% + ${p1.y}px)`;

    fighter2.style.bottom =
        `calc(25% + ${p2.y}px)`;


    /*
        جهت نگاه کردن
    */

    fighter1.style.transform =
        `scaleX(${p1.facing})`;

    fighter2.style.transform =
        `scaleX(${p2.facing})`;

}


/* =====================================================
   END ROUND
===================================================== */

function endRound() {

    if (!game.running)
        return;

    game.running = false;

    clearInterval(timerInterval);


    let message;


    if (
        game.health1 ===
        game.health2
    ) {

        message = "DRAW!";

    } else if (
        game.health1 >
        game.health2
    ) {

        message = "PLAYER 1 WINS!";

    } else {

        message =
            game.mode === 1
                ? "CPU WINS!"
                : "PLAYER 2 WINS!";

    }


    fightMessage.textContent =
        message;


    setTimeout(() => {

        fight.classList.add(
            "hidden"
        );

        menu.classList.remove(
            "hidden"
        );

        fightMessage.textContent =
            "";

    }, 2500);

}
