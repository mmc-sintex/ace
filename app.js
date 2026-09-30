import * as THREE from "three";

/* =========================================================
   SETTINGS
========================================================= */

const CONFIG = {
    gravity: 24,
    jumpPower: 9,
    moveSpeed: 5.5,
    arenaLimit: 8.5,
    roundHealth: 100,

    punch: {
        duration: 0.22,
        activeStart: 0.055,
        activeEnd: 0.12,
        damage: 8,
        reach: 1.55,
        knockback: 2.8
    },

    kick: {
        duration: 0.29,
        activeStart: 0.075,
        activeEnd: 0.17,
        damage: 11,
        reach: 1.75,
        knockback: 3.7
    }
};


/* =========================================================
   GLOBAL STATE
========================================================= */

let playersCount = 1;
let controlMode = "auto";
let difficulty = 50;

let gameStarted = false;
let gameOver = false;

let fighter1;
let fighter2;

let scene;
let camera;
let renderer;

let clock;

const keys = {};

const touchState = {
    1: {
        left: false,
        right: false,
        block: false
    },

    2: {
        left: false,
        right: false,
        block: false
    }
};


/* =========================================================
   DOM
========================================================= */

const game = document.getElementById("game");

const menu = document.getElementById("menu");

const difficultyInput =
    document.getElementById("difficulty");

const difficultyValue =
    document.getElementById("difficultyValue");

const difficultyBox =
    document.getElementById("difficultyBox");

const startButton =
    document.getElementById("startButton");

const hud =
    document.getElementById("hud");

const hp1 =
    document.getElementById("hp1");

const hp2 =
    document.getElementById("hp2");

const combo1 =
    document.getElementById("combo1");

const roundText =
    document.getElementById("roundText");

const mobileControls =
    document.getElementById("mobileControls");

const controlsP1 =
    document.getElementById("controlsP1");

const controlsP2 =
    document.getElementById("controlsP2");

const settingsPanel =
    document.getElementById("settingsPanel");

const resultScreen =
    document.getElementById("resultScreen");

const winnerText =
    document.getElementById("winnerText");


/* =========================================================
   MENU
========================================================= */

document
    .querySelectorAll("[data-players]")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll("[data-players]")
                .forEach(b => b.classList.remove("active"));

            button.classList.add("active");

            playersCount =
                Number(button.dataset.players);

            difficultyBox.style.display =
                playersCount === 1
                    ? "block"
                    : "none";
        });
    });


document
    .querySelectorAll("[data-control]")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll("[data-control]")
                .forEach(b => b.classList.remove("active"));

            button.classList.add("active");

            controlMode =
                button.dataset.control;
        });
    });


difficultyInput.addEventListener("input", () => {

    difficulty =
        Number(difficultyInput.value);

    difficultyValue.textContent =
        difficulty;
});


/* =========================================================
   THREE.JS
========================================================= */

function createScene() {

    scene = new THREE.Scene();

    scene.background =
        new THREE.Color(0x07101c);

    scene.fog =
        new THREE.Fog(0x07101c, 12, 35);


    renderer =
        new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    renderer.outputColorSpace =
        THREE.SRGBColorSpace;

    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.2;

    game.appendChild(renderer.domElement);


    camera =
        new THREE.PerspectiveCamera(
            45,
            window.innerWidth /
            window.innerHeight,
            0.1,
            100
        );

    camera.position.set(
        0,
        4.5,
        13
    );


    clock = new THREE.Clock();


    createLights();

    createArena();

    createDecorations();


    window.addEventListener(
        "resize",
        resize
    );
}


/* =========================================================
   LIGHTS
========================================================= */

function createLights() {

    const hemi =
        new THREE.HemisphereLight(
            0xbcd7ff,
            0x151015,
            2.1
        );

    scene.add(hemi);


    const main =
        new THREE.DirectionalLight(
            0xffffff,
            3.5
        );

    main.position.set(
        4,
        10,
        7
    );

    main.castShadow = true;

    main.shadow.mapSize.width = 2048;
    main.shadow.mapSize.height = 2048;

    main.shadow.camera.left = -12;
    main.shadow.camera.right = 12;
    main.shadow.camera.top = 12;
    main.shadow.camera.bottom = -5;

    scene.add(main);


    const blue =
        new THREE.PointLight(
            0x287cff,
            20,
            16
        );

    blue.position.set(
        -7,
        4,
        3
    );

    scene.add(blue);


    const red =
        new THREE.PointLight(
            0xff305c,
            20,
            16
        );

    red.position.set(
        7,
        4,
        3
    );

    scene.add(red);
}


