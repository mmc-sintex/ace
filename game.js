"use strict";

/* =========================================================
   CANVAS
========================================================= */

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;


/* Internal pixel resolution */

const VW = 1280;
const VH = 720;

canvas.width = VW;
canvas.height = VH;


/* =========================================================
   CHARACTER DATA
========================================================= */

const FIGHTERS = [

    {
        id: "arken",
        name: "ARKEN",
        color: "#2563eb",
        accent: "#67e8f9",
        speed: 7.2,
        power: 1,
        jump: 17,
        special: "ENERGY"
    },

    {
        id: "zeyra",
        name: "ZEYRA",
        color: "#db2777",
        accent: "#f9a8d4",
        speed: 8.3,
        power: .9,
        jump: 18,
        special: "WIND"
    },

    {
        id: "vork",
        name: "VORK",
        color: "#7c3aed",
        accent: "#c4b5fd",
        speed: 6.1,
        power: 1.15,
        jump: 16,
        special: "EARTH"
    },

    {
        id: "nex",
        name: "NEX",
        color: "#0891b2",
        accent: "#67e8f9",
        speed: 7.7,
        power: 1,
        jump: 17,
        special: "PLASMA"
    }

];


/* =========================================================
   SELECT SCREEN
========================================================= */

const fightersElement =
    document.getElementById("fighters");

let selectedFighter = FIGHTERS[0];

const difficulty =
    document.getElementById("difficulty");

const difficultyValue =
    document.getElementById("difficultyValue");


function createFighterCards() {

    fightersElement.innerHTML = "";

    FIGHTERS.forEach((fighter, index) => {

        const card =
            document.createElement("div");

        card.className =
            "fighterCard";

        if (index === 0) {
            card.classList.add("selected");
        }

        card.innerHTML = `
            <div class="fighterPreview">
                <div
                    class="pixelFighter"
                    style="
                        background:
                        ${fighter.color};
                        box-shadow:
                        0 0 0 7px
                        ${fighter.accent};
                    ">
                </div>
            </div>

            <div class="fighterName">
                ${fighter.name}
            </div>

            <div class="fighterDesc">
                HP 100 • ${fighter.special}
            </div>
        `;

        card.addEventListener(
            "pointerdown",
            () => {

                selectedFighter =
                    fighter;

                document
                    .querySelectorAll(".fighterCard")
                    .forEach(x =>
                        x.classList.remove("selected")
                    );

                card.classList.add("selected");
            }
        );

        fightersElement.appendChild(card);
    });
}


createFighterCards();


difficulty.addEventListener(
    "input",
    () => {

        difficultyValue.textContent =
            difficulty.value;
    }
);


/* =========================================================
   START
========================================================= */

const startButton =
    document.getElementById("startButton");

const selectScreen =
    document.getElementById("characterSelect");

const gameScreen =
    document.getElementById("gameScreen");


startButton.addEventListener(
    "click",
    startGame
);


/* =========================================================
   INPUT SYSTEM
========================================================= */

const input = {

    left: false,
    right: false,

    jump: false,
    crouch: false,

    punch: false,
    kick: false,

    block: false,
    special: false
};


const keyboardMap = {

    KeyA: "left",
    ArrowLeft: "left",

    KeyD: "right",
    ArrowRight: "right",

    KeyW: "jump",
    ArrowUp: "jump",

    KeyS: "crouch",
    ArrowDown: "crouch",

    KeyJ: "punch",
    KeyK: "kick",

    KeyL: "block",

    KeyU: "special"
};


window.addEventListener(
    "keydown",
    e => {

        const action =
            keyboardMap[e.code];

        if (!action) return;

        input[action] = true;

        e.preventDefault();
    }
);


window.addEventListener(
    "keyup",
    e => {

        const action =
            keyboardMap[e.code];

        if (!action) return;

        input[action] = false;

        e.preventDefault();
    }
);


/* =========================================================
   JOYSTICK
========================================================= */

const joystick =
    document.getElementById("joystick");

const stick =
    document.getElementById("stick");

let joystickPointer = null;


joystick.addEventListener(
    "pointerdown",
    e => {

        joystickPointer =
            e.pointerId;

        joystick.setPointerCapture(
            e.pointerId
        );

        updateJoystick(e);
    }
);


