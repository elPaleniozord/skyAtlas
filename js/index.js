var scene = new THREE.Scene();
    sceneLvl1 = new THREE.Scene(),
    sceneLvl2 = new THREE.Scene(),
    sceneLvl3 = new THREE.Scene(),
    lvl = 1;


//controls
var minMag = 21,
    mouse = {x: 0, y: 0},
    INTERSECTED,
    starDatabase=[],
    width = window.innerWidth,
    height = window.innerHeight,
    detailedView = false,
    radius = 12000,
    camera = new THREE.PerspectiveCamera(70, width/10 / (height/10), 1, 100000);

//parse data
queue()
  .defer(d3.csv, "https://gist.githubusercontent.com/elPaleniozord/5d96f2f5cce92366b06bea32a2625d2e/raw/8504f231ea5ee5fdef47371232c8c55256b8f045/hyg_data_sortMag.csv", function(d){
    starDatabase.push(d);
  })
  .defer(d3.json, "https://gist.githubusercontent.com/elPaleniozord/bb775473088f3f60c5f3ca1afeb88a82/raw/68dbc32a363d380cf9e7e57d53794c24bce4348b/bounds.json")
  .defer(d3.json, "https://gist.githubusercontent.com/elPaleniozord/ed1dd65a955c2c7e1bb6cbc30feb523f/raw/9dd2837035dde1554f20157be681d71d54a26c58/lines.json")
  .await(makeGalaxy);

function init(){
  //THREE.js declarations
  var renderer = new THREE.WebGLRenderer({alpha: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  document.getElementById('WebGL-Output').appendChild(renderer.domElement);

  var clock = new THREE.Clock;

  camera.position.set(-4000,-6000,5000);
  //TrackballControls
  var trackballControls = new THREE.TrackballControls(camera,renderer.domElement);
  trackballControls.rotateSpeed = 0.2;
  trackballControls.zoomSpeed = 1.0;
  trackballControls.panSpeed = 0.2;
  trackballControls.staticMoving = false;
  trackballControls.noPan=true;

  //GUI CONTROLS
  var gui = new dat.GUI();
  var controls = {
    toggleLabels: function(){
      scene.traverse(function(child){
        if (child.type == 'Sprite'){
          child.visible = !child.visible;
        }
      })
    },

    toggleLines: function(){
      scene.traverse(function(child){
        if (child.type == 'Line'){

          child.visible = !child.visible;
        }
      })
    },

    toggleStars: function(){
      scene.traverse(function(child){
        if (child.type == 'Points'){

          child.visible = !child.visible;
        }
      })
    },

    filterStars: minMag
  };

  gui.add(controls, 'toggleLabels');
  gui.add(controls, 'toggleLines');
  gui.add(controls, 'toggleStars');
  gui.add(controls, "filterStars", 0, 120000, 1)
    .onChange( function( value ) {
	     scene.traverse(function(child){
         if (child.type == 'Points'){
           child.geometry.setDrawRange(0, value);
         }
       })
	  });

  render();
  //RENDERING FUNCTION
  function render(){
    //chose scene to render
    scene = window["sceneLvl"+lvl];

    var delta = clock.getDelta();
    trackballControls.update(delta);

    checkHighlight();

    requestAnimationFrame(render);
    renderer.render(scene, camera);
  } //render end
}//init end


//event listeners
var start = {x: 0, y: 0};
var end = {x:0, y:0};

document.addEventListener('mousemove', onDocumentMouseMove, false);
document.addEventListener('click', onDocumentMouseClick);
document.addEventListener('mousedown', ()=>start = {x: mouse.x, y: mouse.y});
document.addEventListener('mouseup', ()=>end = {x: mouse.x, y: mouse.y});
document.getElementById('return').addEventListener('click', goBack);

window.onload = init;

function onDocumentMouseMove(event){
  // the following line would stop any other event handler from firing
  // (such as the mouse's TrackballControls)
  //event.preventDefault();

  // update the mouse variable
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onDocumentMouseClick(event){
  //prevent function execution if dragging
  if (start.x == end.x && start.y == end.y){
    //if lvl2 scene is rendered create scene lvl3
    if(lvl == 2){
      lvl = 3;
      console.log(INTERSECTED);
      makeObject(INTERSECTED);
    }
    //otherwise create lvl2 scene
    else{
      console.log("making constellation")
      lvl = 2;
      makeConstellation();
    }
  }
}
