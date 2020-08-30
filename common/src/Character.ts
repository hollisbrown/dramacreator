import Position from "./Position";

export default class Character {

    id: number;
    assetId: number;
    frameId: number;
    position: Position;
    positionLast: Position;
    positionTarget: Position;
    positionRender: Position;
    bufferCanvas: OffscreenCanvas;

    constructor(
        id: number,
        assetId: number = 0,
        frameId: number = 0,
        position: Position = new Position()
    ) {
        this.id = id;
        this.assetId = assetId;
        this.position = position;
        this.positionLast = position;
        this.positionRender = position;
        this.positionTarget = position;
    }

    lerp(amount: number) {
        let x = this.position.x;
        let y = this.position.y;
        this.positionRender.x = (1 - amount) * x + amount * this.positionTarget.x;
        this.positionRender.y = (1 - amount) * y + amount * this.positionTarget.y;
    }
}