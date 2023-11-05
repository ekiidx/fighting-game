const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

// Background
const background = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: './assets/img/bg.png'
})

// Fox Sprite
const fox = new Sprite({
    position: {
        x: 700,
        y: 422
    },
    imageSrc: './assets/img/fox.png',
    scale: 2.75,
    framesMax: 5
})

// Player Sprite
const player = new Fighter({
    position: {
        x: 0,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0
    },
    color: 'red',
    offset: {
        x: 0,
        y: 0
    },
    imageSrc: './assets/img/bunnygirl/idle.png',
    framesMax: 12,
    scale: 1.33,
    offset: {
        x: 215,
        y: -54
    },
    sprites: {
        idle: {
            imageSrc: './assets/img/bunnygirl/idle.png',
            framesMax: 6
        },
        run: {
            imageSrc: './assets/img/bunnygirl/run.png',
            framesMax: 12
        },
        jump: {
            imageSrc: './assets/img/bunnygirl/jump.png',
            framesMax: 4
        },
        fall: {
            imageSrc: './assets/img/bunnygirl/fall.png',
            framesMax: 4
        },
        attack: {
            imageSrc: './assets/img/bunnygirl/attack.png',
            framesMax: 5
        },
        hit: {
            imageSrc: './assets/img/bunnygirl/hit.png',
            framesMax: 4
        },
        death: {
            imageSrc: './assets/img/bunnygirl/death.png',
            framesMax: 8
        }
    },
    attackBox: {
        offset: {
            x: -80,
            y: 60
        },
        width: 100,
        height: 100
    }
})

// Enemy Sprite
const enemy = new Fighter({
    position: {
        x: 400,
        y: 100
    },
    velocity: {
        x: 0,
        y: 0
    },
    color: 'blue',
    offset: {
        x: -50,
        y: 0
    },
    imageSrc: './assets/img/enemy/idle.png',
    framesMax: 10,
    scale: 1.1,
    offset: {
        x: 215,
        y: 88
    },
    sprites: {
        idle: {
            imageSrc: './assets/img/enemy/idle.png',
            framesMax: 10
        },
        run: {
            imageSrc: './assets/img/enemy/run.png',
            framesMax: 10
        },
        jump: {
            imageSrc: './assets/img/enemy/jump.png',
            framesMax: 3
        },
        fall: {
            imageSrc: './assets/img/enemy/fall.png',
            framesMax: 3
        },
        attack: {
            imageSrc: './assets/img/enemy/attack.png',
            framesMax: 6
        },
        hit: {
            imageSrc: './assets/img/enemy/hit.png',
            framesMax: 3
        },
        death: {
            imageSrc: './assets/img/enemy/death.png',
            framesMax: 10
        }
    },
    attackBox: {
        offset: {
            x: -170,
            y: 60
        },
        width: 130,
        height: 100
    }
})

console.log(player)

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    }
}

decreaseTimer();

function animate() {
    window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    background.update()
    fox.update()
    player.update()
    enemy.update()

    player.velocity.x = 0
    enemy.velocity.x = 0

    // Player Movement
    if (keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -5
        player.switchSprite('run')
    } else if (keys.d.pressed && player.lastKey ==='d') {
        player.velocity.x = 5
        player.switchSprite('run')
    } else {
        player.switchSprite('idle')
    }

    // Player Jumping
    if (player.velocity.y < 0) {
       player.switchSprite('jump')
    } else if (player.velocity.y > 0) {
        player.switchSprite('fall')
    }

    // Enemy Movement
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -5
        enemy.switchSprite('run')
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 5
        enemy.switchSprite('run')
    } else {
        enemy.switchSprite('idle')
    }

    // Enemy Jumping
    if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump')
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall')
    }

    // Player Collision & hit
    if ( 
        rectangularCollision({
            rectangle1: player,
            rectangle2: enemy
        }) &&
        player.isAttacking && 
        player.framesCurrent === 3
    ) {    
        enemy.hit()
        player.isAttacking = false
        document.querySelector('#enemyHealth').style.width = enemy.health + '%'
        //console.log('player hit!')
    }

    // If player misses
    if (player.isAttacking && player.framesCurrent === 3) {
        player.isAttacking = false
    }

    // Enemy Collision & hit
    if ( 
        rectangularCollision({
            rectangle1: enemy,
            rectangle2: player
        }) &&
        enemy.isAttacking && 
        enemy.framesCurrent === 3
    ) { 
        player.hit()
        enemy.isAttacking = false
        document.querySelector('#playerHealth').style.width = player.health + '%'
        //console.log('enemy hit!')
    }

        // If enemy misses
        if (enemy.isAttacking && enemy.framesCurrent === 3) {
            enemy.isAttacking = false
        }

    // switch attack position 
    // if ( enemy.position.x <= player.position.x
    // ) {
    //     enemy.attackBox.offset.x = 0
    // } else {
    //     enemy.attackBox.offset.x = -50
    // }

    // if ( player.position.x >= enemy.position.x
    // ) {
    //     player.attackBox.offset.x = -50
    // } else {
    //     player.attackBox.offset.x = 0
    // }

    // End Game based on Health
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({ player, enemy, timerId })
    }
}

animate()

window.addEventListener('keydown', (event) => {
    // console.log(event.key)
    switch (event.key) {

        // Player Keys
        case 'd':
            keys.d.pressed = true
            player.lastKey = 'd'
            break
        case 'a':
            keys.a.pressed = true
            player.lastKey = 'a'
            break
        case 'w':
            player.velocity.y = -20
            break
        case ' ':
            player.attack()
            break

        // Enemy Keys
        case 'ArrowRight':
            keys.ArrowRight.pressed = true
            enemy.lastKey = 'ArrowRight'
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true
            enemy.lastKey = 'ArrowLeft'
            break
        case 'ArrowUp':
            enemy.velocity.y = -20
            break
        case 'ArrowDown':
            enemy.attack()
            break
    }
    // console.log(event.key)
})

window.addEventListener('keyup', (event) => {
    switch (event.key) {

        // Player Keys
        case 'd':
            keys.d.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
    }

    // Enemy Keys
    switch (event.key) {
        case 'ArrowRight':
            keys.ArrowRight.pressed = false
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break
    }
    // console.log(event.key)
})