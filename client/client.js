window.onload = function () {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    addInputListener();
    connect();
    requestAnimationFrame(loop);
}

var socket;
function connect() {

    if (socket) {
        socket.onerror = socket.onopen = socket.onclose = null;
        socket.close();
    }

    socket = new WebSocket("ws://localhost:6969");
    socket.binaryType = "arraybuffer";

    socket.onopen = function (evt) {
        console.log("connected!");
    }
    socket.onmessage = function (evt) {
        var buffer = new Uint8Array(evt.data);
    }
    socket.onclose = function (evt) {
        console.log("disconnected");
    }
}

function Test(){
    
}

var lastTimestamp;
function loop(timestamp) {
    var deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
    update(deltaTime);
    requestAnimationFrame(loop);
}

function update(deltaTime) {

}