/* =========================================================
   ARENA
========================================================= */

function createArena() {

    const floorMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x111923,
            metalness: .55,
            roughness: .35
        });


    const floor =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                21,
                .5,
                7
            ),
            floorMaterial
        );

    floor.position.y = -.3;

    floor.receiveShadow = true;

    scene.add(floor);


    const lineMaterial =
        new THREE.MeshBasicMaterial({
            color: 0x2380ff
        });


    for (let x = -8; x <= 8; x += 2) {

        const line =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    .025,
                    .015,
                    6
                ),
                lineMaterial
            );

        line.position.set(
            x,
            -.035,
            0
        );

        scene.add(line);
    }


    const back =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                21,
                8,
                .5
            ),
            new THREE.MeshStandardMaterial({
                color: 0x090e16,
                metalness: .5,
                roughness: .7
            })
        );

    back.position.set(
        0,
        3.5,
        -3.2
    );

    back.receiveShadow = true;

    scene.add(back);


    const platform =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                19,
                .15,
                .15
            ),
            new THREE.MeshBasicMaterial({
                color: 0x326fff
            })
        );

    platform.position.set(
        0,
        2.8,
        -2.85
    );

    scene.add(platform);
}


/* =========================================================
   DECORATIONS
========================================================= */

function createDecorations() {

    for (let side of [-1, 1]) {

        for (let i = 0; i < 4; i++) {

            const pillar =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        .65,
                        5,
                        .65
                    ),
                    new THREE.MeshStandardMaterial({
                        color:
                            side === -1
                                ? 0x153b75
                                : 0x59182b,

                        metalness: .7,
                        roughness: .3
                    })
                );

            pillar.position.set(
                side * (5 + i * 2.2),
                2.2,
                -2.7
            );

            pillar.castShadow = true;

            scene.add(pillar);
        }
    }


    for (let i = -4; i <= 4; i++) {

        const light =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    1.4,
                    .08,
                    .08
                ),
                new THREE.MeshBasicMaterial({
                    color:
                        i % 2 === 0
                            ? 0x2f8cff
                            : 0xff315d
                })
            );

        light.position.set(
            i * 2,
            4.8,
            -2.85
        );

        scene.add(light);
    }
}


/* =========================================================
   FIGHTER CLASS
========================================================= */

class Fighter {

