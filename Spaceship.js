// Spaceship.js
// Luke Reichold - CSCI 3820

// Subclassing Object3D to represent main spaceship player object.
var Spaceship = function() {
    THREE.Object3D.call(this);
    
    // for accessing from inner closures below
    var self = this;
    
    // Default starting position
    self.x = 0;
    self.y = 0;
    
    self.vx = 0.0;
    self.vy = 0.0;
    
    self.isAccelerating = false;
    self.friction = 0.95;
    self.rotationSpeed = 0.04;
    self.angularPosition = 0.0;
    self.speed = 0.25;
    
    // TODO: add graphic to indicate which direction ship is facing!
    loadModel(self);
}

Spaceship.prototype = Object.create(THREE.Object3D.prototype);
Spaceship.constructor = Spaceship;

// Move this spaceship
Spaceship.prototype.move = function() {

    if (this.isAccelerating) {
        console.log("vx / vy : " + this.vx + ", " + this.vy);
        this.vy += Math.sin(this.angularPosition) * this.speed;
        this.vx += Math.cos(this.angularPosition) * this.speed;
        // TODO: cap max speed
    } 
    else {
        // Should slow down from "friction"
        this.vy *= this.friction;
        this.vx *= this.friction;
    }
    
    this.y += this.vy;
    this.x += this.vx;
    
    var WIDTH = window.innerWidth / 2;
    var HEIGHT = window.innerHeight / 2;

	if (this.x > WIDTH) {
    	this.x = -WIDTH;
	} else if (this.x < -WIDTH) {
    	this.x = WIDTH;
	}

    if (this.y > HEIGHT) {
        this.y = -HEIGHT;
    } else if (this.y < -HEIGHT) {
        this.y = HEIGHT;
    }
    
    // allowed to draw itself in the scene from here?
    this.position.x = this.x;
    this.position.z = this.y;
}

Spaceship.prototype.rotateLeft = function() {
//     this.rotateY(this.rotationSpeed);
    this.angularPosition -= this.rotationSpeed;
}

Spaceship.prototype.rotateRight = function() {
//     this.rotateY(-this.rotationSpeed);
    this.angularPosition += this.rotationSpeed;
}

function loadModel(self) {
    
    var textureLoader = new THREE.TextureLoader();
    var texture = textureLoader.load('textures/steel.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 6, 6 );
    var material = new THREE.MeshBasicMaterial({ map: texture });
    
	var objLoader = new THREE.OBJLoader();
	objLoader.setPath( 'models/' );
	objLoader.load( 'ship.obj', function ( object ) {
        object.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                child.material = material;
            }
        });
        object.scale.divideScalar(10);
        self.add(object);
		object.position.y = 0;
	}, onProgress, onError );
}

// Output obj loading progress to console
var onProgress = function ( xhr ) {
    if ( xhr.lengthComputable ) {
        var percentComplete = xhr.loaded / xhr.total * 100;
        if (DEBUG) {
            console.log('ship model: ' + Math.round(percentComplete, 2) + '% downloaded' );
        }
    }
};
var onError = function ( xhr ) { };

