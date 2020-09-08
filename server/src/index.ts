require('source-map-support').install();
const fs = require('fs');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const server = http.createServer(express);
const port = 6969;
const webSocketServer = new WebSocket.Server({ server });
const maxConnections = 4;

import Config from '../../common/src/Config';
import Player from './player';
import Position from '../../common/src/Position';
import Game from '../../common/src/Game';
import Asset, { AssetType } from '../../common/src/Asset';

var players: Player[] = [];
var lastUniqueId: number = 0;
var game: Game = new Game();
var file: string = './savegame/save.json';

start();

function start() {
    console.log("Server starting ...");
    webSocketServer.on("connection", connect);
    server.listen(port, function () { console.log("server is listening"); });

    loadFromFile();
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
    if (players.length < maxConnections) {
        players.push(new Player(socket, lastUniqueId));
        lastUniqueId++;
        console.log("Player added. Number of players: " + players.length);
    } else {
        console.log("Server full. Number of players: " + players.length)
        return;
    }
    let message = { type: "GAME", data: game };
    socket.send(JSON.stringify(message));
}
function removePlayer(socket: any) {
    saveToFile();
    for (var i = 0; i < players.length; i++) {
        if (players[i].socket == socket) {
            players.splice(i, 1);
            console.log("connected players: " + players.length);
        }
    }
    console.log("Player removed ");
}
function receive(json: string, socket: any) {

    let object = JSON.parse(json);
    let type: string = object.type;
    let data = object.data;
    let id: number = -1;
    switch (type) {
        case "ASSET":
            setAsset(socket, data);
            break;
        case "TILE":
            setTile(socket, data);
            break;
        case "ITEM":
            setItem(socket, data);
            break;
        case "CHARACTER":
            setCharacter(socket, data);
            break;
        case "CONTROL":
            setControl(socket, data);
            break;
    }
}
function send(socket: any, type: string, data: any) {
    let message = { type, data };
    let messageJSON = JSON.stringify(message);
    socket.send(messageJSON);
}
function sendToAll(type: string, data: any) {
    let message = { type, data };
    let messageJSON = JSON.stringify(message);
    for (var i = 0; i < players.length; i++) {
        players[i].socket.send(messageJSON);
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
function setAsset(socket: any, data: any) {
    let asset = game.setAsset(data);
    if (asset.id != -1) {
        sendToAll("ASSET", data);
    }
}
function setTile(socket: any, data: any) {
    let tile = game.setTile(data);
    if (tile.id != -1) {
        sendToAll("TILE", data);
    }
}
function setItem(socket: any, data: any) {
    let item = game.setItem(data);
    if (item.id != -1) {
        sendToAll("ITEM", item);
    }
}
function setCharacter(socket: any, data: any) {
    let character = game.setCharacter(data);
    if (character.id != -1) {
        sendToAll("CHARACTER", data);
    }
}
function setControl(socket: any, data: any): boolean {
    let receivedCharacterId = parseInt(data);
    for (var i = 0; i < players.length; i++) {
        if (players[i].characterId == receivedCharacterId) {
            return false;
        }
    }
    players[getPlayerId(socket)].characterId = receivedCharacterId;
    send(socket, "CONTROL", receivedCharacterId);
    return true;
}

