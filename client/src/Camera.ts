import Position from '../../common/src/Position';
import Config from '../../common/src/Config';

export default class Camera {
    position: Position;
    zoom: number;
    canvas: any;

    constructor(canvas: any) {
        this.position = new Position();
        this.zoom = 2;
        this.canvas = canvas;
    }
    move(direction: Position, deltaTime: number) {
        let positionDelta = Object.assign(new Position(), direction);
        positionDelta = positionDelta.normalized();
        positionDelta = positionDelta.multiply(Config.camSpeed * deltaTime);
        this.position = this.position.add(positionDelta);
    }
    follow(characterPosition: Position) {
        let newPosition = Object.assign(new Position(), characterPosition);
        newPosition.x += this.canvas.width / (2 * this.zoom);
        newPosition.y += this.canvas.height / (2 * this.zoom);
        this.position = newPosition;
    }
}

