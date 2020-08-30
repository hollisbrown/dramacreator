//import LogUtils from '../../common/src/LogUtils'  //import from "common" example
import Input from './Input';
import UI from './UI';
import Renderer from './Renderer';
import Editor from './Editor';
import Game from '../../common/src/Game';
import Camera from './Camera';
import Config from '../../common/src/Config';
import Position from '../../common/src/Position';
import Builder from './Builder';

var socket: any;
var canvas: any = document.getElementById("canvas");
var ctx: any = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

var game: Game = new Game();
var ui: UI = new UI(ctx);
var input: Input = new Input(canvas);
var camera: Camera = new Camera(canvas);
var renderer: Renderer = new Renderer(canvas, ctx, camera);
var builder: Builder = new Builder(ctx, input, game, ui, renderer, camera);

var lastTimestamp: number = 0;

class Mode {
    static FREE: number = 0;
    static BUILD: number = 1;
    static PLAY: number = 2;
    static SPECTATE: number = 3;
}
var mode: Mode = Mode.FREE;
var controlledCharacterId: number = 0;

window.onload = function () {
    connect();
    requestAnimationFrame(update);
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
        renderer.createSprites(game.assets);
    }
    socket.onclose = function (evt: any) {
        console.log("Disconnected.");
    }
    socket.onerror = function (evt: any) {
        console.error("WebSocket error observed:", evt);
    };
}
function update(timestamp: number) {
    let deltaTime: number = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    //bg
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (game.isRunning) {
        game.update(deltaTime);
    }

    renderer.update(0, game);

    switch (mode) {
        case Mode.FREE:
            updateFree(deltaTime);
            break;
        case Mode.BUILD:
            updateBuild(deltaTime);
            break;
        case Mode.PLAY:
            updatePlay(deltaTime);
            break;
        case Mode.SPECTATE:
            updateSpectate(deltaTime);
            break;
    }

    input.reset();
    requestAnimationFrame(update);
}
function updateFree(deltaTime: number) {

    camera.move(input.direction, deltaTime);

    if (input.isShortcutPlayMode) {
        changeMode(Mode.PLAY);
    }
    if (input.isShortcutBuildMode) {
        changeMode(Mode.BUILD);
    }
}
function updateBuild(deltaTime: number) {

    camera.move(input.direction, deltaTime);

    if (input.isShortcutFreeMode) {
        changeMode(Mode.FREE);
    }

    builder.update();
    //editor.update();
}
function updatePlay(deltaTime: number) {

    let position = game.characters[controlledCharacterId].positionRender;
    camera.follow(position);

    if (input.isShortcutFreeMode) {
        changeMode(Mode.FREE);
    }
    if (false) {
        changeMode(Mode.SPECTATE);
    }
}
function updateSpectate(deltaTime: number) {
    if (false) {
        changeMode(Mode.PLAY);
    }
}
function changeMode(m: Mode) {
    console.log("Mode: " + m);
    mode = m;
    switch (mode) {
        case Mode.FREE:
            break;
        case Mode.BUILD:
            break;
        case Mode.PLAY:
            break;
        case Mode.SPECTATE:
            break;
    }
}