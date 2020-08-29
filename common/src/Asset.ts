export default class Asset {

    id: number;
    type: number;
    name: string;
    description: string;
    image: Uint8Array;

    constructor(
        id: number,
        type: number = 0,
        name: string = "Unnamed",
        description: string = "Nothing to see here.",
        image: Uint8Array = new Uint8Array()
    ) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.description = description;
        this.image = image;
    }
}

export class AssetType {
    static NONE: number = 0;
    static FLOOR: number = 1;
    static WALL: number = 2;
    static ITEM: number = 3;
    static CHARACTER: number = 4;
}