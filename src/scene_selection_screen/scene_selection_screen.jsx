import { displayImageChoiceScreen, displayOutputScreen } from '../entrypoint';
import { displayYesNoDialog, displayImageUploadDialog, displayErrorDialog } from '../control/dialogs';
import React from 'react';

class SceneSelectionScreen extends React.Component {
    render() {
        return (
            <div>
                <SceneSelectionScreenTitle />
                <SceneSelectionContainer app={this.props.app}/>
                <div className='button' onClick={() => displayImageChoiceScreen(this.props.app)}>Image choice</div>
            </div>
        );
    }
}

class SceneSelectionContainer extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            showPictureTaker: false,
            showVideoTaker: false
        };
    }

    handleSceneImageUpload() {
        const img_paths = displayImageUploadDialog();
        if (img_paths === undefined) return;

        const scene_img_path = img_paths[0];
        console.log(`set the scene image: ${scene_img_path}`);
        
        displayOutputScreen(this.props.app, {
            input: 'scene_image',
            path: scene_img_path
        });
    }

    handleWebcam() {
        this.setState({showPictureTaker: true})
    }

    handleVideo(){
        displayOutputScreen(this.props.app, {
            input: 'video'
        });
    }

    render() {
        return (
            <div>
                <div className='button' onClick={() => this.handleSceneImageUpload()}>
                    Upload scene image
                </div>
                <div className='button' onClick={() => this.handleWebcam()}>
                    Take a picture
                </div>
                <div className='button' onClick={() => this.handleVideo()}>
                    Take a video
                </div>
                {this.state.showPictureTaker ? <PictureTaker app={this.props.app}></PictureTaker> : null}
            </div>
        );
    }
}

class WebcamOutput extends React.Component {
    constructor(props){
        super(props)
        this.canvas_ref = React.createRef();
        this.state = {
            currentImg: null,
            width: props.width,
            height: props.height
        };
        this.g = true
    }

    componentDidMount() {
        const canvas = this.canvas_ref.current;
        let prop = { 
            video: true, 
            audio: false
        };
        let state = this.state;
        let self = this;
        let props = this.props
        navigator.mediaDevices.getUserMedia(prop)
                    .then(stream => {
                        const track = stream.getVideoTracks()[0];
                        self.track = track;
                        const track_settings = track.getSettings();
                        const image_capture = new ImageCapture(track);
                        
                        const drawFrame = function(){
                            image_capture.grabFrame().then((imgData) => {
                                canvas.width = state.width;
                                canvas.height = state.height;
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(imgData, 0, 0, state.width, state.height);

                                if (!!props.parent && !!props.parent.handleFrame) {
                                    props.parent.handleFrame(imgData)
                                }
                                //ctx.drawImage(imgData, 0, 0);
                            })

                            const msis = 1000;
                            const target_frame_rate = .3;
                            if (self.g) setTimeout(drawFrame, msis / target_frame_rate);
                        }
                        
                        drawFrame();
                        
                    }).catch((e) => {console.error(e)})
    }

    componentWillUnmount() {
        this.g = false;
        if (this.track){
            this.track.stop();
        }
        
    }
    
    render() {
        return (
            <canvas ref={this.canvas_ref}></canvas> 
        )
    }   
}

class PictureTaker extends React.Component {
    render() {
        return (
            <div>
                <WebcamOutput width={500} height={500}></WebcamOutput>
                <div className='button' onClick={() => {this.takePicture()}}> Grab Frame </div>
            </div>
        )
    }

    takePicture() {
        /* first, check to make sure that the user has a webcam plugged in. 
         * if they have more than one, let them choose which device they'd like to use
         * along with some properties, such as the frame-rate, image height and width, etc.
         */
        // list all the media devices (audio in, out, video in, screen-capture, etc.)
        // for now, i'm just passing the first media device as the one that's been selected
        // along with some basic properties such as height and width
        let self = this;
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const video_devices = devices.filter(device => (device.kind === 'videoinput'));
                console.log(video_devices);

                if (video_devices.length == 0) {
                    displayErrorDialog('no webcams found!');
                } else {
                    navigator.mediaDevices.getUserMedia({audio:false,video:true})
                    .then(stream => {
                        const track = stream.getVideoTracks()[0];
                        const track_settings = track.getSettings();
                        const image_capture = new ImageCapture(track);
                        image_capture.grabFrame().then((imgData) => {
                            let width = track_settings.width;
                            let height = track_settings.height;
                            
                            displayOutputScreen(this.props.app, {
                                input: 'webcam', 
                                id: video_devices[0].deviceId, 
                                media_options: {video: true, audio: false},
                                img: imgData,
                                width: width,
                                height:height
                            });
                        })
                        
                    }).catch((e) => {console.error(e)})
                }
            })
            .catch(err => console.error(err));
    }
}

function SceneSelectionScreenTitle(props) {
    return <h3>Select scene imagery source</h3>;
}

export {SceneSelectionScreen, WebcamOutput};