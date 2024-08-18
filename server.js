require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const nocache = require('nocache');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

// Define the max age for HSTS
const ninetyDaysInSeconds = 90 * 24 * 60 * 60;

app.use(nocache()); 
app.use(helmet({
  frameguard: { action: 'deny' },
  hsts: { maxAge: ninetyDaysInSeconds, force: true },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'"],
      connectSrc: ["'self'"]
    }
  },
  hidePoweredBy: { setTo: 'PHP 7.4.3' },  
  xssFilter: true,
  noSniff: true,
  ieNoOpen: true,
  dnsPrefetchControl: true,
  nocache: true 
}));



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({ origin: '*' }));

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

// For FCC testing purposes
fccTestingRoutes(app);

// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

// Set up Socket.io for real-time communication
const io = socket(server);

// Game state
const canvasWidth = 640;
const canvasHeight = 480;
const playerSize = 20;
const collectibleSize = 10;

const players = {};
const collectibles = [
  { id: 'item1', x: Math.random() * (canvasWidth - collectibleSize), y: Math.random() * (canvasHeight - collectibleSize), value: 1 },
  { id: 'item2', x: Math.random() * (canvasWidth - collectibleSize), y: Math.random() * (canvasHeight - collectibleSize), value: 1 }
];

// Check collision between player and collectible
function checkCollision(player, collectible) {
  const playerLeft = player.x;
  const playerRight = player.x + playerSize;
  const playerTop = player.y;
  const playerBottom = player.y + playerSize;

  const collectibleLeft = collectible.x;
  const collectibleRight = collectible.x + collectibleSize;
  const collectibleTop = collectible.y;
  const collectibleBottom = collectible.y + collectibleSize;

  return (
    playerRight > collectibleLeft &&
    playerLeft < collectibleRight &&
    playerBottom > collectibleTop &&
    playerTop < collectibleBottom
  );
}


// Randomly reposition a collectible
function repositionCollectible(collectible) {
  collectible.x = Math.floor(Math.random() * (canvasWidth - collectibleSize));
  collectible.y = Math.floor(Math.random() * (canvasHeight - collectibleSize));
  collectible.value = 1;
}

io.on('connection', (socket) => {
  console.log('A user connected: '+ socket.id);
  
  // Initialize player
  players[socket.id] = { x: 50, y: 50, score: 0, id:socket.id};

  // Send initial state to the newly connected player
  socket.emit('initialState', { players, collectibles });
  //console.log('initialState');
  
  
  
  // Handle player movement
  socket.on('move', (data) => {
    const player = players[socket.id];
    player.id = socket.id;
    if (player) {
      player.x = data.x;
      player.y = data.y;
      //console.log('Move: '+socket.id);
      // Check for collisions with any collectible
      collectibles.forEach(collectible => {
        if (checkCollision(player, collectible)) {
          player.score += collectible.value;
          repositionCollectible(collectible);
          //console.log("collision:" + player.score)
          // Emit collision event to the specific player
          socket.emit('collision', { collectible });
          io.emit('updateState', { players, collectibles }); // Broadcast updated state to all players
        }
      });

    // Broadcast player movement to other clients
    io.emit('updateState', { players, collectibles }); // Broadcast updated state to all players
    }
  });
  /*
  // Handle player score updates
  socket.on('scoreUpdate', (data) => {
    // Broadcast score updates to other clients
    socket.broadcast.emit('scoreUpdate', data);
  });
*/


  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
    delete players[socket.id];
    io.emit('updateState', { players, collectibles });
  });
});

module.exports = app; // For testing
