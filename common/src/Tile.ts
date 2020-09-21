import Position from "./Position";
import Asset, { AssetType, TileType } from './Asset';

export default class Tile {

    id: number;
    assetId: number;
    type: TileType;
    position: Position;
    positionRender: Position;
    isWalkable: boolean;

    right: number = -1;
    bottomRight: number = -1;
    bottom: number = -1;
    bottomLeft: number = -1;
    left: number = -1;
    topLeft: number = -1;
    top: number = -1;
    topRight: number = -1;

    constructor(
        id: number = 0,
        assetId: number = 0,
        type: TileType = TileType.NONE,
        isWalkable: boolean = false,
        position: Position = new Position
    ) {
        this.id = id;
        this.assetId = assetId;
        this.type = type;
        this.isWalkable = isWalkable;
        this.position = position;
    }

    setNeighbours(tilesPerRow: number) {

        if (this.position.x < tilesPerRow - 1) { // not on right border
            this.right = this.id + 1;
            if (this.position.y < tilesPerRow - 1) {// not on bottom border
                this.bottomRight = this.id + 1 + tilesPerRow;
            }
            if (this.position.y > 0) {// not on top border
                this.topRight = this.id + 1 - tilesPerRow;
            }
        }

        if (this.position.y < tilesPerRow - 1) { // not on bottom border
            this.bottom = this.id + tilesPerRow;
        }

        if (this.position.x > 0) { // not on left border
            this.left = this.id - 1;
            if (this.position.y < tilesPerRow - 1) {// not on bottom border
                this.bottomLeft = this.id - 1 + tilesPerRow;
            }
            if (this.position.y > 0) {// not on top border
                this.topLeft = this.id - 1 - tilesPerRow;
            }
        }
        if (this.position.y > 0) { // not on top border
            this.top = this.id - tilesPerRow;
        }
    }
}