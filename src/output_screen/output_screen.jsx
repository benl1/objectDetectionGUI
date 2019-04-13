import { displayImageChoiceScreen, displaySceneSelectionScreen } from '../entrypoint';
import { getImageDataFromURL, produceRGBArray } from '../control/imageops';
import { displayErrorDialog } from '../control/dialogs';
import React from 'react';

export default class OutputScreen extends React.Component {
    render() {
        return (
            <div>
                <OutputScreenContainer app={this.props.app} input_options={this.props.input_options}/>
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
        const xhttp = new XMLHttpRequest();
        const target_images = [];
    
        // convert image paths to arrays of image data
        this.props.app.images.forEach(img_path => target_images.push(produceRGBArray(getImageDataFromURL(img_path))));
    
        // setup the XHR
        xhttp.open('POST', 'http://127.0.0.1:5000/detect', false);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200) {
                const response = JSON.parse(xhttp.responseText);
                const ctx = this.canvas_ref.current.getContext('2d');
                const num_boxes = response['boxes'].length;
                console.log(response);

                ctx.strokeStyle = 'red';

                // draw the bounding boxes and their associated scores to the scene image
                for (let i = 0; i < num_boxes; i++) {
                    const [top_x, top_y, bot_x, bot_y] = response['boxes'][i];
                    const confidence = response['scores'][i];
                    const height = bot_y - top_y;

                    ctx.strokeRect(top_x, top_y, bot_x, bot_y);
                    ctx.strokeText(`${confidence}`, top_x + 5, top_y + height / 2);
                }
            } else if (xhttp.status === 400) {
                displayErrorDialog('server responded with 400.');
            } else {
                displayErrorDialog(`status: ${xhttp.status}, text: ${xhttp.responseText}`);
            }
        };
    
        try {
            if (this.props.input_options.input == 'scene_image') {
                const tmp_img = new Image();
                tmp_img.src = this.props.input_options.path;

                const canvas = this.canvas_ref.current;
                canvas.width = tmp_img.width;
                canvas.height = tmp_img.height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(tmp_img, 0, 0);

                const scene = produceRGBArray(ctx.getImageData(0, 0, canvas.width, canvas.height));
                xhttp.send(JSON.stringify({ scene: scene, targets: target_images }));
            } else if (this.props.input_options.input == 'webcam') {
                navigator.mediaDevices.getUserMedia(this.props.input_options.media_options)
                    .then(stream => {
                        const track = stream.getVideoTracks()[0];
                        const track_settings = track.getSettings();
                        const image_capture = new ImageCapture(track);

                        // just take a frame from the video element:
                        image_capture.grabFrame()
                            .then(frame => {
                                // set the canvas to the width and height of the current image we are taking in
                                const canvas = this.canvas_ref.current;
                                canvas.width = track_settings.width;
                                canvas.height = track_settings.height;

                                // draw the image to the canvas
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(frame, 0, 0);

                                // produce an RGB array from the image drawn to the canvas and send it along
                                // to the server for object detection
                                const scene = produceRGBArray(ctx.getImageData(0, 0, canvas.width, canvas.height));
                                xhttp.send(JSON.stringify({ scene: scene, targets: [scene] }));
                            })
                            .catch(err => console.error(err));
                    })
                    .catch(err => console.error(err));
            }
        } catch (err) {
            console.log(err);
            displayErrorDialog('failed to connect to server');
            return; // TODO: for now we can just return prematurely
        }
    }

    render() {
        return <canvas ref={this.canvas_ref} />;
    }
}