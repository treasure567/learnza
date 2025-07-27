# Learnza Three.js 3D Model Viewer

A production-ready Three.js application featuring a realistic rigged 3D human model with interactive arm wave animation and custom "Learnza" T-shirt branding.

## Features

- 🎯 **Interactive 3D Model**: Realistic female Nigerian adult character
- 👋 **Wave Animation**: Smooth skeletal arm waving with "Wave Hi" button
- 👕 **Custom T-shirt**: Dynamic "Learnza" branding with adjustable colors
- 🎮 **Orbit Controls**: Smooth camera interaction with damping
- 💡 **Professional Lighting**: Hemisphere + Directional + Ambient lighting
- 🎛️ **dat.GUI Controls**: Real-time parameter adjustment
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Modern ES Modules**: Clean, modular JavaScript architecture

## Project Structure

```
learnza-threejs/
├── index.html                 # Main HTML file
├── package.json              # Dependencies and scripts
├── src/                      # Source modules
│   ├── main.js              # Application entry point
│   ├── scene.js             # Scene, renderer, camera setup
│   ├── lights.js            # Lighting configuration
│   ├── controls.js          # Orbit controls management
│   ├── modelLoader.js       # GLTF model loading and textures
│   ├── animations.js        # Skeletal animation system
│   └── gui.js               # dat.GUI interface
└── assets/                   # Asset files (to be created)
    └── models/
        └── female_nigerian.glb   # 3D model file
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Get a 3D Model

You need a rigged female Nigerian adult GLTF/GLB model. Here are recommended sources:

#### **Free Sources:**
- **Mixamo (Adobe)**: https://www.mixamo.com
  - Search for "female" characters
  - Download as FBX, then convert to GLB using Blender
  - Models come pre-rigged with standard bone names

- **Sketchfab**: https://sketchfab.com
  - Filter: "Free", "Rigged", "Female"
  - Look for CC-licensed models
  - Download GLB format directly

- **Ready Player Me**: https://readyplayer.me
  - Create custom avatars
  - Export as GLB with full rigging

#### **Paid Sources:**
- **TurboSquid**: https://www.turbosquid.com
- **CGTrader**: https://www.cgtrader.com
- **Daz3D**: https://www.daz3d.com

### 3. Model Requirements

Your model MUST have:
- ✅ **Rigged skeleton** with arm bones
- ✅ **GLB or GLTF format**
- ✅ **Standard bone naming** (see rigging section below)
- ✅ **Black T-shirt** or similar upper body clothing
- ✅ **Reasonable polygon count** (under 50k vertices)

### 4. Place Your Model

```bash
mkdir -p assets/models
# Copy your model file to:
cp your-model.glb assets/models/female_nigerian.glb
```

### 5. Run the Project

**Using Vite (recommended):**
```bash
npm run dev
```

**Using http-server:**
```bash
npm run serve
```

**Using Python (alternative):**
```bash
python -m http.server 8080
```

Open http://localhost:8080 in your browser.

## Model Rigging Guide

### Required Bone Names

The animation system looks for these bone patterns (case-insensitive):

| Body Part | Accepted Names |
|-----------|----------------|
| Right Shoulder | `RightShoulder`, `right_shoulder`, `shoulder_r`, `ShoulderR` |
| Right Upper Arm | `RightUpperArm`, `right_upperarm`, `upperarm_r`, `RightArm` |
| Right Forearm | `RightForearm`, `right_forearm`, `forearm_r` |
| Right Hand | `RightHand`, `right_hand`, `hand_r` |

### Rigging a Model in Blender

If your model isn't rigged or uses non-standard bone names:

#### 1. Import Your Model
```
File → Import → FBX/OBJ
```

#### 2. Add Armature
```
Add → Armature → Single Bone
```

#### 3. Enter Edit Mode
```
Tab → Edit Mode
Extrude bones for: Spine → Shoulder → UpperArm → Forearm → Hand
```

#### 4. Name Bones Correctly
In Bone Properties panel, rename bones to match the patterns above.

#### 5. Bind to Mesh
```
1. Select Mesh, then Armature (Shift+Click)
2. Ctrl+P → With Automatic Weights
3. Test in Pose Mode
```

#### 6. Export as GLB
```
File → Export → glTF 2.0 (.glb/.gltf)
Options:
- ✅ Include Animations
- ✅ Include Skinning
- ✅ Apply Modifiers
```

### Fixing Common Rigging Issues

**Animation not working?**
- Check bone names in console (they're logged on load)
- Ensure bones are properly weighted to mesh
- Verify armature is applied to the model

**Weird deformations?**
- Re-do automatic weights in Blender
- Manually paint vertex weights for arm areas
- Check for duplicate vertices

## Creating the Learnza T-shirt Texture

### Method 1: Automatic (Default)
The app automatically creates a black T-shirt texture with white "Learnza" text. No additional setup needed.

### Method 2: Custom Texture
Create a custom texture file:

#### Using GIMP/Photoshop:
1. Create 512x512 image
2. Fill with black background
3. Add white "Learnza" text (centered, modern font)
4. Save as PNG: `assets/textures/learnza_shirt.png`

#### Using Blender:
1. Open Shader Editor
2. Add Text object
3. Set Font to modern sans-serif
4. Bake to 512x512 texture
5. Export as PNG

### Method 3: UV Mapping
For precise texture placement:

1. **Unwrap T-shirt mesh** in Blender
2. **Create UV layout** with chest area clearly marked
3. **Paint "Learnza" text** on UV map
4. **Apply texture** to material
5. **Export model** with embedded textures

## Controls & Features

### Mouse/Touch Controls
- **Orbit**: Left click + drag
- **Zoom**: Mouse wheel / Pinch
- **Pan**: Right click + drag / Two-finger drag

### Keyboard Shortcuts
- **W**: Trigger wave animation
- **R**: Reset animation to idle
- **G**: Toggle GUI panel

### GUI Controls

#### Animation Panel
- **Wave Speed**: Animation playback speed (0.1-3.0x)
- **Wave Intensity**: Arm movement range (0.1-2.0x)
- **Wave Duration**: Total animation time (1-10 seconds)

#### Appearance Panel
- **Shirt Color**: Real-time T-shirt color changes
- **Background Color**: Scene background adjustment
- **Wireframe**: Toggle wireframe rendering

#### Lighting Panel
- **Hemisphere Light**: Soft ambient lighting (0-2.0)
- **Directional Light**: Main shadow-casting light (0-3.0)
- **Ambient Light**: Fill lighting (0-1.0)
- **Shadows**: Enable/disable shadow rendering

#### Camera Panel
- **Auto Rotate**: Automatic model rotation
- **Rotate Speed**: Auto-rotation speed (-2.0 to 2.0)
- **Damping Factor**: Camera smoothness (0.01-0.2)

#### Actions Panel
- **Reset Animation**: Return to idle pose
- **Reset Camera**: Return to default view

## Customization

### Adding New Animations
Extend the `AnimationManager` class in `src/animations.js`:

```javascript
async playCustomAnimation() {
    const sequence = [
        { phase: 'prep', duration: 0.5 },
        { phase: 'action', duration: 2.0 },
        { phase: 'return', duration: 1.0 }
    ];
    
    for (const step of sequence) {
        await this.animatePhase(step.phase, step.duration);
    }
}
```

### Changing Model Path
Update the model path in `src/main.js`:

```javascript
const modelPath = './assets/models/your-model.glb';
```

### Custom Textures
Apply custom textures in `ModelLoader`:

```javascript
await this.applyLearnzaTexture('./assets/textures/custom_texture.png');
```

### Adding GUI Controls
Extend the `GUIManager` class:

```javascript
this.controls.newParameter = this.folders.animation
    .add(this.config.animation, 'newParameter', 0, 100)
    .name('New Parameter')
    .onChange((value) => {
        // Handle parameter change
    });
