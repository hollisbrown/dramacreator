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
    isMouseOnSprite: boolean = false;
    isTranslatingPixels: boolean = false;
    isDropdownEnabled: boolean = false;
    isDropdownHovered: boolean = false;
    dropdownOptions: string[] = ["None", "Floor", "Wall", "Item", "Character"];
    dropdownSelection: number = 0;
    isTypingName: boolean = false;
    isTypingDescription: boolean = false;

    selectedColor: number = 1;
    selectedTool: number = 0;
    selectedType: number = 0;

    asset: Asset = new Asset();
    send: (type: string, data: any) => void; //callback function

    constructor(
        canvas: any,
        ctx: any,
        input: Input,
        ui: UI,
        send: (type: string, data: any) => void
    ) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.input = input;
        this.ui = ui;
        this.send = send;
        this.asset.sprite = new Sprite();
    }
    update() {
        this.background();
        this.asset.sprite.render(this.ctx, Config.colorSet, 0, 0, Config.editorPixelSize);
        this.grid();
        this.swatches(790, 16, 4, 42, 42);
        this.tools();
        this.commands();
        this.properties();
        this.paint();
        this.translate();
    }
    paint() {
        this.isMouseOnSprite =
            this.input.mousePosition.x >= 0 &&
            this.input.mousePosition.x < Config.editorPixelSize * Config.pixelsPerRow &&
            this.input.mousePosition.y >= 0 &&
            this.input.mousePosition.y < Config.editorPixelSize * Config.pixelsPerRow;

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

            if (this.ui.swatch(x, y, width, height, Config.colorSet[i])) {
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
    tools() {

        let x = 940;
        let y = 20;
        let width = 120;
        let height = 40;
        let padding = 4;

        for (var i = 0; i < this.toolSet.length; i++) {

            if (this.ui.button(this.toolSet[i], x + (width * i) + padding, y, width, height, "#333333")) {
                this.selectedTool = i;
            }
            if (i == this.selectedTool) {
                //cursor
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = "#ffffff";
                this.ctx.strokeRect(x + (width * i), y, width, height);
            }
        }
    }
    commands() {

        let x = 930;
        let y = 110;

        let width = 60;
        let height = 40;
        let padding = 4;

        if (this.ui.button("UP", x + width / 2 + padding, y, width, height, "#222222")) {
            this.asset.sprite.pixels = this.asset.sprite.getPixelsTranslated(0, -1);
        }
        if (this.ui.button("LEFT", x, y + height + padding, width, height, "#222222")) {
            this.asset.sprite.pixels = this.asset.sprite.getPixelsTranslated(-1, 0);
        }
        if (this.ui.button("RIGHT", x + width + padding, y + height + padding, width, height, "#222222")) {
            this.asset.sprite.pixels = this.asset.sprite.getPixelsTranslated(1, 0);
        }
        if (this.ui.button("DOWN", x + width / 2 + padding, y + (height + padding) * 2, width, height, "#222222")) {
            this.asset.sprite.pixels = this.asset.sprite.getPixelsTranslated(0, 1);
        }
        if (this.ui.button("FLIP", x + width / 2 + padding, y + (height + padding) * 4, width, height, "#222222")) {
            this.asset.sprite.pixels = this.asset.sprite.getPixelsFlipped();
        }

        width = 100;
        height = 50;

        if (this.ui.button("GRID", x + 140, y, width, height, "#222222")) {
            this.isGridVisible = !this.isGridVisible;
        }
        if (this.ui.button("CLEAR", x + 140, y + 55, width, height, "#222222")) {
            this.asset.sprite.setAllPixels(0);
        }
        if (this.ui.button("DISCARD", x + 140, y + 110, width, height, "#882222")) {
            this.close();
        }
        if (this.ui.button("SAVE", x + 140, y + 165, width, height, "#228822")) {
            this.save();
        }

    }
    properties() {

        let x = 940;
        let y = 400;
        let padding = 4;
        let width = 250;
        let height = 600;

        if (this.isTypingName) {
            this.asset.name = this.input.typedString;
            if (this.ui.textBoxActive(x, y + 80, width, 60)) {
                this.input.stopTyping();
                this.isTypingName = false;
            }
        } else {
            if (this.ui.textBox(this.asset.name, x, y + 80, width, 60)) {
                this.input.startTyping(this.asset.name);
                this.isTypingName = true;
            }
        }
        if (this.isTypingDescription) {
            this.asset.description = this.input.typedString;
            if (this.ui.textBoxActive(x, y + 160, width, 120)) {
                this.input.stopTyping();
                this.isTypingDescription = false;
            }
        } else {
            if (this.ui.textBox(this.asset.description, x, y + 160, width, 120)) {
                this.input.startTyping(this.asset.description);
                this.isTypingDescription = true;
            }
        }

        let dropdownHeight = 60;
        if (this.isDropdownEnabled) {
            dropdownHeight = dropdownHeight * this.dropdownOptions.length;
        }
        this.isDropdownHovered = (
            this.input.mousePosition.x > x &&
            this.input.mousePosition.x < x + width &&
            this.input.mousePosition.y > y &&
            this.input.mousePosition.y < dropdownHeight
        )
        if (this.isDropdownEnabled) {
            let selection = this.ui.dropDown(
                this.dropdownOptions,
                this.dropdownSelection,
                x, y, width, 60, "#444444");

            if (selection != -1) {
                this.dropdownSelection = selection;
                this.asset.type = selection;
                this.isDropdownEnabled = false;
            }
        } else {
            if (this.ui.button(
                this.dropdownOptions[this.dropdownSelection],
                x, y, width, 60, "#333333")
            ) {
                this.isDropdownEnabled = true;
            }
        }
    }
    load(asset: Asset) {
        let newAsset = Object.assign(new Asset(), asset);
        newAsset.sprite = Object.assign(new Sprite(), asset.sprite);
        newAsset.sprite.pixels = Object.assign(new Array(), asset.sprite.pixels);

        this.dropdownSelection = newAsset.type;
        this.selectedTool = 0;
        this.isEnabled = true;
        this.asset = newAsset;
    }
    copy(asset: Asset) {
        let newAsset = Object.assign(new Asset(), asset);
        newAsset.sprite = Object.assign(new Sprite(), asset.sprite);
        newAsset.sprite.pixels = Object.assign(new Array(), asset.sprite.pixels);

        newAsset.id = -1;
        newAsset.name = "Copy of " + asset.name;
        if (newAsset.name.length > Config.maxNameLength) {
            newAsset.name = newAsset.name.substr(0, Config.maxNameLength);
        }

        this.selectedTool = 0;
        this.isEnabled = true;
        this.asset = newAsset;
    }
    save() {
        this.asset.isUsed = true;
        this.send("ASSET", this.asset);
        this.isEnabled = false;
    }
    close() {
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


