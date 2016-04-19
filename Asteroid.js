// Asteroid.js
// Luke Reichold - CSCI 3820

// Subclassing Object3D to represent main Asteroid player object.
var Asteroid = function(material, radius, distance, rotationSpeed) {
    THREE.Object3D.call(this);
    this.orbiters = []
    this.pivots = []
    this.distance = distance;
    this.rotationSpeed = rotationSpeed;
    var geometry = new THREE.SphereGeometry(radius, 18, 18);
    this.add(new THREE.Mesh(geometry, material));
}
Asteroid.prototype = Object.create(THREE.Object3D.prototype);
Asteroid.constructor = Asteroid;

// Move this Asteroid
Asteroid.prototype.move = function() {
    // Coming Soon
}

