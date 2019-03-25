import { displayImageChoiceScreen, displaySceneSelectionScreen } from '../entrypoint';
import { getImageDataFromURL, produceRGBArray } from '../control/imageops';
import React from 'react';

export default class OutputScreen extends React.Component {
    render() {
        return (
            <div>
                <OutputScreenContainer app={this.props.app}/>
                <div className='button' onClick={() => displayImageChoiceScreen(this.props.app)}>Image choice</div>
                <div className='button' onClick={() => displaySceneSelectionScreen(this.props.app)}>Scene selection</div>
            </div>
        );
    }
}

class OutputScreenContainer extends React.Component {
    constructor(props) {
        super(props);
        this.canvas_ref = React.createRef();
    }

    /**
     * The changes made here are based on this link: 
     */
    componentDidMount() {
        let xhttp = new XMLHttpRequest();
        let target_images = [];
        let response;
    
        // convert image paths to arrays of image data
        this.props.app.images.forEach(img_path => target_images.push(produceRGBArray(getImageDataFromURL(img_path))));
    
        // setup the XHR
        xhttp.open('POST', 'http://127.0.0.1:5000/detect', false);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200) {
                response = JSON.parse(xhttp.responseText);
            } else if (xhttp.status === 400) {
                displayErrorDialog('server responded with 400.');
            } else {
                displayErrorDialog(`status: ${xhttp.status}, text: ${xhttp.responseText}`);
            }
        };
    
        try {
            let scene = produceRGBArray(getImageDataFromURL(this.props.app.scene_image));
            xhttp.send(JSON.stringify({ scene: scene, targets: target_images }));
        } catch (err) {
            console.log(err);
            //displayErrorDialog('failed to connect to server');
            return; // TODO: for now we can just return prematurely
        }

        const canvas = this.canvas_ref.current;
        const ctx = canvas.getContext('2d');
        const scene_image = new Image();
        
        scene_image.src = this.props.app.scene_image;

        canvas.width = scene_image.naturalWidth;
        canvas.height = scene_image.naturalHeight;

        ctx.drawImage(scene_image, 0, 0);

        ctx.strokeStyle = 'red';
        console.log(response);
        const num_boxes = response['boxes'].length;

        for (let i = 0; i < num_boxes; i++) {
            const [top_x, top_y, bot_x, bot_y] = response['boxes'][i];
            const confidence = response['scores'][i];
            const height = bot_y - top_y;

            ctx.strokeRect(top_x, top_y, bot_x, bot_y);
            ctx.strokeText(`${confidence}`, top_x + 5, top_y + height / 2);
        }
    }

    render() {
        return <canvas ref={this.canvas_ref} />;
    }
}