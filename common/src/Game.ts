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
    characterPaths: number[][] = [];
    isRunning: boolean = false;

    create() {
        for (var i = 0; i < Config.maxAssets; i++) {
            let sprite = new Sprite(Config.pixelsPerRow);
            let asset = new Asset(i, AssetType.NONE, "Unnamed " + i, "Nothing to see here.", sprite);
            this.assets.push(asset);
        }
        for (var i = 0; i < Config.tilesPerRow * Config.tilesPerRow; i++) {
            let x = i % Config.tilesPerRow;
            let y = Math.floor(i / Config.tilesPerRow);
            let tile = new Tile(i, 1, AssetType.NONE, new Position(x, y));
            tile.setNeighbours(Config.tilesPerRow);
            this.tiles.push(tile);
        }
        for (var i = 0; i < Config.maxItems; i++) {
            let item = new Item(i);
            this.items.push(item);
        }
        for (var i = 0; i < Config.maxCharacters; i++) {
            let character = new Character(i);
            this.characters.push(character);
            character.actionPoints = Config.maxPoints;
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
            tile.type = this.assets[tile.assetId].type;

            let x = i % Config.tilesPerRow;
            let y = Math.floor(i / Config.tilesPerRow);
            tile.position = new Position(x, y);
            tile.positionRender = new Position(x * Config.pixelsPerRow, y * Config.pixelsPerRow);
            tile.setNeighbours(Config.tilesPerRow);
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
            character.actionPoints = Config.maxPoints;
            this.characters.push(character);
            this.characterPaths.push([]);
        }
        this.isRunning = true;
    }
    update() {
        for (var i = 0; i < this.characters.length; i++) {
            if (this.characters[i].isUsed) {

                if (this.characterPaths[i].length > 0 && this.characters[i].actionPoints >= Config.pointsWalk) {
                    this.characters[i].actionPoints -= Config.pointsWalk;
                    let position = this.tiles[this.characterPaths[i][0]].positionRender;
                    position = position.add(new Position(16, 16));
                    this.characters[i].position = position;
                    this.characterPaths[i].splice(0, 1);
                }
            }
        }
    }
    updateRound() {
        for (var i = 0; i < this.characters.length; i++) {
            this.characters[i].actionPoints = Config.maxPoints;
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
            this.tiles[tile.id].assetId = tile.assetId;
            this.tiles[tile.id].type = tile.type;
            this.tiles[tile.id].setNeighbours(Config.tilesPerRow);
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
    setCharacterPath(characterId: number, data: any) {
        this.characterPaths[characterId] = data;
    }
    setCharacterPositions(data: any) {
        for (var i = 0; i < this.characters.length; i++) {
            this.characters[i].positionLast = this.characters[i].position;
            this.characters[i].position = Object.assign(new Position(), data[i * 2]);
            this.characters[i].positionTarget = Object.assign(new Position(), data[i * 2 + 1]);
        }
    }
    setCharacterActionPoints(data: any) {
        for (var i = 0; i < this.characters.length; i++) {
            this.characters[i].actionPoints = data[i];
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
    getCharacterActionPoints(): number[] {
        return this.characters.map(e => e.actionPoints);
    }
    getTileType(position: Position): AssetType {
        let id = position.y * Config.tilesPerRow + position.x;
        if (id >= 0 && id < this.tiles.length) {
            return this.assets[this.tiles[id].assetId].type;
        }
        return AssetType.NONE;
    }
}