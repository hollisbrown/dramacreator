//import LogUtils from '../../common/src/LogUtils'  //import from "common" example
import Input from './Input';
import UI from './UI';
import Renderer, { ISortable } from './Renderer';
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

var game: Game = new Game();
var input: Input = new Input(canvas);
var ui: UI = new UI(ctx, input);
var camera: Camera = new Camera(canvas);
var renderer: Renderer = new Renderer(canvas, ctx, camera, game);
var builder: Builder = new Builder(canvas, ctx, input, game, ui, renderer, camera, send);

var lastTimestamp: number = 0;

class Mode {
    static FREE: number = 0;
    static BUILD: number = 1;
    static PLAY: number = 2;
    static SPECTATE: number = 3;
}
var mode: Mode = Mode.FREE;
var controlledCharacterId: number = -1;

var isChatting: boolean = false;
var isSortableMenu: boolean = false;
var lastMouse: Position;
var lastMouseCamera: Position;
var selectedSortable: ISortable;
var selectedSortableType: AssetType;

window.addEventListener('resize', resize, false); resize();
window.onload = function () {
    resize();
    connect();
    requestAnimationFrame(update);
}
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.imageSmoothingEnabled = false;
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
            let asset = game.setAsset(data);
            renderer.createSprites(game.assets[asset.id]);
            break;
        case "TILE":
            game.setTile(data);
            break;
        case "ITEM":
            game.setItem(data);
            console.log(json);
            break;
        case "CHARACTER":
            game.setCharacter(data);
            break;
        case "CONTROL":
            controlledCharacterId = parseInt(data);
            setMode(Mode.PLAY);
            break;
    }
}
function update(timestamp: number) {
    let deltaTime: number = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (game.isRunning) {
        game.update(deltaTime);
    }

    renderer.update(deltaTime);
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

    let isMouseOnSortableMenu: boolean = false;

    camera.movePosition(input.direction, deltaTime);
    camera.setZoom(input.scrollDelta);

    if (isSortableMenu) {
        isMouseOnSortableMenu = ui.sortableMenu(lastMouse, selectedSortable.id, selectedSortable.assetId, selectedSortableType);

        if (selectedSortableType == AssetType.CHARACTER) {
            if (ui.button("Control", lastMouse.x + 10, lastMouse.y + 90, 180, 40, "#111111")) {
                isSortableMenu = false;
                send("CONTROL", selectedSortable.id);
            }
        }
    }

    if (input.isMouseDown) {

        if (input.isMouseRight) {
            isSortableMenu = false;
            return;
        }

        if (!isMouseOnSortableMenu) {
            lastMouse = input.mouse;
            lastMouseCamera = input.mouseCamera(camera.position, camera.zoom);
            selectedSortable = renderer.getSortableAtPosition(lastMouseCamera);

            if (selectedSortable != null) {
                selectedSortableType = game.assets[selectedSortable.assetId].type;
                isSortableMenu = true;
            } else {
                isSortableMenu = false;
            }
        }
    }

    if (input.isShortcutPlayMode) {
        setMode(Mode.PLAY);
    }
    if (input.isShortcutBuildMode) {
        setMode(Mode.BUILD);
    }
}
function updateBuild(deltaTime: number) {

    builder.update();

    if (!builder.editor.isEnabled) {

        camera.movePosition(input.direction, deltaTime);

        if (input.isShortcutFreeMode) {
            builder.reset();
            setMode(Mode.FREE);
        }
    }
}
function updatePlay(deltaTime: number) {

    let position = game.characters[controlledCharacterId].positionRender;
    camera.setPosition(position);

    if (input.isShortcutChat) {
        if (input.isTyping) {
            isChatting = false;
            input.stopTyping();
        } else {
            isChatting = true;
            input.startTyping("");
        }
    }

    if (isChatting) {
        ui.textBoxActive(30, canvas.height - 60, 800, 30);
    }

    if (input.isShortcutFreeMode) {
        setMode(Mode.FREE);
    }
    if (false) {
        setMode(Mode.SPECTATE);
    }
}
function updateSpectate(deltaTime: number) {
    if (false) {
        setMode(Mode.PLAY);
    }
}
function setMode(m: Mode) {
    mode = m;
    switch (mode) {
        case Mode.FREE:
            break;
        case Mode.BUILD:
            builder.reset();
            break;
        case Mode.PLAY:
            break;
        case Mode.SPECTATE:
            break;
    }
}
function send(type: string, data: any) {
    let message = { type, data };
    let messageJSON = JSON.stringify(message);
    socket.send(messageJSON);
}