```

## Troubleshooting

### Model Not Loading
```
Error: Failed to load 3D model
```
**Solutions:**
- Check file path: `./assets/models/female_nigerian.glb`
- Verify file format (GLB/GLTF only)
- Check browser console for detailed errors
- Test with a simple GLB model first

### Animation Not Working
```
Warning: No arm bones found for wave animation
```
**Solutions:**
- Check bone names in browser console
- Ensure model is properly rigged
- Verify bones are named according to patterns above
- Test with a Mixamo-rigged model

### Texture Issues
```
Warning: No shirt material found to apply texture
```
**Solutions:**
- Ensure model has materials assigned
- Check that T-shirt mesh has proper material
- Verify material names contain "shirt", "top", or "clothing"
- Use the fallback automatic texture generation

### Performance Issues
**Solutions:**
- Reduce model polygon count
- Lower shadow map resolution in `lights.js`
- Disable shadows for mobile devices
- Use LOD (Level of Detail) models

### CORS Errors
```
Access to fetch at 'file:///' from origin 'null' has been blocked
```
**Solutions:**
- Always use a local server (npm run dev)
- Never open HTML files directly in browser
- Ensure all assets are served over HTTP/HTTPS

## Browser Support

- ✅ **Chrome 80+**
- ✅ **Firefox 75+**
- ✅ **Safari 13.1+**
- ✅ **Edge 80+**
- ⚠️ **Mobile Safari** (limited WebGL performance)
- ❌ **Internet Explorer** (not supported)

## Performance Optimization

### For Mobile Devices
```javascript
// Reduce shadow quality
shadowMapSize: 1024  // instead of 2048

// Disable post-processing
renderer.antialias = false

// Lower polygon models
// Use texture atlases
// Implement LOD system
```

### For Low-End Hardware
```javascript
// Reduce lighting
ambientIntensity: 0.5
directionalIntensity: 0.8

// Disable shadows
castShadow: false

// Lower pixel ratio
renderer.setPixelRatio(1)
```

## Dependencies

- **three**: ^0.160.0 - Core 3D engine
- **dat.gui**: ^0.7.9 - GUI controls
- **vite**: ^5.0.0 - Development server
- **http-server**: ^14.1.1 - Alternative server

## License

MIT License - feel free to use for personal and commercial projects.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
- Check the troubleshooting section above
- Open an issue on GitHub
- Provide browser console errors
- Include your model file details

---

**Made with ❤️ for the Learnza community**
