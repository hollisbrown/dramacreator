import Asset, { AssetType } from '../../common/src/Asset';
import Config from '../../common/src/Config';
import Position from '../../common/src/Position';
import Input from './Input';

export default class UI {

    ctx: any;
    input: Input;
    cursorTimer: number = 0;

    fontDefault: string = "15px Courier New";
    fontSmall: string = "8px Courier New";

    constructor(ctx: any, input: Input) {
        this.ctx = ctx;
        this.input = input;
    }
    button(
        name: string,
        x: number,
        y: number,
        width: number,
        height: number,
        color: string
    ) {

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);

        this.ctx.font = this.fontDefault;
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.fillText(name, x + width / 2, y + height / 2 + 4);

        var isHovered =
            this.input.mousePosition.x > x &&
            this.input.mousePosition.x < x + width &&
            this.input.mousePosition.y > y &&
            this.input.mousePosition.y < y + height;

        if (isHovered) {
            this.ctx.fillStyle = "rgba(255,255,255,0.2)";
            this.ctx.fillRect(x, y, width, height);
            return this.input.isMouseClicked;
        }
    }
    swatch(
        x: number,
        y: number,
        width: number,
        height: number,
        color: string
    ) {

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);

        var isHovered =
            this.input.mousePosition.x > x &&
            this.input.mousePosition.x < x + width &&
            this.input.mousePosition.y > y &&
            this.input.mousePosition.y < y + height;

        if (isHovered) {
            this.ctx.fillStyle = "rgba(255,255,255,0.2)";
            this.ctx.fillRect(x, y, width, height);
            return this.input.isMouseClicked;
        }
    }
    asset(
        img: any,
        name: string,
        x: number,
        y: number,
        width: number,
        height: number,
        color: string
    ) {

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.drawImage(
            img,
            0,
            0,
            Config.pixelsPerRow,
            Config.pixelsPerRow,
            x + 10,
            y + 10,
            Config.pixelsPerRow,
            Config.pixelsPerRow
        );

        this.ctx.fillStyle = "#CCCCCC";
        this.ctx.textAlign = "left";
        this.ctx.font = this.fontDefault;
        this.ctx.fillText(name, x + 60, y + 30);

        var isHovered =
            this.input.mousePosition.x > x &&
            this.input.mousePosition.x < x + width &&
            this.input.mousePosition.y > y &&
            this.input.mousePosition.y < y + height;

        if (isHovered) {
            this.ctx.fillStyle = "rgba(255,255,255,0.02)";
            this.ctx.fillRect(x, y, width, height);
            return this.input.isMouseClicked;
        }
    }
    speechbubble(
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
            this.ctx.fillStyle = "rgba(20,20,20,0.75)";
        } else {
            this.ctx.fillStyle = "rgba(255,255,255,0.75)";
        }
        this.ctx.fillRect(bubbleX, bubbleY, width, height);

        //trunk
        this.ctx.beginPath();
        this.ctx.moveTo(x - 4, y - 44);
        this.ctx.lineTo(x, y - 40);
        this.ctx.lineTo(x + 4, y - 44);
        this.ctx.closePath();
        this.ctx.fill();

        //text
        if (isEmote) {
            this.ctx.fillStyle = "#ffffff";
        } else {
            this.ctx.fillStyle = "#000000";
        }
        this.ctx.textAlign = "center";
        this.ctx.font = this.fontSmall;
        this.ctx.fillText(text, x, bubbleY + 10);
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
        ctx.font = this.fontDefault;
        ctx.fillText(name, x + 5, y + 10);
    }
    dropDown(
        options: string[],
        selected: number,
        x: number,
        y: number,
        width: number,
        height: number,
        color: string
    ) {
        for (var i = 0; i < options.length; i++) {
            if (this.button(options[i], x, y + (i * height), width, height, color)) {
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
        text: string,
        x: number,
        y: number,
        width: number,
        height: number,
    ) {

        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(x, y, width, height);

        this.ctx.font = this.fontDefault;
        this.ctx.textAlign = "left";
        this.ctx.fillStyle = "#000000";

        var lines = this.getTextLines(text, Math.floor(width / 10));
        for (var i = 0; i < lines.length; i++) {
            this.ctx.fillText(lines[i], x + 12, y + 20 + (i * 20));
        }

        if (!this.input.isTyping) {
            var isHovered =
                this.input.mousePosition.x > x &&
                this.input.mousePosition.x < x + width &&
                this.input.mousePosition.y > y &&
                this.input.mousePosition.y < y + height;

            if (isHovered) {
                this.ctx.strokeStyle = "#000000";
                this.ctx.strokeRect(x, y, width, height);
                return this.input.isMouseClicked;
            }
        }

    }
    textBoxActive(
        x: number,
        y: number,
        width: number,
        height: number,
    ) {

        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(x, y, width, height);

        this.ctx.font = this.fontDefault;
        this.ctx.textAlign = "left";
        this.ctx.fillStyle = "#000000";

        var lines = this.getTextLines(this.input.typedString, Math.floor(width / 10));

        if (this.cursorTimer < 0.5) {
            lines[lines.length - 1] += "|";
        } else {
            lines[lines.length - 1] += " ";
        }

        for (var i = 0; i < lines.length; i++) {
            this.ctx.fillText(lines[i], x + 12, y + 20 + (i * 20));
        }

        var isHovered =
            this.input.mousePosition.x > x &&
            this.input.mousePosition.x < x + width &&
            this.input.mousePosition.y > y &&
            this.input.mousePosition.y < y + height;

        if (!isHovered) { //click outside
            this.ctx.strokeStyle = "#000000";
            this.ctx.strokeRect(x, y, width, height);
            return this.input.isMouseClicked;
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

    sortableMenu(position: Position, id: number, assetId: number, assetType: AssetType): boolean {

        let width = 200;
        let height = 140;

        this.ctx.fillStyle = "#040404";
        this.ctx.fillRect(position.x, position.y, width, height);

        this.ctx.font = this.fontDefault;
        this.ctx.textAlign = "left";
        this.ctx.fillStyle = "#ffffff";

        this.ctx.fillText("Type: " + assetType, position.x + 20, position.y + 30);
        this.ctx.fillText("Id: " + id, position.x + 20, position.y + 50);
        this.ctx.fillText("Asset Id: " + assetId, position.x + 20, position.y + 70);

        let isHovered: boolean = (
            this.input.mousePosition.x > position.x &&
            this.input.mousePosition.x < position.x + width &&
            this.input.mousePosition.y > position.y &&
            this.input.mousePosition.y < position.y + height
        )
        return isHovered;
    }
}