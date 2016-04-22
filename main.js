// main.js
// Luke Reichold - CSCI 3820 
// Final Project: Asteroids

var scene = new THREE.Scene();
var DEBUG = false;
var stats, camera, renderer, controls;

// Objects
var ship;
var asteroids = [];
var blasts = [];
var blastMeshes = [];

var speed = 0.2;
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

setup();

addBackground();
addLights();
addShip()
addAsteroids(8);

render();

function setup() {
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 400, 0); // camera from above
    camera.lookAt(new THREE.Vector3(0,0,0));
    
    if (DEBUG) {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        var axisHelper = new THREE.AxisHelper( 500 );
        scene.add( axisHelper );
    }
    
    addStats();
}

function addShip() {
    ship = new Spaceship();
    scene.add(ship);
}

// Add given number of asteroids to the scene
function addAsteroids(number) {
    for (var i=0; i < number; i++) { 
        var body = new Asteroid();
        asteroids.push(body);
        scene.add(body);
    }
}

function addStats() {
    // Create div and display performance stats
    stats = new Stats();
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );
}

function render() {
    requestAnimationFrame(render);
    
    // Update bullet ("blast") positions
    for (var i=0; i < blasts.length; i++){
        blastMeshes[i].position.copy(blasts[i].position);
        blastMeshes[i].quaternion.copy(blasts[i].quaternion);
    }
    
    // Keydown listener
    kd.tick();
    
    ship.move()
    
    // Move all asteroids
    for (var i=0; i < asteroids.length; i++) {
        asteroids[i].move();
    }
    
    if (DEBUG) {
        controls.update();        
    }
    renderer.render(scene, camera);
    stats.update();
};

function addBackground() {
    
    var textureLoader = new THREE.TextureLoader();
    var texture = textureLoader.load('textures/space-tile.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 6, 6 );
    var floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(1500, 1500), 
                               new THREE.MeshBasicMaterial({ map: texture }));

    floor.rotation.x = -Math.PI/2;
    scene.add(floor);
}

function addLights() {    
    scene.add(new THREE.AmbientLight(0x555555));
}

function fireBlaster() {
    console.log("Firing blaster!");
    var shootDirection = new THREE.Vector3();   
    // Coming soon!
}

// Keyboard controls for player motion. 
kd.SPACE.down(function () {
    fireBlaster();
});

kd.W.down(function () {
    ship.isAccelerating = true;
});

kd.W.up(function () {
    ship.isAccelerating = false;
});

kd.A.down(function () {
    ship.rotateLeft();
});

kd.D.down(function () {
    ship.rotateRight();
});

function smoothSurface(m) {
    if (m.geometry instanceof THREE.BufferGeometry) {
        var geometry = new THREE.Geometry().fromBufferGeometry(m.geometry);
        geometry.mergeVertices();
        geometry.computeVertexNormals();
        m.geometry = new THREE.BufferGeometry().fromGeometry(geometry);
    } else {
        m.geometry.computeVertexNormals();
    }
}
