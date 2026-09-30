import * as THREE from "three";


/* =====================================================
   PIXEL FIGHTERS 3D
   COMPLETE STARTING ENGINE
===================================================== */


/* =====================================================
   GAME STATE
===================================================== */

const state = {

    mode: 1,

    difficulty: 50,

    p1Control: "keyboard",

    p2Control: "keyboard",

    running: false,

    paused: false,

    timer: 99,

    health1: 100,

    health2: 100,

    keys: {},

    touch: {},

    lastTime: 0,

    roundTimer: null,

    cameraShake: 0

};


/* =====================================================
   DOM
===================================================== */

const canvas =
    document.getElementById("gameCanvas");

const menu =
    document.getElementById("menu");

const gameScreen =
    document.getElementById("gameScreen");

const startButton =
    document.getElementById("startButton");

const difficulty =
    document.getElementById("difficulty");

const difficultyNumber =
    document.getElementById("difficultyNumber");

const difficultyGroup =
    document.getElementById("difficultyGroup");

const player2ControlGroup =
    document.getElementById(
        "player2ControlGroup"
    );

const health1 =
    document.getElementById("health1");

const health2 =
    document.getElementById("health2");

const roundTimer =
    document.getElementById("roundTimer");

const fightMessage =
    document.getElementById(
        "fightMessage"
    );

const combo1 =
    document.getElementById("combo1");

const combo2 =
    document.getElementById("combo2");

const touchHUD =
    document.getElementById("touchHUD");

const hudButton =
    document.getElementById("hudButton");

const hudEditor =
    document.getElementById("hudEditor");

const hudClose =
    document.getElementById("hudClose");

const hudEditMode =
    document.getElementById(
        "hudEditMode"
    );

const hudReset =
    document.getElementById("hudReset");

const hudSize =
    document.getElementById("hudSize");

const hudSizeValue =
    document.getElementById(
        "hudSizeValue"
    );

const pauseButton =
    document.getElementById(
        "pauseButton"
    );


/* =====================================================
   THREE.JS SCENE
===================================================== */

let scene;
let camera;
let renderer;

let clock;

let arena;

let fighter1;
let fighter2;


/* =====================================================
   INIT
===================================================== */

function initThree() {

    scene =
        new THREE.Scene();


    /*
        Sky
    */

    scene.background =
        new THREE.Color(
            0x17284d
        );


    /*
        Fog
    */

    scene.fog =
        new THREE.Fog(
            0x17284d,
            20,
            70
        );


    /*
        Camera
    */

    camera =
        new THREE.PerspectiveCamera(
            48,
            innerWidth / innerHeight,
            .1,
            150
        );


    camera.position.set(
        0,
        6,
        18
    );


    /*
        Renderer
    */

    renderer =
        new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            powerPreference: "high-performance"
        });


    renderer.setPixelRatio(
        Math.min(
            devicePixelRatio,
            2
        )
    );

    renderer.setSize(
        innerWidth,
        innerHeight
    );


    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;


    /*
        Color
    */

    renderer.outputColorSpace =
        THREE.SRGBColorSpace;


    /*
        Clock
    */

    clock =
        new THREE.Clock();


    /*
        Lights
    */

    createLights();


    /*
        Arena
    */

    createArena();


    /*
        Fighters
    */

    fighter1 =
        createFighter(
            0xd93655,
            "PLAYER 1"
        );

    fighter2 =
        createFighter(
            0x32c47d,
            "PLAYER 2"
        );


    fighter1.position.x =
        -3.8;

    fighter2.position.x =
        3.8;


    scene.add(
        fighter1.group
    );

    scene.add(
        fighter2.group
    );


    /*
        Resize
    */

    window.addEventListener(
        "resize",
        resize
    );

}


/* =====================================================
   LIGHTING
===================================================== */

function createLights() {

    const ambient =
        new THREE.HemisphereLight(
            0x9edcff,
            0x21150e,
            2.4
        );

    scene.add(ambient);


    const sun =
        new THREE.DirectionalLight(
            0xffffff,
            3
        );

    sun.position.set(
        -8,
        15,
        10
    );

    sun.castShadow = true;

    sun.shadow.mapSize.width =
        2048;

    sun.shadow.mapSize.height =
        2048;

    sun.shadow.camera.left =
        -20;

    sun.shadow.camera.right =
        20;

    sun.shadow.camera.top =
        20;

    sun.shadow.camera.bottom =
        -20;

    scene.add(sun);


    const rim =
        new THREE.DirectionalLight(
            0x658cff,
            1.5
        );

    rim.position.set(
        10,
        7,
        -10
    );

    scene.add(rim);

}


/* =====================================================
   ARENA
===================================================== */

