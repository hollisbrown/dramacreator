export default class Position {

    x: number;
    y: number;


    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    magnitude(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
    normalized(): Position {
        let mag = this.magnitude();
        return new Position(
            this.x / mag,
            this.y / mag
        );
    }
    distance(other: Position) {
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
    toString(): string {
        return " Position [ " + this.x + " | " + this.y + " ] ";
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
}