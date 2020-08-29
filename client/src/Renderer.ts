import Camera from './Camera';
import Position from '../../common/src/Position';
import Config from '../../common/src/Config';
import Asset, { AssetType } from '../../common/src/Asset';
import Tile from '../../common/src/Tile';
import Item from '../../common/src/Item';
import Game from '../../common/src/Game';
import Character from '../../common/src/Character';

interface ISortable {
    positionRender: Position;
    assetId: number;
    frameId: number;
}

export default class Renderer {

    camera: Camera;
    canvas: any;
    ctx: any;
    bufferCanvas: any[] = [];
    bufferCtx: any[] = [];

    init() {

        this.camera = new Camera();
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");

        for (var i = 0; i < Config.maxAssets; i++) {
            var canv = document.createElement("canvas");
            canv.width = Config.pixelsPerRow * Config.maxFrames;
            canv.height = Config.pixelsPerRow;
            this.bufferCanvas.push(canv);

            var context = canv.getContext("2d");
            context.imageSmoothingEnabled = false;
            this.bufferCtx.push(context);
        }
    }

    createSprites(assets: Asset[]) {
        for (var i = 0; i < Config.maxAssets; i++) {
            this.renderImageToContext(assets[i].image, this.bufferCtx[i], 0, 1);
        }

        // for (var i = 0; i < Config.tilesPerRow * Config.tilesPerRow; i++) {
        //     spritesToRenderWall.push(0);
        // }
        // for (var i = 0; i < Config.maxCharacters; i++) {
        //     spritesToRenderCharacter.push(0);
        // }
    }

    update(characterLerp: number, game: Game) {

        let renderStack: ISortable[] = [];

        //Add characters to render stack
        for (var i = 0; i < game.characters.length; i++) {
            var character: Character = game.characters[i];
            character.positionRender = character.positionLast.lerp(character.position, characterLerp);
            renderStack.push(character);
        }

        //Add items to render stack
        for (var i = 0; i < game.items.length; i++) {
            var item: Item = game.items[i];

            if (item.containerId != 0) {
                return;
            }
            renderStack.push(item);
        }

        //Z sort render stack
        renderStack.sort(function (a, b) { return a.positionRender.x - b.positionRender.y });

        //DRAW STUFF
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(this.camera.position.x, this.camera.position.y);
        //DRAW BACKGROUND (Tiles)
        for (var i = 0; i < game.tiles.length; i++) {
            var x = Config.pixelsPerRow * (i % Config.tilesPerRow);
            var y = Config.pixelsPerRow * (Math.floor(i / Config.tilesPerRow));
            var assetId = game.tiles[i].assetId;
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
        //DRAW FOREGROUND (Characters, Items ...)
        for (var i = 0; i < renderStack.length; i++) {
            var offset: number = 0;
            if (game.assets[renderStack[i].assetId].type == AssetType.CHARACTER) {
                //offset = spritesToRenderCharacter[renderStack[i].characterId];
            }
            this.ctx.drawImage(
                this.bufferCanvas[renderStack[i].assetId],
                offset * Config.pixelsPerRow, 0, Config.pixelsPerRow, Config.pixelsPerRow,
                renderStack[i].positionRender.x, renderStack[i].positionRender.y, Config.pixelsPerRow, Config.pixelsPerRow
            );

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
        this.ctx.translate(-this.camera.position.x, -this.camera.position.y);
        this.ctx.scale(1 / this.camera.zoom, 1 / this.camera.zoom);
    }

    renderImageToContext(image: Uint8Array, context: any, frame: number, pixelSize: number) {

        for (var i = 0; i < Config.pixelsPerImage; i++) {
            var x = i % Config.pixelsPerRow + (frame * Config.pixelsPerRow);
            var y = Math.floor(i / Config.pixelsPerRow);
            var color: number = image[i];
            if (color < 0 || color >= Config.colorSet.length) {
                context.fillStyle = "rgba(0, 0, 0, 0)";
            } else {
                context.fillStyle = Config.colorSet[color];
            }
            context.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
    }

    debugShowSprites() {

        for (var i = 0; i < this.bufferCanvas.length; i++) {
            var x: number = i % Config.pixelsPerRow;
            var y: number = Math.floor(i / Config.pixelsPerRow);
            this.ctx.drawImage(this.bufferCanvas[i], x*(32 + 20), y*(32 + 20));
        }
    }
}


