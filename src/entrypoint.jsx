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
    ReactDOM.render(
        <OutputScreen app={app} />,
        document.getElementById('root')
    );
}

export { displayImageChoiceScreen, displaySceneSelectionScreen, displayOutputScreen };