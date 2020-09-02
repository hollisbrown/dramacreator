import Config from './Config';
import Asset, { AssetType } from './Asset';
import Sprite from './Sprite';
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
            let sprite = new Sprite(i, Config.pixelsPerRow, new Uint8Array(Config.pixelsPerImage));
            let randomColor = Math.floor(Math.random() * 30);
            sprite.setAllPixels(randomColor);

            let asset = new Asset(i, AssetType.NONE, "Unnamed " + i, "Nothing to see here.", sprite);
            this.assets.push(asset);
        }

        this.assets[1].type = AssetType.FLOOR;
        this.assets[2].type = AssetType.ITEM;
        this.assets[3].type = AssetType.CHARACTER;

        for (var i = 0; i < Config.tilesPerRow * Config.tilesPerRow; i++) {
            let tile = new Tile(i, 1);
            this.tiles.push(tile);
        }
        for (var i = 0; i < Config.maxItems; i++) {
            let item = new Item(i, 2, 0, new Position(i * 40, 50 + i * 30));
            this.items.push(item);
        }
        for (var i = 0; i < Config.maxCharacters; i++) {
            let character = new Character(i, 3);
            this.characters.push(character);
        }
        this.isRunning = true;
    }
    load(data: Game) {

        for (var i = 0; i < data.assets.length; i++) {
            let asset = Object.assign(new Asset(), data.assets[i]);
            let sprite = Object.assign(new Sprite(), data.assets[i].sprite);
            asset.sprite = sprite;
            this.assets.push(asset);
        }
        for (var i = 0; i < data.tiles.length; i++) {
            let tile = Object.assign(new Tile, data.tiles[i]);
            this.tiles.push(tile);
        }
        for (var i = 0; i < data.items.length; i++) {
            let item = Object.assign(new Item, data.items[i]);
            this.items.push(item);
        }
        for (var i = 0; i < data.characters.length; i++) {
            let character = Object.assign(new Character, data.characters[i]);
            this.characters.push(character);
        }

        this.isRunning = true;
    }
    update(deltaTime: number) {
    }
    setAsset(data: any): number {
        let asset = Object.assign(new Asset(), data);
        asset.sprite = Object.assign(new Sprite(), asset.sprite);
        if (asset.id == -1) {
            //find unused asset Id
            for (var i = 1; i < this.assets.length; i++) {
                if (this.assets[i].type == AssetType.NONE) {
                    asset.id = i;
                    this.assets[i] = asset;
                    return i;
                }
            }
            return -1;
        } else {
            this.assets[asset.id] = asset;
        }
        return asset.id;
    }
    setTile(data: any): number {
        let tile = Object.assign(new Tile(), data);
        this.tiles[tile.id] = tile;
        return tile.id;
    }
    setItem(data: any): number {
        let item = Object.assign(new Item(), data);
        if (item.id == -1) {
            //try to find empty ID
            //add new at ID
        } else {
            this.items[item.id] = item;
        }
        return item.id;
    }
    setCharacter(data: any): number {
        let character = Object.assign(new Character(), data);
        if (character.id == -1) {
            //try to find empty ID
            //add new at ID
        } else {
            this.characters[character.id] = character;
        }
        return character.id;
    }
}