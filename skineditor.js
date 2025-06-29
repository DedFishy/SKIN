import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Editor constants
const editorCanvas = document.getElementById("editor-canvas");
const editorCanvasContainer = document.getElementById("editor-canvas-container");
const context = editorCanvas.getContext("2d");

// Element constants
const previewContainer = document.getElementById("preview");
const brushDrawSizeSlider = document.getElementById("brush-draw-size")
const skinAccountNameInput = document.getElementById("skin-account-name");
const brushColorInput = document.getElementById("brush-color");
const messageBox = document.getElementById("message-box");
const messageBoxContent = document.getElementById("message-box-content");
const brushSizeSlider = document.getElementById("brush-draw-size")

// Tutorial hidey showey
var hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
if (hasSeenTutorial == null) {
    hasSeenTutorial = false;
    localStorage.setItem("hasSeenTutorial", "no");
}
if (localStorage.getItem("hasSeenTutorial") == "yes") {
    messageBox.classList.remove("visible");
}

// Event Listeners
brushSizeSlider.onchange = () => {updateBrushDrawSize()};
document.getElementById("save-skin").onclick = () => {saveSkin()};
document.getElementById("load-skin-from-account").onclick = () => {loadURLAsCanvas("https://mineskin.eu/skin/" + skinAccountNameInput.value)};
document.getElementById("open-skin").onchange = (event) => {loadFileEvent(event.target)};
document.getElementById("message-box-acknowledge").onclick = (event) => {messageBox.classList.remove("visible"); localStorage.setItem("hasSeenTutorial", "yes")};
document.body.onload = () => {
    updatePreviewSize();
}
document.body.onresize = () => {
    updatePreviewSize();
    loadSectionToCanvas();
    
}
document.body.onkeydown = (e) => { // Keyboard shortcuts
    if (e.target.tagName == "INPUT") return;
    const key = e.key.toLowerCase();
    if (key == "b") setSelectedLayer("Base");
    else if (key == "o") setSelectedLayer("Outer");
    else if (key == "d") setSelectedBrush("Draw");
    else if (key == "e") setSelectedBrush("Eyedropper");
    else if (key == "f") setSelectedBrush("Bucket");
    else if (key == "=" || key == "+") brushSizeSlider.value++;
    else if (key == "-" || key == "_") brushSizeSlider.value--;
    else if (key == "c") brushColorInput.click();

    loadSectionToCanvas();
}

// Option selector listener
const multioptions = document.getElementsByClassName("multioption");
for(let i = 0; i < multioptions.length; i++) {
    multioptions[i].onclick = () => {loadSectionToCanvas(); updatePreviewTexture(); updatePose();};
}

// Drawing runtime variables
let startX = 0
let startY = 0
let endX = 0
let endY = 0
let width = 0;
let height = 0;

var brushSize = 1;

// Skin runtime variables
var fullSkinCanvas;
var fullSkinContext;
var loadedSkin;

// Load the default skin
loadURLAsCanvas("/default-skin.png");

