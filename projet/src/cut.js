import * as THREE from "../../build/three.module.js";
import {leastSquares} from "./regression.js";

function launch(renderer){
    let [width, height] = [window.innerWidth, window.innerHeight];

    renderer.setAnimationLoop(render);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x555555);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.3, 1000);
    scene.add(camera);

    // Lights
    const light = new THREE.PointLight(0xffffff, 1, 100, 2);
    light.position.set(2, 3, 0);
    light.castShadow = true;
    scene.add(light);

    scene.add(new THREE.AmbientLight(0x505050));

    // VR
    const controllerR = renderer.xr.getController(0);
    const controllerL = renderer.xr.getController(1);
    scene.add(controllerL);
    scene.add(controllerR);
    controllerR.addEventListener('selectstart', onSelectStart);

    // Cube textures
    const loader = new THREE.TextureLoader();
    const empty = new THREE.MeshBasicMaterial({map: loader.load('./media/cut/empty.png')});
    const arrayOfEmpty = new Array(4);
    arrayOfEmpty.fill(empty);
    const dirs = ['right', 'up', 'left', 'down'];
    const dirMaterials = {};
    for (const dir of dirs){
        const dirTexture = new THREE.MeshBasicMaterial({map: loader.load('./media/cut/' + dir + '.png')});
        dirMaterials[dir] = arrayOfEmpty.concat([dirTexture, empty]);
    }
    const dirVectors = {
        right: new THREE.Vector3(1, 0, 0),
        up: new THREE.Vector3(0, 1, 0),
        left: new THREE.Vector3(-1, 0, 0),
        down: new THREE.Vector3(0, -1, 0)
    };

    // Cube
    const cubeSide = 0.5;
    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(cubeSide, cubeSide, cubeSide),
        // new THREE.MeshPhongMaterial({color:'blue'})
        dirMaterials['left']
    );
    cube.position.set(0.5, 1.5, -2);
    scene.add(cube);


    // Saber
    const saberLength = 2;
    const saber = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, saberLength).translate(0, -saberLength/2, 0).rotateX(Math.PI/2),
        new THREE.MeshPhongMaterial({color:'red'})
    );
    controllerR.add(saber);

    const ray = new THREE.Raycaster();

    const dir = new THREE.Vector3();

    let intersecting = false;
    let currentDir = 'left';
    let tracedXs = [];
    let tracedYs = [];

    function render(){
        saber.getWorldDirection(dir);
        dir.multiplyScalar(-1);
        dir.normalize();
        ray.set(controllerR.position, dir);

        // Vérification du découpage
        const inter = ray.intersectObject(cube);
        if (inter.length === 0 && intersecting){
            intersecting = false;
            const [x, y] = leastSquares(tracedXs, tracedYs);
            const vect = new THREE.Vector3(x, y, 0);
            const angle = vect.angleTo(dirVectors[currentDir]);
            const accepte = Math.abs(angle) < Math.PI / 4;
            tracedXs = [];
            tracedYs = [];
            if (accepte) {
                currentDir = dirs[Math.floor(Math.random()*4)];
                cube.material = dirMaterials[currentDir];
            }
        }
        else if (inter.length > 0) {
            intersecting = true;
            const first = inter[0];
            const point = first.uv;
            tracedXs.push(point.x);
            tracedYs.push(point.y);
        }
            
        renderer.render(scene, camera);
    }

    function onSelectStart(){
        const inter = ray.intersectObject(cube);
        console.log(inter.length)
    }
}
export {launch};