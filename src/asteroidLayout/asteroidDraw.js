import * as THREE from 'three'  ;
const loader = new THREE.TextureLoader() ;
export function asteroidMaker(diameter){
    const geometry = new THREE.IcosahedronGeometry((diameter/20000, 1)) ;
    const material = new THREE.MeshStandardMaterial({
        map : loader.load("/images/4k_eris_fictional.jpg"),
        roughness : 1 ,
        metalness:0
    }) ;
    
    const ourAsteroid = new THREE.Mesh(geometry , material) ; 
    return ourAsteroid ;
    }
         
   