// Locations of different body parts on the skin PNG
const skinDimensions = {
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
            "Classic": {
                "Base": [44,16,47,19],
                "Outer": [44,32,47,35]
            },
            "Slim": {
                "Base": [44,16,46,19],
                "Outer": [44,32,46,35]
            }
        },
        "Bottom": {
            "Classic": {
                "Base": [48,16,51,19],
                "Outer": [48,32,51,35]
            },
            "Slim": {
                "Base": [47,16,49,19],
                "Outer": [47,32,49,35]
            }
        },
        "Left": {
            "Classic": {
                "Base": [40,20,43,31],
                "Outer": [40,36,43,47]
            },
            "Slim": {
                "Base": [40,20,43,31],
                "Outer": [40,36,43,47]
            }
        },
        "Right": {
            "Classic": {
                "Base": [48,20,51,31],
                "Outer": [48,36,51,47]
            },
            "Slim": {
                "Base": [50,20,53,31],
                "Outer": [50,36,53,47]
            }
        },
        "Front": {
            "Classic": {
                "Base": [44,20,47,31],
                "Outer": [44,36,47,47]
            },
            "Slim": {
                "Base": [44,20,46,31],
                "Outer": [44,36,46,47]
            }
        },
        "Back": {
            "Classic": {
                "Base": [52,20,55,31],
                "Outer": [52,36,55,47]
                
            },
            "Slim": {
                "Base": [47,20,49,31],
                "Outer": [47,36,49,47]
            }
        }
    },
    "Right Arm": {
        "Top": {
            "Classic": {
                "Base": [36,48,39,51],
                "Outer": [52,48,55,51]
            },
            "Slim": {
                "Base": [36,48,38,51],
                "Outer": [52,48,54,51]
            }
        },
        "Bottom": {
            "Classic": {
                "Base": [40,48,43,51],
                "Outer": [56,48,59,51]
            },
            "Slim": {
                "Base": [39,48,41,51],
                "Outer": [55,48,57,51]
            }
        },
        "Left": {
            "Classic": {
                "Base": [32,52,35,63],
                "Outer": [48,52,51,63]
            },
            "Slim": {
                "Base": [32,52,35,63],
                "Outer": [48,52,51,63]
            }
        },
        "Right": {
            "Classic": {
                "Base": [40,52,43,63],
                "Outer": [56,52,59,63]
            },
            "Slim": {
                "Base": [40,52,43,63],
                "Outer": [60,52,63,63]
            }
        },
        "Front": {
            "Classic": {
                "Base": [36,52,39,63],
                "Outer": [52,52,55,63]
            },
            "Slim": {
                "Base": [36,52,38,63],
                "Outer": [55,52,57,63]
            }
        },
        "Back": {
            "Classic": {
                "Base": [44,52,47,63],
                "Outer": [60,52,63,63]
            },
            "Slim": {
                "Base": [39,52,41,63],
                "Outer": [55,52,57,63]
            }
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
            "Base": [8,20,11,31],
            "Outer": [8,36,11,47]
        },
        "Front": {
            "Base": [4,20,7,31],
            "Outer": [4,36,7,47]
        },
        "Back": {
            "Base": [12,20,15,31],
            "Outer": [12,36,15,47]
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
            "Base": [24,52,27,63],
            "Outer": [8,52,11,63]
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

// Where the pivot points of different body parts are (for posing the model)
const partPivotPoints = {
    "Head": [0, -8, 0],
    "Body": [0, 0, 0],
    "Left Arm": [0, -4, 0],
    "Right Arm": [0, -4, 0],
    "Left Leg": [0, 4, 0],
    "Right Leg": [0, 4, 0],
}

// Popup message
function showMessage(message) {
    messageBoxContent.innerText = message;
    messageBox.classList.add("visible");
}

// Takes a URL (data or otherwise) and loads it as the current skin
function loadURLAsCanvas(url) {
    loadedSkin = new Image();
    loadedSkin.crossOrigin = "anonymous";
    loadedSkin.onload = () => {
        if (loadedSkin.width != 64 || loadedSkin.height != 64) {
            showMessage("Skin file mush be 64x64!");
        } else {

            fullSkinCanvas = document.createElement("canvas");
            
            fullSkinContext = fullSkinCanvas.getContext("2d");
            fullSkinCanvas.width = loadedSkin.width;
            fullSkinCanvas.height = loadedSkin.height;
            fullSkinContext.drawImage(loadedSkin, 0, 0);
            loadSectionToCanvas();
            updatePreviewTexture();   

        }  
    }
    loadedSkin.src = url;
}
// Callback for when a user loads a local skin file
function loadFileEvent(fileElement) {
    const selectedFile = fileElement.files[0]; // Access the first selected file
        if (selectedFile) {
            var reader = new FileReader();
            reader.onload = function(event){
                
                loadURLAsCanvas(event.target.result);
            }
            reader.readAsDataURL(fileElement.files[0]);
        } else {
            console.log('No file selected.');
        }
}

// Convert the brush slider's value (which is a STRING for some reason) to a number
function updateBrushDrawSize() {
    brushSize = Number(brushDrawSizeSlider.value);
}

// Converts RGB value to hex to coordinate the canvas's RGB with the color selector's hex
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
// Converts a whole RGB tuple to a hex string
function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// Reads the user selected options for what area of the skin file to load, loading it into the editor canvas
function loadSectionToCanvas() {
    
    let layer = getSelectedLayer();
    let side = getSelectedSide();
    let part = getSelectedPart();
    let type = getSelectedType();
    if ([layer, side, part, type].includes(undefined)) return;

    let dimensions = part.includes("Arm") ? skinDimensions[part][side][type][layer] : skinDimensions[part][side][layer];
    startX = dimensions[0];
    startY = dimensions[1];
    endX = dimensions[2]+1;
    endY = dimensions[3]+1;
    width = endX-startX;
    height = endY-startY;

    context.canvas.width = width;
    context.canvas.height = height;

    const maxWidth = editorCanvasContainer.clientWidth;
    const maxHeight = editorCanvasContainer.clientHeight;

    const sectionSizeRatio = width/height;
    const canvasSizeRatio = maxWidth/maxHeight

    if (canvasSizeRatio < sectionSizeRatio) { // Height is greater than width
        context.canvas.width = maxWidth;
        context.canvas.height = 1/sectionSizeRatio * maxWidth;
    } else {
        context.canvas.height = maxHeight;
        context.canvas.width = sectionSizeRatio * maxHeight;
    }

    context.imageSmoothingEnabled = false;

    context.drawImage(fullSkinCanvas, startX, startY, width, height, 0, 0, editorCanvas.width, editorCanvas.height);
    
}

// Read/Write the radio buttons for the current layer
function getSelectedLayer() {
    var input = document.querySelector('input[name="layer"]:checked')
    if (input) return input.value;
}
function setSelectedLayer(layer) {
    var inputs = document.getElementsByName('layer');
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value == layer) {
            inputs[i].checked = true;
        }
    }
}

