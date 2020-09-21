import Camera from './Camera';
import Sprite from '../../common/src/Sprite';
import Position from '../../common/src/Position';
import Config from '../../common/src/Config';
import Game from '../../common/src/Game';
import UI from './UI';
import Asset, { AssetType, TileType, ItemType } from '../../common/src/Asset';
import Tile from '../../common/src/Tile';

export interface ISortable {
    isUsed: boolean;
    id: number;
    position: Position;
    positionRender: Position;
    offsetRender: Position;
    assetId: number;
}
export default class Renderer {

    canvas: any;
    ctx: any;
    camera: Camera;
    game: Game;
    ui: UI;

    bufferCanvas: any[] = [];
    bufferCtx: any[] = [];
    renderStack: ISortable[] = [];
    hoveredSortable: number = -1;
    pickedSortable: number = -1;
    wallFrames: boolean[][] = [];
    characterFrames: number[] = [];
    characterFrameTimers: number[] = [];
    characterFramerate: number = 6;
    characterChats: string[] = [];
    characterChatTimers: number[] = [];
    characterLerp: number = 0;


    controlledCharacterId: number = -1;
    isCharacterWalking: boolean[] = [];
    characterPath: number[] = [];
    characterVicinity: number[] = [];

    numberOfUsedItems: number = 0;
    numberOfUsedCharacters: number = 0;

    lookTimer: number = 0;
    lookText: string;
    lookPosition: Position;

