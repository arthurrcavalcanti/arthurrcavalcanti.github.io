const giftWrapSketch = (sketch) => {
    // Arthur Cavalcanti - 11/mar/2020 
    // Coding Challenge from CodingTrain

    // Gift Wrapping Algorithm
    // My own take!

    let spacing;
    let points;
    let giftP;
    let angle;
    let currentP;
    let nextPoint;
    let leftMost;
    let end;


    let numOfPoints = 80; // Number of starting points
    let speed = 0.005; // speed with which the angle changes
    let precision = 100; // value threashold for the z during a cross product to be considered a parallel vector
    let domP;
    sketch.setup = () => {
        let c = sketch.createCanvas(400, 250);
        let resetButton = sketch.createButton('reset');
        resetButton.mousePressed(reset);
        resetButton.parent('gift-wrapping-div')
        c.parent('canvas-gift-wrapping');
        spacing = 400 * 0.05;
        domP = sketch.createP('Precision:');
        domP.parent('gift-wrapping-div');
        reset();
    }

    sketch.draw = () => {
        sketch.background(0);
        sketch.fill(255);
        sketch.noStroke();
        sketch.frameRate(30);
        for (let i = 0; i < points.length; i++) {
            sketch.ellipse(points[i].x, points[i].y, 4, 4);
        }

        sketch.stroke(255);
        sketch.strokeWeight(3);
        if (end) {
            sketch.fill(0, 255, 100, 10);
        } else {
            sketch.noFill()
        }
        sketch.beginShape();
        for (let i = 0; i < giftP.length; i++) {
            sketch.vertex(giftP[i].x, giftP[i].y);
        }
        sketch.endShape();

        if (!end) {

            for (let i = 0; i < giftP.length; i++) {
                sketch.fill(255, 0, 255);
                sketch.ellipse(giftP[i].x, giftP[i].y, 8, 8);
            }

            sketch.push();
            sketch.translate(currentP.x, currentP.y);
            let x = -100 * sketch.cos(angle);
            let y = -100 * sketch.sin(angle);
            let currentV = sketch.createVector(x, y);
            sketch.stroke(0, 255, 0, 255);
            sketch.strokeWeight(2);
            sketch.line(0, 0, x, y);

            for (let i = 0; i < points.length; i++) {

                let px = points[i].x - currentP.x;
                let py = points[i].y - currentP.y;
                let cp = sketch.createVector(px, py);
                sketch.stroke(0, 255, 120, 50);
                sketch.strokeWeight(1);
                sketch.line(0, 0, px, py);

                let a = p5.Vector.cross(currentV, cp);

                if (sketch.abs(a.z) < precision && px != 0 && (points[i] != leftMost || giftP.length > 3)) {
                    // console.log("precision = " + sketch.abs(a.z));
                    domP.elt.innerHTML = "Precision: " + sketch.abs(a.z);
                    nextPoint = points[i];

                    if (nextPoint != leftMost) {

                        points.splice(i, 1);

                    } else {
                        domP.elt.innerHTML = "End";
                        // console.log("END");
                        end = true;
                    }
                    break;
                }
            }
            sketch.pop();

            angle += speed;

            if (nextPoint != null) {
                currentP = nextPoint;
                giftP.push(currentP);
                nextPoint = null;
            } else if (end) {
                currentP = leftMost;
            }

        } else {

            setTimeout(reset, 3000);
        }
    }

    const reset = () => {
        giftP = [];
        points = [];
        nextPoint = null;
        currentP = null;

        leftMost = sketch.createVector(sketch.width + spacing, 0);

        angle = sketch.PI / 2

        for (let i = 0; i < numOfPoints; i++) {
            let x = sketch.floor(sketch.random(spacing, sketch.width - spacing));
            let y = sketch.floor(sketch.random(spacing, sketch.height - spacing));
            let point = sketch.createVector(x, y);

            points.push(point);

            if (point.x < leftMost.x) {
                leftMost = point;
            }
        }

        giftP.push(leftMost);

        currentP = leftMost;

        end = false;
    }
}

let giftWrappingDetails = document.getElementById('gift-wrapping-details');
let giftWrapSketchV;
giftWrappingDetails.addEventListener("toggle", (event) => {
    if (giftWrappingDetails.open && !giftWrapSketchV) {
        giftWrapSketchV = new p5(giftWrapSketch, document.getElementById('gift-wrapping-div'));
    } else if (giftWrappingDetails.open && giftWrapSketchV) {
        giftWrapSketchV.loop();
    } else {
        giftWrapSketchV.noLoop();
    }
})


