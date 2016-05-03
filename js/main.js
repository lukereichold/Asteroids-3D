// main.js
// Luke Reichold - CSCI 3820 
// Final Project: Asteroids

// Populate array of skybox background images for later use.
const SKYBOX_PATH = './cubemap/galaxy/';
const format = '.png';

var background_urls = [
        SKYBOX_PATH + 'px' + format, SKYBOX_PATH + 'nx' + format,
        SKYBOX_PATH + 'py' + format, SKYBOX_PATH + 'ny' + format,
        SKYBOX_PATH + 'pz' + format, SKYBOX_PATH + 'nz' + format
    ];

var WORLD_SIZE = 3000;
var DEBUG = true;
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var scene = new THREE.Scene();
var raycaster = new THREE.Raycaster();

var stats, camera, renderer, controls, listener, sun, effect;

var BULLET_SPEED = 15, BULLET_RADIUS = 15;

// Default starting number of asteroids
var NUM_ASTEROIDS = 8;

// Objects
var ship;
var asteroids = [];
var blasts = [];

setup();

addLights();
addShip()
addAsteroids(8);
addSun();

var clock = new THREE.Clock();


// temporary:
window.addEventListener('keydown', keydown);

render();

function setup() {
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // Camera
    var far = WORLD_SIZE * Math.sqrt(2); // diagonal of cube is max possible
    camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, far);

    // Sound support
    listener = new THREE.AudioListener();
    camera.add(listener);
    
    if (DEBUG) {
        var axisHelper = new THREE.AxisHelper( WORLD_SIZE );
        scene.add( axisHelper );
    }
    
    
    // Our preferred controls via DeviceOrientation
    function setOrientationControls(e) {
    
        if (!e.alpha) {
            console.log("This isn't a phone!");
            return;
        }
        
        controls = new THREE.DeviceOrientationControls(camera, true);
        controls.connect();
        controls.update();

        console.log("device orientation controls set!");
        
        fullscreen();

        window.removeEventListener('deviceorientation', setOrientationControls, true);
    }   
    
    addSkybox();

    
    if (!isMobileDevice()) {
        addStats();
    } else {
        // By default, do full-screen mode on mobile.
        fullscreen();
    }
    
    effect = new THREE.StereoEffect(renderer);
	effect.setSize(WIDTH, HEIGHT);
    
    window.addEventListener('deviceorientation', setOrientationControls, true);

	window.addEventListener('resize', onWindowResize, false);
}

function fullscreen() {
    console.log("Requesting fullscreen!");
    
    if (document.requestFullscreen) {
        document.requestFullscreen();
    } else if (document.msRequestFullscreen) {
        document.msRequestFullscreen();
    } else if (document.mozRequestFullScreen) {
        document.mozRequestFullScreen();
    } else if (document.webkitRequestFullscreen) {
        document.webkitRequestFullscreen();
    }
    
    window.scrollTo(0,1);
}

function isMobileDevice() {
    if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        return true;
    } else {
        return false;
    }
}

