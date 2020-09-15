require('source-map-support').install();
const fs = require('fs');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const server = http.createServer(express);
const port = 6969;
const webSocketServer = new WebSocket.Server({ server });

import Config from '../../common/src/Config';
import Player from './player';
import Position from '../../common/src/Position';
import Game from '../../common/src/Game';
import Asset, { AssetType } from '../../common/src/Asset';

var players: Player[] = [];
var uniquePlayerId: number = 0;
var game: Game = new Game();
var file: string = './savegame/save.json';

start();

function start() {
    console.log("Server starting ...");
    webSocketServer.on("connection", connect);
    server.listen(port, function () { console.log("server is listening"); });
    loadFromFile();
    setInterval(update, 1000);
}
function update() {
    game.moveCharacters();
    sendToAll("WALK", game.getCharacterPositions());
}
function saveToFile() {
    let data = JSON.stringify(game);

    fs.writeFile(file, data, (err: any) => {
        if (err) throw err;
        console.log('game saved');
    });
}
function loadFromFile() {
    fs.access(file, fs.constants.F_OK | fs.constants.R_OK, (err: any) => {
        if (err) {
            game.create();
            console.log('no game data found. Creating new');
        } else {
            let dataJSON = fs.readFileSync(file);
            let data = JSON.parse(dataJSON);
            game.load(data);
            console.log('game data found. Loading from file');
        }
    });
}
function connect(socket: any) {
    addPlayer(socket);
    socket.onclose = function close(evt: any) { removePlayer(socket); };
    socket.onmessage = function message(evt: any) { receive(evt.data, socket) };
}
function addPlayer(socket: any) {
    if (players.length < Config.maxPlayers) {
        players.push(new Player(socket, uniquePlayerId));
        uniquePlayerId++;
        console.log("Player added. Number of players: " + players.length);
    } else {
        console.log("Server full. Number of players: " + players.length)
        return;
    }
    send(socket, "GAME", game);
    sendToAll("PLAYERS", players.length);
}
function removePlayer(socket: any) {
    for (var i = 0; i < players.length; i++) {
        if (players[i].socket == socket) {
            players.splice(i, 1);
            console.log("connected players: " + players.length);
        }
    }
    socket.close();
    console.log("Player removed ");
    sendToAll("PLAYERS", players.length);
    saveToFile();
}
function receive(json: string, socket: any) {

    //console.log(json.substring(0,128));

    let object = JSON.parse(json);
    let type: string = object.type;
    let data = object.data;
    switch (type) {
        case "ASSET":
            receiveAsset(socket, data);
            break;
        case "TILE":
            receiveTile(socket, data);
            break;
        case "ITEM":
            receiveItem(socket, data);
            break;
        case "CHARACTER":
            receiveCharacter(socket, data);
            break;
        case "CONTROL":
            receiveControl(socket, data);
            break;
        case "CHAT":
            receiveChat(socket, data);
            break;
        case "WALK":
            receiveWalkTarget(socket, data);
            break;
        case "PATH":
            receivePath(socket, data);
            break;
    }
}
function send(socket: any, type: string, data: any) {
    let message = { type, data };
    let messageJSON = JSON.stringify(message);
    if (socket.readyState == WebSocket.OPEN) {
        socket.send(messageJSON);
    }
}
function sendToAll(type: string, data: any) {
    let message = { type, data };
    let messageJSON = JSON.stringify(message);
    for (var i = 0; i < players.length; i++) {
        if (players[i].socket.readyState == WebSocket.OPEN) {
            players[i].socket.send(messageJSON);
        }
    }
}
function getPlayerId(socket: any): number {
    for (var i = 0; i < players.length; i++) {
        if (players[i].socket == socket) {
            return i;
        }
    }
    return -1; //socket not registered
}
function receiveAsset(socket: any, data: any) {

    let asset = game.setAsset(data);
    if (asset.id != -1) {
        sendToAll("ASSET", data);
    }
}
function receiveTile(socket: any, data: any) {
    let tile = game.setTile(data);
    if (tile.id != -1) {
        sendToAll("TILE", data);
    }
}
function receiveItem(socket: any, data: any) {
    let item = game.setItem(data);
    if (item.id != -1) {
        sendToAll("ITEM", item);
    }
}
function receiveCharacter(socket: any, data: any) {
    let character = game.setCharacter(data);
    if (character.id != -1) {
        sendToAll("CHARACTER", data);
    }
}
function receiveControl(socket: any, data: any): boolean {
    let playerId = getPlayerId(socket);
    let receivedCharacterId = parseInt(data);
    if (receivedCharacterId != -1) {
        for (var i = 0; i < players.length; i++) {
            if (players[i].characterId == receivedCharacterId) {
                return false;
            }
        }
    }
    players[playerId].characterId = receivedCharacterId;
    send(socket, "CONTROL", receivedCharacterId);
    return true;
}
function receiveChat(socket: any, data: any) {
    let playerId = getPlayerId(socket);
    let characterId = players[playerId].characterId;
    let message = data;
    sendToAll("CHAT", { characterId, message });
}
function receiveWalkTarget(socket: any, data: any) {
    let playerId = getPlayerId(socket);
    let characterId = players[playerId].characterId;
    game.setCharacterTarget(characterId, data);
}
function receivePath(socket:any,data:any){
    let playerId = getPlayerId(socket);
    let characterId = players[playerId].characterId;
    game.setCharacterPath(characterId, data);
}
