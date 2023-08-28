let phyllotaxisSketch = (sketch) => {
    let n = 0;
    let c = 4;
    let slider;
    let sliderValue;
    let currValue;
    sketch.setup = () => {
        let c = sketch.createCanvas(400, 400);
        c.parent('canvas-phyllotaxis');
        slider = sketch.createSlider(0, 360, 137.5, 0.5);
        sliderValue = sketch.createP('');
        slider.parent('phyllotaxis-div');
        sliderValue.parent('phyllotaxis-div');
        sketch.background(0);
        sketch.angleMode(sketch.DEGREES);
        sketch.colorMode(sketch.HSB);
    }

    sketch.draw = () => {
        if (currValue != slider.value()) {
            sketch.background(0);
            n = 0;
        }
        sliderValue.html(slider.value());
        let a = n * slider.value();
        let r = c * sketch.sqrt(n);
        let x = r * sketch.cos(a) + sketch.width / 2;
        let y = r * sketch.sin(a) + sketch.height / 2;

        sketch.fill(255);
        //fill((a-r)%256, 255,255);
        sketch.noStroke();
        sketch.ellipse(x, y, 4, 4);

        n++;
        currValue = slider.value();
    }
}

let phyllotaxisDetails = document.getElementById('phyllotaxis-details');
let phyllotaxisSketchV
phyllotaxisDetails.addEventListener("toggle", (event) => {
    if (phyllotaxisDetails.open && !phyllotaxisSketchV) {
        phyllotaxisSketchV = new p5(phyllotaxisSketch, document.getElementById('phyllotaxis-div'));
    } else if (phyllotaxisDetails.open && phyllotaxisSketchV) {
        phyllotaxisSketchV.loop();
    } else {
        phyllotaxisSketchV.noLoop();
    }
});