// Read/Write the radio buttons for the current side
function getSelectedSide() {
    var input = document.querySelector('input[name="side"]:checked');
    if (input) return input.value;
}
function setSelectedSide(side) {
    var inputs = document.getElementsByName('side');
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value == side) {
            inputs[i].checked = true;
        }
    }
}

// Read/Write the radio buttons for the current part
function getSelectedPart() {
    var input = document.querySelector('input[name="part"]:checked');
    if (input) return input.value;
}
function setSelectedPart(part) {
    var inputs = document.getElementsByName('part');
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value == part) {
            inputs[i].checked = true;
        }
    }
}

// Read/Write the radio buttons for the current type of skin
function getSelectedType() {
    var input = document.querySelector('input[name="type"]:checked');
    if (input) return input.value;
}
function setSelectedType(type) {
    var inputs = document.getElementsByName('type');
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value == type) {
            inputs[i].checked = true;
        }
    }
}

// Read/Write the radio buttons for the current brush
function getSelectedBrush() {
    var input = document.querySelector('input[name="brush"]:checked');
    if (input) return input.value;
}
function setSelectedBrush(brush) {
    var inputs = document.getElementsByName('brush');
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value == brush) {
            inputs[i].checked = true;
        }
    }
}

// Read the radio buttons for the current pose
function getSelectedPose() {
    var input = document.querySelector('input[name="pose"]:checked');
    if (input) return input.value;
}

// Creates a download link for the current skin based on the internal canvas and clicks it
function saveSkin() {
    var link = document.createElement('a');
    link.download = 'skin.png';
    link.href = fullSkinCanvas.toDataURL()
    link.click();
}

// Get the hex color value of the skin at a given coordinate
function getHexPixelAt(x, y) {
    const pixelData = fullSkinContext.getImageData(x, y, 1, 1).data;
    return rgbToHex(pixelData[0],pixelData[1], pixelData[2]);
}

