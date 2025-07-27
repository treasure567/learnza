import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';

export class ControlsManager {
    constructor(camera, renderer) {
        this.camera = camera;
        this.renderer = renderer;
        this.controls = null;
        this.config = {
            enableDamping: true,
            dampingFactor: 0.05,
            enableZoom: true,
            enablePan: true,
            enableRotate: true,
            autoRotate: false,
            autoRotateSpeed: 0.5,
            minDistance: 1,
            maxDistance: 10,
            minPolarAngle: 0,
            maxPolarAngle: Math.PI,
            minAzimuthAngle: -Infinity,
            maxAzimuthAngle: Infinity,
            target: new THREE.Vector3(0, 1, 0)
        };
        
        this.init();
    }
    
    init() {
        this.setupControls();
        this.setConstraints();
        this.bindEvents();
    }
    
    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        
        this.controls.enableDamping = this.config.enableDamping;
        this.controls.dampingFactor = this.config.dampingFactor;
        this.controls.enableZoom = this.config.enableZoom;
        this.controls.enablePan = this.config.enablePan;
        this.controls.enableRotate = this.config.enableRotate;
        this.controls.autoRotate = this.config.autoRotate;
        this.controls.autoRotateSpeed = this.config.autoRotateSpeed;
        
        this.controls.target.copy(this.config.target);
    }
    
    setConstraints() {
        this.controls.minDistance = this.config.minDistance;
        this.controls.maxDistance = this.config.maxDistance;
        this.controls.minPolarAngle = this.config.minPolarAngle;
        this.controls.maxPolarAngle = this.config.maxPolarAngle;
        this.controls.minAzimuthAngle = this.config.minAzimuthAngle;
        this.controls.maxAzimuthAngle = this.config.maxAzimuthAngle;
    }
    
    bindEvents() {
        this.controls.addEventListener('change', () => {
            this.onControlChange();
        });
        
        this.controls.addEventListener('start', () => {
            this.onControlStart();
        });
        
        this.controls.addEventListener('end', () => {
            this.onControlEnd();
        });
    }
    
    onControlChange() {
        
    }
    
    onControlStart() {
        
    }
    
    onControlEnd() {
        
    }
    
    update() {
        if (this.controls && this.controls.enabled) {
            this.controls.update();
        }
    }
    
    reset() {
        if (this.controls) {
            this.controls.reset();
        }
    }
    
    setTarget(x, y, z) {
        if (this.controls) {
            this.controls.target.set(x, y, z);
            this.controls.update();
            this.config.target.set(x, y, z);
        }
    }
    
    setAutoRotate(enabled) {
        if (this.controls) {
            this.controls.autoRotate = enabled;
            this.config.autoRotate = enabled;
        }
    }
    
    setAutoRotateSpeed(speed) {
        if (this.controls) {
            this.controls.autoRotateSpeed = speed;
            this.config.autoRotateSpeed = speed;
        }
    }
    
    setDampingFactor(factor) {
        if (this.controls) {
            this.controls.dampingFactor = factor;
            this.config.dampingFactor = factor;
        }
    }
    
    enableDamping(enabled) {
        if (this.controls) {
            this.controls.enableDamping = enabled;
            this.config.enableDamping = enabled;
        }
    }
    
    enableZoom(enabled) {
        if (this.controls) {
            this.controls.enableZoom = enabled;
            this.config.enableZoom = enabled;
        }
    }
    
    enablePan(enabled) {
        if (this.controls) {
            this.controls.enablePan = enabled;
            this.config.enablePan = enabled;
        }
    }
    
    enableRotate(enabled) {
        if (this.controls) {
            this.controls.enableRotate = enabled;
            this.config.enableRotate = enabled;
        }
    }
    
    setMinDistance(distance) {
        if (this.controls) {
            this.controls.minDistance = distance;
            this.config.minDistance = distance;
        }
    }
    
    setMaxDistance(distance) {
        if (this.controls) {
            this.controls.maxDistance = distance;
            this.config.maxDistance = distance;
        }
    }
    
    focusOnModel(boundingBox) {
        if (!this.controls || !boundingBox) return;
        
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const distance = maxDim / (2 * Math.tan(Math.PI * this.camera.fov / 360));
        
        this.camera.position.copy(center);
        this.camera.position.z += distance * 1.5;
        this.camera.position.y += size.y * 0.2;
        
        this.setTarget(center.x, center.y, center.z);
    }
    
    getControls() {
        return this.controls;
    }
    
    getConfig() {
        return this.config;
    }
    
    dispose() {
        if (this.controls) {
            this.controls.dispose();
        }
    }
} 