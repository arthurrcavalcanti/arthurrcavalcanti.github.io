let flappyBirdSketch = (sketch) => {
    let bird;
    let pipes = [];

    let backgroundColor = 220;

    let speed;
    let minSize;
    let maxSize;

    let score;
    let level;

    let infoDiv;

    sketch.setup = () => {
        infoDiv = sketch.createDiv();
        infoDiv.parent('flappy-birds-div')

        let c = sketch.createCanvas(700, 700);
        c.parent('canvas-flappy-birds');

        level = 1;
        bird = new Bird();
        score = bird.score;

        speed = 2;
        minSize = 100;
        maxSize = 150;
        sketch.callPipe();
    }

    sketch.draw = () => {
        sketch.background(backgroundColor);
        //calling pipes
        if (sketch.frameCount % 130 == 0) {
            sketch.callPipe();
        }

        let h = 0;
        //pipes updates
        for (let i = 0; i < pipes.length; i++) {
            pipes[i].show();
            pipes[i].update();

            if (pipes[i].checkIfHit(bird)) {
                bird.dead = true;
                let h = i;
            } else {
                if (!bird.dead) {
                    bird.score++
                }
            }

        }

        //bird updates
        bird.show();
        bird.update();

        //checking if bird is dead and reseting
        if (bird.dead) {
            setTimeout(sketch.reset, 1700);
            bird.pos.x = pipes[h].pos.x;
        }

        //removing extra pipes;
        sketch.removeExtraPipes();

        //information
        score = bird.score;
        infoDiv.html("score: " + score);
    }


    sketch.reset = () => {
        pipes = [];
        bird = new Bird();
    }

    sketch.callPipe = () => {
        pipes.push(new Pipe(speed, minSize, maxSize));
        //console.log(pipes.length);
    }

    sketch.removeExtraPipes = () => {
        for (let i = pipes.length - 1; i >= 0; i--) {
            if (pipes[i].pos.x < -100) {
                pipes.splice(i, 1);
            }
        }
    }

    sketch.keyPressed = () => {
        if (key = ' ') {
            if (!bird.dead) {
                bird.impulsion()
            }
        }
    }

    sketch.mousePressed = () => {
        if (!bird.dead) {
            bird.impulsion()
        }
    }

    function Bird() {
        this.pos = sketch.createVector(150, sketch.height / 2);
        this.vel = sketch.createVector(0, 0);
        this.g = sketch.createVector(0, 0.35);

        this.r = 10;

        this.impulse = sketch.createVector(0, -10);

        this.score = 0;

        this.dead = false;

        this.show = function () {
            if (this.dead) {
                sketch.fill(255, 0, 0);
            } else {
                sketch.fill(51);
            }
            sketch.ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
        }

        this.update = function () {
            this.pos.add(this.vel);
            this.vel.add(this.g);
            this.vel.mult(0.95);

            if (this.pos.y > sketch.height - this.r) {
                this.vel = sketch.createVector(0, 0);
            }
            if (this.pos.y < 0) {
                this.vel = sketch.createVector(0, 0);
                this.pos = sketch.createVector(this.pos.x, this.r);
            }
        }
        this.impulsion = function () {
            this.vel.add(this.impulse);
            this.pos.add(this.vel);
        }
    }
    function Pipe(speed, minSize, maxSize) {
        this.w = 20;
        this.pos = sketch.createVector(sketch.width + this.w * 2, 0);

        this.speed = speed;
        this.minSize = minSize;
        this.maxSize = maxSize;

        this.hole = sketch.floor(sketch.random(50, sketch.height - 130));
        this.holesize = sketch.floor(sketch.random(this.minSize, this.maxSize));

        this.hit = false;

        this.checkIfHit = function (bird) {
            if (bird.pos.x + bird.r > this.pos.x && bird.pos.x - bird.r < this.pos.x + this.w) {
                if (bird.pos.y > this.hole && bird.pos.y < this.hole + this.holesize) {
                    return false;
                } else {
                    this.hit = true;
                    return true;
                }
            }
        }

        this.update = function () {
            this.pos.x -= this.speed;
        }

        this.show = function () {
            sketch.noStroke();
            if (this.hit) {
                sketch.fill(255, 0, 0);
            } else {
                sketch.fill(51);
            }
            //Bar
            sketch.rect(this.pos.x, this.pos.y, this.w, sketch.height);
            //Hole
            sketch.fill(backgroundColor);
            sketch.rect(this.pos.x - this.w, this.hole, this.w * 2, this.holesize);
        }
    }
}

let flappyBirdsDetails = document.getElementById('flappy-birds-details');
let flappyBirdsSketchV
flappyBirdsDetails.addEventListener("toggle", (event) => {
    if (flappyBirdsDetails.open && !flappyBirdsSketchV) {
        flappyBirdsSketchV = new p5(flappyBirdSketch, document.getElementById('flappy-birds-div'));
    } else if (flappyBirdsDetails.open && flappyBirdsSketchV) {
        flappyBirdsSketchV.loop();
    } else {
        flappyBirdsSketchV.noLoop();
    }
});