joystick.addEventListener(
    "pointermove",
    e => {

        if (
            e.pointerId !==
            joystickPointer
        ) return;

        updateJoystick(e);
    }
);


function updateJoystick(e) {

    const rect =
        joystick.getBoundingClientRect();

    const cx =
        rect.left +
        rect.width / 2;

    const cy =
        rect.top +
        rect.height / 2;

    let dx =
        e.clientX - cx;

    let dy =
        e.clientY - cy;

    const radius =
        rect.width * .30;

    const distance =
        Math.sqrt(dx * dx + dy * dy);

    if (distance > radius) {

        dx =
            dx / distance * radius;

        dy =
            dy / distance * radius;
    }

    stick.style.transform =
        `translate(${dx}px, ${dy}px)`;

    input.left =
        dx < -radius * .25;

    input.right =
        dx > radius * .25;

    input.crouch =
        dy > radius * .35;
}


function releaseJoystick() {

    joystickPointer = null;

    stick.style.transform =
        "translate(0,0)";

    input.left = false;
    input.right = false;
    input.crouch = false;
}


joystick.addEventListener(
    "pointerup",
    releaseJoystick
);

joystick.addEventListener(
    "pointercancel",
    releaseJoystick
);


/* =========================================================
   MOBILE BUTTONS
========================================================= */

document
    .querySelectorAll(".attackButton")
    .forEach(button => {

        const action =
            button.dataset.action;

        button.addEventListener(
            "pointerdown",
            e => {

                e.preventDefault();

                input[action] = true;
            }
        );

        button.addEventListener(
            "pointerup",
            e => {

                e.preventDefault();

                input[action] = false;
            }
        );

        button.addEventListener(
            "pointercancel",
            () => {

                input[action] = false;
            }
        );
    });


/* =========================================================
   FIGHTER CLASS
========================================================= */

class Fighter {

    constructor(data, x, isPlayer) {

        this.data = data;

        this.name =
            data.name;

        this.x = x;

        this.y = GROUND;

        this.vx = 0;

        this.vy = 0;

        this.direction =
            isPlayer ? 1 : -1;

        this.isPlayer =
            isPlayer;

        /*
            برابر برای همه
        */

        this.maxHP = 100;

        this.hp = 100;

        this.width = 60;

        this.height = 145;

        this.grounded = true;

        this.state = "idle";

        this.frame = 0;

        this.attack = null;

        this.attackFrame = 0;

        this.attackConnected = false;

        this.hitstun = 0;

        this.blocking = false;

        this.crouching = false;

        this.invulnerable = false;

        this.combo = 0;

        this.comboTimer = 0;

        this.hitFlash = 0;

        this.walkCycle = 0;
    }


    /* -----------------------------------------------------
       JUMP
    ----------------------------------------------------- */

    jump() {

        if (!this.grounded) return;

        if (this.hitstun > 0) return;

        this.grounded = false;

        this.vy =
            -this.data.jump;

        this.state =
            "jump";

        this.frame = 0;
    }


    /* -----------------------------------------------------
       ATTACK
    ----------------------------------------------------- */

    startAttack(type) {

        if (this.attack) return;

        if (this.hitstun > 0) return;

        this.attack =
            type;

        this.attackFrame =
            0;

        this.attackConnected =
            false;

        this.blocking =
            false;

        this.state =
            type;

        this.frame = 0;
    }


    /* -----------------------------------------------------
       DAMAGE
    ----------------------------------------------------- */

    takeDamage(
        damage,
        attacker,
        knockback
    ) {

        if (this.invulnerable)
            return;

        if (this.blocking) {

            damage *= .2;

            knockback *= .25;

            this.state =
                "blockHit";

        } else {

            this.state =
                "hit";

            this.hitstun =
                16;

            this.vx =
                knockback *
                attacker.direction;
        }

        this.hp -= damage;

        if (this.hp < 0)
            this.hp = 0;

        this.hitFlash =
            8;
    }


    /* -----------------------------------------------------
       UPDATE
    ----------------------------------------------------- */

