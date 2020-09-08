export default class Player {

    socket: any;
    uniqueId: number;
    characterId: number;

    constructor(socket: any, uniqueId: number) {
        this.socket = socket;
        this.uniqueId = uniqueId;
        this.characterId = -1;
    }

}