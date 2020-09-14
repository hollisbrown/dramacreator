import Position from '../../common/src/Position';
import Config from '../../common/src/Config';

export default class Input {

    canvas: HTMLCanvasElement;
    isMouseClicked: boolean;
    isMouseDown: boolean;
    isMouseUp: boolean;
    isMouseRight: boolean;
    isMouseHold: boolean;
    isMouseOnUi: boolean;
    mousePosition: Position;
    scrollDelta: number;

    direction: Position;
    typedString: string;
    isTyping: boolean;
    isEnter: boolean;
    isShortcutChat: boolean;
    isShortcutDelete: boolean;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.mousePosition = new Position(0, 0);
        this.direction = new Position(0, 0);
        document.addEventListener('contextmenu', (evt) => this.onContextMenu(evt));
        document.addEventListener('click', (evt) => this.onMouseClick(evt));
        document.addEventListener('mousedown', (evt) => this.onMouseDown(evt));
        document.addEventListener('mouseup', (evt) => this.onMouseUp(evt));
        document.addEventListener('mousemove', (evt) => this.onMouseMove(evt));
        document.addEventListener('keydown', (evt) => this.onKeyDown(evt));
        document.addEventListener('keyup', (evt) => this.onKeyUp(evt));
        document.addEventListener('mousewheel', (evt) => this.onMouseWheel(evt));
    }
    reset() {
        this.isMouseClicked = false;
        this.isMouseDown = false;
        this.isMouseUp = false;
        this.isEnter = false;
        this.isShortcutChat = false;
        this.isShortcutDelete = false;
        this.scrollDelta = 0;
    }
    onMouseWheel(evt: any) {
        this.scrollDelta = evt.deltaY;
    }
    onContextMenu(evt: any) { //default right click
        evt.preventDefault();
        this.isMouseRight = true;
    }
    onMouseClick(evt: any) {
        this.isMouseClicked = true;
        this.isMouseRight = (evt.button == 2);
    }
    onMouseDown(evt: any) {
        this.isMouseDown = true;
        this.isMouseHold = true;
        this.isMouseRight = (evt.button == 2);
    }
    onMouseUp(evt: any) {
        this.isMouseUp = true;
        this.isMouseHold = false;
        this.isMouseRight = (evt.button == 2);
    }
    onMouseMove(evt: any) {
        let canvasRect = this.canvas.getBoundingClientRect();

        this.mousePosition = new Position(
            evt.x - canvasRect.left,
            evt.y - canvasRect.top);
    }
    onKeyDown(evt: any) {
        if(evt.key == "Backspace"){
            evt.preventDefault();
        }
        if (evt.key == "Enter") {
            this.isShortcutChat = true;
        }
        if (this.isTyping) {
            this.writeInputString(evt);
            return;
        }
        if (evt.key == "Delete") {
            this.isShortcutDelete = true;
        }
        if (evt.key == "a" || evt.key == "ArrowLeft") {
            this.direction.x = -1;
        }
        if (evt.key == "w" || evt.key == "ArrowUp") {
            this.direction.y = -1;
        }
        if (evt.key == "d" || evt.key == "ArrowRight") {
            this.direction.x = 1;
        }
        if (evt.key == "s" || evt.key == "ArrowDown") {
            this.direction.y = 1;
        }
    }
    onKeyUp(evt: any) {
        if (!this.isTyping) {

            if (evt.key == "a" || evt.key == "ArrowLeft" || evt.key == "d" || evt.key == "ArrowRight") {
                this.direction.x = 0;
            }
            if (evt.key == "w" || evt.key == "ArrowUp" || evt.key == "s" || evt.key == "ArrowDown") {
                this.direction.y = 0;
            }
        }
    }
    writeInputString(evt: any) {

        if (this.typedString.length < 128 && evt.keyCode >= 32 && evt.keyCode < 220) {
            this.typedString += evt.key;
        } else {
            switch (evt.keyCode) {
                case 8: //backspace
                    if (this.typedString.length > 0) {
                        this.typedString = this.typedString.substring(0, this.typedString.length - 1);
                    }
                    break;
                case 13: //enter
                    this.isEnter = true;
                    break;
            }
        }
    }
    startTyping(string: string) {
        this.isTyping = true;
        this.typedString = string;
    }
    stopTyping(): string {
        this.isTyping = false;
        let ret = this.typedString;
        this.typedString = "";
        return ret;
    }
    mouseCamera(cameraPosition: Position, cameraZoom: number): Position {
        return new Position(
            (this.mousePosition.x / cameraZoom) + cameraPosition.x,
            (this.mousePosition.y / cameraZoom) + cameraPosition.y
        );
    }
    mousePixel(): Position {
        return new Position(
            Math.floor(this.mousePosition.x / Config.editorPixelSize),
            Math.floor(this.mousePosition.y / Config.editorPixelSize));
    }
    mousePixelId(): number {
        let mousePixel = this.mousePixel();
        return mousePixel.y * Config.pixelsPerRow + mousePixel.x;
    }
    mouseTile(cameraPosition: Position, cameraZoom: number): Position {
        let mouseCamera = this.mouseCamera(cameraPosition, cameraZoom);
        return new Position(
            Math.floor(mouseCamera.x / Config.pixelsPerRow),
            Math.floor(mouseCamera.y / Config.pixelsPerRow)
        );
    }
    mouseTileId(cameraPosition: Position, cameraZoom: number): number {
        let mouseTile = this.mouseTile(cameraPosition, cameraZoom);
        return mouseTile.y * Config.tilesPerRow + mouseTile.x;
    }
}