// Applies the current brush at a coordinate, either erasing or filling depending on "fill"
function applyBrushAt(x, y, fill=true) {

    const brush = getSelectedBrush();

    context.fillStyle = brushColorInput.value;

    x += startX;
    y += startY;

    fullSkinContext.fillStyle = brushColorInput.value;

    if (brush == "Draw") {

        // Center brush
        x -= Math.floor(brushSize/2);
        y -= Math.floor(brushSize/2);
        var drawPosX = Math.max(x, startX);
        var drawPosY = Math.max(y, startY)
        var drawWidth = Math.min(brushSize, endX-drawPosX);
        var drawHeight = Math.min(brushSize, endY-drawPosY);
        if (fill) {
            fullSkinContext.fillRect(drawPosX, drawPosY, drawWidth, drawHeight);
        } else {
            fullSkinContext.clearRect(drawPosX, drawPosY, drawWidth, drawHeight);
        }


    } else if (brush == "Eyedropper") {
        brushColorInput.value = getHexPixelAt(x, y);
    } else if (brush == "Bucket") {
        const colorToFill = getHexPixelAt(x, y);
        if (colorToFill == brushColorInput.value) return;

        var checked = []

        const fillAt = (x, y) => {
            const editorSpaceX = x-startX;
            const editorSpaceY = y-startY;
            if (editorSpaceX < 0) return;
            if (editorSpaceY < 0) return;
            if (editorSpaceX >= width) return;
            if (editorSpaceY >= height) return;
            if (checked.includes([x, y])) return;

            checked.push([x, y]);
            if (getHexPixelAt(x, y) == colorToFill) {
                fillPixel(x, y);
            }
        }

        const fillPixel = (x_coord, y_coord) => {
            fullSkinContext.fillRect(x_coord, y_coord, 1, 1);
            

            fillAt(x_coord-1, y_coord);
            fillAt(x_coord+1, y_coord);
            fillAt(x_coord, y_coord+1);
            fillAt(x_coord, y_coord-1);
        }
        fillPixel(x, y);
    }

    loadSectionToCanvas();
}

// Applies the brush at a given event (assumed to be on the editor canvas)
function applyBrush(e) {
    let pixelX = Math.floor((e.offsetX/editorCanvas.clientWidth)*width);
    let pixelY = Math.floor((e.offsetY/editorCanvas.clientHeight)*height);
    applyBrushAt(pixelX, pixelY);
}

// Whether we are currently drawing (so we can draw on the mousemove event)
var isCurrentlyDrawing = false;
// Draw when the mouse is down
editorCanvas.onmousedown = function(e) {
    isCurrentlyDrawing = true;
    applyBrush(e);
}
// Draw when we are dragging
editorCanvas.onmousemove = function(e) {
    if (isCurrentlyDrawing) {
        applyBrush(e);
    }
}
// Stop drawing when we're not dragging (then update the preview)
document.onmouseup = function(e) {
    isCurrentlyDrawing = false;

    updatePreviewTexture();
}

// Erase if we are right clicking
editorCanvas.oncontextmenu = function(e) {
    e.preventDefault();
    let pixelX = Math.floor((e.offsetX/editorCanvas.clientWidth)*width);
    let pixelY = Math.floor((e.offsetY/editorCanvas.clientHeight)*height);
    applyBrushAt(pixelX, pixelY, false);
}

// Fit the preview to its container (raw CSS does not make the cut unfortunately)
function updatePreviewSize() {
    let previewWidth = previewContainer.clientWidth;
    let previewHeight = previewContainer.clientHeight;
    renderer.setSize(previewWidth, previewHeight);
    previewCamera.aspect = (previewWidth/previewHeight);
    previewCamera.updateProjectionMatrix();
}

// Cut out a portion of the canvas and get it as a data URL to load it elsewhere
function getSectionAsURL(layer, side, part, type) {
    if ([layer, side, part, type].includes(undefined)) return;

    let dimensions = part.includes("Arm") ? skinDimensions[part][side][type][layer] : skinDimensions[part][side][layer];
    const startX = dimensions[0];
    const startY = dimensions[1];
    const endX = dimensions[2]+1;
    const endY = dimensions[3]+1;
    const width = endX-startX;
    const height = endY-startY;

    const canvas = document.createElement("canvas");
    const canvasContext = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    canvasContext.drawImage(fullSkinCanvas, startX, startY, width, height, 0, 0, width, height);
    return canvas.toDataURL();
}