    constructor({
        id,
        x,
        color,
        accent,
        name
    }) {

        this.id = id;

        this.name = name;

        this.health =
            CONFIG.roundHealth;

        this.x = x;

        this.y = 0;

        this.velocityY = 0;

        this.grounded = true;

        this.facing =
            id === 1 ? 1 : -1;

        this.state = "idle";

        this.attack = null;

        this.attackTime = 0;

        this.attackHit = false;

        this.queuedAttack = null;

        this.hitstun = 0;

        this.blocking = false;

        this.combo = 0;

        this.comboTimer = 0;

        this.group =
            new THREE.Group();

        this.group.position.set(
            x,
            0,
            0
        );

        scene.add(this.group);


        this.material =
            new THREE.MeshStandardMaterial({
                color,
                metalness: .45,
                roughness: .25
            });


        this.accentMaterial =
            new THREE.MeshStandardMaterial({
                color: accent,
                emissive: accent,
                emissiveIntensity: .45,
                metalness: .5,
                roughness: .2
            });


        this.darkMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x11141a,
                metalness: .6,
                roughness: .2
            });


        this.buildBody();

        this.setFacing(this.facing);
    }


    buildBody() {

        /* ---------- FEET ---------- */

        this.leftFoot =
            this.createPart(
                .34,
                .18,
                .65,
                this.darkMaterial
            );

        this.leftFoot.position.set(
            -.24,
            .12,
            .02
        );


        this.rightFoot =
            this.createPart(
                .34,
                .18,
                .65,
                this.darkMaterial
            );

        this.rightFoot.position.set(
            .24,
            .12,
            .02
        );


        /* ---------- LEGS ---------- */

        this.leftLeg =
            this.createPart(
                .38,
                .95,
                .38,
                this.material
            );

        this.leftLeg.position.set(
            -.24,
            .65,
            0
        );


        this.rightLeg =
            this.createPart(
                .38,
                .95,
                .38,
                this.material
            );

        this.rightLeg.position.set(
            .24,
            .65,
            0
        );


        /* ---------- PELVIS ---------- */

        this.pelvis =
            this.createPart(
                .85,
                .48,
                .5,
                this.darkMaterial
            );

        this.pelvis.position.y = 1.15;


        /* ---------- BODY ---------- */

        this.body =
            this.createPart(
                .95,
                1.15,
                .58,
                this.material
            );

        this.body.position.y = 1.85;


        /* ---------- CHEST ---------- */

        this.chest =
            this.createPart(
                .65,
                .35,
                .62,
                this.accentMaterial
            );

        this.chest.position.set(
            0,
            2.05,
            .32
        );


        /* ---------- HEAD ---------- */

        this.head =
            this.createPart(
                .72,
                .72,
                .72,
                this.material
            );

        this.head.position.y = 2.8;


        /* ---------- VISOR ---------- */

        this.visor =
            this.createPart(
                .54,
                .18,
                .08,
                this.accentMaterial
            );

        this.visor.position.set(
            .25,
            2.85,
            .37
        );


        /* ---------- SHOULDERS ---------- */

        this.shoulderL =
            this.createPart(
                .34,
                .35,
                .48,
                this.accentMaterial
            );

        this.shoulderL.position.set(
            -.62,
            2.18,
            0
        );


        this.shoulderR =
            this.createPart(
                .34,
                .35,
                .48,
                this.accentMaterial
            );

        this.shoulderR.position.set(
            .62,
            2.18,
            0
        );


        /* ---------- ARMS ---------- */

        this.armL =
            new THREE.Group();

        this.armL.position.set(
            -.64,
            2.05,
            0
        );

        this.group.add(this.armL);


        this.armLMesh =
            this.createPart(
                .34,
                .9,
                .34,
                this.material
            );

        this.armLMesh.position.y =
            -.43;

        this.armL.add(this.armLMesh);


        this.armR =
            new THREE.Group();

        this.armR.position.set(
            .64,
            2.05,
            0
        );

        this.group.add(this.armR);


        this.armRMesh =
            this.createPart(
                .34,
                .9,
                .34,
                this.material
            );

        this.armRMesh.position.y =
            -.43;

        this.armR.add(this.armRMesh);


        /* ---------- GLOVES ---------- */

        this.fistL =
            this.createPart(
                .4,
                .4,
                .4,
                this.accentMaterial
            );

        this.fistL.position.y = -.9;

        this.armL.add(this.fistL);


        this.fistR =
            this.createPart(
                .4,
                .4,
                .4,
                this.accentMaterial
            );

        this.fistR.position.y = -.9;

        this.armR.add(this.fistR);


        /* ---------- NAME PLATE ---------- */

        this.nameLight =
            new THREE.PointLight(
                this.id === 1
                    ? 0x2780ff
                    : 0xff315d,

                2,
                2.5
            );

        this.nameLight.position.set(
            0,
            2.5,
            .8
        );

        this.group.add(this.nameLight);


        /* ---------- SHADOW ---------- */

        const shadow =
            new THREE.Mesh(
                new THREE.CircleGeometry(
                    .85,
                    32
                ),
                new THREE.MeshBasicMaterial({
                    color: 0x000000,
                    transparent: true,
                    opacity: .45,
                    depthWrite: false
                })
            );

        shadow.rotation.x =
            -Math.PI / 2;

        shadow.position.y =
            .015;

        shadow.scale.set(
            1.5,
            .65,
            1
        );

        this.group.add(shadow);

        this.shadow = shadow;


        this.allParts =
            this.group.children;
    }


    createPart(
        width,
        height,
        depth,
        material
    ) {

        const mesh =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    width,
                    height,
                    depth
                ),
                material
            );

        mesh.castShadow = true;

        mesh.receiveShadow = true;

        this.group.add(mesh);

        return mesh;
    }


    setFacing(direction) {

        this.facing =
            direction >= 0 ? 1 : -1;

        /*
            مهم:
            کل مدل می‌چرخد.
            بنابراین مشت و لگد همیشه
            به سمت جلو حرکت می‌کنند.
        */

        this.group.rotation.y =
            this.facing === 1
                ? 0
                : Math.PI;
    }


    updateFacing(opponent) {

        if (!opponent) return;

        const dx =
            opponent.x - this.x;

        if (Math.abs(dx) > .05) {

            this.setFacing(
                dx > 0 ? 1 : -1
            );
        }
    }


    move(direction, dt) {

        if (this.hitstun > 0)
            return;

        if (this.attack)
            return;

        if (this.blocking)
            return;

        if (!this.grounded)
            return;

        this.x +=
            direction *
            CONFIG.moveSpeed *
            dt;

        this.state =
            Math.abs(direction) > 0
                ? "run"
                : "idle";
    }


    jump() {

        if (
            !this.grounded ||
            this.hitstun > 0 ||
            this.attack
        ) return;

        this.velocityY =
            CONFIG.jumpPower;

        this.grounded = false;

        this.state = "jump";
    }


    startAttack(type) {

        if (this.hitstun > 0)
            return;

        if (this.blocking)
            return;

        if (this.attack) {

            if (
                this.attackTime >
                this.attack.duration * .45
            ) {

                this.queuedAttack =
                    type;
            }

            return;
        }


        const data =
            type === "punch"
                ? CONFIG.punch
                : CONFIG.kick;


        this.attack = {
            type,
            duration: data.duration,
            activeStart: data.activeStart,
            activeEnd: data.activeEnd,
            damage: data.damage,
            reach: data.reach,
            knockback: data.knockback
        };


        this.attackTime = 0;

        this.attackHit = false;


        if (this.comboTimer > 0)
            this.combo++;
        else
            this.combo = 1;

        this.combo =
            Math.min(this.combo, 6);

        this.comboTimer = .5;

        this.state = "attack";
    }


    setBlocking(value) {

        if (this.attack)
            return;

        if (this.hitstun > 0)
            return;

        this.blocking = value;

        this.state =
            value
                ? "block"
                : "idle";
    }


    takeHit(damage, knockback, attacker) {

        if (this.blocking) {

            damage *= .2;

            knockback *= .35;
        }


        this.health =
            Math.max(
                0,
                this.health - damage
            );


        this.hitstun =
            this.blocking
                ? .08
                : .18;


        this.velocityY = 0;


        this.x +=
            attacker.facing *
            knockback *
            .12;


        this.state = "hit";


        createHitEffect(
            this.x,
            this.y + 1.8,
            attacker.facing
        );
    }


    update(dt, opponent) {

        this.updateFacing(opponent);


        if (this.hitstun > 0) {

            this.hitstun -= dt;

            if (this.hitstun < 0)
                this.hitstun = 0;
        }


        if (this.comboTimer > 0) {

            this.comboTimer -= dt;

            if (this.comboTimer <= 0) {
                this.combo = 0;
            }
        }


        /* ---------- JUMP PHYSICS ---------- */

        if (!this.grounded) {

            this.velocityY -=
                CONFIG.gravity * dt;

            this.y +=
                this.velocityY * dt;


            if (this.y <= 0) {

                this.y = 0;

                this.velocityY = 0;

                this.grounded = true;

                if (!this.attack)
                    this.state = "idle";
            }
        }


        /* ---------- ATTACK ---------- */

        if (this.attack) {

            this.attackTime += dt;

            this.animateAttack();


            if (
                this.attackTime >=
                this.attack.duration
            ) {

                const next =
                    this.queuedAttack;

                this.attack = null;

                this.queuedAttack = null;

                this.attackTime = 0;

                if (next) {

                    this.startAttack(
                        next
                    );

                } else {

                    this.state =
                        "idle";
                }
            }
        }


        /* ---------- IDLE ANIMATION ---------- */

        this.animateIdle(dt);


        /* ---------- POSITION ---------- */

        this.group.position.x =
            this.x;

        this.group.position.y =
            this.y;


        this.shadow.scale.x =
            this.grounded
                ? 1
                : .7;

        this.shadow.scale.y =
            this.grounded
                ? .65
                : .4;
    }


    animateIdle(dt) {

        const t =
            performance.now() * .001;


        if (!this.attack) {

            const breathing =
                Math.sin(t * 4) * .025;

            this.body.position.y =
                1.85 + breathing;

            this.head.position.y =
                2.8 + breathing;

            this.armL.rotation.z =
                THREE.MathUtils.lerp(
                    this.armL.rotation.z,
                    0,
                    .2
                );

            this.armR.rotation.z =
                THREE.MathUtils.lerp(
                    this.armR.rotation.z,
                    0,
                    .2
                );

            this.leftLeg.rotation.z =
                THREE.MathUtils.lerp(
                    this.leftLeg.rotation.z,
                    0,
                    .2
                );

            this.rightLeg.rotation.z =
                THREE.MathUtils.lerp(
                    this.rightLeg.rotation.z,
                    0,
                    .2
                );
        }


        if (this.blocking) {

            this.armL.rotation.z =
                -.65;

            this.armR.rotation.z =
                .65;
        }
    }


    animateAttack() {

        if (!this.attack)
            return;


        const progress =
            this.attackTime /
            this.attack.duration;


        const attack =
            this.attack.type;


        if (attack === "punch") {

            /*
                armR = دست جلویی.
                چون کل Fighter بر اساس facing
                چرخیده، جهت مشت همیشه صحیح است.
            */

            let angle;

            if (progress < .3) {

                angle =
                    THREE.MathUtils.lerp(
                        0,
                        Math.PI * .53,
                        progress / .3
                    );

            } else if (progress < .55) {

                angle =
                    Math.PI * .53;

            } else {

                angle =
                    THREE.MathUtils.lerp(
                        Math.PI * .53,
                        0,
                        (progress - .55) / .45
                    );
            }

            this.armR.rotation.z =
                angle;

            this.armL.rotation.z =
                -.15;
        }


        if (attack === "kick") {

            let angle;

            if (progress < .35) {

                angle =
                    THREE.MathUtils.lerp(
                        0,
                        Math.PI * .48,
                        progress / .35
                    );

            } else if (progress < .62) {

                angle =
                    Math.PI * .48;

            } else {

                angle =
                    THREE.MathUtils.lerp(
                        Math.PI * .48,
                        0,
                        (progress - .62) / .38
                    );
            }

            this.rightLeg.rotation.z =
                angle;

            this.leftLeg.rotation.z =
                -.08;
        }
    }
}


