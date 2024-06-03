var WIDTH = 20;
var HEIGHT = 13;
var TILE_SIZE = 50;
var fieldElement = document.querySelector('.field');
var messageElement = document.createElement('div');
messageElement.className = 'message';
document.body.appendChild(messageElement);

var TILE_TYPES = {
    WALL: 'tileW',
    FLOOR: 'tile',
    HERO: 'tileP',
    ENEMY: 'tileE',
    HEALTH_POTION: 'tileHP',
    SWORD: 'tileSW'
};

var map = [];
var hero = { x: 0, y: 0, health: 100, attack: 10 };
var enemies = [];
var items = [];

function createMap() {
    for (var y = 0; y < HEIGHT; y++) {
        map[y] = [];
        for (var x = 0; x < WIDTH; x++) {
            map[y][x] = TILE_TYPES.WALL;
        }
    }
}

function drawMap() {
    fieldElement.innerHTML = '';
    for (var y = 0; y < HEIGHT; y++) {
        for (var x = 0; x < WIDTH; x++) {
            var tileElement = document.createElement('div');
            tileElement.className = 'tile ' + map[y][x];
            tileElement.style.left = (x * TILE_SIZE) + 'px';
            tileElement.style.top = (y * TILE_SIZE) + 'px';

            if (map[y][x] === TILE_TYPES.HERO) {
                var healthBar = document.createElement('div');
                healthBar.className = 'health';
                healthBar.style.width = hero.health + '%';
                tileElement.appendChild(healthBar);
            }

            if (map[y][x] === TILE_TYPES.ENEMY) {
                var enemy = enemies.find(function(e) {
                    return e.x === x && e.y === y;
                });
                if (enemy) {
                    var healthBar = document.createElement('div');
                    healthBar.className = 'health';
                    healthBar.style.width = (enemy.health / 50) * 100 + '%';
                    tileElement.appendChild(healthBar);
                }
            }

            fieldElement.appendChild(tileElement);
        }
    }
}

function placeRooms() {
    var roomCount = getRandomInt(8, 15);
    var rooms = [];

    for (var i = 0; i < roomCount; i++) {
        var roomWidth = getRandomInt(3, 6);
        var roomHeight = getRandomInt(3, 6);
        var startX = getRandomInt(1, WIDTH - roomWidth - 2);
        var startY = getRandomInt(1, HEIGHT - roomHeight - 2);

        var room = {
            x: startX,
            y: startY,
            width: roomWidth,
            height: roomHeight
        };

        if (!isOverlapping(room, rooms)) {
            rooms.push(room);

            for (var y = startY; y < startY + roomHeight; y++) {
                for (var x = startX; x < startX + roomWidth; x++) {
                    map[y][x] = TILE_TYPES.FLOOR;
                }
            }
        }
    }
    connectRooms(rooms);
}

function isOverlapping(room, rooms) {
    for (var i = 0; i < rooms.length; i++) {
        var other = rooms[i];
        if (room.x < other.x + other.width && room.x + room.width > other.x && room.y < other.y + other.height && room.y + room.height > other.y) {
            return true;
        }
    }
    return false
}

function connectRooms(rooms) {
    for (var i = 1; i < rooms.length; i++) {
        var roomA = rooms[i - 1];
        var roomB = rooms[i];

        var pointA = {
            x: getRandomInt(roomA.x, roomA.x + roomA.width - 1),
            y: getRandomInt(roomA.y, roomA.y + roomA.height - 1),
        };
        var pointB = {
            x: getRandomInt(roomB.x, roomB.x + roomB.width - 1),
            y: getRandomInt(roomB.y, roomB.y + roomB.height - 1),
        };

        if (Math.random() > 0.5) {
            createHorizontalPassage(pointA.x, pointB.x, pointA.y);
            createVerticalPassage(pointA.y, pointB.y, pointB.x);
        } else {
            createVerticalPassage(pointA.y, pointB.y, pointA.x);
            createHorizontalPassage(pointA.x, pointB.x, pointB.y);
        }
    }
}

function createHorizontalPassage(x1, x2, y) {
    for (var x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        map[y][x] = TILE_TYPES.FLOOR;
    }
}

function createVerticalPassage(y1, y2, x) {
    for (var y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        map[y][x] = TILE_TYPES.FLOOR;
    }
}

function placeItems() {
    placeItem(TILE_TYPES.SWORD, 2);
    placeItem(TILE_TYPES.HEALTH_POTION, 10);
}

function placeItem(type, count) {
    for (var i = 0; i < count; i++) {
        var placed = false;
        while (!placed) {
            var x = getRandomInt(1, WIDTH - 2);
            var y = getRandomInt(1, HEIGHT - 2);
            if (map[y][x] === TILE_TYPES.FLOOR) {
                map[y][x] = type;
                items.push({ x: x, y: y, type: type });
                placed = true;
            }
        }
    }
}

