# How to Rig Your 3D Model for Animation

## Prerequisites
- Download Blender (free): https://www.blender.org/download/
- Your `real.glb` model

## Step 1: Import Model into Blender

1. **Open Blender**
2. **Delete default cube**: Select cube → Press `X` → Delete
3. **Import GLB**: File → Import → glTF 2.0 (.glb/.gltf)
4. **Select your `real.glb` file**

## Step 2: Add Armature (Skeleton)

1. **Add Armature**: 
   - `Shift + A` → Armature → Single Bone
   - Position it at the model's center

2. **Enter Edit Mode**: 
   - Select armature → Press `Tab`

3. **Create Bone Chain**:
   ```
   Root
   └── Hips
       ├── Spine
       │   ├── Chest
       │   │   ├── LeftShoulder
       │   │   │   ├── LeftArm
       │   │   │   │   ├── LeftForeArm
       │   │   │   │   │   └── LeftHand
       │   │   └── RightShoulder
       │   │       ├── RightArm
       │   │       │   ├── RightForeArm
       │   │       │   │   └── RightHand
       │   └── Neck
       │       └── Head
       ├── LeftThigh
       │   ├── LeftShin
       │   │   └── LeftFoot
       └── RightThigh
           ├── RightShin
               └── RightFoot
   ```

## Step 3: Position Bones

1. **Select each bone** and position it inside the corresponding body part
2. **For arms**: Place bones along the arm length
3. **For spine**: Align with the character's spine
4. **Important**: Bone names MUST match our system:
   - `RightShoulder`, `RightArm`, `RightForeArm`, `RightHand`
   - `LeftShoulder`, `LeftArm`, `LeftForeArm`, `LeftHand`

## Step 4: Bind Armature to Mesh

1. **Exit Edit Mode**: Press `Tab`
2. **Select the model mesh first**
3. **Hold Shift and select the armature**
4. **Parent with Automatic Weights**: 
   - Press `Ctrl + P` → With Automatic Weights

## Step 5: Test the Rig

1. **Switch to Pose Mode**: Select armature → Change mode to "Pose Mode"
2. **Test rotation**: Select `RightArm` bone → Press `R` → Move mouse
3. **If mesh deforms properly**, the rig is working!

## Step 6: Export for Three.js

1. **Select both mesh and armature**
2. **Export**: File → Export → glTF 2.0 (.glb/.gltf)
3. **Settings**:
   - ✅ Include → Selected Objects
   - ✅ Include → Animations  
   - ✅ Include → Skinning
   - ✅ Transform → Apply Modifiers
4. **Save as**: `assets/models/real_rigged.glb`

## Step 7: Update Three.js Code

```javascript
// In src/main.js, change the model path:
const modelPath = './assets/models/real_rigged.glb';
```

---

## Troubleshooting

**Mesh doesn't deform?**
- Check bone weights: Select mesh → Properties → Data Properties → Vertex Groups
- Re-do automatic weights: Select mesh + armature → Ctrl+P → With Automatic Weights

**Animation doesn't work in Three.js?**
- Ensure bone names match exactly: `RightArm`, `LeftArm`, etc.
- Check console for bone detection results

**Model looks weird after rigging?**
- Reset bone rotations in Pose Mode: Select all bones → Alt+R
- Check mesh modifiers are applied before export 