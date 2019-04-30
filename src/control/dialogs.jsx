const { dialog } = require('electron').remote;

/**
 * Displays a dialog box with two buttons: 'Yes' and 'No' to the user.
 * @param {String} message The message to display the user in the yes / no dialog box.
 * @returns 0 if the user clicks yes, 1 otherwise
 */
function displayYesNoDialog(message) {
    return dialog.showMessageBox({
        type: 'question',
        message: message,
        buttons: ['Yes', 'No'],
    });
}

/**
 * Displays a dialog box with one button labelled 'Ok'.
 * @param {String} message The message to display to the user in the dialog box.
 */
function displayErrorDialog(message) {
    dialog.showMessageBox({
        type: 'error',
        message: message,
        buttons: ['OK'],
    });
}

/**
 * Displays a dialog which allows the user to select JPG and PNG image files from
 * their filesystem.
 * @returns undefined if the user closes the dialog before selecting an image.
 * if the user selects an image, the path of that image is returned in an array
 * of one element.
 */
function displayImageUploadDialog() {
    return dialog.showOpenDialog({
        properties: ['openFile'], // users can only upload one file at a time
        filters: [{ name: 'Images', extensions: ['jpg', 'png'] }],
    });
}

/**
 * Displays a dialog which allows the user to select a JSON file to upload and
 * use as an image store.
 * @returns undefined if the user closes the dialog before selecting a JSON file.
 * if the user selects a JSON file, the path of the JSON file is returned in an
 * array of one element.
 */
function displayImageStoreUploadDialog() {
    return dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'JSON', extensions: ['json'] }],
    });
}

export { displayYesNoDialog, displayErrorDialog, displayImageUploadDialog, displayImageStoreUploadDialog };