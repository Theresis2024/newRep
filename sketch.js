let font;
let tSize = 100; //// Half the previous size
let tposX = 20; // Adjusted for top-left alignment
let tposY = 100; // Adjusted for top-left alignment based on text height
let pointCount = 0.3; /////between 0-1

let speed = 60; /////speed of the particles
let comebackSpeed = 400; ////lower the number, the less the interactions
let dia = 10; ////diameter of interaction
let randomPos = true; ////Starting point
let pointsDirection = "right"; 
let interactionDirection = -1; //// -1 and 1

let textPoints = [];
let words = ["Enter", "Home", "New Works", "Full view"]; // Updated list of words
let currentWordIndex = 0; // Index to track the current word

function preload() {
  font = loadFont("AvenirNextLTPro-Demi.otf");
}

function setup() {
  createCanvas(1000, 1000);
  textFont(font);
  generateParticles(words[currentWordIndex]); // Generate particles for the initial word

  // Set the color mode to HSB
  colorMode(HSB, 360, 100, 100); // Using HSB for color control
}

function draw() {
  // Paper white background in HSB: H=0, S=0, B=100 (White)
  background(0, 0, 100);

  // If all particles are deleted, switch to the next word
  if (textPoints.length === 0) {
    currentWordIndex = (currentWordIndex + 1) % words.length; // Move to the next word in the list
    generateParticles(words[currentWordIndex]); // Generate particles for the new word
  }

  // Draw and update each particle
  for (let i = textPoints.length - 1; i >= 0; i--) {
    let v = textPoints[i];
    if (v.isHovered()) {
      textPoints.splice(i, 1); // Delete multiple particles for a stronger effect
    } else {
      v.update();
      v.show();
      v.behaviors();
    }
  }
}

// Function to generate particles for a given word and align it to top-left
function generateParticles(word) {
  textPoints = []; // Clear any existing particles

  // Get bounding box of the word to adjust its vertical positioning
  let bounds = font.textBounds(word, 0, 0, tSize);
  tposY = bounds.h + 20; // Set Y to the height of the text for top-left alignment

  let points = font.textToPoints(word, tposX, tposY, tSize, {
    sampleFactor: pointCount,
  });

  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    let textPoint = new Interact(
      pt.x,
      pt.y,
      speed,
      dia,
      randomPos,
      comebackSpeed,
      pointsDirection,
      interactionDirection
    );
    textPoints.push(textPoint);
  }
}

function Interact(x, y, m, d, t, s, di, p) {
  if (t) {
    this.home = createVector(random(width), random(height));
  } else {
    this.home = createVector(x, y);
  }
  this.pos = this.home.copy();
  this.target = createVector(x, y);

  if (di == "general") {
    this.vel = createVector();
  } else if (di == "up") {
    this.vel = createVector(0, -y);
  } else if (di == "down") {
    this.vel = createVector(0, y);
  } else if (di == "left") {
    this.vel = createVector(-x, 0);
  } else if (di == "right") {
    this.vel = createVector(x, 0);
  }

  this.acc = createVector();
  this.r = 20; // Increase the interaction radius for a larger deletion area
  this.maxSpeed = m;
  this.maxforce = 1;
  this.dia = d;
  this.come = s;
  this.dir = p;
}

Interact.prototype.behaviors = function () {
  let arrive = this.arrive(this.target);
  let mouse = createVector(mouseX, mouseY);
  let flee = this.flee(mouse);

  this.applyForce(arrive);
  this.applyForce(flee);
};

Interact.prototype.applyForce = function (f) {
  this.acc.add(f);
};

Interact.prototype.arrive = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();
  let speed = this.maxSpeed;
  if (d < this.come) {
    speed = map(d, 0, this.come, 0, this.maxSpeed);
  }
  desired.setMag(speed);
  let steer = p5.Vector.sub(desired, this.vel);
  return steer;
};

Interact.prototype.flee = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();

  if (d < this.dia) {
    desired.setMag(this.maxSpeed);
    desired.mult(this.dir);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  } else {
    return createVector(0, 0);
  }
};

Interact.prototype.update = function () {
  this.pos.add(this.vel);
  this.vel.add(this.acc);
  this.acc.mult(0);
};

Interact.prototype.show = function () {
  // Dark grey text in HSB: H=0, S=0, B=20 (Very dark grey)
  stroke(0, 0, 20); // Dark grey stroke color
  strokeWeight(4);
  point(this.pos.x, this.pos.y);
};

// Check if particle is hovered by mouse
Interact.prototype.isHovered = function () {
  let mouse = createVector(mouseX, mouseY);
  let d = p5.Vector.dist(this.pos, mouse);
  return d < this.r * 2; // adjust if needed
};
