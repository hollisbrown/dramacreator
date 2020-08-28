import Position from '../../common/src/Position';
import Message, { MessageType } from '../../common/src/Message';
import Asset from '../../common/src/Asset';
import Tile from '../../common/src/Tile';
import Item from '../../common/src/Item';
import Character from '../../common/src/Character';
import GameData from '../../common/src/GameData';

export default class Game {

    isRunning: boolean;
    input: any;
    socket: any;

    constructor() {
        this.isRunning = false;
    }

    init(input: any, socket: any) {
        this.socket = socket;
        this.input = input;
        this.isRunning = true;
    }

    update(deltaTime: number) {
        if (this.input.isMouseClicked) {
            this.sendPosition(this.input.mousePosition);
        }
    }

    receive(data: string) {
        // var messageType = data.substring(0, 1);
        // var jsonMessage = data.substring(1, data.length);
        // var pos = Object.assign(new Position, JSON.parse(jsonMessage));
        // console.log("received Pos: " + pos.toString());

        var object = JSON.parse(data);
        var gameData = Object.assign(new GameData, object);
        var character = Object.assign(new Character(0), gameData.characters[0]);
    }

    sendPosition(pos: Position) {
        let posArray : Position[] = [pos, new Position(7,7)];
        let json = JSON.stringify({type:MessageType.TEST, data:posArray});
        console.log(json);
        this.socket.send(json);
    }

}