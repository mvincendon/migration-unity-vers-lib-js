import * as THREE from "../build/three.module.js";
import * as FUSIL from "./src/fusil.js";
import * as PIECE from "./src/piece.js";
import * as PORTE from "./src/porte.js";
import * as LIGHT from "./src/light.js";
import * as MINECRAFT from "./src/minecraft.js";
import { XRControllerModelFactory } from '../examples/jsm/webxr/XRControllerModelFactory.js';


function launchMainRoom(renderer) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let controller1, controller2;
    let controllerGrip1, controllerGrip2;
    const tempMatrix = new THREE.Matrix4();

    let scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x555555);


    controller1 = renderer.xr.getController( 0 );
    scene.add( controller1 );

    controller2 = renderer.xr.getController( 1 );
    scene.add( controller2 );

    const controllerModelFactory = new XRControllerModelFactory();

    controllerGrip1 = renderer.xr.getControllerGrip( 0 );
    controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
    controllerGrip1.addEventListener( 'selectstart', onSelectStart );
    controllerGrip1.addEventListener( 'selectend', onSelectEnd );
    //controllerGrip1.addEventListener( 'squeezestart', onSqueezeStart );
    //controllerGrip1.addEventListener( 'squeezeend', onSqueezeEnd );
    scene.add( controllerGrip1 );

    controllerGrip2 = renderer.xr.getControllerGrip( 1 );
    controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
    controllerGrip2.addEventListener( 'selectstart', onSelectStart );
    controllerGrip2.addEventListener( 'selectend', onSelectEnd );
    //controllerGrip2.addEventListener( 'squeezestart', onSqueezeStart );
    //controllerGrip2.addEventListener( 'squeezeend', onSqueezeEnd );
    scene.add( controllerGrip2 );

    const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

    const line = new THREE.Line( geometry );
    line.name = 'line';
    line.scale.z = 5;

    window.addEventListener( 'resize', onWindowResize );
    
    const textureSol = new THREE.TextureLoader().load('../ressources_TP1/floor_wood_texture_1.jpg');
    const textureMINECRAFT = new THREE.TextureLoader().load( './media/main/MINECRAFT.jpg' );
    const textureFUSIL = new THREE.TextureLoader().load( './media/main/FUSIL.jpg' );
    const texturePIECE = new THREE.TextureLoader().load( './media/main/PIECE.jpg' );
    const texturePOETR = new THREE.TextureLoader().load( './media/main/PORTE.jpg' );
    const textureLIGHT = new THREE.TextureLoader().load( './media/main/LIGHT.jpg' );


    let camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.6, 3);
    scene.add(camera);

    const textureSol = new THREE.TextureLoader().load('../ressources_TP1/floor_wood_texture_1.jpg');

    let sol = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30, 1),
        new THREE.MeshLambertMaterial({ color: 'white', map: textureSol, side: THREE.DoubleSide })
    );
    sol.position.set(0, 0, -10);
    sol.rotation.x = Math.PI / 2;
    scene.add(sol);
    
    let cube0 = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 0.1),
        new THREE.MeshLambertMaterial({ color: 'white',  map: textureMINECRAFT })
        );
    cube0.position.set(-8, 1, -5);
    scene.add(cube0);
    cube0.userData.color = 'white';
    cube0.userData.scene = MINECRAFT;

    let cube1 = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 0.1),
        new THREE.MeshLambertMaterial({ color: 'white',  map: textureFUSIL  })
        );
    cube1.position.set(-5, 1, -5);
    scene.add(cube1);
    cube1.userData.color = 'red';
    cube1.userData.scene = FUSIL;

    let cube2 = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 0.1),
        new THREE.MeshLambertMaterial({ color: 'white',  map: texturePIECE })
        );
    cube2.position.set(-2, 1, -5);
    scene.add(cube2);
    cube2.userData.color = 'green';
    cube2.userData.scene = PIECE;

    let cube3 = new THREE.Mesh(
        new THREE.BoxGeometry(3, 1.5, 0.1),
        new THREE.MeshLambertMaterial({ color: 'white',  map: texturePOETR })
        );
    cube3.position.set(1.5, 0.75, -5);
    scene.add(cube3);
    cube3.userData.color = 'blue';
    cube3.userData.scene = PORTE;

    let cube4 = new THREE.Mesh(
        new THREE.BoxGeometry(3, 1.5, 0.1),
        new THREE.MeshLambertMaterial({ color: 'white',  map: textureLIGHT })
        );
    cube4.position.set(5.5, 0.75, -5);
    scene.add(cube4);
    cube4.userData.scene = LIGHT;

    const cubes = [cube0, cube1, cube2, cube3, cube4];

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    renderer.setAnimationLoop(() => {
        // requestAnimationFrame(animate);

        // raycaster.setFromCamera(mouse, camera);
        const dir = new THREE.Vector3();
        controller1.getWorldDirection(dir);
        // dir.applyEuler(new THREE.Euler(Math.PI, 0, Math.PI)); // On veut les z négatifs
        dir.multiplyScalar(-1);
        raycaster.set(controller1.position, dir);

        const inter = raycaster.intersectObjects(cubes);
        if (inter.length >= 1) {
            const objet = inter[0].object;
            objet.material.color.set('white');
        }
        else {
            cube0.material.color.set('white');
            cube1.material.color.set('red');
            cube2.material.color.set('green');
            cube3.material.color.set('blue');
            cube4.material.color.set('pink');
        }

        // Mise à jour du rayon visuel
        const pos = raycaster.ray.origin;
        rayon.position.set(pos.x,pos.y,pos.z);
        rayon.setDirection(raycaster.ray.direction);

        renderer.render(scene, camera);
    });

    function wash(){
        controllerGrip1.removeEventListener( 'selectstart', onSelectStart );
        controllerGrip1.removeEventListener( 'selectend', onSelectEnd );

        controllerGrip2.removeEventListener( 'selectstart', onSelectStart );
        controllerGrip2.removeEventListener( 'selectend', onSelectEnd );
    }

    function onSelectStart(event) {

        const controllerGrip = event.target;
        controllerGrip.userData.isSelecting = true;

        // tempMatrix.identity().extractRotation( controllerGrip.matrixWorld );

        // raycaster.ray.origin.setFromMatrixPosition( controllerGrip.matrixWorld );
        // raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );
        const intersected = raycaster.intersectObjects( cubes );
        
        if (intersected.length > 0){
            const objet = intersected[0].object;
            wash();
            objet.userData.scene.launch(renderer);
        }
    }
    function onSelectEnd( event ) {

        const controllerGrip = event.target;
        controllerGrip.userData.isSelecting = false;
    
        if ( controllerGrip.userData.selected !== undefined ) {
    
            controllerGrip.userData.selected = undefined;
    
        }
    
    
    }
    
    function onWindowResize() {
    
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    
        renderer.setSize( window.innerWidth, window.innerHeight );
    
    }
    
    const rayon = new THREE.ArrowHelper(raycaster.ray.origin, raycaster.ray.direction, 100);
    rayon.cone.visible = false;
    scene.add(rayon);

    function render() {
        

        renderer.render( scene, camera);
    }
    
    function onMouseMove(event) {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    }

    function onMouseClick(event) {
        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // calculate objects intersecting the picking ray
        const intersects_cube1 = (raycaster.intersectObject(cube1).length >= 1);

        if (intersects_cube1) {
            SCENE2.launch(renderer)
        }
    }

    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('click', onMouseClick);
    
    }


export { launchMainRoom }
