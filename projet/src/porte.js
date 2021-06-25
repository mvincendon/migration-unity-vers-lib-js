import * as THREE from "../../build/three.module.js";


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function launch(renderer){
    let scene = new THREE.Scene();
    scene.background = new THREE.Color(0x555555);


    let camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.6, 3);
    scene.add(camera);

    const texturePorte = new THREE.TextureLoader().load( '../media/piece/wood.jpg' );
    const textureSol = new THREE.TextureLoader().load( '../media/piece/floor_wood_texture_1.jpg' );

    let pivot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 3),
        new THREE.MeshLambertMaterial({color: 'white', map: texturePorte})
    );
    pivot.position.set(-1.5, 1.5, -3);
    scene.add(pivot);

    let porte = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 3, 0.1),
        new THREE.MeshLambertMaterial({color: 'white', map: texturePorte})
    );
    porte.position.set(0.1+0.75, 0, 0);
    pivot.add(porte);

    let poignee = new THREE.Mesh(
        new THREE.SphereGeometry(0.2),
        new THREE.MeshLambertMaterial({color: 'white', map: textureSol})
    );
    poignee.position.set(0.5, 0, 0);
    porte.add(poignee);
    let porteOuverte = false;

    let sol = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30, 1),
        new THREE.MeshLambertMaterial({color: 'white', map: textureSol, side: THREE.DoubleSide})
    );
    sol.position.set(0, 0, -10);
    sol.rotation.x = Math.PI/2;
    scene.add(sol);
    
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    renderer.setAnimationLoop(() => {
        // requestAnimationFrame(animate);

        // Coloration éventuelle de la poignée

        raycaster.setFromCamera( mouse, camera);
        if (raycaster.intersectObject( poignee ).length >= 1){
            
            poignee.material.color.set('red');
        }
        else {
            poignee.material.color.set('white');
        }

        renderer.render(scene, camera);
    });

    function onMouseMove( event ) {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }

    function onMouseClick( event ) {
        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera( mouse, camera );

        // calculate objects intersecting the picking ray
        const intersects_poignee = (raycaster.intersectObject( poignee ).length >= 1);

        if (intersects_poignee) {
            let fact = 1;
            if (porteOuverte){
                fact = -1;
            }
            pivot.rotation.y += fact * Math.PI / 3;
            porteOuverte = !porteOuverte;
        }
    }

    window.addEventListener( 'mousemove', onMouseMove, false );
    window.addEventListener( 'click', onMouseClick);

}

export {launch}