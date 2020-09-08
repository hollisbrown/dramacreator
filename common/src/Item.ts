import Position from "./Position";

export default class Item {

    isUsed: boolean;
    id: number;
    assetId: number;
    position: Position;
    positionRender: Position;
    containerId: number;
    containerSlot: number;
    offset: Position;

    constructor(
        id: number = 0,
        assetId: number = 0,
        position: Position = new Position,
        containerId: number = 0,
        containerSlot: number = 0
    ) {
        this.isUsed = false;
        this.id = id;
        this.assetId = assetId;
        this.position = position;
        this.positionRender = position;
        this.containerId = containerId;
        this.containerSlot = containerSlot;
        this.offset = new Position(16, 32);
    }
}
