var coords;
var test = 0;

//console.log(scene);
//get lat/long coordinates
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(p){
          realtime = true;
          coords = p.coords;
          var skyCenter = new THREE.Vector3(0,12000,0);
          setTimeout(function(){
            scene.getObjectByName("galaxy").quaternion.setFromUnitVectors(computeZenith().normalize(), skyCenter.clone().normalize());
          }, 5000);


        });
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}
function computeZenith() {

  var lat = coords.latitude,
      long = coords.longitude;

  var now = new Date().getTime()/1000/60/60/24 //days,
      jd = (now-30*365.2425), //days since 2000 january 1
      ut = new Date().getUTCHours() + new Date().getUTCMinutes()/100;

    var lst = (100.4606184 + 0.9856473662862 * jd + long + 15 * ut+test)%360; //d-number of days since j2000 epoch, long-longitude, ut - universal time
    var zenith = vertex([lst, lat]); //translate

    scene.getObjectByName("zenith").position.x = zenith.x;
    scene.getObjectByName("zenith").position.y = zenith.y;
    scene.getObjectByName("zenith").position.z = zenith.z-1000;

    //rotateSphere(lst, lat);
    //test+=0.25;
    return zenith;
//6977.505643669164, y: -3537.6415427577203, z: 9099.423460171516 = Alkaid
    //camera.lookAt(zenith);
}

//translate geocoordinates to zeniths declination and right ascension
//var jd =  //julian date epoch
//var declination = position.coords.latitude;
//var sidereal = 0;
function rotateSphere(long, lat){
  var compass = DeviceOrientationEvent.webkitCompassHeading;
  console.log(compass);
  scene.rotation.z = compass;

  //rotate to zenith location
  var c = scene.rotation.y;
  var d = -long * (Math.PI / 180)%(2 * Math.PI);
  var e = Math.PI / 2 * -1;
  scene.rotation.y = c % (2 * Math.PI);
  scene.rotation.x = lat * (Math.PI / 180) % Math.PI;
  scene.rotation.z = 360-(d+e);
}
