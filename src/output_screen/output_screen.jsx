import { displayImageChoiceScreen, displaySceneSelectionScreen } from '../entrypoint';
import React from 'react';

export default class OutputScreen extends React.Component {
    render() {
        return (
            <div>
                <OutputScreenContainer />
                <div className='button' onClick={() => displayImageChoiceScreen(this.props.app)}>Image choice</div>
                <div className='button' onClick={() => displaySceneSelectionScreen(this.props.app)}>Scene selection</div>
            </div>
        );
    }
}

class OutputScreenContainer extends React.Component {
    render() {
        return (
            <div>
                Here is where a canvas will render frames.
            </div>
        );
    }
}