import Position from '../../common/src/Position';
import Config from '../../common/src/Config';
import Game from '../../common/src/Game';
import Asset, { AssetType } from '../../common/src/Asset';
import Tile from '../../common/src/Tile';
import Item from '../../common/src/Item';
import Character from '../../common/src/Character';
import Input from './Input';
import UI from './UI';
import Renderer from './Renderer';
import Camera from './Camera';
import Editor from './Editor';
import Sprite from '../../common/src/Sprite';


export default class Builder {

    canvas: any;
    ctx: any;
    input: Input;
    game: Game;
    ui: UI;
    renderer: Renderer;
    camera: Camera;

    builderListX: number = 940;
    builderListY: number = 20;
    builderWidth: number = 330;
    builderHeight: number = 52;
    builderPadding: number = 6;

    editor: Editor;
    hasAsset: boolean = false;
    hasPicked: boolean = false;
    selectedAssetId: number = -1;
    selectedAsset: Asset;
    selectedObjectId: number = -1;
    selectedObjectType: AssetType = AssetType.NONE;
    onBuild: (type: string, data: any) => void;

    constructor(
        canvas: any,
        ctx: any,
        input: Input,
        game: Game,
        ui: UI,
        renderer: Renderer,
        camera: Camera,
        onBuild: (type: string, data: any) => void
    ) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.input = input;
        this.game = game;
        this.ui = ui;
        this.renderer = renderer;
        this.camera = camera;

        this.editor = new Editor(canvas, ctx, input, ui, onBuild);
        this.onBuild = onBuild;
    }
    update() {
        if (this.editor.isEnabled) {
            this.editor.update();
            return;
        }
        this.background();
        this.mouse();
        this.scroll();
        this.filter();
        this.assetList();
    }
    mouse() {
        if (this.input.isMouseUp && this.input.isMouseRight) {
            this.selectedAssetId = -1;
            this.hasAsset = false;
            this.hasPicked = false;
            this.renderer.drop();
            return;
        }

        if (this.input.isMouseClicked) {
            if (this.hasAsset) {
                this.build();
            } else if (this.hasPicked) {
                this.drop();
            } else {
                this.pick();
            }
        }

        if (this.hasAsset){
            this.cursorTile();
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
            let asset = this.game.assets[i];
            let x = this.builderListX;
            let y = this.builderListY + i * (this.builderHeight + this.builderPadding);

            if (this.ui.asset(this.input, this.renderer.bufferCanvas[i], asset.name, x, y, this.builderWidth, this.builderHeight, "#111111")) {
                this.selectedAssetId = i;
                this.hasAsset = true;
            }

            if (this.ui.button(this.input, "E", x + 240, y + 10, 30, 30, "#1f1f1f")) {
                this.editor.load(asset);
            }

            if (this.ui.button(this.input, "C", x + 280, y + 10, 30, 30, "#1f1f1f")) {
                let newAsset = new Asset(-1, AssetType.NONE, "Copy of " + asset.name, asset.description);
                this.editor.load(newAsset);
            }

            if (this.selectedAssetId == i) {
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = "#AAAAAA";
                this.ctx.strokeRect(x, y, this.builderWidth, this.builderHeight);
            }
        }
    }
    cursorTile() {
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
    cursorObject() {
        //TODO: interface?
    }
    build() {
        this.selectedAsset = this.game.assets[this.selectedAssetId];
        let position = new Position();
        switch (this.selectedAsset.type) {
            case AssetType.WALL:
            case AssetType.FLOOR:
                let tileId = this.input.mouseTileId(this.camera.position, this.camera.zoom);
                let tile = new Tile(tileId, this.selectedAssetId);
                this.onBuild("TILE", tile);
                break;
            case AssetType.ITEM:
                position = this.input.mouseCamera(this.camera.position, this.camera.zoom);
                let item = new Item(-1, this.selectedAssetId, 0, position, 0, 0);
                this.onBuild("ITEM", item);
                break;
            case AssetType.CHARACTER:
                position = this.input.mouseCamera(this.camera.position, this.camera.zoom);
                let character = new Character(-1, this.selectedAssetId, 0, position);
                this.onBuild("CHARACTER", character);
                break;
        }
    }
    pick() {
        let mouseCam = this.input.mouseCamera(this.camera.position, this.camera.zoom);
        let selection = this.renderer.getSpriteAtPosition(mouseCam);

        this.selectedObjectType = this.game.assets[selection[0]].type;
        this.selectedObjectId = selection[1];

        console.log("picked: " + selection);

        if (this.selectedObjectId != -1) {
            this.renderer.pick();
            this.hasAsset = false;
            this.hasPicked = true;
        }
    }
    drop() {
        console.log("id:" + this.selectedObjectId);
        this.renderer.drop();
        let position: Position = this.input.mouseCamera(this.camera.position, this.camera.zoom);
        switch (this.selectedObjectType) {
            case AssetType.ITEM:
                let item = this.game.items[this.selectedObjectId];
                item.position = position;
                item.positionRender = position;
                this.onBuild("ITEM", item);
                break;
            case AssetType.CHARACTER:
                let character = this.game.characters[this.selectedObjectId];
                character.position = position;
                character.positionRender = position;
                character.positionLast = position;
                this.onBuild("CHARACTER", character);
                break;
        }

        this.selectedObjectType = AssetType.NONE;
        this.selectedObjectId = -1;
        this.hasAsset = false;
        this.hasPicked = false;
    }
}


