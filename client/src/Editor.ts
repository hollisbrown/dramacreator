import Asset, { AssetType } from '../../common/src/Asset';
import Sprite from '../../common/src/Sprite';
import Config from '../../common/src/Config';
import Input from './Input';
import UI from './UI';
import Position from '../../common/src/Position';

export default class Editor {

    toolSet: string[] = [
        "Paint",
        "Fill"
    ]
    ui: UI;
    input: Input;
    canvas: any;
    ctx: any;

    isEnabled: boolean = false;
    isGridVisible: boolean = true;
    isMouseOnSprite: boolean;
    isTranslatingPixels: boolean = false;
    isTypingName: boolean = false;
    isTypingDescription: boolean = false;

    selectedColor: number = 1;
    selectedTool: number = 0;
    selectedType: number = 0;

    asset: Asset;
    editorAssetTypes = ["None", "Floor", "Wall", "Item", "Character"];
    onBuild: (type: string, data: any) => void; //callback function

    constructor(
        canvas: any,
        ctx: any,
        input: Input,
        ui: UI,
        onBuild: (type: string, data: any) => void
    ) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.input = input;
        this.ui = ui;
        this.onBuild = onBuild;
    }
    update() {
        this.background();
        this.asset.sprite.render(this.ctx, Config.colorSet, 0, Config.editorPixelSize);
        this.grid();
        this.swatches(790, 16, 4, 42, 42);
        this.tools(940, 16, 4, 120, 50);
        this.commands(1080, 16, 4, 120, 50);
        this.properties(940, 300, 4, 250, 600);
        this.paint();
        this.translate();
    }
    paint() {
        this.isMouseOnSprite =
            this.input.mouse.x >= 0 &&
            this.input.mouse.x < Config.editorPixelSize * Config.pixelsPerRow &&
            this.input.mouse.y >= 0 &&
            this.input.mouse.y < Config.editorPixelSize * Config.pixelsPerRow;

        if (!this.isMouseOnSprite) {
            return;
        }

        let mousePixel = this.input.mousePixel();
        switch (this.selectedTool) {
            case 0://PAINT

                if (this.input.isMouseClicked || this.input.isMouseDown || this.input.isMouseHold) {
                    if (this.input.isMouseRight) {
                        this.asset.sprite.setPixel(mousePixel.x, mousePixel.y, 0);
                    } else {
                        this.asset.sprite.setPixel(mousePixel.x, mousePixel.y, this.selectedColor);
                    }
                }
                break;

            case 1://FILL

                if (this.input.isMouseDown) {
                    let pixelList: number[] = [];
                    let currentColor = this.asset.sprite.getPixel(mousePixel.x, mousePixel.y);
                    this.asset.sprite.addPixelsToList(pixelList, mousePixel.x, mousePixel.y, currentColor);

                    if (this.input.isMouseRight) {
                        this.asset.sprite.setPixelArray(pixelList, 0);
                    } else {
                        this.asset.sprite.setPixelArray(pixelList, this.selectedColor);
                    }
                }
                break;

        }

        //cursor
        this.ctx.fillStyle = "rgba(255,255,255,0.1)";
        this.ctx.fillRect(
            mousePixel.x * Config.editorPixelSize,
            mousePixel.y * Config.editorPixelSize,
            Config.editorPixelSize,
            Config.editorPixelSize);
    }
    translate() {
        let x = this.input.direction.x;
        let y = this.input.direction.y;

        if (x != 0 || y != 0) {
            if (!this.isTranslatingPixels) {
                this.isTranslatingPixels = true;
                this.asset.sprite.pixels = new Uint8Array(this.asset.sprite.getPixelsTranslated(x, y));
                console.log("translated");
            }
        } else {
            this.isTranslatingPixels = false;
        }
    }
    swatches(startX: number, startY: number, padding: number, width: number, height: number) {
        var x;
        var y;

        for (var i = 0; i < Config.colorSet.length; i++) {

            if (i < Config.colorSet.length / 2) {
                x = startX;
                y = i * (height + padding) + startY;
            } else {
                x = startX + width + padding;
                y = (i - Config.colorSet.length / 2) * (height + padding) + startY;
            }

            if (this.ui.swatch(this.input, x, y, width, height, Config.colorSet[i])) {
                this.selectedColor = i;
            }

            //selection visualisation
            if (i == this.selectedColor) {
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = "#ffffff";
                this.ctx.strokeRect(x, y, width, height);
            }
        }

        //transparent swatch
        this.ctx.strokeStyle = "#666666";
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(startX + 1, startY + 1, width - 1, height - 1);
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(startX + width, startY + height);
        this.ctx.stroke();

    }
    tools(startX: number, startY: number, padding: number, width: number, height: number) {
        var x;
        var y;

        for (var i = 0; i < this.toolSet.length; i++) {

            x = startX;
            y = i * (height + padding) + startY;

            if (this.ui.button(this.input, this.toolSet[i], x, y, width, height, "#333333")) {
                this.selectedTool = i;
            }

            if (i == this.selectedTool) {
                //cursor
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = "#ffffff";
                this.ctx.strokeRect(x, y, width, height);
            }
        }
    }
    commands(startX: number, startY: number, padding: number, width: number, height: number) {
        var x = startX;
        var y = startY;

        if (this.ui.button(this.input, "GRID", x, y, width, height, "#333333")) {
            this.isGridVisible = !this.isGridVisible;
        }

        y += height + padding;

        if (this.ui.button(this.input, "CLEAR", x, y, width, height, "#333333")) {
            this.asset.sprite.setAllPixels(0);
        }

        y += height + padding;

        if (this.ui.button(this.input, "SAVE", x, y, width, height, "#333333")) {
            this.save();
        }
    }
    properties(startX: number, startY: number, padding: number, width: number, height: number) {

        if (this.isTypingName) {

            this.asset.name = this.input.typedString;

            if (this.ui.textBoxActive(this.input, this.input.typedString, startX, startY + 200, width, 60)) {
                this.input.stopTyping();
                this.isTypingName = false;
            }
        } else {
            if (this.ui.textBox(this.input, this.asset.name, startX, startY + 200, width, 60)) {
                this.input.startTyping(this.asset.name);
                this.isTypingName = true;
            }
        }

        if (this.isTypingDescription) {

            this.asset.description = this.input.typedString;

            if (this.ui.textBoxActive(this.input, this.input.typedString, startX, startY + 280, width, 120)) {
                this.input.stopTyping();
                this.isTypingDescription = false;
            }
        } else {
            if (this.ui.textBox(this.input, this.asset.description, startX, startY + 280, width, 120)) {
                this.input.startTyping(this.asset.description);
                this.isTypingDescription = true;
            }
        }

        var dropDownSelection = this.ui.dropDown(this.input, this.editorAssetTypes, this.asset.type, startX, startY, 80, 30, "#777777");
        if (dropDownSelection != -1) {
            this.asset.type = dropDownSelection;
        }
    }
    load(asset: Asset) {
        this.asset = asset;
        this.selectedTool = 0;
        this.isEnabled = true;
    }
    save() {
        this.onBuild("ASSET", this.asset);
        this.isEnabled = false;
    }
    background() {
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = "#101010";
        this.ctx.fillRect(0, 0, Config.editorPixelSize * Config.pixelsPerRow, Config.editorPixelSize * Config.pixelsPerRow);
    }
    grid() {

        if (!this.isGridVisible) {
            return;
        }

        this.ctx.strokeStyle = "rgba(200,200,200,0.2)";
        this.ctx.beginPath();

        for (var i = 0; i < Config.pixelsPerRow; i++) {
            this.ctx.moveTo(i * Config.editorPixelSize, 0);
            this.ctx.lineTo(i * Config.editorPixelSize, Config.pixelsPerRow * Config.editorPixelSize);
            this.ctx.moveTo(0, i * Config.editorPixelSize);
            this.ctx.lineTo(Config.pixelsPerRow * Config.editorPixelSize, i * Config.editorPixelSize);
        }

        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
}


