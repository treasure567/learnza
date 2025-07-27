import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class ModelLoader {
    constructor(scene) {
        this.scene = scene;
        this.loader = new GLTFLoader();
        this.textureLoader = new THREE.TextureLoader();
        this.model = null;
        this.mixer = null;
        this.animations = [];
        this.modelConfig = {
            scale: 1,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            castShadow: true,
            receiveShadow: true
        };
        this.shirtConfig = {
            color: 0x000000,
            metalness: 0.1,
            roughness: 0.8,
            normalScale: 1.0
        };
        
        this.onLoadProgress = null;
        this.onLoadComplete = null;
        this.onLoadError = null;
    }
    
    async loadModel(modelPath) {
        return new Promise((resolve, reject) => {
            this.loader.load(
                modelPath,
                (gltf) => {
                    this.processModel(gltf);
                    resolve(gltf);
                    if (this.onLoadComplete) {
                        this.onLoadComplete(gltf);
                    }
                },
                (progress) => {
                    if (this.onLoadProgress) {
                        this.onLoadProgress(progress);
                    }
                },
                (error) => {
                    console.error('Error loading model:', error);
                    reject(error);
                    if (this.onLoadError) {
                        this.onLoadError(error);
                    }
                }
            );
        });
    }
    
    processModel(gltf) {
        this.model = gltf.scene;
        this.animations = gltf.animations;
        
        if (this.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.model);
        }
        
        this.inspectModelStructure(gltf);
        this.setupModelProperties();
        this.findAndSetupShirt();
        this.scene.add(this.model);
        
        const box = new THREE.Box3().setFromObject(this.model);
        this.boundingBox = box;
        
        this.centerModel();
    }
    
    inspectModelStructure(gltf) {
        console.log('🔍 DETAILED MODEL INSPECTION');
        console.log('='.repeat(60));
        
        console.log('\n📊 GENERAL INFO:');
        console.log(`- Scene children: ${gltf.scene.children.length}`);
        console.log(`- Animations: ${gltf.animations.length}`);
        console.log(`- Total objects: ${this.countObjects(gltf.scene)}`);
        
        this.inspectSkeletons(gltf.scene);
        this.inspectMeshes(gltf.scene);
        this.inspectAnimations(gltf.animations);
        
        console.log('='.repeat(60));
    }
    
    countObjects(object) {
        let count = 1;
        object.children.forEach(child => {
            count += this.countObjects(child);
        });
        return count;
    }
    
    inspectSkeletons(scene) {
        console.log('\n🦴 SKELETON INSPECTION:');
        
        const skeletons = [];
        const skinnedMeshes = [];
        
        scene.traverse((child) => {
            if (child.isSkinnedMesh) {
                skinnedMeshes.push(child);
                if (child.skeleton && !skeletons.includes(child.skeleton)) {
                    skeletons.push(child.skeleton);
                }
            }
        });
        
        console.log(`- Skinned meshes: ${skinnedMeshes.length}`);
        console.log(`- Skeletons: ${skeletons.length}`);
        
        if (skeletons.length === 0) {
            console.log('❌ NO SKELETONS FOUND - Model is not rigged!');
            return;
        }
        
        skeletons.forEach((skeleton, index) => {
            console.log(`\n🦴 SKELETON ${index + 1} - ${skeleton.bones.length} bones:`);
            
            skeleton.bones.forEach((bone, boneIndex) => {
                const indent = this.getBoneDepth(bone, skeleton.bones);
                const prefix = '  '.repeat(indent) + (indent > 0 ? '└─ ' : '');
                console.log(`${prefix}${boneIndex}: "${bone.name}" (${bone.type})`);
            });
            
            this.categorizeBones(skeleton.bones);
        });
    }
    
    getBoneDepth(bone, allBones) {
        let depth = 0;
        let current = bone;
        while (current.parent && allBones.includes(current.parent)) {
            depth++;
            current = current.parent;
        }
        return depth;
    }
    
    categorizeBones(bones) {
        console.log('\n🎯 BONE CATEGORIES:');
        
        const armBones = bones.filter(bone => this.isArmBone(bone.name));
        const handBones = bones.filter(bone => this.isHandBone(bone.name));
        const spineBones = bones.filter(bone => this.isSpineBone(bone.name));
        const legBones = bones.filter(bone => this.isLegBone(bone.name));
        const headBones = bones.filter(bone => this.isHeadBone(bone.name));
        
        if (armBones.length > 0) {
            console.log('\n🔴 ARM/SHOULDER BONES:');
            armBones.forEach(bone => console.log(`  - "${bone.name}"`));
        }
        
        if (handBones.length > 0) {
            console.log('\n✋ HAND/WRIST BONES:');
            handBones.forEach(bone => console.log(`  - "${bone.name}"`));
        }
        
        if (spineBones.length > 0) {
            console.log('\n🏺 SPINE/TORSO BONES:');
            spineBones.forEach(bone => console.log(`  - "${bone.name}"`));
        }
        
        if (legBones.length > 0) {
            console.log('\n🦵 LEG BONES:');
            legBones.forEach(bone => console.log(`  - "${bone.name}"`));
        }
        
        if (headBones.length > 0) {
            console.log('\n💀 HEAD/NECK BONES:');
            headBones.forEach(bone => console.log(`  - "${bone.name}"`));
        }
        
        const otherBones = bones.filter(bone => 
            !this.isArmBone(bone.name) && !this.isHandBone(bone.name) && 
            !this.isSpineBone(bone.name) && !this.isLegBone(bone.name) && 
            !this.isHeadBone(bone.name)
        );
        
        if (otherBones.length > 0) {
            console.log('\n❓ OTHER BONES:');
            otherBones.forEach(bone => console.log(`  - "${bone.name}"`));
        }
    }
    
    isArmBone(name) {
        const n = name.toLowerCase();
        return n.includes('arm') || n.includes('shoulder') || n.includes('clavicle') || 
               n.includes('elbow') || n.includes('humerus') || n.includes('radius') || 
               n.includes('ulna');
    }
    
    isHandBone(name) {
        const n = name.toLowerCase();
        return n.includes('hand') || n.includes('wrist') || n.includes('finger') || 
               n.includes('thumb') || n.includes('palm');
    }
    
    isSpineBone(name) {
        const n = name.toLowerCase();
        return n.includes('spine') || n.includes('back') || n.includes('chest') || 
               n.includes('torso') || n.includes('pelvis');
    }
    
    isLegBone(name) {
        const n = name.toLowerCase();
        return n.includes('leg') || n.includes('thigh') || n.includes('shin') || 
               n.includes('foot') || n.includes('toe') || n.includes('hip') ||
               n.includes('femur') || n.includes('tibia') || n.includes('fibula');
    }
    
    isHeadBone(name) {
        const n = name.toLowerCase();
        return n.includes('head') || n.includes('neck') || n.includes('skull') || 
               n.includes('jaw') || n.includes('eye') || n.includes('ear');
    }
    
    inspectMeshes(scene) {
        console.log('\n🎭 MESH INSPECTION:');
        
        const meshes = [];
        scene.traverse((child) => {
            if (child.isMesh) {
                meshes.push(child);
            }
        });
        
        console.log(`Total meshes: ${meshes.length}`);
        
        meshes.forEach((mesh, index) => {
            console.log(`\n${index + 1}. "${mesh.name || 'Unnamed'}"`);
            console.log(`   - Vertices: ${mesh.geometry.attributes.position?.count || 0}`);
            console.log(`   - Is Skinned: ${mesh.isSkinnedMesh ? 'YES' : 'NO'}`);
            if (mesh.material) {
                console.log(`   - Material: "${mesh.material.name || 'Unnamed'}"`);
            }
        });
    }
    
    inspectAnimations(animations) {
        console.log('\n🎬 ANIMATION INSPECTION:');
        
        if (animations.length === 0) {
            console.log('No animations found in model');
            return;
        }
        
        animations.forEach((animation, index) => {
            console.log(`\n${index + 1}. "${animation.name || `Animation_${index}`}"`);
            console.log(`   - Duration: ${animation.duration.toFixed(2)}s`);
            console.log(`   - Tracks: ${animation.tracks.length}`);
            
            const targets = [...new Set(animation.tracks.map(track => track.name.split('.')[0]))];
            console.log(`   - Animated objects: ${targets.slice(0, 5).join(', ')}${targets.length > 5 ? '...' : ''}`);
        });
    }
    
    setupModelProperties() {
        if (!this.model) return;
        
        this.model.scale.setScalar(this.modelConfig.scale);
        this.model.position.set(
            this.modelConfig.position.x,
            this.modelConfig.position.y,
            this.modelConfig.position.z
        );
        this.model.rotation.set(
            this.modelConfig.rotation.x,
            this.modelConfig.rotation.y,
            this.modelConfig.rotation.z
        );
        
        this.model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = this.modelConfig.castShadow;
                child.receiveShadow = this.modelConfig.receiveShadow;
                
                if (child.material && child.material.map) {
                    child.material.map.flipY = false;
                }
            }
        });
    }
    
    findAndSetupShirt() {
        if (!this.model) return;
        
        const shirtMeshes = [];
        const shirtKeywords = ['shirt', 'top', 'tshirt', 't-shirt', 'clothing', 'torso'];
        
        this.model.traverse((child) => {
            if (child.isMesh && child.name) {
                const meshName = child.name.toLowerCase();
                const isShirt = shirtKeywords.some(keyword => 
                    meshName.includes(keyword)
                );
                
                if (isShirt) {
                    shirtMeshes.push(child);
                }
            }
        });
        
        if (shirtMeshes.length === 0) {
            this.model.traverse((child) => {
                if (child.isMesh && child.material) {
                    const material = child.material;
                    if (material.color && 
                        (material.color.r < 0.2 && material.color.g < 0.2 && material.color.b < 0.2)) {
                        shirtMeshes.push(child);
                    }
                }
            });
        }
        
        if (shirtMeshes.length > 0) {
            this.setupShirtMaterial(shirtMeshes[0]);
        }
    }
    
    setupShirtMaterial(shirtMesh) {
        if (!shirtMesh || !shirtMesh.material) return;
        
        const originalMaterial = shirtMesh.material;
        
        const shirtMaterial = new THREE.MeshStandardMaterial({
            color: this.shirtConfig.color,
            metalness: this.shirtConfig.metalness,
            roughness: this.shirtConfig.roughness,
            normalScale: new THREE.Vector2(
                this.shirtConfig.normalScale, 
                this.shirtConfig.normalScale
            )
        });
        
        if (originalMaterial.map) {
            shirtMaterial.map = originalMaterial.map;
        }
        if (originalMaterial.normalMap) {
            shirtMaterial.normalMap = originalMaterial.normalMap;
        }
        if (originalMaterial.roughnessMap) {
            shirtMaterial.roughnessMap = originalMaterial.roughnessMap;
        }
        if (originalMaterial.metalnessMap) {
            shirtMaterial.metalnessMap = originalMaterial.metalnessMap;
        }
        
        shirtMesh.material = shirtMaterial;
        this.shirtMaterial = shirtMaterial;
    }
    
    async applyLearnzaTexture(texturePath) {
        if (!this.shirtMaterial) {
            console.warn('No shirt material found to apply texture');
            return;
        }
        
        try {
            const texture = await this.loadTexture(texturePath);
            texture.flipY = false;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            
            this.shirtMaterial.map = texture;
            this.shirtMaterial.needsUpdate = true;
        } catch (error) {
            console.error('Error loading Learnza texture:', error);
            this.createLearnzaTexture();
        }
    }
    
    createLearnzaTexture() {
        if (!this.shirtMaterial) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const text = 'Learnza';
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        
        ctx.fillText(text, x, y);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.flipY = false;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        this.shirtMaterial.map = texture;
        this.shirtMaterial.needsUpdate = true;
    }
    
    loadTexture(path) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                path,
                resolve,
                undefined,
                reject
            );
        });
    }
    
    centerModel() {
        if (!this.model || !this.boundingBox) return;
        
        const center = this.boundingBox.getCenter(new THREE.Vector3());
        const size = this.boundingBox.getSize(new THREE.Vector3());
        
        this.model.position.x -= center.x;
        this.model.position.y -= this.boundingBox.min.y;
        this.model.position.z -= center.z;
    }
    
    updateShirtColor(color) {
        if (this.shirtMaterial) {
            this.shirtMaterial.color.setHex(color);
            this.shirtConfig.color = color;
        }
    }
    
    updateShirtMetalness(metalness) {
        if (this.shirtMaterial) {
            this.shirtMaterial.metalness = metalness;
            this.shirtConfig.metalness = metalness;
        }
    }
    
    updateShirtRoughness(roughness) {
        if (this.shirtMaterial) {
            this.shirtMaterial.roughness = roughness;
            this.shirtConfig.roughness = roughness;
        }
    }
    
    setWireframe(enabled) {
        if (!this.model) return;
        
        this.model.traverse((child) => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                        mat.wireframe = enabled;
                    });
                } else {
                    child.material.wireframe = enabled;
                }
            }
        });
    }
    
    updateMixerTime(deltaTime) {
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
    }
    
    getModel() {
        return this.model;
    }
    
    getMixer() {
        return this.mixer;
    }
    
    getAnimations() {
        return this.animations;
    }
    
    getBoundingBox() {
        return this.boundingBox;
    }
    
    getShirtMaterial() {
        return this.shirtMaterial;
    }
    
    dispose() {
        if (this.model) {
            this.scene.remove(this.model);
            
            this.model.traverse((child) => {
                if (child.isMesh) {
                    if (child.geometry) {
                        child.geometry.dispose();
                    }
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => mat.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                }
            });
        }
        
        if (this.mixer) {
            this.mixer.stopAllAction();
            this.mixer = null;
        }
    }
} 