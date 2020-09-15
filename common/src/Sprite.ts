export default class Sprite {
    width: number;
    pixels: Uint8Array;

    constructor(
        width: number = 32
    ) {
        this.width = width;
        this.pixels = new Uint8Array(this.width * this.width);
    }
    render(context: any, colorSet: string[], x: number, y: number, pixelSize: number) {
        for (var i = 0; i < this.width * this.width; i++) {
            let renderX = (x * pixelSize) + i % this.width;
            let renderY = (y * pixelSize) + Math.floor(i / this.width);
            let colorId = this.pixels[i];
            if (colorId < 0 || colorId >= colorSet.length) {
                context.fillStyle = colorSet[0];
            } else {
                context.fillStyle = colorSet[colorId];
            }
            context.fillRect(renderX * pixelSize, renderY * pixelSize, pixelSize, pixelSize);
        }
    }
    setPixel(x: number, y: number, color: number) {
        let id = (y * this.width) + x;
        this.pixels[id] = color;
    }
    setAllPixels(color: number) {
        for (var i = 0; i < this.pixels.length; i++) {
            this.pixels[i] = color;
        }
    }
    setPixelArray(ids: number[], color: number) {
        for (var i = 0; i < ids.length; i++) {
            this.pixels[ids[i]] = color;
        }
    }
    getPixel(x: number, y: number): number {
        let id = (y * this.width) + x;
        return this.pixels[id];
    }
    getPixelsCropped(topX: number, topY: number, bottomX: number, bottomY: number): Uint8Array {
        var pixelsCropped = new Uint8Array(this.pixels);
        for (var i = 0; i < pixelsCropped.length; i++) {
            var x = i % this.width;
            var y = Math.floor(i / this.width);
            if (x < topX || x > bottomX || y < topY || y > bottomY) {
                pixelsCropped[i] = 0;
            }
        }
        return pixelsCropped;
    }
    getPixelsTranslated(x: number, y: number): Uint8Array {
        let pixelsTranslated = new Uint8Array(this.width * this.width);
        for (var i = 0; i < pixelsTranslated.length; i++) {

            let currentX = i % this.width;
            let currentY = Math.floor(i / this.width);
            let newX = (currentX - x);
            let newY = (currentY - y);

            //loop
            if (newX < 0) {
                newX = this.width - 1;
            } else {
                newX = newX % this.width;
            }
            if (newY < 0) {
                newY = this.width - 1;
            } else {
                newY = newY % this.width;
            }

            let index = newY * this.width + newX;
            pixelsTranslated[i] = this.pixels[index];
        }
        return pixelsTranslated;
    }
    getPixelsFlipped(): Uint8Array {
        let pixelsFlipped = new Uint8Array(this.width * this.width);
        for (var i = 0; i < pixelsFlipped.length; i++) {
            let x = i % this.width;
            let flippedX = this.width - 1 - x;
            let y = Math.floor(i / this.width);
            let flippedIndex = y * this.width + flippedX;
            pixelsFlipped[i] = this.pixels[flippedIndex];
        }
        return pixelsFlipped;
    }
    getPixelsCombined(pixels: Uint8Array[]): Uint8Array {
        let pixelsCombined = new Uint8Array(pixels[0]);
        for (var j = 0; j < pixels.length - 1; j++) {
            let topImage = pixels[j + 1];
            for (var i = 0; i < pixelsCombined.length; i++) {
                if (topImage[i] != 0) {
                    pixelsCombined[i] = topImage[i];
                }
            }
        }
        return pixelsCombined;
    }
    getPixelsRotated(rotation: number): Uint8Array {
        let pixelsRotated = new Uint8Array(this.pixels);

        for (var i = 0; i < pixelsRotated.length; i++) {
            let x = i % this.width;
            let y = Math.floor(i / this.width);

            let tempX = x;
            let tempY = y;
            let rotatedX;
            let rotatedY;

            for (var r = 0; r < rotation; r++) {
                rotatedX = (this.width - 1) - tempY;
                rotatedY = tempX;
                tempX = rotatedX;
                tempY = rotatedY;
            }
            let index = rotatedY * this.width + rotatedX;
            pixelsRotated[index] = this.pixels[i];
        }

        return pixelsRotated;
    }
    getPixelBounds(): number[] {
        let topX = this.width / 2;
        let topY = this.width / 2;
        let bottomX = this.width / 2;
        let bottomY = this.width / 2;
        for (var i = 0; i < this.pixels.length; i++) {

            if (this.pixels[i] != 0) {
                let x = i % this.width;
                let y = Math.floor(i / this.width);

                if (x < topX) {
                    topX = x;
                }
                if (x > bottomX) {
                    bottomX = x;
                }
                if (y < topY) {
                    topY = y;
                }
                if (y > bottomY) {
                    bottomY = y;
                }
            }
        }
        return [topX, topY, bottomX, bottomY];
    }
    addPixelsToList(pixelList: number[], x: number, y: number, color: number) {
        let id = (y * this.width) + x;

        //check if already visited pixel
        for (var i = 0; i < pixelList.length; i++) {
            if (pixelList[i] == id) {
                return;
            }
        }
        if (this.pixels[id] == color) {
            pixelList.push(id);
            if (x < this.width - 1) {
                this.addPixelsToList(pixelList, x + 1, y, color);
            }
            if (y < this.width - 1) {
                this.addPixelsToList(pixelList, x, y + 1, color);
            }
            if (x > 0) {
                this.addPixelsToList(pixelList, x - 1, y, color);
            }
            if (y > 0) {
                this.addPixelsToList(pixelList, x, y - 1, color);
            }
        }
    }
}