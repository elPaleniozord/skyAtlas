import { useLocation } from "./permissions.js"

const defaultSettings = {
  motionControl: (typeof window.orientation !== 'undefined') ? true : false,
  magnitudeFilter: 8.0,
  asterisms: false,
  boundaries: true,
  graticule: true,
  planets: true,
  names: false,
  twinkling: true
}

function getSettings() {
  return caches.has('skyAtlas_settings')
   .then(exists => {
      if(!exists) {
        return defaultSettings
      } else {
        return caches.open('skyAtlas_settings')
      }
    }).then(settings => {
      console.log(settings)
      return settings
    })
    .catch(err => console.log(err))
}

async function Menu() {
  //load styles
  const head = document.getElementsByTagName('head')[0];
  const link = document.createElement('link')
  link.href = 'css/menu.css'
  link.rel = 'stylesheet'
  link.type = 'text/css'
  head.appendChild(link)

  const SETTINGS = window.settings = await getSettings()
  
  //Element Constructors
  const ToggleSwitch = (id, fn) => {
    const label = document.createElement('label')
    label.textContent = id

    const input = document.createElement('input')
    input.type = 'checkbox'
    input.id = id
    input.checked = SETTINGS[id]
    input.addEventListener('change', fn)
    
    label.appendChild(input)
    return label
  }

  //MENU CONTAINER
  const menu = document.getElementById('menu')
  const navList = document.createElement('ul')

  // DISPLAY CONTROL
  //magnitude filter
  const slider = document.createElement('div'),
        inputMag = document.createElement('input')

  inputMag.type = 'range'
  inputMag.value = SETTINGS.magnitudeFilter
  inputMag.min = 0.0
  inputMag.max = 12.0
  inputMag.step = 0.1
  inputMag.orient = 'vertical'

  inputMag.className = 'slider'
  inputMag.addEventListener('input', filterStars)
  slider.appendChild(inputMag)

  navList.appendChild(slider)

  //visuals 
  SETTINGS.entries().forEach()
  navList.appendChild(ToggleSwitch('asterisms', toggleItem))
  navList.appendChild(ToggleSwitch('boundaries', toggleItem))
  navList.appendChild(ToggleSwitch('graticule', toggleItem))
  navList.appendChild(ToggleSwitch('planets', toggleItem))
  navList.appendChild(ToggleSwitch('names', toggleItem))
  navList.appendChild(ToggleSwitch('twinkling', ()=>window.settings.twinkling = !settings.twinkling))
  //
  navList.appendChild(ToggleSwitch('motionControl', switchControls))

  menu.appendChild(navList)

  function filterStars(e, mag) {
    const value = e ? e.target.value : mag
    const idx = Math.floor(value)
    const steps = [0,51,175,521,1616,5018,15450,41137,83112,107927,115505,117903,118735,118735] //magnitude ranges - 0.0, 1.0, 2.0 etc
    const interpolate = Math.round(steps[idx] + (steps[idx+1] - steps[idx]) * (value%1))
    window.scene.traverse(child => {
      if(child.type === 'Points') {
        child.geometry.setDrawRange(0, Math.round(interpolate))
      }
    })
  }

  function toggleItem(e) {
    window.scene.traverse(child => {
      if(child.name === e.target.id) {
        child.visible = !child.visible
      }
    })
  }

  function toggleMenu({clientX, clientY}) {
    menu.style.left = clientX + 'px'
    menu.style.top = clientY + 'px'
    menu.style.transform = 'translate(-50%, -50%)'
    
    menu.classList.toggle('menu--hidden')
  }

  function useGeolocation() {
    useLocation()
  }

  function switchControls() {
    //device orientation controls does not support z axis ('zoom') movement and has to be set to default before
    if(window.controls[1].constructor.name === 'DeviceOrientationControls') {
      window.camera.position.set(0,0,1) //z has to be greater than zero due to prevent gimbal glitch
    }
    
    window.controls.reverse()
    window.controls[0].enabled=true
    window.controls[1].enabled=false
  }

  document.addEventListener('contextmenu', toggleMenu)
}

export default Menu