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
    
    // For Beta, I decided to hold off on the model because currently:
	// 1.) We cannot tell exactly which direction it is pointing
	// 2.) It's off-center, and therefore making rotation look weird.
    // loadModel(self);
    
    draw(self);
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
    console.log("W WIDTH: " + WIDTH);
    console.log("W HEIGHT: " + HEIGHT);
    console.log("(x, y): " + this.x + ", " + this.y);


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
    this.rotateY(+this.rotationSpeed);
    this.angularPosition -= this.rotationSpeed;
}

Spaceship.prototype.rotateRight = function() {
    this.rotateY(-this.rotationSpeed);
    this.angularPosition += this.rotationSpeed;
}

function draw(self) {
	
	var side = 10;
	var geo = new THREE.Geometry(); 
	geo.vertices.push(new THREE.Vector3(side,  1.0, 0.0));
	geo.vertices.push(new THREE.Vector3(-0.5 * side, 1.0, -0.5 * side));
	geo.vertices.push(new THREE.Vector3(-0.5 * side, 1.0, 0.5 * side));
	geo.faces.push(new THREE.Face3(0, 1, 2)); 
	
	var material = new THREE.MeshBasicMaterial({ 
		color:0xFFFFFF, 
		side:THREE.DoubleSide 
	}); 
	
	var mesh = new THREE.Mesh(geo, material); 
	self.add(mesh);
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

	// Give it a "nose" to see which direction it's pointing.
	/*
	var LEN = 100;
	var geometry = new THREE.Geometry();
	geometry.vertices.push(
	    new THREE.Vector3( 0, 5, -30),
	    new THREE.Vector3( 0, 5, 0 )
	);
	var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({color: 0xff000	0, linewidth:50}));
	self.add(line);
	*/
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