// Get a given part as an array of textures that may be placed on a cube (for BoxGeometry)
function getPartAsCubeTextureArray(layer, part) {
    const type = getSelectedType();
    const get = (side) => {return getSectionAsURL(layer, side, part, type)};

    const textures = [
        loader.load(get("Right")),
        loader.load(get("Left")),
        loader.load(get("Top")),
        loader.load(get("Bottom")),
        loader.load(get("Front")),
        loader.load(get("Back")),
    ];
    textures.forEach((value, index, array) => {
        value.colorSpace = THREE.SRGBColorSpace;
    })
    textures[3].flipY = false;
    return textures;

}
// Apply textures to every material in an array
function applyTexArrayToMatArray(texArray, matArray) {
    matArray.forEach((value, index, array) => {
        value.map = texArray[index];
        value.map.minFilter = THREE.NearestFilter;
        value.map.magFilter = THREE.NearestFilter;
    });
}
// Set whether a group of outer layer planes is visible
function setOuterMeshVisibility(mesh, visible) {
    mesh.forEach((value, index, array) => {
        value.visible = visible;
    });
}
// Update the skin shown on the 3D preview
function updatePreviewTexture() {
    const type = getSelectedType();
    if (type == "Slim") {

        leftArmMesh.visible = false;
        rightArmMesh.visible = false;

        setOuterMeshVisibility(leftArmOuterMesh, false);
        setOuterMeshVisibility(rightArmOuterMesh, false);

        rightArmSlimMesh.visible = true;
        leftArmSlimMesh.visible = true;

        setOuterMeshVisibility(rightArmOuterSlimMesh, true);
        setOuterMeshVisibility(leftArmOuterSlimMesh, true);
    } else {

        leftArmMesh.visible = true;
        rightArmMesh.visible = true;

        setOuterMeshVisibility(leftArmOuterMesh, true);
        setOuterMeshVisibility(rightArmOuterMesh, true);

        leftArmSlimMesh.visible = false;
        rightArmSlimMesh.visible = false;

        setOuterMeshVisibility(rightArmOuterSlimMesh, false);
        setOuterMeshVisibility(leftArmOuterSlimMesh, false);
    }
    applyTexArrayToMatArray(getPartAsCubeTextureArray("Base", "Head"), headMaterials);
    applyTexArrayToMatArray(getPartAsCubeTextureArray("Outer", "Head"), headOuterMaterials);

    applyTexArrayToMatArray(getPartAsCubeTextureArray("Base", "Body"), bodyMaterials);
    applyTexArrayToMatArray(getPartAsCubeTextureArray("Outer", "Body"), bodyOuterMaterials);

    applyTexArrayToMatArray(getPartAsCubeTextureArray("Base", "Left Arm"), leftArmMaterials);
    applyTexArrayToMatArray(getPartAsCubeTextureArray("Base", "Right Arm"), rightArmMaterials);
    applyTexArrayToMatArray(getPartAsCubeTextureArray("Outer", "Left Arm"), leftArmOuterMaterials);
    applyTexArrayToMatArray(getPartAsCubeTextureArray("Outer", "Right Arm"), rightArmOuterMaterials);

    applyTexArrayToMatArray(getPartAsCubeTextureArray("Base", "Left Arm"), leftArmSlimMaterials);
    applyTexArrayToMatArray(getPartAsCubeTextureArray("Base", "Right Arm"), rightArmSlimMaterials);
    applyTexArrayToMatArray(getPartAsCubeTextureArray("Outer", "Left Arm"), leftArmOuterSlimMaterials);
    applyTexArrayToMatArray(getPartAsCubeTextureArray("Outer", "Right Arm"), rightArmOuterSlimMaterials);

    applyTexArrayToMatArray(getPartAsCubeTextureArray("Base", "Left Leg"), leftLegMaterials);
    applyTexArrayToMatArray(getPartAsCubeTextureArray("Base", "Right Leg"), rightLegMaterials);
    applyTexArrayToMatArray(getPartAsCubeTextureArray("Outer", "Left Leg"), leftLegOuterMaterials);
    applyTexArrayToMatArray(getPartAsCubeTextureArray("Outer", "Right Leg"), rightLegOuterMaterials);
}

