import * as THREE from 'three';

export class ProceduralAnimationManager {
    constructor(model) {
        this.model = model;
        this.isAnimating = false;
        this.originalTransforms = new Map();
        this.animationClock = new THREE.Clock();
        
        this.config = {
            waveIntensity: 0.3,
            waveSpeed: 1.0,
            bobIntensity: 0.05,
            rotationIntensity: 0.1
        };
        
        this.init();
    }
    
    init() {
        if (!this.model) return;
        
        this.storeOriginalTransforms();
        this.findAnimatableParts();
    }
    
    storeOriginalTransforms() {
        this.model.traverse((child) => {
            this.originalTransforms.set(child.uuid, {
                position: child.position.clone(),
                rotation: child.rotation.clone(),
                scale: child.scale.clone()
            });
        });
    }
    
    findAnimatableParts() {
        this.animatableParts = {
            bodyParts: [],
            meshes: []
        };
        
        this.model.traverse((child) => {
            if (child.isMesh) {
                this.animatableParts.meshes.push(child);
                
                const name = child.name.toLowerCase();
                if (this.isArmPart(name) || this.isBodyPart(name)) {
                    this.animatableParts.bodyParts.push({
                        mesh: child,
                        type: this.getPartType(name)
                    });
                }
            }
        });
        
        console.log('🎭 PROCEDURAL ANIMATION SETUP:');
        console.log(`- Found ${this.animatableParts.meshes.length} meshes`);
        console.log(`- Found ${this.animatableParts.bodyParts.length} body parts`);
    }
    
    isArmPart(name) {
        return name.includes('arm') || name.includes('hand') || 
               name.includes('shoulder') || name.includes('elbow') ||
               name.includes('wrist') || name.includes('finger');
    }
    
    isBodyPart(name) {
        return name.includes('torso') || name.includes('chest') ||
               name.includes('head') || name.includes('neck') ||
               name.includes('leg') || name.includes('foot');
    }
    
    getPartType(name) {
        if (name.includes('right') && this.isArmPart(name)) return 'rightArm';
        if (name.includes('left') && this.isArmPart(name)) return 'leftArm';
        if (name.includes('head')) return 'head';
        if (name.includes('torso') || name.includes('chest')) return 'torso';
        return 'other';
    }
    
    async playWaveAnimation() {
        if (this.isAnimating) {
            console.log('Already animating...');
            return;
        }
        
        console.log('🌊 Playing procedural wave animation...');
        this.isAnimating = true;
        
        await this.performProceduralWave();
        
        this.isAnimating = false;
    }
    
    async performProceduralWave() {
        const duration = 3.0;
        const startTime = this.animationClock.getElapsedTime();
        
        return new Promise((resolve) => {
            const animate = () => {
                const elapsed = this.animationClock.getElapsedTime() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                this.updateProceduralAnimation(progress, elapsed);
                
                if (progress >= 1) {
                    this.resetToOriginal();
                    resolve();
                } else {
                    requestAnimationFrame(animate);
                }
            };
            
            animate();
        });
    }
    
    updateProceduralAnimation(progress, elapsed) {
        const wavePhase = Math.sin(progress * Math.PI * 2) * this.config.waveIntensity;
        const bobPhase = Math.sin(elapsed * 3) * this.config.bobIntensity;
        
        this.model.traverse((child) => {
            if (!child.isMesh) return;
            
            const original = this.originalTransforms.get(child.uuid);
            if (!original) return;
            
            const name = child.name.toLowerCase();
            
            // Whole model subtle movement
            if (child === this.model) {
                child.position.y = original.position.y + bobPhase;
                child.rotation.z = original.rotation.z + wavePhase * 0.1;
                return;
            }
            
            // Right arm simulation
            if (name.includes('right') && this.isArmPart(name)) {
                child.rotation.x = original.rotation.x + wavePhase * 0.5;
                child.rotation.z = original.rotation.z + wavePhase * 0.8;
                child.position.y = original.position.y + wavePhase * 0.1;
            }
            
            // Left arm subtle movement
            if (name.includes('left') && this.isArmPart(name)) {
                child.rotation.z = original.rotation.z + wavePhase * 0.2;
            }
            
            // Head slight nod
            if (name.includes('head')) {
                child.rotation.x = original.rotation.x + wavePhase * 0.1;
            }
            
            // Torso sway
            if (name.includes('torso') || name.includes('chest')) {
                child.rotation.z = original.rotation.z + wavePhase * 0.05;
            }
        });
    }
    
    async playFullBodyWave() {
        console.log('🌊 Playing full body wave animation...');
        this.isAnimating = true;
        
        const duration = 4.0;
        const startTime = this.animationClock.getElapsedTime();
        
        return new Promise((resolve) => {
            const animate = () => {
                const elapsed = this.animationClock.getElapsedTime() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                this.updateFullBodyWave(progress, elapsed);
                
                if (progress >= 1) {
                    this.resetToOriginal();
                    this.isAnimating = false;
                    resolve();
                } else {
                    requestAnimationFrame(animate);
                }
            };
            
            animate();
        });
    }
    
    updateFullBodyWave(progress, elapsed) {
        const wave1 = Math.sin(progress * Math.PI * 3) * this.config.waveIntensity;
        const wave2 = Math.sin(progress * Math.PI * 4 + Math.PI/4) * this.config.waveIntensity * 0.7;
        
        this.model.traverse((child) => {
            if (!child.isMesh) return;
            
            const original = this.originalTransforms.get(child.uuid);
            if (!original) return;
            
            const name = child.name.toLowerCase();
            
            // Right arm leads the wave
            if (name.includes('right') && this.isArmPart(name)) {
                child.rotation.x = original.rotation.x + wave1 * 0.6;
                child.rotation.y = original.rotation.y + wave1 * 0.3;
                child.rotation.z = original.rotation.z + wave1 * 0.8;
            }
            
            // Left arm follows
            if (name.includes('left') && this.isArmPart(name)) {
                child.rotation.x = original.rotation.x + wave2 * 0.4;
                child.rotation.z = original.rotation.z + wave2 * 0.6;
            }
            
            // Torso movement
            if (name.includes('torso') || name.includes('chest')) {
                child.rotation.z = original.rotation.z + wave1 * 0.1;
                child.rotation.y = original.rotation.y + wave2 * 0.05;
            }
            
            // Head movement
            if (name.includes('head')) {
                child.rotation.x = original.rotation.x + wave1 * 0.15;
                child.rotation.y = original.rotation.y + wave2 * 0.1;
            }
        });
    }
    
    resetToOriginal() {
        this.model.traverse((child) => {
            const original = this.originalTransforms.get(child.uuid);
            if (original) {
                child.position.copy(original.position);
                child.rotation.copy(original.rotation);
                child.scale.copy(original.scale);
            }
        });
    }
    
    setWaveIntensity(intensity) {
        this.config.waveIntensity = Math.max(0.1, Math.min(2.0, intensity));
    }
    
    setWaveSpeed(speed) {
        this.config.waveSpeed = Math.max(0.1, Math.min(3.0, speed));
    }
    
    update(deltaTime) {
        // Procedural animations are self-contained and don't need frame updates
        // This method exists for compatibility with the main animation loop
    }
    
    getIsAnimating() {
        return this.isAnimating;
    }
    
    dispose() {
        this.isAnimating = false;
        this.originalTransforms.clear();
    }
} 