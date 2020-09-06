import Position from '../../common/src/Position';
import Config from '../../common/src/Config';
import Game from '../../common/src/Game';
import Asset, { AssetType } from '../../common/src/Asset';
import Tile from '../../common/src/Tile';
import Item from '../../common/src/Item';
import Character from '../../common/src/Character';
import Input from './Input';
import UI from './UI';
import Renderer, { ISortable } from './Renderer';
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
    hasTileSelected: boolean = false;
    hasSortableSelected: boolean = false;
    hasSortablePicked: boolean = false;

    selectedAsset: Asset;
    selectedSortable: ISortable;
    newItem: Item;
    newCharacter: Character;

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

        this.selectedAsset = new Asset(-1, AssetType.NONE);
        this.newItem = new Item(-1, 0, 0, new Position(100, 100), 0, 0);
        this.newCharacter = new Character(-1, 0, 0, new Position(200, 100));
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
        //Deselect
        if (this.input.isMouseUp && this.input.isMouseRight) {
            this.selectedAsset = new Asset(-1, AssetType.NONE);
            this.hasTileSelected = false;
            this.hasSortablePicked = false;
            this.renderer.showDrop();
            return;
        }

        //Select / Place
        if (this.input.isMouseClicked) {
            if (this.hasTileSelected) {
                this.build();
            } else if (this.hasSortablePicked) {
                this.drop();
            } else {
                this.pick();
            }
        }
        //Cursor
        if (this.hasTileSelected) {
            this.cursorTile();
        } else if (this.hasSortablePicked) {
            this.cursorPick();
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
            let img = this.renderer.bufferCanvas[i];
            let x = this.builderListX;
            let y = this.builderListY + i * (this.builderHeight + this.builderPadding);

            if (this.ui.asset(this.input, img, asset.name, x, y, this.builderWidth, this.builderHeight, "#111111")) {

                this.selectedAsset = asset;
                switch (this.selectedAsset.type) {
                    case AssetType.WALL:
                    case AssetType.FLOOR:
                        this.hasTileSelected = true;
                        break;
                    case AssetType.ITEM:
                        this.newItem.assetId = this.selectedAsset.id;
                        this.hasSortableSelected = true;
                    case AssetType.CHARACTER:
                        this.newCharacter.assetId = this.selectedAsset.id;
                        this.hasSortableSelected = true;
                        break;
                }
                this.hasTileSelected = true;
            }

            if (this.ui.button(this.input, "E", x + 240, y + 10, 30, 30, "#1f1f1f")) {
                this.editor.load(asset);
            }

            if (this.ui.button(this.input, "C", x + 280, y + 10, 30, 30, "#1f1f1f")) {
                let newAsset = new Asset(-1, AssetType.NONE, "Copy of " + asset.name, asset.description);
                this.editor.load(newAsset);
            }

            if (this.selectedAsset.id == i) {
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = "#AAAAAA";
                this.ctx.strokeRect(x, y, this.builderWidth, this.builderHeight);
            }
        }
    }
    cursorTile() {
        let position = this.input.mouseCamera(this.camera.position, this.camera.zoom);
        if (!this.isPositionOnTiles(position)) {
            return;
        }
        let mouseTile = this.input.mouseTile(this.camera.position, this.camera.zoom);
        let cursorX = ((mouseTile.x * Config.pixelsPerRow) + this.camera.position.x) * this.camera.zoom;
        let cursorY = ((mouseTile.y * Config.pixelsPerRow) + this.camera.position.y) * this.camera.zoom;
        let size = Config.pixelsPerRow * this.camera.zoom;

        this.ctx.fillStyle = "rgba(255,255,255,0.1)";
        this.ctx.fillRect(cursorX, cursorY, size, size);
    }
    cursorPick() {
        let img = this.renderer.bufferCanvas[this.selectedSortable.assetId];
        let x = this.input.mouse.x - this.selectedSortable.offset.x * this.camera.zoom;
        let y = this.input.mouse.y - this.selectedSortable.offset.y * this.camera.zoom;
        let size = this.camera.zoom * Config.pixelsPerRow;

        this.ctx.globalAlpha = 0.5;
        this.ctx.drawImage(img, 0, 0, Config.pixelsPerRow, Config.pixelsPerRow, x, y, size, size);
        this.ctx.globalAlpha = 1;
    }
    build() {
        let position = this.input.mouseCamera(this.camera.position, this.camera.zoom);
        if (!this.isPositionOnTiles(position)) {
            return;
        }

        switch (this.selectedAsset.type) {
            case AssetType.WALL:
            case AssetType.FLOOR:
                let tileId = this.input.mouseTileId(this.camera.position, this.camera.zoom);
                let tile = new Tile(tileId, this.selectedAsset.id);
                this.onBuild("TILE", tile);
                break;
            case AssetType.ITEM:
                let item = new Item(-1, this.selectedAsset.id, 0, position, 0, 0);
                this.onBuild("ITEM", item);
                break;
            case AssetType.CHARACTER:
                let character = new Character(-1, this.selectedAsset.id, 0, position);
                this.onBuild("CHARACTER", character);
                break;
        }
    }
    pick() {
        let mouseCam = this.input.mouseCamera(this.camera.position, this.camera.zoom);
        this.selectedSortable = this.renderer.getSortableAtPosition(mouseCam)

        if (this.selectedSortable != null) {
            this.renderer.showPick();
            this.hasTileSelected = false;
            this.hasSortablePicked = true;
        }
    }
    drop() {

        this.renderer.showDrop();
        let position: Position = this.input.mouseCamera(this.camera.position, this.camera.zoom);
        let type = this.game.assets[this.selectedSortable.assetId].type;
        switch (type) {
            case AssetType.ITEM:
                let item = this.game.items[this.selectedSortable.id];
                item.position = position;
                item.positionRender = position;
                this.onBuild("ITEM", item);
                break;
            case AssetType.CHARACTER:
                let character = this.game.characters[this.selectedSortable.id];
                character.position = position;
                character.positionRender = position;
                character.positionLast = position;
                this.onBuild("CHARACTER", character);
                break;
        }
        this.hasTileSelected = false;
        this.hasSortablePicked = false;
    }
    isPositionOnTiles(position: Position): boolean {
        return (
            position.x >= 0 &&
            position.y >= 0 &&
            position.x < Config.tilesPerRow * Config.pixelsPerRow &&
            position.y < Config.tilesPerRow * Config.pixelsPerRow
        )
    }

}


