// Asteroid.js
// Luke Reichold - CSCI 3820

// Subclassing Object3D to represent an Asteroid object.
var Asteroid = function() {
    THREE.Object3D.call(this);
    
    var self = this;
    var WIDTH = window.innerWidth / 2;
    var HEIGHT = window.innerHeight / 2;
    
    // Asteroids vary in size randomly
    self.radius = getRandomInt(2, 50);
    
    // Default starting position
    self.x = getRandomInt(-WIDTH + self.radius, WIDTH - self.radius);
    self.y = getRandomInt(-HEIGHT + self.radius, HEIGHT - self.radius);
        
    // Default component speeds are random between -5 to 5
    self.vx = getRandom(-3, 3);
    self.vy = getRandom(-3, 3);
    
    // Possible colors for asteroid
    
    var color; // coming soon
    var material = new THREE.MeshLambertMaterial({ color: getRandomColor() }); 
    var geometry = new THREE.SphereGeometry(self.radius, 18, 18);
    this.add(new THREE.Mesh(geometry, material));
    
    self.position.x = self.x;
    self.position.y = 0;
    self.position.z = self.y;
}

Asteroid.prototype = Object.create(THREE.Object3D.prototype);
Asteroid.constructor = Asteroid;

Asteroid.prototype.move = function() {

    this.y += this.vy;
    this.x += this.vx;
    
    this.position.x = this.x;
    this.position.z = this.y;
}

function getRandomColor() {
    var colors = [0x800000, 0x8B0000, 0xA52A2A, 0xB22222, 0xFFD700, 0xFF7F50, 0x00FF7F, 0x00FFFF, 0xF5DEB3];
    return colors[getRandomInt(0, colors.length - 1)]
}

// Returns random Real number between min (inclusive) and max (exclusive)
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

// Returns random int between min (incl) and max (incl)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
