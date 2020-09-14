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

    create() {
        for (var i = 0; i < Config.maxAssets; i++) {
            let sprite = new Sprite(Config.pixelsPerRow);
            let asset = new Asset(i, AssetType.NONE, "Unnamed " + i, "Nothing to see here.", sprite);
            this.assets.push(asset);
        }
        for (var i = 0; i < Config.tilesPerRow * Config.tilesPerRow; i++) {
            let tile = new Tile(i);
            this.tiles.push(tile);
        }
        for (var i = 0; i < Config.maxItems; i++) {
            let item = new Item(i);
            this.items.push(item);
        }
        for (var i = 0; i < Config.maxCharacters; i++) {
            let character = new Character(i);
            this.characters.push(character);
        }
        this.isRunning = true;
    }
    load(data: Game) {
        for (var i = 0; i < data.assets.length; i++) {
            let asset = Object.assign(new Asset(), data.assets[i]);
            let sprite = Object.assign(new Sprite(), data.assets[i].sprite);
            let array = Object.assign(new Array, sprite.pixels); //better way to convert this without the extra step?
            let pixels = Uint8Array.from(array);
            sprite.pixels = pixels;
            asset.sprite = sprite;
            this.assets.push(asset);
        }
        for (var i = 0; i < data.tiles.length; i++) {
            let tile = Object.assign(new Tile, data.tiles[i]);
            tile.position = Object.assign(new Position, data.tiles[i].position);
            tile.positionRender = Object.assign(new Position, data.tiles[i].positionRender);
            this.tiles.push(tile);
        }
        for (var i = 0; i < data.items.length; i++) {
            let item = Object.assign(new Item, data.items[i]);
            item.position = Object.assign(new Position, data.items[i].position);
            item.positionRender = Object.assign(new Position, data.items[i].positionRender);
            this.items.push(item);
        }
        for (var i = 0; i < data.characters.length; i++) {
            let character = Object.assign(new Character, data.characters[i]);
            character.position = Object.assign(new Position, data.characters[i].position);
            character.positionLast = Object.assign(new Position, data.characters[i].positionLast);
            character.positionRender = Object.assign(new Position, data.characters[i].positionRender);
            character.positionTarget = Object.assign(new Position, data.characters[i].positionTarget);
            this.characters.push(character);
        }
        this.isRunning = true;
    }
    fixedUpdate() {
        for (var i = 0; i < this.characters.length; i++) {
            if (this.characters[i].isUsed) {
                let distanceToTarget = this.characters[i].position.distance(this.characters[i].positionTarget);
                if (distanceToTarget > 5) {
                    let direction = this.characters[i].positionTarget.subtract(this.characters[i].position);
                    let offset = direction.normalized();
                    let speed = Config.characterSpeed;
                    if (distanceToTarget < 20) {
                        speed = Config.characterSpeed / 5;
                    }
                    offset = offset.multiply(speed);
                    let newPosition = this.characters[i].position.add(offset);
               
                    if (this.getTileType(newPosition.toTile(Config.tilesPerRow)) == AssetType.FLOOR) {
                        this.characters[i].position = newPosition;
                    } else {
                        this.characters[i].positionTarget = this.characters[i].position;
                    }
                }
            }
        }
    }
    setAsset(data: any): Asset {
        let asset = Object.assign(new Asset(), data);
        asset.sprite = Object.assign(new Sprite(), asset.sprite);
        let array = Object.assign(new Array, asset.sprite.pixels); //better way to convert this without the extra step?
        asset.sprite.pixels = Uint8Array.from(array);

        if (asset.id >= 0 && asset.id < this.assets.length) {
            this.assets[asset.id] = asset;
        } else if (asset.id == -1) {
            for (var i = 0; i < this.assets.length; i++) {
                if (!this.assets[i].isUsed) {
                    asset.id = i;
                    this.assets[i] = asset;
                    return asset;
                }
            }
        }
        return asset;
    }
    setTile(data: any): Tile {
        let tile = Object.assign(new Tile(), data);
        if (tile.id >= 0 && tile.id < this.tiles.length) {
            this.tiles[tile.id] = tile;
        }
        return tile;
    }
    setItem(data: any): Item {
        let item = Object.assign(new Item(), data);
        if (item.id < 0) {
            for (var i = 0; i < this.items.length; i++) {
                if (!this.items[i].isUsed) {
                    item.id = i;
                    this.items[i] = item;
                    return item;
                }
            }
        } else if (item.id < this.items.length) {
            this.items[item.id] = item;
        }
        return item;
    }
    setCharacter(data: any): Character {
        let character = Object.assign(new Character(), data);
        character.position = Object.assign(new Position(), character.position)
        character.positionLast = character.position;
        character.positionTarget = character.position;
        character.positionRender = character.position;

        if (character.id >= 0 && character.id < this.characters.length) {
            this.characters[character.id] = character;
        } else if (character.id == -1) {
            for (var i = 0; i < this.characters.length; i++) {
                if (!this.characters[i].isUsed) {
                    character.id = i;
                    this.characters[i] = character;
                    return character;
                }
            }
        }
        return character;
    }
    setCharacterTarget(characterId: number, data: any) {
        let positionTarget = Object.assign(new Position(), data);
        this.characters[characterId].positionTarget = positionTarget;
    }
    setCharacterPositions(data: any) {
        for (var i = 0; i < this.characters.length; i++) {
            this.characters[i].positionLast = this.characters[i].position;
            this.characters[i].position = Object.assign(new Position(), data[i * 2]);
            this.characters[i].positionTarget = Object.assign(new Position(), data[i * 2 + 1]);
        }
    }
    getCharacterPositions(): Position[] {
        let positions: Position[] = [];
        for (var i = 0; i < this.characters.length; i++) {
            positions.push(this.characters[i].position);
            positions.push(this.characters[i].positionTarget);
        }
        return positions;
    }
    getTileType(position: Position): AssetType {
        let id = position.y * Config.tilesPerRow + position.x;
        if (id >= 0 && id < this.tiles.length) {
            return this.assets[this.tiles[id].assetId].type;
        }
        return AssetType.NONE;
    }
}