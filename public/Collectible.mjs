class Collectible {
  constructor({ x, y, value, id }) {
    this.x = x;       // x-coordinate of the collectible item
    this.y = y;       // y-coordinate of the collectible item
    this.value = value; // Value or significance of the collectible item
    this.id = id;     // Unique identifier for the collectible item
  }
}

// Export the Collectible class for use in other modules
try {
  module.exports = Collectible;
} catch (e) {}

// Also support ES6 module syntax if needed
export default Collectible;
