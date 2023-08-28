let agarioSketch = (sketch) => {
    let blob;
    let blobs = [];
    let startingRadius;

    sketch.setup = () => {
        sketch.createCanvas(700, 700);
        startingRadius = 32;
        blob = new Blob(0, 0, startingRadius);
        for (let i = 0; i < 500; i++) {
            blobs[i] = new Blob(sketch.random(-sketch.width * 4, sketch.width * 4), sketch.random(-sketch.height * 4, sketch.height * 4), sketch.floor(sketch.random(8, startingRadius)));
        }

    }

    sketch.draw = () => {
        sketch.background(0);

        sketch.translate(sketch.width / 2, sketch.height / 2);
        sketch.scale(startingRadius / blob.r);
        sketch.translate(-blob.pos.x, -blob.pos.y);

        for (let i = blobs.length - 1; i >= 0; i--) {

            blobs[i].show();
            if (blob.eats(blobs[i])) {
                blobs.splice(i, 1);
            }
        }

        blob.show();
        blob.update();


    }

    function Blob(x, y, r) {
        this.pos = sketch.createVector(x, y);
        this.r = r;

        this.eats = function (other) {
            let d = p5.Vector.dist(this.pos, other.pos);
            if (d < this.r) {
                let sum = sketch.PI * this.r * this.r + sketch.PI * other.r * other.r;
                this.r = sketch.sqrt(sum / sketch.PI);
                return true;
            } else {
                return false;
            }
        }

        this.update = function () {
            let dir = sketch.createVector(sketch.mouseX - sketch.width / 2, sketch.mouseY - sketch.height / 2);
            dir.setMag(3);
            this.pos.add(dir);
        }
        this.show = function () {
            sketch.fill(255);
            sketch.ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
        }
    }
}

let agarioDetails = document.getElementById('agario-details');
let agarioSketchV
agarioDetails.addEventListener("toggle", (event) => {
    if (agarioDetails.open && !agarioSketchV) {
        agarioSketchV = new p5(agarioSketch, document.getElementById('agario-div'));
    } else if (agarioDetails.open && agarioSketchV) {
        agarioSketchV.loop();
    } else {
        agarioSketchV.noLoop();
    }
});