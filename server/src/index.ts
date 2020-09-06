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
import Asset from '../../common/src/Asset';

var players: Player[] = [];
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
    socket.on("close", function close(evt: any) { removePlayer(socket); });
    socket.on("message", receive);
}
function addPlayer(socket: any) {
    if (players.length < maxConnections) {
        players.push(new Player(socket));
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
function receive(json: string) {
    let object = JSON.parse(json);
    let type: string = object.type;
    let data = object.data;
    let id: number = -1;

    switch (type) {
        case "ASSET":
            id = game.setAsset(data);
            break;
        case "TILE":
            id = game.setTile(data);
            break;
        case "ITEM":
            id = game.setItem(data);
            break;
        case "CHARACTER":
            id = game.setCharacter(data);
            break;
    }

    if (id != -1) {
        sendToAll(json);
    }
}
function sendToAll(buffer: string) {
    for (var i = 0; i < players.length; i++) {
        players[i].socket.send(buffer);
    }
}