/* =========================================================
   HIT EFFECT
========================================================= */

function createHitEffect(
    x,
    y,
    direction
) {

    const group =
        new THREE.Group();

    group.position.set(
        x + direction * .8,
        y,
        .7
    );

    scene.add(group);


    for (let i = 0; i < 8; i++) {

        const mesh =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    .07,
                    .07,
                    .07
                ),
                new THREE.MeshBasicMaterial({
                    color:
                        i % 2
                            ? 0xffd84d
                            : 0xffffff
                })
            );

        mesh.position.set(
            0,
            0,
            0
        );

        mesh.userData.vx =
            (Math.random() - .5) * 5;

        mesh.userData.vy =
            (Math.random() - .5) * 5;

        mesh.userData.life =
            .25;

        group.add(mesh);
    }


    const animate = () => {

        const dt =
            .016;

        let alive = false;

        group.children.forEach(p => {

            p.userData.life -= dt;

            p.position.x +=
                p.userData.vx * dt;

            p.position.y +=
                p.userData.vy * dt;

            p.userData.vy -=
                8 * dt;

            if (p.userData.life > 0)
                alive = true;
        });


        if (alive) {

            requestAnimationFrame(
                animate
            );

        } else {

            scene.remove(group);
        }
    };

    animate();
}


/* =========================================================
   HIT DETECTION
========================================================= */

