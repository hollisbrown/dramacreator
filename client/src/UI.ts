import Position from '../../common/src/Position';
import Input from './Input';

export default class UI {

    ctx: any;
    cursorTimer: number = 0;

    constructor(ctx: any) {
        this.ctx = ctx;
    }

    button(
        input: Input,
        name: string,
        x: number,
        y: number,
        width: number,
        height: number,
        color: string
    ) {

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);

        this.ctx.font = "15px Courier New";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.fillText(name, x + width / 2, y + height / 2 + 4);

        var isHovered =
            input.mouse.x > x &&
            input.mouse.x < x + width &&
            input.mouse.y > y &&
            input.mouse.y < y + height;

        if (isHovered) {
            this.ctx.fillStyle = "rgba(255,255,255,0.2)";
            this.ctx.fillRect(x, y, width, height);
            return input.isMouseClicked;
        }
    }
    swatch(
        input: Input,
        x: number,
        y: number,
        width: number,
        height: number,
        color: string
    ) {

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);

        var isHovered =
            input.mouse.x > x &&
            input.mouse.x < x + width &&
            input.mouse.y > y &&
            input.mouse.y < y + height;

        if (isHovered) {
            this.ctx.fillStyle = "rgba(255,255,255,0.2)";
            this.ctx.fillRect(x, y, width, height);
            return input.isMouseClicked;
        }
    }
    speechbubble(
        ctx: any,
        text: string,
        x: number,
        y: number
    ) {
        var width = 8 + text.length * 5;
        var height = 16;
        var bubbleX = x - width / 2;
        var bubbleY = y - 60;
        var isEmote = text[0] == "*";
        //bubble
        if (isEmote) {
            ctx.fillStyle = "rgba(20,20,20,0.75)";
        } else {
            ctx.fillStyle = "rgba(255,255,255,0.75)";
        }
        ctx.fillRect(bubbleX, bubbleY, width, height);

        //trunk
        ctx.beginPath();
        ctx.moveTo(x - 4, y - 44);
        ctx.lineTo(x, y - 40);
        ctx.lineTo(x + 4, y - 44);
        ctx.closePath();
        ctx.fill();

        //text
        if (isEmote) {
            ctx.fillStyle = "#ffffff";
        } else {
            ctx.fillStyle = "#000000";
        }
        ctx.textAlign = "center";
        ctx.font = "600 8px Courier New";
        ctx.fillText(text, x, bubbleY + 10);
    }
    debugPoint(
        ctx: any,
        name: string,
        x: number,
        y: number
    ) {

        ctx.lineWidth = 1;
        ctx.strokeStyle = "#ffffff";
        ctx.fillStyle = "#ffffff";

        ctx.beginPath();
        ctx.moveTo(x - 10, y);
        ctx.lineTo(x + 10, y);
        ctx.moveTo(x, y - 10);
        ctx.lineTo(x, y + 10);
        ctx.stroke();

        ctx.textAlign = "left";
        ctx.font = "14px Courier New";
        ctx.fillText(name, x + 5, y + 10);
    }
    dropDown(
        input: Input,
        options: string[],
        selected: number,
        x: number,
        y: number,
        width: number,
        height: number,
        color: string
    ) {
        for (var i = 0; i < options.length; i++) {
            if (this.button(input, options[i], x, y + (i * height), width, height, color)) {
                return i;
            }
            if (i === selected) {
                this.ctx.lineWidth = 3;
                this.ctx.strokeStyle = "#FFFFFF";
                this.ctx.strokeRect(x, y + (i * height), width, height);
            }
        }
        return -1;
    }
    textBox(
        input: Input,
        text: string,
        x: number,
        y: number,
        width: number,
        height: number,
        isTyping: boolean,
        inputString: string
    ) {

        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(x, y, width, height);

        this.ctx.font = "600 15px Courier New";
        this.ctx.textAlign = "left";
        this.ctx.fillStyle = "#000000";

        if (isTyping) {
            var lines = this.getTextLines(inputString, Math.floor(width / 10));

            if (this.cursorTimer < 0.5) {
                lines[lines.length - 1] += "|";
            } else {
                lines[lines.length - 1] += " ";
            }
        } else {
            var lines = this.getTextLines(text, Math.floor(width / 10));
        }

        for (var i = 0; i < lines.length; i++) {
            this.ctx.fillText(lines[i], x + 12, y + 20 + (i * 20));
        }

        if (!isTyping) {
            var isHovered =
                input.mouse.x > x &&
                input.mouse.x < x + width &&
                input.mouse.y > y &&
                input.mouse.y < y + height;

            if (isHovered) {
                this.ctx.strokeStyle = "#000000";
                this.ctx.strokeRect(x, y, width, height);
                return input.isMouseClicked;
            }
        }

    }
    getTextLines(text: string, maxCharactersPerLine: number) {

        var remainingCharacters = text.length;
        var lines = [];
        while (remainingCharacters > 0) {
            var newLine;
            var lineEnd = maxCharactersPerLine;
            if (remainingCharacters > maxCharactersPerLine) {
                for (var i = lineEnd; i > 0; i--) {
                    if (text[i] == " ") {
                        lineEnd = i;
                        i = 0;
                    }
                }
                newLine = text.substring(0, lineEnd);
                text = text.substring(lineEnd + 1, remainingCharacters);
                remainingCharacters -= lineEnd + 1;
            } else {
                newLine = text.substring(0, remainingCharacters);
                remainingCharacters = 0;
            }
            lines.push(newLine);
        }
        return lines;
    }
}

