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
        buttons: ['Yes', 'No']
    });
}

function displayImageUploadDialog() {
    return dialog.showOpenDialog({
        properties: ['openFile'], // users can only upload one file at a time
        filters: [{ name: 'Images', extensions: ['jpg', 'png'] }]
    });
}

export { displayYesNoDialog, displayImageUploadDialog };