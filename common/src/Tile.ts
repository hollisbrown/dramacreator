import Position from "./Position";

export default class Tile {

    id: number;
    assetId: number;
    position: Position;
    positionRender: Position;

    constructor(
        id: number,
        assetId: number = 0,
        position: Position = new Position
    ) {
        this.id = id;
        this.assetId = assetId;
        this.position = position;
    }

}