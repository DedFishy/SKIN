const editorCanvas = document.getElementById("editor-canvas");
const context = editorCanvas.getContext("2d");

function fixCanvasResize() {
    context.canvas.width = editorCanvas.offsetWidth;
    context.canvas.height = editorCanvas.offsetHeight;
}

function getSelectedSide() {
    return document.querySelector('input[name="side"]:checked').value;
}

window.addEventListener("resize", fixCanvasResize)
fixCanvasResize()

function renderEditor() {
    context.fillStyle = "rgb(200 0 0)";
    context.fillRect(10, 10, 50, 50);
    context.fillStyle = "rgb(0 0 200 / 50%)";
    context.fillRect(30, 30, 50, 50);
    requestAnimationFrame(renderEditor);
}
renderEditor()