import { displayImageChoiceScreen, displaySceneSelectionScreen } from '../entrypoint';
import { getImageDataFromURL, produceRGBArray } from '../control/imageops';
import { displayErrorDialog } from '../control/dialogs';
import React from 'react';
import { WebcamOutput } from '../scene_selection_screen/scene_selection_screen';

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
        this.output_canvas_ref = React.createRef();
        this.webcamOutputRef = React.createRef();
        this.realtimevideoRef = React.createRef(); 

        this.processingFrame = false;
        this.inputQueue = [];
        this.outputQueue = [];

        this.firstFrame = true;
    }

    /**
     * The changes made here are based on this link: 
     */
    componentDidMount() {
        const xhttp = new XMLHttpRequest();
        const target_images = [];
    
        // convert image paths to arrays of image data
        this.props.app.images.forEach(img_path => target_images.push(produceRGBArray(getImageDataFromURL(img_path))));
        this.targetsProcessed = target_images;
    
        // setup the XHR
        xhttp.open('POST', 'http://127.0.0.1:5000/detect', true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200) {
                const response = JSON.parse(xhttp.responseText);
                const cv = this.canvas_ref.current;
                const ctx = this.canvas_ref.current.getContext('2d');
                const num_boxes = response['boxes'].length;
                console.log(response);

                

                const cvOut = this.output_canvas_ref.current;
                const ctxOut = cvOut.getContext('2d');
                cvOut.width = cv.width;
                cvOut.height = cv.height;
                ctxOut.strokeStyle = 'red';
                ctxOut.drawImage(cv, 0, 0)
                // draw the bounding boxes and their associated scores to the scene image
                for (let i = 0; i < num_boxes; i++) {
                    const [top_x, top_y, bot_x, bot_y] = response['boxes'][i];
                    const confidence = response['scores'][i];
                    const height = bot_y - top_y;

                    ctxOut.strokeRect(top_x, top_y, bot_x, bot_y);
                    ctxOut.strokeText(`${confidence}`, top_x + 5, top_y + height / 2);
                }
            } else if (xhttp.status === 400) {
                displayErrorDialog('server responded with 400.');
            } else {
               // displayErrorDialog(`status: ${xhttp.status}, text: ${xhttp.responseText}`);
            }
        };
        let self = this;
        try {
            if (this.props.input_options.input == 'scene_image') {
                const tmp_img = new Image();
                tmp_img.onload = function(){

                    const canvas = self.canvas_ref.current;
                    
                    canvas.height = tmp_img.height;

                    canvas.width = window.innerWidth * .5;
                    canvas.height = window.innerHeight * .75;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(tmp_img, 0, 0, canvas.width, canvas.height);
                    
                    const scene = produceRGBArray(ctx.getImageData(0, 0, canvas.width, canvas.height));
                    xhttp.send(JSON.stringify({ scene: scene, targets: target_images }));
                }
                tmp_img.src = this.props.input_options.path;
            } else if (this.props.input_options.input == 'webcam') {
                const canvas = this.canvas_ref.current;
                canvas.width = this.props.input_options.width;
                canvas.height = this.props.input_options.height;

                // draw the image to the canvas
                const ctx = canvas.getContext('2d');
                ctx.drawImage(this.props.input_options.img, 0, 0, canvas.width, canvas.height, 0, 0, 450, 450);

                // produce an RGB array from the image drawn to the canvas and send it along
                // to the server for object detection
                const scene = produceRGBArray(ctx.getImageData(0, 0, canvas.width, canvas.height));
                xhttp.send(JSON.stringify({ scene: scene, targets: [scene] }));
            } else if (this.props.input_options.input == 'video') {
                
            }
        } catch (err) {
            console.log(err);
            displayErrorDialog('failed to connect to server');
            return; // TODO: for now we can just return prematurely
        }
    }

    handleFrame(imgData){
        this.inputQueue.push(imgData);
        if (this.firstFrame){
            this.processFrame(imgData);
            this.firstFrame = false;
        }
        
    }

    processFrame(imgData) {
        this.processingFrame = true;
        let rtvComp = this.realtimevideoRef.current;
        
        //first we need to prepare the rest call
        const xhttp = new XMLHttpRequest();
        let target_images = this.targetsProcessed;
        

        xhttp.open('POST', 'http://127.0.0.1:5000/detect', true);
        xhttp.setRequestHeader('Content-Type', 'application/json');

        let self = this;

        xhttp.onreadystatechange = () => {
            if (xhttp.readyState === XMLHttpRequest.DONE && xhttp.status === 200) {
                console.log("got frame back")
              rtvComp.showFrame(imgData);
              self.inputQueue.pop();
              self.outputQueue.unshift(imgData);
              if (self.inputQueue.length > 0) {
                self.processFrame(self.inputQueue[self.inputQueue.length - 1]);
              } else {
                  setTimeout(() => {self.processFrame(self.inputQueue[self.inputQueue.length - 1])}, 100);
              }
              self.processingFrame = false;
            } else if (xhttp.status === 400) {
                displayErrorDialog('server responded with 400.');
            } else {
               // displayErrorDialog(`status: ${xhttp.status}, text: ${xhttp.responseText}`);
            }
        };
        let tempCanvas = document.createElement("canvas");
        tempCanvas.width = imgData.width; tempCanvas.height=imgData.height;
        let tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(imgData, 0, 0, tempCanvas.width, tempCanvas.height);
        const scene = produceRGBArray(tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height));
        xhttp.send(JSON.stringify({ scene: scene, targets: target_images }));
        //console.log(rtvComp);
    }

    render() {
        if (this.props.input_options.input === 'scene_image' || this.props.input_options.input === 'webcam') {
            return (
                <div className='videoOutput'>
                    <canvas className='dontGrow' ref={this.canvas_ref}/> 
                    <canvas className='dontGrow' ref={this.output_canvas_ref}/>
                </div>
            );
        } else {
            return (
                <div className='videoOutput'>
                    <WebcamOutput ref={this.webcamOutputRef} parent={this} width={window.innerWidth * .5} height={window.innerHeight * .75}></WebcamOutput>
                    <RealTimeVideo parent={this} ref={this.realtimevideoRef} width={window.innerWidth * .5} height={window.innerHeight * .75}></RealTimeVideo>
                </div>
            );
        }
    }
}

class RealTimeVideo extends React.Component {
    constructor(props){
        super(props);
        this.width = props.width;
        this.height = props.height;

        this.canvas_ref = React.createRef();
    }

    componentDidMount(){
        let canvas = this.canvas_ref.current;

        canvas.width = window.innerWidth * .5;
        canvas.height = window.innerHeight * .75;

        let ctx = canvas.getContext('2d');
        let load = new Image();
        

        load.onload = function(){
            ctx.drawImage(load, 0, 0, canvas.width, canvas.height);
        }
        load.src = "./assets/loading.png";
    }
    
    showFrame(imgData){
        let canvas = this.canvas_ref.current;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(imgData, 0, 0, canvas.width, canvas.height);
    }

    render() {
        return (
            <div>
                <canvas ref={this.canvas_ref}></canvas>
            </div>
            
            )
    }
}