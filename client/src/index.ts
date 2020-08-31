//import LogUtils from '../../common/src/LogUtils'  //import from "common" example
import Input from './Input';
import UI from './UI';
import Renderer from './Renderer';
import Editor from './Editor';
import Game from '../../common/src/Game';
import Asset, { AssetType } from '../../common/src/Asset';
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
var builder: Builder = new Builder(canvas, ctx, input, game, ui, renderer, camera, onBuild);

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
        receive(evt.data);
    }
    socket.onclose = function (evt: any) {
        console.log("Disconnected.");
    }
    socket.onerror = function (evt: any) {
        console.error("WebSocket error observed:", evt);
    };
}
function receive(json: string) {
    let object = JSON.parse(json);
    let type: string = object.type;
    let data: any = object.data;

    switch (type) {
        case "GAME":
            let gameData = Object.assign(new Game, data);
            game.load(gameData);
            for (var i = 0; i < game.assets.length; i++) {
                renderer.createSprites(game.assets[i]);
            }
            break;
        case "ASSET":
            let assetId = game.setAsset(data);
            renderer.createSprites(game.assets[assetId]);
            break;
        case "TILE":
            game.setTile(data);
            break;
        case "ITEM":
            game.setItem(data);
            break;
        case "CHARACTER":
            game.setCharacter(data);
            break;
    }
}
function update(timestamp: number) {
    let deltaTime: number = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

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

    builder.update();

    if (!builder.editor.isEnabled) {

        camera.move(input.direction, deltaTime);

        if (input.isShortcutFreeMode) {
            changeMode(Mode.FREE);
        }
    }
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
function onBuild(type: string, data: any) {
    let message = { type, data };
    let messageJSON = JSON.stringify(message);
    socket.send(messageJSON);
}