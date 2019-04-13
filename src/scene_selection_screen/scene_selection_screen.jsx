import { displayImageChoiceScreen, displayOutputScreen } from '../entrypoint';
import { displayYesNoDialog, displayImageUploadDialog, displayErrorDialog } from '../control/dialogs';
import React from 'react';

export default class SceneSelectionScreen extends React.Component {
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
        /* first, check to make sure that the user has a webcam plugged in. 
         * if they have more than one, let them choose which device they'd like to use
         * along with some properties, such as the frame-rate, image height and width, etc.
         */
        // list all the media devices (audio in, out, video in, screen-capture, etc.)
        // for now, i'm just passing the first media device as the one that's been selected
        // along with some basic properties such as height and width
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const video_devices = devices.filter(device => (device.kind === 'videoinput'));
                console.log(video_devices);

                if (video_devices.length == 0) {
                    displayErrorDialog('no webcams found!');
                } else {
                    displayOutputScreen(this.props.app, {
                        input: 'webcam', 
                        id: video_devices[0].deviceId, 
                        media_options: {video: true, audio: false}
                    });
                }
            })
            .catch(err => console.error(err));
    }

    render() {
        return (
            <div>
                <div className='button' onClick={() => this.handleSceneImageUpload()}>
                    Upload scene image
                </div>
                <div className='button' onClick={() => this.handleWebcam()}>
                    Use a webcam
                </div>
            </div>
        );
    }
}

function SceneSelectionScreenTitle(props) {
    return <h3>Select scene imagery source</h3>;
}