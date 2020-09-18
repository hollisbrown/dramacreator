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
var hoveredSortable: ISortable;
var selectedSortable: ISortable;
var selectedSortableType: AssetType;

var numberOfPlayers: number = 0;
var controlledCharacterId: number = -1;
var countToRound: number = Config.countToRound;
var chatLog: string[] = [];
var vicinity: number[][] = [];
var lastMouseTileId: number;
var lastCharacterTileId: number;
var lookTimer: number;

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
        case "POINTS":
            countToRound = data.countToRound;
            game.setCharacterActionPoints(data.points);
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
        chatInput();
        showRound();
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

    //character
    let character = game.characters[controlledCharacterId];
    let positionCharacter = character.positionRender;
    let tileIdCharacter = input.getTileId(positionCharacter);

    if (lastCharacterTileId != tileIdCharacter) {
        lastCharacterTileId = tileIdCharacter;
        vicinity = getVicinity(tileIdCharacter);
        renderer.characterVicinity = vicinity.map(e => e[0]);
    }

    let positionMouseWorld = camera.getWorldPosition(input.mousePosition);
    let positionMouseTile = input.getTilePosition(positionMouseWorld).multiply(Config.pixelsPerRow);
    let tileIdMouse = input.getTileId(positionMouseWorld);

    hoveredSortable = renderer.getSortableAtPosition(positionMouseWorld);
    if (hoveredSortable != null) {
        cursorSortable(positionMouseWorld);
        renderer.characterPath = [];

        if (input.isMouseDown && input.isMouseRight) {
            //look
            renderer.lookText = game.assets[hoveredSortable.assetId].name + " – " + game.assets[hoveredSortable.assetId].description;
            renderer.lookPosition = hoveredSortable.position;
            renderer.lookTimer = 6;
        }

    } else {
        if (lastMouseTileId != tileIdMouse) {
            renderer.characterPath = getPath(tileIdMouse, vicinity);
        }
        cursorTile(input.mousePosition, positionMouseTile);
    }

    camera.setPosition(positionCharacter);

    if (
        input.isMouseDown &&
        !input.isMouseRight &&
        !isHoveringModeMenu &&
        input.isPositionOnTiles(positionCharacter) &&
        input.isPositionOnTiles(positionMouseWorld)
    ) {
        //walk
        let path = getPath(tileIdMouse, vicinity);
        renderer.characterPath = path;
        if (path.length > 0) {
            send("PATH", path);
        }
    }
}
function chatInput() {
    if (controlledCharacterId == -1) {
        return;
    }

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

    let width = 100;
    let height = 50;

    let x = canvas.width - width - 20;
    let y = 20;

    isHoveringModeMenu = (
        input.mousePosition.x > x &&
        input.mousePosition.x < x + width &&
        input.mousePosition.y > y &&
        input.mousePosition.y < y + height
    )

    if (mode == Mode.PLAY) {
        if (ui.button("GM", x, y, width, height, "#119922")) {
            send("CONTROL", -1);
        }
    } else {
        if (ui.toggle("Builder", "Builder", x, y, width, height, "#992222", (mode == Mode.BUILD))) {
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
    renderer.controlledCharacterId = controlledCharacterId;
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
function cursorTile(positionMouse: Position, positionTile: Position) {
    let pos = camera.getScreenPosition(positionTile);
    let size = 5 * camera.zoom;
    ctx.lineWidth = 1 * camera.zoom;
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.strokeRect(
        pos.x,
        pos.y,
        Config.pixelsPerRow * camera.zoom,
        Config.pixelsPerRow * camera.zoom
    );
    ctx.beginPath();
    ctx.moveTo(positionMouse.x - size, positionMouse.y - size);
    ctx.lineTo(positionMouse.x + size, positionMouse.y - size);
    ctx.lineTo(positionMouse.x, positionMouse.y);
    ctx.closePath();
    ctx.stroke();
}
function cursorSortable(position: Position) {
    let pos = camera.getScreenPosition(position);
    let size = 8 * camera.zoom;
    ctx.lineWidth = 1 * camera.zoom;
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.moveTo(pos.x - size, pos.y);
    ctx.lineTo(pos.x, pos.y - size);
    ctx.lineTo(pos.x + size, pos.y);
    ctx.lineTo(pos.x, pos.y + size);
    ctx.closePath();
    ctx.stroke();
}
function showStats() {
    let x = 20;
    let y = 140;
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = "15px Courier New";
    ctx.fillText("Items: " + renderer.numberOfUsedItems + "/" + game.items.length, x + 20, y + 30);
    ctx.fillText("Characters: " + renderer.numberOfUsedCharacters + "/" + game.characters.length, x + 20, y + 50);
    ctx.fillText("Players: " + numberOfPlayers + "/" + Config.maxPlayers, x + 20, y + 70);
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
function showRound() {
    if (controlledCharacterId == -1) {
        return;
    }
    let x = 20;
    let y = 20;
    let padding = 20;
    let width = 200;
    let height = 100;
    let widthPoint = (width - padding * 2) / Config.maxPoints;
    let widthRound = (width - padding * 2) / Config.countToRound;
    let actionPoints = game.characters[controlledCharacterId].actionPoints;

    ctx.fillStyle = "rgba(10,10,20,0.6)";
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Action Points: " + actionPoints, x + 20, y + 20);

    ctx.fillStyle = "rgba(0,0,0,0.5)"
    ctx.fillRect(x + padding, y + padding * 2, width - padding * 2, 20);

    ctx.fillStyle = "rgba(255,255,255,0.9)"
    ctx.fillRect(x + padding, y + padding * 2, widthPoint * actionPoints, 20);

    ctx.fillStyle = "rgba(0,0,0,0.5)"
    ctx.fillRect(x + padding, y + padding * 3.5, width - padding * 2, 5);

    ctx.fillStyle = "rgba(255,255,255,0.7)"
    ctx.fillRect(x + padding, y + padding * 3.5, widthRound * (Config.countToRound - countToRound), 5);
}
function getVicinity(startId: number): number[][] {
    let frontier: number[][] = [];  // [tile id , origin id]
    let visited: number[][] = []; // [tile id, origin id]
    let maxIterations: number = 100;

    frontier.push([startId, startId]);
    while (frontier.length > 0 && maxIterations > 0) {
        let tileId = frontier[0][0];
        let originId = frontier[0][1];
        let tile: Tile = game.tiles[tileId];
        visited.push([tileId, originId]);
        frontier.splice(0, 1);

        let neighbourIds = [tile.right, tile.bottom, tile.left, tile.top];
        for (var i = 0; i < neighbourIds.length; i++) {
            if (
                neighbourIds[i] != -1 &&
                neighbourIds[i] < game.tiles.length &&
                game.tiles[neighbourIds[i]].type == AssetType.FLOOR
            ) {
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

        maxIterations -= 1;
    }
    return visited;
}
function getPath(targetId: number, vicinity: number[][]): number[] {
    for (var i = 0; i < vicinity.length; i++) {
        if (vicinity[i][0] == targetId) {
            let current: number = vicinity[i][0];
            let currentOrigin: number = vicinity[i][1];
            let trace: number[] = [];
            trace.push(current);
            for (var j = 0; j < 10; j++) {
                for (var k = vicinity.length - 1; k > 0; k--) {
                    if (vicinity[k][0] == currentOrigin) {
                        trace.push(currentOrigin);
                        current = vicinity[k][0];
                        currentOrigin = vicinity[k][1];
                    }
                }
            }
            let path: number[] = [];
            for (var i = 0; i < trace.length; i++) {
                path.push(trace[trace.length - 1 - i]);
            }
            return path;
        }
    }
    return [];
}
