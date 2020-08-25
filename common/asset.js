class Asset {

    constructor(id, type, name) {
        this.id = id;
        this.type = type;
        this.nameLength = name.length;
        this.name = name;
    }

    toBuffer(buffer, start) {
        buffer[start] = this.id;
        buffer[start + 1] = this.type;
        buffer[start + 2] = this.nameLength;
        buffer.set(assetName, start + 2);
    }

    fromBuffer(buffer, start) {
        this.id = buffer[start];
        this.type = buffer[start + 1];
        this.nameLength = buffer[start + 2];
        this.name = buffer.slice(start + 2, nameLength);
    }

}