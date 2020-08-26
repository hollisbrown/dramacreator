import * as Inputs from './input';
import LogUtils from '../../common/src/LogUtils'

window.onload = function () {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");

    Inputs.addInputListener(()=>console.log("Input click"), ()=>console.log("Input down"));
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
        LogUtils.logInfo("connected!");
    }
    socket.onmessage = function (evt) {
        var buffer = new Uint8Array(evt.data);
    }
    socket.onclose = function (evt) {
        LogUtils.logInfo("disconnected!");
    }
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
