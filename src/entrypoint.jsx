import React from 'react';
import ReactDOM from 'react-dom';
import ImageChoiceScreen from './image_choice_screen/image_choice_screen';
import App from './control/app';
import SceneSelectionScreen from './scene_selection_screen/scene_selection_screen';
import OutputScreen from './output_screen/output_screen';
import { displayErrorDialog } from './control/dialogs';

window.onload = () => {
    initialize();
};

function initialize() {
    displayImageChoiceScreen(new App());
}

function displayImageChoiceScreen(app) {
    ReactDOM.render(
        <ImageChoiceScreen app={app} />,
        document.getElementById('root')
    );
}

function displaySceneSelectionScreen(app) {
    ReactDOM.render(
        <SceneSelectionScreen app={app} />,
        document.getElementById('root')
    );
}

function displayOutputScreen(app, screen) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://127.0.0.1:5000/detect", false);

    let imgPaths = app.images;
    let imgs = [];
    let canvases = []

    function getPixels(url) {
        var img = new Image();
        img.src = url;
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0);
        //test code
        canvases[canvases.length] = canvas;
        //test code end
        return context.getImageData(0, 0, canvas.width, canvas.height).data;
    }
    
    let getArrayFromClampedArray = function(clampedArray) {
        let x = [];
        clampedArray.forEach((y) => x[x.length] = y);
        return x;
    }

    imgPaths.forEach(function (imgPath) {
        imgs[imgs.length] = getArrayFromClampedArray(getPixels(imgPath))
        
	    console.log(getPixels(imgPath))
    })
    var self = this;
    var display = null

    xhttp.onreadystatechange = function () {
        var response = JSON.parse(xhttp.responseText)
        display = <OutputScreen app={app} canvases={canvases}/> 
        console.log(response)
    }
    xhttp.setRequestHeader("Content-Type", "application/json");
    // TODO: what do we want to do here? stay on the current screen? 
    // TODO: go to the next one and render nothing?
    try {
	var obj = {scene: imgs[0], targets: [imgs[1]]}
        xhttp.send(JSON.stringify(obj))
    } catch (err) {
        displayErrorDialog('failed to connect to server');
    }
    
    ReactDOM.render(
        display,
        document.getElementById('root')
    );
}

export { displayImageChoiceScreen, displaySceneSelectionScreen, displayOutputScreen };