function createArena() {

    arena =
        new THREE.Group();


    /*
        Floor
    */

    const floorGeometry =
        new THREE.BoxGeometry(
            22,
            .7,
            10
        );

    const floorMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x70442a,
            roughness: .85
        });

    const floor =
        new THREE.Mesh(
            floorGeometry,
            floorMaterial
        );

    floor.position.y =
        -.35;

    floor.receiveShadow = true;

    arena.add(floor);


    /*
        Floor tiles
    */

    for (
        let x = -10;
        x <= 10;
        x += 2
    ) {

        const line =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    .035,
                    .015,
                    10
                ),
                new THREE.MeshBasicMaterial({
                    color: 0x9a633b
                })
            );

        line.position.set(
            x,
            .015,
            0
        );

        arena.add(line);

    }


    /*
        Back wall
    */

    const wall =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                24,
                14,
                .5
            ),
            new THREE.MeshStandardMaterial({
                color: 0x263a63,
                roughness: .8
            })
        );

    wall.position.set(
        0,
        6,
        -5
    );

    wall.receiveShadow = true;

    arena.add(wall);


    /*
        Neon panels
    */

    for (
        let x = -9;
        x <= 9;
        x += 3
    ) {

        const panel =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    1.7,
                    4,
                    .15
                ),
                new THREE.MeshStandardMaterial({
                    color:
                        x % 2 === 0
                            ? 0x315bd8
                            : 0xb63860,

                    emissive:
                        x % 2 === 0
                            ? 0x10205c
                            : 0x4a1025,

                    emissiveIntensity: .7
                })
            );

        panel.position.set(
            x,
            4.5,
            -4.7
        );

        arena.add(panel);

    }


    /*
        Platforms / decorations
    */

    for (
        let x = -10;
        x <= 10;
        x += 5
    ) {

        const pillar =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    .6,
                    7,
                    .6
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x1c2338,
                    roughness: .5
                })
            );

        pillar.position.set(
            x,
            3.2,
            -4.3
        );

        pillar.castShadow = true;

        arena.add(pillar);

    }


    scene.add(arena);

}


/* =====================================================
   FIGHTER
===================================================== */

function createFighter(
    color,
    name
) {

    const group =
        new THREE.Group();


    /*
        Main body
    */

    const body =
        new THREE.Group();

    body.position.y =
        1.65;

    group.add(body);


    /*
        Materials
    */

    const skin =
        new THREE.MeshStandardMaterial({
            color: 0xf0ad78,
            roughness: .65
        });

    const shirt =
        new THREE.MeshStandardMaterial({
            color,
            roughness: .6
        });

    const pants =
        new THREE.MeshStandardMaterial({
            color: 0x202c58,
            roughness: .8
        });

    const dark =
        new THREE.MeshStandardMaterial({
            color: 0x151722,
            roughness: .8
        });


    /*
        Torso
    */

    const torso =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.05,
                1.45,
                .65
            ),
            shirt
        );

    torso.position.y =
        .1;

    torso.castShadow = true;

    body.add(torso);


    /*
        Head
    */

    const head =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .78,
                .78,
                .7
            ),
            skin
        );

    head.position.y =
        1.25;

    head.castShadow = true;

    body.add(head);


    /*
        Hair
    */

    const hair =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .82,
                .23,
                .73
            ),
            dark
        );

    hair.position.y =
        1.62;

    hair.castShadow = true;

    body.add(hair);


    /*
        Arms
    */

    const leftArm =
        createLimb(
            .28,
            1.1,
            skin
        );

    leftArm.position.set(
        -.68,
        .35,
        0
    );

    body.add(leftArm);


    const rightArm =
        createLimb(
            .28,
            1.1,
            skin
        );

    rightArm.position.set(
        .68,
        .35,
        0
    );

    body.add(rightArm);


    /*
        Gloves
    */

    const leftGlove =
        createGlove(
            color
        );

    leftGlove.position.y =
        -.57;

    leftArm.add(leftGlove);


    const rightGlove =
        createGlove(
            color
        );

    rightGlove.position.y =
        -.57;

    rightArm.add(rightGlove);


    /*
        Legs
    */

    const leftLeg =
        createLimb(
            .34,
            1.25,
            pants
        );

    leftLeg.position.set(
        -.3,
        -.98,
        0
    );

    body.add(leftLeg);


    const rightLeg =
        createLimb(
            .34,
            1.25,
            pants
        );

    rightLeg.position.set(
        .3,
        -.98,
        0
    );

    body.add(rightLeg);


    /*
        Shoes
    */

    const leftShoe =
        createShoe();

    leftShoe.position.y =
        -.65;

    leftLeg.add(leftShoe);


    const rightShoe =
        createShoe();

    rightShoe.position.y =
        -.65;

    rightLeg.add(rightShoe);


    /*
        Store references
    */

    return {

        group,

        body,

        torso,

        head,

        leftArm,

        rightArm,

        leftLeg,

        rightLeg,

        state: {

            x:
                group.position.x,

            velocityX: 0,

            velocityY: 0,

            grounded: true,

            facing: 1,

            action: "idle",

            actionTime: 0,

            attackHit: false,

            combo: 0,

            comboTimer: 0,

            blocking: false,

            stun: 0,

            aiTimer: 0

        }

    };

}


