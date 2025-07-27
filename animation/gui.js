import { GUI } from 'dat.gui';

export class GUIManager {
    constructor() {
        this.gui = new GUI({ autoPlace: false });
        this.controls = {};
        this.folders = {};
        this.config = {
            animation: {
                waveSpeed: 1.0,
                waveIntensity: 1.0,
                waveDuration: 3.0
            },
            appearance: {
                shirtColor: '#000000',
                backgroundColor: '#f0f0f0',
                wireframe: false
            },
            lighting: {
                hemisphereIntensity: 0.8,
                directionalIntensity: 1.2,
                ambientIntensity: 0.3,
                shadows: true
            },
            camera: {
                autoRotate: false,
                autoRotateSpeed: 0.5,
                dampingFactor: 0.05
            }
        };
        
        this.callbacks = {
            onWaveSpeedChange: null,
            onWaveIntensityChange: null,
            onWaveDurationChange: null,
            onShirtColorChange: null,
            onBackgroundColorChange: null,
            onWireframeToggle: null,
            onHemisphereLightChange: null,
            onDirectionalLightChange: null,
            onAmbientLightChange: null,
            onShadowsToggle: null,
            onAutoRotateToggle: null,
            onAutoRotateSpeedChange: null,
            onDampingFactorChange: null,
            onResetAnimation: null,
            onResetCamera: null
        };
        
        this.init();
    }
    
    init() {
        this.setupContainer();
        this.createAnimationControls();
        this.createAppearanceControls();
        this.createLightingControls();
        this.createCameraControls();
        this.createActionControls();
        this.styleGUI();
    }
    
    setupContainer() {
        const container = document.getElementById('gui-container');
        if (container) {
            container.appendChild(this.gui.domElement);
        } else {
            document.body.appendChild(this.gui.domElement);
        }
    }
    
    createAnimationControls() {
        this.folders.animation = this.gui.addFolder('Animation');
        
        this.controls.waveSpeed = this.folders.animation
            .add(this.config.animation, 'waveSpeed', 0.1, 3.0, 0.1)
            .name('Wave Speed')
            .onChange((value) => {
                if (this.callbacks.onWaveSpeedChange) {
                    this.callbacks.onWaveSpeedChange(value);
                }
            });
            
        this.controls.waveIntensity = this.folders.animation
            .add(this.config.animation, 'waveIntensity', 0.1, 2.0, 0.1)
            .name('Wave Intensity')
            .onChange((value) => {
                if (this.callbacks.onWaveIntensityChange) {
                    this.callbacks.onWaveIntensityChange(value);
                }
            });
            
        this.controls.waveDuration = this.folders.animation
            .add(this.config.animation, 'waveDuration', 1.0, 10.0, 0.5)
            .name('Wave Duration')
            .onChange((value) => {
                if (this.callbacks.onWaveDurationChange) {
                    this.callbacks.onWaveDurationChange(value);
                }
            });
        
        this.folders.animation.open();
    }
    
    createAppearanceControls() {
        this.folders.appearance = this.gui.addFolder('Appearance');
        
        this.controls.shirtColor = this.folders.appearance
            .addColor(this.config.appearance, 'shirtColor')
            .name('Shirt Color')
            .onChange((value) => {
                if (this.callbacks.onShirtColorChange) {
                    const hexColor = value.replace('#', '0x');
                    this.callbacks.onShirtColorChange(parseInt(hexColor, 16));
                }
            });
            
        this.controls.backgroundColor = this.folders.appearance
            .addColor(this.config.appearance, 'backgroundColor')
            .name('Background Color')
            .onChange((value) => {
                if (this.callbacks.onBackgroundColorChange) {
                    const hexColor = value.replace('#', '0x');
                    this.callbacks.onBackgroundColorChange(parseInt(hexColor, 16));
                }
            });
            
        this.controls.wireframe = this.folders.appearance
            .add(this.config.appearance, 'wireframe')
            .name('Wireframe')
            .onChange((value) => {
                if (this.callbacks.onWireframeToggle) {
                    this.callbacks.onWireframeToggle(value);
                }
            });
        
        this.folders.appearance.open();
    }
    
