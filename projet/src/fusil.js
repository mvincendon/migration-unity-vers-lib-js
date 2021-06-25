import * as THREE from "../../build/three.module.js";
import {OBJLoader} from "../../examples/jsm/loaders/OBJLoader.js";
    
const path_canon = "/projet/media/fusil/canon.obj";
const path_fusil = "/projet/media/fusil/fusil2.obj";
const path_main = "/projet/media/fusil/main.obj";

function launch(renderer){
    let [width, height] = [window.innerWidth, window.innerHeight];

    // Scene, camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x555555);

    renderer.shadowMap.enabled = true;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.3, 1000);
    scene.add(camera);

    // Lights
    const light = new THREE.PointLight(0xffffff, 1, 100, 2);
    light.position.set(2, 3, 0);
    light.castShadow = true;
    scene.add(light);

    scene.add(new THREE.AmbientLight(0x505050));

    // Basic Objects
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(2),
        new THREE.MeshPhongMaterial({color: "brown"})
    );
    sphere.castShadow = true;
    const sph_p0 = new THREE.Vector3(-19, 3.3, -40);
    const sph_v0 = new THREE.Vector3(0.01, 0.009, 0);
    sphere.position.x = sph_p0.x;
    sphere.position.y = sph_p0.y;
    sphere.position.z = sph_p0.z;
    scene.add(sphere);

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshPhongMaterial({color: "green", side: THREE.DoubleSide})
    );
    plane.receiveShadow = true;
    plane.position.set(0, -1.8, -10);
    plane.rotation.x = Math.PI / 2;
    scene.add(plane);


    // Model objects
    const loader = new OBJLoader();
    loader.load(
        path_canon,
        canon => {
            canon.position.set(-30, -2, -40);
            canon.rotation.y = -Math.PI / 2;
            scene.add(canon);
        },
        xhr => {
            console.log("Chargement du canon");
        },
        error => {
            console.log("Erreur de chargement du canon");
        }
    );

    let fusil = new THREE.Object3D();
    const boutFusil = new THREE.Object3D();
    const spotMainFusil = new THREE.Object3D();
    boutFusil.position.set(0, 0.6, 7);
    spotMainFusil.position.set(0, 0.6, 3.5);
    const raycaster = new THREE.Raycaster();
    const fleche = new THREE.ArrowHelper(dirFusil(), posBoutFusil(), 100);
    scene.add(fleche);
    fleche.cone.visible = false;
    function initFusil(obj){
        fusil = obj;
        // fusil.position.set(1.5, -0.3, -5);
        fusil.rotation.y = Math.PI;
        // scene.add(fusil);
        controllerR.add(fusil);
        fusil.add(boutFusil);   // On est obligé de les mettre là car on a modifié fusil
        fusil.add(spotMainFusil);

        renderer.setAnimationLoop(render);
    }
    loader.load(
        path_fusil, 
        initFusil,
        xhr => {
            console.log("Chargement du fusil");
        },
        error => {
            console.log("Erreur de chargement du fusil", error);
        }
    );
    let main = new THREE.Object3D();
    loader.load(
        path_main, 
        objet => {
            main = objet;
            const scale = 7;
            main.scale.set(scale, scale, scale);
            main.rotation.y = Math.PI / 2;
            controllerL.add(main);
        },
        xhr => {
            console.log("Chargement de la main gauche");
        },
        error => {
            console.log("Erreur de chargement de la main gauche", error);
        }
    );
    
    // VR
    const controllerR = renderer.xr.getController(0);
    const controllerL = renderer.xr.getController(1);
    // scene.add(controllerL);
    scene.add(controllerR);
    controllerL.addEventListener('squeezestart', ()=>{leftSqueezing = true;});
    controllerL.addEventListener('squeezeend', ()=>{leftSqueezing = false;});

        // // // Dummy cube
        // const cube = new THREE.Mesh(
        //     new THREE.BoxGeometry(1, 0.1, 0.1),
        //     new THREE.MeshPhongMaterial({ color: "red" })
        // );
        // // cube.position.set(0, 0, -2.3);
        // spotMainFusil.add(cube);

    // Variables and constants
    const g = new THREE.Vector3(0, -0.01, 0);
    
    const parabole = computeParabola(sph_p0, sph_v0, -1);

    let sphereMoving = false;
    let sphereLaunchTime = 0;
    let temps = 0;
    let handHolding = false;
    let leftSqueezing = false;
    let wim = new THREE.Group();
    

    // Functions

    function render(time){
        temps = time;
        wim.rotation.y += 0.01;
        
        raycaster.set(posBoutFusil(), dirFusil());
        fleche.position.set(posBoutFusil().x, posBoutFusil().y, posBoutFusil().z);
        fleche.setDirection(dirFusil());

        if (sphereMoving){
            sphere.material.color.set("green");
            if (raycaster.intersectObject(sphere).length > 0)
                sphere.material.color.set("blue");

            const vie = Math.floor(time-sphereLaunchTime);
            if (vie <= parabole.length){
                const newPos = parabole[vie];
                sphere.position.set(newPos.x, newPos.y, newPos.z);
            }
            else {
                sphereMoving = false;
                sphere.visible = false;
            }
        }

        // if ((!handHolding && procheFusil(controllerL)) || (handHolding && !procheFusil(controllerL)))
        //     changeHandState();
        // if (handHolding) {
        //     if (leftSqueezing) {
        //         rotate(fusil,  spotMainFusil.position, diffHandToSpot());
        //         stickHandToFusil();
        //     }
        //     else
        //         stickHandToFusil();
        // }
        
        renderer.render(scene, camera);
    }

    function buildWiM(root){    // World in Miniature
        const reductionFactor = 0.01;
        const miniRoot = new THREE.Group();
        for (let child of root.children){
            if (child.type === 'Object3D' || child.type === 'Group'){
                const miniChild = buildWiM(child);
                if (miniChild !== null)
                    miniRoot.add(miniChild);
            }
            else if (child.type === 'Mesh' && isEligibleToBeRenderedInWiM(child)){
                const miniChild = child.clone();
                miniChild.castShadow = false;
                miniRoot.add(miniChild);
            }
        }
        if (miniRoot.children.length > 0){
            miniRoot.scale.multiplyScalar(reductionFactor);
            return miniRoot;
        }
        else
            return null;
    }

    function isEligibleToBeRenderedInWiM(mesh){
        const seuil = 5;
        return maxBoundingCoordinate(mesh) > seuil;
    }

    function maxBoundingCoordinate(mesh){
        mesh.geometry.computeBoundingBox();
        const size = new THREE.Vector3();
        mesh.geometry.boundingBox.getSize(size);
        return Math.max(size.x, size.y, size.z);
    }

    function sens(vect, theta){
        const radVect = new THREE.Vector2(-Math.sin(theta), Math.cos(theta));
        return Math.sign(radVect.dot(vect));
    }

    function rotate(objet, pivot, dr) {     // Pourquoi il sort de son spot ?
        // On suppose que le point d'application est le centre
        dr.applyEuler(objet.rotation);
        const seuil = 0.01;
        const rayon = pivot.length();
        const ux = new THREE.Vector3(1, 0, 0).applyEuler(objet.rotation);
        const uy = new THREE.Vector3(0, 1, 0).applyEuler(objet.rotation);
        const uz = new THREE.Vector3(0, 0, 1).applyEuler(objet.rotation);
        const projx = dr.clone().projectOnPlane(ux);
        const anglex = sens(new THREE.Vector2(projx.y, projx.z), objet.rotation.x) * projx.length()/rayon;
        const projy = dr.clone().projectOnPlane(uy);
        const angley = sens(new THREE.Vector2(projy.z, projy.x), objet.rotation.y) * projy.length()/rayon;
        const projz = dr.clone().projectOnPlane(uz);
        const anglez = sens(new THREE.Vector2(projz.x, projz.y), objet.rotation.z) * projz.length()/rayon;
        objet.rotation.x += (Math.abs(anglex)>seuil)*anglex;
        objet.rotation.y += (Math.abs(angley)>seuil)*angley;
        // objet.rotation.z += (Math.abs(anglez)>seuil)*anglez;

    }

    function posBoutFusil(){
        let posBout = new THREE.Vector3(0, 0, 0);
        boutFusil.getWorldPosition(posBout);
        return posBout;
    }
    function dirFusil(){
        let dirFusil = new THREE.Vector3(0, 0, 0);
        fusil.getWorldDirection(dirFusil);
        return dirFusil;
    }

    function procheFusil(objet){
        const seuil = 2;
        const obj = new THREE.Vector3(0, 0, 0);
        const spot = new THREE.Vector3(0, 0, 0);
        objet.getWorldPosition(obj);
        spotMainFusil.getWorldPosition(spot);
        obj.sub(spot);
        return obj.length() < seuil;
    }

    function changeHandState(){
        if (handHolding)
            setNeutralHand();
        else 
            setHoldingHand();
    }

    function setNeutralHand(){
        handHolding = false;
        main.position.set(0, 0, 0);
        main.rotation.y = Math.PI/2;
        main.rotation.x = 0;
    }

    function setHoldingHand(){
        handHolding = true;
        stickHandToFusil();
        main.rotation.y = 0;
        main.rotation.x = Math.PI/6;
    }

    function diffHandToSpot(){  // Sûr de toi ?
        const posSpot = new THREE.Vector3();
        spotMainFusil.getWorldPosition(posSpot);
        const posMain = new THREE.Vector3();
        main.getWorldPosition(posMain);
        posSpot.sub(posMain);
        posSpot.add(new THREE.Vector3(-0.7, -0.5, 0));  // Offset pour que la main aie l'air de tenir le fusil
        return posSpot;
    }

    function stickHandToFusil(){
        main.position.add(diffHandToSpot());
    }

    function launchSphere(){
        sphere.position.set(sph_p0.x, sph_p0.y, sph_p0.z);
        sphereMoving = true;
        sphereLaunchTime = temps;
        sphere.visible = true;
    }

    function computeParabola(p0, v0, ground){
        let p = p0;
        let t = 0;
        let res = [];
        while (p.y > ground){
            p = p0;
            p.addScaledVector(v0, t);
            p.addScaledVector(g, t**2 / 2);
            res.push(p.clone());
            t += 0.001;
        }
        return res;
    }
    

    function onWinResize(){
        
    }

    window.addEventListener("resize", onWinResize);
    window.addEventListener("click", ()=>{
        if (raycaster.intersectObject(sphere).length > 0){
            sphere.material.color.set("red");
            sphereMoving = false;
            // alert("Hit !");
        }
    });
    window.addEventListener("keydown", event=>{
        if (event.keyCode==32){   // Espace
            launchSphere();
            console.log(fusil);
        } 
        else if (event.keyCode===13){
            wim = buildWiM(scene);
            wim.position.set(0, 0, -2);
            wim.rotation.x = 0.5;
            scene.add(wim);
            console.log(wim);   
        }
        else if ([37, 38, 39, 40, 68, 81, 83, 90].includes(event.keyCode)){ // A changer
            const depl = 0.01;
            switch (event.keyCode){
                case 37:
                    fusil.position.x -= depl;
                    // sphere.position.x -= depl;
                    break;
                case 38:
                    fusil.position.y += depl;
                    // sphere.position.y += depl;
                    break;
                case 39:
                    fusil.position.x += depl;
                    // sphere.position.x += depl;
                    break;
                case 40:
                    fusil.position.y -= depl;
                    // sphere.position.y -= depl;
                    break;
                case 90:    // Z
                    fusil.rotation.x += depl;
                    break;
                case 81:    // Q
                    fusil.rotation.y += depl;
                    break;
                case 83:    // S
                    fusil.rotation.x -= depl;
                    break;
                case 68:    // D
                    fusil.rotation.y -= depl;
                    break;
            }

        }
        else {
            console.log(event.keyCode);
        }
    });

    
}

export {launch}