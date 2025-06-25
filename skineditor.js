const editorCanvas = document.getElementById("editor-canvas");
const context = editorCanvas.getContext("2d");

const brushDrawSizeSlider = document.getElementById("brush-draw-size")

let startX = 0
let startY = 0
let endX = 0
let endY = 0
let width = 0;
let height = 0;

var fullSkinCanvas;
var fullSkinContext;
var loadedSkin;

var brushSize = 1;

loadURLAsCanvas("/default_skin.png");

skinDimensions = {
    "Head": {
        "Top": {
            "Base": [8,0,15,7],
            "Outer": [40,0,47,7]
        },
        "Bottom": {
            "Base": [16,0,23,7],
            "Outer": [48,0,55,7]
        },
        "Left": {
            "Base": [0,8,7,15],
            "Outer": [32,8,39,15]
        },
        "Right": {
            "Base": [16,8,23,15],
            "Outer": [48,8,55,15]
        },
        "Front": {
            "Base": [8,8,15,15],
            "Outer": [40,8,47,15]
        },
        "Back": {
            "Base": [24,8,31,15],
            "Outer": [56,8,63,15]
        }
    },
    "Body": {
        "Top": {
            "Base": [20,16,27,19],
            "Outer": [20,32,27,35]
        },
        "Bottom": {
            "Base": [28,16,35,19],
            "Outer": [28,32,35,35]
        },
        "Left": {
            "Base": [16,20,19,31],
            "Outer": [16,36,19,47]
        },
        "Right": {
            "Base": [28,20,31,31],
            "Outer": [28,36,31,47]
        },
        "Front": {
            "Base": [20,20,27,31],
            "Outer": [20,36,27,47]
        },
        "Back": {
            "Base": [32,20,39,31],
            "Outer": [32,36,39,47]
        }
    },
    "Left Arm": {
        "Top": {
            "Base": [44,16,47,19],
            "Outer": [44,32,47,35]
        },
        "Bottom": {
            "Base": [48,16,51,19],
            "Outer": [48,32,51,35]
        },
        "Left": {
            "Base": [40,20,43,31],
            "Outer": [40,36,43,47]
        },
        "Right": {
            "Base": [52,20,55,31],
            "Outer": [52,36,55,47]
        },
        "Front": {
            "Base": [44,20,47,31],
            "Outer": [44,36,47,47]
        },
        "Back": {
            "Base": [48,20,51,31],
            "Outer": [48,36,51,47]
        }
    },
    "Right Arm": {
        "Top": {
            "Base": [36,48,39,51],
            "Outer": [52,48,55,51]
        },
        "Bottom": {
            "Base": [40,48,43,51],
            "Outer": [56,48,59,51]
        },
        "Left": {
            "Base": [32,52,35,63],
            "Outer": [48,52,51,63]
        },
        "Right": {
            "Base": [28,52,31,63],
            "Outer": [60,52,63,63]
        },
        "Front": {
            "Base": [36,52,39,63],
            "Outer": [52,52,55,63]
        },
        "Back": {
            "Base": [44,52,47,63],
            "Outer": [60,52,63,63]
        }
    },
    "Left Leg": {
        "Top": {
            "Base": [4,16,7,19],
            "Outer": [4,32,7,35]
        },
        "Bottom": {
            "Base": [8,16,11,19],
            "Outer": [8,32,11,35]
        },
        "Left": {
            "Base": [0,20,3,31],
            "Outer": [0,36,3,47]
        },
        "Right": {
            "Base": [12,20,15,31],
            "Outer": [12,36,15,47]
        },
        "Front": {
            "Base": [4,20,7,31],
            "Outer": [4,36,7,47]
        },
        "Back": {
            "Base": [8,20,11,31],
            "Outer": [8,36,11,47]
        }
    },
    "Right Leg": {
        "Top": {
            "Base": [20,48,23,51],
            "Outer": [4,48,7,51]
        },
        "Bottom": {
            "Base": [24,48,27,51],
            "Outer": [8,48,11,51]
        },
        "Left": {
            "Base": [16,52,19,63],
            "Outer": [0,52,3,63]
        },
        "Right": {
            "Base": [28,52,31,63],
            "Outer": [12,52,15,63]
        },
        "Front": {
            "Base": [20,52,23,63],
            "Outer": [4,52,7,63]
        },
        "Back": {
            "Base": [28,52,31,63],
            "Outer": [12,52,15,63]
        }
    }
}

function loadURLAsCanvas(url) {
    loadedSkin = new Image();
    loadedSkin.onload = () => {
        fullSkinCanvas.width = loadedSkin.width;
        fullSkinCanvas.height = loadedSkin.height;
        fullSkinContext.drawImage(loadedSkin, 0, 0);
        loadSectionToCanvas();
    }
    loadedSkin.src = url;
    fullSkinCanvas = document.createElement("canvas");
    
    fullSkinContext = fullSkinCanvas.getContext("2d");
    
}

function updateBrushDrawSize() {
    brushSize = Number(brushDrawSizeSlider.value);
}

function loadSectionToCanvas() {
    
    let layer = getSelectedLayer();
    let side = getSelectedSide();
    let part = getSelectedPart();
    if ([layer, side, part].includes(undefined)) return;

    let dimensions = skinDimensions[part][side][layer];
    startX = dimensions[0];
    startY = dimensions[1];
    endX = dimensions[2]+1;
    endY = dimensions[3]+1;
    width = endX-startX;
    height = endY-startY;

    context.canvas.width = width;
    context.canvas.height = height;

    context.drawImage(fullSkinCanvas, startX, startY, width, height, 0, 0, width, height);
}

function getSelectedLayer() {
    var input = document.querySelector('input[name="layer"]:checked')
    if (input) return input.value;
}
function getSelectedSide() {
    var input = document.querySelector('input[name="side"]:checked');
    if (input) return input.value;
}
function getSelectedPart() {
    var input = document.querySelector('input[name="part"]:checked');
    if (input) return input.value;
}

function saveSkin() {
    var link = document.createElement('a');
    link.download = 'skin.png';
    link.href = fullSkinCanvas.toDataURL()
    link.click();
}

function applyBrushAt(x, y) {

    // Do for current view context
    context.fillStyle = "rgb(255 0 0)";
    context.fillRect(x, y, brushSize, brushSize);

    // Do for full skin
    x += startX;
    y += startY;
    fullSkinContext.fillStyle = "rgb(255 0 0)";
    fullSkinContext.fillRect(x, y, brushSize, brushSize);
}

editorCanvas.onclick = function(e) {
    let pixelX = Math.floor((e.offsetX/editorCanvas.clientWidth)*width);
    let pixelY = Math.floor((e.offsetY/editorCanvas.clientHeight)*height);
    console.log(pixelX, pixelY);
    applyBrushAt(pixelX, pixelY);
}