import Position from '../../common/src/Position';
import Config from '../../common/src/Config';

export default class Input {

    canvas: any;

    isMouseClicked: boolean;
    isMouseDown: boolean;
    isMouseRight: boolean;
    isMouseHold: boolean;
    isMouseOnUi: boolean;
    mouse: Position;
    scrollDelta: number;

    direction: Position;
    typedString: string;
    isTyping: boolean;

    isShortcutFreeMode: boolean;
    isShortcutBuildMode: boolean;
    isShortcutPlayMode: boolean;

    constructor(canvas: any) {
        this.canvas = canvas;
        this.isMouseClicked = false;
        this.mouse = new Position(0, 0);
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
        this.isShortcutBuildMode = false;
        this.isShortcutPlayMode = false;
        this.isShortcutFreeMode = false;
        this.scrollDelta = 0;
    }
    //MOUSE
    onMouseWheel(evt: any) {
        this.scrollDelta = evt.deltaY;
    }
    onContextMenu(evt: any) { //default right click
        evt.preventDefault();
    }
    onMouseClick(evt: any) {
        this.isMouseClicked = true;
        if (evt.button == 2) {
            this.isMouseRight = true;
        } else {
            this.isMouseRight = false;
        }
    }
    onMouseDown(evt: any) {
        this.isMouseDown = true;
        this.isMouseHold = true;
        if (evt.button == 2) {
            this.isMouseRight = true;
        } else {
            this.isMouseRight = false;
        }
    }
    onMouseUp(evt: any) {
        this.isMouseHold = false;
        this.isMouseRight = false;
    }
    mouseCamera(cameraPosition: Position, cameraZoom: number): Position {
        return new Position(
            (this.mouse.x / cameraZoom) - cameraPosition.x,
            (this.mouse.y / cameraZoom) - cameraPosition.y
        );
    }
    mousePixel(): Position {
        return new Position(
            Math.floor(this.mouse.x / Config.editorPixelSize),
            Math.floor(this.mouse.y / Config.editorPixelSize));
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
    isMouseOnTiles(cameraPosition: Position, cameraZoom: number): boolean {
        let mouseTile = this.mouseTile(cameraPosition, cameraZoom);
        return (mouseTile.x >= 0 && mouseTile.x < Config.tilesPerRow && mouseTile.y >= 0 && mouseTile.y < Config.tilesPerRow);
    }
    onMouseMove(evt: any) {
        let canvasRect = this.canvas.getBoundingClientRect();

        this.mouse = new Position(
            evt.x - canvasRect.left,
            evt.y - canvasRect.top);
    }
    //KEYS
    onKeyDown(evt: any) {
        if (this.isTyping) {
            this.writeInputString(evt);
            return;
        }

        switch (evt.key) {
            case "1":
                this.isShortcutFreeMode = true;
                break;
            case "2":
                this.isShortcutBuildMode = true;
                break;
            case "3":
                this.isShortcutPlayMode = true;
                break;
        }

        if (evt.key == "a" || evt.key == "ArrowLeft") {
            this.direction.x = 1;
        }
        if (evt.key == "w" || evt.key == "ArrowUp") {
            this.direction.y = 1;
        }
        if (evt.key == "d" || evt.key == "ArrowRight") {
            this.direction.x = -1;
        }
        if (evt.key == "s" || evt.key == "ArrowDown") {
            this.direction.y = -1;
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

        if (evt.keyCode >= 32 && evt.keyCode < 220) {
            this.typedString += evt.key;
        } else {
            switch (evt.keyCode) {
                case 8: //backspace
                    if (this.typedString.length > 0) {
                        this.typedString = this.typedString.substring(0, this.typedString.length - 1);
                    }
                    break;

                case 13: //enter
                    this.stopTyping();
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
}

