const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

class Joint {
    constructor(x, y, width) {
        this.x = x;
        this.y = y;
        this.width = width;
    }
}

class Arm {
    constructor(shoulder, elbow, wrist) {
        this.shoulder = shoulder;
        this.elbow = elbow;
        this.wrist = wrist;
    }
}

class Pose {
    constructor(leftArm, rightArm) {
        this.leftArm = leftArm;
        this.rightArm = rightArm;
    }
}

const pose1 = new Pose(
    new Arm(
        new Joint(200, 200, 40),
        new Joint(150, 250, 30),
        new Joint(100, 300, 25)
    ),
    new Arm(
        new Joint(300, 200, 40),
        new Joint(350, 250, 30),
        new Joint(400, 300, 25)
    )
);

const pose2 = new Pose(
    new Arm(
        new Joint(200, 200, 40),
        new Joint(150, 150, 30),
        new Joint(100, 100, 25)
    ),
    new Arm(
        new Joint(300, 200, 40),
        new Joint(350, 150, 30),
        new Joint(400, 100, 25)
    )
);

function lerp(start, end, t) {
    return start + (end - start) * t;
}

function lerpJoint(j1, j2, t) {
    return new Joint(
        lerp(j1.x, j2.x, t),
        lerp(j1.y, j2.y, t),
        lerp(j1.width, j2.width, t)
    );
}

function lerpArm(a1, a2, t) {
    return new Arm(
        lerpJoint(a1.shoulder, a2.shoulder, t),
        lerpJoint(a1.elbow, a2.elbow, t),
        lerpJoint(a1.wrist, a2.wrist, t)
    );
}

function lerpPose(p1, p2, t) {
    return new Pose(
        lerpArm(p1.leftArm, p2.leftArm, t),
        lerpArm(p1.rightArm, p2.rightArm, t)
    );
}

function drawArm(arm, isLeft) {
    const controlPoint1x = isLeft ? 
        arm.shoulder.x - (arm.shoulder.x - arm.elbow.x) * 0.1 :
        arm.shoulder.x + (arm.elbow.x - arm.shoulder.x) * 0.1;
    
    const controlPoint2x = isLeft ?
        arm.elbow.x - (arm.elbow.x - arm.wrist.x) * 0.1 :
        arm.elbow.x + (arm.wrist.x - arm.elbow.x) * 0.1;

    // Main arm shape
    ctx.beginPath();
    ctx.moveTo(arm.shoulder.x - arm.shoulder.width/2, arm.shoulder.y);
    
    // Upper arm outer curve
    ctx.quadraticCurveTo(
        controlPoint1x - arm.shoulder.width/2,
        (arm.shoulder.y + arm.elbow.y)/2,
        arm.elbow.x - arm.elbow.width/2,
        arm.elbow.y
    );
    
    // Lower arm outer curve
    ctx.quadraticCurveTo(
        controlPoint2x - arm.elbow.width/2,
        (arm.elbow.y + arm.wrist.y)/2,
        arm.wrist.x - arm.wrist.width/2,
        arm.wrist.y
    );
    
    // Bottom curve
    ctx.lineTo(arm.wrist.x + arm.wrist.width/2, arm.wrist.y);
    
    // Lower arm inner curve
    ctx.quadraticCurveTo(
        controlPoint2x + arm.elbow.width/2,
        (arm.elbow.y + arm.wrist.y)/2,
        arm.elbow.x + arm.elbow.width/2,
        arm.elbow.y
    );
    
    // Upper arm inner curve
    ctx.quadraticCurveTo(
        controlPoint1x + arm.shoulder.width/2,
        (arm.shoulder.y + arm.elbow.y)/2,
        arm.shoulder.x + arm.shoulder.width/2,
        arm.shoulder.y
    );
    
    ctx.closePath();

    // Gradient for 3D effect
    const gradient = ctx.createLinearGradient(
        arm.shoulder.x - arm.shoulder.width/2,
        arm.shoulder.y,
        arm.shoulder.x + arm.shoulder.width/2,
        arm.shoulder.y
    );
    gradient.addColorStop(0, '#ffdfc4');    // Light skin tone
    gradient.addColorStop(0.5, '#ffcca7');  // Mid skin tone
    gradient.addColorStop(1, '#ffdfc4');    // Light skin tone

    ctx.fillStyle = gradient;
    ctx.fill();

    // Subtle shadow
    ctx.strokeStyle = '#e6c4ac';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function drawPose(pose) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw arms
    drawArm(pose.leftArm, true);
    drawArm(pose.rightArm, false);
}

let time = 0;
let forward = true;

function animate() {
    time += 0.008; // Slightly slower animation
    if (time > 1) {
        time = 0;
        forward = !forward;
    }
    
    const t = forward ? time : 1 - time;
    const currentPose = lerpPose(pose1, pose2, t);
    drawPose(currentPose);
    requestAnimationFrame(animate);
}

animate(); 