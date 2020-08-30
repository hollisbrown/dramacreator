import Asset from '../../common/src/Asset';
import Config from '../../common/src/Config';
import Input from './Input';
import UI from './UI';

export default class Editor {

    toolSet: string[] = [
        "Paint",
        "Erase"
    ]

    ui: UI;
    input: Input;
    ctx: any;

    isGridVisible: boolean = true;
    selectedColor: number = 1;
    selectedTool: number = 0;
    selectedImage: number = 0;
    selectedType: number = 0;

    editorImage: Uint8Array = new Uint8Array(Config.pixelsPerRow * Config.pixelsPerRow);

    editorAsset: Asset = new Asset(0);
    editorName = "Bob the Builder";
    editorDescription = "Looks like a cool dude with an nice hat";
    editorAssetTypes = ["None", "Floor", "Wall", "Item", "Character"];

    constructor(ctx: any, input: Input, ui: UI) {
        this.ctx = ctx;
        this.input = input;
        this.ui = ui;
    }
    update() {
        this.background();
        //this.renderImageToContext(editorImage, ctx, 0, Config.editorPixelSize);
        this.grid();
        this.mouse();
        this.swatches(790, 16, 4, 42, 42);
        this.tools(940, 16, 4, 120, 50);
        this.commands(1080, 16, 4, 120, 50);
        this.properties(940, 300, 4, 250, 600);
    }
    mouse() {
        let mousePixel = this.input.mousePixel();
        if (this.input.isMouseClicked || this.input.isMouseDown) {
            this.input.stopTyping();
            
            if (this.selectedTool == 0) { //PAINT
                
                if (this.input.isMouseRight) {
                    this.setPixel(mousePixel.x, mousePixel.y, 0);
                } else {
                    this.setPixel(mousePixel.x, mousePixel.y, this.selectedColor);
                }
            }
            else if (this.selectedTool == 1) { //FILL
                let pixelIds: number[] = [];
                let hoveredId: number = this.getPixelIndex(mousePixel.x, mousePixel.y);
                let currentColor = this.editorImage[hoveredId];
                this.collectFloodPixels(
                    pixelIds, 
                    mousePixel.x, 
                    mousePixel.y, 
                    currentColor, this.selectedColor);

                if (this.input.isMouseRight) {
                    this.setPixelArray(pixelIds, 0);
                } else {
                    this.setPixelArray(pixelIds, this.selectedColor);
                }
            }
        }

        //cursor
        this.ctx.fillStyle = "rgba(255,255,255,0.1)";
        this.ctx.fillRect(
            mousePixel.x * Config.editorPixelSize, 
            mousePixel.y * Config.editorPixelSize, 
            Config.editorPixelSize, 
            Config.editorPixelSize);
    }
    keys(key: any) {
        // switch (key) {
        //     case "ArrowLeft":
        //     case "a":
        //         this.editorImage = this.getImageTranslated(this.editorImage, 1, 0);
        //         break;
        //     case "ArrowRight":
        //     case "d":
        //         this.editorImage = this.getImageTranslated(this.editorImage, -1, 0);
        //         break;
        //     case "ArrowUp":
        //     case "w":
        //         this.editorImage = this.getImageTranslated(this.editorImage, 0, 1);
        //         break;
        //     case "ArrowDown":
        //     case "s":
        //         this.editorImage = this.getImageTranslated(this.editorImage, 0, -1);
        //         break;
        // }
    }
    getPixelIndex(x: number, y: number) {
        return (y * Config.pixelsPerRow) + x;
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
                this.input.stopTyping();
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
                this.input.stopTyping();
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
            this.clearImage();
        }

        y += height + padding;

        if (this.ui.button(this.input, "SAVE", x, y, width, height, "#333333")) {
            this.save();
        }
    }
    properties(startX: number, startY: number, padding: number, width: number, height: number) {
        if (this.ui.textBox(this.input, this.editorName, startX, startY + 200, width, 60)) {
            this.input.stopTyping();
            this.input.startTyping(this.editorName);
        }

        if (this.ui.textBox(this.input, this.editorDescription, startX, startY + 280, width, 120)) {
            this.input.stopTyping();
            this.input.startTyping(this.editorDescription);
        }

        var dropDownSelection = this.ui.dropDown(this.input, this.editorAssetTypes, this.editorAsset.type, startX, startY, 80, 30, "#777777");
        if (dropDownSelection != -1) {
            this.editorAsset.type = dropDownSelection;
        }
    }
    load(asset: Asset) {
        this.input.stopTyping();
        this.editorAsset = asset;
        this.editorImage = new Uint8Array(asset.image);
        this.selectedImage = asset.id;
        this.selectedTool = 0;

        this.editorName = asset.name;
        this.editorDescription = asset.description;
    }
    save() {

        this.input.stopTyping();
        this.editorAsset.name = this.editorName;
        this.editorAsset.description = this.editorDescription;
        return this.editorAsset;
    }
    clearImage() {
        for (var i = 0; i < Config.pixelsPerImage; i++) {
            this.editorImage[i] = 0;
        }
    }
    setPixel(x: number, y: number, color: number) {

        let id = this.getPixelIndex(x, y);
        this.editorImage[id] = color;
    }
    setPixelArray(ids: number[], color: number) {
        for (var i = 0; i < ids.length; i++) {
            this.editorImage[ids[i]] = color;
        }
    }
    collectFloodPixels(pixelIds: number[], x: number, y: number, colorBefore: number, colorAfter: number) {
        let id = this.getPixelIndex(x, y);
        for (var i = 0; i < pixelIds.length; i++) {
            if (pixelIds[i] == id) {
                return;
            }
        }

        if (this.editorImage[id] == colorBefore) {

            pixelIds.push(id);
            if (x < Config.pixelsPerRow - 1)
                this.collectFloodPixels(pixelIds, x + 1, y, colorBefore, colorAfter);
            if (y < Config.pixelsPerRow - 1)
                this.collectFloodPixels(pixelIds, x, y + 1, colorBefore, colorAfter);
            if (x > 0)
                this.collectFloodPixels(pixelIds, x - 1, y, colorBefore, colorAfter);
            if (y > 0)
                this.collectFloodPixels(pixelIds, x, y - 1, colorBefore, colorAfter);
        }
    }
    background() {
        this.ctx.fillStyle = "#101010";
        this.ctx.fillRect(0, 0, Config.editorPixelSize * Config.pixelsPerRow, Config.editorPixelSize * Config.pixelsPerRow);
    }
    grid() {

        if (!this.isGridVisible) {
            return;
        }

        this.ctx.strokeStyle = "rgba(200,200,200,0.1)";
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


