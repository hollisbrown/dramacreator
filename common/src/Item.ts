import Position from "./Position";
import Container from "./Container";

export default class Item {

    isUsed: boolean;
    id: number;
    type: ItemType;
    assetId: number;
    position: Position;
    positionRender: Position;
    offsetRender: Position;

    container: Container;
    containerId: number;
    containerSlot: number;

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
        this.offsetRender = new Position(16, 32);

        this.type = ItemType.NONE;
        this.container = new Container(9);
    }
}
export class ItemType {
    static NONE: number = 0;
    static WEAPON: number = 1;
    static FOOD: number = 2;
    static CONTAINER: number = 3;
    static PROCESSOR: number = 4;
}
