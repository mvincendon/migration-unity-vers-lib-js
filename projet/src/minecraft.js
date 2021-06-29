import * as THREE from "../../build/three.module.js";
import {VRButton} from "../../examples/jsm/webxr/VRButton.js";
import {OrbitControls} from '../../examples/jsm/controls/OrbitControls.js';
import { XRControllerModelFactory } from '../../examples/jsm/webxr/XRControllerModelFactory.js';
import TeleportVR from '../../other_libs/teleportvr.js';
import { HTMLMesh } from '../../examples/jsm/interactive/HTMLMesh.js';
import { InteractiveGroup } from '../../examples/jsm/interactive/InteractiveGroup.js';
import { GUI } from '../../other_libs/dat.gui.module.js';


function launch(renderer){

        let container;
        let controls;
        let camera, scene
        
        let controller1, controller2;
		let controllerGrip1, controllerGrip2;
        let raycaster;
        const tempMatrix = new THREE.Matrix4();

        const objects = [];
        const intersected = [];
        const elevationsMeshList = [];
        let group;

        // basic settings

        const side_cube = 0.5;

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x555555);

        group = new THREE.Group();
		scene.add( group );

        //container = document.createElement( 'div' );
		//document.body.appendChild( container );
        
        /*
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.autoClear = false;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.shadowMap.enabled = false;
        renderer.xr.enabled = true;
        container.appendChild( renderer.domElement );
        */

        renderer.autoClear = false;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.shadowMap.enabled = true;

        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 1.6, 2);
        scene.add(camera);

        const listener = new THREE.AudioListener();
        camera.add( listener );

        const sound_create = new THREE.PositionalAudio( listener );
        const sound_delete = new THREE.PositionalAudio( listener );
        const song = new THREE.PositionalAudio( listener );

        const audioLoader = new THREE.AudioLoader();
            audioLoader.load( './media/minecraft/sound.ogg', function( buffer ) {
            sound_create.setBuffer( buffer );
            sound_create.setVolume( 5 );
            //sound_create.setRefDistance( 1 );
        });

        const audioLoader2 = new THREE.AudioLoader();
            audioLoader2.load( './media/minecraft/sound_2.ogg', function( buffer ) {
            sound_delete.setBuffer( buffer );
            sound_delete.setVolume( 5 );
            //sound_delete.setRefDistance( 1 );
        });

        const audioLoader3 = new THREE.AudioLoader();
            audioLoader3.load( './media/minecraft/song.ogg', function( buffer ) {
            song.setBuffer( buffer );
            song.setVolume( 1 );
            song.setLoop( true );
            //song.setRefDistance( 5 );
            song.setMaxDistance( 5 );
        });

        const teleportVR = new TeleportVR(scene, camera);

        controls = new OrbitControls( camera, document.body );
		controls.target.set( 0, 1.6, 0 );
		controls.update();

        const light = new THREE.AmbientLight(0xffffff, 0.5)
        scene.add(light);

        // hdmi environment

        
        const loader_hdmi = new THREE.TextureLoader();
        const texture = loader_hdmi.load(
            './media/minecraft/maxresdefault3.jpg',
            () => {
                const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
                rt.fromEquirectangularTexture(renderer, texture);
                scene.background = rt.texture;
        });
        

        // cubes

		const cubeGeo = new THREE.BoxGeometry( side_cube, side_cube, side_cube);
        const loadManager = new THREE.LoadingManager();
        const loader = new THREE.TextureLoader(loadManager);
        const material_dirt = [
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/dirt_2.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/dirt_2.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/dirt_1.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/dirt_3.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/dirt_2.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/dirt_2.jpg')}),
        ];

        const material_tree = [
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/tree_2.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/tree_2.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/tree_1.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/tree_1.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/tree_2.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/tree_2.jpg')}),
        ];

        const material_leaf = [
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/leaf.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/leaf.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/leaf.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/leaf.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/leaf.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/leaf.jpg')}),
        ];

        const material_rock = [
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/rock.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/rock.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/rock.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/rock.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/rock.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/rock.jpg')}),
        ];

        const material_tnt = [
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/tnt_1.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/tnt_1.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/tnt_2.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/tnt_2.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/tnt_1.jpg')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/tnt_1.jpg')}),
        ];
		
        const material_music = [
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/music.png')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/music.png')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/music.png')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/music.png')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/music.png')}),
            new THREE.MeshBasicMaterial({map: loader.load('./media/minecraft/music.png')}),
        ];

        // grid

		const gridHelper = new THREE.GridHelper( side_cube * 20, 20 );
		scene.add( gridHelper );

        // sol

        const repeats = 20;
        const texture_sol = loader.load('./media/minecraft/dirt_1.jpg');
        texture_sol.wrapS = THREE.RepeatWrapping;
        texture_sol.wrapT = THREE.RepeatWrapping;
        texture_sol.magFilter = THREE.NearestFilter;
        texture_sol.repeat.set(repeats, repeats);
        const geometry_sol = new THREE.PlaneGeometry( side_cube * 20, side_cube * 20 );
        geometry_sol.rotateX( - Math.PI / 2 );
		const material_sol = new THREE.MeshPhongMaterial({ map: texture_sol, side: THREE.DoubleSide});
		const sol = new THREE.Mesh( geometry_sol, material_sol );
        sol.position.set(0, -0.001, 0);
        elevationsMeshList.push( sol );
		objects.push( sol );
        scene.add(sol);

        const geometry_plane = new THREE.PlaneGeometry( side_cube * 80, side_cube * 80 );
        const material_plane = new THREE.MeshBasicMaterial({color: 'white'});
        geometry_plane.rotateX( - Math.PI / 2 );
        const plane = new THREE.Mesh( geometry_plane, material_plane );
        plane.visible = false;
        plane.position.set(0, -0.001, 0);
        elevationsMeshList.push( plane );
        scene.add(plane);

        // ajouter les manettes dans la scène

		controller1 = renderer.xr.getController( 0 );
        controller1.addEventListener("connected", (e) => {
            teleportVR.add(0, controller1, e.data.gamepad);
        });
        controller1.addEventListener( 'selectstart', onSelectStart );
		controller1.addEventListener( 'selectend', onSelectEnd );
        controller1.addEventListener( 'squeezestart', onSqueezeStart );
		controller1.addEventListener( 'squeezeend', onSqueezeEnd );
        controller1.userData.block_id = 1;
        controller1.userData.music_on = false;
		scene.add( controller1 );

		controller2 = renderer.xr.getController( 1 );
        controller2.addEventListener("connected", (e) => {
            teleportVR.add(1, controller2, e.data.gamepad);
        });
		scene.add( controller2 );

		const controllerModelFactory = new XRControllerModelFactory();

		controllerGrip1 = renderer.xr.getControllerGrip( 0 );
		controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
		controllerGrip1.addEventListener("connected", (e) => {
            teleportVR.add(0, controllerGrip1, e.data.gamepad);
        });
        scene.add( controllerGrip1 );

		controllerGrip2 = renderer.xr.getControllerGrip( 1 );
		controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
		controllerGrip2.addEventListener("connected", (e) => {
            teleportVR.add(1, controllerGrip2, e.data.gamepad);
        });
        scene.add( controllerGrip2 );

        // GUI

        const gui = new GUI( { width: 200 } );
		gui.add( controller1.userData, 'block_id', 1, 6, 1);
        gui.domElement.style.visibility = 'hidden';

		const group_gui = new InteractiveGroup( renderer, camera );

        const mesh = new HTMLMesh( gui.domElement );
		mesh.position.x = 0;
		mesh.position.y = 0.1;
		mesh.position.z = 0;
		mesh.scale.setScalar( 2 );
        group_gui.add(mesh);
		controller2.add( group_gui);

        const board = new THREE.Mesh( new THREE.BoxGeometry(0.4,0.05,0.01));
        board.visible = false;
        board.position.y = 0.1;
        objects.push( board );
        controller2.add( board);

		// attacher des lignes aux manettes pour indiquer vers quel sens les manettes s'orientent
		
        const geometry_line = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

		const line = new THREE.Line( geometry_line );
		line.name = 'line';
		line.scale.z = 5;

        controller1.add( line.clone() );

        const cube_dirt = new THREE.Mesh( new THREE.BoxGeometry(0.1,0.1,0.1), material_dirt);
        cube_dirt.name = 'cube_dirt';
        cube_dirt.position.x = 0;
        cube_dirt.position.y = 0.2;
        cube_dirt.position.z = 0;
        cube_dirt.visible = true;

        const cube_tree = new THREE.Mesh( new THREE.BoxGeometry(0.1,0.1,0.1), material_tree);
        cube_tree.name = 'cube_tree';
        cube_tree.position.x = 0;
        cube_tree.position.y = 0.2;
        cube_tree.position.z = 0;
        cube_tree.visible = false;

        const cube_leaf = new THREE.Mesh( new THREE.BoxGeometry(0.1,0.1,0.1), material_leaf);
        cube_leaf.name = 'cube_leaf';
        cube_leaf.position.x = 0;
        cube_leaf.position.y = 0.2;
        cube_leaf.position.z = 0;
        cube_leaf.visible = false;

        const cube_rock = new THREE.Mesh( new THREE.BoxGeometry(0.1,0.1,0.1), material_rock);
        cube_rock.name = 'cube_rock';
        cube_rock.position.x = 0;
        cube_rock.position.y = 0.2;
        cube_rock.position.z = 0;
        cube_rock.visible = false;

        const cube_tnt = new THREE.Mesh( new THREE.BoxGeometry(0.1,0.1,0.1), material_tnt);
        cube_tnt.name = 'cube_tnt';
        cube_tnt.position.x = 0;
        cube_tnt.position.y = 0.2;
        cube_tnt.position.z = 0;
        cube_tnt.visible = false;

        const cube_music = new THREE.Mesh( new THREE.BoxGeometry(0.1,0.1,0.1), material_music);
        cube_music.name = 'cube_music';
        cube_music.position.x = 0;
        cube_music.position.y = 0.2;
        cube_music.position.z = 0;
        cube_music.visible = false;

        controller2.add( cube_dirt.clone() );
        controller2.add( cube_tree.clone() );
        controller2.add( cube_leaf.clone() );
        controller2.add( cube_rock.clone() );
        controller2.add( cube_tnt.clone() );
        controller2.add( cube_music.clone() );

        document.body.appendChild(VRButton.createButton(renderer));

		raycaster = new THREE.Raycaster();
	
        window.addEventListener( 'resize', onWindowResize );

		animate();

        function onWindowResize() {

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize( window.innerWidth, window.innerHeight );

        }

        function onSelectStart(event) {

            const controller = event.target;
            controller.userData.isSelecting = true;

            tempMatrix.identity().extractRotation( controller.matrixWorld );

            raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
            raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );
            const intersections = raycaster.intersectObjects( objects );
      
            if ( intersections.length > 0 ) {

                const intersect = intersections[ 0 ];
                const object = intersect.object;
                controller.userData.selected = object;

                if (object !== board) {
                    if (controller.userData.block_id%6 === 1) {
                        const voxel = new THREE.Mesh( cubeGeo, material_dirt );
                        voxel.position.copy( intersect.point.multiplyScalar(10) ).add( intersect.face.normal );
                        voxel.position.divideScalar( 5 ).floor().multiplyScalar( 5 ).addScalar( 2.5 );
                        voxel.position.divideScalar( 10 );
                        voxel.userData.id = 1;
                        objects.push( voxel );
                        group.add(voxel);
                        voxel.add(sound_create);
                        voxel.add(sound_delete);
                        const audio = voxel.children[ 0 ];
                        audio.play();
                        elevationsMeshList.push(voxel);
                    } else if (controller.userData.block_id%6 === 2) {
                        const voxel = new THREE.Mesh( cubeGeo, material_tree );
                        voxel.position.copy( intersect.point.multiplyScalar(10) ).add( intersect.face.normal );
                        voxel.position.divideScalar( 5 ).floor().multiplyScalar( 5 ).addScalar( 2.5 );
                        voxel.position.divideScalar( 10 );
                        voxel.userData.id = 2;
                        objects.push( voxel );
                        group.add(voxel);
                        voxel.add(sound_create);
                        voxel.add(sound_delete);
                        const audio = voxel.children[ 0 ];
					    audio.play();
                        elevationsMeshList.push(voxel);
                    } else if (controller.userData.block_id%6 === 3) {
                        const voxel = new THREE.Mesh( cubeGeo, material_leaf );
                        voxel.position.copy( intersect.point.multiplyScalar(10) ).add( intersect.face.normal );
                        voxel.position.divideScalar( 5 ).floor().multiplyScalar( 5 ).addScalar( 2.5 );
                        voxel.position.divideScalar( 10 ); 
                        voxel.userData.id = 3;               
                        objects.push( voxel );
                        group.add(voxel);
                        voxel.add(sound_create);
                        voxel.add(sound_delete);
                        const audio = voxel.children[ 0 ];
					    audio.play();
                        elevationsMeshList.push(voxel);
                    } else if (controller.userData.block_id%6 === 4) {
                        const voxel = new THREE.Mesh( cubeGeo, material_rock );
                        voxel.position.copy( intersect.point.multiplyScalar(10) ).add( intersect.face.normal );
                        voxel.position.divideScalar( 5 ).floor().multiplyScalar( 5 ).addScalar( 2.5 );
                        voxel.position.divideScalar( 10 );
                        voxel.userData.id = 4;
                        objects.push( voxel );
                        group.add(voxel);
                        voxel.add(sound_create);
                        voxel.add(sound_delete);
                        const audio = voxel.children[ 0 ];
					    audio.play();
                        elevationsMeshList.push(voxel);
                    } else if (controller.userData.block_id%6 === 5) {
                        const voxel = new THREE.Mesh( cubeGeo, material_tnt );
                        voxel.position.copy( intersect.point.multiplyScalar(10) ).add( intersect.face.normal );
                        voxel.position.divideScalar( 5 ).floor().multiplyScalar( 5 ).addScalar( 2.5 );
                        voxel.position.divideScalar( 10 );
                        voxel.userData.id = 5;
                        objects.push( voxel );
                        group.add(voxel);
                        voxel.add(sound_create);
                        voxel.add(sound_delete);
                        const audio = voxel.children[ 0 ];
					    audio.play();
                        elevationsMeshList.push(voxel);
                    } else {
                        
                        if ( !controller.userData.music_on ) {
                            const voxel = new THREE.Mesh( cubeGeo, material_music );
                            voxel.position.copy( intersect.point.multiplyScalar(10) ).add( intersect.face.normal );
                            voxel.position.divideScalar( 5 ).floor().multiplyScalar( 5 ).addScalar( 2.5 );
                            voxel.position.divideScalar( 10 );
                            objects.push( voxel );
                            voxel.userData.id = 6;
                            group.add(voxel);
                            voxel.add(song);
                            voxel.add(sound_delete);
                            const audio = voxel.children[ 0 ];
                            audio.play();
                            elevationsMeshList.push(voxel);
                            
                            controller.userData.music_on = !controller.userData.music_on;
                        } 
                        
                    }

                }
                
                render();

            }

        }

        function onSelectEnd( event ) {

            const controller = event.target;
            controller.userData.isSelecting = false;

            if ( controller.userData.selected !== undefined ) {
                controller.userData.selected = undefined;
            }

        }

        function onSqueezeStart(event) {

            const controller = event.target;
            controller.userData.isSqueezing = true;

            tempMatrix.identity().extractRotation( controller.matrixWorld );

			raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
			raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );
            const intersections = getIntersections( controller );

            if ( intersections.length > 0 ) {

                const intersection = intersections[ 0 ];
                const object = intersection.object;

                if (object.userData.id === 6) {
                    const audio = object.children[ 0 ];
				    audio.pause();
                    controller.userData.music_on = !controller.userData.music_on;
                } 

                group.remove(object);
                elevationsMeshList.pop(object);
                objects.splice( objects.indexOf( intersection.object ), 1 );

            } 
    
        }

        function onSqueezeEnd(event) {
            const controller = event.target;
            controller.userData.isSqueezing = false;

        }

        function getIntersections( controller ) {

            tempMatrix.identity().extractRotation( controller.matrixWorld );

            raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
            raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

            return raycaster.intersectObjects( group.children );

        }

        function detect_intersectObjects( controller ) {

            tempMatrix.identity().extractRotation( controller.matrixWorld );

            raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
            raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

            if ( controller.userData.selected !== undefined ) return;

            const line = controller.getObjectByName( 'line' );
            const intersections = raycaster.intersectObjects( objects );

            if ( intersections.length > 0 ) {

                const intersect = intersections[ 0 ];
				const object = intersect.object;
                intersected.push( object );
                line.scale.z = intersect.distance;

                } else {

                line.scale.z = 5;

            }

            animate();

        }

        function cleanIntersected() {

            while ( intersected.length ) {

            const object = intersected.pop();

            }

        }



        function animate() {

            renderer.setAnimationLoop( render );

        }

        function render() {

            cleanIntersected();

            detect_intersectObjects( controller1 );
 
            const cube_dirt = controller2.getObjectByName( 'cube_dirt' );
            const cube_tree = controller2.getObjectByName( 'cube_tree' );
            const cube_leaf = controller2.getObjectByName( 'cube_leaf' );
            const cube_rock = controller2.getObjectByName( 'cube_rock' );
            const cube_tnt = controller2.getObjectByName( 'cube_tnt' );
            const cube_music = controller2.getObjectByName( 'cube_music' );

            if (controller1.userData.block_id%6 === 1)  {
                cube_dirt.visible = true;
                cube_tree.visible = false;
                cube_leaf.visible = false;
                cube_rock.visible = false;
                cube_tnt.visible = false;
                cube_music.visible = false;      
                } else if (controller1.userData.block_id%6 === 2){
                    cube_dirt.visible = false;
                    cube_tree.visible = true;
                    cube_leaf.visible = false;
                    cube_rock.visible = false;
                    cube_tnt.visible = false;
                    cube_music.visible = false;
                } else if (controller1.userData.block_id%6 === 3){
                    cube_dirt.visible = false;
                    cube_tree.visible = false;
                    cube_leaf.visible = true;
                    cube_rock.visible = false;
                    cube_tnt.visible = false;
                    cube_music.visible = false;
                } else if (controller1.userData.block_id%6 === 4){
                    cube_dirt.visible = false;
                    cube_tree.visible = false;
                    cube_leaf.visible = false;
                    cube_rock.visible = true;
                    cube_tnt.visible = false;
                    cube_music.visible = false;
                } else if (controller1.userData.block_id%6 === 5){
                    cube_dirt.visible = false;
                    cube_tree.visible = false;
                    cube_leaf.visible = false;
                    cube_rock.visible = false;
                    cube_tnt.visible = true;
                    cube_music.visible = false;
                } else {
                    cube_dirt.visible = false;
                    cube_tree.visible = false;
                    cube_leaf.visible = false;
                    cube_rock.visible = false;
                    cube_tnt.visible = false;
                    cube_music.visible = true;

            }

            teleportVR.update(elevationsMeshList);

            renderer.render( scene, camera );

        }


}

export {launch};