import * as THREE from 'three' ;
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import getStarfield from './getStarsfield.js';
import { getFresnelMat } from './getGlow.js';
import { asteroidMaker } from './asteroidLayout/asteroidDraw.js' ;
import { asteroidTrajectory } from './asteroidLayout/pathMaker.js' ;
import {CSS2DRenderer , CSS2DObject} from 'three/addons/renderers/CSS2DRenderer.js' ;

const raycaster = new THREE.Raycaster() ;
const mouse = new THREE.Vector2() ;
window.addEventListener("mousemove" , (event)=>{
mouse.x=(event.clientX / window.innerWidth) * 2 - 1 ;
mouse.y=-(event.clientY / window.innerHeight) * 2 + 1}) ;    

const h=window.innerHeight ;
const w=window.innerWidth ;
const scene = new THREE.Scene()  ;
const camera = new THREE.PerspectiveCamera(75 , w / h , 0.1 , 1000) ;
camera.position.z = 5 ;
const renderer = new THREE.WebGLRenderer({antialias : true}) ;
renderer.setSize(window.innerWidth,window.innerHeight) ;
document.body.appendChild(renderer.domElement) ;

let simulationDate = new Date() ;   
const controls=new OrbitControls(camera , renderer.domElement) ;

window.addEventListener("resize" , ()=>{
    camera.aspect = window.innerWidth / window.innerHeight ;
    camera.updateProjectionMatrix() ;
    renderer.setSize(window.innerWidth , window.innerHeight) ;
    labelRenderer.setSize(window.innerWidth , window.innerHeight) ;
});

const tiltedEarth = new THREE.Group() ;
tiltedEarth.rotation.z = -23.4 * Math.PI / 180 ;
scene.add(tiltedEarth) ;

const loader= new THREE.TextureLoader()
const geometry = new THREE.IcosahedronGeometry(1 , 12 ) ;
const material = new THREE.MeshStandardMaterial({
    map : loader.load("/images/earthmap1k.jpg"),
}) ;//standard interacts with light

const ourEarth = new THREE.Mesh(geometry , material) ; //mesh would be container for geometry and material
tiltedEarth.add(ourEarth) ;

const stars= getStarfield({numStars : 2000}) ;
scene.add(stars) ;

const nightMaterial = new THREE.MeshBasicMaterial({
    map:loader.load("/images/earthnightmap1k.jpg") ,
    blending : THREE.AdditiveBlending ,
    transparent : true,
    opacity: 0.8
});
const nightEarth = new THREE.Mesh(geometry , nightMaterial) ;
nightEarth.scale.set(1.003 , 1.003 , 1.003) ; //to avoid z fighting
tiltedEarth.add(nightEarth) ;

const cloudMat=new THREE.MeshStandardMaterial({
    map :loader.load("/images/2k_earth_clouds.jpg"),
    transparent : true ,
    opacity : 0.8 ,
    blending : THREE.AdditiveBlending ,})
const cloudMesh = new THREE.Mesh(geometry , cloudMat) ;
cloudMesh.scale.set(1.02 , 1.02  , 1.02) ;
tiltedEarth.add(cloudMesh) ;   

const glow = getFresnelMat()
const glowMesh = new THREE.Mesh(geometry , glow) ;
glowMesh.scale.set(1.05 , 1.05 , 1.05) ;
tiltedEarth.add(glowMesh) ;

const sunLight= new THREE.DirectionalLight(0xffffff , 1) ; //problem with lighting of earth , reduce intensity
sunLight.position.set(-2,0.5,1.5) ;
scene.add(sunLight) ;

const moonlight = new THREE.DirectionalLight(0xffffff , 0.05) ;
moonlight.position.set(2,0.5,-1.5) ;
scene.add(moonlight) ;  

let asteroids = [] ;
let activeAsteroids=[] ;
const labelRenderer = new CSS2DRenderer() ;
labelRenderer.setSize(window.innerWidth , window.innerHeight) ;
labelRenderer.domElement.style.position = "absolute" ;
labelRenderer.domElement.style.top = "0px" ;
labelRenderer.domElement.style.pointerEvents = "none" ;
document.body.appendChild(labelRenderer.domElement) ;
//adding asteriods to our scene
let queue ;
async function addAsteroids(){
const data = await fetch("neededData.json").then(res=>res.json()) ;
data.sort((a,b)=>{
    return new Date(a.dateClosest) - new Date(b.dateClosest) ;
})

 queue= data;
function spwanAsteroids(){
    const max_asteroids=4 ;
    if(queue.length == 0) return ;
    if(activeAsteroids.length >= max_asteroids) return ;
    const asteroid = queue.shift() ;
    const asteroidMesh = asteroidMaker(asteroid.diameter) ;
    asteroidMesh.scale.setScalar(0.2)
    asteroidMesh.userData=asteroid ;
    const trajectory = asteroidTrajectory(asteroid.distance) ;
    asteroidMesh.position.copy(trajectory.getPoint(0)) ;
    const div = document.createElement("div") ;
    div.className = "label" ;
    div.textContent = asteroid.name ;
    const label = new CSS2DObject(div) ;
    label.position.set(0 , 1.5 , 0) ;
    
    asteroidMesh.add(label) ;
    scene.add(asteroidMesh) ;

    activeAsteroids.push({
        mesh: asteroidMesh ,
        Curve:trajectory ,
        speed : 0.0005 ,
        progress :0
    })
   
}
setInterval(spwanAsteroids , 5000) ;}
addAsteroids() ;

function animate(time) {
    console.log(activeAsteroids.length);
    simulationDate.setHours(simulationDate.getHours()+1);
    requestAnimationFrame(animate) ;
    controls.update() ;
    ourEarth.rotation.y +=0.002 ;
    nightEarth.rotation.y+=0.002 ;
    cloudMesh.rotation.y+=0.002 ;
    stars.rotation.y+=0.0005 ;  
    
    activeAsteroids.forEach(asteroid=>{
        console.log(asteroid.mesh.position
        );
        const slowdown=0.5 + Math.abs(asteroid.progress - 0.5) ;
        asteroid.progress += asteroid.speed * slowdown ;
        if(asteroid.progress > 1) {queue.push(asteroid.userData);
        scene.remove(asteroid.mesh) ;
        activeAsteroids=activeAsteroids.filter(a=>a!==asteroid) ;
                } ;
        const pointOnCurve = asteroid.Curve.getPoint(asteroid.progress) ;
        asteroid.mesh.position.copy(pointOnCurve) ;
    });   
    raycaster.setFromCamera(mouse , camera) ;
    const intersects = raycaster.intersectObjects(activeAsteroids.map(a=>a.mesh));
    if(intersects.length > 0){
            const ast = intersects[0].object ;
            const data=ast.userData ;
            const labelDiv = ast.children[0].element ;
            
            labelDiv.innerHTML= `<strong><span class="name">Name:${data.name}</span><br>
            <span class="distance">Closest-distance:${data.distance}</span><br>
            <span class="date">Closest Date:${data.dateClosest}</span> <br>
            <span class="hazardous">Hazardous:${data.hazardous}</span></strong> ;`
        }
     else{
         activeAsteroids.forEach(asteroid=>{
         const labelDiv = asteroid.mesh.children[0].element ;
         labelDiv.textContent = asteroid.mesh.userData.name ; }    )
         }       


    
    renderer.render(scene , camera) ;
    labelRenderer.render(scene , camera) ;
}

animate() ;