// Sun orb at origin will help ship know where center of map is.
function addSun() {
    var radius = 30;
	var material = new THREE.MeshLambertMaterial({ color:0xFFFF00 }); 
    var geometry = new THREE.SphereGeometry(radius, 18, 18);
    sun = new THREE.Mesh(geometry, material);
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
    
    var material = new THREE.LineBasicMaterial({ color: 0x00FF00, linewidth: 3 });
    var geometry = new THREE.Geometry();   
    var size = 0.01; 
    geometry.vertices.push(new THREE.Vector3(0, size, 0));
    geometry.vertices.push(new THREE.Vector3(0, -size, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(size, 0, 0));    
    geometry.vertices.push(new THREE.Vector3(-size, 0, 0));
    
    var crosshair = new THREE.Line(geometry, material);

    var middlePercent = 50;
    var crosshairPosX = (middlePercent / 100) * 2 - 1;
    var crosshairPosY = (middlePercent / 100) * 2 - 1;
    
    // place in center of screen
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

function addHelpText() {
    container = document.createElement( 'div' );
    help = document.createElement( 'span' );
    help.innerHTML = "A / D = Turn, W = Move, SPACE = Shoot";
    document.body.appendChild( container );
    container.appendChild( help );
}

function onWindowResize() {

    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

	windowHalfX = WIDTH / 2,
	windowHalfY = HEIGHT / 2,

	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();

	effect.setSize( WIDTH, HEIGHT );
}

function render() {
    
    var delta = clock.getDelta();
    
    requestAnimationFrame(render);
    
    // Update bullet ("blast") positions
    for (var i=0; i < blasts.length; i++){
        blasts[i].translateZ(-BULLET_SPEED);
        blasts[i]._life += 1;
        
        // Let each blast travel the map 1.5 times before disappearing.
        if (blasts[i]._life > (WORLD_SIZE / BULLET_SPEED) * 1.5) {
            scene.remove(blasts[i]);
            blasts.splice(i, 1);
        }
    }

    checkForBulletCollisions();

    checkForShipCollisions();
    
    // Keydown listener
    kd.tick();
    
    ship.move()
    
    // Move all asteroids, check collisions, then remove if necessary
    for (var i=0; i < asteroids.length; i++) {
        asteroids[i].move();
    }
        
    handleMapEdges();
    
    if (isMobileDevice()) {
        controls.update(delta);   
    }

    effect.render( scene, camera );    
    
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
    
    for (var i=0; i < blasts.length; i++) {
        wrapAround(blasts[i].position);
    }
}

function checkForBulletCollisions() {
    
    for (var i=0; i < blasts.length; i++) {
        
        var blast = blasts[i];
        
        for (var j=0; j < asteroids.length; j++) {
            
            var asteroid = asteroids[j];
            
            if (blastHitsAsteroid(blast, asteroid)) {
                
                console.log("Blast hit an asteroid!");
                
                // Remove this asteroid.
                scene.remove(asteroids[j]);
                asteroids.splice(j, 1);
                
                // Remove this bullet.
                scene.remove(blasts[i]);
                blasts.splice(i, 1);
                
                if (asteroids.length == 0 && ship.lives > 0) {
                    window.alert("You win! All asteroids destroyed.");
                    increaseDifficulty();
                    restartGame();
                }
            }
        }
    }
}

function checkForShipCollisions() {
    
    for (var i=0; i < asteroids.length; i++) {
        
        var asteroid = asteroids[i];
        
        if (asteroidHitsShip(asteroid, ship)) {
                
            console.log("Asteroid hit the ship!");
            
            // TODO: play sound when hit!
            
            // Remove this asteroid once it hits the ship.
            scene.remove(asteroid);
            asteroids.splice(i, 1);
            
            ship.lives -= 1;
            if (ship.lives == 0) {
                
                // Play sound when game over
                var done = new THREE.PositionalAudio( listener );
                done.load('./audio/game-over.mp3');
                ship.add(done);
                done.play();
                                
                window.alert("No lives remaining. Game over!");
                
                restartGame();
            }
        }
    }
}

function increaseDifficulty() {
    NUM_ASTEROIDS += 5;
}

function restartGame() {
    ship.lives = 3;
    blasts.splice(0, blasts.length);
    asteroids.splice(0, asteroids.length);
    addAsteroids(NUM_ASTEROIDS);
}

function asteroidHitsShip(asteroid, ship) {
    dist = distance2d(asteroid.position, ship.position);
    if (dist <= ship.radius + asteroid.radius) {
        return true;
    } else {
        return false;
    }
}

function blastHitsAsteroid(blast, asteroid) {
    dist = distance2d(blast.position, asteroid.position);
    if (dist <= BULLET_RADIUS + asteroid.radius) {
        return true;
    } else {
        return false;
    }
}

function distance2d(pos1, pos2) {
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.z - pos2.z, 2));
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


// TODO: Limit the number of times per second this can be called.
function fireBlaster() {
	
    console.log("Firing blaster!");
	obj = ship;
	
	var sphereMaterial = new THREE.MeshBasicMaterial({color: 0xEEEEEE});
	var sphereGeo = new THREE.SphereGeometry(BULLET_RADIUS, 6, 6);
	var sphere = new THREE.Mesh(sphereGeo, sphereMaterial);
	
	// bullet starting position at ship
	sphere.position.copy(obj.position);
	sphere.rotation.copy(obj.rotation);
    sphere.translateZ(-ship.radius);
    sphere._direction = camera.getWorldDirection();
    sphere._life = 1;
    
	blasts.push(sphere);
	scene.add(sphere);
}


// Keyboard controls for player motion. 
/*
kd.SPACE.down(function () {
    fireBlaster();
});
*/

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

function keydown(event) {
	
    switch (event.keyCode) {
        case 32: // spacebar
            fireBlaster();
            break;
    }
}
