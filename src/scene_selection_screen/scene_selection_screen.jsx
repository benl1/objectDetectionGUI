import { displayImageChoiceScreen, displayOutputScreen, displayVideoOutputScreen } from '../entrypoint';
import { displayYesNoDialog, displayImageUploadDialog, displayErrorDialog } from '../control/dialogs';
import React from 'react';

class SceneSelectionScreen extends React.Component {
    render() {
        return (
            <div>
                <SceneSelectionScreenTitle />
                <SceneSelectionContainer app={this.props.app} />
                <div className='button' onClick={() => displayImageChoiceScreen(this.props.app)}>Image choice</div>
            </div>
        );
    }
}

class SceneSelectionContainer extends React.Component {
    constructor(props) {
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
        this.setState({ showPictureTaker: true })
    }

    handleVideo() {
        displayVideoOutputScreen(this.props.app);
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
    constructor(props) {
        super(props)
        this.canvas_ref = React.createRef();
        this.is_running = true;
    }

    componentDidMount() {
        const canvas = this.canvas_ref.current;
        const media_settings = { video: true, audio: false };
        const self = this;
        const props = this.props
        navigator.mediaDevices.getUserMedia(media_settings)
            .then(stream => {
                const drawFrame = function () {
                    const track = stream.getVideoTracks()[0];
                    self.track = track;
                    const image_capture = new ImageCapture(track);

                    image_capture.grabFrame().then((imgData) => {
                        canvas.width = self.props.width;
                        canvas.height = self.props.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(imgData, 0, 0, self.props.width, self.props.height);

                        if (!!props.parent && !!props.parent.handleFrame) {
                            props.parent.handleFrame(imgData)
                        }
                    })

                    const ms_in_s = 1000;
                    const target_frame_rate = 10;
                    if (self.is_running) setTimeout(drawFrame, ms_in_s / target_frame_rate);
                }

                drawFrame();
            }).catch((e) => { displayErrorDialog('Failed to connect to webcam.') })
    }

    componentWillUnmount() {
        this.is_running = false;
        if (this.track) this.track.stop();
    }

    render() {
        return <canvas ref={this.canvas_ref}></canvas>;
    }
}

class PictureTaker extends React.Component {
    render() {
        return (
            <div>
                <WebcamOutput width={500} height={500}></WebcamOutput>
                <div className='button' onClick={() => { this.takePicture() }}> Grab Frame </div>
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
                    navigator.mediaDevices.getUserMedia({ audio: false, video: true })
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
                                    media_options: { video: true, audio: false },
                                    img: imgData,
                                    width: width,
                                    height: height
                                });
                            })

                        }).catch((e) => { console.error(e) })
                }
            })
            .catch(err => console.error(err));
    }
}

function SceneSelectionScreenTitle(props) {
    return <h3>Select scene imagery source</h3>;
}

export { SceneSelectionScreen, WebcamOutput };