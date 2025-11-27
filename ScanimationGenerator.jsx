// ===========================================
// Full Scanimation Auto Generator for Photoshop
// FIXED VERSION (no global return)
// Author: ChatGPT
// ===========================================

#target photoshop

app.displayDialogs = DialogModes.NO;

// -------------------------------------------
// Ask user for slitWidth
// -------------------------------------------
var slitWidth = Number(prompt("Enter slitWidth (px):", "3"));
if (isNaN(slitWidth) || slitWidth <= 0) {
    alert("Invalid slitWidth.");
    throw("Invalid slitWidth."); // ❗ 用 throw 替代 return
}

// -------------------------------------------
// Get active document & layers
// -------------------------------------------
var doc = app.activeDocument;
var layers = [];
var allLayers = doc.layers;

// Collect only visible normal layers
for (var i = 0; i < allLayers.length; i++) {
    if (allLayers[i].visible && allLayers[i].kind == LayerKind.NORMAL) {
        layers.push(allLayers[i]);
    }
}

// n = number of frames
var n = layers.length;

if (n < 2) {
    alert("Need at least 2 visible layers to generate animation.");
    throw("Not enough frames."); // ❗ 用 throw
}

alert("Detected " + n + " frames.");

// Document size
var W = doc.width;
var H = doc.height;

// -------------------------------------------
// Create Interlaced Image Layer
// -------------------------------------------
var interlaceLayer = doc.artLayers.add();
interlaceLayer.name = "Interlaced Image";
interlaceLayer.move(doc.layers[0], ElementPlacement.PLACEAFTER);

// Fill with white first
doc.selection.select([[0,0],[W,0],[W,H],[0,H]]);
var white = new SolidColor();
white.rgb.red = white.rgb.green = white.rgb.blue = 255;
doc.selection.fill(white);

// -------------------------------------------
// Create the interlaced result using slitWidth
// -------------------------------------------
for (var x = 0; x < W; x += slitWidth) {

    var frameIndex = Math.floor((x / slitWidth) % n);
    var srcLayer = layers[frameIndex];

    // Select slit
    doc.activeLayer = interlaceLayer;
    doc.selection.select([
        [x, 0],
        [x + slitWidth, 0],
        [x + slitWidth, H],
        [x, H]
    ]);

    // Copy from source frame
    doc.activeLayer = srcLayer;
    doc.selection.copy();

    // Paste into interlace layer
    doc.activeLayer = interlaceLayer;
    doc.paste(true);

    doc.selection.deselect();
}

alert("Interlaced image created!");

// -------------------------------------------
// Create Overlay (Barrier Grid)
// -------------------------------------------
var bandWidth = n * slitWidth;
var blackWidth = bandWidth - slitWidth;

var overlayLayer = doc.artLayers.add();
overlayLayer.name = "Barrier Grid Overlay";

var black = new SolidColor();
black.rgb.red = 0;
black.rgb.green = 0;
black.rgb.blue = 0;

for (var x = 0; x < W; x += bandWidth) {
    doc.selection.select([
        [x, 0],
        [x + blackWidth, 0],
        [x + blackWidth, H],
        [x, H]
    ]);

    doc.selection.fill(black);
    doc.selection.deselect();
}

alert("Overlay created!\n\nScanimation Completed.");
