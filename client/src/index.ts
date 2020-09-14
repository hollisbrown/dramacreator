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
import Character from '../../common/src/Character';

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
    menuMode();
    showStats();
    showChatlog();

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

        // renderer.characterPath = findPath(
        //     positionCurrent.toTile(Config.tilesPerRow),
        //     positionTarget.toTile(Config.tilesPerRow));

        game.characters[controlledCharacterId].positionTarget = positionTarget;
        send("WALK", positionTarget);
    }

    cursorTarget();
}
function menuSortable(){

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
    let x = canvas.width / 2 - (width/2);
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
    console.log("received control: " + controlledCharacterId);
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
// function findPath(start: Position, end: Position): Position[] {
//     let path: Position[] = [];
//     let unvisited: Position[] = [];
//     let visited: Position[] = [];

//     path.push(start);
//     unvisited.push(start);

//     while (unvisited.length > 0) {
//         console.log(unvisited.length);

//         //find the neighbours of the first tile in UNIVISTED
//         let neighbours = getNeighbours(unvisited[0]);

//         //move to VISITED
//         visited.push(unvisited[0]);
//         //remove from UNVISITED
//         unvisited.splice(0, 1);

//         let winnerId: number = 0;
//         let winnderDistance: number = neighbours[0].distance(end);
//         for (var i = 0; i < neighbours.length; i++) {

//             let isVisited = false;
//             for (var j = 0; j < visited.length; j++) {
//                 if (visited[j].equals(neighbours[i])) {
//                     isVisited = true;
//                 }
//             }

//             if (!isVisited) {
//                 //add to UNIVISTED
//                 unvisited.push(neighbours[i]);

//                 //also check the winner
//                 let compareDistance = neighbours[i].distance(end);
//                 if (compareDistance < winnderDistance) {
//                     winnerId = i;
//                     winnderDistance = compareDistance;
//                 }
//             }
//         }
//         path.push(neighbours[winnerId]);
//         if (neighbours[winnerId].equals(end)) {
//             unvisited = [];
//         }
//     }
//     return path;
// }
// function getNeighbours(position: Position): Position[] {

//     let neighbours: Position[] = [];
//     if (position.x < Config.tilesPerRow - 1) {
//         let right = new Position(position.x + 1, position.y);
//         if (game.getTileType(right) == AssetType.FLOOR) {
//             neighbours.push(right);
//         }
//     }
//     if (position.y < Config.tilesPerRow - 1) {
//         let bottom = new Position(position.x, position.y + 1);
//         if (game.getTileType(bottom) == AssetType.FLOOR) {
//             neighbours.push(bottom);
//         }
//     }
//     if (position.x > 0) {
//         let left = new Position(position.x - 1, position.y);
//         if (game.getTileType(left) == AssetType.FLOOR) {
//             neighbours.push(left);
//         }
//     }
//     if (position.y > 0) {
//         let top = new Position(position.x, position.y - 1);
//         if (game.getTileType(top) == AssetType.FLOOR) {
//             neighbours.push(top);
//         }
//     }
//     return neighbours;
// }