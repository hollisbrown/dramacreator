import Position from "./Position";
import { AssetType } from './Asset';

export default class Tile {

    id: number;
    assetId: number;
    position: Position;
    positionRender: Position;

    constructor(
        id: number = 0,
        assetId: number = 0,
        position: Position = new Position
    ) {
        this.id = id;
        this.assetId = assetId;
        this.position = position;
    }
}