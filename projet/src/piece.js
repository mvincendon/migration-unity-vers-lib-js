import * as THREE from "/build/three.module.js";
        import {VRButton} from "/examples/jsm/webxr/VRButton.js";
        import {OrbitControls} from '/examples/jsm/controls/OrbitControls.js';
		import { XRControllerModelFactory } from '/examples/jsm/webxr/XRControllerModelFactory.js';
        import TeleportVR from '/other_libs/teleportvr.js';
        import { TubePainter } from '/examples/jsm/misc/TubePainter.js';

function launch(renderer){
    let container;
    let camera, scene;
    let raycaster;
    // const mouse = new THREE.Vector2();
    let controller1, controller2;
            let controllerGrip1, controllerGrip2;
    const intersected = [];
            const tempMatrix = new THREE.Matrix4();

            let controls, group, objects;

    const radius = 0.1;
    const clock = new THREE.Clock();
    let normal = new THREE.Vector3();
            const relativeVelocity = new THREE.Vector3();
    const cursor = new THREE.Vector3();

    container = document.createElement( 'div' );
            document.body.appendChild( container );

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x555555);
        
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.6, 3);
    scene.add(camera);

    const teleportVR = new TeleportVR(scene, camera);

    controls = new OrbitControls( camera, container );
            controls.target.set( 0, 1.6, 0 );
            controls.update();

    // une point lumière dans la salle 
    let light2 = new THREE.PointLight( 0xe3dc6d );
    light2.distance = 10;
    light2.intensity = 1.5;
            light2.position.set( -0.7, 2.5, -4 );
    light2.shadow.camera.min = 0.1;
    light2.shadow.camera.max = 30;
            light2.castShadow = true;
    scene.add( light2 );

    // une lumière ambiante dans tout l'environnement
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // un groupe qui va contenir toutes les balles
    group = new THREE.Group();
            scene.add( group );

    const texturePorte = new THREE.TextureLoader().load( 'ressources_TP1/wood.jpg' );
    const textureSol = new THREE.TextureLoader().load( 'ressources_TP1/floor_wood_texture_1.jpg' );
    const textureMur = new THREE.TextureLoader().load( 'ressources_TP1/maison.jpg' );
    const textureButton = new THREE.TextureLoader().load( 'ressources_TP1/paint.jpg' );

    const geometry_sphere = new THREE.IcosahedronGeometry( radius, 3 );

    // ajouter 30 balles dans la salle
    for ( let i = 0; i < 30; i ++ ) {

        const object = new THREE.Mesh( geometry_sphere, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

        object.position.x = Math.random() * 6 - 4;
        object.position.y = Math.random() * 2.5;
        object.position.z = - Math.random() * 3 - 2.5;
        object.castShadow = true;
        object.receiveShadow = true;
        object.userData.velocity = new THREE.Vector3();
        object.userData.velocity.x = Math.random() * 0.01 - 0.005;
        object.userData.velocity.y = Math.random() * 0.01 - 0.005;
        object.userData.velocity.z = Math.random() * 0.01 - 0.005;

        group.add( object );

    }

    // créer un arbre
    let stump = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 2),
        new THREE.MeshLambertMaterial({color: 'white', map: texturePorte})
    );
    stump.position.set(-3.5, 1, 1.5);
    stump.receiveShadow = true;
    scene.add(stump);

    let leaf = new THREE.Mesh(
        new THREE.CylinderGeometry( 1, 0.4, 1.5, 10 ),
        new THREE.MeshLambertMaterial({color: 'green'})
    );
    leaf.position.set(0, 1+0.5, 0);
    leaf.rotation.x = Math.PI;
    leaf.receiveShadow = true;
    stump.add(leaf);

    // les composants pour la porte
    let pivot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 2),
        new THREE.MeshLambertMaterial({color: 'white', map: texturePorte})
    );
    pivot.position.set(-1.3, 1, -2);
    //pivot.castShadow = true;
    pivot.receiveShadow = true;
    scene.add(pivot);

    let porte = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 2, 0.1),
        new THREE.MeshLambertMaterial({color: 'white', map: texturePorte})
    );
    porte.position.set(0.1+0.6, 0, 0);
    //porte.castShadow = true;
    porte.receiveShadow = true;
    pivot.add(porte);

    let poignee = new THREE.Mesh(
        new THREE.SphereGeometry(0.1),
        new THREE.MeshLambertMaterial({color: 'white', map: textureSol})
    );
    poignee.position.set(0.4, 0, 0);
    //poignee.castShadow = true;
    poignee.receiveShadow = true;
    poignee.material.emissive.r = 1;
    porte.add(poignee);
    let porteOuverte = false;

    // le sol
    let sol = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        new THREE.MeshPhongMaterial({ map: textureSol, side: THREE.DoubleSide})
    );
    sol.position.set(0, -0.001, 0);
    sol.rotation.x = Math.PI/2;
    sol.receiveShadow = true;
    scene.add(sol);

    // le premier bouton pour allumer et éteindre la point lumière
    let button = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.1, 0.1),
        new THREE.MeshLambertMaterial({color: 0xBEBEBE})
    );
    button.position.set(0.3, 1.2, -2.05);
    // button.castShadow = true;
    button.receiveShadow = true;
    button.material.emissive.g = 1;
    scene.add(button);
    let LigntOff = false;

    // le tableau dans la salle
    let blackboard = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1, 0.1),
        new THREE.MeshLambertMaterial({color: 0x062300, side: THREE.DoubleSide})
    );
    blackboard.position.set(0, 1.5, -5.9);
    blackboard.castShadow = true;
    blackboard.receiveShadow = true;
    scene.add(blackboard);

    // le deuxème bouton pour commencer à dessiner
    let button2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.1, 0.1),
        new THREE.MeshLambertMaterial({color: 'white', map: textureButton})
    );
    button2.position.set(1.3, 1.5, -5.95);
    button2.castShadow = true;
    button2.receiveShadow = true;
    button2.material.emissive.r = 1;
    scene.add(button2);
    let paintbegin = false; 

    // tous les murs pour construire la salle
    let mur1 = new THREE.Mesh(
        new THREE.BoxGeometry(3, 3, 0.1),
        new THREE.MeshLambertMaterial({color: 'white', opacity: 0.5, transparent: true, side: THREE.DoubleSide})
    );
    mur1.position.set(1.5, 1.5, -2);
    //mur1.castShadow = true;
    mur1.receiveShadow = true;
    scene.add(mur1);

    let mur2 = new THREE.Mesh(
        new THREE.BoxGeometry(3, 3, 0.1),
        new THREE.MeshLambertMaterial({color: 'white',  opacity: 0.5, transparent: true, side: THREE.DoubleSide})
    );
    mur2.position.set(-2.9, 1.5, -2);
    //mur2.castShadow = true;
    mur2.receiveShadow = true;
    scene.add(mur2);

    let mur3 = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 1, 0.1),
        new THREE.MeshLambertMaterial({map: textureMur, color: 'white', side: THREE.DoubleSide})
    );
    mur3.position.set(-0.7, 2.5, -2);
    //mur3.castShadow = true;
    mur3.receiveShadow = true;
    scene.add(mur3);

    let mur4 = new THREE.Mesh(
        new THREE.BoxGeometry(7.4, 3, 0.1),
        new THREE.MeshLambertMaterial({color: 'white', side: THREE.DoubleSide})
    );
    mur4.position.set(-0.7, 1.5, -6);
    // mur4.castShadow = true;
    mur4.receiveShadow = true;
    scene.add(mur4);

    let mur5 = new THREE.Mesh(
        new THREE.BoxGeometry(4, 3, 0.1),
        new THREE.MeshLambertMaterial({color: 'white', side: THREE.DoubleSide})
    );
    mur5.rotation.y = Math.PI/2;
    mur5.position.set(3, 1.5, -4);
    // mur5.castShadow = true;
    mur5.receiveShadow = true;
    scene.add(mur5);

    let mur6 = new THREE.Mesh(
        new THREE.BoxGeometry(4, 3, 0.1),
        new THREE.MeshLambertMaterial({color: 'white', side: THREE.DoubleSide})
    );
    mur6.rotation.y = Math.PI/2;
    mur6.position.set(-4.4, 1.5, -4);
    //mur6.castShadow = true;
    mur6.receiveShadow = true;
    scene.add(mur6);

    let mur7 = new THREE.Mesh(
        new THREE.BoxGeometry(7.5, 4.1, 0.1),
        new THREE.MeshLambertMaterial({color: 'white', side: THREE.DoubleSide})
    );
    mur7.rotation.x = Math.PI/2;
    mur7.position.set(-0.7, 3, -4);
    //mur7.castShadow = true;
    mur7.receiveShadow = true;
    scene.add(mur7);
        
        

    const painter1 = new TubePainter();
            scene.add( painter1.mesh );

            const painter2 = new TubePainter();
            scene.add( painter2.mesh );

    // ajouter les manettes dans la scène

            controller1 = renderer.xr.getController( 0 );
            scene.add( controller1 );

            controller2 = renderer.xr.getController( 1 );
            scene.add( controller2 );

            const controllerModelFactory = new XRControllerModelFactory();

            controllerGrip1 = renderer.xr.getControllerGrip( 0 );
            controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
            controllerGrip1.addEventListener("connected", (e) => {
        teleportVR.add(0, controllerGrip1, e.data.gamepad);
    });
    controllerGrip1.addEventListener( 'selectstart', onSelectStart );
            controllerGrip1.addEventListener( 'selectend', onSelectEnd );
    controllerGrip1.addEventListener( 'squeezestart', onSqueezeStart );
            controllerGrip1.addEventListener( 'squeezeend', onSqueezeEnd );
            controllerGrip1.userData.painter = painter1;
    scene.add( controllerGrip1 );

            controllerGrip2 = renderer.xr.getControllerGrip( 1 );
            controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
            controllerGrip2.addEventListener("connected", (e) => {
        teleportVR.add(1, controllerGrip2, e.data.gamepad);
    });
    controllerGrip2.addEventListener( 'selectstart', onSelectStart );
            controllerGrip2.addEventListener( 'selectend', onSelectEnd );
    controllerGrip2.addEventListener( 'squeezestart', onSqueezeStart );
            controllerGrip2.addEventListener( 'squeezeend', onSqueezeEnd );
            controllerGrip2.userData.painter = painter2;
    scene.add( controllerGrip2 );

    // attacher les stylos aux manettes, au début ils sont invisibles
    const pen = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, 0.08),
        new THREE.MeshLambertMaterial({color: 'white'})
    );
    pen.name = 'pen';
    pen.position.z = -0.1;
    pen.rotation.x = Math.PI/2;
    pen.visible = false;

    controllerGrip1.add( pen.clone() );
            controllerGrip2.add( pen.clone() );

    const stylo = new THREE.Mesh( new THREE.IcosahedronGeometry( 0.01, 3 ) );
            stylo.name = 'stylo';
            stylo.position.z = - 0.14;
    stylo.visible = false;

    controllerGrip1.add( stylo.clone() );
            controllerGrip2.add( stylo.clone() );

            // attacher des lignes aux manettes pour indiquer vers quel sens les manettes s'orientent
            const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

            const line = new THREE.Line( geometry );
            line.name = 'line';
            line.scale.z = 5;

            controllerGrip1.add( line.clone() );
            controllerGrip2.add( line.clone() );

    document.body.appendChild(VRButton.createButton(renderer));

            raycaster = new THREE.Raycaster();
        
    window.addEventListener( 'resize', onWindowResize );

            animate();

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }

    // qu'est-ce qu'on va faire quand on clique le main bouton des manettes
    function onSelectStart(event) {

        const controllerGrip = event.target;
        controllerGrip.userData.isSelecting = true;
        const stylo = controllerGrip.getObjectByName( 'stylo' );
        const pen = controllerGrip.getObjectByName( 'pen' );

        tempMatrix.identity().extractRotation( controllerGrip.matrixWorld );

                raycaster.ray.origin.setFromMatrixPosition( controllerGrip.matrixWorld );
                raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );
        const intersects_poignee = (raycaster.intersectObject( poignee ).length >= 1);
        const intersects_button = (raycaster.intersectObject( button ).length >= 1);
        const intersects_button2 = (raycaster.intersectObject( button2 ).length >= 1);
        const intersections = getIntersections( controllerGrip );
        
        // si la manette s'oriente vers la poignée quand on clique
        if ( intersects_poignee ) {
            poignee.material.emissive.b = 1;
            poignee.material.emissive.r = 0;
            let fact = 1;
            if (porteOuverte){
                fact = -1;
                poignee.material.emissive.b = 0;
                poignee.material.emissive.r = 1;
            }
            pivot.rotation.y += fact * Math.PI / 3;
            porteOuverte = !porteOuverte;
        }
        
        // si la manette s'oriente vers le premier bouton quand on clique
        if ( intersects_button ) {
            button.material.emissive.r = 1;
            button.material.emissive.g = 0;
            light2.intensity = 0.3;
            if (LigntOff){
                light2.intensity = 1;
                button.material.emissive.r = 0;
                button.material.emissive.g = 1;
            }
            
            LigntOff = !LigntOff;
        }

        // si la manette s'oriente vers le deuxième bouton quand on clique
        if ( intersects_button2 ) {
            stylo.visible = true;
            pen.visible = true;
            button2.material.emissive.r = 0;
            button2.material.emissive.g = 1;
            if (paintbegin){
                stylo.visible = false;
                pen.visible = false;
                button2.material.emissive.r = 1;
                button2.material.emissive.g = 0;
            }
            paintbegin = !paintbegin;
    
        }
        
        // si la manette s'oriente vers l'une des balles quand on clique
        if ( intersections.length > 0 ) {

            const intersection = intersections[ 0 ];

            const object = intersection.object;
            object.material.emissive.b = 1;
            controllerGrip.attach( object );

            controllerGrip.userData.selected = object;

        }


    }  


    function onSelectEnd( event ) {

        const controllerGrip = event.target;
        controllerGrip.userData.isSelecting = false;

        if ( controllerGrip.userData.selected !== undefined ) {

            const object = controllerGrip.userData.selected;
            object.material.emissive.b = 0;
            group.attach( object );

            controllerGrip.userData.selected = undefined;

        }


    }

    // qu'est-ce qu'on va faire quand on clique le secondary bouton des manettes
    function onSqueezeStart() {

        this.userData.isSqueezing = true;
        this.userData.positionAtSqueezeStart = this.position.y;
        this.userData.scaleAtSqueezeStart = this.scale.x;

    }

    function onSqueezeEnd() {

        this.userData.isSqueezing = false;

    }

    // fonction liée au mode de dessin
    function handleController( controllerGrip ) {

        const userData = controllerGrip.userData;
        const painter = userData.painter;
        const stylo = controllerGrip.getObjectByName( 'stylo' );
        const pen = controllerGrip.getObjectByName( 'pen' );
        // const v = new THREE.Vector3( );
        // v.setFromMatrixPosition( controllerGrip.matrixWorld );
        
        // modifer la taille du stylo en cliquant le secondary bouton des manettes
        if ( userData.isSqueezing === true) {
            const delta = ( controllerGrip.position.y - userData.positionAtSqueezeStart ) * 5;
            const scale = Math.max( 0.1, userData.scaleAtSqueezeStart + delta );

            stylo.scale.setScalar( scale );
            painter.setSize( scale );

        }
        
        // important !!! transmettre la position réelle du stylo à cursor
        cursor.setFromMatrixPosition( stylo.matrixWorld );

        // commencer à dessiner en cliquant le main bouton des manettes, si et seulement si le stylo est assez proche du tableau
        if (paintbegin === true && cursor.x > -1 && cursor.x < 1 && cursor.y > 1 && cursor.y < 2 && cursor.z < -5.83 && cursor.z > -5.87) {
            pen.material.emissive.b = 1;
            if ( userData.isSelecting === true) {
                painter.lineTo( cursor );
                painter.update();
            }

        } else {
            pen.material.emissive.b = 0;
            painter.moveTo( cursor );

        }

    }

    function getIntersections( controllerGrip ) {

        tempMatrix.identity().extractRotation( controllerGrip.matrixWorld );

        raycaster.ray.origin.setFromMatrixPosition( controllerGrip.matrixWorld );
        raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

        return raycaster.intersectObjects( group.children );

    }

    function intersectObjects( controllerGrip ) {

        // Do not highlight when already selected

        if ( controllerGrip.userData.selected !== undefined ) return;

        const line = controllerGrip.getObjectByName( 'line' );
                const intersections = getIntersections( controllerGrip );

                if ( intersections.length > 0 ) {

                    const intersection = intersections[ 0 ];

                    const object = intersection.object;
                    object.material.emissive.r = 1;
                    intersected.push( object );

                    line.scale.z = intersection.distance;

                } else {

                    line.scale.z = 5;

                }

    }

    function cleanIntersected() {

        while ( intersected.length ) {

            const object = intersected.pop();
            object.material.emissive.r = 0;

        }

    }

    function animate() {

        renderer.setAnimationLoop( render );

    }

    function render(time) {
        time*= 0.0005;

        cleanIntersected();

        intersectObjects( controllerGrip1 );
        intersectObjects( controllerGrip2 );

        handleController( controllerGrip1 );
                handleController( controllerGrip2 );

        teleportVR.update();

        const delta = clock.getDelta() * 0.8; // slow down simulation

        mur3.material.emissive.setHex((time * 8) % 2 > 1 ? 0x2460E4 : 0xE42467);

        for ( let i = 0; i < group.children.length; i ++ ) {

            const object = group.children[ i ];

            object.position.x += object.userData.velocity.x * delta;
            object.position.y += object.userData.velocity.y * delta;
            object.position.z += object.userData.velocity.z * delta;

            // assurer que les balles restent au sein de la salle

            if ( object.position.x < -4.35 + radius || object.position.x > 2.95 - radius ) {

                object.position.x = THREE.MathUtils.clamp( object.position.x, -4.35 + radius, 2.95 - radius );
                object.userData.velocity.x = - object.userData.velocity.x;

            }

            if ( object.position.y < radius || object.position.y > 2.95 - radius) {

                object.position.y = Math.max( object.position.y, radius );

                        object.userData.velocity.x *= 0.98;
                        object.userData.velocity.y = - object.userData.velocity.y * 0.8;
                        object.userData.velocity.z *= 0.98;

            }

            if ( object.position.z < -5.95 + radius || object.position.z > -2.05 - radius ) {

                object.position.z = THREE.MathUtils.clamp( object.position.z, -5.95 + radius, -2.05 - radius );
                object.userData.velocity.z = - object.userData.velocity.z;

            }

            // détecter si deux balles sont en collision
            for ( let j = i + 1; j < group.children.length; j ++ ) {

                const object2 = group.children[ j ];

                normal.copy( object.position ).sub( object2.position );

                const distance = normal.length();

                if ( distance < 2 * radius ) {

                    normal.multiplyScalar( 0.5 * distance - radius );

                    object.position.sub( normal );
                    object2.position.add( normal );

                    normal.normalize();

                    relativeVelocity.copy( object.userData.velocity ).sub( object2.userData.velocity );

                    normal = normal.multiplyScalar( relativeVelocity.dot( normal ) );

                    object.userData.velocity.sub( normal );
                    object2.userData.velocity.add( normal );

                }

        }

        object.userData.velocity.y -= 9.8 * delta;

        }

        renderer.render( scene, camera );

    }
}
export {launch};