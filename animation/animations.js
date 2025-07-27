import * as THREE from 'three';

export class AnimationManager {
    constructor(model, mixer) {
        this.model = model;
        this.mixer = mixer;
        this.skeleton = null;
        this.bones = {};
        this.currentAction = null;
        this.isAnimating = false;
        this.animationConfig = {
            waveSpeed: 1.0,
            waveDuration: 3.0,
            transitionDuration: 0.5,
            waveIntensity: 1.0
        };
        
        this.originalBoneRotations = new Map();
        this.targetBoneRotations = new Map();
        this.animationClock = new THREE.Clock();
        
        this.init();
    }
    
    init() {
        this.findSkeleton();
        this.mapBones();
        this.storeOriginalPoses();
    }
    
    findSkeleton() {
        if (!this.model) return;
        
        this.model.traverse((child) => {
            if (child.isSkinnedMesh && child.skeleton) {
                this.skeleton = child.skeleton;
                return;
            }
        });
        
        if (!this.skeleton) {
            console.warn('No skeleton found in the model');
        }
    }
    
    mapBones() {
        if (!this.skeleton) return;
        
        const boneKeywords = {
            rightShoulder: [
                'rightshoulder', 'right_shoulder', 'shoulder_r', 'shoulderr', 'r_shoulder',
                'rshoulder', 'shoulderr', 'r_shldr', 'rshldr', 'right_clavicle', 'rclavicle'
            ],
            rightUpperArm: [
                'rightupperarm', 'right_upperarm', 'upperarm_r', 'upperarmr', 'r_upperarm', 'rightarm',
                'rupperarm', 'right_arm', 'rarm', 'arm_r', 'armr', 'humerus_r', 'rhumerus'
            ],
            rightForearm: [
                'rightforearm', 'right_forearm', 'forearm_r', 'forearmr', 'r_forearm',
                'rforearm', 'right_lower_arm', 'rlowerarm', 'lowerarm_r', 'radius_r', 'rradius'
            ],
            rightHand: [
                'righthand', 'right_hand', 'hand_r', 'handr', 'r_hand',
                'rhand', 'wrist_r', 'rwrist', 'right_wrist'
            ],
            leftShoulder: [
                'leftshoulder', 'left_shoulder', 'shoulder_l', 'shoulderl', 'l_shoulder',
                'lshoulder', 'shoulderl', 'l_shldr', 'lshldr', 'left_clavicle', 'lclavicle'
            ],
            leftUpperArm: [
                'leftupperarm', 'left_upperarm', 'upperarm_l', 'upperarml', 'l_upperarm', 'leftarm',
                'lupperarm', 'left_arm', 'larm', 'arm_l', 'arml', 'humerus_l', 'lhumerus'
            ],
            leftForearm: [
                'leftforearm', 'left_forearm', 'forearm_l', 'forearml', 'l_forearm',
                'lforearm', 'left_lower_arm', 'llowerarm', 'lowerarm_l', 'radius_l', 'lradius'
            ],
            leftHand: [
                'lefthand', 'left_hand', 'hand_l', 'handl', 'l_hand',
                'lhand', 'wrist_l', 'lwrist', 'left_wrist'
            ]
        };
        
        this.skeleton.bones.forEach(bone => {
            const boneName = bone.name.toLowerCase().replace(/[^a-z]/g, '');
            
            for (const [boneType, keywords] of Object.entries(boneKeywords)) {
                if (keywords.some(keyword => boneName.includes(keyword))) {
                    this.bones[boneType] = bone;
                    break;
                }
            }
        });
        
        this.logFoundBones();
    }
    
