import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const editorCanvas = document.getElementById("editor-canvas");
const editorCanvasContainer = document.getElementById("editor-canvas-container");
const context = editorCanvas.getContext("2d");

const previewContainer = document.getElementById("preview");

const brushDrawSizeSlider = document.getElementById("brush-draw-size")

const skinAccountNameInput = document.getElementById("skin-account-name");

// Event Listeners
document.getElementById("brush-draw-size").onchange = () => {updateBrushDrawSize()};
document.getElementById("save-skin").onclick = () => {saveSkin()};
document.getElementById("load-skin-from-account").onclick = () => {loadURLAsCanvas("https://mineskin.eu/skin/" + skinAccountNameInput.value)};


document.body.onload = () => {
    updatePreviewSize();
}

const multioptions = document.getElementsByClassName("multioption");
for(let i = 0; i < multioptions.length; i++) {
    multioptions[i].onclick = () => {loadSectionToCanvas(); updatePreviewTexture();};
}

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

loadURLAsCanvas("/default_skin3.png");

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
                "Base": [52,20,55,31],
                "Outer": [52,36,55,47]
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
                "Base": [48,20,51,31],
                "Outer": [48,36,51,47]
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
                "Outer": [60,52,63,63]
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
    loadedSkin.crossOrigin = "anonymous";
    loadedSkin.onload = () => {
        fullSkinCanvas.width = loadedSkin.width;
        fullSkinCanvas.height = loadedSkin.height;
        fullSkinContext.drawImage(loadedSkin, 0, 0);
        loadSectionToCanvas();
        updatePreviewTexture();     
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
    let type = getSelectedType();
    if ([layer, side, part, type].includes(undefined)) return;

    let dimensions = part.includes("Arm") ? skinDimensions[part][side][type][layer] : skinDimensions[part][side][layer];
    startX = dimensions[0];
    startY = dimensions[1];
    endX = dimensions[2]+1;
    endY = dimensions[3]+1;
    width = endX-startX;
    height = endY-startY;

    console.log(dimensions, width, height);

    context.canvas.width = width;
    context.canvas.height = height;


    const maxWidth = editorCanvasContainer.clientWidth;
    const maxHeight = editorCanvasContainer.clientHeight;
    console.log("MAX", maxWidth, maxHeight);

    const sectionSizeRatio = width/height;
    const canvasSizeRatio = maxWidth/maxHeight
    console.log("SIZE RATIO SECTION, CANVAS", sectionSizeRatio, canvasSizeRatio);

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

function getSelectedType() {
    var input = document.querySelector('input[name="type"]:checked');
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
    context.fillRect(x/width*editorCanvas.width, y/height*editorCanvas.height, brushSize/width*editorCanvas.width, brushSize/height*editorCanvas.height);

    // Do for full skin
    x += startX;
    y += startY;
    fullSkinContext.fillStyle = "rgb(255 0 0)";
    fullSkinContext.fillRect(x, y, brushSize, brushSize);

    updatePreviewTexture();
}

editorCanvas.onclick = function(e) {
    let pixelX = Math.floor((e.offsetX/editorCanvas.clientWidth)*width);
    let pixelY = Math.floor((e.offsetY/editorCanvas.clientHeight)*height);
    console.log(pixelX, pixelY, e.offsetX, e.offsetY, width, height);
    applyBrushAt(pixelX, pixelY);
}

function updatePreviewSize() {
    let previewWidth = previewContainer.clientWidth;
    let previewHeight = previewContainer.clientHeight;
    renderer.setSize(previewWidth, previewHeight);
    previewCamera.aspect = (previewWidth/previewHeight);
    previewCamera.updateProjectionMatrix();
}
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
    textures[3].flipY = false;
    return textures;

}
function applyTexArrayToMatArray(texArray, matArray) {
    matArray.forEach((value, index, array) => {
        value.map = texArray[index];
        value.map.minFilter = THREE.NearestFilter;
        value.map.magFilter = THREE.NearestFilter;
    });
}
function updatePreviewTexture() {
    const type = getSelectedType();
    if (type == "Slim") {
        leftArmMesh.visible = false;
        rightArmMesh.visible = false;
        rightArmSlimMesh.visible = true;
        leftArmSlimMesh.visible = true;
    } else {
        leftArmMesh.visible = true;
        rightArmMesh.visible = true;
        leftArmSlimMesh.visible = false;
        rightArmSlimMesh.visible = false;
    }
    applyTexArrayToMatArray(getPartAsCubeTextureArray("Base", "Head"), headMaterials);
    applyTexArrayToMatArray(getPartAsCubeTextureArray("Outer", "Head"), headOuterMaterials);
    applyTexArrayToMatArray(getPartAsCubeTextureArray("Base", "Body"), bodyMaterials);
    applyTexArrayToMatArray(getPartAsCubeTextureArray("Base", "Left Arm"), leftArmMaterials);
    applyTexArrayToMatArray(getPartAsCubeTextureArray("Base", "Right Arm"), rightArmMaterials);
    applyTexArrayToMatArray(getPartAsCubeTextureArray("Base", "Left Arm"), leftArmSlimMaterials);
    applyTexArrayToMatArray(getPartAsCubeTextureArray("Base", "Right Arm"), rightArmSlimMaterials);
    applyTexArrayToMatArray(getPartAsCubeTextureArray("Base", "Left Leg"), leftLegMaterials);
    applyTexArrayToMatArray(getPartAsCubeTextureArray("Base", "Right Leg"), rightLegMaterials);
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
    preview.add(mesh);
    return [mesh, materials];
}

const loader = new THREE.TextureLoader();

const preview = new THREE.Scene();
//preview.background = new THREE.Color().setHex(0xffffff);
const previewCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(100, 100);
previewContainer.appendChild(renderer.domElement);

const controls = new OrbitControls(previewCamera, renderer.domElement);

//const light = new THREE.AmbientLight( 0xffffff ); // soft white light
//preview.add( light );

const defaultTexture = new THREE.Texture();

const [headMesh, headMaterials] = consructPartGeometry(8, 8, 8, 0, 10, 0);
const [headOuterMesh, headOuterMaterials] = consructPartGeometry(8.25, 8.25, 8.25, 0, 10, 0);
const [bodyMesh, bodyMaterials] = consructPartGeometry(8, 12, 4, 0, 0, 0);
const [leftArmMesh, leftArmMaterials] = consructPartGeometry(4,12,4,-6,0,0)
const [rightArmMesh, rightArmMaterials] = consructPartGeometry(4,12,4,6,0,0)
const [leftArmSlimMesh, leftArmSlimMaterials] = consructPartGeometry(3,12,4,-5.5,0,0)
const [rightArmSlimMesh, rightArmSlimMaterials] = consructPartGeometry(3,12,4,5.5,0,0)
const [leftLegMesh, leftLegMaterials] = consructPartGeometry(4,12,4,-2,-12,0)
const [rightLegMesh, rightLegMaterials] = consructPartGeometry(4,12,4,2,-12,0)

previewCamera.position.z = 30;

controls.update();

updatePreviewSize();

function renderPreview() {
    controls.update();
    renderer.render( preview, previewCamera );
    updatePreviewSize();
}
renderer.setAnimationLoop( renderPreview );