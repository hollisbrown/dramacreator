import Position from '../../common/src/Position';

export default class Input {

    isMouseClicked: boolean;
    mousePosition: Position;

    constructor() {
        this.isMouseClicked = false;
        this.mousePosition = new Position(0, 0);
        document.addEventListener('click', (evt) => this.onMouseClick(evt));
        document.addEventListener('mousedown', (evt) => this.onMouseDown(evt));
    }

    onMouseClick(evt: any) {
        this.isMouseClicked = true;
        this.mousePosition = new Position(evt.x, evt.y);
    }

    onMouseDown(evt: any) {
    }

    reset() {
        this.isMouseClicked = false;
    }

}

