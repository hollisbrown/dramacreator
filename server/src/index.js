require('source-map-support').install();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const server = http.createServer(express);
const port = 6969;
const webSocketServer = new WebSocket.Server({ server });
const maxConnections = 4;

import Player from './player';
import LogUtils from '../../common/src/LogUtils';


var players = [];
var player = new Player("Test");


start();
function start(){
    webSocketServer.on("connection", connect);
    server.listen(port, function () { console.log("server is listening"); });
}

function connect(socket) {

    if (players.length < maxConnections) {
        players.push(new Player(socket));
        LogUtils.logInfo("Player connected");
    } else {
        console.log("Server full")
        return;
    }

    socket.on("close", disconnect);
    socket.on("message", receive);
}

function disconnect(info) {
    //remove player
    console.log("Player disconnected " + info);
}

function receive(data) {
    var buffer = new Uint8Array(data);
    var messageType = buffer[0];
    console.log(" received message of type: " + messageType);
    switch (messageType) {

        case MessageType.TEST:
            console.log("Test");
            sendAll(buffer);
            break;
    }
}

function sendAll(buffer) {
    for (var i = 0; i < players.length; i++) {
        players[i].socket.send(buffer);
    }
}