import Container from "./Container";
import Position from "./Position";

export default class Character {

    isUsed: boolean;
    id: number;
    assetId: number;
    position: Position;
    positionRender: Position;
    positionLast: Position;
    positionTarget: Position;
    bufferCanvas: OffscreenCanvas;
    offsetRender: Position;

    actionPoints: number;
    container: Container;

    constructor(
        id: number = 0,
        assetId: number = 0,
        position: Position = new Position(0, 0)
    ) {
        this.id = id;
        this.assetId = assetId;
        this.position = position;
        this.positionLast = position;
        this.positionRender = position;
        this.positionTarget = position;
        this.offsetRender = new Position(16, 32);
        this.isUsed = false;

        this.container = new Container(3);
    }

    lerp(amount: number) {
        this.positionRender.x = (1 - amount) * this.position.x + amount * this.positionTarget.x;
        this.positionRender.y = (1 - amount) * this.position.y + amount * this.positionTarget.y;
    }
}