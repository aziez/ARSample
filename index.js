var scene, camera, renderer, clock, deltaTime, totalTime;

var DRAG_NOTICE = document.getElementById('js-drag-notice');


var arToolkitSource, arToolkitContext;

var raycaster, intersects, mouse;

var markerRoot1;

var mesh1;

var model = [];
var theModel;

loaded = false;




initialize();
animate();



function initialize() {

    


    scene = new THREE.Scene();


    //LIGHT
    var directionalLight, ambientLight;
    directionalLight = new THREE.DirectionalLight(0x404040, 2);
    directionalLight.position.set(-10, 50, 10);
    directionalLight.castShadow = true;
    directionalLight.target.position.set(2, 1, 1);
    scene.add(directionalLight);

    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    var dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
    scene.add(dirLight);

//CAMERA
    camera = new THREE.Camera();
    scene.add(camera);

//RENDERER
    renderer = new THREE.WebGLRenderer({antialias: true,alpha: true});
    renderer.setClearColor(new THREE.Color('lightgrey'), 0)
    renderer.setSize(640, 480);
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0px'
    renderer.domElement.style.left = '0px'
    document.body.appendChild(renderer.domElement);


    clock = new THREE.Clock();
    deltaTime = 0;
    totalTime = 0;

    ////////////////////////////////////////////////////////////
    // setup arToolkitSource
    ////////////////////////////////////////////////////////////

    arToolkitSource = new THREEx.ArToolkitSource({
        sourceType: 'webcam',
    });

    function onResize() {
        arToolkitSource.onResize()
        arToolkitSource.copySizeTo(renderer.domElement)
        if (arToolkitContext.arController !== null) {
            arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)
        }
    }

    arToolkitSource.init(function onReady() {
        onResize()
    });

    // handle resize event
    window.addEventListener('resize', function () {
        onResize()
    });

    ////////////////////////////////////////////////////////////
    // setup arToolkitContext
    ////////////////////////////////////////////////////////////	

    // create atToolkitContext
    arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: 'data/camera_para.dat',
        detectionMode: 'mono'
    });

    // copy projection matrix to camera when initialization complete
    arToolkitContext.init(function onCompleted() {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });

    ////////////////////////////////////////////////////////////
    // setup markerRoots
    ////////////////////////////////////////////////////////////

    // build markerControls
    markerRoot1 = new THREE.Group();
    scene.add(markerRoot1);
    let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
        type: 'pattern',
        patternUrl: "data/hiro.patt",
    })

    //PLAN
    var geoFloor = new THREE.PlaneBufferGeometry( 1, 2, 1, 1 );
    var matFloor = new THREE.MeshPhongMaterial({color: "#2d2e2e",
    shininess: 50});

    var mshFloor = new THREE.Mesh( geoFloor, matFloor );
    mshFloor.receiveShadow = true;
    mshFloor.position.z = -0.5;
    markerRoot1.add( mshFloor );

    let geometry1 = new THREE.PlaneBufferGeometry(1, 1, 4, 4);
    // let loader = new THREE.TextureLoader();
    // let texture = loader.load( 'images/earth.jpg', render );
    let material1 = new THREE.MeshBasicMaterial({
        color: 0xfcba03,
        opacity: 0.5
    });
    mesh1 = new THREE.Mesh(geometry1, material1);
    mesh1.rotation.x = -Math.PI / 2;
    markerRoot1.add(mesh1);

    function onProgress(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }

    function onError(xhr) {
        console.log('An error happened');
    }






    new THREE.FBXLoader()
        .load('models/sofa.FBX', function (mesh0) {
            theModel = mesh0;
            theModel.position.y = 0.25;
            theModel.scale.set(0.10, 0.10, 0.10);
            theModel.traverse(function (children) {
                model.push(children);
                if (children.isMesh) {
                    children.castShadow = true;
                    children.reciveShadow = true;
                }
            });
            markerRoot1.add(theModel);
        }, onProgress, onError);
}

raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2();
document.addEventListener('mousedown', onDocumentMouseDown, false);
document.addEventListener('touchstart', onDocumentTouchStart, false);

function onDocumentTouchStart(event) {
    event.preventDefault();
    event.clientX = event.touches[0].clientX;
    event.clientY = event.touches[0].clientY;
    onDocumentMouseDown(event);

}




function onDocumentMouseDown(event) {
    event.preventDefault();
    mouse.x = (event.clientX / renderer.domElement.width) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(model);

    var trans = '0.5'; // 50% transparency
    var color = (Math.random() * 0xf1f1f1);

    if (intersects.length > 0) {

        console.log(intersects[0]);

        intersects[0].object.material.color.setHex(color);

        this.temp = intersects[0].object.material.color.getHexString();

        this.name = intersects[0].object.name;


    }

}



function update() {
    // update artoolkit on every frame
    if (arToolkitSource.ready !== false)
        arToolkitContext.update(arToolkitSource.domElement);
}


function render() {
    renderer.render(scene, camera);
}


function animate() {
    requestAnimationFrame(animate);
    deltaTime = clock.getDelta();
    totalTime += deltaTime;
    update();
    render();

    if (theModel != null && loaded == false) {
        initialRotation();
        DRAG_NOTICE.classList.add('start');
      }
      

//FUNGSI ROTATE
var initRotate = 0;

function initialRotation() {
  initRotate++;
  if (initRotate <= 120) {
    theModel.rotation.y += Math.PI / 60;
  } else {
    loaded = true;
  }
}
}

