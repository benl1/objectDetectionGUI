const { app, BrowserWindow } = require('electron');

function initialize() {
    const main_window = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        resizable: true,
    });

    main_window.loadFile('index.html');
    main_window.once('ready-to-show', () => main_window.show());
}

app.once('ready', initialize);