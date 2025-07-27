import * as THREE from 'three';
import { SceneManager } from './scene.js';
import { LightingManager } from './lights.js';
import { ControlsManager } from './controls.js';
import { ModelLoader } from './modelLoader.js';
import { AnimationManager } from './animations.js';
import { ProceduralAnimationManager } from './proceduralAnimations.js';
import { GUIManager } from './gui.js';

class App {
    constructor() {
        this.container = null;
        this.sceneManager = null;
        this.lightingManager = null;
        this.controlsManager = null;
        this.modelLoader = null;
        this.animationManager = null;
        this.guiManager = null;
        
        this.clock = new THREE.Clock();
        this.isRunning = false;
        this.isModelLoaded = false;
        
        this.init();
    }
    
    async init() {
        try {
            this.setupContainer();
            this.initializeManagers();
            this.setupGUI();
            this.setupEventListeners();
            this.hideLoadingScreen();
            this.start();
            
            await this.loadModel();
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Failed to initialize 3D viewer');
        }
    }
    
    setupContainer() {
        this.container = document.getElementById('canvas-container');
        if (!this.container) {
            throw new Error('Canvas container not found');
        }
    }
    
    initializeManagers() {
        this.sceneManager = new SceneManager(this.container);
        
        this.lightingManager = new LightingManager(
            this.sceneManager.getScene()
        );
        
        this.controlsManager = new ControlsManager(
            this.sceneManager.getCamera(),
            this.sceneManager.getRenderer()
        );
        
        this.modelLoader = new ModelLoader(
            this.sceneManager.getScene()
        );
        
        this.guiManager = new GUIManager();
    }
    
    setupGUI() {
        this.guiManager.setCallback('onWaveSpeedChange', (value) => {
            if (this.animationManager) {
                this.animationManager.setWaveSpeed(value);
            }
        });
        
        this.guiManager.setCallback('onWaveIntensityChange', (value) => {
            if (this.animationManager) {
                this.animationManager.setWaveIntensity(value);
            }
        });
        
        this.guiManager.setCallback('onWaveDurationChange', (value) => {
            if (this.animationManager) {
                this.animationManager.setWaveDuration(value);
            }
        });
        
        this.guiManager.setCallback('onShirtColorChange', (color) => {
            if (this.modelLoader) {
                this.modelLoader.updateShirtColor(color);
            }
        });
        
        this.guiManager.setCallback('onBackgroundColorChange', (color) => {
            if (this.sceneManager) {
                this.sceneManager.updateBackground(color);
            }
        });
        
        this.guiManager.setCallback('onWireframeToggle', (enabled) => {
            if (this.modelLoader) {
                this.modelLoader.setWireframe(enabled);
            }
        });
        
        this.guiManager.setCallback('onHemisphereLightChange', (intensity) => {
            if (this.lightingManager) {
                this.lightingManager.updateHemisphereLightIntensity(intensity);
            }
        });
        
        this.guiManager.setCallback('onDirectionalLightChange', (intensity) => {
            if (this.lightingManager) {
                this.lightingManager.updateDirectionalLightIntensity(intensity);
            }
        });
        
        this.guiManager.setCallback('onAmbientLightChange', (intensity) => {
            if (this.lightingManager) {
                this.lightingManager.updateAmbientLightIntensity(intensity);
            }
        });
        
        this.guiManager.setCallback('onShadowsToggle', (enabled) => {
            if (this.lightingManager) {
                this.lightingManager.toggleShadows(enabled);
            }
        });
        
        this.guiManager.setCallback('onAutoRotateToggle', (enabled) => {
            if (this.controlsManager) {
                this.controlsManager.setAutoRotate(enabled);
            }
        });
        
        this.guiManager.setCallback('onAutoRotateSpeedChange', (speed) => {
            if (this.controlsManager) {
                this.controlsManager.setAutoRotateSpeed(speed);
            }
        });
        
        this.guiManager.setCallback('onDampingFactorChange', (factor) => {
            if (this.controlsManager) {
                this.controlsManager.setDampingFactor(factor);
            }
        });
        
        this.guiManager.setCallback('onResetAnimation', () => {
            if (this.animationManager) {
                this.animationManager.resetToIdle();
            }
        });
        
        this.guiManager.setCallback('onResetCamera', () => {
            if (this.controlsManager) {
                this.controlsManager.reset();
            }
        });
    }
    
