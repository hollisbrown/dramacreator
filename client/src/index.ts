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
var renderer: Renderer = new Renderer(canvas, ctx, camera, game, ui);
var builder: Builder = new Builder(canvas, ctx, input, game, ui, renderer, camera, send);


class Mode {
    static FREE: number = 0;
    static BUILD: number = 1;
    static PLAY: number = 2;
    static SPECTATE: number = 3;
    static DEBUG: number = 99;
}
var mode: Mode = Mode.FREE;
var lastTimestamp: number = 0;
var isChatting: boolean = false;
var isSortableMenu: boolean = false;
var lastMouse: Position;
var lastMouseCamera: Position;
var selectedSortable: ISortable;
var selectedSortableType: AssetType;

var controlledCharacterId: number = -1;
var chatLog: string[] = [];

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
            receiveGame(data);
            break;
        case "ASSET":
            let asset = game.setAsset(data);
            renderer.createSprites(game.assets[asset.id]);
            break;
        case "TILE":
            let tile = game.setTile(data);
            renderer.setWallFrames();
            break;
        case "ITEM":
            game.setItem(data);
            break;
        case "CHARACTER":
            game.setCharacter(data);
            break;
        case "CONTROL":
            receiveControl(data);
            break;
        case "CHAT":
            receiveChat(data);
            break;
        case "WALK":
            game.setPositions(data);
            renderer.characterLerp = 0;
            break;
    }
}
function update(timestamp: number) {
    let deltaTime: number = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
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
        case Mode.DEBUG:
            updateDebug();
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
            lastMouse = input.mousePosition;
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
    if (input.isShortcutBuildMode) {
        setMode(Mode.BUILD);
    }
    if (input.isShortcutDebug) {
        setMode(Mode.DEBUG);
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
            let message = input.stopTyping();
            if (message.length > 0) {
                send("CHAT", message);
            }
        } else {
            isChatting = true;
            input.startTyping("");
        }
    }

    if (isChatting) {
        ui.textBoxActive(30, canvas.height - 60, 800, 30);
    }

    if (input.isMouseDown) {
        send("WALK", camera.getWorldPosition(input.mousePosition));
    }

    if (input.isShortcutFreeMode) {
        send("CONTROL", -1);
    }
}
function updateSpectate(deltaTime: number) {

}
function updateDebug() {
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < renderer.bufferCanvas.length; i++) {
        ctx.drawImage(renderer.bufferCanvas[i], 50, 50 + i * (Config.pixelsPerRow + 4));
    }
    if (input.isShortcutDebug) {
        setMode(Mode.FREE);
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
        case Mode.DEBUG:
            break;
    }
}
function send(type: string, data: any) {
    let message = { type, data };
    let messageJSON = JSON.stringify(message);
    socket.send(messageJSON);
}
function receiveGame(data: any) {
    let gameData = Object.assign(new Game, data);
    game.load(gameData);
    for (var i = 0; i < game.assets.length; i++) {
        renderer.createSprites(game.assets[i]);
    }
    renderer.setWallFrames();
}
function receiveControl(data: any) {
    controlledCharacterId = parseInt(data);
    console.log("received control: " + controlledCharacterId);
    if (controlledCharacterId == -1) {
        setMode(Mode.FREE);
    } else {
        setMode(Mode.PLAY);
    }
}
function receiveChat(data: any) {
    let characterId: number = data.characterId;
    let message: string = data.message;
    renderer.characterChats[characterId] = message;
    renderer.characterChatTimers[characterId] = 5;
    chatLog.push(characterId + ": " + message);
    if (chatLog.length > 4) {
        chatLog.shift();
    }
}