import Position from "./Position";

export default class Item {

    id: number;
    assetId: number;
    frameId: number;
    position: Position;
    positionRender: Position;
    containerId: number;
    containerSlot: number;

    constructor(
        id: number = 0,
        assetId: number = 0,
        frameId: number = 0,
        position: Position = new Position,
        containerId: number = 0,
        containerSlot: number = 0
    ) {
        this.id = id;
        this.frameId = frameId;
        this.assetId = assetId;
        this.position = position;
        this.positionRender = position;
        this.containerId = containerId;
        this.containerSlot = containerSlot;
    }
}
