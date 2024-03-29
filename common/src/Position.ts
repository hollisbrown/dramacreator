export default class Position {

    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
    equals(other: Position): boolean {
        return (
            this.x == other.x &&
            this.y == other.y
        )
    }
    magnitude(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
    normalized(): Position {
        let mag = this.magnitude();
        if (mag > 0) {
            return new Position(
                this.x / mag,
                this.y / mag
            );
        }
        return new Position(0, 0);
    }
    distance(other: Position): number {
        let dx = other.x - this.x;
        let dy = other.y - this.y;
        return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    }
    lerp(other: Position, amount: number): Position {
        return new Position(
            (1 - amount) * this.x + amount * other.x,
            (1 - amount) * this.y + amount * other.y
        )
    }
    add(other: Position): Position {
        return new Position(
            this.x + other.x,
            this.y + other.y
        )
    }
    subtract(other: Position): Position {
        return new Position(
            this.x - other.x,
            this.y - other.y
        )
    }
    multiply(num: number) {
        return new Position(
            this.x * num,
            this.y * num
        )
    }
    divide(num: number) {
        return new Position(
            this.x / num,
            this.y / num
        )
    }
    toFixed() { //current solution to solve graphical aliasing problems
        this.x = Math.floor(this.x * 10) / 10;
        this.y = Math.floor(this.y * 10) / 10;
    }
    toTile(tilesPerRow: number): Position {
        return new Position(
            Math.floor(this.x / tilesPerRow),
            Math.floor(this.y / tilesPerRow)
        );
    }
}