/* =====================================================
   LIMBS
===================================================== */

function createLimb(
    width,
    height,
    material
) {

    const group =
        new THREE.Group();


    const mesh =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                height,
                width
            ),
            material
        );


    mesh.position.y =
        -height / 2;

    mesh.castShadow = true;

    group.add(mesh);

    return group;

}


/* =====================================================
   GLOVE
===================================================== */

function createGlove(
    color
) {

    return new THREE.Mesh(
        new THREE.BoxGeometry(
            .34,
            .34,
            .4
        ),
        new THREE.MeshStandardMaterial({
            color: 0x151515,
            roughness: .45,
            emissive: color,
            emissiveIntensity: .15
        })
    );

}


/* =====================================================
   SHOE
===================================================== */

function createShoe() {

    return new THREE.Mesh(
        new THREE.BoxGeometry(
            .42,
            .25,
            .7
        ),
        new THREE.MeshStandardMaterial({
            color: 0x111318,
            roughness: .7
        })
    );

}


/* =====================================================
   MENU EVENTS
===================================================== */

document
    .querySelectorAll(
        ".option"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".option"
                    )
                    .forEach(
                        b =>
                            b.classList.remove(
                                "active"
                            )
                    );

                button.classList.add(
                    "active"
                );

                state.mode =
                    Number(
                        button.dataset.mode
                    );


                if (
                    state.mode === 1
                ) {

                    difficultyGroup
                        .classList.remove(
                            "hidden"
                        );

                    player2ControlGroup
                        .classList.add(
                            "hidden"
                        );

                } else {

                    difficultyGroup
                        .classList.add(
                            "hidden"
                        );

                    player2ControlGroup
                        .classList.remove(
                            "hidden"
                        );

                }

            }
        );

    });


/* =====================================================
   DIFFICULTY
===================================================== */

difficulty.addEventListener(
    "input",
    () => {

        state.difficulty =
            Number(
                difficulty.value
            );

        difficultyNumber.textContent =
            state.difficulty;

    }
);


/* =====================================================
   CONTROLS
===================================================== */

document
    .querySelectorAll(
        ".control-option"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".control-option"
                    )
                    .forEach(
                        b =>
                            b.classList.remove(
                                "active"
                            )
                    );

                button.classList.add(
                    "active"
                );

                state.p1Control =
                    button.dataset.control;

            }
        );

    });


document
    .querySelectorAll(
        ".control2-option"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".control2-option"
                    )
                    .forEach(
                        b =>
                            b.classList.remove(
                                "active"
                            )
                    );

                button.classList.add(
                    "active"
                );

                state.p2Control =
                    button.dataset.control;

            }
        );

    });


/* =====================================================
   START GAME
===================================================== */

startButton.addEventListener(
    "click",
    startGame
);


function startGame() {

    menu.classList.add(
        "hidden"
    );

    gameScreen.classList.remove(
        "hidden"
    );


    state.running = true;

    state.paused = false;

    state.health1 = 100;

    state.health2 = 100;

    state.timer = 99;


    fighter1.group.position.set(
        -3.8,
        0,
        0
    );

    fighter2.group.position.set(
        3.8,
        0,
        0
    );


    resetFighter(
        fighter1
    );

    resetFighter(
        fighter2
    );


    health1.style.width =
        "100%";

    health2.style.width =
        "100%";


    roundTimer.textContent =
        "99";


    setupTouchControls();


    showMessage(
        "READY!"
    );


    setTimeout(
        () => {

            if (
                state.running
            ) {

                showMessage(
                    "FIGHT!"
                );

            }

        },
        800
    );


    clearInterval(
        state.roundTimer
    );


    state.roundTimer =
        setInterval(
            () => {

                if (
                    !state.running ||
                    state.paused
                )
                    return;

                state.timer--;

                roundTimer.textContent =
                    state.timer;

                if (
                    state.timer <= 0
                ) {

                    finishRound();

                }

            },
            1000
        );


    state.lastTime =
        performance.now();

    requestAnimationFrame(
        gameLoop
    );

}


/* =====================================================
   RESET FIGHTER
===================================================== */

function resetFighter(
    fighter
) {

    const s =
        fighter.state;

    s.velocityX = 0;

    s.velocityY = 0;

    s.grounded = true;

    s.facing = 1;

    s.action = "idle";

    s.actionTime = 0;

    s.attackHit = false;

    s.combo = 0;

    s.comboTimer = 0;

    s.blocking = false;

    s.stun = 0;

}


/* =====================================================
   GAME LOOP
===================================================== */

