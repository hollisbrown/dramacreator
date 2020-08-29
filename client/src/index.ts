//import LogUtils from '../../common/src/LogUtils'  //import from "common" example
import Input from './Input';
import UI from './UI';
import Renderer from './Renderer';
import Editor from './Editor';
import Game from '../../common/src/Game';


var socket: any;
var canvas: any = document.getElementById("canvas");
var ctx: any = canvas.getContext("2d");

var input: Input = new Input();
var ui: UI = new UI(ctx);
var renderer: Renderer = new Renderer();
var game: Game = new Game();

var lastTimestamp: number = 0;

window.onload = function () {
    connect();
    requestAnimationFrame(loop);
}
function connect() {

    if (socket) {
        socket.onerror = socket.onopen = socket.onclose = null;
        socket.close();
    }
    socket = new WebSocket("ws://localhost:6969");

    socket.onopen = function (evt: any) {
        console.log("Connected.");

    }
    socket.onmessage = function (evt: any) {
        console.log("Received Game Data");
        var receivedJSON = evt.data;
        let receivedObject = JSON.parse(receivedJSON);
        game = Object.assign(new Game, receivedObject);
        renderer.init();
        renderer.createSprites(game.assets);
    }
    socket.onclose = function (evt: any) {
        console.log("Disconnected.");
    }
    socket.onerror = function (evt: any) {
        console.error("WebSocket error observed:", evt);
    };
}

function loop(timestamp: number) {
    var deltaTime: number = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (game.isRunning) {
        game.update(deltaTime);
    }

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //renderer.debugShowSprites();

    if (ui.button(input, "Test", 200, 200, 50, 30, "#992222")) {
        console.log("Test!!");
    }

    if (ui.swatch(input, 20, 20, 50, 50, "#0000FF")) {
        console.log("Swatch");
    }

    var options:string[] = [
        "Oans", 
        "Zwoa",
        "Drei",
        "Gsuffa"
    ]

    var selected: number = ui.dropDown(input, options, 2, 400,300,100,50,"#005511");

    input.reset();
    requestAnimationFrame(loop);
}
