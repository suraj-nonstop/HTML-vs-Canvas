const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// get full screen size
canvas.width = window.innerWidth - 100;
canvas.height = window.innerHeight - 140;

// Node and connection storage
let nodes = [];
let connections = [];
let selectedNodes = new Set();
let isDragging = false;
let isResizing = false;
let zoomLevel = 1;
let dragOffset = { x: 0, y: 0 };
let resizeNode = null;

// Undo/Redo stacks
let undoStack = [];
let redoStack = [];

// load json data form file 
// let initialData = [
//     {
//         "id": 1,
//         "x": 50,
//         "y": 50,
//         "radius": 30,
//         "color": "#FF0000"
//     },
//     {
//         "id": 2,
//         "x": 85,
//         "y": 90,
//         "radius": 30,
//         "color": "#0000FF"
//     },
//     {
//         "id": 3,
//         "x": 120,
//         "y": 130,
//         "radius": 30,
//         "color": "#00FF00"
//     },
//     {
//         "id": 4,
//         "x": 155,
//         "y": 170,
//         "radius": 30,
//         "color": "#FFFF00"
//     },
//     {
//         "id": 5,
//         "x": 190,
//         "y": 210,
//         "radius": 30,
//         "color": "#FF00FF"
//     }
// ];

function loadData() {
     let numNodes = document.getElementById("nodeCount").value;
    if (numNodes === "") {
       alert("Please enter number of nodes");
    }
    const nodes = generateNodes(numNodes);
    loadState(JSON.stringify({ nodes, connections: [] }));
}


function saveState() {
    redoStack = []; // Clear redo on new action
    undoStack.push(JSON.stringify({ nodes, connections }));
    if (undoStack.length > 20) undoStack.shift();
}

function loadState(state) {
    if (state) {
        let parsed = JSON.parse(state);
        nodes = parsed.nodes;
        connections = parsed.connections;
        redraw();
    }
}

// Redraw canvas
function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(zoomLevel, zoomLevel);

    // Draw connections
    // connections.forEach(({ from, to }) => {
    //     ctx.beginPath();
    //     ctx.moveTo(from.x, from.y);
    //     ctx.lineTo(to.x, to.y);
    //     ctx.strokeStyle = "black";
    //     ctx.stroke();
    // });
    connections.forEach(({ from, to }) => {
        drawElbowLine(from.x, from.y, to.x, to.y);
    });

    // Draw nodes
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = selectedNodes.has(node) ? "yellow" : node.color;
        ctx.fill();
        ctx.stroke();
    });

    

    // Draw resize handles for selected nodes
    selectedNodes.forEach(node => {
        ctx.fillStyle = "black";
        ctx.fillRect(node.x + node.radius - 5, node.y - 5, 10, 10);
    });

    ctx.restore();
}

// Add new node
function addNode() {
    saveState();
    const newNode = {
        id: Date.now(),
        x: Math.random() * 600 + 50,
        y: Math.random() * 400 + 50,
        radius: 25,
        color: "green"
    };
    nodes.push(newNode);
    redraw();
}

// Detect node selection
canvas.addEventListener("mousedown", (event) => {
    const { offsetX, offsetY } = event;
    const x = offsetX / zoomLevel;
    const y = offsetY / zoomLevel;
    
    // Check if clicking on resize handle
    for (let node of selectedNodes) {
        if (
            x >= node.x + node.radius - 5 &&
            x <= node.x + node.radius + 5 &&
            y >= node.y - 5 &&
            y <= node.y + 5
        ) {
            isResizing = true;
            resizeNode = node;
            return;
        }
    }

    let clickedNode = nodes.find(node =>
        Math.hypot(node.x - x, node.y - y) < node.radius
    );

    if (clickedNode) {
        if (event.shiftKey) {
            // Multi-selection with Shift
            selectedNodes.add(clickedNode);
        } else {
            selectedNodes.clear();
            selectedNodes.add(clickedNode);
        }
        isDragging = true;
        dragOffset = { x: x - clickedNode.x, y: y - clickedNode.y };
    } else {
        selectedNodes.clear();
    }

    redraw();
});

// Dragging and resizing functionality
canvas.addEventListener("mousemove", (event) => {
    const { offsetX, offsetY } = event;
    const x = offsetX / zoomLevel;
    const y = offsetY / zoomLevel;

    if (isDragging) {
        selectedNodes.forEach(node => {
            node.x = x - dragOffset.x;
            node.y = y - dragOffset.y;
        });
        redraw();
    }

    if (isResizing && resizeNode) {
        resizeNode.radius = Math.max(10, x - resizeNode.x);
        redraw();
    }
});

canvas.addEventListener("mouseup", () => {
    if (isDragging || isResizing) saveState();
    isDragging = false;
    isResizing = false;
    resizeNode = null;
});

// Delete selected nodes
function deleteNode() {
    if (selectedNodes.size > 0) {
        saveState();
        nodes = nodes.filter(node => !selectedNodes.has(node));
        connections = connections.filter(conn =>
            !selectedNodes.has(conn.from) && !selectedNodes.has(conn.to)
        );
        selectedNodes.clear();
        redraw();
    }
}

// Connect two nodes
function connectNodes() {
    if (selectedNodes.size === 2) {
        let [from, to] = [...selectedNodes];
        connections.push({ from, to });
        redraw();
    }
}

function drawElbowLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);

    let midX = x1 + (x2 - x1) / 2;
    let midY = y2;

    ctx.lineTo(midX, y1);  // Horizontal segment
    ctx.lineTo(midX, midY); // Vertical segment
    ctx.lineTo(x2, y2);  // Horizontal segment to target

    ctx.strokeStyle = "black";
    ctx.stroke();
}

// Zoom functions
function zoomIn() {
    zoomLevel = Math.min(zoomLevel * 1.1, 3);
    redraw();
}

function zoomOut() {
    zoomLevel = Math.max(zoomLevel / 1.1, 0.2);
    redraw();
}

// Undo/Redo functions
function undo() {
    if (undoStack.length > 0) {
        redoStack.push(JSON.stringify({ nodes, connections }));
        loadState(undoStack.pop());
    }
}

function redo() {
    if (redoStack.length > 0) {
        undoStack.push(JSON.stringify({ nodes, connections }));
        loadState(redoStack.pop());
    }
}

// pan the canvas by pressing space bar and dragging

canvas.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        isDragging = true;
        canvas.style.cursor = "grab";
    }
});


// canvas.addEventListener("keydown", (event) => {
// Mouse wheel zoom
// canvas.addEventListener("wheel", (event) => {
//     zoomLevel *= event.deltaY > 0 ? 0.9 : 1.1;
//     zoomLevel = Math.min(Math.max(zoomLevel, 0.5), 3);
//     redraw();
// });

function generateNodes(numNodes) {
    const numColumns = Math.ceil(Math.sqrt(numNodes)); // Create a square-like grid
    const spacing = 100; // Space between nodes
    const colors = [
        "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
        "#800000", "#808000", "#008000", "#800080", "#808080", "#008080"
    ];

    const nodes = [];

    for (let i = 0; i < numNodes; i++) {
        const row = Math.floor(i / numColumns);
        const col = i % numColumns;

        nodes.push({
            id: i + 1,
            x: col * spacing + 50,
            y: row * spacing + 50,
            radius: 25,
            color: colors[i % colors.length]
        });
    }

    return nodes;
}
// Load initial data
loadData();