function gameLoop(
    now
) {

    if (
        !state.running
    )
        return;


    const dt =
        Math.min(
            (now -
                state.lastTime) /
            1000,
            .033
        );


    state.lastTime =
        now;


    if (
        !state.paused
    ) {

        updateInput();

        updateAI(
            dt
        );

        updateFighter(
            fighter1,
            fighter2,
            dt
        );

        updateFighter(
            fighter2,
            fighter1,
            dt
        );

        updateAnimations(
            fighter1,
            fighter2,
            dt
        );

        updateAnimations(
            fighter2,
            fighter1,
            dt
        );

        updateCamera(
            dt
        );

    }


    renderer.render(
        scene,
        camera
    );


    requestAnimationFrame(
        gameLoop
    );

}


/* =====================================================
   INPUT
===================================================== */

function updateInput() {

    /*
        PLAYER 1
    */

    if (
        state.p1Control ===
        "keyboard"
    ) {

        if (
            state.keys.KeyA
        )
            move(
                fighter1,
                -1
            );

        if (
            state.keys.KeyD
        )
            move(
                fighter1,
                1
            );

        if (
            state.keys.KeyW
        )
            jump(
                fighter1
            );

        if (
            state.keys.KeyS
        )
            block(
                fighter1,
                true
            );
        else
            block(
                fighter1,
                false
            );

    }


    /*
        TOUCH
    */

    if (
        state.p1Control ===
        "touch"
    ) {

        if (
            state.touch.left
        )
            move(
                fighter1,
                -1
            );

        if (
            state.touch.right
        )
            move(
                fighter1,
                1
            );

        if (
            state.touch.jump
        )
            jump(
                fighter1
            );

        block(
            fighter1,
            !!state.touch.block
        );

    }


    /*
        GAMEPAD
    */

    readGamepads();

}


/* =====================================================
   KEYBOARD
===================================================== */

window.addEventListener(
    "keydown",
    event => {

        state.keys[
            event.code
        ] = true;


        /*
            P1 attacks
        */

        if (
            state.p1Control ===
            "keyboard"
        ) {

            if (
                event.code ===
                "KeyF"
            )
                attack(
                    fighter1,
                    "punch"
                );

            if (
                event.code ===
                "KeyG"
            )
                attack(
                    fighter1,
                    "kick"
                );

        }


        /*
            P2
        */

        if (
            state.mode === 2 &&
            state.p2Control ===
            "keyboard"
        ) {

            if (
                event.code ===
                "ArrowUp"
            )
                jump(
                    fighter2
                );

            if (
                event.code ===
                "Numpad1"
            )
                attack(
                    fighter2,
                    "punch"
                );

            if (
                event.code ===
                "Numpad2"
            )
                attack(
                    fighter2,
                    "kick"
                );

        }

    }
);


window.addEventListener(
    "keyup",
    event => {

        state.keys[
            event.code
        ] = false;

    }
);


/* =====================================================
   MOVE
===================================================== */

function move(
    fighter,
    direction
) {

    const s =
        fighter.state;


    if (
        s.stun > 0
    )
        return;


    if (
        s.action !== "idle" &&
        s.action !== "walk"
    )
        return;


    const speed =
        5.5;


    s.velocityX =
        direction *
        speed;


    s.action =
        "walk";


    /*
        Actual direction will
        always be determined
        by opponent later.
    */

}


/* =====================================================
   JUMP
===================================================== */

function jump(
    fighter
) {

    const s =
        fighter.state;


    if (
        !s.grounded ||
        s.stun > 0
    )
        return;


    s.grounded =
        false;

    s.velocityY =
        8.5;

    s.action =
        "jump";

}


/* =====================================================
   BLOCK
===================================================== */

function block(
    fighter,
    active
) {

    const s =
        fighter.state;


    if (
        s.stun > 0
    )
        return;


    s.blocking =
        active;


    if (
        active &&
        s.grounded
    ) {

        s.action =
            "block";

    }

}


/* =====================================================
   ATTACK
===================================================== */

function attack(
    fighter,
    type
) {

    const s =
        fighter.state;


    if (
        s.stun > 0
    )
        return;


    if (
        !s.grounded
    )
        return;


    if (
        s.action === "punch" ||
        s.action === "kick"
    )
        return;


    s.action =
        type;


    s.actionTime =
        0;


    s.attackHit =
        false;


    /*
        Different animation lengths
    */

    if (
        type === "punch"
    ) {

        s.actionDuration =
            .19;

    } else {

        s.actionDuration =
            .28;

    }

}


/* =====================================================
   FIGHTER PHYSICS
===================================================== */

