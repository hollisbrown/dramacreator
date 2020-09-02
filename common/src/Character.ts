import Position from "./Position";

export default class Character {

    id: number;
    assetId: number;
    frameId: number;
    position: Position;
    positionRender: Position;
    positionLast: Position;
    positionTarget: Position;
    bufferCanvas: OffscreenCanvas;
    offset: Position;

    constructor(
        id: number = 0,
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
        this.offset = new Position(16,32);
    }

    lerp(amount: number) {
        this.positionRender.x = (1 - amount) * this.position.x + amount * this.positionTarget.x;
        this.positionRender.y = (1 - amount) * this.position.y + amount * this.positionTarget.y;
    }
}