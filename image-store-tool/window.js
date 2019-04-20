const { dialog } = require('electron').remote;
const fs = require('fs');

$(document).ready(() => {
    const img_data = readJSONFile('images.json');
    const img_container = $('#img_container');
    const upload_img_btn = $('#upload_btn');
    const save_imgs_btn = $('#save_btn');

    renderImages(img_container, img_data);

    upload_img_btn.on('click', () => {
        const uploaded_image = showImageUploader();
        if (uploaded_image === undefined) return;
        addNewImg(img_data, img_container, uploaded_image[0]);
    });

    save_imgs_btn.on('click', () => {
        if (displayConfirmDialog()) {
            writeJSONFile('images.json', img_data);
        }
    });
});

function displayConfirmDialog() {
    const result = dialog.showMessageBox({
        type: 'question',
        buttons: ['OK', 'No'],
        defaultId: 1,
        title: 'Confirm save',
        message: 'Are you sure you want to save the images?',
        detail: 'This will overwrite the existing file',
        cancelId: 1,
    });

    return (result == 0);
}

function removeImage(img_object, img_data) {
    const imgs = img_object.imgs;
    const idx = imgs.findIndex(obj => obj.data == img_data);
    imgs.splice(idx, 1);
}

function addNewImg(img_object, img_container, img_path) {
    const tmp_img = new Image();
    tmp_img.onload = () => {
        const img_url_rep = getImgDataURL(tmp_img);
        const imgs = img_object.imgs;
        imgs.push({
            data: img_url_rep, 
            height: tmp_img.naturalHeight, 
            width: tmp_img.naturalWidth
        });
        renderImages(img_container, img_object);
    };
    tmp_img.src = img_path;
}

function getImgDataURL(img) {
    const canvas = document.createElement('canvas');

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    return canvas.toDataURL();
}

function renderImages(img_container, img_object) {
    const imgs = img_object.imgs; // a list of image objects of the form {data, height, width}
    img_container.empty();
    imgs.forEach(img => {
        const img_data = img.data;
        const img_elt = $(`<img src=${img_data}></img>`);
        img_elt.on('click', () => {
            removeImage(img_object, img_data);
            renderImages(img_container, img_object);
        });
        img_container.append(img_elt);
    });
}

function showImageUploader() {
    return dialog.showOpenDialog({
        title: 'Upload an image',
        filters: [{name: 'images', extensions: ['png', 'jpg', 'PNG', 'JPG']}],
    });
}

function readJSONFile(filename) {
    if (!fs.existsSync(filename)) {
        writeJSONFile(filename, {imgs: []});
    }

    const raw_data = fs.readFileSync(filename);
    
    return JSON.parse(raw_data);
}

function writeJSONFile(filename, object) {
    fs.writeFileSync(filename, JSON.stringify(object));
}