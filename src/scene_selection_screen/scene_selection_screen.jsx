import { displayImageChoiceScreen, displayOutputScreen, displayVideoOutputScreen } from '../entrypoint';
import { displayImageUploadDialog, displayErrorDialog } from '../control/dialogs';
import React from 'react';
import { countVideoDevices } from '../control/webcam';

class SceneSelectionScreen extends React.Component {
    render() {
        return (
            <div className='flexColumn'>
                <h3>Select scene imagery source</h3>
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

    /**
     * Called when the user clicks on the 'Upload scene image' button.
     */
    handleSceneImageUpload() {
        const img_paths = displayImageUploadDialog();
        if (img_paths === undefined) return;

        const scene_img_path = img_paths[0];
        console.log(`set the scene image: ${scene_img_path}`);

        displayOutputScreen(this.props.app, {
            input: 'scene_image',
            path: scene_img_path,
        });
    }

    /**
     * Called when the user clicks on the 'Take a picture' button.
     */
    handleWebcam() {
        const self = this;
        countVideoDevices().then(count => {
            if (count > 0) {
                self.setState({ showPictureTaker: true });
            } else {
                displayErrorDialog('No webcams detected');
            }
        });
    }

    /**
     * Called when the user clicks on the 'Take a video' button.
     */
    handleVideo() {
        countVideoDevices().then(count => {
            if (count > 0) {
                displayVideoOutputScreen(this.props.app);
            } else {
                displayErrorDialog('No webcams detected');
            }
        });
    }

    captureHandler(img_data) {
        // draw the img_data, which is a bitmap to a canvas, then pass the data_url to
        // the output screen for handling.
        const temp_canvas = document.createElement('canvas');
        const temp_context = temp_canvas.getContext('2d');
        temp_canvas.width = img_data.width;
        temp_canvas.height = img_data.height;
        temp_context.drawImage(img_data, 0, 0);

        displayOutputScreen(this.props.app, {
            input: 'webcam',
            path: temp_canvas.toDataURL(),
        });
    }

    render() {
        return (
            <div className='flexColumn'>
                <div className='button' onClick={() => this.handleSceneImageUpload()}>Upload scene image</div>
                <div className='button' onClick={() => this.handleWebcam()}>Take a picture</div>
                <div className='button' onClick={() => this.handleVideo()}>Take a video</div>
                {this.state.showPictureTaker ? <PictureTaker handleCapture={this.captureHandler.bind(this)}></PictureTaker> : null}
            </div>
        );
    }
}

class WebcamOutput extends React.Component {
    constructor(props) {
        super(props)
        this.canvas_ref = React.createRef();
        this.is_running = true;
        this.paused = false;
    }

    componentDidMount() {
        const canvas = this.canvas_ref.current;
        const media_settings = { video: true, audio: false };
        const ms_in_s = 1000;
        const target_frame_rate = 19;
        const self = this;
        const props = this.props

        const ready_webcam = () => {
            navigator.mediaDevices.getUserMedia(media_settings)
                .then(stream => {
                    // get the video track associated with the stream coming from the webcam
                    const track = stream.getVideoTracks()[0];
                    const image_capture = new ImageCapture(track);
                    self.track = track;

                    const drawFrame = function () {
                        // a frame cannot be captured from a muted track. return or else face an error
                        // complaining about the track being in an invalid state
                        if (track.muted) return;

                        image_capture.grabFrame().then((imgData) => {
                            const ctx = canvas.getContext('2d');
                            canvas.width = self.props.width;
                            canvas.height = self.props.height;
                            ctx.drawImage(imgData, 0, 0, self.props.width, self.props.height);

                            if (!!props.parent && !!props.parent.handleFrame && !self.paused) {
                                props.parent.handleFrame(imgData)
                            }
                        }).catch((err) => console.error(err));

                        if (self.is_running) {
                            setTimeout(drawFrame, ms_in_s / target_frame_rate);
                        }
                    };

                    // when the track has been muted, re-start the whole video sha-bang,
                    // ideally, we could handle this more elegantly, but chrome never
                    // passes onunmute events, so this is the best we can do.
                    track.onmute = () => {
                        console.log('track has been muted');
                        track.stop();
                        self.track = undefined;
                        ready_webcam();
                    };

                    drawFrame(); // start drawing frames!
                }).catch((err) => {
                    displayErrorDialog('Error connecting to a webcam');
                    console.error(err);
                });
        };

        ready_webcam();
    }

    componentWillUnmount() {
        this.is_running = false;
        if (this.track) this.track.stop();
    }

    pause() {
        this.paused = !this.paused;
        return this.paused;
    }

    render() {
        return <canvas ref={this.canvas_ref} ></canvas>;
    }
}

class PictureTaker extends React.Component {
    takePicture() {
        navigator.mediaDevices.getUserMedia({ audio: false, video: true })
            .then(stream => {
                const track = stream.getVideoTracks()[0];
                const track_settings = track.getSettings();
                const image_capture = new ImageCapture(track);

                image_capture.grabFrame().then((img_data) => {
                    /* allow the location where this was constructed to decide 
                    * what to do with the captured image */
                    this.props.handleCapture(img_data, track_settings);
                    track.stop(); // we've finished using the track and can now stop it.
                    // if we hadn't stopped the track, the webcam would remain on and
                    // we would have trouble opening it if we clicked on a different
                    // webcam-related button in the application.
                });
            })
            .catch((err) => console.error(err));
    }

    render() {
        return (
            <div className='flexColumn'>
                <WebcamOutput width={500} height={500}></WebcamOutput>
                <div className='button' onClick={() => { this.takePicture() }}> Grab Frame </div>
            </div>
        )
    }
}

export { SceneSelectionScreen, WebcamOutput, PictureTaker };