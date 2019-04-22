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
        this.canvas_ref = React.createRef();
        this.output_canvas_ref = React.createRef();

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
        const xhttp = new XMLHttpRequest();
        xhttp.open('POST', 'http://127.0.0.1:5000/detect', true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.onreadystatechange = () => {
            console.log('got response from server:');
            console.log(xhttp);
            if (xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200) {
                const response = JSON.parse(xhttp.responseText);
                const input_canvas = this.canvas_ref.current;
                const output_canvas = this.output_canvas_ref.current;
                const output_context = output_canvas.getContext('2d');

                output_canvas.width = input_canvas.width;
                output_canvas.height = input_canvas.height;
                output_context.drawImage(input_canvas, 0, 0);

                // for now, we can just pass in an object that allows all boxes to be shown on the image:
                const box_settings = {
                    box_count: 10,
                    threshold: 0,
                }
                drawBoundingBoxes(output_context, response, box_settings);
            } else if (xhttp.status !== 200) {
                displayErrorDialog('Server error');
            }
        };

        try {
            if (this.props.input_options.input == 'scene_image') {
                const tmp_img = new Image();
                tmp_img.onload = () => {
                    const scene = this.drawAndGetRGBArray(tmp_img);
                    xhttp.send(JSON.stringify({ scene: scene, targets: target_images }));
                }
                tmp_img.src = this.props.input_options.path;
            } else if (this.props.input_options.input == 'webcam') {
                const scene = this.drawAndGetRGBArray(this.props.input_options.img);
                xhttp.send(JSON.stringify({ scene: scene, targets: target_images }));
            }
        } catch (err) {
            displayErrorDialog('Failed to connect to server');
            return;
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeHandler);
    }

    drawAndGetRGBArray(img) {
        const input_canvas = this.canvas_ref.current;
        const input_context = input_canvas.getContext('2d');

        input_canvas.width = this.state.output_width;
        input_canvas.height = this.state.output_height;
        input_context.drawImage(img, 0, 0, input_canvas.width, input_canvas.height);

        return input_context;
    }

    componentDidUpdate() {
        let tmp_canvas = document.createElement('canvas');
        tmp_canvas.width = this.state.output_width;
        tmp_canvas.height = this.state.output_height;
        let tmp_ctx = tmp_canvas.getContext('2d');
        const input_canvas = this.canvas_ref.current;
        
        tmp_ctx.drawImage(input_canvas, 0, 0, tmp_canvas.width, tmp_canvas.height);
        input_canvas.width = this.state.output_width;
        input_canvas.height = this.state.output_height;
        const input_context = input_canvas.getContext('2d');
        input_context.drawImage(tmp_canvas, 0, 0, tmp_canvas.width, tmp_canvas.height);

        const output_canvas = this.output_canvas_ref.current;
        tmp_ctx.drawImage(output_canvas, 0, 0, tmp_canvas.width, tmp_canvas.height);
        output_canvas.width = this.state.output_width;
        output_canvas.height = this.state.output_height;
        const output_context = output_canvas.getContext('2d');
        output_context.drawImage(tmp_canvas, 0, 0, tmp_canvas.width, tmp_canvas.height);
    }

    render() {
        return (
            <div className='flexColumn'>
                <div className='videoOutput'>
                    <canvas className='dontGrow' ref={this.canvas_ref}></canvas>
                    <canvas className='dontGrow' ref={this.output_canvas_ref}></canvas>
                </div>
            </div>
        );
    }
}