function updateFighter(
    fighter,
    opponent,
    dt
) {

    const s =
        fighter.state;


    /*
        Facing
    */

    if (
        opponent.group.position.x >
        fighter.group.position.x
    ) {

        s.facing = 1;

    } else {

        s.facing = -1;

    }


    /*
        Gravity
    */

    if (
        !s.grounded
    ) {

        s.velocityY -=
            20 * dt;

        fighter.group.position.y +=
            s.velocityY * dt;


        if (
            fighter.group.position.y <= 0
        ) {

            fighter.group.position.y =
                0;

            s.velocityY =
                0;

            s.grounded =
                true;

            s.action =
                "idle";

        }

    }


    /*
        Horizontal movement
    */

    fighter.group.position.x +=
        s.velocityX * dt;


    s.velocityX *=
        Math.pow(
            .0001,
            dt
        );


    /*
        Arena limits
    */

    fighter.group.position.x =
        THREE.MathUtils.clamp(
            fighter.group.position.x,
            -8.5,
            8.5
        );


    /*
        Attack timer
    */

    if (
        s.action === "punch" ||
        s.action === "kick"
    ) {

        s.actionTime +=
            dt;


        /*
            Hit frame

            Punch:
            ~50% through

            Kick:
            ~55% through
        */

        const hitTime =
            s.action === "punch"
                ? .075
                : .12;


        if (
            !s.attackHit &&
            s.actionTime >= hitTime
        ) {

            s.attackHit =
                true;

            performHit(
                fighter,
                opponent
            );

        }


        if (
            s.actionTime >=
            s.actionDuration
        ) {

            s.action =
                "idle";

            s.actionTime =
                0;

        }

    }


    /*
        Combo timer
    */

    if (
        s.comboTimer > 0
    ) {

        s.comboTimer -=
            dt;

    } else {

        s.combo =
            0;

    }


    /*
        Stun
    */

    if (
        s.stun > 0
    ) {

        s.stun -=
            dt;

        s.action =
            "hit";

    }

}


/* =====================================================
   HIT DETECTION
===================================================== */

function performHit(
    attacker,
    defender
) {

    const a =
        attacker.state;

    const d =
        defender.state;


    const distance =
        Math.abs(
            attacker.group.position.x -
            defender.group.position.x
        );


    /*
        Direction safety.

        Attack only works if
        defender is in front.
    */

    const direction =
        defender.group.position.x >
        attacker.group.position.x
            ? 1
            : -1;


    if (
        direction !==
        a.facing
    )
        return;


    const range =
        a.action === "punch"
            ? 1.7
            : 2.05;


    if (
        distance > range
    )
        return;


    /*
        Block
    */

    if (
        d.blocking
    ) {

        damage(
            defender,
            2
        );

        showImpact(
            defender,
            true
        );

        return;

    }


    /*
        Damage
    */

    const amount =
        a.action === "punch"
            ? 7
            : 10;


    damage(
        defender,
        amount
    );


    /*
        Combo
    */

    a.combo++;

    a.comboTimer =
        1.15;


    updateComboText(
        attacker,
        a.combo
    );


    /*
        Stun
    */

    d.stun =
        a.action === "punch"
            ? .12
            : .17;


    /*
        Knockback
    */

    defender.group.position.x +=
        a.facing *
        (
            a.action === "punch"
                ? .18
                : .3
        );


    /*
        Camera shake
    */

    state.cameraShake =
        a.action === "punch"
            ? .07
            : .12;


    showImpact(
        defender,
        false
    );

}


/* =====================================================
   DAMAGE
===================================================== */

function damage(
    defender,
    amount
) {

    if (
        defender === fighter1
    ) {

        state.health1 =
            Math.max(
                0,
                state.health1 -
                amount
            );

        health1.style.width =
            state.health1 + "%";


    } else {

        state.health2 =
            Math.max(
                0,
                state.health2 -
                amount
            );

        health2.style.width =
            state.health2 + "%";

    }


    if (
        state.health1 <= 0 ||
        state.health2 <= 0
    ) {

        finishRound();

    }

}


/* =====================================================
   IMPACT EFFECT
===================================================== */

function showImpact(
    defender,
    blocked
) {

    const color =
        blocked
            ? 0x65b9ff
            : 0xffe66d;


    const geometry =
        new THREE.SphereGeometry(
            .16,
            8,
            8
        );


    const material =
        new THREE.MeshBasicMaterial({
            color,
            transparent: true
        });


    const effect =
        new THREE.Mesh(
            geometry,
            material
        );


    effect.position.copy(
        defender.group.position
    );

    effect.position.y +=
        2;


    scene.add(effect);


    const start =
        performance.now();


    function animateImpact(
        now
    ) {

        const progress =
            Math.min(
                (now - start) /
                220,
                1
            );


        effect.scale.setScalar(
            1 +
            progress * 5
        );


        material.opacity =
            1 - progress;


        if (
            progress < 1
        ) {

            requestAnimationFrame(
                animateImpact
            );

        } else {

            scene.remove(
                effect
            );

            geometry.dispose();

            material.dispose();

        }

    }


    requestAnimationFrame(
        animateImpact
    );

}


/* =====================================================
   COMBO TEXT
===================================================== */

function updateComboText(
    fighter,
    combo
) {

    if (
        fighter === fighter1
    ) {

        combo1.textContent =
            combo >= 2
                ? `${combo} HIT COMBO`
                : "";

    } else {

        combo2.textContent =
            combo >= 2
                ? `${combo} HIT COMBO`
                : "";

    }

}


/* =====================================================
   ANIMATION SYSTEM
===================================================== */

