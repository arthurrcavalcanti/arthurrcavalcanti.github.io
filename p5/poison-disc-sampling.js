let poisonDiscSamplingSketch = (sketch) => {
    let r = 5;
    let k = 30;
    let grid = [];
    let cellsize;
    let active = [];
    let cols;
    let rows;
    let btn;
    sketch.setup = () => {
        let c = sketch.createCanvas(700, 500);
        c.parent('canvas-poison-disc-sampling');
        btn = sketch.createButton('reset');
        btn.parent('poison-disc-sampling-div');
        btn.mousePressed(sketch.reset);
        sketch.strokeWeight(2);

        sketch.reset();

    }

    sketch.reset = () => {
        grid = [];
        active = [];
        //STEP 0
        cellsize = r / sketch.sqrt(2); //2 is the dimension size
        cols = sketch.floor(sketch.width / cellsize);
        rows = sketch.floor(sketch.width / cellsize);

        for (let i = 0; i < cols * rows; i++) {
            grid[i] = undefined;
        }

        //STEP 1
        let x = sketch.width / 2;
        let y = sketch.height / 2;
        let i = sketch.floor(x / cellsize);
        let j = sketch.floor(y / cellsize);
        let pos = sketch.createVector(x, y);
        grid[i + j * cols] = pos;
        active.push(pos);
    }

    sketch.draw = () => {
        sketch.background(0);
        //noLoop();
        for (let total = 0; total < 25; total++) {
            if (active.length > 0) {
                let randIndex = sketch.floor(sketch.random(active.length));
                let pos = active[randIndex];
                let found = false;
                for (let n = 0; n < k; n++) {
                    let sample = p5.Vector.random2D();
                    let m = sketch.random(r, 2 * r);
                    sample.setMag(m);
                    sample.add(pos);

                    let col = sketch.floor(sample.x / cellsize);
                    let row = sketch.floor(sample.y / cellsize);

                    if (col > -1 && row > -1 && col < cols && row < rows && !grid[cols + row * cols]) {
                        let ok = true;
                        for (let i = -1; i <= 1; i++) {
                            for (let j = -1; j <= 1; j++) {
                                let indeX = (col + i) + (row + j) * cols;
                                let neighbor = grid[indeX];
                                if (neighbor) {
                                    let d = p5.Vector.dist(sample, neighbor);
                                    if (d < cellsize) {
                                        ok = false;
                                    }
                                }
                            }
                        }
                        if (ok) {
                            found = true;
                            grid[col + row * cols] = sample;
                            active.push(sample);
                        }
                    }
                }
                if (!found) {
                    active.splice(randIndex, 1);
                }
            }
        }
        for (let i = 0; i < cols * rows; i++) {
            if (grid[i]) {
                sketch.stroke(255);
                sketch.strokeWeight(1);
                sketch.point(grid[i].x, grid[i].y);
            }
        }
        for (let i = 0; i < active.length; i++) {
            sketch.stroke(255, 0, 255);
            sketch.strokeWeight(1);
            sketch.point(active[i].x, active[i].y);
        }
        if (active.length == 0) {
            noLoop();
        }
    }
}

let poisonDiscSamplingDetails = document.getElementById('poison-disc-details');
let poisonDiscSamplingSketchV
poisonDiscSamplingDetails.addEventListener("toggle", (event) => {
    if (poisonDiscSamplingDetails.open && !poisonDiscSamplingSketchV) {
        poisonDiscSamplingSketchV = new p5(poisonDiscSamplingSketch, document.getElementById('poison-disc-sampling-div'));
    } else if (poisonDiscSamplingDetails.open && poisonDiscSamplingSketchV) {
        poisonDiscSamplingSketchV.loop();
    } else {
        poisonDiscSamplingSketchV.noLoop();
    }
});