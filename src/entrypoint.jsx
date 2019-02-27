import React from 'react';
import ReactDOM from 'react-dom';
import ImageChoiceScreen from './image_choice_screen/image_choice_screen';
import App from './control/app';

window.onload = () => {
    initialize();
};

function initialize() {
    displayImageChoiceScreen(new App());
}

function displayImageChoiceScreen(app) {
    ReactDOM.render(
        <ImageChoiceScreen app={app}/>,
        document.getElementById('root')  
    );
}