    setupEventListeners() {
        const waveButton = document.getElementById('wave-button');
        if (waveButton) {
            waveButton.addEventListener('click', () => {
                this.triggerWaveAnimation();
            });
        }
        
        const fullbodyButton = document.getElementById('fullbody-button');
        if (fullbodyButton) {
            fullbodyButton.addEventListener('click', () => {
                this.triggerFullBodyWave();
            });
        }
        
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW':
                    this.triggerWaveAnimation();
                    break;
                case 'KeyF':
                    if (this.animationType === 'procedural' && this.animationManager) {
                        this.animationManager.playFullBodyWave();
                    }
                    break;
                case 'KeyR':
                    if (this.animationManager) {
                        if (this.animationType === 'procedural') {
                            this.animationManager.resetToOriginal();
                        } else {
                            this.animationManager.resetToIdle();
                        }
                    }
                    break;
                case 'KeyG':
                    this.guiManager.toggle();
                    break;
            }
        });
        
        window.addEventListener('beforeunload', () => {
            this.dispose();
        });
    }
    
    async loadModel() {
        const modelPath = './assets/models/real.glb';
        
        this.modelLoader.onLoadProgress = (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            this.updateLoadingText(`Loading Model... ${percent}%`);
        };
        
        this.modelLoader.onLoadComplete = (gltf) => {
            console.log('Model loaded successfully');
            this.onModelLoaded();
        };
        
        this.modelLoader.onLoadError = (error) => {
            console.error('Model loading failed:', error);
            this.showError('Failed to load 3D model. Please check if the model file exists.');
            this.createFallbackModel();
        };
        
        try {
            await this.modelLoader.loadModel(modelPath);
        } catch (error) {
            console.error('Error loading model:', error);
            this.createFallbackModel();
        }
    }
    
    onModelLoaded() {
        this.isModelLoaded = true;
        
        this.setupAnimationSystem();
        this.modelLoader.createLearnzaTexture();
        
        if (this.controlsManager && this.modelLoader.getBoundingBox()) {
            this.controlsManager.focusOnModel(this.modelLoader.getBoundingBox());
        }
        
        this.hideLoadingScreen();
        this.enableWaveButton();
    }
    
    setupAnimationSystem() {
        const model = this.modelLoader.getModel();
        const mixer = this.modelLoader.getMixer();
        
        let hasValidBones = false;
        
        model.traverse((child) => {
            if (child.isSkinnedMesh && child.skeleton && child.skeleton.bones.length > 0) {
                hasValidBones = true;
            }
        });
        
        if (hasValidBones) {
            console.log('✅ Using skeletal animation system (model has bones)');
            this.animationManager = new AnimationManager(model, mixer);
            this.animationType = 'skeletal';
            this.hideFullBodyButton();
        } else {
            console.log('🎭 Using procedural animation system (no bones found)');
            this.animationManager = new ProceduralAnimationManager(model);
            this.animationType = 'procedural';
            this.showFullBodyButton();
        }
    }
    
    createFallbackModel() {
        console.log('Creating fallback model...');
        
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 1.8, 8);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const fallbackModel = new THREE.Mesh(geometry, material);
        fallbackModel.position.set(0, 0.9, 0);
        fallbackModel.castShadow = true;
        fallbackModel.receiveShadow = true;
        
        this.sceneManager.add(fallbackModel);
        
        const textGeometry = new THREE.PlaneGeometry(1, 0.3);
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Learnza', canvas.width / 2, canvas.height / 2);
        
        const textTexture = new THREE.CanvasTexture(canvas);
        const textMaterial = new THREE.MeshBasicMaterial({ map: textTexture });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(0, 1.2, 0.31);
        
        this.sceneManager.add(textMesh);
        
        this.hideLoadingScreen();
        this.showError('Using fallback model. Please add a proper GLTF model to ./assets/models/');
    }
    
    async triggerWaveAnimation() {
        if (!this.animationManager) {
            console.warn('Animation manager not available');
            return;
        }
        
        const waveButton = document.getElementById('wave-button');
        if (waveButton) {
            waveButton.disabled = true;
            waveButton.textContent = 'Waving...';
        }
        
        try {
            if (this.animationType === 'procedural') {
                console.log('🎭 Triggering procedural wave animation');
                await this.animationManager.playWaveAnimation();
            } else {
                console.log('🦴 Triggering skeletal wave animation');
                await this.animationManager.playWaveAnimation();
            }
        } catch (error) {
            console.error('Wave animation error:', error);
        } finally {
            if (waveButton) {
                waveButton.disabled = false;
                waveButton.textContent = 'Wave Hi';
            }
        }
    }
    
    start() {
        this.isRunning = true;
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    animate() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        
        if (this.controlsManager) {
            this.controlsManager.update();
        }
        
        if (this.animationManager && typeof this.animationManager.update === 'function') {
            this.animationManager.update(deltaTime);
        }
        
        if (this.modelLoader) {
            this.modelLoader.updateMixerTime(deltaTime);
        }
        
        if (this.sceneManager) {
            this.sceneManager.render();
        }
    }
    
    updateLoadingText(text) {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.innerHTML = `<div class="loading-spinner"></div>${text}`;
        }
    }
    
    hideLoadingScreen() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
    
    enableWaveButton() {
        const waveButton = document.getElementById('wave-button');
        if (waveButton) {
            waveButton.disabled = false;
        }
    }
    
    showFullBodyButton() {
        const fullbodyButton = document.getElementById('fullbody-button');
        if (fullbodyButton) {
            fullbodyButton.style.display = 'inline-block';
        }
    }
    
    hideFullBodyButton() {
        const fullbodyButton = document.getElementById('fullbody-button');
        if (fullbodyButton) {
            fullbodyButton.style.display = 'none';
        }
    }
    
    async triggerFullBodyWave() {
        if (!this.animationManager || this.animationType !== 'procedural') {
            console.warn('Full body wave only available with procedural animation');
            return;
        }
        
        const fullbodyButton = document.getElementById('fullbody-button');
        if (fullbodyButton) {
            fullbodyButton.disabled = true;
            fullbodyButton.textContent = 'Waving...';
        }
        
        try {
            console.log('🌊 Triggering full body wave animation');
            await this.animationManager.playFullBodyWave();
        } catch (error) {
            console.error('Full body wave animation error:', error);
        } finally {
            if (fullbodyButton) {
                fullbodyButton.disabled = false;
                fullbodyButton.textContent = 'Full Body Wave';
            }
        }
    }
    
    showError(message) {
        console.error(message);
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.innerHTML = `<div style="color: red;">⚠️ ${message}</div>`;
            loadingElement.style.display = 'block';
        }
    }
    
    dispose() {
        this.stop();
        
        if (this.guiManager) {
            this.guiManager.dispose();
        }
        
        if (this.controlsManager) {
            this.controlsManager.dispose();
        }
        
        if (this.modelLoader) {
            this.modelLoader.dispose();
        }
        
        if (this.animationManager) {
            this.animationManager.dispose();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
}); 