function checkAttack(attacker, defender) {

    if (!attacker.attack)
        return;

    if (attacker.attackHit)
        return;


    const a =
        attacker.attack;

    const elapsed =
        attacker.attackTime;


    if (
        elapsed < a.activeStart ||
        elapsed > a.activeEnd
    ) return;


    const dx =
        defender.x - attacker.x;


    const forwardDistance =
        dx * attacker.facing;


    const verticalDistance =
        Math.abs(
            defender.y -
            attacker.y
        );


    if (
        forwardDistance > .35 &&
        forwardDistance < a.reach &&
        verticalDistance < 1.8
    ) {

        attacker.attackHit =
            true;


        defender.takeHit(
            a.damage,
            a.knockback,
            attacker
        );


        updateHUD();
    }
}


/* =========================================================
   INPUT
========================================================= */

window.addEventListener(
    "keydown",
    e => {

        keys[e.code] = true;


        if (!gameStarted)
            return;


        if (e.repeat)
            return;


        if (e.code === "KeyW")
            fighter1?.jump();

        if (e.code === "KeyJ")
            fighter1?.startAttack("punch");

        if (e.code === "KeyK")
            fighter1?.startAttack("kick");


        if (
            playersCount === 2
        ) {

            if (e.code === "ArrowUp")
                fighter2?.jump();

            if (e.code === "Numpad1" ||
                e.code === "Digit1")
                fighter2?.startAttack("punch");

            if (e.code === "Numpad2" ||
                e.code === "Digit2")
                fighter2?.startAttack("kick");
        }
    }
);


