import * as THREE from 'three';

export class LightingManager {
    constructor(scene) {
        this.scene = scene;
        this.lights = {};
        this.config = {
            hemisphere: {
                skyColor: 0xffffff,
                groundColor: 0x444444,
                intensity: 0.8
            },
            directional: {
                color: 0xffffff,
                intensity: 1.2,
                position: { x: 5, y: 10, z: 5 },
                castShadow: true,
                shadowMapSize: 2048,
                shadowNear: 0.1,
                shadowFar: 50,
                shadowTop: 10,
                shadowBottom: -10,
                shadowLeft: -10,
                shadowRight: 10
            },
            ambient: {
                color: 0xffffff,
                intensity: 0.3
            }
        };
        
        this.init();
    }
    
    init() {
        this.createHemisphereLight();
        this.createDirectionalLight();
        this.createAmbientLight();
    }
    
    createHemisphereLight() {
        const { skyColor, groundColor, intensity } = this.config.hemisphere;
        
        this.lights.hemisphere = new THREE.HemisphereLight(
            skyColor,
            groundColor,
            intensity
        );
        this.lights.hemisphere.position.set(0, 20, 0);
        this.scene.add(this.lights.hemisphere);
    }
    
    createDirectionalLight() {
        const { 
            color, 
            intensity, 
            position, 
            castShadow, 
            shadowMapSize,
            shadowNear,
            shadowFar,
            shadowTop,
            shadowBottom,
            shadowLeft,
            shadowRight
        } = this.config.directional;
        
        this.lights.directional = new THREE.DirectionalLight(color, intensity);
        this.lights.directional.position.set(position.x, position.y, position.z);
        this.lights.directional.castShadow = castShadow;
        
        if (castShadow) {
            this.lights.directional.shadow.mapSize.width = shadowMapSize;
            this.lights.directional.shadow.mapSize.height = shadowMapSize;
            
            this.lights.directional.shadow.camera.near = shadowNear;
            this.lights.directional.shadow.camera.far = shadowFar;
            this.lights.directional.shadow.camera.top = shadowTop;
            this.lights.directional.shadow.camera.bottom = shadowBottom;
            this.lights.directional.shadow.camera.left = shadowLeft;
            this.lights.directional.shadow.camera.right = shadowRight;
            
            this.lights.directional.shadow.bias = -0.0001;
            this.lights.directional.shadow.normalBias = 0.02;
        }
        
        this.scene.add(this.lights.directional);
        
        if (this.lights.directional.target) {
            this.lights.directional.target.position.set(0, 1, 0);
            this.scene.add(this.lights.directional.target);
        }
    }
    
    createAmbientLight() {
        const { color, intensity } = this.config.ambient;
        
        this.lights.ambient = new THREE.AmbientLight(color, intensity);
        this.scene.add(this.lights.ambient);
    }
    
    updateHemisphereLightIntensity(intensity) {
        if (this.lights.hemisphere) {
            this.lights.hemisphere.intensity = intensity;
            this.config.hemisphere.intensity = intensity;
        }
    }
    
    updateDirectionalLightIntensity(intensity) {
        if (this.lights.directional) {
            this.lights.directional.intensity = intensity;
            this.config.directional.intensity = intensity;
        }
    }
    
    updateAmbientLightIntensity(intensity) {
        if (this.lights.ambient) {
            this.lights.ambient.intensity = intensity;
            this.config.ambient.intensity = intensity;
        }
    }
    
    updateDirectionalLightPosition(x, y, z) {
        if (this.lights.directional) {
            this.lights.directional.position.set(x, y, z);
            this.config.directional.position = { x, y, z };
        }
    }
    
    toggleShadows(enabled) {
        if (this.lights.directional) {
            this.lights.directional.castShadow = enabled;
            this.config.directional.castShadow = enabled;
        }
    }
    
    getLights() {
        return this.lights;
    }
    
    getConfig() {
        return this.config;
    }
} 