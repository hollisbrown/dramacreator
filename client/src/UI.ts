import Asset, { AssetType } from '../../common/src/Asset';
import Config from '../../common/src/Config';
import Position from '../../common/src/Position';
import Input from './Input';

export default class UI {
    ctx: any;
    input: Input;
    cursorTimer: number = 0;
    icons: HTMLImageElement;
    fontDefault: string = "15px Courier New";
    fontSmall: string = "8px Courier New";

    constructor(ctx: any, input: Input) {
        this.ctx = ctx;
        this.input = input;

        this.icons = new Image();
        this.icons.src =
            'data: image / png; base64, iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAIE0lEQVR4Xu1dbZoeJwzLXiH3P + NeYftMn05KKSDJBl4 + nH / JGGNLwgZmdvP1K / 5cjcDX1dlH8r9CAJeLIAQQArgcgcvT71oBvr + /fx48f/ / +3dXv5RwNTb8rUSMF8Pq2ohGiLCPXTQArk / +mPksEDxaz5rIuiHfcVgKwgjpSnDkBM + fykv + MhwJApfchJU86HWMlrUdyr4 + ZpPSey + JPGdMUAEP + A3I6YWmMRQRobiSQdE4FEOS39XzEPOpiUu0pAbQIbCVtBcRLft7zrXGoYhg1D0sqa5fmtbQALJUjr0ilv6vEMvYW8Bm / eRurHbOt87sEgBSPntcAsI6r9XyvP4aomXPkIrCSDzeBKCnv810EwOZZW52MgFibnGwP + S4BIFA8pZfxrWzGevlD5dfasljyS + 0g3++ovswtgAGVsSkFbB03sgXUYvKuQJUwdk / A + jULgJnASqR13AwB1PrvrNWfVtaUA + v8IQBGyf / Y5ML8xOpfZg / A4GZdydZxpQrQk6Qa + NbVx2CY2tRy8eR4fAXwiiknKQXbuwFTBIBIRs9rcx0vAAVkxjYXwIzVz5LL2qV5UgJggGnZqCB5V613PMrXAjTyWXuuzqXau98GosRU8mu7XDRP6bllbnaeB + iR / msnGiY + ZQFAATATjrAp9VplnhnkKPGsarusAFYF7LS4QgCnMSrmEwIQATvNPARwGqNiPiEAEbDTzEMApzEq5hMCEAE7zTwEcBqjYj4hABGw08xDAKcxKuYTAhABO808BLAJo8oLHiUlkwBqL2riBYwCPWc7GmtZAOgtXYiAIxZZMZ9 / PT68eEsCaH1soH6IgAC4 / TnCs9eXSbQAUEAPYYzN7cSy + ac9v9X / vUKQBYBKzqjNCgvcKXYlHEcIYVsBeJXvFcro + RmyS4tRjUsWANp4jK4At2xCGRwZkSC + aAEwK4YJmvFTskHKRs + t877jkPBy / 6hVongULGv7BcZHNwGM2gCqxKr2iIhPPWfIy2N7xqi / GqeLAEaQ7yXSOz4 / 1XiFoFaEbQTQm / wexKVk9fbnFQI7fgsB9CR / NFHIv9rjWSJrdqgibCUAlIwCFiJK8VUq4z1jVWNR7LcSADpqKInXdt0qcV4h9a4I1viVcdM3gT1bQE0kKpGqvUWcM8ZsUQFmAMFWhNHEqxVBWbmtew / Fz / QKMFMA7IWMAtgn4mfntFTXKwTAVgQWaKvd6Ipj2cBOF8DPz8 / f / 0PI19dXlwslKxmnj2PFNlUAL / kv + CGC8TJEQpgmgJz8EMF48tMZakKYJoAnmKgAc0lvnRTSZ88mGFWK1N7Vu2MP8HkRlDaLb1TMicglgDXSjyjykxFD / J + 2HfDdjUBUgLv5x / 9r2OX4HJ9 + VIDjKW4nGAIIAeyLgOWV6b7Zjol82wqgXHb0hq72alg5fvWOyerPLIAbCWC / CdhJCLIAEAgzks9L / 4xWwLyfZ2zYlYpwZv2gW0FJAK0EeybfSq5G9mgRsP5ZOyZHlWTGPl + gJgHUVnmP5FESnxCAmpdqn + fsHZ9eDb9c1XyaBPBMkIvg5AqgEqLapwLwjE39PC / q8m80Sr4lATwTlIieRX46f02AI / YgpT1HaX602lB1a + XHjJ0igFKQvVTLJLlCC3hiCAEkbeA2ASChWvGwjivtIVq / PCJ9JreAqACI / n / bpNqOQgAY2z97kFl7AMv + xjKG6f / 53UDrNFb6PQGlOwG5Aty0CcxzRSs0fW4RAeM / 3WgiAeSf7HU9BcxagewZGYFHFJf / mLQIzFdi7bZNFUHNbxpYftJo5cVwJFUAFhS19ynkzDoF9BKU4gfZpqeP0kmkdAGE7hhoATBqZmwUstOE8nGti6jailTmRmSwvhQ / yNa6B8hxlE8BCrGKLQOipdyWSiYzF1otqg9mYzdqzm7HQAuhljE1cEurghEFWk2ITO / 41qpTckVxlp7X2oO8CfQQ6RnbY1V4CfSOP0oA1k1dDxAtQrKMqZ02nn / 35s / 66IHX23a6tABvQN7xrU0gUxqtxFlWb60Us + Sr + 4VW / t1bgBXIXgJIwant8NkdMiMcpgWh + Sy5W8Ywe4BWRWweAz2l1DMWqbu0qnqB12oFqniU1Z + L3Lro0haARPrYwnsAxklpxdRWqgVEZUV6gGPLeC621klFiad2uvFi1ooBCqBUftmAlORZn7X + 1tr8sL4 / LQAP1qXYGfwpAeSbIgQoMzHyUXteK / UzWsCTV6m15f82qv1ZMWuNkwQwIgDVJyqTI8RXmnP0VbSKi9V + OwG0yuQI8q3A7jJuSwHsAu4OcYYAdmBpYIwhgIHg7uA6BLADSwNjDAEMBHcH1yGAHVgaGKNZAOoV8cAcwrUDAZMAapcxcQ53MPGhoZQA0MsP9PxDucW0BAJQAKVS3yI8WgOB + kIm1PcApR9GaN2F5 / bRGhZiPAulKgD1rZtqvy4kd0UmC0CFZ9RrWjWOsC8jILUAFcQgX0Vsvj29CUTvv5kfRJyfXsyIECgKAH0AwdwDIB8osHg + B4H / CQAd45hPotLQkb85acYsNQSqAmj98oHHmVryYz + wpghDAGvyMi2qaAHToF5zotgErsnLtKjiGDgN6jUniougNXmZFlVcBU + Des2JZAGoL33i + Lcm8W9UUgto / cxb64IoXgevKwJ6E / imkP6AZOm9f9z8rUt2KTIogGcQ + uQLPd8LkruipQSQQ8K8DLoLxn2zNQkgrQppa9gXhnsjNwvgXsjOyjwEcBafcjYhABmyswaEAM7iU87mL1bziPlboNH7AAAAAElFTkSuQmCC'
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
    buttonIcon(
        iconId: number,
        x: number,
        y: number,
        width: number,
        height: number,
        color: string,
        isSelected: boolean = false
    ) {

        let spritesheetRows = 4;
        let spritesheetX = iconId % spritesheetRows;
        let spritesheetY = Math.floor(iconId / spritesheetRows);
        let drawX = x + width / 2 - 16;
        let drawY = y + height / 2 - 16;

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.drawImage(this.icons, spritesheetX * 32, spritesheetY * 32, 32, 32, drawX, drawY, 32, 32);

        if (isSelected) {
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "#EEEEEE";
            this.ctx.strokeRect(x, y, width, height);
        }

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
    toggle(
        name: string,
        nameToggle: string,
        x: number,
        y: number,
        width: number,
        height: number,
        color: string,
        isToggle: boolean
    ) {

        this.ctx.font = this.fontDefault;
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);

        if (isToggle) {
            this.ctx.fillStyle = "rgba(0,0,0,0.2)";
            this.ctx.fillRect(x, y, width, height);
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.fillText(nameToggle, x + width / 2, y + height / 2 + 4);
        } else {
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.fillText(name, x + width / 2, y + height / 2 + 4);
        }

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

        let isHovered =
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
        let offsetY = 40;
        let lines = this.getTextLines(text, 32);
        let bubbleWidth = 8 + text.length * 5;
        if (lines.length > 1) {
            bubbleWidth = 164;
        }
        let lineHeight = 12;
        let bubbleHeight = (lines.length * lineHeight) + 8;
        let bubbleX = x - bubbleWidth / 2;
        let bubbleY = y - bubbleHeight - offsetY;
        let isEmote = text[0] == "*";

        //bubble
        if (isEmote) {
            this.ctx.fillStyle = "rgba(20,20,20,0.75)";
        } else {
            this.ctx.fillStyle = "rgba(255,255,255,0.75)";
        }
        this.ctx.fillRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);

        //trunk
        this.ctx.beginPath();
        this.ctx.moveTo(x - 4, y - offsetY);
        this.ctx.lineTo(x, y - offsetY + 4);
        this.ctx.lineTo(x + 4, y - offsetY);
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
        // this.ctx.fillText(text, x, bubbleY + 10);      
        for (var i = 0; i < lines.length; i++) {
            this.ctx.fillText(lines[i], x, bubbleY + 12 + (i * lineHeight));
        }
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
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = "#FFFFFF";
                this.ctx.strokeRect(x + 1, y + 1 + (i * height), width - 2, height - 2);
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

        let remainingCharacters = text.length;
        let lines = [];
        while (remainingCharacters > 0) {
            let newLine;
            let lineEnd = maxCharactersPerLine;
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
    lookText(
        text: string,
        x: number,
        y: number
    ) {
        let offsetY = 10;
        let lines = this.getTextLines(text, 32);
        let bubbleWidth = 8 + text.length * 5;
        if (lines.length > 1) {
            bubbleWidth = 164;
        }
        let lineHeight = 12;
        let bubbleHeight = (lines.length * lineHeight) + 8;
        let bubbleX = x - bubbleWidth / 2;
        let bubbleY = y - bubbleHeight - offsetY;

        this.ctx.fillStyle = "rgba(20,20,20,0.6)";
        this.ctx.fillRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);
        this.ctx.fillStyle = "#ffffff";
        this.ctx.textAlign = "center";
        this.ctx.font = this.fontSmall;

        for (var i = 0; i < lines.length; i++) {
            this.ctx.fillText(lines[i], x, bubbleY + 12 + (i * lineHeight));
        }
    }
}
