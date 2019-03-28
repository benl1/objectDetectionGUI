export default class App {
    constructor() {
        this.images = [];
        this.image_key = 0;
        this.scene_image = '';
    }

    addImage(img_path) {
        this.images.push(img_path);
        return this.image_key++;
    }

    removeAllImages() {
        this.images = [];
        this.image_key = 0;
    }

    getImages() {
        return this.images;
    }

    setSceneImage(img_path) {
        this.scene_image = img_path;
    }
}