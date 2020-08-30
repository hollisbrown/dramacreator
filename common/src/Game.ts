
import Config from './Config';
import Asset from './Asset';
import Tile from './Tile';
import Item from './Item';
import Character from './Character';
import Position from './Position';

export default class Game {

    assets: Asset[] = [];
    tiles: Tile[] = [];
    items: Item[] = [];
    characters: Character[] = [];
    isRunning: boolean = false;

    constructor() {

    }
    create() {
        for (var i = 0; i < Config.maxAssets; i++) {
            var asset = new Asset(i);
            asset.image = new Uint8Array(Config.pixelsPerImage);
            var randomColor = Math.floor(Math.random() * 30);
            for (var j = 0; j < Config.pixelsPerImage; j++) {
                asset.image[j] = randomColor;
            }
            this.assets.push(asset);
        }
        for (var i = 0; i < Config.tilesPerRow * Config.tilesPerRow; i++) {
            var tile = new Tile(i, 1);
            this.tiles.push(tile);
        }
        for (var i = 0; i < Config.maxItems; i++) {
            var item = new Item(i, 2, 0, new Position(i*40,50));
            this.items.push(item);
        }
        for (var i = 0; i < Config.maxCharacters; i++) {
            var character = new Character(i, 3);
            this.characters.push(character);
        }

        this.isRunning = true;
    }
    fromJSON(json: string) {
        var object = JSON.parse(json);
        var loadedGame = Object.assign(new Game(), object);
        var loadedConfig = Object.assign(new Config(), loadedGame.config);

        for (var i = 0; i < loadedGame.assets.length; i++) {
            console.log(i);
            var asset: Asset = Object.assign(new Asset(i), loadedGame.assets[i]);
            this.assets.push(asset);
        }
        for (var i = 0; i < loadedGame.tiles.length; i++) {
            var tile: Tile = Object.assign(new Tile(i), loadedGame.tiles[i]);
            this.tiles.push(tile);
        }
        for (var i = 0; i < loadedGame.items.length; i++) {
            var item: Item = Object.assign(new Item(i), loadedGame.items[i]);
            this.items.push(item);
        }
        for (var i = 0; i < loadedGame.characters.length; i++) {
            var character: Character = Object.assign(new Character(i), loadedGame.characters[i]);
            this.characters.push(character);
        }

        this.isRunning = true;
    }
    update(deltaTime: number) {

    }
}