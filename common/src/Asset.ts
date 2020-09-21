import Sprite from './Sprite';

export default class Asset {
    isUsed: boolean;
    id: number;
    type: AssetType;
    tileType: TileType;
    itemType: ItemType;
    name: string;
    description: string;
    sprite: Sprite;

    constructor(
        id: number = 0,
        type: AssetType = AssetType.NONE,
        name: string = "_",
        description: string = "_",
        isUsed: boolean = true,
        sprite: Sprite = new Sprite()
    ) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.description = description;
        this.sprite = sprite;
        this.isUsed = isUsed;
        this.tileType = TileType.NONE;
        this.itemType = ItemType.NONE;
    }
}
export enum AssetType {
    NONE = 0,
    TILE = 1,
    ITEM = 2,
    CHARACTER = 3
}
export enum ItemType {
    NONE = 0,
    WEAPON = 1,
    FOOD = 2,
    CONTAINER = 3,
    PROCESSOR = 4
}
export enum TileType {
    NONE = 0,
    FLOOR = 1,
    WALL = 2,
    LIQUID = 3
}