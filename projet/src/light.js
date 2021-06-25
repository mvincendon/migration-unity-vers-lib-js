import * as THREE from '../../build/three.module.js'
import Stats from '../../examples/jsm/libs/stats.module.js';
import { OrbitControls } from '../../examples/jsm/controls/OrbitControls.js';
import {GUI} from '../../other_libs/dat.gui.module.js';


function launch(renderer) {
    const container = document.getElementById( 'container' );
    const stats = new Stats();
    container.appendChild( stats.dom );

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.y = 5;
    camera.position.x = 5;
            
    renderer.shadowMap.enabled = true;

    const controls = new OrbitControls(camera,renderer.domElement);
                controls.target.set(0, 0, 0);
                controls.update();

    const loader = new THREE.TextureLoader();
    const geometry_cube = new THREE.BoxGeometry(4,4,4);
    //const material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
    //const material = new THREE.MeshBasicMaterial({
                //	map: loader.load('https://threejsfundamentals.org/threejs/resources/images/wall.jpg'),
                //	});

    const material_cube = new THREE.MeshPhongMaterial({color: '#8AC'});
    material_cube.flatShading = true;
    const cube = new THREE.Mesh( geometry_cube, material_cube);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add( cube );
    const material_cube_2 = new THREE.MeshPhongMaterial({color: '#1CDE28'});
    material_cube_2.flatShading = true;
    const cube_2 = new THREE.Mesh( geometry_cube, material_cube_2);
    cube_2.position.set(10,0,0);
    cube_2.castShadow = true;
    cube_2.receiveShadow = true;
    scene.add( cube_2 );

    const geometry_sphere = new THREE.SphereGeometry(3,32,16);
    const material_sphere = new THREE.MeshPhongMaterial({color: '#CA8'});
    //material_sphere.flatShading = true;
    const sphere = new THREE.Mesh( geometry_sphere, material_sphere);
    sphere.position.set(-10,0,0);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);

    camera.position.z = 20;

    const color = 0xFFFFFF;
                const intensity = 1;
                const light = new THREE.DirectionalLight(color, intensity);
                light.position.set(0, 10, 2);
    light.target.position.set(-4, 0, -4);
    light.shadow.camera.left = 20;
    light.shadow.camera.right = -20;
    light.shadow.camera.bottom = 20;
    light.shadow.camera.top = -20;
    light.castShadow = true;
                scene.add(light);
    scene.add(light.target);

    const planeSize = 30;
    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({color: '#CACACA'});
    const plan_1 = new THREE.Mesh(planeGeo, planeMat);
    plan_1.receiveShadow = true;
                plan_1.rotation.x = Math.PI * -.5;
    plan_1.position.y = -5;
                scene.add(plan_1);

    const plan_2 = new THREE.Mesh(planeGeo, planeMat);
    plan_2.receiveShadow = true;
                plan_2.rotation.y = Math.PI * .5;
    plan_2.position.y = 10;
    plan_2.position.x = -15;
                scene.add(plan_2);

    const plan_3 = new THREE.Mesh(planeGeo, planeMat);
    plan_3.receiveShadow = true;
                plan_3.position.z = -15
    plan_3.position.y = 10;
                scene.add(plan_3);

    class ColorGUIHelper {
                    constructor(object, prop) {
                        this.object = object;
                        this.prop = prop;
                    }
                    get value() {
                        return `#${this.object[this.prop].getHexString()}`;
                    }
                    set value(hexString) {
                        this.object[this.prop].set(hexString);
                    }
                }

    const gui = new GUI();
                gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
    gui.add(light, 'intensity', 0, 2, 0.01);
                gui.add(light.position, 'x', -10, 10, .01);
                gui.add(light.position, 'z', -10, 10, .01);
                gui.add(light.position, 'y', 0, 10, .01);
                


    const animate = function () {
        //requestAnimationFrame( animate );
        
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        //sphere.position.y = THREE.MathUtils.lerp(-5, 5, 0.5);

        controls.update();
        stats.update();

        renderer.render( scene, camera );
    };

    renderer.setAnimationLoop(animate);
    //animate();
}