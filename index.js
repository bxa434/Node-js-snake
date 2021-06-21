"use strict";





let WWidth  = process.argv[2] || 30;   
let WHeight = process.argv[3] || 10;  

let SHx = process.argv[4] || 4;   
let SHy = process.argv[5] || 6;  
let Sl  = process.argv[6] || 3;   
let Sd  = process.argv[7] || 'S'; 


const WC = '+'; 
const WV = '|'; 
const WH = '-'; 
const WS = ' '; 
const SH = 'O'; 
const SB = 'o'; 
const SF = '$'; 
const SC = '*'; 


let world = []; 
for (let row = 0; row < WHeight; row++) {
  world[row] = [];
  for (let col = 0; col < WWidth; col++) {
    world[row][col] = WS;
  }
}

world[0][0]                    = WC; 
world[WHeight - 1][0]          = WC; 
world[0][WWidth - 1]           = WC; 
world[WHeight - 1][WWidth - 1] = WC; 


for (let row = 1; row < WHeight - 1; row++) {
  world[row][0] = world[row][WWidth - 1] = WV;
}

for (let col = 1; col < WWidth - 1; col++) {
  world[0][col] = world[WHeight - 1][col] = WH;
}


let snake = [[SHx, SHy]];

let Br         = SHx;
let Bc         = SHy;
let hasExceded = false;
for (let body = 0; body < Sl; body++) {
  switch (Sd.toUpperCase()) {
    
    case 'W':
      Bc--;
      break;
    case 'E':
      Bc++;
      break;
    
    case 'N':
      Br++;
      break;
    case 'S':
      Br--;
      break;
  }
  if ((0 < Br) && (Br < WHeight - 1) && (0 < Bc) && (Bc < WWidth - 1)) {
    snake.push([Br, Bc]);
    
  } else {
    hasExceded = true;
    break;
  }
}

function _inSnake(r, c, snakeArray) {
  for (let snakeSegmentIndex = 0; snakeSegmentIndex < snakeArray.length; snakeSegmentIndex++) {
    let snakeSegmentCoordinates = snakeArray[snakeSegmentIndex];
    if (snakeSegmentCoordinates[0] === r && snakeSegmentCoordinates[1] === c) {
      return snakeSegmentIndex;
    }
  }
  return -1;
}


function world2string(worldMatrix, snakeArray) {
  let s = ""; 
  for (let row = 0; row < worldMatrix.length; row++) {
    for (let col = 0; col < worldMatrix[row].length; col++) {
      
      let snakeSegmentIndex = _inSnake(row, col, snakeArray);
      if (snakeSegmentIndex < 0 || worldMatrix[row][col] === SC) {
        s += worldMatrix[row][col];
      } else {
        if (snakeSegmentIndex === 0) {
          s += SH;
        } else {
          s += SB;
        }
      }
    }
    s += '\n';
  }
  return s;
}


function drawWorld(worldMatrix, snakeArray) {  
  if (hasExceded) {
    console.warn('Snake body exceeded world');
  }  
  process.stdout.write('\x1Bc'); 
  process.stdout.write(world2string(worldMatrix, snakeArray));
}

function snakeMovement(snake, direction) {
  direction = direction || Sd;
  let head  = snake[0];
  switch (direction.toUpperCase()) {
    
    case 'N':
      SHx = head[0] - 1;
      SHy = head[1];
      break;
    case 'S':
      SHx = head[0] + 1;
      SHy = head[1];
      break;
    
    case 'W':
      SHx = head[0];
      SHy = head[1] - 1;
      break;
    case 'E':
      SHx = head[0];
      SHy = head[1] + 1;
      break;
  }

  if (isTheFieldEmpty(SHx, SHy)) {
    if (_inSnake(SHx, SHy, snake) < 0) {
      snake.unshift([SHx, SHy]);
      snake.pop();
    } else {
      world[SHx][SHy] = SC;
      drawWorld(world, snake);
      console.log('Game Over! The snake had hit itself in the body!');
      process.exit(0);
    }
  } else if (isFood(SHx, SHy)) {
    world[SHx][SHy] = WS;
    snake.unshift([SHx, SHy]);
    spawnFood();
  } else {
    world[SHx][SHy] = SC;
    drawWorld(world, snake);
    console.log('Game Over! The snake had hit a wall!');
    process.exit(0);
  }
}

function isTheFieldEmpty(r, c) {
  return world[r][c] === WS;
}

function isFood(r, c) {
  return world[r][c] === SF;
}

function getRandomNumber(min, max) {
  
  return Math.floor(Math.random() * (max - min) + min);
}

function spawnFood(r, c) {
  if (!r || !c) {
    do {
      r = getRandomNumber(1, WHeight - 2);
      c = getRandomNumber(1, WWidth - 2);
    } while (isTheFieldEmpty(r, c) && !_inSnake(r, c, snake));
  } 
  world[r][c] = SF;
}



spawnFood(4, 5);
drawWorld(world, snake);



const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', function (s, key) {
  switch (key.name) {
    case "up":
      Sd = 'N';
      break;
    case "down":
      Sd = 'S';
      break;
    case "left":
      Sd = 'W';
      break;
    case "right":
      Sd = 'E';
      break;
    case "c": 
      if (key.ctrl) {
        process.exit();
      }
      break;
  }
});

setInterval(function () {
  snakeMovement(snake);
  drawWorld(world, snake);
}, 200);
