import React from 'react';
import ReactDOM from 'react-dom';
import ImageChoiceScreen from './image_choice_screen/image_choice_screen';
import App from './control/app';
import SceneSelectionScreen from './scene_selection_screen/scene_selection_screen';
import OutputScreen from './output_screen/output_screen';

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

function displayOutputScreen(app) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "http://127.0.0.1:5000/detect", false);

    let imgPaths = app.images;
    let imgs = [];
    
    function getPixels(url) {
        var img = new Image();
        img.src = url;
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0);
        return context.getImageData(0, 0, canvas.width, canvas.height).data;
    }

    imgPaths.forEach(function(imgPath){
        console.log(getPixels(imgPath))
    })

    xhttp.onreadystatechange = function() {
        var response = JSON.parse(xhttp.responseText);
        console.log(response);
    }

    xhttp.send();
    
    ReactDOM.render(
        <OutputScreen app={app} />,
        document.getElementById('root')
    );
}

export { displayImageChoiceScreen, displaySceneSelectionScreen, displayOutputScreen };