function init(){
  var width = 960,
    height = 960,
    radius = 4000,
    mesh,
    graticule,
    scene = new THREE.Scene,
    camera = new THREE.PerspectiveCamera(70, width / height, 1, 15000),
    renderer = new THREE.WebGLRenderer({alpha: true});
    control = new THREE.TrackballControls(camera),
    clock = new THREE.Clock();
    camera.position.x = 100;
    camera.position.y = 100;
    camera.position.z = 300;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  //add graticule
  scene.add(graticule = wireframe(graticule10(), new THREE.LineBasicMaterial({color: 0xaaaaaa})));

  //parse data
  var starsData = d3.csv("https://gist.githubusercontent.com/elPaleniozord/433b888e3ed64da651f18d5c60682c8a/raw/76e8fa3fe6eb6aaf93154927788ecf6fd47e240c/hyg_data.csv", function (data){

    /*DATA FORMAT:
    [0{
    ci: 0.482 - star color index,
    dec: 1.089009 - declination, in deg
    dist: 219.7802 - distance from sun
    mag: 9.100 - magnitude
    proper: "" - name of a star, most likely empty string
    ra: 0.000060 - right ascention, in deg
    spect: "f5" - spectrum
    }]
    */
    var stars = new THREE.Geometry();
    data.map(function(d){
      var star = new THREE.Vector3();
      var lambda = d.ra*Math.PI/180*15,
          phi = d.dec*Math.PI/180,
          cosPhi = Math.cos(phi);
      star.x = radius*cosPhi*Math.cos(lambda);
      star.y = radius*cosPhi*Math.sin(lambda);
      star.z = 4000;


      stars.vertices.push(star);
    })

    var starsMaterial = new THREE.PointsMaterial({color: "blue"});
    var starField = new THREE.Points(stars, starsMaterial);
    scene.add(starField);
  })

  var trackballControls = new THREE.TrackballControls(camera);
  trackballControls.rotateSpeed = 1.0;
  trackballControls.zoomSpeed = 1.0;
  trackballControls.panSpeed = 1.0;
  trackballControls.staticMoving = false;

  trackballControls.noPan=true;


// Converts a point [longitude, latitude] in degrees to a THREE.Vector3.
function vertex(point) {
  //console.log("point", point);
  var lambda = point[0] * Math.PI / 180,
      phi = point[1] * Math.PI / 180,
      cosPhi = Math.cos(phi);
  return new THREE.Vector3(
    radius * cosPhi * Math.cos(lambda),
    radius * cosPhi * Math.sin(lambda),
    radius * Math.sin(phi)
  );
}

// Converts a GeoJSON MultiLineString in spherical coordinates to a THREE.LineSegments.
function wireframe(multilinestring, material) {
  var geometry = new THREE.Geometry;
  multilinestring.coordinates.forEach(function(line) {
    d3.pairs(line.map(vertex), function(a, b) {
      geometry.vertices.push(a, b);
    });
  });
  return new THREE.LineSegments(geometry, material);
}

// See https://github.com/d3/d3-geo/issues/95
function graticule10() {
  var epsilon = 1e-6,
      x1 = 180, x0 = -x1, y1 = 80, y0 = -y1, dx = 10, dy = 10,
      X1 = 180, X0 = -X1, Y1 = 90, Y0 = -Y1, DX = 90, DY = 360,
      x = graticuleX(y0, y1, 1.5), y = graticuleY(x0, x1, 1.5),
      X = graticuleX(Y0, Y1, 1.5), Y = graticuleY(X0, X1, 1.5);

  function graticuleX(y0, y1, dy) {
    var y = d3.range(y0, y1 - epsilon, dy).concat(y1);
    return function(x) { return y.map(function(y) { return [x, y]; }); };
  }

  function graticuleY(x0, x1, dx) {
    var x = d3.range(x0, x1 - epsilon, dx).concat(x1);
    return function(y) { return x.map(function(x) { return [x, y]; }); };
  }

  return {
    type: "MultiLineString",
    coordinates: d3.range(Math.ceil(X0 / DX) * DX, X1, DX).map(X)
        .concat(d3.range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y))
        .concat(d3.range(Math.ceil(x0 / dx) * dx, x1, dx).filter(function(x) { return Math.abs(x % DX) > epsilon; }).map(x))
        .concat(d3.range(Math.ceil(y0 / dy) * dy, y1 + epsilon, dy).filter(function(y) { return Math.abs(y % DY) > epsilon; }).map(y))
  };
}

render();

function render(){
  var delta = clock.getDelta();
  trackballControls.update(delta);

  requestAnimationFrame(render);
  renderer.render(scene, camera);
}
} //init end
window.onload = init;
