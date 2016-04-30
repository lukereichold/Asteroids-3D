// main.js
// Luke Reichold - CSCI 3820 
// Final Project: Asteroids

// Populate array of skybox background images for later use.
const SKYBOX_PATH = './cubemap/space/';
var background_urls = [
        SKYBOX_PATH + 'space-tile.png', SKYBOX_PATH + 'space-tile.png',
        SKYBOX_PATH + 'space-tile.png', SKYBOX_PATH + 'space-tile.png',
        SKYBOX_PATH + 'space-tile.png', SKYBOX_PATH + 'space-tile.png'
    ];

var WORLD_SIZE = 3000;
var scene = new THREE.Scene();
var DEBUG = true;
var stats, camera, renderer, controls, projector;

// Objects
var ship;
var asteroids = [];
var blasts = [];

var speed = 0.2;
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

setup();

addLights();
addShip()
addAsteroids(8);
addSun();

render();

function setup() {
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // Camera
    camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, WORLD_SIZE);
    // camera.position.set(0, 400, 0); // camera from above
    // camera.lookAt(new THREE.Vector3(0,0,0));
    
    if (DEBUG) {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        var axisHelper = new THREE.AxisHelper( WORLD_SIZE );
        scene.add( axisHelper );
    }
    
    projector = new THREE.Projector();

    addSkybox();
    addStats();
}

// Sun orb at origin will help ship know where center of map is.
function addSun() {
    var radius = 30;
	var material = new THREE.MeshLambertMaterial({ color:0xFFFF00 }); 
    var geometry = new THREE.SphereGeometry(radius, 18, 18);
    var sun = new THREE.Mesh(geometry, material);
    sun.add(new THREE.PointLight(0xffff0f));
    scene.add(sun);
}

function addShip() {
    ship = new Spaceship();
    camera.add(createCrosshairs());
    ship.add(camera);
    scene.add(ship);
}

function createCrosshairs() {
    
    var material = new THREE.LineBasicMaterial({ color: 0xFF0000 });
    var geometry = new THREE.Geometry();   
    var size = 0.01; 
    geometry.vertices.push(new THREE.Vector3(0, size, 0));
    geometry.vertices.push(new THREE.Vector3(0, -size, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(size, 0, 0));    
    geometry.vertices.push(new THREE.Vector3(-size, 0, 0));
    
    var crosshair = new THREE.Line( geometry, material );
    
    // place it in the center
    var middlePercent = 50;
    var crosshairPosX = (middlePercent / 100) * 2 - 1;
    var crosshairPosY = (middlePercent / 100) * 2 - 1;
    
    crosshair.position.x = crosshairPosX * camera.aspect;
    crosshair.position.y = crosshairPosY;
    crosshair.position.z = -0.3;
    
    return crosshair;
}

// Add given number of asteroids to the scene
function addAsteroids(number) {
    for (var i=0; i < number; i++) { 
        var body = new Asteroid();
        asteroids.push(body);
        scene.add(body);
    }
}

function addSkybox() {
	   
	var loader = new THREE.CubeTextureLoader();
    var texture = loader.load( background_urls );
    texture.format = THREE.RGBFormat;

    var shader = THREE.ShaderLib[ "cube" ];
    shader.uniforms[ "tCube" ].value = texture;
    
    var material = new THREE.ShaderMaterial( {
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    } );

    var geometry = new THREE.BoxGeometry( WORLD_SIZE, WORLD_SIZE, WORLD_SIZE );

    skybox = new THREE.Mesh( geometry, material );
    skybox.position.y = -30;
    scene.add( skybox );
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
        // TODO: coming soon
    }
    
    // Keydown listener
    kd.tick();
    
    ship.move()
    
    // Move all asteroids
    for (var i=0; i < asteroids.length; i++) {
        asteroids[i].move();
    }
    
    handleMapEdges();
    
    if (DEBUG) {
        controls.update();        
    }
    renderer.render(scene, camera);
    stats.update();
};

function addLights() {    
    scene.add(new THREE.AmbientLight(0x555555));
}

function handleMapEdges() {
    
    for (var i=0; i < asteroids.length; i++) {
        wrapAround(asteroids[i]);
    }
    
    wrapAround(ship);
    // TODO: eventually also move the blasts here as well.
}

function wrapAround(obj) {
    
    // If necessary, move obj to other side of map if we hit the map bounds.
    if (obj.x > WORLD_SIZE / 2) {
    	obj.x = -WORLD_SIZE / 2;
	} else if (obj.x < -WORLD_SIZE / 2) {
    	obj.x = WORLD_SIZE / 2;
	}

    if (obj.y > WORLD_SIZE / 2) {
        obj.y = -WORLD_SIZE / 2;
    } else if (obj.y < -WORLD_SIZE / 2) {
        obj.y = WORLD_SIZE / 2;
    }
} 


function fireBlaster() {
	
    console.log("Firing blaster!");
	obj = ship;
	
	var sphereMaterial = new THREE.MeshBasicMaterial({color: 0xEEEEEE});
	var sphereGeo = new THREE.SphereGeometry(5, 6, 6);
	var sphere = new THREE.Mesh(sphereGeo, sphereMaterial);
	
	// bullet starting position at ship
	sphere.position.set(obj.position.x, obj.position.y, obj.position.z);
	sphere.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);

    
    // center of screen
	var vector = new THREE.Vector3(WIDTH / 2, HEIGHT / 2, 1);
    projector.unprojectVector(vector, obj);
    sphere.ray = new THREE.Ray(
				obj.position,
				vector.subSelf(obj.position).normalize()
    );
		
	sphere.owner = obj;
	
	blasts.push(sphere);
	scene.add(sphere);
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
