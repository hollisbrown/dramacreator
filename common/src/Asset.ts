import Sprite from './Sprite';

export default class Asset {
    isUsed: boolean;
    id: number;
    type: number;
    name: string;
    description: string;
    sprite: Sprite;

    constructor(
        id: number = 0,
        type: number = 0,
        name: string = "_",
        description: string = "_",
        sprite: Sprite = new Sprite()
    ) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.description = description;
        this.sprite = sprite;
        this.isUsed = false;
    }
}

export class AssetType {
    static NONE: number = 0;
    static FLOOR: number = 1;
    static WALL: number = 2;
    static ITEM: number = 3;
    static CHARACTER: number = 4;
}