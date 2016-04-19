// Spaceship.js
// Luke Reichold - CSCI 3820

// Subclassing Object3D to represent main spaceship player object.
var Spaceship = function() {
    THREE.Object3D.call(this);
    
    // for accessing from inner closures below
    var self = this;
    
    // Define starting position
    self.x = 10;
    self.y = 10;
    
    self.vx = 0;
    self.vy = 0;
    
    self.speed = 0.5;
    
    loadModel(self);
}

Spaceship.prototype = Object.create(THREE.Object3D.prototype);
Spaceship.constructor = Spaceship;

// Move this spaceship
Spaceship.prototype.move = function() {
    // Coming Soon
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
        object.scale.divideScalar(6);
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

