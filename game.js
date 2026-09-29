const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const playerHealthBar = document.getElementById("playerHealth");
const enemyHealthBar = document.getElementById("enemyHealth");
const message = document.getElementById("message");

let W = 1280;
let H = 720;

canvas.width = W;
canvas.height = H;

const keys = {};

const GRAVITY = 0.75;
const GROUND = 575;

let gameOver = false;

/* =========================================================
   INPUT
========================================================= */

const actionKeys = {
    KeyA: "left",
    KeyD: "right",
    KeyW: "jump",
    KeyS: "crouch",

    KeyJ: "punch",
    KeyK: "kick",
    KeyL: "block",
    KeyU: "special"
};

window.addEventListener("keydown", e => {

    const action = actionKeys[e.code];

    if (action) {
        keys[action] = true;
        e.preventDefault();
    }
});

window.addEventListener("keyup", e => {

    const action = actionKeys[e.code];

    if (action) {
        keys[action] = false;
        e.preventDefault();
    }
});


/* =========================================================
   MOBILE INPUT
========================================================= */

document.querySelectorAll("#mobileControls button").forEach(button => {

    const action = button.dataset.action;

    const press = e => {
        e.preventDefault();
        keys[action] = true;
    };

    const release = e => {
        e.preventDefault();
        keys[action] = false;
    };

    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", release);
});


/* =========================================================
   GAMEPAD
========================================================= */

function readGamepad() {

    const pads = navigator.getGamepads ? navigator.getGamepads() : [];

    const pad = pads[0];

    if (!pad) return;

    const left = pad.axes[0] < -0.35;
    const right = pad.axes[0] > 0.35;

    keys.left = keys.left || left;
    keys.right = keys.right || right;

    if (pad.buttons[0]?.pressed) {
        keys.jump = true;
    }

    if (pad.buttons[1]?.pressed) {
        keys.kick = true;
    }

    if (pad.buttons[2]?.pressed) {
        keys.punch = true;
    }

    if (pad.buttons[3]?.pressed) {
        keys.special = true;
    }

    if (pad.buttons[5]?.pressed) {
        keys.block = true;
    }
}


/* =========================================================
   FIGHTER
========================================================= */

class Fighter {

    constructor(options) {

        this.name = options.name;

        this.x = options.x;
        this.y = GROUND;

        this.width = 75;
        this.height = 145;

        this.speed = options.speed || 5;

        /* همه جان برابر */

        this.maxHealth = 100;
        this.health = 100;

        this.velocityY = 0;

        this.direction = options.direction || 1;

        this.state = "idle";

        this.animationTimer = 0;
        this.attackTimer = 0;

        this.attackType = null;

        this.crouching = false;
        this.blocking = false;

        this.hitFlash = 0;

        this.onGround = true;

        this.combo = 0;
        this.comboTimer = 0;
    }

    resetAnimation() {

        this.animationTimer = 0;

    }

    jump() {

        if (!this.onGround) return;

        this.velocityY = -17;

        this.onGround = false;

        this.state = "jump";

        this.animationTimer = 0;
    }

    attack(type) {

        if (this.attackTimer > 0) return;

        this.attackType = type;

        if (type === "punch") {
            this.attackTimer = 24;
            this.state = "punch";
        }

        if (type === "kick") {
            this.attackTimer = 30;
            this.state = "kick";
        }

        if (type === "special") {
            this.attackTimer = 40;
            this.state = "special";
        }

        this.animationTimer = 0;
    }

    takeDamage(amount) {

        if (this.blocking) {
            amount *= 0.25;
        }

        this.health -= amount;

        if (this.health < 0) {
            this.health = 0;
        }

        this.hitFlash = 8;

        this.state = "hit";

        this.animationTimer = 0;
    }

    update() {

        this.animationTimer++;

        if (this.attackTimer > 0) {
            this.attackTimer--;
        }

        if (this.comboTimer > 0) {
            this.comboTimer--;
        } else {
            this.combo = 0;
        }

        if (this.hitFlash > 0) {
            this.hitFlash--;
        }

        /* Gravity */

        if (!this.onGround) {

            this.velocityY += GRAVITY;

            this.y += this.velocityY;

            if (this.y >= GROUND) {

                this.y = GROUND;

                this.velocityY = 0;

                this.onGround = true;

                this.state = "idle";

                this.animationTimer = 0;
            }
        }

        /* Don't interrupt attacks */

        if (this.attackTimer > 0) {
            return;
        }
    }