function updateAnimations(
    fighter,
    opponent,
    dt
) {

    const s =
        fighter.state;


    const time =
        performance.now() /
        1000;


    /*
        Reset base rotations
    */

    fighter.leftArm.rotation.z =
        0;

    fighter.rightArm.rotation.z =
        0;

    fighter.leftLeg.rotation.z =
        0;

    fighter.rightLeg.rotation.z =
        0;

    fighter.body.rotation.z =
        0;


    /*
        Idle breathing
    */

    const breathing =
        Math.sin(
            time * 4
        ) * .025;


    fighter.body.position.y =
        1.65 +
        breathing;


    /*
        Walking animation
    */

    if (
        s.action === "walk"
    ) {

        const walk =
            Math.sin(
                time * 13
            );


        fighter.leftLeg.rotation.x =
            walk * .6;

        fighter.rightLeg.rotation.x =
            -walk * .6;


        fighter.leftArm.rotation.x =
            -walk * .35;

        fighter.rightArm.rotation.x =
            walk * .35;

    }


    /*
        JUMP
    */

    if (
        s.action === "jump"
    ) {

        fighter.leftLeg.rotation.x =
            -.4;

        fighter.rightLeg.rotation.x =
            .4;

        fighter.leftArm.rotation.z =
            -.35;

        fighter.rightArm.rotation.z =
            .35;

    }


    /*
        BLOCK
    */

    if (
        s.blocking
    ) {

        fighter.leftArm.rotation.z =
            -.9;

        fighter.rightArm.rotation.z =
            .9;

    }


    /*
        PUNCH

        سریع و فریم‌مانند
    */

    if (
        s.action === "punch"
    ) {

        const p =
            Math.min(
                s.actionTime /
                s.actionDuration,
                1
            );


        const punchCurve =
            Math.sin(
                p * Math.PI
            );


        /*
            Arm always goes
            toward opponent.
        */

        const arm =
            s.facing === 1
                ? fighter.rightArm
                : fighter.leftArm;


        arm.rotation.z =
            THREE.MathUtils.lerp(
                0,
                s.facing *
                -1.35,
                punchCurve
            );


        fighter.body.rotation.y =
            s.facing *
            -.12 *
            punchCurve;

    }


    /*
        KICK
    */

    if (
        s.action === "kick"
    ) {

        const p =
            Math.min(
                s.actionTime /
                s.actionDuration,
                1
            );


        const kickCurve =
            Math.sin(
                p * Math.PI
            );


        const leg =
            s.facing === 1
                ? fighter.rightLeg
                : fighter.leftLeg;


        leg.rotation.z =
            THREE.MathUtils.lerp(
                0,
                s.facing *
                -1.25,
                kickCurve
            );


        fighter.body.rotation.y =
            s.facing *
            -.16 *
            kickCurve;

    }


    /*
        HIT
    */

    if (
        s.action === "hit"
    ) {

        fighter.body.rotation.z =
            Math.sin(
                time * 50
            ) * .12;

    }


    /*
        Always face opponent.

        IMPORTANT:
        We rotate the whole character
        around Y only.

        This means punches
        never get visually reversed.
    */

    fighter.group.rotation.y =
        s.facing === 1
            ? 0
            : Math.PI;

}


/* =====================================================
   AI
===================================================== */

function updateAI(
    dt
) {

    if (
        state.mode !== 1
    )
        return;


    const ai =
        fighter2;

    const player =
        fighter1;


    const s =
        ai.state;


    s.aiTimer -=
        dt;


    if (
        s.aiTimer > 0
    )
        return;


    /*
        Difficulty 1:
        slow reaction

        Difficulty 100:
        very fast reaction
    */

    const reaction =
        THREE.MathUtils.lerp(
            1.1,
            .08,
            state.difficulty /
            100
        );


    s.aiTimer =
        reaction;


    const distance =
        Math.abs(
            ai.group.position.x -
            player.group.position.x
        );


    /*
        Close range
    */

    if (
        distance < 2.2
    ) {

        /*
            Higher difficulty =
            more accurate attacks
        */

        const accuracy =
            state.difficulty /
            100;


        if (
            Math.random() <
            accuracy
        ) {

            if (
                Math.random() <
                .55
            ) {

                attack(
                    ai,
                    "punch"
                );

            } else {

                attack(
                    ai,
                    "kick"
                );

            }

        } else if (
            Math.random() <
            .25
        ) {

            block(
                ai,
                true
            );

            setTimeout(
                () => {
                    block(
                        ai,
                        false
                    );
                },
                250
            );

        }

    } else {

        /*
            Move toward player
        */

        const direction =
            player.group.position.x >
            ai.group.position.x
                ? 1
                : -1;


        move(
            ai,
            direction
        );


        /*
            Jump sometimes
        */

        if (
            distance > 4 &&
            Math.random() <
            state.difficulty /
            500
        ) {

            jump(
                ai
            );

        }

    }

}


/* =====================================================
   GAMEPAD
===================================================== */

