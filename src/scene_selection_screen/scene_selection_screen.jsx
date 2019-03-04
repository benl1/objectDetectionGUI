import { displayImageChoiceScreen, displayOutputScreen } from '../entrypoint';
import { displayYesNoDialog, displayImageUploadDialog } from '../control/dialogs';
import React from 'react';

export default class SceneSelectionScreen extends React.Component {
    render() {
        return (
            <div>
                <SceneSelectionScreenTitle />
                <SceneSelectionContainer />
                <div className='button' onClick={() => displayImageChoiceScreen(this.props.app)}>Image choice</div>
                <div className='button' onClick={() => displayOutputScreen(this.props.app)}>Output</div>
            </div>
        );
    }
}

class SceneSelectionContainer extends React.Component {
    render() {
        return (
            <div>
                <div
                    className='button'
                    onClick={() => displayImageUploadDialog()}
                >
                    Upload a scene
                </div>
                <div
                    className='button'
                    onClick={() => displayYesNoDialog('we still need to get webcam interop working.')}
                >
                    Use your webcam
                </div>
            </div>
        );
    }
}

function SceneSelectionScreenTitle(props) {
    return <h3>Select scene imagery source</h3>;
}