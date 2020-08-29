import Position from '../../common/src/Position';
import Camera from './Camera';
import Config from '../../common/src/Config';

export default class Input {

    canvas: any;
    isMouseClicked: boolean;
    mouse: Position;

    constructor() {
        this.canvas = document.getElementById("canvas");
        this.isMouseClicked = false;
        this.mouse = new Position(0, 0);
        document.addEventListener('click', (evt) => this.onMouseClick(evt));
        document.addEventListener('mousedown', (evt) => this.onMouseDown(evt));
        document.addEventListener('mousemove', (evt) => this.onMouseMove(evt));
    }

    onMouseMove(evt: any) {
        let canvasRect = this.canvas.getBoundingClientRect();
        this.mouse = new Position(evt.x - canvasRect.left, evt.y - canvasRect.top)
    }

    onMouseClick(evt: any) {
        this.isMouseClicked = true;
    }

    onMouseDown(evt: any) {

    }

    reset() {
        this.isMouseClicked = false;
    }

}