    logFoundBones() {
        console.log('=== BONE DETECTION RESULTS ===');
        console.log('Found arm bones:', Object.keys(this.bones));
        
        if (Object.keys(this.bones).length === 0) {
            console.warn('❌ No arm bones found for wave animation');
            console.log('\n📋 ALL AVAILABLE BONES IN MODEL:');
            this.skeleton.bones.forEach((bone, index) => {
                console.log(`${index + 1}. "${bone.name}" (cleaned: "${bone.name.toLowerCase().replace(/[^a-z]/g, '')}")`);
            });
            console.log('\n💡 BONE MATCHING TIPS:');
            console.log('- Look for bones containing: arm, shoulder, hand, wrist, elbow');
            console.log('- Common patterns: Right_Arm, r_arm, RightArm, arm_R, etc.');
            console.log('- If you see arm bones above, update the animation system bone keywords');
        } else {
            console.log('✅ Successfully mapped bones:');
            Object.entries(this.bones).forEach(([type, bone]) => {
                console.log(`  ${type}: "${bone.name}"`);
            });
        }
        console.log('================================');
    }
    
    storeOriginalPoses() {
        if (!this.skeleton) return;
        
        this.skeleton.bones.forEach(bone => {
            this.originalBoneRotations.set(bone.uuid, {
                x: bone.rotation.x,
                y: bone.rotation.y,
                z: bone.rotation.z
            });
        });
    }
    
    async playWaveAnimation() {
        if (this.isAnimating) {
            console.log('Already animating, skipping...');
            return;
        }
        
        if (Object.keys(this.bones).length === 0) {
            console.warn('No specific arm bones found, trying fallback animation...');
            await this.playFallbackAnimation();
            return;
        }
        
        this.isAnimating = true;
        this.animationClock.start();
        
        try {
            await this.performWaveSequence();
        } catch (error) {
            console.error('Error during wave animation:', error);
        } finally {
            this.isAnimating = false;
        }
    }
    
    async playFallbackAnimation() {
        if (!this.skeleton) {
            console.warn('No skeleton available for fallback animation');
            return;
        }
        
        this.isAnimating = true;
        this.animationClock.start();
        
        const possibleArmBones = this.skeleton.bones.filter(bone => {
            const name = bone.name.toLowerCase();
            return name.includes('arm') || name.includes('shoulder') || 
                   name.includes('hand') || name.includes('wrist') || 
                   name.includes('elbow') || name.includes('humerus') ||
                   name.includes('radius') || name.includes('ulna');
        });
        
        if (possibleArmBones.length === 0) {
            console.warn('No arm-like bones found for fallback animation');
            this.isAnimating = false;
            return;
        }
        
        console.log('🎭 Playing fallback animation with bones:', possibleArmBones.map(b => b.name));
        
        try {
            await this.performFallbackSequence(possibleArmBones);
        } catch (error) {
            console.error('Error during fallback animation:', error);
        } finally {
            this.isAnimating = false;
        }
    }
    
    async performFallbackSequence(bones) {
        const duration = 2.0;
        const startTime = this.animationClock.getElapsedTime();
        
        const originalRotations = bones.map(bone => ({
            bone: bone,
            original: {
                x: bone.rotation.x,
                y: bone.rotation.y,
                z: bone.rotation.z
            }
        }));
        
        return new Promise((resolve) => {
            const animate = () => {
                const elapsed = this.animationClock.getElapsedTime() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const wave = Math.sin(progress * Math.PI * 3) * 0.3;
                
                originalRotations.forEach(({ bone, original }) => {
                    const boneName = bone.name.toLowerCase();
                    if (boneName.includes('right') || boneName.includes('r_') || boneName.includes('_r')) {
                        bone.rotation.z = original.z + wave;
                        bone.rotation.y = original.y + wave * 0.5;
                    }
                });
                
                if (progress >= 1) {
                    originalRotations.forEach(({ bone, original }) => {
                        bone.rotation.set(original.x, original.y, original.z);
                    });
                    resolve();
                } else {
                    requestAnimationFrame(animate);
                }
            };
            
            animate();
        });
    }
    
    async performWaveSequence() {
        const sequence = [
            { phase: 'raise', duration: 1.0 },
            { phase: 'wave', duration: 1.5 },
            { phase: 'lower', duration: 0.8 }
        ];
        
        for (const step of sequence) {
            await this.animatePhase(step.phase, step.duration);
        }
        
        await this.returnToIdle();
    }
    
