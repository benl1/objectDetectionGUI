import { displayImageChoiceScreen, displaySceneSelectionScreen } from '../entrypoint';
import { drawBoundingBoxes, resizeHandler, BoundingBoxSettings } from './common';
import { WebcamOutput } from '../scene_selection_screen/scene_selection_screen';
import { getImageDataFromURL, produceRGBArray } from '../control/imageops';
import { displayErrorDialog } from '../control/dialogs';
import React from 'react';

export default function VideoOutputScreen(props) {
    return (
        <div className='flexColumn'>
            <VideoOutputContainer app={props.app}></VideoOutputContainer>
            <div className='button' onClick={() => displayImageChoiceScreen(props.app)}>Image choice</div>
            <div className='button' onClick={() => displaySceneSelectionScreen(props.app)}>Scene selection</div>
        </div>
    );
}

class VideoOutputContainer extends React.Component {
    constructor(props) {
        super(props);
        this.webcam_output_ref = React.createRef();
        this.realtime_video_ref = React.createRef();
        this.box_settings_ref = React.createRef();
        this.firstFrame = true;
        this.inputQueue = [];
        this.outputQueue = [];

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

        // calculate the RGB arrays for the target images once so we don't have to
        // every frame of video that we go through
        const target_images = [];
        this.props.app.images.forEach(img_path => target_images.push(produceRGBArray(getImageDataFromURL(img_path))));
        this.target_images = target_images;
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeHandler);
    }

    handleFrame(imgData) {
        this.inputQueue.push(imgData); // add new image data to the end of the queue
        if (this.firstFrame) {
            this.firstFrame = false;
            this.processFrame();
        }
    }

    processFrame() {
        const imgData = this.inputQueue.shift(); // take the image data from the front of the queue
        const rtvComp = this.realtime_video_ref.current;
        const target_images = this.target_images;
        const self = this;

        // draw the image data to a canvas
        const temp_canvas = document.createElement("canvas");
        temp_canvas.width = imgData.width;
        temp_canvas.height = imgData.height;
        const temp_ctx = temp_canvas.getContext('2d');
        temp_ctx.drawImage(imgData, 0, 0, temp_canvas.width, temp_canvas.height);

        // prepare the rest call
        const xhttp = new XMLHttpRequest();
        xhttp.open('POST', 'http://127.0.0.1:5000/detect', true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200) {
                const response = JSON.parse(xhttp.responseText);
                const box_settings = {
                    box_count: this.box_settings_ref.current.getNumBoxes(),
                    threshold: this.box_settings_ref.current.getThreshold(),
                }
                drawBoundingBoxes(temp_ctx, response, box_settings);
                rtvComp.showFrame(temp_canvas);

                //self.outputQueue.unshift(imgData);

                const callback = () => {
                    if (self.inputQueue.length > 0) {
                        self.processFrame();
                    } else {
                        setTimeout(callback, 100);
                    }
                };

                callback();
            } else {
                if (xhttp.status !== 200)
                    displayErrorDialog('Server error');
            }
        };

        const scene = produceRGBArray(temp_ctx.getImageData(0, 0, temp_canvas.width, temp_canvas.height));
        xhttp.send(JSON.stringify({ scene: scene, targets: target_images }));
    }

    render() {
        const self = this;
        return (
        <div className='flexColumn'>
            <div className='videoOutput'>
                <WebcamOutput showPausedButton={true} ref={this.webcam_output_ref} parent={this} width={this.state.output_width} height={this.state.output_height}></WebcamOutput>
                <RealTimeVideo parent={this} ref={this.realtime_video_ref} width={this.state.output_width} height={this.state.output_height}></RealTimeVideo>
            </div>
            <div className='button' onClick={(e) =>{
                e.target.innerHTML = self.webcam_output_ref.current.pause() ? "Resume video" : "Pause video";
            }}>Pause video</div>
            <BoundingBoxSettings ref={this.box_settings_ref}></BoundingBoxSettings>
        </div>
        );
    }
}

class RealTimeVideo extends React.Component {
    constructor(props) {
        super(props);
        this.canvas_ref = React.createRef();
    }

    componentDidMount() {
        const canvas = this.canvas_ref.current;
        canvas.width = this.props.width;
        canvas.height = this.props.height;

        const ctx = canvas.getContext('2d');
        const load = new Image();
        load.onload = () => ctx.drawImage(load, 0, 0, canvas.width, canvas.height);
        load.src = "./assets/loading.jpg";
    }

    showFrame(imgData) {
        const canvas = this.canvas_ref.current;
        canvas.width = this.props.width;
        canvas.height = this.props.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgData, 0, 0, canvas.width, canvas.height);
    }

    render() {
        return <div><canvas ref={this.canvas_ref}></canvas></div>;
    }
}