    update(dt) {

        this.frame++;

        if (this.hitFlash > 0)
            this.hitFlash--;

        if (this.hitstun > 0) {

            this.hitstun--;

            this.x +=
                this.vx;

            this.vx *= .82;

            return;
        }


        /* Attack animation */

        if (this.attack) {

            this.attackFrame++;

            this.updateAttack();

            /*
                Attack duration
            */

            if (
                this.attackFrame >=
                this.getAttackDuration()
            ) {

                this.attack =
                    null;

                this.attackFrame =
                    0;

                this.state =
                    this.grounded
                        ? "idle"
                        : "jump";
            }

        }


        /* Gravity */

        if (!this.grounded) {

            this.vy +=
                GRAVITY;

            this.y +=
                this.vy;

            /*
                Landing
            */

            if (
                this.y >= GROUND
            ) {

                this.y =
                    GROUND;

                this.vy = 0;

                this.grounded =
                    true;

                this.state =
                    "land";

                this.frame = 0;
            }
        }


        /*
            Horizontal movement
        */

        this.x +=
            this.vx;

        this.vx *=
            .82;


        /*
            Keep inside arena
        */

        this.x =
            Math.max(
                70,
                Math.min(
                    VW - 70,
                    this.x
                )
            );


        if (
            this.comboTimer > 0
        ) {

            this.comboTimer--;

        } else {

            this.combo = 0;
        }


        /*
            Animation cycle
        */

        if (
            this.state ===
            "walk"
        ) {

            this.walkCycle +=
                .3;
        }
    }


    /* -----------------------------------------------------
       ATTACK TIMING
    ----------------------------------------------------- */

    getAttackDuration() {

        if (
            this.attack ===
            "punch"
        )
            return 18;

        if (
            this.attack ===
            "kick"
        )
            return 25;

        if (
            this.attack ===
            "special"
        )
            return 36;

        return 20;
    }


    getAttackWindow() {

        if (
            this.attack ===
            "punch"
        )
            return [5, 10];

        if (
            this.attack ===
            "kick"
        )
            return [8, 14];

        if (
            this.attack ===
            "special"
        )
            return [10, 23];

        return [5, 10];
    }


    updateAttack() {

        /*
            تغییر حالت بدن
            در فریم‌های مختلف حمله
        */

        const [start, end] =
            this.getAttackWindow();

        if (
            this.attackFrame >= start &&
            this.attackFrame <= end
        ) {

            checkAttack(
                this,
                this.isPlayer
                    ? enemy
                    : player
            );
        }
    }


    /* -----------------------------------------------------
       DRAW PIXEL FIGHTER
    ----------------------------------------------------- */

