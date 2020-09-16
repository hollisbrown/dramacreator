import Position from "./Position";

export default class Container {

    size: number;
    content: number[];

    constructor(size: number) {
        this.size = size;
        this.content = [];
        for (var i = 0; i < size; i++) {
            this.content.push(-1);
        }
    }
}
