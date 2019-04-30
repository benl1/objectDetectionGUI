/**
 * Global state information which needs to be preserved between different screens in
 * the application is stored in the App class.
 */
export default class App {
    constructor() {
        this.images = [];
        this.image_key = 0;
    }

    /**
     * Add a new image representation to the global state.
     * @param {String} img_path The fs location of an image or a base64 encoded
     * image.
     * @returns A key for the image.
     */
    addImage(img_path) {
        this.images.push(img_path);
        return this.image_key++;
    }

    /**
     * Pass through the list of images and filter out any images matching
     * the given path.
     * @param {String} img_path The fs location of an image or a base64 encoded
     * image.
     */
    removeImage(img_path) {
        this.images = this.images.filter((obj) => obj !== img_path);
    }

    /**
     * Clear all images from the global state.
     */
    removeAllImages() {
        this.images = [];
        this.image_key = 0;
    }

    /**
     * Return an array of strings representing the images stored in the global state.
     */
    getImages() {
        return this.images;
    }
}