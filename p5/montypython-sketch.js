const montyPythonSketch = (sketch) => {
    let doors = [];
    let pickedDoor;

    let reavealedDoor;

    let picked;

    let switchButton;
    let stayButton;
    let startOverButton;

    let resultP;
    let resultP2;
    let winsw = 0;
    let lostsw = 0;
    let wins = 0;
    let losts = 0;
    let choice;

    sketch.startOver = () => {
        for (let i = 0; i < doors.length; i++) {
            doors[i].html('');
            doors[i].style('background-color', '#AAA');
            doors[i].prize = '&#128016';
            doors[i].mousePressed(() => {
                sketch.pick(i);
            })
        }

        let winnerDoor = sketch.random(doors);
        winnerDoor.prize = "&#128050";

        picked = false;

        switchButton.hide();
        stayButton.hide();
        startOverButton.hide();
        if (winsw > 0 || lostsw > 0 || wins > 0 || losts > 0) {
            resultP.elt.innerHTML = 'Chose switch => Wins: ' + winsw + ' / Losses: ' + lostsw;
            resultP2.elt.innerHTML = 'Chose stay&nbsp;&nbsp;&nbsp;=> Wins: ' + wins + ' / Losses: ' + losts;
        } else {
            resultP.elt.innerHTML = '';
            resultP2.elt.innerHTML = '';
        }
    }

    sketch.setup = () => {
        resultP = sketch.createP('');
        resultP2 = sketch.createP('');
        sketch.noCanvas();

        for (let i = 0; i < 3; i++) {
            doors[i] = sketch.createDiv('');
            doors[i].parent('doors');
            doors[i].class('door');
        }


        switchButton = sketch.createButton("switch");
        stayButton = sketch.createButton("stay");
        switchButton.mousePressed(sketch.playerSwitch);
        stayButton.mousePressed(sketch.playerStay);

        startOverButton = sketch.createButton('Star Over');
        startOverButton.mousePressed(sketch.startOver);


        switchButton.parent('monty-python-div');
        stayButton.parent("monty-python-div");
        startOverButton.parent("monty-python-div");


        sketch.startOver();
    }

    sketch.pick = (i) => {
        if (!picked) {
            console.log(this.prize);
            console.log("doors", i, doors[0]);
            pickedDoor = doors[i];
            pickedDoor.elt.style.backgroundColor = '#AFA';
            sketch.revealDoor();
        }
    }

    sketch.revealDoor = () => {
        availableDoors = [];
        for (let i = 0; i < doors.length; i++) {
            if (doors[i] !== pickedDoor && doors[i].prize !== "&#128050") {
                availableDoors.push(doors[i]);
            }
        }
        reavealedDoor = sketch.random(availableDoors);
        reavealedDoor.elt.innerHTML = reavealedDoor.prize;
        picked = true;
        switchButton.show();
        stayButton.show();
    }

    sketch.playerSwitch = () => {

        pickedDoor.elt.style.backgroundColor = '#AAA';
        // pickedDoor.style('background-color', '#AAA');
        let swDoor;
        for (let i = 0; i < doors.length; i++) {
            if (doors[i] !== pickedDoor && doors[i] !== reavealedDoor) {
                swDoor = doors[i];
            }
        }
        pickedDoor = swDoor;
        choice = true;
        sketch.checkWin()
    }

    sketch.playerStay = () => {
        choice = false;
        sketch.checkWin();
    }

    sketch.checkWin = () => {
        for (let i = 0; i < doors.length; i++) {
            if (doors[i].prize == "&#128050") {
                doors[i].elt.innerHTML = "&#128050"
            } else {
                doors[i].elt.innerHTML = "&#128016"
            }

        }

        if (pickedDoor.prize == "&#128050") {
            if (choice) winsw++; else wins++;
            pickedDoor.elt.style.backgroundColor = '#AFA';
        } else {
            if (choice) lostsw++; else losts++;
            pickedDoor.elt.style.backgroundColor = '#FAF';
        }
        resultP.elt.innerHTML = 'Chose switch => Wins: ' + winsw + ' / Losses: ' + lostsw + ' => Total: ' + (winsw + lostsw);
        resultP2.elt.innerHTML = 'Chose stay&nbsp;&nbsp;&nbsp;=> Wins: ' + wins + ' / Losses: ' + losts + ' => Total: ' + (wins + losts);
        startOverButton.show();
    }
}

let mpSketch = new p5(montyPythonSketch, document.getElementById('monty-python-div'));