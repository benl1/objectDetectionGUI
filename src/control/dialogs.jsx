const { dialog } = require('electron').remote;

/**
 * Displays a dialog box with two buttons: 'Yes' and 'No' to the user.
 * @param {*} message The message to display the user in the yes / no dialog box.
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
 * @param {*} message The message to display to the user in the dialog box.
 */
function displayErrorDialog(message) {
    dialog.showMessageBox({
        type: 'error',
        message: message,
        buttons: ['OK'],
    });
}

function displayImageUploadDialog() {
    return dialog.showOpenDialog({
        properties: ['openFile'], // users can only upload one file at a time
        filters: [{ name: 'Images', extensions: ['jpg', 'png'] }],
    });
}

function displayImageStoreUploadDialog() {
    return dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'JSON', extensions: ['json'] }],
    });
}

export { displayYesNoDialog, displayErrorDialog, displayImageUploadDialog, displayImageStoreUploadDialog };