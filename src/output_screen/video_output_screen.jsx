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
            <div className='flexRow'>
                <div className='button' onClick={() => displayImageChoiceScreen(props.app)}>Image choice</div>
                <div className='button' onClick={() => displaySceneSelectionScreen(props.app)}>Scene selection</div>
            </div>
        </div>
    );
}

class VideoOutputContainer extends React.Component {
    constructor(props) {
        super(props);
        this.webcam_output_ref = React.createRef();
        this.realtime_video_ref = React.createRef();
        this.box_settings_ref = React.createRef();
        this.target_images = [];
        this.firstFrame = true;
        this.inputQueue = [];
        this.outputQueue = [];
        this.chunks = [];
        this.recorder = undefined;

        this.state = {
            output_width: 0,
            output_height: 0,
        }
    }

    componentWillMount() {
        // calculate the RGB arrays for the target images once so we don't have to
        // every frame of video that we go through
        // the approach here is a bit different from that which we took in output_screen.jsx.
        // instead of assuring ourselves that every image has been converted to an appropriate
        // form before we allow things to get sent to the server, we just send things to the
        // server ASAP. this might mean that the first info sent to the server doesn't
        // have all the target images, but subsequent ones are sure to.
        const self = this;
        this.props.app.images
            .forEach(img_path => getImageDataFromURL(img_path)
            .then(img_data => self.target_images.push(produceRGBArray(img_data))));
    }

    componentDidMount() {
        // call the resize handler and register it with the window.
        this.resizeHandler = resizeHandler.bind(this);
        this.resizeHandler();
        window.addEventListener('resize', this.resizeHandler);

        // capture the stream at 19 FPS
        this.stream = this.realtime_video_ref.current.getCanvas().captureStream(19)
        const options = { mimeType: 'video/webm;codecs=vp9' }

        this.recorder = new MediaRecorder(this.stream, options)
        this.recorder.ondataavailable = this.handleData.bind(this);
    }

    handleData(e) {
        if (e.data.size > 0) {
            this.chunks.push(e.data)
        }
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeHandler);
    }

    handleFrame(imgData) {
        this.inputQueue.push(imgData); // add new image data to the end of the queue
        if (this.firstFrame) {
            this.firstFrame = false;
            this.processFrame();
            this.recorder.start();
        }
    }

    processFrame() {
        const imgData = this.inputQueue.shift(); // take the image data from the front of the queue
        const rtvComp = this.realtime_video_ref.current;
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
                this.outputQueue.push(temp_canvas.toDataURL("image/png"))
                rtvComp.showFrame(temp_canvas);
                if (self.recorder.state === 'recording') {
                    self.recorder.requestData();
                }

                const callback = () => {
                    if (self.inputQueue.length > 0) {
                        self.processFrame();
                    } else {
                        setTimeout(callback, 100);
                    }
                };

                callback();
            } else if (xhttp.status !== 200) {
                displayErrorDialog(`Server error ${xhttp.status}`);
                console.error(xhttp);
            }
        };

        const scene = produceRGBArray(temp_ctx.getImageData(0, 0, temp_canvas.width, temp_canvas.height));
        xhttp.send(JSON.stringify({ scene: scene, targets: this.target_images }));
    }

    render() {
        const self = this;
        return (
            <div className='flexColumn'>
                <div className='flexRow'>
                    <WebcamOutput ref={this.webcam_output_ref} parent={this} width={0} height={0}></WebcamOutput>
                    <RealTimeVideo parent={this} ref={this.realtime_video_ref} width={this.state.output_width} height={this.state.output_height}></RealTimeVideo>
                </div>

                <BoundingBoxSettings ref={this.box_settings_ref}></BoundingBoxSettings>
                <div className='flexRow'>
                    <div className='button' onClick={(e) => {
                        e.target.innerHTML = self.webcam_output_ref.current.pause() ? "Resume video" : "Pause video";
                    }}>Pause video</div>
                    <div id="download_video" className="button" onClick={() => {
                        self.recorder.stop();

                        const blob = new Blob(self.chunks, { type: "video/webm" });
                        const urlObj = URL.createObjectURL(blob)
                        const a = document.createElement('a');

                        document.body.appendChild(a);
                        a.style = 'display: none';
                        a.href = urlObj;
                        a.download = 'test.webm';
                        a.click();
                        
                        self.chunks.length = 0;
                        self.stream = self.realtime_video_ref.current.getCanvas().captureStream(19);

                        const options = { mimeType: 'video/webm;codecs=vp9' };
                        self.recorder = new MediaRecorder(self.stream, options);
                        self.recorder.ondataavailable = self.handleData.bind(self);
                        self.recorder.start();

                        window.URL.revokeObjectURL(urlObj);
                    }}>Save video output</div>
                </div>
            </div>
        );
    }
}

class RealTimeVideo extends React.Component {
    constructor(props) {
        super(props);
        this.canvas_ref = React.createRef();
    }

    getCanvas() {
        return this.canvas_ref.current;
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

export { VideoOutputContainer }