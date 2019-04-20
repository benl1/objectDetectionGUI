export default class App {
    constructor() {
        this.images = [];
        this.image_key = 0;
    }

    addImage(img_path) {
        this.images.push(img_path);
        return this.image_key++;
    }

    removeImage(img_path) {
        this.images = this.images.filter((obj) => {
            return obj !== img_path;
        })
    }

    removeAllImages() {
        this.images = [];
        this.image_key = 0;
    }

    getImages() {
        return this.images;
    }
}