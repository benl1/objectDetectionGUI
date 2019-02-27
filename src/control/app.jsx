export default class App {
    constructor() {
        this.images = [];
        this.image_key = 0;
    }

    addImage(img_path) {
        console.log('adding an image');
        this.images.push(img_path);
        console.log(this.images);
        return this.image_key++;
    }

    removeAllImages() {
        console.log('removing all images');
        this.images = [];
        this.image_key = 0;
    }

    getImages() {
        console.log('getting images');
        return this.images;
    }
}