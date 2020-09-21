import Position from '../../common/src/Position';
import Config from '../../common/src/Config';
import Game from '../../common/src/Game';
import Asset, { AssetType, TileType, ItemType } from '../../common/src/Asset';
import Tile from '../../common/src/Tile';
import Item from '../../common/src/Item';
import Character from '../../common/src/Character';
import Input from './Input';
import UI from './UI';
import Renderer, { ISortable } from './Renderer';
import Camera from './Camera';
import Editor from './Editor';

export default class Builder {

    canvas: any;
    ctx: any;
    input: Input;
    game: Game;
    ui: UI;
    renderer: Renderer;
    camera: Camera;

    x: number = 0;
    y: number = 0;
    width: number = 330;
    filterHeight: number = 120;
    assetHeight: number = 52;
    assetPadding: number = 0;

    editor: Editor;
    isEditorEnabled: boolean = false;
    hasTileSelected: boolean = false;
    hasSortableSelected: boolean = false;
    hasSortablePicked: boolean = false;
    dropdownOptions: string[] = ["All", "Floors", "Walls", "Items", "Characters", "Deleted"];
    selectedAssetType: number = 0;
    isFilterHovered: boolean = false;
    isDropdownEnabled: boolean = false;

    assetList: Asset[];
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
        send: (type: string, data: any) => void,
    ) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.input = input;
        this.game = game;
        this.ui = ui;
        this.renderer = renderer;
        this.camera = camera;
        this.send = send;

        this.editor = new Editor(canvas, ctx, input, ui, send);
        this.selectedAsset = new Asset(-1, AssetType.NONE);

    }
    update() {
        if (this.isEditorEnabled) {
            if (this.editor.isEnabled) {
                this.editor.update();
                return;
            } else {
                this.isEditorEnabled = false;
                this.reset();
            }
        }

        this.x = this.canvas.width - this.width - 140;
        this.background();
        this.mouse();
        this.showAssetList();
        this.showFilter();
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
        let totalHeight = this.assetList.length * (this.assetHeight + this.assetPadding) + this.filterHeight;
        //this.ctx.fillStyle = "#333333";
        //this.ctx.fillRect(this.x, this.y, this.width, totalHeight);

        let isHovered =
            this.input.mousePosition.x > this.x &&
            this.input.mousePosition.x < this.x + this.width &&
            this.input.mousePosition.y > this.y &&
            this.input.mousePosition.y < this.y + totalHeight;

        if (isHovered) {
            this.input.isMouseOnUi = true;
        }
    }
    showFilter() {

        let filterY = 0;
        let buttonSize = 60;
        let padding = 4;
        let margin = 30;

        this.isFilterHovered = (
            this.input.mousePosition.x > this.x &&
            this.input.mousePosition.x < this.x + this.width &&
            this.input.mousePosition.y > filterY &&
            this.input.mousePosition.y < filterY + this.filterHeight
        )

        //Background
        this.ctx.fillStyle = "#0B0B0B";
        this.ctx.fillRect(this.x, filterY, this.width, this.filterHeight);

        //Icons
        if (this.ui.buttonIcon(4, this.x + margin, filterY + margin, buttonSize, buttonSize, "#222222", (this.selectedAssetType == AssetType.NONE))) {
            this.selectedAssetType = AssetType.NONE;
            this.filterAssetList(this.selectedAssetType);
        }

        if (this.ui.buttonIcon(5, this.x + (buttonSize + padding) * 1 + margin, filterY + margin, buttonSize, buttonSize, "#222222", (this.selectedAssetType == AssetType.TILE))) {
            this.selectedAssetType = AssetType.TILE;
            this.filterAssetList(this.selectedAssetType);
        }

        if (this.ui.buttonIcon(8, this.x + (buttonSize + padding) * 2 + margin, filterY + margin, buttonSize, buttonSize, "#222222", (this.selectedAssetType == AssetType.ITEM))) {
            this.selectedAssetType = AssetType.ITEM;
            this.filterAssetList(this.selectedAssetType);
        }

        if (this.ui.buttonIcon(10, this.x + (buttonSize + padding) * 3 + margin, filterY + margin, buttonSize, buttonSize, "#222222", (this.selectedAssetType == AssetType.CHARACTER))) {
            this.selectedAssetType = AssetType.CHARACTER;
            this.filterAssetList(this.selectedAssetType);
        }
    }
    showAssetList() {

        //Scroll
        if (this.input.scrollDelta != 0) {
            this.y -= this.input.scrollDelta;
            let min = this.filterHeight;
            let max = -this.assetList.length * (this.assetHeight + this.assetPadding) + this.canvas.height;
            this.y = Math.max(this.y, max);
            this.y = Math.min(this.y, min);
        }

        //Draw
        for (var i = 0; i < this.assetList.length; i++) {
            let asset = this.assetList[i];
            let img = this.renderer.bufferCanvas[asset.id];
            let x = this.x;
            let y = this.y + i * (this.assetHeight + this.assetPadding);

            //Select Asset
            if (this.ui.asset(img, asset.name, x, y, this.width, this.assetHeight, "#111111") && !this.isFilterHovered) {

                this.selectedAsset = asset;

                switch (this.selectedAsset.type) {
                    case AssetType.TILE:
                        this.hasTileSelected = true;
                        break;
                    case AssetType.ITEM:
                    case AssetType.CHARACTER:
                        this.hasSortableSelected = true;
                        break;
                }
            }

            //Edit
            if (this.ui.buttonIcon(0, x + 240, y + 10, 32, 32, "#1f1f1f") && !this.isFilterHovered) {
                let assetCopy = Object.assign(new Asset(), asset);

                this.editor.load(assetCopy);
                this.isEditorEnabled = true;
                this.reset();
            }

            //Copy
            if (asset.type != AssetType.NONE) {
                if (this.ui.buttonIcon(1, x + 280, y + 10, 32, 32, "#1f1f1f") && !this.isFilterHovered) {
                    let assetCopy = Object.assign(new Asset(), asset);
                    assetCopy.sprite.pixels = Object.assign(new Array(), asset.sprite.pixels);

                    this.editor.copy(assetCopy);
                    this.isEditorEnabled = true;
                    this.reset();
                }
            } else {
                //Delete / Restore
                if (this.ui.buttonIcon(3, x + 280, y + 10, 32, 32, "#1f1f1f") && !this.isFilterHovered) {
                    asset.isUsed = !asset.isUsed;
                    this.send("ASSET", asset);
                    this.reset();
                }
            }

            //Highlight selected
            if (this.selectedAsset.id == asset.id) {
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = "#AAAAAA";
                this.ctx.strokeRect(x, y, this.width, this.assetHeight);
            }
        }
    }
    filterAssetList(selection: AssetType) {
        this.assetList = [];
        this.y = this.filterHeight;

        if (selection == 0) {//All
            this.assetList = this.game.assets;
        } else {//Filtered by AssetType
            for (var i = 0; i < this.game.assets.length; i++) {
                if (this.game.assets[i].isUsed &&
                    this.game.assets[i].type == selection) {
                    this.assetList.push(this.game.assets[i]);
                }
            }
        }
    }
    cursor() {
        let img: HTMLCanvasElement;
        let position: Position;
        let offset: Position;

        if (this.hasTileSelected) {
            let worldPosition = this.camera.getWorldPosition(this.input.mousePosition);
            if (worldPosition.x < 0 || worldPosition.x > Config.pixelsPerRow * Config.tilesPerRow ||
                worldPosition.y < 0 || worldPosition.y > Config.pixelsPerRow * Config.tilesPerRow) {
                return;
            }
            let tilePosition = this.input.getTilePosition(worldPosition);
            tilePosition = tilePosition.multiply(Config.pixelsPerRow);

            position = this.camera.getScreenPosition(tilePosition);
            img = this.renderer.bufferCanvas[this.selectedAsset.id];
            offset = new Position(0, 0);

        } else if (this.hasSortableSelected) {
            position = this.input.mousePosition;
            img = this.renderer.bufferCanvas[this.selectedAsset.id];
            offset = new Position(16, 32);

        } else if (this.hasSortablePicked) {
            position = this.input.mousePosition;
            img = this.renderer.bufferCanvas[this.pickedSortable.assetId];
            offset = this.pickedSortable.offsetRender;
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
        let position = this.camera.getWorldPosition(this.input.mousePosition);
        if (!this.input.isPositionOnTiles(position)) {
            return;
        }
        switch (this.selectedAsset.type) {
            case AssetType.TILE:
                let mouseTilePosition = this.camera.getWorldPosition(this.input.mousePosition);
                let tile = new Tile(
                    this.input.getTileId(mouseTilePosition),
                    this.selectedAsset.id,
                    this.selectedAsset.tileType,
                    (this.selectedAsset.tileType == TileType.FLOOR)
                );
                this.send("TILE", tile);
                break;
            case AssetType.ITEM:
                let item = new Item(
                    -1,
                    this.selectedAsset.id,
                    this.selectedAsset.itemType,
                    position
                );
                item.isUsed = true;
                this.send("ITEM", item);
                break;
            case AssetType.CHARACTER:
                let character = new Character(
                    -1,
                    this.selectedAsset.id,
                    position
                );
                character.isUsed = true;
                this.send("CHARACTER", character);
                break;
        }
    }
    pick() {
        let mouseCam = this.camera.getWorldPosition(this.input.mousePosition);
        this.pickedSortable = this.renderer.getSortableAtPosition(mouseCam)
        if (this.pickedSortable != null) {
            this.hasTileSelected = false;
            this.hasSortablePicked = true;
            this.renderer.showPick();
        }
    }
    drop() {
        let position = this.camera.getWorldPosition(this.input.mousePosition);
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
    reset() {
        this.filterAssetList(this.selectedAssetType);
        this.isDropdownEnabled = false;
        this.selectedAsset = new Asset(-1);
        this.hasTileSelected = false;
        this.hasSortableSelected = false;
        this.hasSortablePicked = false;
        this.renderer.hidePick();
    }
}