    draw() {

        const x =
            Math.round(this.x);

        const y =
            Math.round(this.y);

        /*
            Shadow
        */

        ctx.fillStyle =
            "rgba(0,0,0,.45)";

        ctx.beginPath();

        ctx.ellipse(
            x,
            GROUND + 5,
            this.grounded
                ? 42
                : 27,
            8,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.save();

        ctx.translate(
            x,
            y
        );

        ctx.scale(
            this.direction,
            1
        );


        /*
            Jump squash/stretch
        */

        let scaleY = 1;

        if (!this.grounded) {

            if (this.vy < 0) {

                scaleY = .92;

            } else {

                scaleY = 1.08;
            }
        }


        ctx.scale(
            1,
            scaleY
        );


        /*
            Walk animation
        */

        let legA = 0;
        let legB = 0;

        if (
            this.state ===
            "walk"
        ) {

            legA =
                Math.sin(
                    this.walkCycle
                ) * 13;

            legB =
                Math.sin(
                    this.walkCycle +
                    Math.PI
                ) * 13;
        }


        /*
            Crouch
        */

        const crouch =
            this.crouching
                ? 25
                : 0;


        /*
            LEGS
        */

        pixelRect(
            -24,
            -55 + crouch,
            18,
            55,
            "#111827"
        );

        pixelRect(
            7,
            -55 + crouch,
            18,
            55,
            "#111827"
        );


        /*
            Shoes
        */

        pixelRect(
            -29,
            -8 + crouch,
            31,
            11,
            "#050505"
        );

        pixelRect(
            3,
            -8 + crouch,
            31,
            11,
            "#050505"
        );


        /*
            BODY
        */

        pixelRect(
            -30,
            -128 + crouch,
            60,
            72,
            this.data.color
        );


        /*
            Armor highlight
        */

        pixelRect(
            -25,
            -123 + crouch,
            10,
            55,
            this.data.accent
        );


        /*
            Belt
        */

        pixelRect(
            -32,
            -64 + crouch,
            64,
            9,
            "#090b12"
        );


        /*
            HEAD
        */

        pixelRect(
            -25,
            -158 + crouch,
            50,
            38,
            "#d79a70"
        );


        /*
            Hair
        */

        pixelRect(
            -27,
            -164 + crouch,
            54,
            14,
            "#111827"
        );

        pixelRect(
            -20,
            -170 + crouch,
            40,
            8,
            "#111827"
        );


        /*
            Eye
        */

        pixelRect(
            10,
            -145 + crouch,
            7,
            5,
            "#ffffff"
        );


        /*
            ARMS
        */

        this.drawArms(
            crouch
        );


        /*
            special effect
        */

        if (
            this.state ===
            "special"
        ) {

            const pulse =
                35 +
                Math.sin(
                    this.attackFrame *
                    .5
                ) * 12;

            ctx.globalAlpha =
                .35;

            ctx.fillStyle =
                this.data.accent;

            ctx.beginPath();

            ctx.arc(
                45,
                -90 + crouch,
                pulse,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.globalAlpha =
                1;
        }


        /*
            Hit flash
        */

        if (
            this.hitFlash > 0
        ) {

            ctx.globalAlpha =
                .75;

            pixelRect(
                -40,
                -175,
                80,
                170,
                "#ffffff"
            );

            ctx.globalAlpha =
                1;
        }


        ctx.restore();
    }


    drawArms(crouch) {

        let frontX = 38;

        let frontY = -100 + crouch;

        /*
            PUNCH
        */

        if (
            this.attack ===
            "punch"
        ) {

            const p =
                Math.min(
                    1,
                    this.attackFrame /
                    7
                );

            frontX =
                38 +
                p * 55;

            frontY =
                -110 + crouch;
        }


        /*
            KICK uses one arm back
        */

        if (
            this.attack ===
            "kick"
        ) {

            frontX = 25;

            frontY =
                -105 + crouch;
        }


        /*
            BLOCK
        */

        if (
            this.blocking
        ) {

            frontX =
                25;

            frontY =
                -135 + crouch;
        }


        /*
            back arm
        */

        pixelRect(
            -45,
            -115 + crouch,
            18,
            48,
            "#d79a70"
        );


        /*
            front arm
        */

        pixelRect(
            frontX,
            frontY,
            18,
            42,
            "#d79a70"
        );


        /*
            Punch glove
        */

        if (
            this.attack ===
            "punch"
        ) {

            pixelRect(
                frontX + 10,
                frontY - 3,
                24,
                18,
                this.data.accent
            );
        }


        /*
            Kick
        */

        if (
            this.attack ===
            "kick"
        ) {

            const p =
                Math.min(
                    1,
                    this.attackFrame /
                    10
                );

            pixelRect(
                25 + p * 55,
                -70,
                55,
                18,
                "#d79a70"
            );
        }
    }
}


/* =========================================================
   PIXEL RECT
========================================================= */

function pixelRect(
    x,
    y,
    width,
    height,
    color
) {

    ctx.fillStyle =
        color;

    ctx.fillRect(
        Math.round(x),
        Math.round(y),
        Math.round(width),
        Math.round(height)
    );
}


/* =========================================================
   GAME VARIABLES
========================================================= */

const GRAVITY =
    .78;

const GROUND =
    570;

let player;
let enemy;

let running =
    false;

let lastTime =
    performance.now();

let timeLeft =
    60;

let timerAccumulator =
    0;


/* =========================================================
   START GAME
========================================================= */

function startGame() {

    const enemyData =
        FIGHTERS[
            Math.floor(
                Math.random() *
                FIGHTERS.length
            )
        ];

    player =
        new Fighter(
            selectedFighter,
            350,
            true
        );

    enemy =
        new Fighter(
            enemyData,
            930,
            false
        );

    document
        .getElementById("playerName")
        .textContent =
        player.name;

    document
        .getElementById("enemyName")
        .textContent =
        enemy.name;

    selectScreen
        .classList
        .add("hidden");

    gameScreen
        .classList
        .remove("hidden");

    timeLeft =
        60;

    timerAccumulator =
        0;

    running =
        true;

    document
        .getElementById("gameMessage")
        .textContent =
        "";

    lastTime =
        performance.now();

    requestAnimationFrame(
        gameLoop
    );
}


/* =========================================================
   PLAYER CONTROL
========================================================= */

function updatePlayer() {

    if (
        player.hp <= 0
    )
        return;


    /*
        Blocking
    */

    player.blocking =
        input.block &&
        player.grounded &&
        !player.attack;


    /*
        Crouch
    */

    player.crouching =
        input.crouch &&
        player.grounded &&
        !player.attack;


    /*
        Movement can happen
        during attacks/jumps.
    */

    let move =
        0;

    if (input.left)
        move--;

    if (input.right)
        move++;


    /*
        Air movement
    */

    if (move !== 0) {

        const airFactor =
            player.grounded
                ? 1
                : .55;

        player.vx =
            move *
            player.data.speed *
            airFactor;

        player.direction =
            move > 0
                ? 1
                : -1;

        if (
            player.grounded &&
            !player.attack &&
            !player.crouching &&
            !player.blocking
        ) {

            player.state =
                "walk";
        }
    }


    /*
        Jump can happen while moving
    */

    if (
        input.jump
    ) {

        player.jump();

        input.jump =
            false;
    }


    /*
        ATTACKS

        These are independent.
        Therefore:

        jump + punch
        move + punch
        jump + kick

        are possible.
    */

    if (
        input.punch
    ) {

        player.startAttack(
            "punch"
        );

        input.punch =
            false;
    }


    if (
        input.kick
    ) {

        player.startAttack(
            "kick"
        );

        input.kick =
            false;
    }


    if (
        input.special
    ) {

        player.startAttack(
            "special"
        );

        input.special =
            false;
    }
}


/* =========================================================
   AI
========================================================= */

let aiCooldown =
    0;

function updateAI() {

    if (
        enemy.hp <= 0
    )
        return;


    const level =
        Number(
            difficulty.value
        );


    /*
        Reaction time

        Level 1 = slow
        Level 10 = fast
    */

    if (
        aiCooldown > 0
    ) {

        aiCooldown--;

        return;
    }


    const reaction =
        42 -
        level * 3.4;


    aiCooldown =
        Math.max(
            5,
            reaction
        );


    const distance =
        player.x -
        enemy.x;

    const absDistance =
        Math.abs(distance);


    enemy.direction =
        distance >= 0
            ? 1
            : -1;


    /*
        Accuracy
    */

    const accuracy =
        .35 +
        level * .06;


    /*
        React to aerial attacks
    */

    if (
        !player.grounded
    ) {

        if (
            Math.random() <
            accuracy
        ) {

            enemy.blocking =
                true;

            enemy.state =
                "block";
        }
    }


    /*
        Approach
    */

    if (
        absDistance > 150
    ) {

        enemy.vx =
            enemy.direction *
            enemy.data.speed;

        enemy.state =
            "walk";


        /*
            AI jump
        */

        if (
            Math.random() <
            .05 +
            level * .008
        ) {

            enemy.jump();
        }

        return;
    }


    /*
        Close combat
    */

    enemy.vx =
        0;


    /*
        Defend
    */

    if (
        player.attack &&
        Math.random() <
        accuracy
    ) {

        enemy.blocking =
            true;

        enemy.state =
            "block";

        return;
    }


    enemy.blocking =
        false;


    /*
        Attack probability
    */

    if (
        Math.random() <
        .5 +
        level * .04
    ) {

        const r =
            Math.random();

        if (
            r < .38
        ) {

            enemy.startAttack(
                "punch"
            );

        } else if (
            r < .75
        ) {

            enemy.startAttack(
                "kick"
            );

        } else {

            enemy.startAttack(
                "special"
            );
        }
    }
}


/* =========================================================
   COLLISION
========================================================= */

function checkAttack(
    attacker,
    target
) {

    if (
        attacker.attackConnected
    )
        return;


    /*
        Direction check
    */

    const dx =
        target.x -
        attacker.x;

    if (
        dx *
        attacker.direction
        < 0
    )
        return;


    let range =
        105;

    if (
        attacker.attack ===
        "kick"
    )
        range = 125;

    if (
        attacker.attack ===
        "special"
    )
        range = 190;


    if (
        Math.abs(dx) >
        range
    )
        return;


    /*
        Hit
    */

    attacker.attackConnected =
        true;


    let damage =
        6;

    let knockback =
        5;


    if (
        attacker.attack ===
        "kick"
    ) {

        damage =
            8;

        knockback =
            7;
    }


    if (
        attacker.attack ===
        "special"
    ) {

        damage =
            12;

        knockback =
            10;
    }


    damage *=
        attacker.data.power;


    target.takeDamage(
        damage,
        attacker,
        knockback
    );


    attacker.combo++;

    attacker.comboTimer =
        90;


    spawnHitParticles(
        target.x,
        target.y - 100
    );


    showCombo(
        attacker
    );
}


/* =========================================================
   COMBO
========================================================= */

const comboElement =
    document.getElementById("combo");

const comboNumber =
    document.getElementById("comboNumber");


function showCombo(
    fighter
) {

    if (
        !fighter.isPlayer
    )
        return;


    comboNumber.textContent =
        fighter.combo;

    comboElement
        .classList
        .add("active");


    clearTimeout(
        showCombo.timeout
    );

    showCombo.timeout =
        setTimeout(
            () => {

                comboElement
                    .classList
                    .remove("active");

            },
            900
        );
}


/* =========================================================
   PARTICLES
========================================================= */

const particles =
    [];


function spawnHitParticles(
    x,
    y
) {

    for (
        let i = 0;
        i < 18;
        i++
    ) {

        particles.push({

            x,
            y,

            vx:
                (Math.random() - .5) *
                12,

            vy:
                (Math.random() - .5) *
                12,

            life:
                20 +
                Math.random() *
                15
        });
    }
}


function updateParticles() {

    for (
        let i =
            particles.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            particles[i];

        p.x +=
            p.vx;

        p.y +=
            p.vy;

        p.vy +=
            .35;

        p.life--;

        if (
            p.life <= 0
        ) {

            particles.splice(
                i,
                1
            );
        }
    }
}


function drawParticles() {

    for (
        const p of particles
    ) {

        ctx.fillStyle =
            "#fef08a";

        ctx.fillRect(
            Math.round(p.x),
            Math.round(p.y),
            5,
            5
        );
    }
}


/* =========================================================
   BACKGROUND
========================================================= */

function drawBackground() {

    /*
        Pixel-art sky
    */

    const sky =
        ctx.createLinearGradient(
            0,
            0,
            0,
            VH
        );

    sky.addColorStop(
        0,
        "#090d20"
    );

    sky.addColorStop(
        .45,
        "#18264a"
    );

    sky.addColorStop(
        1,
        "#10141f"
    );

    ctx.fillStyle =
        sky;

    ctx.fillRect(
        0,
        0,
        VW,
        VH
    );


    /*
        Moon
    */

    ctx.fillStyle =
        "#dbeafe";

    ctx.globalAlpha =
        .8;

    ctx.fillRect(
        975,
        90,
        60,
        60
    );

    ctx.globalAlpha =
        1;


    /*
        Far buildings
    */

    for (
        let i = 0;
        i < 18;
        i++
    ) {

        const x =
            i * 80;

        const h =
            100 +
            (i % 5) * 35;

        ctx.fillStyle =
            i % 2
                ? "#0c1222"
                : "#111827";

        ctx.fillRect(
            x,
            GROUND - h,
            65,
            h
        );


        /*
            Windows
        */

        ctx.fillStyle =
            i % 3 === 0
                ? "#67e8f9"
                : "#facc15";

        for (
            let wy =
                GROUND - h + 20;
            wy <
            GROUND - 10;
            wy += 25
        ) {

            if (
                (i + wy) % 3 <
                1
            ) {

                ctx.fillRect(
                    x + 12,
                    wy,
                    7,
                    10
                );

                ctx.fillRect(
                    x + 37,
                    wy,
                    7,
                    10
                );
            }
        }
    }


    /*
        Neon signs
    */

    drawNeonSign(
        120,
        250,
        "FIGHT"
    );

    drawNeonSign(
        1030,
        300,
        "ZONE"
    );


    /*
        Foreground buildings
    */

    ctx.fillStyle =
        "#090d16";

    ctx.fillRect(
        0,
        450,
        VW,
        125
    );


    /*
        Neon street lights
    */

    for (
        let x = 70;
        x < VW;
        x += 230
    ) {

        ctx.fillStyle =
            "#0a0f18";

        ctx.fillRect(
            x,
            360,
            8,
            210
        );

        ctx.fillStyle =
            "#67e8f9";

        ctx.fillRect(
            x - 10,
            355,
            28,
            8
        );
    }


    /*
        Floor
    */

    const floor =
        ctx.createLinearGradient(
            0,
            GROUND,
            0,
            VH
        );

    floor.addColorStop(
        0,
        "#202938"
    );

    floor.addColorStop(
        1,
        "#080b11"
    );

    ctx.fillStyle =
        floor;

    ctx.fillRect(
        0,
        GROUND,
        VW,
        VH - GROUND
    );


    /*
        Pixel floor grid
    */

    ctx.strokeStyle =
        "rgba(103,232,249,.12)";

    ctx.lineWidth =
        2;

    for (
        let x = -VW;
        x < VW * 2;
        x += 100
    ) {

        ctx.beginPath();

        ctx.moveTo(
            VW / 2,
            GROUND
        );

        ctx.lineTo(
            x,
            VH
        );

        ctx.stroke();
    }


    for (
        let y = GROUND + 45;
        y < VH;
        y += 45
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            VW,
            y
        );

        ctx.stroke();
    }


    /*
        Arena line
    */

    ctx.fillStyle =
        "#67e8f9";

    ctx.globalAlpha =
        .25;

    ctx.fillRect(
        0,
        GROUND,
        VW,
        3
    );

    ctx.globalAlpha =
        1;
}


function drawNeonSign(
    x,
    y,
    text
) {

    ctx.save();

    ctx.globalAlpha =
        .7;

    ctx.fillStyle =
        "#22d3ee";

    ctx.font =
        "bold 25px monospace";

    ctx.fillText(
        text,
        x,
        y
    );

    ctx.restore();
}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    document
        .getElementById("playerHP")
        .style.width =
        `${player.hp}%`;

