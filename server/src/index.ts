require('source-map-support').install();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const server = http.createServer(express);
const port = 6969;
const webSocketServer = new WebSocket.Server({ server });
const maxConnections = 4;

import Player from './player';
import Position from '../../common/src/Position';
import { MessageType } from '../../common/src/Message';
import GameData from '../../common/src/GameData';

var config = {
    maxPlayers: 8,
    maxAssets: 128,
    maxItems: 128,
    maxCharacters: 8,
    tilesPerRow: 32,
    pixelsPerRow: 32,
    pixelsPerImage: 1024,
    characterSpeed: 12,
    fastFramesPerSecond: 2
};

var players: Player[] = [];
var game: GameData = new GameData();

start();

function start() {
    console.log("Server starting ...");
    webSocketServer.on("connection", connect);
    server.listen(port, function () { console.log("server is listening"); });
    game.init(config);
}

function connect(socket: any) {

    if (players.length < maxConnections) {
        players.push(new Player(socket));
        console.log("connected players: " + players.length);
    } else {
        console.log("Server full")
        return;
    }
    sendSync(socket);
    socket.on("close", function close(closeEvent: any) { removePlayer(socket); });
    socket.on("message", receive);
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

function receive(string: string) {

    console.log("Message received");
    var message = JSON.parse(string);
    switch (message.type) {
        case MessageType.TEST:
            var posArray: Position[] = message.data.map((pos: any) => Object.assign(new Position, pos));
            for (var i = 0; i < posArray.length; i++) {
                console.log(posArray[i].toString());
            }
            break;
    }
}

function sendToAll(buffer: Uint8Array) {
    for (var i = 0; i < players.length; i++) {
        players[i].socket.send(buffer);
    }
}

function sendSync(socket: any){
    socket.send(JSON.stringify(game));
}