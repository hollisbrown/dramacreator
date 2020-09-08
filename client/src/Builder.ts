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

    assetList: Asset[];
    x: number = 940;
    y: number = 20;
    width: number = 330;
    height: number = 52;
    padding: number = 6;

    editor: Editor;
    hasTileSelected: boolean = false;
    hasSortableSelected: boolean = false;
    hasSortablePicked: boolean = false;

    selectedAsset: Asset;
    pickedSortable: ISortable;
    send: (type: string, data: any) => void;

    constructor(
        canvas: any,
        ctx: any,
        input: Input,
        game: Game,
        ui: UI,
        renderer: Renderer,
        camera: Camera,
        send: (type: string, data: any) => void
    ) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.input = input;
        this.game = game;
        this.ui = ui;
        this.renderer = renderer;
        this.camera = camera;

        this.editor = new Editor(canvas, ctx, input, ui, send);
        this.send = send;
        this.selectedAsset = new Asset(-1, AssetType.NONE);
    }
    update() {
        if (this.editor.isEnabled) {
            this.editor.update();
            return;
        }
        this.background();
        this.mouse();
        this.showAssetList();
        this.filter();
    }
    mouse() {
        //Deselect
        if (this.input.isMouseUp && this.input.isMouseRight) {
            this.reset();
            return;
        }

        //Delete
        if (this.input.isShortcutDelete) {
            if (this.hasSortablePicked) {
                this.delete();
            }
        }

        //Select / Place
        if (this.input.isMouseClicked) {
            if (this.hasTileSelected || this.hasSortableSelected) {
                this.build();
            } else if (this.hasSortablePicked) {
                this.drop();
            } else {
                this.pick();
            }
        }
        //Cursor
        this.cursor();
    }
    background() {

        let x: number = this.x;
        let y: number = this.y;
        let w: number = this.width;
        let h: number = Config.maxAssets * (this.height + this.padding);

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
        if (this.ui.button("Filter", this.x, this.y, this.width, this.height, "#333333")) {

        }
    }
    showAssetList() {
        //Scroll
        if (this.input.scrollDelta != 0) {
            this.y -= this.input.scrollDelta;
            let min = 100;
            let max = Config.maxAssets * (-this.height - this.padding) + 400;
            this.y = Math.max(this.y, max);
            this.y = Math.min(this.y, min);
        }

        //Draw
        for (var i = 0; i < Config.maxAssets; i++) {
            let asset = this.game.assets[i];
            let img = this.renderer.bufferCanvas[i];
            let x = this.x;
            let y = this.y + i * (this.height + this.padding) + 100;

            if (this.ui.asset(img, asset.name, x, y, this.width, this.height, "#111111")) {

                this.selectedAsset = asset;

                switch (this.selectedAsset.type) {
                    case AssetType.WALL:
                    case AssetType.FLOOR:
                        this.hasTileSelected = true;
                        break;
                    case AssetType.ITEM:
                    case AssetType.CHARACTER:
                        this.hasSortableSelected = true;
                        break;
                }
            }

            if (this.ui.button("E", x + 240, y + 10, 30, 30, "#1f1f1f")) {
                this.editor.load(asset);
            }

            if (this.ui.button("C", x + 280, y + 10, 30, 30, "#1f1f1f")) {
                let newAsset = new Asset(-1, AssetType.NONE, "Copy of " + asset.name, asset.description);
                this.editor.load(newAsset);
            }

            if (this.selectedAsset.id == i) {
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = "#AAAAAA";
                this.ctx.strokeRect(x, y, this.width, this.height);
            }
        }
    }
    cursor() {
        let img: HTMLCanvasElement;
        let position: Position;
        let offset: Position;

        if (this.hasTileSelected) {
            let worldPosition = this.camera.getWorldPosition(this.input.mouse);
            let tilePosition = this.getTilePosition(worldPosition);
            tilePosition = tilePosition.multiply(Config.pixelsPerRow);

            position = this.camera.getScreenPosition(tilePosition);
            img = this.renderer.bufferCanvas[this.selectedAsset.id];
            offset = new Position(0, 0);

        } else if (this.hasSortableSelected) {
            position = this.input.mouse;
            img = this.renderer.bufferCanvas[this.selectedAsset.id];
            offset = new Position(16, 32);

        } else if (this.hasSortablePicked) {
            position = this.input.mouse;
            img = this.renderer.bufferCanvas[this.pickedSortable.assetId];
            offset = this.pickedSortable.offset;
        } else {
            return;
        }

        this.ctx.globalAlpha = 0.5;
        this.ctx.drawImage(
            img, 0, 0, Config.pixelsPerRow, Config.pixelsPerRow,
            position.x - offset.x * this.camera.zoom,
            position.y - offset.y * this.camera.zoom,
            Config.pixelsPerRow * this.camera.zoom,
            Config.pixelsPerRow * this.camera.zoom
        );
        this.ctx.globalAlpha = 1;
    }
    build() {
        let position = this.camera.getWorldPosition(this.input.mouse);
        if (!this.isPositionOnTiles(position)) {
            return;
        }
        switch (this.selectedAsset.type) {
            case AssetType.WALL:
            case AssetType.FLOOR:
                let tileId = this.input.mouseTileId(this.camera.position, this.camera.zoom);
                console.log(tileId);
                let tile = new Tile(tileId, this.selectedAsset.id);
                this.send("TILE", tile);
                break;
            case AssetType.ITEM:
                let item = new Item(-1, this.selectedAsset.id, 0, position, 0, 0);
                item.isUsed = true;
                this.send("ITEM", item);
                break;
            case AssetType.CHARACTER:
                let character = new Character(-1, this.selectedAsset.id, 0, position);
                character.isUsed = true;
                this.send("CHARACTER", character);
                break;
        }
    }
    pick() {
        let mouseCam = this.camera.getWorldPosition(this.input.mouse);
        this.pickedSortable = this.renderer.getSortableAtPosition(mouseCam)
        if (this.pickedSortable != null) {
            this.hasTileSelected = false;
            this.hasSortablePicked = true;
            this.renderer.showPick();
        }
    }
    drop() {
        let position = this.camera.getWorldPosition(this.input.mouse);
        let type = this.game.assets[this.pickedSortable.assetId].type;
        switch (type) {
            case AssetType.ITEM:
                let item = this.game.items[this.pickedSortable.id];
                item.isUsed = true;
                item.position = position;
                item.positionRender = position;
                this.send("ITEM", item);
                break;
            case AssetType.CHARACTER:
                let character = this.game.characters[this.pickedSortable.id];
                character.isUsed = true;
                character.position = position;
                character.positionRender = position;
                character.positionLast = position;
                this.send("CHARACTER", character);
                break;
        }
        this.reset();
    }
    delete() {
        let type = this.game.assets[this.pickedSortable.assetId].type;
        switch (type) {
            case AssetType.ITEM:
                this.send("ITEM", new Item(this.pickedSortable.id));
                break;
            case AssetType.CHARACTER:
                this.send("CHARACTER", new Character(this.pickedSortable.id));
                break;
        }
        this.reset();
    }
    getTilePosition(position: Position) {
        return new Position(
            Math.floor(position.x / Config.pixelsPerRow),
            Math.floor(position.y / Config.pixelsPerRow)
        );
    }
    isPositionOnTiles(position: Position): boolean {
        return (
            position.x >= 0 &&
            position.y >= 0 &&
            position.x < Config.tilesPerRow * Config.pixelsPerRow &&
            position.y < Config.tilesPerRow * Config.pixelsPerRow
        )
    }
    reset() {
        this.selectedAsset = new Asset(-1, AssetType.NONE);
        this.hasTileSelected = false;
        this.hasSortableSelected = false;
        this.hasSortablePicked = false;
        this.renderer.hidePick();
    }
}


