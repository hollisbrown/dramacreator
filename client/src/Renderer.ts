import Camera from './Camera';
import Sprite from '../../common/src/Sprite';
import Position from '../../common/src/Position';
import Config from '../../common/src/Config';
import Game from '../../common/src/Game';
import Asset, { AssetType } from '../../common/src/Asset';
import Tile from '../../common/src/Tile';
import Item from '../../common/src/Item';
import Character from '../../common/src/Character';

export interface ISortable {
    isUsed: boolean;
    id: number;
    positionRender: Position;
    offset: Position;
    assetId: number;
    frameId: number;
}

export default class Renderer {

    camera: Camera;
    canvas: any;
    ctx: any;
    bufferCanvas: any[] = [];
    bufferCtx: any[] = [];
    renderStack: ISortable[] = [];

    game: Game;
    hoveredSortable: number = -1;
    pickedSortable: number = -1;

    //spritesToRenderWall: boolean[] = [];
    //spritesToRenderCharacter: number[] = [];

    constructor(canvas: any, ctx: any, camera: Camera, game: Game) {

        this.canvas = canvas;
        this.ctx = ctx;
        this.camera = camera;
        this.game = game;

        for (var i = 0; i < Config.maxAssets; i++) {
            let canv = document.createElement("canvas");
            canv.width = Config.pixelsPerRow * Config.maxFrames;
            canv.height = Config.pixelsPerRow;
            this.bufferCanvas.push(canv);

            let context = canv.getContext("2d");
            context.imageSmoothingEnabled = false;
            this.bufferCtx.push(context);
        }
    }
    createSprites(asset: Asset) {
        this.bufferCtx[asset.id].clearRect(0, 0, this.bufferCanvas[asset.id].width, this.bufferCanvas[asset.id].height)
        asset.sprite.render(this.bufferCtx[asset.id], Config.colorSet, 0, 1);
    }
    update(deltaTime: number) {
        this.renderStack = [];

        //Add characters to render stack
        for (var i = 0; i < this.game.characters.length; i++) {
            if (this.game.characters[i].isUsed) {
                this.renderStack.push(this.game.characters[i]);
            }
        }
        //Add items to render stack
        for (var i = 0; i < this.game.items.length; i++) {
            if (this.game.items[i].isUsed &&
                this.game.items[i].containerId == 0) {
                let item = this.game.items[i];
                this.renderStack.push(item);
            }
        }
        //Z sort render stack based on Y position
        this.renderStack.sort(function (a, b) { return a.positionRender.y - b.positionRender.y });

        //bg
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        //DRAW STUFF
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(-this.camera.position.x, -this.camera.position.y);
        //Draw Tiles
        for (var i = 0; i < this.game.tiles.length; i++) {
            let x = Config.pixelsPerRow * (i % Config.tilesPerRow);
            let y = Config.pixelsPerRow * (Math.floor(i / Config.tilesPerRow));
            let assetId = this.game.tiles[i].assetId;

            this.ctx.drawImage(
                this.bufferCanvas[assetId],
                0, 0, Config.pixelsPerRow, Config.pixelsPerRow,
                x, y, Config.pixelsPerRow, Config.pixelsPerRow);


            // if (game.assets[assetId].type == AssetType.WALL) {
            //     for (var frameNumber = 0; frameNumber < spritesToRenderWall[i].length; frameNumber++) {
            //         if (spritesToRenderWall[i][frameNumber]) {
            //             this.ctx.drawImage(
            //                 this.bufferCanvas[assetId],
            //                 frameNumber * Config.pixelsPerRow, 0, Config.pixelsPerRow, Config.pixelsPerRow,
            //                 x, y, Config.pixelsPerRow, Config.pixelsPerRow);
            //         }
            //     }
            // } else {
            //     this.ctx.drawImage(
            //         this.bufferCanvas[assetId],
            //         0, 0, Config.pixelsPerRow, Config.pixelsPerRow,
            //         x, y, Config.pixelsPerRow, Config.pixelsPerRow);
            // }
        }
        //Draw Sortables (Characters, Items ...)
        for (var i = 0; i < this.renderStack.length; i++) {
            let spriteId: number = 0;
            if (this.game.assets[this.renderStack[i].assetId].type == AssetType.CHARACTER) {
                //offset = spritesToRenderCharacter[renderStack[i].characterId];
            }

            let x = this.renderStack[i].positionRender.x - this.renderStack[i].offset.x;
            let y = this.renderStack[i].positionRender.y - this.renderStack[i].offset.y;

            if (i == this.pickedSortable) {
                this.ctx.globalAlpha = 0.5;
            }

            this.ctx.drawImage(
                this.bufferCanvas[this.renderStack[i].assetId],
                spriteId * Config.pixelsPerRow,
                0,
                Config.pixelsPerRow,
                Config.pixelsPerRow,
                x,
                y,
                Config.pixelsPerRow,
                Config.pixelsPerRow
            );

            if (i == this.pickedSortable) {
                this.ctx.globalAlpha = 1;
            }

        }
        // //DRAW WORLD UI
        // for (var i = 0; i < chatLatest.length; i++) {
        //     if (chatTimer[i] > 0) {
        //         speechbubble(chatLatest[i], characters[i].renderX + 16, characters[i].renderY + 32);
        //     }
        // }
        // if (controlledCharacter != -1) {
        //     var x = characters[controlledCharacter].targetX;
        //     var y = characters[controlledCharacter].targetY;
        //     ctx.fillStyle = "rgba(0,255,0,0.6)";
        //     ctx.beginPath();
        //     ctx.moveTo(x - 5, y - 10);
        //     ctx.lineTo(x + 5, y - 10);
        //     ctx.lineTo(x, y);
        //     ctx.closePath();
        //     ctx.fill();
        // }
        this.ctx.translate(this.camera.position.x, this.camera.position.y);
        this.ctx.scale(1 / this.camera.zoom, 1 / this.camera.zoom);
    }
    debugShowSprites() {
        for (var i = 0; i < this.bufferCanvas.length; i++) {
            var x: number = i % Config.pixelsPerRow;
            var y: number = Math.floor(i / Config.pixelsPerRow);
            this.ctx.drawImage(this.bufferCanvas[i], x * (32 + 4), y * (32 + 4));
        }
    }
    getSortableAtPosition(positionMouse: Position): ISortable {
        for (var i = this.renderStack.length - 1; i >= 0; i--) {
            let positionRender = this.renderStack[i].positionRender;
            let offset = this.renderStack[i].offset;
            if (
                positionMouse.x > positionRender.x - offset.x &&
                positionMouse.x < positionRender.x + offset.x &&
                positionMouse.y > positionRender.y - offset.y &&
                positionMouse.y < positionRender.y
            ) {
                let pixelX = Math.floor(positionMouse.x - positionRender.x + offset.x);
                let pixelY = Math.floor(positionMouse.y - positionRender.y + offset.y);
                let sprite = this.game.assets[this.renderStack[i].assetId].sprite;
                if (sprite.getPixel(pixelX, pixelY) != 0) {
                    this.hoveredSortable = i;
                    return this.renderStack[i];
                }
            }
        }
        this.hoveredSortable = -1;
        return null;
    }
    showPick() {
        this.pickedSortable = this.hoveredSortable;
    }
    hidePick() {
        this.pickedSortable = -1;
        this.hoveredSortable = -1;
    }
}