function readGamepads() {

    const pads =
        navigator.getGamepads
            ? navigator.getGamepads()
            : [];


    if (
        state.p1Control ===
        "gamepad"
    ) {

        const pad =
            pads[0];

        if (
            pad
        ) {

            if (
                pad.axes[0] <
                -.25
            )
                move(
                    fighter1,
                    -1
                );

            if (
                pad.axes[0] >
                .25
            )
                move(
                    fighter1,
                    1
                );

            if (
                pad.buttons[0]?.pressed
            )
                jump(
                    fighter1
                );

        }

    }


    if (
        state.mode === 2 &&
        state.p2Control ===
        "gamepad"
    ) {

        const pad =
            pads[1];


        if (
            pad
        ) {

            if (
                pad.axes[0] <
                -.25
            )
                move(
                    fighter2,
                    -1
                );

            if (
                pad.axes[0] >
                .25
            )
                move(
                    fighter2,
                    1
                );

            if (
                pad.buttons[0]?.pressed
            )
                jump(
                    fighter2
                );

        }

    }

}


/* =====================================================
   TOUCH CONTROLS
===================================================== */

function setupTouchControls() {

    if (
        state.p1Control ===
        "touch"
    ) {

        touchHUD.classList.remove(
            "hidden"
        );

    } else {

        touchHUD.classList.add(
            "hidden"
        );

    }

}


document
    .querySelectorAll(
        ".touch-button"
    )
    .forEach(button => {

        const action =
            button.dataset.action;


        function start(event) {

            event.preventDefault();

            state.touch[
                action
            ] = true;


            if (
                action === "punch"
            )
                attack(
                    fighter1,
                    "punch"
                );


            if (
                action === "kick"
            )
                attack(
                    fighter1,
                    "kick"
                );

        }


        function stop(event) {

            event.preventDefault();

            state.touch[
                action
            ] = false;

        }


        button.addEventListener(
            "pointerdown",
            start
        );

        button.addEventListener(
            "pointerup",
            stop
        );

        button.addEventListener(
            "pointercancel",
            stop
        );

    });


/* =====================================================
   CAMERA
===================================================== */

function updateCamera(
    dt
) {

    const x1 =
        fighter1.group.position.x;

    const x2 =
        fighter2.group.position.x;


    const center =
        (x1 + x2) / 2;


    const distance =
        Math.abs(
            x1 - x2
        );


    /*
        Camera follows fighters
    */

    const desiredX =
        center;


    const desiredZ =
        THREE.MathUtils.clamp(
            18 +
            distance * .65,
            18,
            25
        );


    camera.position.x =
        THREE.MathUtils.lerp(
            camera.position.x,
            desiredX,
            1 -
            Math.pow(
                .001,
                dt
            )
        );


    camera.position.z =
        THREE.MathUtils.lerp(
            camera.position.z,
            desiredZ,
            1 -
            Math.pow(
                .001,
                dt
            )
        );


    camera.lookAt(
        center,
        2.7,
        0
    );


    /*
        Hit camera shake
    */

    if (
        state.cameraShake > 0
    ) {

        state.cameraShake -=
            dt;

        camera.position.x +=
            (Math.random()-.5) *
            .15;

        camera.position.y +=
            (Math.random()-.5) *
            .1;

    }

}


/* =====================================================
   MESSAGE
===================================================== */

function showMessage(
    text
) {

    fightMessage.textContent =
        text;

    fightMessage.classList.remove(
        "show"
    );


    void fightMessage.offsetWidth;


    fightMessage.classList.add(
        "show"
    );

}


/* =====================================================
   END ROUND
===================================================== */

function finishRound() {

    if (
        !state.running
    )
        return;


    state.running =
        false;


    clearInterval(
        state.roundTimer
    );


    let result;


    if (
        state.health1 ===
        state.health2
    ) {

        result =
            "DRAW";

    } else if (
        state.health1 >
        state.health2
    ) {

        result =
            "PLAYER 1 WINS";

    } else {

        result =
            state.mode === 1
                ? "CPU WINS"
                : "PLAYER 2 WINS";

    }


    showMessage(
        result
    );


    setTimeout(
        () => {

            gameScreen.classList.add(
                "hidden"
            );

            menu.classList.remove(
                "hidden"
            );

        },
        2500
    );

}


/* =====================================================
   PAUSE
===================================================== */

pauseButton.addEventListener(
    "click",
    () => {

        if (
            !state.running
        )
            return;

        state.paused =
            !state.paused;


        pauseButton.textContent =
            state.paused
                ? "▶"
                : "II";

    }
);


/* =====================================================
   HUD SETTINGS
===================================================== */

hudButton.addEventListener(
    "click",
    () => {

        hudEditor.classList.remove(
            "hidden"
        );

    }
);


hudClose.addEventListener(
    "click",
    () => {

        hudEditor.classList.add(
            "hidden"
        );

    }
);


/* =====================================================
   HUD SIZE
===================================================== */