    constructor(canvas: any, ctx: any, camera: Camera, game: Game, ui: UI) {

        this.canvas = canvas;
        this.ctx = ctx;
        this.camera = camera;
        this.game = game;
        this.ui = ui;

        for (var i = 0; i < Config.maxAssets; i++) {
            let canv = document.createElement("canvas");
            canv.width = Config.pixelsPerRow * Config.maxFrames;
            canv.height = Config.pixelsPerRow;
            this.bufferCanvas.push(canv);

            let context = canv.getContext("2d");
            context.imageSmoothingEnabled = false;
            this.bufferCtx.push(context);
        }

        for (var i = 0; i < Config.tilesPerRow * Config.tilesPerRow; i++) {
            this.wallFrames.push([false, false, false, false, false, false]);
        }

        for (var i = 0; i < Config.maxCharacters; i++) {
            this.characterFrames.push(0);
            this.characterFrameTimers.push(Math.random());
            this.characterChatTimers.push(0);
            this.isCharacterWalking.push(false);
        }
    }
    createSprites(asset: Asset) {
        this.bufferCtx[asset.id].clearRect(0, 0, this.bufferCanvas[asset.id].width, this.bufferCanvas[asset.id].height);
        asset.sprite.render(this.bufferCtx[asset.id], Config.colorSet, 0, 0, 1);

        if (asset.tileType == TileType.WALL) {
            let top = new Sprite(Config.pixelsPerRow);
            let corner = new Sprite(Config.pixelsPerRow);
            top.pixels = asset.sprite.getPixelsCropped(0, 0, Config.pixelsPerRow, 5);
            top.render(this.bufferCtx[asset.id], Config.colorSet, Config.pixelsPerRow, 0, 1);
            top.pixels = top.getPixelsRotated(3);
            top.render(this.bufferCtx[asset.id], Config.colorSet, Config.pixelsPerRow * 2, 0, 1);
            top.pixels = top.getPixelsRotated(2);
            top.render(this.bufferCtx[asset.id], Config.colorSet, Config.pixelsPerRow * 3, 0, 1);
            corner.pixels = asset.sprite.getPixelsCropped(0, 0, 5, 5);
            corner.render(this.bufferCtx[asset.id], Config.colorSet, Config.pixelsPerRow * 4, 0, 1);
            corner.pixels = corner.getPixelsRotated(1);
            corner.render(this.bufferCtx[asset.id], Config.colorSet, Config.pixelsPerRow * 5, 0, 1);

        } else if (asset.type == AssetType.CHARACTER) {
            let body = new Sprite(Config.pixelsPerRow);
            let footL = new Sprite(Config.pixelsPerRow);
            let footR = new Sprite(Config.pixelsPerRow);
            body.pixels = asset.sprite.getPixelsCropped(0, 0, 31, 27);
            footL.pixels = asset.sprite.getPixelsCropped(0, 27, 15, 31);
            footR.pixels = asset.sprite.getPixelsCropped(16, 27, 31, 31);

            //frame 1: idle down
            footL.render(this.bufferCtx[asset.id], Config.colorSet, Config.pixelsPerRow, 0, 1);
            footR.render(this.bufferCtx[asset.id], Config.colorSet, Config.pixelsPerRow, 0, 1);
            body.render(this.bufferCtx[asset.id], Config.colorSet, Config.pixelsPerRow, 1, 1);

            //frame 2: walk passing
            footL.render(this.bufferCtx[asset.id], Config.colorSet, Config.pixelsPerRow * 2, 0, 1);
            footR.render(this.bufferCtx[asset.id], Config.colorSet, Config.pixelsPerRow * 2, -1, 1);
            body.render(this.bufferCtx[asset.id], Config.colorSet, Config.pixelsPerRow * 2, -1, 1);

            //frame 3: walk reaching R
            footL.render(this.bufferCtx[asset.id], Config.colorSet, Config.pixelsPerRow * 3, -1, 1);
            footR.render(this.bufferCtx[asset.id], Config.colorSet, Config.pixelsPerRow * 3, 1, 1);
            body.render(this.bufferCtx[asset.id], Config.colorSet, Config.pixelsPerRow * 3, 1, 1);

            //frame 4: walk passing
            footL.render(this.bufferCtx[asset.id], Config.colorSet, Config.pixelsPerRow * 4, -1, 1);
            footR.render(this.bufferCtx[asset.id], Config.colorSet, Config.pixelsPerRow * 4, 0, 1);
            body.render(this.bufferCtx[asset.id], Config.colorSet, Config.pixelsPerRow * 4, -1, 1);

            //frame 5: walk reaching L
            footL.render(this.bufferCtx[asset.id], Config.colorSet, Config.pixelsPerRow * 5, 1, 1);
            footR.render(this.bufferCtx[asset.id], Config.colorSet, Config.pixelsPerRow * 5, -1, 1);
            body.render(this.bufferCtx[asset.id], Config.colorSet, Config.pixelsPerRow * 5, 1, 1);
        }
    }
    update(deltaTime: number) {
        this.updateTimers(deltaTime);
        this.updateRenderStack();

        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(-this.camera.position.x, -this.camera.position.y);

        this.updateTiles();
        this.showVicinity();
        this.showPath();
        this.updateSortables();
        this.updateChat();
        this.showLookText();

        this.ctx.translate(this.camera.position.x, this.camera.position.y);
        this.ctx.scale(1 / this.camera.zoom, 1 / this.camera.zoom);


    }
    updateTimers(deltaTime: number) {
        this.characterLerp += deltaTime;
        if (this.characterLerp > 1) {
            this.characterLerp = 1;
        }

        if (this.lookTimer > 0) {
            this.lookTimer -= deltaTime;
        }

        for (var i = 0; i < this.game.characters.length; i++) {
            //animation timers
            this.characterFrameTimers[i] += deltaTime;
            if (this.characterFrameTimers[i] >= 1 / this.characterFramerate) {
                this.characterFrameTimers[i] = 0;
                this.characterFrames[i]++;
                if (this.characterFrames[i] >= 60) {
                    this.characterFrames[i] = 0;
                }
            }
            //chat timers
            this.characterChatTimers[i] -= deltaTime;
            if (this.characterChatTimers[i] < 0) {
                this.characterChatTimers[i] = 0;
            }
        }
    }
    updateRenderStack() {
        this.renderStack = [];
        this.numberOfUsedItems = 0;
        this.numberOfUsedCharacters = 0;
        //Add characters to render stack
        for (var i = 0; i < this.game.characters.length; i++) {
            let character = this.game.characters[i];
            if (character.isUsed) {
                this.numberOfUsedCharacters++;
                if (character.position.distance(character.positionLast) > 5) {
                    this.isCharacterWalking[i] = true;
                    character.positionRender = character.positionLast.lerp(character.position, this.characterLerp);
                } else {
                    this.isCharacterWalking[i] = false;
                    character.positionRender = character.position;
                }
                this.renderStack.push(character);
            }
        }
        //Add items to render stack
        for (var i = 0; i < this.game.items.length; i++) {
            if (this.game.items[i].isUsed) {
                this.numberOfUsedItems++;
                if (this.game.items[i].containerId == 0) {
                    let item = this.game.items[i];
                    this.renderStack.push(item);
                }
            }

        }
        //Z sort render stack based on Y position
        this.renderStack.sort(function (a, b) { return a.positionRender.y - b.positionRender.y });
    }
    updateTiles() {
        for (var i = 0; i < this.game.tiles.length; i++) {
            let x = Config.pixelsPerRow * (i % Config.tilesPerRow);
            let y = Config.pixelsPerRow * (Math.floor(i / Config.tilesPerRow));
            let type = this.game.tiles[i].type;
            let assetId = this.game.tiles[i].assetId;

            if (type == TileType.WALL) {
                for (var frame = 0; frame < this.wallFrames[i].length; frame++) {
                    if (this.wallFrames[i][frame]) {
                        this.ctx.drawImage(
                            this.bufferCanvas[assetId],
                            frame * Config.pixelsPerRow, 0, Config.pixelsPerRow, Config.pixelsPerRow,
                            x, y, Config.pixelsPerRow, Config.pixelsPerRow);
                    }
                }
            } else {
                this.ctx.drawImage(
                    this.bufferCanvas[assetId],
                    0, 0, Config.pixelsPerRow, Config.pixelsPerRow,
                    x, y, Config.pixelsPerRow, Config.pixelsPerRow);
            }
        }
    }
    updateSortables() {
        for (var i = 0; i < this.renderStack.length; i++) {
            let renderFrame: number = 0;
            let asset = this.game.assets[this.renderStack[i].assetId];
            if (asset.type == AssetType.CHARACTER) {
                if (this.isCharacterWalking[this.renderStack[i].id]) {
                    //Walk animation (frames 3,4,5,6)
                    renderFrame = this.characterFrames[this.renderStack[i].id] % 4 + 2;
                } else {
                    //Idle animation (frames 1 and 2)
                    renderFrame = Math.floor(this.characterFrames[this.renderStack[i].id] % 4 / 2);
                }
            }
            // // interpolated
            let x = this.renderStack[i].positionRender.x - this.renderStack[i].offsetRender.x;
            let y = this.renderStack[i].positionRender.y - this.renderStack[i].offsetRender.y;

            // // debug
            // let x = this.renderStack[i].position.x - this.renderStack[i].offsetRender.x;
            // let y = this.renderStack[i].position.y - this.renderStack[i].offsetRender.y;

            if (i == this.pickedSortable) {
                this.ctx.globalAlpha = 0.5;
            }
            this.ctx.drawImage(
                this.bufferCanvas[asset.id],
                renderFrame * Config.pixelsPerRow,
                0,
                Config.pixelsPerRow,
                Config.pixelsPerRow,
                x,
                y,
                Config.pixelsPerRow,
                Config.pixelsPerRow
            );
            this.ctx.globalAlpha = 1;
        }
    }
    updateChat() {
        for (var i = 0; i < this.characterChats.length; i++) {
            if (this.characterChatTimers[i] > 0) {
                this.ui.speechbubble(
                    this.characterChats[i],
                    this.game.characters[i].positionRender.x,
                    this.game.characters[i].positionRender.y
                );
            }
        }
    }
    getSortableAtPosition(positionMouse: Position): ISortable {
        for (var i = this.renderStack.length - 1; i >= 0; i--) {
            let positionRender = this.renderStack[i].positionRender;
            let offset = this.renderStack[i].offsetRender;
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
    setWallFrames() {
        for (var i = 0; i < this.game.tiles.length; i++) {
            if (this.game.tiles[i].type == TileType.WALL) {
                let x = i % Config.tilesPerRow;
                let y = Math.floor(i / Config.tilesPerRow);
                var isBottom = (this.getTileType(x, y + 1) != TileType.WALL);
                var isTop = (this.getTileType(x, y - 1) != TileType.WALL);
                var isLeft = (!isBottom && this.getTileType(x - 1, y) != TileType.WALL) || (this.getTileType(x, y + 1) == TileType.WALL && this.getTileType(x - 1, y + 1) != TileType.WALL);
                var isRight = (!isBottom && this.getTileType(x + 1, y) != TileType.WALL) || (this.getTileType(x, y + 1) == TileType.WALL && this.getTileType(x + 1, y + 1) != TileType.WALL);
                var isTopLeft = (this.getTileType(x - 1, y - 1) != TileType.WALL);
                var isTopRight = (this.getTileType(x + 1, y - 1) != TileType.WALL);

                this.wallFrames[i] = [isBottom, isTop, isLeft, isRight, isTopLeft, isTopRight];
            }
        }
    }
    getTileType(x: number, y: number): TileType {
        if (x < 0 || x >= Config.tilesPerRow || y < 0 || y >= Config.tilesPerRow) {
            return TileType.NONE;
        }
        let tileId = y * Config.tilesPerRow + x;
        return this.game.tiles[tileId].type;
    }
    showVicinity() {
        if (
            this.controlledCharacterId == -1 ||
            this.characterVicinity == undefined ||
            this.isCharacterWalking[this.controlledCharacterId]
        ) {
            return;
        }

        this.ctx.strokeStyle = "rgba(255,255,255,0.2)";
        this.ctx.lineWidth = 1;
        for (var i = 0; i < this.characterVicinity.length; i++) {
            let tile = this.game.tiles[this.characterVicinity[i]];
            this.ctx.strokeRect(
                tile.position.x * Config.pixelsPerRow + 3,
                tile.position.y * Config.pixelsPerRow + 3,
                Config.pixelsPerRow - 6,
                Config.pixelsPerRow - 6
            );
        }
    }
    showPath() {
        if (
            this.controlledCharacterId == -1 ||
            this.characterPath == undefined ||
            this.isCharacterWalking[this.controlledCharacterId]
        ) {
            return;
        }

        this.ctx.fillStyle = "rgba(255,255,255,0.2)";
        for (var i = 0; i < this.characterPath.length; i++) {

            if (i >= this.game.characters[this.controlledCharacterId].actionPoints / Config.pointsWalk) {
                return;
            }

            let tile = this.game.tiles[this.characterPath[i]];
            this.ctx.fillRect(
                tile.position.x * Config.pixelsPerRow + 3,
                tile.position.y * Config.pixelsPerRow + 3,
                Config.pixelsPerRow - 6,
                Config.pixelsPerRow - 6
            );
        }
    }
    setLookDescription(text: string, position: Position) {
        this.lookText = text;
        this.lookPosition = position;
        this.lookTimer = 5;
    }
    setLookName(text: string, position: Position) {
        if (this.lookTimer < 0.2) {
            this.lookText = text;
            this.lookPosition = position;
            this.lookTimer = 0.1;
        }
    }
    showLookText() {
        if (this.lookTimer > 0) {
            this.ui.lookText(this.lookText, this.lookPosition.x, this.lookPosition.y);
        }
    }
}