// Asteroid.js
// Luke Reichold - CSCI 3820

// Subclassing Object3D to represent an Asteroid object.
var Asteroid = function() {
    THREE.Object3D.call(this);
    
    var self = this;
    var PADDING = 30;
    var WIDTH = window.innerWidth / 2;
    var HEIGHT = window.innerHeight / 2;
    
    self.radius = getRandomInt(2, 25);
    
    // Default starting position
    self.x = getRandomInt(-WIDTH + PADDING, WIDTH - PADDING);
    self.y = getRandomInt(-HEIGHT + PADDING, HEIGHT - PADDING);
        
    // Default component speeds are random between -5 to 5
    self.vx = getRandom(-3, 3);
    self.vy = getRandom(-3, 3);
    
    var material = new THREE.MeshLambertMaterial({ color:0x964B00 }); 
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

// Returns random Real number between min (inclusive) and max (exclusive)
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

// Returns random int between min (incl) and max (incl)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
