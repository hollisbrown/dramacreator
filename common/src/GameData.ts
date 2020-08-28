import Asset from './Asset';
import Tile from './Tile';
import Item from './Item';
import Character from './Character';

export default class GameData {

    config = {
        maxPlayers: 8,
        maxAssets: 128,
        maxItems: 128,
        maxCharacters: 8,
        tilesPerRow: 32,
        pixelsPerRow: 32,
        pixelsPerImage: 1024,
        characterSpeed: 12,
        fastFramesPerSecond: 2
    };

    assets: Asset[] = [];
    tiles: Tile[] = [];
    items: Item[] = [];
    characters: Character[] = [];

    constructor() {
        
    }

    init(config: any) {
        //try to load
        //else: create empty
        this.config = config;
        this.create();


    }

    create() {

        for (var i = 0; i < this.config.maxAssets; i++) {
            console.log(i);
            var asset = new Asset(i);
            asset.image = new Uint8Array(this.config.pixelsPerImage);
            var randomColor = Math.floor(Math.random() * 30);
            for (var j = 0; j < asset.image.length; j++) {
                asset.image[j] = randomColor;
            }
            this.assets.push(asset);
        }


        for (var i = 0; i < this.config.tilesPerRow * this.config.tilesPerRow; i++) {
            var tile = new Tile(i);
            this.tiles.push(tile);
        }

        for (var i = 0; i < this.config.maxItems; i++) {
            var item = new Item(i);
            this.items.push(item);
        }

        for (var i = 0; i < this.config.maxCharacters; i++) {
            var character = new Character(i);
            this.characters.push(character);
        }
    }

}