function consructPartGeometry(width, height, depth, x, y, z) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const materials = [
        new THREE.MeshBasicMaterial({map: defaultTexture, transparent: true, color: 0xcccccc}),
        new THREE.MeshBasicMaterial({map: defaultTexture, transparent: true, color: 0xcccccc}),
        new THREE.MeshBasicMaterial({map: defaultTexture, transparent: true, color: 0xcccccc}),
        new THREE.MeshBasicMaterial({map: defaultTexture, transparent: true, color: 0xcccccc}),
        new THREE.MeshBasicMaterial({map: defaultTexture, transparent: true, color: 0xcccccc}),
        new THREE.MeshBasicMaterial({map: defaultTexture, transparent: true, color: 0xcccccc})
    ]
    const mesh = new THREE.Mesh(geometry, materials);
    mesh.translateX(x);
    mesh.translateY(y);
    mesh.translateZ(z);
    return [mesh, materials];
}
const getPlaneTranslation = (index, w, h, d) => {
    switch (index) {
        case 0: return [w/2 + outerIncrease,0,0]  // Left  
        case 1: return [-w/2 - outerIncrease,0,0] // Right  
        case 2: return [0,h/2 + outerIncrease,0]  // Top   
        case 3: return [0,-h/2 - outerIncrease,0] // Bottom 
        case 4: return [0,0,d/2 + outerIncrease]  // Front 
        case 5: return [0,0,-d/2 - outerIncrease] // Back   
    }
    return [w, h, d]
}
const getPlaneRotation = (index) => {
    switch (index) {
        case 0: return [0, Math.PI/2, 0]  // Left  
        case 1: return [0, -Math.PI/2, 0] // Right 
        case 2: return [-Math.PI/2, 0, 0] // Top   
        case 3: return [Math.PI/2, 0, 0]  // Bottom
        case 4: return [0, 0, 0]          // Front 
        case 5: return [0, Math.PI, 0]    // Back  
    }
    return [0, 0, 0]
}
const planeIndexToSide = {
    0: "Right",
    1: "Left",
    2: "Top",
    3: "Bottom",
    4: "Front",
    5: "Back"
}
function consructPartOuterGeometry(width, height, depth, x, y, z, partName) {

    const geometries = [
        new THREE.PlaneGeometry(depth, height), // Left  
        new THREE.PlaneGeometry(depth, height), // Right 
        new THREE.PlaneGeometry(width, depth),  // Top   
        new THREE.PlaneGeometry(width, depth),  // Bottom
        new THREE.PlaneGeometry(width, height), // Front 
        new THREE.PlaneGeometry(width, height), // Back  
    ];
    const materials = [
        new THREE.MeshBasicMaterial({map: defaultTexture, transparent: true, color: 0xcccccc}), // Left  
        new THREE.MeshBasicMaterial({map: defaultTexture, transparent: true, color: 0xcccccc}), // Right 
        new THREE.MeshBasicMaterial({map: defaultTexture, transparent: true, color: 0xcccccc}), // Top   
        new THREE.MeshBasicMaterial({map: defaultTexture, transparent: true, color: 0xcccccc}), // Bottom
        new THREE.MeshBasicMaterial({map: defaultTexture, transparent: true, color: 0xcccccc}), // Front 
        new THREE.MeshBasicMaterial({map: defaultTexture, transparent: true, color: 0xcccccc})  // Back  
    ]
    
    const meshes = [];
    for (let i = 0; i < geometries.length; i++) {
        meshes.push(new THREE.Mesh(geometries[i], materials[i]))
        meshes[i].name = partName + " " + planeIndexToSide[i];
        const translation = getPlaneTranslation(i, width, height, depth);
        const rotation = getPlaneRotation(i);
        meshes[i].translateX(x + translation[0]);
        meshes[i].translateY(y + translation[1]);
        meshes[i].translateZ(z + translation[2]);
        meshes[i].rotateX(rotation[0]);
        meshes[i].rotateY(rotation[1]);
        meshes[i].rotateZ(rotation[2]);
    }
    
    return [meshes, materials];
}

function setGroupRot(group, rot) {
    group.rotation.x = rot[0];
    group.rotation.y = rot[1];
    group.rotation.z = rot[2];
}

