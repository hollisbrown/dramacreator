//import LogUtils from '../../common/src/LogUtils'  //import from "common" example
import Input from './Input';
import Game from './Game';
import GameData from '../../common/src/GameData';

var canvas: any = document.getElementById("canvas");
var ctx: any = canvas.getContext("2d");
var socket: any;

var input: Input = new Input();
var game: Game = new Game();

window.onload = function () {
    input = new Input();
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
        console.log("open");
        game.init(input, socket);
    }
    socket.onmessage = function (evt: any) {
        var string = evt.data;
        game.receive(string);
    }
    socket.onclose = function (evt: any) {
    }
    socket.onerror = function(evt:any) {
        console.error("WebSocket error observed:", evt);
      };
      
}

var lastTimestamp: number;
function loop(timestamp: number) {
    var deltaTime: number = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
    if (game.isRunning) {
        game.update(deltaTime);
    }
    input.reset();
    requestAnimationFrame(loop);
}
