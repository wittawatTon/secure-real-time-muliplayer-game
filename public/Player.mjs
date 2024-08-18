class Player {
  constructor({ x, y, score, id , width = 20, height = 20}) {
    this.x = x;       // Player's x-coordinate
    this.y = y;       // Player's y-coordinate
    this.width = width; // Player's width
    this.height = height; // Player's height
    this.score = score; // Player's score
    this.id = id;     // Unique identifier for the player
  }

  // Method to move the player in the specified direction by a given speed
  movePlayer(dir, speed) {
    switch (dir) {
      case 'right':
        this.x += speed;
        break;
      case 'left':
        this.x -= speed;
        break;
      case 'up':
        this.y -= speed;
        break;
      case 'down':
        this.y += speed;
        break;
      default:
        throw new Error('Invalid direction'); // Ensure only valid directions are used
    }
  }

  // Method to detect collision with another object considering width and height
  collision(item) {
    const isCollidingX = this.x < item.x + item.width && this.x + this.width > item.x;
    const isCollidingY = this.y < item.y + item.height && this.y + this.height > item.y;
    return isCollidingX && isCollidingY;
  }

  // Method to calculate the player's rank based on the score relative to other players
  calculateRank(arr) {
    // Sort players by score in descending order
    const sortedPlayers = arr.slice().sort((a, b) => b.score - a.score);
    //console.log("sortedPlayers:"+JSON.stringify(sortedPlayers))
    //console.log("Current Id:" + this.id)
    // Find the rank of the current player
    const rank = sortedPlayers.findIndex(player => player.id === this.id) + 1;
    // Return rank as a formatted string
    return `Rank: ${rank} / ${arr.length}`;
  }
}

export default Player;