window.addEventListener(
    "keyup",
    e => {

        keys[e.code] = false;
    }
);


/* =========================================================
   TOUCH
========================================================= */

document
    .querySelectorAll(
        "[data-player][data-action]"
    )
    .forEach(button => {

        const player =
            Number(
                button.dataset.player
            );

        const action =
            button.dataset.action;


        button.addEventListener(
            "pointerdown",
            e => {

                e.preventDefault();

                if (!gameStarted)
                    return;


                if (action === "jump") {

                    getFighter(player)
                        ?.jump();

                    return;
                }


                if (
                    action === "punch" ||
                    action === "kick"
                ) {

                    getFighter(player)
                        ?.startAttack(
                            action
                        );

                    return;
                }


                touchState[player][action] =
                    true;
            }
        );


        const release = e => {

            e.preventDefault();

            if (
                action === "left" ||
                action === "right" ||
                action === "block"
            ) {

                touchState[player][action] =
                    false;
            }
        };


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
    });


/* =========================================================
   GET FIGHTER
========================================================= */

function getFighter(id) {

    return id === 1
        ? fighter1
        : fighter2;
}


/* =========================================================
   PLAYER INPUT
========================================================= */

function updatePlayer1Input() {

    if (!fighter1)
        return;


    let direction = 0;


    if (
        keys["KeyA"] ||
        touchState[1].left
    ) {
        direction -= 1;
    }


    if (
        keys["KeyD"] ||
        touchState[1].right
    ) {
        direction += 1;
    }


    fighter1.move(
        direction,
        clock.getDelta()
    );


    fighter1.setBlocking(
        Boolean(
            keys["KeyL"] ||
            touchState[1].block
        )
    );
}


/* =========================================================
   PLAYER 2 INPUT
========================================================= */

function updatePlayer2Input() {

    if (!fighter2)
        return;


    let direction = 0;


    if (
        keys["ArrowLeft"] ||
        touchState[2].left
    ) {
        direction -= 1;
    }


    if (
        keys["ArrowRight"] ||
        touchState[2].right
    ) {
        direction += 1;
    }


    fighter2.move(
        direction,
        clock.getDelta()
    );


    fighter2.setBlocking(
        Boolean(
            keys["Numpad3"] ||
            keys["Digit3"] ||
            touchState[2].block
        )
    );
}


/* =========================================================
   AI
========================================================= */

let aiThinkTimer = 0;

function updateAI(dt) {

    if (!fighter2)
        return;


    aiThinkTimer -= dt;

    if (aiThinkTimer > 0)
        return;


    /*
        سختی بالاتر:
        واکنش سریع‌تر + دقت بیشتر
    */

    const reactionDelay =
        THREE.MathUtils.lerp(
            .45,
            .045,
            difficulty / 100
        );


    aiThinkTimer =
        reactionDelay;


    const dx =
        fighter1.x -
        fighter2.x;


    const distance =
        Math.abs(dx);


    const accuracy =
        THREE.MathUtils.lerp(
            .3,
            .98,
            difficulty / 100
        );


    const accurate =
        Math.random() <
        accuracy;


    if (!accurate) {

        if (Math.random() < .5)
            fighter2.move(
                dx > 0 ? 1 : -1,
                reactionDelay
            );

        return;
    }


    if (
        distance > 2.2
    ) {

        fighter2.move(
            dx > 0 ? 1 : -1,
            reactionDelay
        );

        if (
            Math.random() < .06 +
            difficulty / 1000
        ) {

            fighter2.jump();
        }

        return;
    }


    if (
        fighter1.attack &&
        Math.random() <
        .25 + difficulty / 180
    ) {

        fighter2.setBlocking(
            true
        );

        setTimeout(() => {

            fighter2?.setBlocking(
                false
            );

        }, 160);

        return;
    }


    const roll =
        Math.random();


    if (roll < .48) {

        fighter2.startAttack(
            "punch"
        );

    } else if (roll < .8) {

        fighter2.startAttack(
            "kick"
        );

    } else {

        fighter2.jump();
    }
}