    async animatePhase(phase, duration) {
        return new Promise((resolve) => {
            const startTime = this.animationClock.getElapsedTime();
            const targetRotations = this.getPhaseRotations(phase);
            
            const animate = () => {
                const elapsed = this.animationClock.getElapsedTime() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = this.easeInOutCubic(progress);
                
                this.interpolateBoneRotations(targetRotations, easedProgress);
                
                if (progress >= 1) {
                    resolve();
                } else {
                    requestAnimationFrame(animate);
                }
            };
            
            animate();
        });
    }
    
    getPhaseRotations(phase) {
        const intensity = this.animationConfig.waveIntensity;
        
        switch (phase) {
            case 'raise':
                return {
                    rightShoulder: { x: 0, y: 0, z: -Math.PI * 0.4 * intensity },
                    rightUpperArm: { x: 0, y: 0, z: -Math.PI * 0.3 * intensity },
                    rightForearm: { x: 0, y: 0, z: Math.PI * 0.2 * intensity }
                };
                
            case 'wave':
                return {
                    rightShoulder: { x: 0, y: 0, z: -Math.PI * 0.4 * intensity },
                    rightUpperArm: { x: 0, y: 0, z: -Math.PI * 0.3 * intensity },
                    rightForearm: { x: 0, y: Math.PI * 0.3 * intensity, z: Math.PI * 0.2 * intensity },
                    rightHand: { x: 0, y: Math.PI * 0.1 * intensity, z: 0 }
                };
                
            case 'lower':
                return this.getIdleRotations();
                
            default:
                return this.getIdleRotations();
        }
    }
    
    getIdleRotations() {
        return {
            rightShoulder: { x: 0, y: 0, z: 0 },
            rightUpperArm: { x: 0, y: 0, z: 0 },
            rightForearm: { x: 0, y: 0, z: 0 },
            rightHand: { x: 0, y: 0, z: 0 },
            leftShoulder: { x: 0, y: 0, z: 0 },
            leftUpperArm: { x: 0, y: 0, z: 0 },
            leftForearm: { x: 0, y: 0, z: 0 },
            leftHand: { x: 0, y: 0, z: 0 }
        };
    }
    
    interpolateBoneRotations(targetRotations, progress) {
        for (const [boneType, bone] of Object.entries(this.bones)) {
            if (!bone || !targetRotations[boneType]) continue;
            
            const original = this.originalBoneRotations.get(bone.uuid);
            const target = targetRotations[boneType];
            
            if (original) {
                bone.rotation.x = THREE.MathUtils.lerp(original.x, target.x, progress);
                bone.rotation.y = THREE.MathUtils.lerp(original.y, target.y, progress);
                bone.rotation.z = THREE.MathUtils.lerp(original.z, target.z, progress);
            }
        }
    }
    
    async returnToIdle() {
        const idleRotations = this.getIdleRotations();
        await this.animatePhase('idle', this.animationConfig.transitionDuration);
    }
    
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    resetToIdle() {
        if (!this.skeleton) return;
        
        this.skeleton.bones.forEach(bone => {
            const original = this.originalBoneRotations.get(bone.uuid);
            if (original) {
                bone.rotation.set(original.x, original.y, original.z);
            }
        });
        
        this.isAnimating = false;
    }
    
    setWaveSpeed(speed) {
        this.animationConfig.waveSpeed = Math.max(0.1, Math.min(3.0, speed));
    }
    
    setWaveIntensity(intensity) {
        this.animationConfig.waveIntensity = Math.max(0.1, Math.min(2.0, intensity));
    }
    
    setWaveDuration(duration) {
        this.animationConfig.waveDuration = Math.max(1.0, Math.min(10.0, duration));
    }
    
    update(deltaTime) {
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
    }
    
    getIsAnimating() {
        return this.isAnimating;
    }
    
    getBones() {
        return this.bones;
    }
    
    getSkeleton() {
        return this.skeleton;
    }
    
    getConfig() {
        return this.animationConfig;
    }
    
    dispose() {
        if (this.mixer) {
            this.mixer.stopAllAction();
        }
        this.isAnimating = false;
        this.originalBoneRotations.clear();
        this.targetBoneRotations.clear();
    }
} 