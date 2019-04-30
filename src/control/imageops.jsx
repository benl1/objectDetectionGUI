require('babel-polyfill');

/**
 * Given a string referencing the location of an image on the local filesystem,
 * draw the image to a canvas and then extract an ImageData object from the
 * canvas' context. This is returned as a promise.
 * @param {String} url 
 */
function getImageDataFromURL(url) {
    const img = new Image();
    img.src = url;
    return new Promise((res, rej) => {
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            context.drawImage(img, 0, 0);

            res(context.getImageData(0, 0, canvas.width, canvas.height));
        }
    });
}

/**
 * Convert the ImageData associated with an image into a format which can
 * easily be dealt with by numpy when sent to the Flask sever.
 * @param {ImageData} image_data
 */
function produceRGBArray(image_data) {
    let image_width = image_data.width;
    let image_height = image_data.height;
    let result = [];
    let idx = 0;

    for (let x = 0; x < image_width; x++) {
        let column = [];

        for (let y = 0; y < image_height; y++) {
            let red = image_data.data[idx++];
            let green = image_data.data[idx++];
            let blue = image_data.data[idx++];
            idx++; // dump the alpha component
            column.push([red, green, blue]);
        }

        result.push(column);
    }

    return result;
}

export { getImageDataFromURL, produceRGBArray };