    document
        .getElementById("enemyHP")
        .style.width =
        `${enemy.hp}%`;

    document
        .getElementById("timer")
        .textContent =
        Math.max(
            0,
            Math.ceil(timeLeft)
        );
}


/* =========================================================
   GAME END
========================================================= */

function endGame() {

    running =
        false;

    const gameMessage =
        document
            .getElementById("gameMessage");


    if (
        player.hp <= 0
    ) {

        gameMessage.textContent =
            `${enemy.name} WINS`;

    } else if (
        enemy.hp <= 0
    ) {

        gameMessage.textContent =
            `${player.name} WINS`;

    } else {

        if (
            player.hp >
            enemy.hp
        ) {

            gameMessage.textContent =
                `${player.name} WINS`;

        } else {

            gameMessage.textContent =
                `${enemy.name} WINS`;
        }
    }


    setTimeout(
        () => {

            selectScreen
                .classList
                .remove("hidden");

            gameScreen
                .classList
                .add("hidden");

        },
        2500
    );
}


/* =========================================================
   UPDATE
========================================================= */

function update(dt) {

    if (!running)
        return;


    updatePlayer();

    updateAI();


    player.update(
        dt
    );

    enemy.update(
        dt
    );


    updateParticles();


    /*
        Prevent fighters from
        walking through each other
    */

    const distance =
        Math.abs(
            player.x -
            enemy.x
        );

    if (
        distance < 65
    ) {

        const push =
            (65 - distance) /
            2;

        if (
            player.x <
            enemy.x
        ) {

            player.x -=
                push;

            enemy.x +=
                push;

        } else {

            player.x +=
                push;

            enemy.x -=
                push;
        }
    }


    /*
        Timer
    */

    timerAccumulator +=
        dt;

    if (
        timerAccumulator >=
        1
    ) {

        timerAccumulator -=
            1;

        timeLeft--;

        if (
            timeLeft <= 0
        ) {

            endGame();
        }
    }


    updateHUD();


    if (
        player.hp <= 0 ||
        enemy.hp <= 0
    ) {

        endGame();
    }
}


/* =========================================================
   DRAW
========================================================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        VW,
        VH
    );


    drawBackground();


    /*
        Fighter depth
    */

    if (
        player.x <
        enemy.x
    ) {

        player.draw();

        enemy.draw();

    } else {

        enemy.draw();

        player.draw();
    }


    drawParticles();
}


/* =========================================================
   LOOP
========================================================= */

function gameLoop(
    timestamp
) {

    if (!running)
        return;


    const dt =
        Math.min(
            .033,
            (timestamp -
                lastTime) /
            1000
        );


    lastTime =
        timestamp;


    update(
        dt
    );

    draw();


    requestAnimationFrame(
        gameLoop
    );
}
