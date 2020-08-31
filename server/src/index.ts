require('source-map-support').install();
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

start();

function start() {
    console.log("Server starting ...");
    webSocketServer.on("connection", connect);
    server.listen(port, function () { console.log("server is listening"); });

    game.create();
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
