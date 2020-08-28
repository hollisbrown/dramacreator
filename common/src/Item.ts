import Position from "./Position";

export default class Item {

    id: number;
    assetId: number;
    position: Position;
    positionRender: Position;
    containerId: number;
    containerSlot: number;

    constructor(
        id: number,
        assetId: number = 0,
        position: Position = new Position,
        containerId: number = 0,
        containerSlot: number = 0
    ) {
        this.id = id;
        this.assetId = assetId;
        this.position = position;
        this.containerId = containerId;
        this.containerSlot = containerSlot;
    }

}