/* =========================================================
   CAMERA
========================================================= */

function updateCamera() {

    if (!fighter1 || !fighter2)
        return;


    const centerX =
        (fighter1.x +
         fighter2.x) / 2;


    const distance =
        Math.abs(
            fighter1.x -
            fighter2.x
        );


    camera.position.x =
        THREE.MathUtils.lerp(
            camera.position.x,
            centerX * .25,
            .06
        );


    const targetZ =
        12 +
        Math.min(
            distance * .35,
            3
        );


    camera.position.z =
        THREE.MathUtils.lerp(
            camera.position.z,
            targetZ,
            .04
        );


    camera.lookAt(
        centerX,
        1.7,
        0
    );
}


/* =========================================================
   BOUNDARIES
========================================================= */

function keepInsideArena() {

    for (
        const fighter of
        [fighter1, fighter2]
    ) {

        if (!fighter)
            continue;

        fighter.x =
            THREE.MathUtils.clamp(
                fighter.x,
                -CONFIG.arenaLimit,
                CONFIG.arenaLimit
            );
    }


    if (
        fighter1 &&
        fighter2
    ) {

        const difference =
            fighter2.x -
            fighter1.x;


        if (
            Math.abs(difference) <
            .85
        ) {

            const push =
                (.85 -
                 Math.abs(difference))
                / 2;


            if (difference >= 0) {

                fighter1.x -= push;
                fighter2.x += push;

            } else {

                fighter1.x += push;
                fighter2.x -= push;
            }
        }
    }
}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    if (!fighter1 ||
        !fighter2)
        return;


    hp1.style.width =
        fighter1.health + "%";

    hp2.style.width =
        fighter2.health + "%";


    if (
        fighter1.combo >= 2
    ) {

        combo1.textContent =
            fighter1.combo +
            " HIT COMBO";

    } else {

        combo1.textContent = "";
    }


    if (
        fighter2.combo >= 2
    ) {

        roundText.textContent =
            fighter2.combo +
            " HIT";
    }
}


/* =========================================================
   GAME OVER
========================================================= */

function checkGameOver() {

    if (gameOver)
        return;


    if (
        fighter1.health <= 0 ||
        fighter2.health <= 0
    ) {

        gameOver = true;


        if (
            fighter1.health >
            fighter2.health
        ) {

            winnerText.textContent =
                "PLAYER 1 WINS";

        } else {

            winnerText.textContent =
                playersCount === 1
                    ? "AI WINS"
                    : "PLAYER 2 WINS";
        }


        resultScreen.classList.remove(
            "hidden"
        );
    }
}


/* =========================================================
   START GAME
========================================================= */

function startGame() {

    menu.classList.add("hidden");

    resultScreen.classList.add(
        "hidden"
    );


    gameStarted = true;

    gameOver = false;


    if (fighter1)
        scene.remove(
            fighter1.group
        );

    if (fighter2)
        scene.remove(
            fighter2.group
        );


    fighter1 =
        new Fighter({
            id: 1,
            x: -3,
            color: 0x2478ff,
            accent: 0x63a4ff,
            name: "PLAYER 1"
        });


    fighter2 =
        new Fighter({
            id: 2,
            x: 3,
            color: 0xff315d,
            accent: 0xff728e,
            name:
                playersCount === 1
                    ? "AI"
                    : "PLAYER 2"
        });


    document
        .querySelector(".p1-panel .fighter-name")
        .textContent =
            "PLAYER 1";


    document
        .querySelector(".p2-panel .fighter-name")
        .textContent =
            playersCount === 1
                ? "AI"
                : "PLAYER 2";


    roundText.textContent =
        "FIGHT";


    updateHUD();


    configureControls();


    clock.start();
}


/* =========================================================
   CONTROL VISIBILITY
========================================================= */

