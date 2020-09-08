import Position from '../../common/src/Position';
import Config from '../../common/src/Config';

export default class Camera {
    position: Position;
    zoom: number;
    canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.position = new Position(0, 0);
        this.zoom = 2;
        this.canvas = canvas;
    }

    movePosition(direction: Position, deltaTime: number) {
        direction = direction.normalized();
        direction = direction.multiply((Config.camSpeed / this.zoom) * deltaTime);
        this.position = this.position.add(direction);
        this.position.floor();
    }

    setPosition(position: Position) {
        let newPosition = new Position(position.x, position.y);
        newPosition.x -= this.canvas.width / (2 * this.zoom);
        newPosition.y -= this.canvas.height / (2 * this.zoom);
        this.position = newPosition;
        this.position.floor();
    }

    setZoom(scroll: number) {
        if (scroll < 0 && this.zoom < 8) {
            this.zoom = Math.floor(this.zoom * 2);
        } else if (scroll > 0 && this.zoom > 1) {
            this.zoom = Math.floor(this.zoom / 2);
        }
    }

    getScreenPosition(worldPosition: Position): Position {
        return new Position(
            (worldPosition.x - this.position.x) * this.zoom,
            (worldPosition.y - this.position.y) * this.zoom
        );
    }

    getWorldPosition(screenPosition: Position): Position {
        return new Position(
            (screenPosition.x / this.zoom) + this.position.x,
            (screenPosition.y / this.zoom) + this.position.y
        );
    }
}

