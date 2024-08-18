import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

// Game settings
let players={};
let player={};
let collectibles={};
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const playerSize = 20; // Size of the player
const collectibleSize = 10; // Size of the collectible

/*
// Function to update player position based on server updates
function updatePlayerPosition(newPosition) {
  player.x = newPosition.x;
  player.y = newPosition.y;
}*/

// Function to handle player movement with boundary checks
function handleMovement(direction) {
  const speed = 15; // Movement speed
  
  switch (direction) {
    case 'up':
      player.y = Math.max(0, player.y - speed);
      break;
    case 'down':
      player.y = Math.min(canvasHeight - playerSize, player.y + speed);
      break;
    case 'left':
      player.x = Math.max(0, player.x - speed);
      break;
    case 'right':
      player.x = Math.min(canvasWidth - playerSize, player.x + speed);
      break;
    default:
      break;
  }
  //console.log("client move handle x:"+ player.x + "y:" + player.y )
  socket.emit('move', { x: player.x, y: player.y });
}



// Listen for initialState events from the server
socket.on('initialState', (state) => {
    players = state.players;
    collectibles = state.collectibles;
      // Initialize the local player
    player = new Player(players[socket.id]) || new Player({ x: 50, y: 50, score: 0, id: socket.id });
    //console.log("init: " + JSON.stringify(player));
    render();
  });

// Listen for updateState events from the server
socket.on('updateState', (state) => {
players = state.players;
collectibles = state.collectibles;
render();
});

/*
// Listen for movement events from the server
socket.on('move', (newPosition) => {
  console.log("move:" + newPosition)
  updatePlayerPosition(newPosition);
});

// Listen for collision events from the server (if needed)
socket.on('collision', (data) => {
  if (player.collision(data.collectible)) {
    player.score += data.value; // Update score
    console.log('Collision detected!');
    console.log("All Player Data: "+ JSON.stringify(players));
    // Reposition the collectible
    const collectible = collectibles.find(item => item.id === data.collectible.id);
    if (collectible) {
      repositionCollectible(collectible);
    }
    
    // Emit a message to the server indicating that the collectible has been collected
    socket.emit('collect', { collectibleId: data.collectible.id });
  }
});
*/
// Function to draw a player
function drawPlayer(p, color) {
    context.fillStyle = color;
    context.fillRect(p.x, p.y, playerSize, playerSize);
  }

// Render function to draw players and collectibles on the canvas
function render() {
  context.clearRect(0, 0, canvasWidth, canvasHeight);

  // Draw all players
  for (const id in players) {
    if (id === socket.id) {
      drawPlayer(player, 'blue'); // Current player in blue
    } else {
      drawPlayer(players[id], 'red'); // Other players in red
    }
  }
  // Draw collectibles
  collectibles.forEach((item) => {
    context.fillStyle = 'green';
    context.fillRect(item.x, item.y, collectibleSize, collectibleSize); // Drawing collectibles as small squares
  });

   // Display player's rank at the top right
   context.fillStyle = 'black';
   context.font = '20px Arial';
   context.textAlign = 'right';
   context.fillText(player.calculateRank(Object.values(players))+" score: "+ players[socket.id].score, canvasWidth - 10, 30);
   //console.log('rendered')
   
  //requestAnimationFrame(render);
}


// Handle key events for movement
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'w':
    case 'W':
    case 'ArrowUp':
      handleMovement('up');
      break;
    case 's':
    case 'S':
    case 'ArrowDown':
      handleMovement('down');
      break;
    case 'a':
    case 'A':
    case 'ArrowLeft':
      handleMovement('left');
      break;
    case 'd':
    case 'D':
    case 'ArrowRight':
      handleMovement('right');
      break;
    default:
      break;
  }
});
