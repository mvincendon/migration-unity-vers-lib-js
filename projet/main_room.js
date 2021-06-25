import * as THREE from "../build/three.module.js";
import * as FUSIL from "./src/fusil.js";
import * as PIECE from "./src/fusil.js";
import * as PORTE from "./src/porte.js";
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

    animate();

    let camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.6, 3);
    scene.add(camera);

    const textureSol = new THREE.TextureLoader().load('/ressources_TP1/floor_wood_texture_1.jpg');

    let sol = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30, 1),
        new THREE.MeshLambertMaterial({ color: 'white', map: textureSol, side: THREE.DoubleSide })
    );
    sol.position.set(0, 0, -10);
    sol.rotation.x = Math.PI / 2;
    scene.add(sol);

    let cube1 = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshLambertMaterial({ color: 'red' })
        );
    cube1.position.set(0, 1, -10);
    scene.add(cube1);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    renderer.setAnimationLoop(() => {
        // requestAnimationFrame(animate);

        // Coloration éventuelle de la poignée

        raycaster.setFromCamera(mouse, camera);
        if (raycaster.intersectObject(cube1).length >= 1) {

            cube1.material.color.set('white');
        }
        else {
            cube1.material.color.set('red');
        }

        renderer.render(scene, camera);
    });

    function onSelectStart(event) {

        const controllerGrip = event.target;
        controllerGrip.userData.isSelecting = true;

        tempMatrix.identity().extractRotation( controllerGrip.matrixWorld );

        raycaster.ray.origin.setFromMatrixPosition( controllerGrip.matrixWorld );
        raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );
        const intersects_cube1 = (raycaster.intersectObject( cube1 ).length >= 1);
        
        // si la manette s'oriente vers la poignée quand on clique
        if ( intersects_cube1 ) {
            SCENE2.launch(renderer)
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
    function animate() {
    
        renderer.setAnimationLoop( render );
    
    }
    
    const rayon = new THREE.ArrowHelper(raycaster.ray.origin, raycaster.ray.direction, 100);
    rayon.cone.visible = false;
    scene.add(rayon);

    function render() {
        const dir = new THREE.Vector3();
        controller1.getWorldDirection(dir);

        rayon.position.set(controller1.position.x,controller1.position.y,controller1.position.z);
        rayon.setDirection(dir);

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