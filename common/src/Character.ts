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
        position: Position = new Position
    ) {
        this.id = id;
        this.assetId = assetId;
        this.position = position;
    }
}