function placeHero() {
    var placed = false;
    while (!placed) {
        var x = getRandomInt(1, WIDTH - 2);
        var y = getRandomInt(1, HEIGHT - 2);
        if (map[y][x] === TILE_TYPES.FLOOR) {
            map[y][x] = TILE_TYPES.HERO;
            hero.x = x;
            hero.y = y;
            placed = true;
        }
    }
}

function placeEnemies() {
    for (var i = 0; i < 10; i++) {
        var placed = false;
        while (!placed) {
            var x = getRandomInt(1, WIDTH - 2);
            var y = getRandomInt(1, HEIGHT - 2);
            if (map[y][x] === TILE_TYPES.FLOOR) {
                map[y][x] = TILE_TYPES.ENEMY;
                enemies.push({ x: x, y: y, health: 50 });
                placed = true;
            }
        }
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function moveHero(dx, dy) {
    var newX = hero.x + dx;
    var newY = hero.y + dy;
    if (map[newY][newX] === TILE_TYPES.FLOOR || map[newY][newX] === TILE_TYPES.HEALTH_POTION || map[newY][newX] === TILE_TYPES.SWORD) {
        if (map[newY][newX] === TILE_TYPES.HEALTH_POTION) {
            if (hero.health < 100) {
                hero.health = Math.min(hero.health + 20, 100);
                map[newY][newX] = TILE_TYPES.FLOOR; 
            } else {
                displayMessage("Здоровье полное");
            }
        }
        if (map[newY][newX] === TILE_TYPES.SWORD) {
            hero.attack += 10; 
        }
        map[hero.y][hero.x] = TILE_TYPES.FLOOR;
        hero.x = newX;
        hero.y = newY;
        map[hero.y][hero.x] = TILE_TYPES.HERO;
        drawMap();
        moveEnemies();
        enemyAttack();
    }
}

function attack() {
    var directions = [
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 }
    ];
    directions.forEach(function(dir) {
        var x = hero.x + dir.dx;
        var y = hero.y + dir.dy;
        if (map[y][x] === TILE_TYPES.ENEMY) {
            var enemy = null;
            for (var i = 0; i < enemies.length; i++) {
                if (enemies[i].x === x && enemies[i].y === y) {
                    enemy = enemies[i];
                    break;
                }
            }
            if (enemy) {
                enemy.health -= hero.attack;
                if (enemy.health <= 0) {
                    map[y][x] = TILE_TYPES.FLOOR;
                    enemies = enemies.filter(function(e) {
                        return e !== enemy;
                    });
                    checkWin();
                }
                drawMap();
            }
        }
    });
}

function moveEnemies() {
    enemies.forEach(function(enemy) {
        var direction = getRandomInt(0, 3);
        var dx = 0, dy = 0;
        switch (direction) {
            case 0: dx = -1; break;
            case 1: dx = 1; break;
            case 2: dy = -1; break;
            case 3: dy = 1; break;
        }
        var newX = enemy.x + dx;
        var newY = enemy.y + dy;
        if (map[newY][newX] === TILE_TYPES.FLOOR) {
            map[enemy.y][enemy.x] = TILE_TYPES.FLOOR;
            enemy.x = newX;
            enemy.y = newY;
            map[enemy.y][enemy.x] = TILE_TYPES.ENEMY;
        }
    });
    drawMap();
}

function enemyAttack() {
    var directions = [
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 }
    ];
    enemies.forEach(function(enemy) {
        directions.forEach(function(dir) {
            var x = enemy.x + dir.dx;
            var y = enemy.y + dir.dy;
            if (x === hero.x && y === hero.y) {
                hero.health -= 10;
                if (hero.health <= 0) {
                    alert('Game Over');
                    location.reload();
                }
            }
        });
    });
}

function checkWin() {
    if (enemies.length === 0) {
        alert('You Win!');
        location.reload();
    }
}

function displayMessage(message) {
    messageElement.innerText = message;
    setTimeout(function(){
        messageElement.innerText = '';
    }, 2000);
}

document.addEventListener('keydown', function(event) {
    switch (event.key) {
        case 'w':
            moveHero(0, -1);
            break;
        case 'a':
            moveHero(-1, 0);
            break;
        case 's':
            moveHero(0, 1);
            break;
        case 'd':
            moveHero(1, 0);
            break;
        case ' ':
            attack();
            break;
    }
});

function initGame() {
    createMap();
    placeRooms();
    placeItems();
    placeHero();
    placeEnemies();
    drawMap();
}

initGame();