hudSize.addEventListener(
    "input",
    () => {

        const size =
            Number(
                hudSize.value
            );


        hudSizeValue.textContent =
            size;


        document
            .querySelectorAll(
                ".touch-button"
            )
            .forEach(button => {

                button.style.width =
                    size + "px";

                button.style.height =
                    size + "px";

            });


        saveHUD();

    }
);


/* =====================================================
   HUD LAYOUT
===================================================== */

document
    .querySelectorAll(
        "[data-layout]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const layout =
                    button.dataset.layout;


                const buttons =
                    document.querySelectorAll(
                        ".touch-button"
                    );


                buttons.forEach(
                    b =>
                        b.style.transform =
                            ""
                );


                if (
                    layout ===
                    "compact"
                ) {

                    buttons.forEach(
                        b =>
                            b.style.transform =
                                "scale(.8)"
                    );

                }


                if (
                    layout ===
                    "wide"
                ) {

                    buttons.forEach(
                        b =>
                            b.style.transform =
                                "scale(1.1)"
                    );

                }


                saveHUD();

            }
        );

    });


/* =====================================================
   HUD EDIT MODE
===================================================== */

let hudEditing =
    false;


hudEditMode.addEventListener(
    "click",
    () => {

        hudEditing =
            !hudEditing;


        touchHUD.classList.toggle(
            "edit-mode",
            hudEditing
        );


        hudEditMode.textContent =
            hudEditing
                ? "✓ پایان ویرایش"
                : "✋ جابه‌جایی دستی";

    }
);


/* =====================================================
   DRAG HUD
===================================================== */

document
    .querySelectorAll(
        ".touch-button"
    )
    .forEach(button => {

        let dragging =
            false;

        let startX = 0;
        let startY = 0;

        let originalX = 0;
        let originalY = 0;


        button.addEventListener(
            "pointerdown",
            event => {

                if (
                    !hudEditing
                )
                    return;


                event.preventDefault();


                dragging =
                    true;


                button.setPointerCapture(
                    event.pointerId
                );


                startX =
                    event.clientX;

                startY =
                    event.clientY;


                const rect =
                    button.getBoundingClientRect();


                originalX =
                    rect.left;

                originalY =
                    rect.top;


                button.style.left =
                    originalX + "px";

                button.style.top =
                    originalY + "px";


                button.style.right =
                    "auto";

                button.style.bottom =
                    "auto";

            }
        );


        button.addEventListener(
            "pointermove",
            event => {

                if (
                    !dragging
                )
                    return;


                const dx =
                    event.clientX -
                    startX;

                const dy =
                    event.clientY -
                    startY;


                button.style.left =
                    (
                        originalX +
                        dx
                    ) + "px";


                button.style.top =
                    (
                        originalY +
                        dy
                    ) + "px";

            }
        );


        button.addEventListener(
            "pointerup",
            event => {

                if (
                    !dragging
                )
                    return;


                dragging =
                    false;


                button.releasePointerCapture(
                    event.pointerId
                );


                saveHUD();

            }
        );

    });


/* =====================================================
   SAVE HUD
===================================================== */

function saveHUD() {

    const data =
        {};


    document
        .querySelectorAll(
            ".touch-button"
        )
        .forEach(
            (button, index) => {

                data[index] = {

                    left:
                        button.style.left,

                    top:
                        button.style.top,

                    width:
                        button.style.width,

                    height:
                        button.style.height

                };

            }
        );


    localStorage.setItem(
        "PixelFighters3D_HUD",
        JSON.stringify(
            data
        )
    );

}


/* =====================================================
   LOAD HUD
===================================================== */

function loadHUD() {

    const saved =
        localStorage.getItem(
            "PixelFighters3D_HUD"
        );


    if (
        !saved
    )
        return;


    try {

        const data =
            JSON.parse(
                saved
            );


        document
            .querySelectorAll(
                ".touch-button"
            )
            .forEach(
                (button, index) => {

                    const item =
                        data[index];


                    if (
                        !item
                    )
                        return;


                    if (
                        item.left
                    ) {

                        button.style.left =
                            item.left;

                        button.style.right =
                            "auto";

                    }


                    if (
                        item.top
                    ) {

                        button.style.top =
                            item.top;

                        button.style.bottom =
                            "auto";

                    }


                    if (
                        item.width
                    )
                        button.style.width =
                            item.width;


                    if (
                        item.height
                    )
                        button.style.height =
                            item.height;

                }
            );

    } catch (
        error
    ) {

        console.log(
            "HUD load error",
            error
        );

    }

}


/* =====================================================
   RESET HUD
===================================================== */

hudReset.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "PixelFighters3D_HUD"
        );

        location.reload();

    }
);


/* =====================================================
   RESIZE
===================================================== */

function resize() {

    camera.aspect =
        innerWidth /
        innerHeight;

    camera.updateProjectionMatrix();


    renderer.setSize(
        innerWidth,
        innerHeight
    );

}


/* =====================================================
   START
===================================================== */

initThree();

loadHUD();