function setBodyPose(
    headRot,
    bodyRot,
    leftArmRot,
    rightArmRot,
    leftLegRot,
    rightLegRot
) {
    setGroupRot(headGroup, headRot);
    setGroupRot(bodyGroup, bodyRot);
    setGroupRot(leftArmGroup, leftArmRot);
    setGroupRot(rightArmGroup, rightArmRot);
    setGroupRot(leftLegGroup, leftLegRot);
    setGroupRot(rightLegGroup, rightLegRot)
}

function updatePose() {
    const pose = getSelectedPose();
    if (pose == "Normal") {
        setBodyPose(
            [0,0,0],
            [0,0,0],
            [0,0,0],
            [0,0,0],
            [0,0,0],
            [0,0,0]
        );
    } else if (pose == "Running") {
        setBodyPose(
            [0,0,0],
            [0,0,0],
            [1,0,0],
            [-1,0,0],
            [-1,0,0],
            [1,0,0]
        );
    }
}
function addAllToGroup(meshes, group, position) {
    meshes.forEach((value, index, array) => {
        group.add(value);
        moveBy(value, position, 1);
    })
}
function moveBy(mesh, position, mult=1) {
    var meshPosition = mesh.position;
    meshPosition.add(new THREE.Vector3(position[0] * mult, position[1] * mult, position[2] * mult));
    mesh.position.x = meshPosition.x
    mesh.position.y = meshPosition.y
    mesh.position.z = meshPosition.z;
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const loader = new THREE.TextureLoader();

const preview = new THREE.Scene();
//preview.background = new THREE.Color().setHex(0xffffff);
const previewCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize(100, 100);
previewContainer.appendChild(renderer.domElement);

const controls = new OrbitControls(previewCamera, renderer.domElement);

//const light = new THREE.AmbientLight( 0xffffff ); // soft white light
//preview.add( light );

const outerIncrease = 0.25;

const defaultTexture = new THREE.Texture();
//     Mesh Name         Material Name                                 Width Height Length X   Y    Z
const [headMesh,         headMaterials] =         consructPartGeometry(8,    8,     8,     0,  10,  0, "Head");
const [bodyMesh,         bodyMaterials] =         consructPartGeometry(8,    12,    4,     0,  0,   0, "Body");
const [leftArmMesh,      leftArmMaterials] =      consructPartGeometry(4,    12,    4,     -6, 0,   0, "Left_Arm");
const [rightArmMesh,     rightArmMaterials] =     consructPartGeometry(4,    12,    4,     6,  0,   0, "Right_Arm");
const [leftArmSlimMesh,  leftArmSlimMaterials] =  consructPartGeometry(3,    12,    4,     -5.5, 0,   0, "Left_Arm");
const [rightArmSlimMesh, rightArmSlimMaterials] = consructPartGeometry(3,    12,    4,     5.5,  0,   0, "Right_Arm");
const [leftLegMesh,      leftLegMaterials] =      consructPartGeometry(4,    12,    4,     -2, -12, 0, "Left_Leg");
const [rightLegMesh,     rightLegMaterials] =     consructPartGeometry(4,    12,    4,     2,  -12, 0, "Right_Leg");

//     Mesh Name              Material Name                                           Width Height Length X   Y    Z
const [headOuterMesh,         headOuterMaterials] =         consructPartOuterGeometry(8,    8,     8,     0,  10,  0, "Head");
const [bodyOuterMesh,         bodyOuterMaterials] =         consructPartOuterGeometry(8,    12,    4,     0,  0,   0, "Body");
const [leftArmOuterMesh,      leftArmOuterMaterials] =      consructPartOuterGeometry(4,    12,    4,     -6, 0,   0, "Left_Arm");
const [rightArmOuterMesh,     rightArmOuterMaterials] =     consructPartOuterGeometry(4,    12,    4,     6,  0,   0, "Right_Arm");
const [leftArmOuterSlimMesh,  leftArmOuterSlimMaterials] =  consructPartOuterGeometry(3,    12,    4,     -5.5, 0,   0, "Left_Arm");
const [rightArmOuterSlimMesh, rightArmOuterSlimMaterials] = consructPartOuterGeometry(3,    12,    4,     5.5,  0,   0, "Right_Arm");
const [leftLegOuterMesh,      leftLegOuterMaterials] =      consructPartOuterGeometry(4,    12,    4,     -2, -12, 0, "Left_Leg");
const [rightLegOuterMesh,     rightLegOuterMaterials] =     consructPartOuterGeometry(4,    12,    4,     2,  -12, 0, "Right_Leg");

const headGroup = new THREE.Group();
headGroup.add(headMesh);
moveBy(headMesh, partPivotPoints["Head"], 1);
addAllToGroup(headOuterMesh, headGroup, partPivotPoints["Head"]);
moveBy(headGroup, partPivotPoints["Head"], -1);

const bodyGroup = new THREE.Group();
bodyGroup.add(bodyMesh);
moveBy(bodyMesh, partPivotPoints["Body"], 1);
addAllToGroup(bodyOuterMesh, bodyGroup, partPivotPoints["Body"]);
moveBy(bodyGroup, partPivotPoints["Body"], -1);

const leftArmGroup = new THREE.Group();
leftArmGroup.add(leftArmMesh);
leftArmGroup.add(leftArmSlimMesh);
moveBy(leftArmMesh, partPivotPoints["Left Arm"], 1);
moveBy(leftArmSlimMesh, partPivotPoints["Left Arm"], 1);
addAllToGroup(leftArmOuterMesh, leftArmGroup, partPivotPoints["Left Arm"]);
addAllToGroup(leftArmOuterSlimMesh, leftArmGroup, partPivotPoints["Left Arm"]);
moveBy(leftArmGroup, partPivotPoints["Left Arm"], -1);

const rightArmGroup = new THREE.Group();
rightArmGroup.add(rightArmMesh);
rightArmGroup.add(rightArmSlimMesh);
moveBy(rightArmMesh, partPivotPoints["Right Arm"], 1);
moveBy(rightArmSlimMesh, partPivotPoints["Right Arm"], 1);
addAllToGroup(rightArmOuterMesh, rightArmGroup, partPivotPoints["Right Arm"]);
addAllToGroup(rightArmOuterSlimMesh, rightArmGroup, partPivotPoints["Right Arm"]);
moveBy(rightArmGroup, partPivotPoints["Right Arm"], -1);

const leftLegGroup = new THREE.Group();
leftLegGroup.add(leftLegMesh);
moveBy(leftLegMesh, partPivotPoints["Left Leg"], 1);
addAllToGroup(leftLegOuterMesh, leftLegGroup, partPivotPoints["Left Leg"]);
moveBy(leftLegGroup, partPivotPoints["Left Leg"], -1);

const rightLegGroup = new THREE.Group();
rightLegGroup.add(rightLegMesh);
moveBy(rightLegMesh, partPivotPoints["Right Leg"], 1);
addAllToGroup(rightLegOuterMesh, rightLegGroup, partPivotPoints["Right Leg"]);
moveBy(rightLegGroup, partPivotPoints["Right Leg"], -1);

preview.add(headGroup, bodyGroup, leftArmGroup, rightArmGroup, leftLegGroup, rightLegGroup)

previewCamera.position.z = 30;

controls.update();

updatePreviewSize();

renderer.domElement.onmouseup = (event) => {
    pointer.x = ( event.offsetX / renderer.domElement.offsetWidth ) * 2 - 1;
	pointer.y = -(( event.offsetY / renderer.domElement.offsetHeight ) * 2)  + 1;
    raycaster.setFromCamera( pointer, previewCamera );
    const intersects = raycaster.intersectObjects( preview.children );
    const firstIntersected = intersects[0];
    if (firstIntersected != undefined) {
	    const [part, side] = firstIntersected.object.name.split(" ");
        setSelectedSide(side);
        setSelectedPart(part.replaceAll("_", " "));
        loadSectionToCanvas();
    }
}

function renderPreview() {
    
    controls.update();
    renderer.render( preview, previewCamera );
    updatePreviewSize();
}
renderer.setAnimationLoop( renderPreview );