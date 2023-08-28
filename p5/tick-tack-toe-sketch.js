let ticktacktoeSketch = (sketch) => {
    let size;
    let grid = [];
    let gridCheck = [];
    let turn;

    let resultP;
    sketch.setup = () => {
        let c = sketch.createCanvas(400, 400);
        c.parent('canvas-tick-tack-toe')
        resultP = sketch.createP('');
        size = sketch.width / 3;
        sketch.reset();
        let btn = sketch.createButton('reset');
        btn.parent('tick-tack-toe-div');
        btn.mousePressed(sketch.reset);
    }

    sketch.reset = () => {
        grid = [];
        gridCheck = [];
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                grid.push(sketch.createVector(x, y, {
                    r: 220,
                    g: 220,
                    b: 220
                }));
                gridCheck.push(0);
            }
        }
        turn = true;
    }

    sketch.mousePressed = () => {
        sketch.setX(sketch.mouseX, sketch.mouseY, turn);
        sketch.checkWin();
        if (turn) {
            turn = false;
        } else {
            turn = true;
        }
    }

    sketch.draw = () => {
        sketch.background(220);
        sketch.drawTictactoeTable();
    }

    sketch.checkWin = () => {
        let greens = [];
        let reds = [];
        for (let i = 0; i < gridCheck.length; i++) {
            if (gridCheck[i] == 0 || gridCheck[i] == 1) {
                greens[i] = 0;
            } else {
                greens[i] = 1;
            }
        }
        for (let i = 0; i < gridCheck.length; i++) {
            reds[i] = gridCheck[i] % 2;
        }

        for (let i = 0; i < winCond.length; i++) {
            let won = 0;
            if (turn) {
                for (let j = 0; j < reds.length; j++) {
                    if (reds[j] == winCond[i][j] && reds[j] == 1) {
                        won++;
                    }
                }
            } else {
                for (let j = 0; j < greens.length; j++) {
                    if (greens[j] == winCond[i][j] && greens[j] == 1) {
                        won++;
                    }
                }
            }
            if (won >= 3) {
                if (turn) {
                    resultP.elt.innerHTML = 'Red Player Wins!';
                } else {
                    resultP.elt.innerHTML = 'Green Player Wins!';
                }
            } else {
                won = 0;
            }
        }

    }

    sketch.setX = (x, y) => {
        if (x > 266) {
            x = 2;
        } else if (x > 133) {
            x = 1;
        } else {
            x = 0;
        }

        if (y > 266) {
            y = 2;
        } else if (y > 133) {
            y = 1
        } else {
            y = 0;
        }

        for (let i = 0; i < grid.length; i++) {
            if (grid[i].x == x && grid[i].y == y) {
                sketch.noStroke();
                if (turn) {
                    grid[i].z = {
                        r: 255,
                        g: 0,
                        b: 60,
                        turn
                    };
                    gridCheck[i] = 1;
                } else {
                    grid[i].z = {
                        r: 0,
                        g: 155,
                        b: 60,
                        turn
                    };
                    gridCheck[i] = 2;
                }
            }
        }
    }


    sketch.drawTictactoeTable = () => {
        sketch.stroke(0);
        sketch.strokeWeight(2);
        sketch.line(size, 10, size, sketch.height - 10);
        sketch.line(size * 2, 10, size * 2, sketch.height - 10);
        sketch.line(10, size, sketch.width - 10, size);
        sketch.line(10, size * 2, sketch.width - 10, size * 2);

        sketch.noStroke();
        for (let i = 0; i < grid.length; i++) {
            sketch.fill(grid[i].z.r, grid[i].z.g, grid[i].z.b);
            if (grid[i].z.turn) {
                sketch.rect(grid[i].x * size + 10, grid[i].y * size + 10, 113, 113);
            } else {
                sketch.ellipse(grid[i].x * size + (130 / 2), grid[i].y * size + (130 / 2), 113, 113);
            }

        }
    }

    let winCond = [
        [1, 1, 1,
            0, 0, 0,
            0, 0, 0
        ],
        [0, 0, 0,
            1, 1, 1,
            0, 0, 0
        ],
        [0, 0, 0,
            0, 0, 0,
            1, 1, 1
        ],
        [1, 0, 0,
            1, 0, 0,
            1, 0, 0
        ],
        [0, 1, 0,
            0, 1, 0,
            0, 1, 0
        ],
        [0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ],
        [1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ],
        [0, 0, 1,
            0, 1, 0,
            1, 0, 0
        ]
    ];
}

let tickTackToeDetails = document.getElementById('tick-tack-toe-details');
let tickTackToeSketchV;
tickTackToeDetails.addEventListener("toggle", (event) => {
    if (tickTackToeDetails.open && !tickTackToeSketchV) {
        tickTackToeSketchV = new p5(ticktacktoeSketch, document.getElementById('tick-tack-toe-div'));
    } else if (tickTackToeDetails.open && tickTackToeSketchV) {
        tickTackToeSketchV.loop();
    } else {
        tickTackToeSketchV.noLoop();
    }
});