export default class Sprite {

    id: number;
    width: number;
    pixels: Uint8Array;

    constructor(
        id: number = 0,
        width: number = 0
    ) {
        this.id = id;
        this.width = width;
        this.pixels = new Uint8Array(this.width * this.width);
    }

    render(context: any, colorSet: string[], frame: number, pixelSize: number) {
        for (var i = 0; i < this.width * this.width; i++) {
            let x = i % this.width + (frame * this.width);
            let y = Math.floor(i / this.width);
            let colorId = this.pixels[i];
            if (colorId < 0 || colorId >= colorSet.length) {
                context.fillStyle = colorSet[0];
            } else {
                context.fillStyle = colorSet[colorId];
            }
            context.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
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
        var croppedImage = new Uint8Array(this.pixels);
        for (var i = 0; i < croppedImage.length; i++) {
            var x = i % this.width;
            var y = Math.floor(i / this.width);
            if (x < topX || x > bottomX || y < topY || y > bottomY) {
                croppedImage[i] = 0;
            }
        }
        return croppedImage;
    }
    getPixelsTranslated(x: number, y: number): Uint8Array {
        let translatedImage = new Uint8Array(this.width * this.width);
        console.log("x:" + x + " y:" + y + " image before: " + translatedImage.length);
        for (var i = 0; i < translatedImage.length; i++) {

            let currentX = i % this.width;
            let currentY = Math.floor(i / this.width);
            let newX = (currentX + x);
            let newY = (currentY + y);

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
            translatedImage[i] = this.pixels[index];
        }
        console.log("image after: " + translatedImage.length);
        return translatedImage;
    }
    getPixelsCombined(pixels: Uint8Array[]): Uint8Array {
        let combinedImage = new Uint8Array(pixels[0]);
        for (var j = 0; j < pixels.length - 1; j++) {
            let topImage = pixels[j + 1];
            for (var i = 0; i < combinedImage.length; i++) {
                if (topImage[i] != 0) {
                    combinedImage[i] = topImage[i];
                }
            }
        }
        return combinedImage;
    }
    getPixelsRotated(rotation: number): Uint8Array {
        let rotatedImage = new Uint8Array(this.pixels);

        for (var i = 0; i < rotatedImage.length; i++) {
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
            rotatedImage[index] = this.pixels[i];
        }

        return rotatedImage;
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