import Input from './Input';
import UI from './UI';
import Renderer, { ISortable } from './Renderer';
import Game from '../../common/src/Game';
import Asset, { AssetType } from '../../common/src/Asset';
import Camera from './Camera';
import Config from '../../common/src/Config';
import Position from '../../common/src/Position';
import Builder from './Builder';
import Character from '../../common/src/Character';
import Tile from '../../common/src/Tile';

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
}
var mode: Mode = Mode.FREE;
var lastTimestamp: number = 0;
var isChatting: boolean = false;
var isHoveringModeMenu: boolean = false;
var isSortableMenu: boolean = false;
var sortablePositionScreen: Position;
var sortablePositionWorld: Position;
var selectedSortable: ISortable;
var selectedSortableType: AssetType;

var numberOfPlayers: number = 0;
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
    //socket = new WebSocket("ws://195.201.149.187:6969");
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
        case "PLAYERS":
            numberOfPlayers = parseInt(data);
            break;
        case "GAME":
            receiveGame(data);
            break;
        case "ASSET":
            receiveAsset(data);
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
            game.setCharacterPositions(data);
            renderer.characterLerp = 0;
            break;
    }
}
function update(timestamp: number) {
    let deltaTime: number = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    }

    if (!builder.isEditorEnabled) {
        menuMode();
        showStats();
        showChatlog();
    }

    input.reset();

    requestAnimationFrame(update);
}
function updateFree(deltaTime: number) {


    camera.movePosition(input.direction, deltaTime);
    camera.setZoom(input.scrollDelta);

    menuSortable();
}
function updateBuild(deltaTime: number) {

    builder.update();
    if (!builder.isEditorEnabled) {
        camera.movePosition(input.direction, deltaTime);
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

    if (input.isMouseDown && !isHoveringModeMenu) {

        let positionCurrent = game.characters[controlledCharacterId].position;
        let positionTarget = camera.getWorldPosition(input.mousePosition);

        if (input.isPositionOnTiles(positionTarget)) {

            let tileIdStart = input.getTileId(positionCurrent);
            let tileIdTarget = input.getTileId(positionTarget);
            let path = getPath(tileIdStart, tileIdTarget);
            renderer.characterPath = path;
            if (path.length > 0) {
                send("PATH", path);
            }
        }

        //game.characters[controlledCharacterId].positionTarget = positionTarget;
        //send("WALK", positionTarget);
    }

    cursorTarget();
}
function menuSortable() {
    let isMouseOnSortableMenu: boolean = false;
    if (isSortableMenu) {
        isMouseOnSortableMenu = ui.sortableMenu(sortablePositionScreen, selectedSortable.id, selectedSortable.assetId, selectedSortableType);

        if (selectedSortableType == AssetType.CHARACTER) {
            if (ui.button("Control", sortablePositionScreen.x + 10, sortablePositionScreen.y + 90, 180, 40, "#111111")) {
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
            sortablePositionScreen = input.mousePosition;
            sortablePositionWorld = camera.getWorldPosition(sortablePositionScreen);
            selectedSortable = renderer.getSortableAtPosition(sortablePositionWorld);

            if (selectedSortable != null) {
                selectedSortableType = game.assets[selectedSortable.assetId].type;
                isSortableMenu = true;
            } else {
                isSortableMenu = false;
            }
        }
    }
}
function menuMode() {

    let width = 180;
    let height = 50;
    let x = canvas.width / 2 - (width / 2);
    let y = 0;

    isHoveringModeMenu = (
        input.mousePosition.x > x &&
        input.mousePosition.x < x + width &&
        input.mousePosition.y > y &&
        input.mousePosition.y < y + height
    )

    if (mode == Mode.PLAY) {
        if (ui.button("Leave Character", x, y, width, height, "#229922")) {
            send("CONTROL", -1);
        }
    } else {
        if (ui.toggle("Open Builder", "Close Builder", x, y, width, height, "#992222", (mode == Mode.BUILD))) {
            if (mode == Mode.BUILD) {
                setMode(Mode.FREE);
            } else {
                setMode(Mode.BUILD);
            }
        }
    }
}
function setMode(m: Mode) {
    mode = m;
    switch (mode) {
        case Mode.FREE:
            isSortableMenu = false;
            builder.reset();
            break;
        case Mode.BUILD:
            isSortableMenu = false;
            builder.reset();
            break;
        case Mode.PLAY:
            isSortableMenu = false;
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
function receiveAsset(data: any) {
    let asset = game.setAsset(data);
    if (mode == Mode.BUILD) {
        builder.filterAssetList(builder.selectedAsset.type);
    }
    renderer.createSprites(game.assets[asset.id]);
}
function receiveControl(data: any) {
    controlledCharacterId = parseInt(data);
    if (controlledCharacterId == -1) {
        setMode(Mode.FREE);
    } else {
        setMode(Mode.PLAY);
    }
}
function receiveChat(data: any) {

    let characterId: number = data.characterId;
    let character: Character = game.characters[characterId];
    let name: string = game.assets[character.assetId].name;
    let message: string = data.message;

    renderer.characterChats[characterId] = message;
    renderer.characterChatTimers[characterId] = 8;
    chatLog.push(name + ": " + message);
    if (chatLog.length > 8) {
        chatLog.shift();
    }
}
function cursorTarget() {
    if (controlledCharacterId != -1) {
        let position = game.characters[controlledCharacterId].positionTarget;
        position = camera.getScreenPosition(position);
        ctx.fillStyle = "rgba(0,255,0,0.6)";
        ctx.beginPath();
        ctx.moveTo(position.x - 5, position.y - 10);
        ctx.lineTo(position.x + 5, position.y - 10);
        ctx.lineTo(position.x, position.y);
        ctx.closePath();
        ctx.fill();
    }
}
function showStats() {
    let x = 20;
    let y = 20;
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = "15px Courier New";
    ctx.fillText("Items: " + renderer.numberOfUsedItems + "/" + game.items.length, x + 20, y + 20);
    ctx.fillText("Characters: " + renderer.numberOfUsedCharacters + "/" + game.characters.length, x + 20, y + 40);
    ctx.fillText("Players: " + numberOfPlayers + "/" + Config.maxPlayers, x + 20, y + 60);
}
function showChatlog() {
    let x = 20;
    let y = canvas.height - 220;
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = "15px Courier New";
    for (var i = 0; i < chatLog.length; i++) {
        ctx.fillText(chatLog[i], x + 20, y + i * 20);
    }
}
function getPath(startId: number, targetId: number): number[] {
    let frontier: number[][] = [];
    let visited: number[][] = [];
    let maxIterations: number = 100;

    frontier.push([startId, startId]);
    while (frontier.length > 0) {

        let tileId = frontier[0][0];
        let originId = frontier[0][1];
        let tile: Tile = game.tiles[tileId];
        visited.push([tileId, originId]);
        frontier.splice(0, 1);

        let neighbourIds = [tile.right, tile.bottom, tile.left, tile.top];
        for (var i = 0; i < neighbourIds.length; i++) {
            if (neighbourIds[i] != -1 && game.tiles[neighbourIds[i]].type == AssetType.FLOOR) {
                let hasNew = true;
                for (var j = 0; j < visited.length; j++) {
                    if (visited[j][0] == neighbourIds[i]) {
                        hasNew = false;
                    }
                }
                for (var j = 0; j < frontier.length; j++) {
                    if (frontier[j][0] == neighbourIds[i]) {
                        hasNew = false;
                    }
                }
                if (hasNew) {
                    frontier.push([neighbourIds[i], tileId]);
                }
            }
        }

        if (tile.id == targetId) {
            let current: number = visited[visited.length - 1][0];
            let currentOrigin: number = visited[visited.length - 1][1];
            let trace: number[] = [];
            trace.push(current);
            for (var m = 0; m < 10; m++) {
                for (var i = visited.length - 1; i > 0; i--) {
                    if (visited[i][0] == currentOrigin) {
                        trace.push(currentOrigin);
                        current = visited[i][0];
                        currentOrigin = visited[i][1];
                    }
                }
            }

            let path: number[] = [];
            for (var i = 0; i < trace.length; i++) {
                path.push(trace[trace.length - 1 - i]);
            }
            console.log(path);
            return path;
        }

        //too complicated?
        maxIterations -= 1;
        if (maxIterations < 0) {
            frontier = [];
        }
    }
    return [];
}