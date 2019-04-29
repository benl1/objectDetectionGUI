import { displayImageChoiceScreen, displaySceneSelectionScreen } from '../entrypoint';
import { getImageDataFromURL, produceRGBArray } from '../control/imageops';
import { displayErrorDialog } from '../control/dialogs';
import { drawBoundingBoxes, resizeHandler, BoundingBoxSettings } from './common';
import React from 'react';

export default function OutputScreen(props) {
    return (
        <div className='flexColumn'>
            <OutputScreenContainer app={props.app} input_options={props.input_options} />
            <div className='button' onClick={() => displayImageChoiceScreen(props.app)}>Image choice</div>
            <div className='button' onClick={() => displaySceneSelectionScreen(props.app)}>Scene selection</div>
        </div>
    );
}

class OutputScreenContainer extends React.Component {
    constructor(props) {
        super(props);
        this.output_canvas_ref = React.createRef();
        this.box_settings_ref = React.createRef();
        // this is populated when the server responds to the XHR in componentDidMount
        this.bounding_boxes = undefined;
        // the image object which is the basis of the image drawn with bounding boxes
        this.scene_image = undefined;

        this.state = {
            output_width: 0,
            output_height: 0,
        }
    }

    componentDidMount() {
        // call the resize handler and register it with the window.
        this.resizeHandler = resizeHandler.bind(this);
        this.resizeHandler();
        window.addEventListener('resize', this.resizeHandler);

        // convert all the target images to RGB arrays which are ready to be sent to the
        // python server
        const target_images = [];
        this.props.app.images.forEach(img_path => target_images.push(produceRGBArray(getImageDataFromURL(img_path))));

        // setup the XHR
        const self = this;
        const xhttp = new XMLHttpRequest();
        xhttp.open('POST', 'http://127.0.0.1:5000/detect', true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200) {
                this.bounding_boxes = JSON.parse(xhttp.responseText);
                self.componentDidUpdate();
            } else if (xhttp.status !== 200) {
                displayErrorDialog('Server error');
                console.error(err);
            }
        };

        // set-up the scene_image field and send off the XHR request.
        try {
            if (this.props.input_options.input == 'scene_image' || this.props.input_options.input == 'webcam') {
                this.createInitialImage(this.props.input_options.path, xhttp, target_images);
            }
        } catch (err) {
            displayErrorDialog('Failed to connect to server');
            console.error(err);
            return;
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeHandler);
    }

    componentDidUpdate() {
        // we can't do anything if the scene_image field hasn't been initialized yet.
        // this shouldn't be true for a noticeable amount of time for the user.
        if (this.scene_image === undefined) return;

        const output_canvas = this.output_canvas_ref.current;
        const output_context = output_canvas.getContext('2d');

        output_canvas.width = this.state.output_width;
        output_canvas.height = this.state.output_height;

        // re-draw the output canvas using the new scaling.
        const temp_canvas = document.createElement('canvas');
        const temp_context = temp_canvas.getContext('2d');

        temp_canvas.width = this.scene_image.naturalWidth;
        temp_canvas.height = this.scene_image.naturalHeight;
        temp_context.drawImage(this.scene_image, 0, 0, temp_canvas.width, temp_canvas.height);

        // if the server has given us bounding box information, we can draw them to the image
        // otherwise, we skip over them for now and now that they will be returned shortly.
        // the user shouldn't have to wait for long at all.
        if (this.bounding_boxes !== undefined) {
            const bounding_box_settings = this.box_settings_ref.current;
            const box_settings = {
                box_count: bounding_box_settings.getNumBoxes(),
                threshold: bounding_box_settings.getThreshold(),
            };
            drawBoundingBoxes(temp_context, this.bounding_boxes, box_settings);
        }

        output_context.drawImage(temp_canvas, 0, 0, output_canvas.width, output_canvas.height);
    }

    /**
     * Given an image URL, XHR object, and list of target images, this method creates an image from
     * the given URL, gets the image's RGB array, then sends and XHR request to the server for the
     * associated bounding boxes. componentDidUpdate is called so that the new image can be drawn
     * for the user to see.
     * @param {String} img_path 
     * @param {XMLHttpRequest} xhttp 
     * @param {*} target_images 
     */
    createInitialImage(img_path, xhttp, target_images) {
        console.log(this);
        const scene_image = new Image();
        scene_image.onload = () => {
            this.scene_image = scene_image;
            const scene = this.getRGBArray(scene_image);
            xhttp.send(JSON.stringify({ scene: scene, targets: target_images }));
            this.componentDidUpdate();
        };
        scene_image.src = img_path;
    }

    /**
     * Given an image object, draw the image to a temporary canvas, then get the
     * canvas' image data in a format which is easily converted by numpy into an
     * array when passed to the backend.
     * @param {Image} img 
     */
    getRGBArray(img) {
        const temp_canvas = document.createElement('canvas');
        const temp_context = temp_canvas.getContext('2d');

        temp_canvas.width = img.naturalWidth;
        temp_canvas.height = img.naturalHeight;
        temp_context.drawImage(img, 0, 0, temp_canvas.width, temp_canvas.height);

        return produceRGBArray(temp_context.getImageData(0, 0, temp_canvas.width, temp_canvas.height));
    }

    render() {
        const self = this;
        return (
            <div className='flexColumn'>
                <canvas className='dontGrow' ref={this.output_canvas_ref}></canvas>
                <div className='flexRow'>
                    <BoundingBoxSettings ref={this.box_settings_ref}></BoundingBoxSettings>
                    <div className='button' onClick={() => self.componentDidUpdate()}>Redraw</div>
                </div>
            </div>
        );
    }
}