    createLightingControls() {
        this.folders.lighting = this.gui.addFolder('Lighting');
        
        this.controls.hemisphereIntensity = this.folders.lighting
            .add(this.config.lighting, 'hemisphereIntensity', 0, 2.0, 0.1)
            .name('Hemisphere Light')
            .onChange((value) => {
                if (this.callbacks.onHemisphereLightChange) {
                    this.callbacks.onHemisphereLightChange(value);
                }
            });
            
        this.controls.directionalIntensity = this.folders.lighting
            .add(this.config.lighting, 'directionalIntensity', 0, 3.0, 0.1)
            .name('Directional Light')
            .onChange((value) => {
                if (this.callbacks.onDirectionalLightChange) {
                    this.callbacks.onDirectionalLightChange(value);
                }
            });
            
        this.controls.ambientIntensity = this.folders.lighting
            .add(this.config.lighting, 'ambientIntensity', 0, 1.0, 0.05)
            .name('Ambient Light')
            .onChange((value) => {
                if (this.callbacks.onAmbientLightChange) {
                    this.callbacks.onAmbientLightChange(value);
                }
            });
            
        this.controls.shadows = this.folders.lighting
            .add(this.config.lighting, 'shadows')
            .name('Shadows')
            .onChange((value) => {
                if (this.callbacks.onShadowsToggle) {
                    this.callbacks.onShadowsToggle(value);
                }
            });
    }
    
    createCameraControls() {
        this.folders.camera = this.gui.addFolder('Camera');
        
        this.controls.autoRotate = this.folders.camera
            .add(this.config.camera, 'autoRotate')
            .name('Auto Rotate')
            .onChange((value) => {
                if (this.callbacks.onAutoRotateToggle) {
                    this.callbacks.onAutoRotateToggle(value);
                }
            });
            
        this.controls.autoRotateSpeed = this.folders.camera
            .add(this.config.camera, 'autoRotateSpeed', -2.0, 2.0, 0.1)
            .name('Rotate Speed')
            .onChange((value) => {
                if (this.callbacks.onAutoRotateSpeedChange) {
                    this.callbacks.onAutoRotateSpeedChange(value);
                }
            });
            
        this.controls.dampingFactor = this.folders.camera
            .add(this.config.camera, 'dampingFactor', 0.01, 0.2, 0.01)
            .name('Damping Factor')
            .onChange((value) => {
                if (this.callbacks.onDampingFactorChange) {
                    this.callbacks.onDampingFactorChange(value);
                }
            });
    }
    
    createActionControls() {
        this.folders.actions = this.gui.addFolder('Actions');
        
        this.controls.resetAnimation = this.folders.actions
            .add({ resetAnimation: () => {
                if (this.callbacks.onResetAnimation) {
                    this.callbacks.onResetAnimation();
                }
            }}, 'resetAnimation')
            .name('Reset Animation');
            
        this.controls.resetCamera = this.folders.actions
            .add({ resetCamera: () => {
                if (this.callbacks.onResetCamera) {
                    this.callbacks.onResetCamera();
                }
            }}, 'resetCamera')
            .name('Reset Camera');
    }
    
    styleGUI() {
        this.gui.domElement.style.position = 'absolute';
        this.gui.domElement.style.top = '0px';
        this.gui.domElement.style.right = '0px';
        this.gui.domElement.style.zIndex = '100';
        this.gui.domElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.gui.domElement.style.color = '#ffffff';
        this.gui.domElement.style.fontSize = '12px';
        this.gui.domElement.style.fontFamily = 'Arial, sans-serif';
    }
    
    setCallback(callbackName, callback) {
        if (this.callbacks.hasOwnProperty(callbackName)) {
            this.callbacks[callbackName] = callback;
        } else {
            console.warn(`Unknown callback: ${callbackName}`);
        }
    }
    
    updateValue(controlName, value) {
        if (this.controls[controlName]) {
            this.controls[controlName].setValue(value);
        }
    }
    
    show() {
        this.gui.domElement.style.display = 'block';
    }
    
    hide() {
        this.gui.domElement.style.display = 'none';
    }
    
    toggle() {
        const isVisible = this.gui.domElement.style.display !== 'none';
        if (isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    openAllFolders() {
        Object.values(this.folders).forEach(folder => {
            if (folder && folder.open) {
                folder.open();
            }
        });
    }
    
    closeAllFolders() {
        Object.values(this.folders).forEach(folder => {
            if (folder && folder.close) {
                folder.close();
            }
        });
    }
    
    getConfig() {
        return this.config;
    }
    
    getGUI() {
        return this.gui;
    }
    
    dispose() {
        if (this.gui) {
            this.gui.destroy();
        }
    }
} 