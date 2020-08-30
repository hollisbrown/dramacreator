
import Position from '../../common/src/Position';
import Config from '../../common/src/Config';
import Game from '../../common/src/Game';
import Asset, { AssetType } from '../../common/src/Asset';
import Input from './Input';
import UI from './UI';
import Renderer from './Renderer';
import Camera from './Camera';
import Editor from './Editor';

export default class Builder {

    ctx: any;
    input: Input;
    game: Game;
    ui: UI;
    renderer: Renderer;
    camera: Camera;
    editor: Editor;

    builderListX: number = 940;
    builderListY: number = 20;
    builderWidth: number = 330;
    builderHeight: number = 52;
    builderPadding: number = 6;
    selectedAssetId: number = 0;

    constructor(ctx: any, input: Input, game: Game, ui: UI, renderer: Renderer, camera: Camera) {
        this.ctx = ctx;
        this.input = input;
        this.game = game;
        this.ui = ui;
        this.renderer = renderer;
        this.camera = camera;

        this.editor = new Editor(ctx, input, ui);
    }

    update() {
        this.background();
        this.mouse();
        this.scroll();
        this.cursor();
        this.filter();
        this.assetList();
    }
    mouse() {
        if (this.input.isMouseClicked) {

            let asset = Object.assign(new Asset(0), this.game.assets[this.selectedAssetId]);
            switch (asset.type) {
                case AssetType.ITEM:
                    //sendItem(mouseXrelative, mouseYrelative, selectedAsset);
                    break;
                case AssetType.CHARACTER:
                    break;
                case AssetType.FLOOR:
                case AssetType.WALL:
                    //sendTile(mouseXtile, mouseYtile, selectedAsset);
                    break;
            }
        }
    }
    scroll() {

        if (this.input.scrollDelta != 0) {
            this.builderListY -= this.input.scrollDelta;
            let min = 100;
            let max = Config.maxAssets * (-this.builderHeight - this.builderPadding) + 400;
            this.builderListY = Math.max(this.builderListY, max);
            this.builderListY = Math.min(this.builderListY, min);
        }
    }
    background() {

        let x: number = this.builderListX;
        let y: number = this.builderListY;
        let w: number = this.builderWidth;
        let h: number = Config.maxAssets * (this.builderHeight + this.builderPadding);

        this.ctx.fillStyle = "rgba(0,0,0,0.2)";
        this.ctx.fillRect(x, y, w, h);

        let isHovered =
            this.input.mouse.x > x &&
            this.input.mouse.x < x + w &&
            this.input.mouse.y > y &&
            this.input.mouse.y < y + h;

        if (isHovered) {
            this.input.isMouseOnUi = true;
        }
    }
    filter() {

    }
    assetList() {

        for (var i = 0; i < Config.maxAssets; i++) {
            let asset = Object.assign(new Asset(i), this.game.assets[i]);
            let x = this.builderListX;
            let y = this.builderListY + i * (this.builderHeight + this.builderPadding);
            if (this.ui.asset(
                this.input,
                this.renderer.bufferCanvas[i],
                asset.name,
                x,
                y,
                this.builderWidth,
                this.builderHeight,
                "#111111")) {
                this.selectedAssetId = i;
            }

            if (this.ui.button(this.input, "E", x + 240, y + 10, 30, 30, "#1f1f1f")) {
                // mode = Mode.EDIT;
                // editorLoad(i, images[i]);
            }
            1
            if (this.ui.button(this.input, "C", x + 280, y + 10, 30, 30, "#1f1f1f")) {
                let unusedAssetId = this.getUnusedAssetId();
                if (unusedAssetId != -1) {
                    // mode = Mode.EDIT;
                    // editorLoad(unusedAssetId, images[i]);
                }
            }

            if (this.selectedAssetId == i) {
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = "#AAAAAA";
                this.ctx.strokeRect(x, y, this.builderWidth, this.builderHeight);
            }
        }
    }
    cursor() {

        if (!this.input.isMouseOnTiles) {
            return;
        }
        let mouseTile = this.input.mouseTile(this.camera.position, this.camera.zoom);
        let cursorX = (((mouseTile.x) * Config.tilesPerRow) + this.camera.position.x) * this.camera.zoom;
        let cursorY = (((mouseTile.y) * Config.tilesPerRow) + this.camera.position.y) * this.camera.zoom;
        let size = Config.pixelsPerRow * this.camera.zoom;

        this.ctx.fillStyle = "rgba(255,255,255,0.1)";
        this.ctx.fillRect(cursorX, cursorY, size, size);
    }

    getUnusedAssetId() {
        for (var i = 1; i < Config.maxAssets; i++) {
            if (this.game.assets[i].type == AssetType.NONE) {
                return i;
            }
        }
        return -1;
    }
}


