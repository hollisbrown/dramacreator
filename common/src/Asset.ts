export default class Asset {

    id: number;
    type: number;
    name: string;
    description: string;
    image: Uint8Array;

    constructor(id: number, type: number = 0, name: string = "Unnamed", description: string = "Nothing to see here.") {
        this.id = id;
        this.type = type;
        this.name = name;
        this.description = description;
    }

    

}