function configureControls() {

    let showTouch =
        controlMode === "touch";


    if (
        controlMode === "auto"
    ) {

        showTouch =
            "ontouchstart" in window ||
            navigator.maxTouchPoints > 0;
    }


    mobileControls.style.display =
        showTouch
            ? "block"
            : "none";


    controlsP1.style.display =
        showTouch
            ? "flex"
            : "none";


    controlsP2.style.display =
        showTouch &&
        playersCount === 2
            ? "flex"
            : "none";
}


/* =========================================================
   MAIN LOOP
========================================================= */

function animate() {

    requestAnimationFrame(
        animate
    );


    if (!gameStarted) {

        renderer.render(
            scene,
            camera
        );

        return;
    }


    const dt =
        Math.min(
            clock.getDelta(),
            .033
        );


    if (!gameOver) {

        if (
            playersCount === 1
        ) {

            updatePlayer1Input();

            updateAI(dt);

        } else {

            updatePlayer1Input();

            updatePlayer2Input();
        }


        fighter1.update(
            dt,
            fighter2
        );

        fighter2.update(
            dt,
            fighter1
        );


        checkAttack(
            fighter1,
            fighter2
        );

        checkAttack(
            fighter2,
            fighter1
        );


        keepInsideArena();

        updateCamera();

        updateHUD();

        checkGameOver();
    }


    renderer.render(
        scene,
        camera
    );
}


/* =========================================================
   SETTINGS
========================================================= */

const hudScale =
    document.getElementById(
        "hudScale"
    );

const hudOpacity =
    document.getElementById(
        "hudOpacity"
    );

const hudScaleValue =
    document.getElementById(
        "hudScaleValue"
    );

const hudOpacityValue =
    document.getElementById(
        "hudOpacityValue"
    );

const showCombo =
    document.getElementById(
        "showCombo"
    );


function updateHUDSettings() {

    const scale =
        Number(hudScale.value) / 100;

    const opacity =
        Number(hudOpacity.value) / 100;


    hud.style.setProperty(
        "--hud-scale",
        scale
    );

    hud.style.setProperty(
        "--hud-opacity",
        opacity
    );


    hudScaleValue.textContent =
        hudScale.value + "%";

    hudOpacityValue.textContent =
        hudOpacity.value + "%";


    combo1.style.visibility =
        showCombo.checked
            ? "visible"
            : "hidden";
}


hudScale.addEventListener(
    "input",
    updateHUDSettings
);

hudOpacity.addEventListener(
    "input",
    updateHUDSettings
);

showCombo.addEventListener(
    "change",
    updateHUDSettings
);


document
    .querySelectorAll(
        "[data-layout]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                hud.classList.remove(
                    "layout-compact",
                    "layout-center"
                );


                const layout =
                    button.dataset.layout;


                if (
                    layout ===
                    "compact"
                ) {

                    hud.classList.add(
                        "layout-compact"
                    );
                }


                if (
                    layout ===
                    "center"
                ) {

                    hud.classList.add(
                        "layout-center"
                    );
                }
            }
        );
    });


function openSettings() {

    settingsPanel.classList.remove(
        "hidden"
    );
}


function closeSettings() {

    settingsPanel.classList.add(
        "hidden"
    );
}


document
    .getElementById(
        "settingsButton"
    )
    .addEventListener(
        "click",
        openSettings
    );


document
    .getElementById(
        "settingsFromMenu"
    )
    .addEventListener(
        "click",
        openSettings
    );


document
    .getElementById(
        "closeSettings"
    )
    .addEventListener(
        "click",
        closeSettings
    );


/* =========================================================
   RESTART / MENU
========================================================= */

document
    .getElementById(
        "restartButton"
    )
    .addEventListener(
        "click",
        () => {

            if (gameStarted)
                startGame();
        }
    );


document
    .getElementById(
        "rematchButton"
    )
    .addEventListener(
        "click",
        startGame
    );


document
    .getElementById(
        "menuButton"
    )
    .addEventListener(
        "click",
        () => {

            resultScreen.classList.add(
                "hidden"
            );

            gameStarted = false;

            menu.classList.remove(
                "hidden"
            );
        }
    );


startButton.addEventListener(
    "click",
    startGame
);


/* =========================================================
   RESIZE
========================================================= */

function resize() {

    camera.aspect =
        window.innerWidth /
        window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
}


/* =========================================================
   START
========================================================= */

createScene();

updateHUDSettings();

animate();