    draw() {

        ctx.save();

        const x = this.x;
        const y = this.y;

        let scaleX = 1;

        /*
            هنگام پرش بدن کمی کشیده/فشرده می‌شود
            تا پرش حالت انیمیشنی داشته باشد.
        */

        if (!this.onGround) {

            if (this.velocityY < -4) {
                scaleX = 0.92;
            } else {
                scaleX = 1.08;
            }
        }

        if (this.state === "hit") {
            ctx.translate(Math.sin(this.animationTimer * 2) * 3, 0);
        }

        ctx.translate(x, y);
        ctx.scale(this.direction * scaleX, 1);

        /*
            سایه
        */

        ctx.restore();

        ctx.save();

        ctx.globalAlpha = 0.3;

        ctx.beginPath();

        ctx.ellipse(
            x,
            GROUND + 5,
            this.onGround ? 45 : 30,
            10,
            0,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#000";
        ctx.fill();

        ctx.restore();

        /*
            بدن
        */

        ctx.save();

        ctx.translate(x, y);
        ctx.scale(this.direction * scaleX, 1);

        const bob =
            this.state === "idle"
                ? Math.sin(this.animationTimer * 0.08) * 2
                : 0;

        /*
            پاها
        */

        let legOffset = 0;

        if (this.state === "kick") {
            legOffset = Math.sin(this.animationTimer * 0.35) * 28;
        }

        if (this.state === "jump") {
            legOffset = -8;
        }

        ctx.fillStyle = "#111827";

        ctx.fillRect(-25, -55, 20, 55);

        ctx.fillRect(
            5 + legOffset,
            -55,
            20,
            55
        );

        /*
            کفش
        */

        ctx.fillStyle = "#050505";

        ctx.fillRect(-31, -7, 30, 12);

        ctx.fillRect(
            2 + legOffset,
            -7,
            30,
            12
        );

        /*
            بدن
        */

        ctx.fillStyle =
            this.name === "ARKEN"
                ? "#2563eb"
                : "#7c3aed";

        let bodyY = -125 + bob;

        if (this.crouching) {
            bodyY += 20;
        }

        ctx.beginPath();

        ctx.roundRect(
            -32,
            bodyY,
            64,
            75,
            12
        );

        ctx.fill();

        /*
            کمربند
        */

        ctx.fillStyle = "#111";

        ctx.fillRect(
            -34,
            bodyY + 55,
            68,
            9
        );

        /*
            سر
        */

        ctx.fillStyle = "#d99b6c";

        ctx.beginPath();

        ctx.arc(
            0,
            bodyY - 25,
            27,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /*
            مو
        */

        ctx.fillStyle = "#111";

        ctx.beginPath();

        ctx.arc(
            0,
            bodyY - 33,
            27,
            Math.PI,
            Math.PI * 2
        );

        ctx.fill();

        /*
            چشم
        */

        ctx.fillStyle = "#fff";

        ctx.fillRect(8, bodyY - 27, 7, 5);

        /*
            دست‌ها
        */

        let armLength = 38;

        if (this.state === "punch") {

            armLength =
                40 +
                Math.sin(
                    (24 - this.attackTimer) * 0.4
                ) * 25;
        }

        if (this.state === "block") {

            armLength = 25;
        }

        ctx.strokeStyle = "#d99b6c";
        ctx.lineWidth = 16;
        ctx.lineCap = "round";

        ctx.beginPath();

        ctx.moveTo(-25, bodyY + 20);

        ctx.lineTo(
            -25 - armLength * 0.45,
            bodyY + 55
        );

        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(25, bodyY + 20);

        ctx.lineTo(
            25 + armLength,
            bodyY + 5
        );

        ctx.stroke();

        /*
            حالت دفاع
        */

        if (this.blocking) {

            ctx.strokeStyle = "#8be9fd";
            ctx.lineWidth = 5;

            ctx.beginPath();

            ctx.arc(
                0,
                -75,
                70,
                -Math.PI / 2,
                Math.PI / 2
            );

            ctx.stroke();
        }

        /*
            افکت ویژه
        */

        if (this.state === "special") {

            ctx.globalAlpha =
                0.45 +
                Math.sin(this.animationTimer * 0.5) * 0.2;

            ctx.fillStyle = "#22d3ee";

            ctx.beginPath();

            ctx.arc(
                35,
                -80,
                45 + Math.sin(this.animationTimer * 0.3) * 10,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.globalAlpha = 1;
        }

        /*
            ضربه
        */

        if (this.state === "kick") {

            ctx.strokeStyle = "#d99b6c";
            ctx.lineWidth = 18;
            ctx.lineCap = "round";

            ctx.beginPath();

            ctx.moveTo(
                15,
                -45
            );

            ctx.lineTo(
                65 + Math.sin(this.animationTimer * 0.25) * 15,
                -75
            );

            ctx.stroke();
        }

        /*
            Flash
        */

        if (this.hitFlash > 0) {

            ctx.globalAlpha = 0.7;

            ctx.fillStyle = "#fff";

            ctx.fillRect(
                -45,
                -155,
                90,
                155
            );
        }

        ctx.restore();
    }
}


/* =========================================================
   PLAYERS
========================================================= */

const player = new Fighter({
    name: "ARKEN",
    x: 350,
    direction: 1,
    speed: 5
});

const enemy = new Fighter({
    name: "VORK",
    x: 930,
    direction: -1,
    speed: 4
});


/* =========================================================
   PLAYER CONTROL
========================================================= */

let attackPressed = false;

function controlPlayer() {

    if (gameOver) return;

    player.blocking = keys.block;

    player.crouching =
        keys.crouch &&
        player.onGround &&
        player.attackTimer <= 0;

    if (player.attackTimer <= 0) {

        if (keys.left) {

            player.x -= player.speed;

            player.direction = -1;

            player.state = "walk";
        }

        else if (keys.right) {

            player.x += player.speed;

            player.direction = 1;

            player.state = "walk";
        }

        else if (!player.crouching && player.onGround) {

            if (!player.blocking) {
                player.state = "idle";
            }
        }

        if (keys.jump) {

            player.jump();

            keys.jump = false;
        }

        if (keys.punch) {

            player.attack("punch");

            keys.punch = false;
        }

        if (keys.kick) {

            player.attack("kick");

            keys.kick = false;
        }

        if (keys.special) {

            player.attack("special");

            keys.special = false;
        }
    }

    if (player.blocking) {
        player.state = "block";
    }

    player.x = Math.max(
        70,
        Math.min(W - 70, player.x)
    );
}


/* =========================================================
   AI
========================================================= */

const AI_LEVEL = 5;

let aiReaction = 500;
let aiTimer = 0;

function setAILevel(level) {

    /*
        هرچه سطح بیشتر باشد:
        - واکنش سریع‌تر
        - دقت بیشتر
        - تصمیم بهتر
    */

    level = Math.max(1, Math.min(10, level));

    aiReaction =
        650 -
        level * 55;
}

setAILevel(AI_LEVEL);

function controlAI() {

    if (gameOver) return;

    aiTimer++;

    if (aiTimer < aiReaction / 16) {
        return;
    }

    aiTimer = 0;

    const distance =
        player.x - enemy.x;

    const absDistance =
        Math.abs(distance);

    enemy.direction =
        distance > 0 ? 1 : -1;

    /*
        نزدیک شدن
    */

    if (absDistance > 170) {

        enemy.x +=
            enemy.direction *
            enemy.speed;

        enemy.state = "walk";

        /*
            گاهی پرش
        */

        if (
            Math.random() <
            AI_LEVEL * 0.008
        ) {
            enemy.jump();
        }

        return;
    }

    /*
        اگر نزدیک باشد
        احتمال دفاع / حمله
    */

    const accuracy =
        AI_LEVEL / 10;

    if (
        player.state === "punch" ||
        player.state === "kick"
    ) {

        if (
            Math.random() <
            accuracy * 0.75
        ) {

            enemy.blocking = true;
            enemy.state = "block";

            setTimeout(() => {
                enemy.blocking = false;
            }, Math.max(80, aiReaction));
        }
    }

    if (enemy.attackTimer <= 0) {

        const random = Math.random();

        if (random < 0.35 + accuracy * 0.2) {

            enemy.attack("punch");

        } else if (
            random < 0.7 + accuracy * 0.15
        ) {

            enemy.attack("kick");

        } else {

            enemy.attack("special");
        }
    }
}


/* =========================================================
   COLLISION
========================================================= */

function distanceBetween(a, b) {

    return Math.abs(a.x - b.x);
}

function attackCollision(attacker, target) {

    if (attacker.attackTimer <= 0) return;

    const d = distanceBetween(
        attacker,
        target
    );

    let range = 125;

    if (attacker.attackType === "kick") {
        range = 150;
    }

    if (attacker.attackType === "special") {
        range = 210;
    }

    if (d > range) return;

    /*
        فقط یک بار در هر حمله
    */

    if (attacker.hasHit) return;

    const attackProgress =
        attacker.attackTimer;

    /*
        بخش مناسب انیمیشن
    */

    if (
        attackProgress < 20 &&
        attackProgress > 7
    ) {

        attacker.hasHit = true;

        let damage = 7;

        if (attacker.attackType === "kick") {
            damage = 9;
        }

        if (attacker.attackType === "special") {
            damage = 14;
        }

        target.takeDamage(damage);

        target.combo = attacker.combo + 1;

        attacker.combo++;

        attacker.comboTimer = 90;

        createHitEffect(
            target.x,
            target.y - 90
        );
    }
}


/* Reset hit flag */

function resetAttackState(fighter) {

    if (fighter.attackTimer <= 0) {

        fighter.hasHit = false;

        fighter.attackType = null;

        if (
            fighter.state === "punch" ||
            fighter.state === "kick" ||
            fighter.state === "special"
        ) {
            fighter.state = "idle";
        }
    }
}


/* =========================================================
   HIT EFFECT
========================================================= */

const effects = [];

function createHitEffect(x, y) {

    for (let i = 0; i < 12; i++) {

        effects.push({
            x,
            y,

            vx:
                (Math.random() - 0.5) * 8,

            vy:
                (Math.random() - 0.5) * 8,

            life: 25
        });
    }
}

function updateEffects() {

    for (let i = effects.length - 1; i >= 0; i--) {

        const e = effects[i];

        e.x += e.vx;
        e.y += e.vy;

        e.vy += 0.2;

        e.life--;

        if (e.life <= 0) {
            effects.splice(i, 1);
        }
    }
}

function drawEffects() {

    ctx.save();

    for (const e of effects) {

        ctx.globalAlpha =
            e.life / 25;

        ctx.fillStyle = "#fff";

        ctx.fillRect(
            e.x,
            e.y,
            5,
            5
        );
    }

    ctx.restore();
}


/* =========================================================
   BACKGROUND
========================================================= */

function drawBackground() {

    /*
        Sky
    */

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            H
        );

    gradient.addColorStop(
        0,
        "#111827"
    );

    gradient.addColorStop(
        0.55,
        "#26344d"
    );

    gradient.addColorStop(
        1,
        "#080b12"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    /*
        Moon
    */

    ctx.fillStyle =
        "rgba(220,235,255,0.18)";

    ctx.beginPath();

    ctx.arc(
        W / 2,
        170,
        100,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /*
        ساختمان‌های دور
    */

    ctx.fillStyle =
        "rgba(4,6,12,0.65)";

    for (let i = 0; i < 18; i++) {

        const x = i * 90;

        const height =
            100 +
            (i % 5) * 35;

        ctx.fillRect(
            x,
            GROUND - height,
            70,
            height
        );
    }

    /*
        زمین
    */

    const floorGradient =
        ctx.createLinearGradient(
            0,
            GROUND,
            0,
            H
        );

    floorGradient.addColorStop(
        0,
        "#303746"
    );

    floorGradient.addColorStop(
        1,
        "#10131b"
    );

    ctx.fillStyle =
        floorGradient;

    ctx.fillRect(
        0,
        GROUND,
        W,
        H - GROUND
    );

    /*
        خطوط زمین
    */

    ctx.strokeStyle =
        "rgba(255,255,255,0.08)";

    ctx.lineWidth = 2;

    for (
        let x = -W;
        x < W * 2;
        x += 100
    ) {

        ctx.beginPath();

        ctx.moveTo(
            W / 2,
            GROUND
        );

        ctx.lineTo(
            x,
            H
        );

        ctx.stroke();
    }

    ctx.strokeStyle =
        "rgba(255,255,255,0.12)";

    ctx.beginPath();

    ctx.moveTo(
        0,
        GROUND
    );

    ctx.lineTo(
        W,
        GROUND
    );

    ctx.stroke();
}


/* =========================================================
   HEALTH
========================================================= */

function updateHealthUI() {

    playerHealthBar.style.width =
        `${player.health}%`;

    enemyHealthBar.style.width =
        `${enemy.health}%`;
}


/* =========================================================
   END GAME
========================================================= */

function checkGameOver() {

    if (player.health <= 0) {

        gameOver = true;

        message.textContent =
            "VORK WINS";

        return;
    }

    if (enemy.health <= 0) {

        gameOver = true;

        message.textContent =
            "ARKEN WINS";

        return;
    }
}


/* =========================================================
   MAIN LOOP
========================================================= */

function update() {

    readGamepad();

    controlPlayer();

    controlAI();

    player.update();

    enemy.update();

    attackCollision(
        player,
        enemy
    );

    attackCollision(
        enemy,
        player
    );

    resetAttackState(player);
    resetAttackState(enemy);

    updateEffects();

    updateHealthUI();

    checkGameOver();
}

function draw() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );

    drawBackground();

    /*
        دشمن و بازیکن
    */

    if (player.x < enemy.x) {

        player.draw();
        enemy.draw();

    } else {

        enemy.draw();
        player.draw();
    }

    drawEffects();
}

function loop() {

    update();

    draw();

    requestAnimationFrame(loop);
}

loop();


/* =========================================================
   RESIZE
========================================================= */

function resizeCanvas() {

    const ratio =
        window.innerWidth /
        window.innerHeight;

    /*
        رزولوشن داخلی ثابت می‌ماند
        تا بازی در موبایل و PC ظاهر یکسانی داشته باشد.
    */

    canvas.style.width =
        window.innerWidth + "px";

    canvas.style.height =
        window.innerHeight + "px";
}

window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();
