import { displayImageChoiceScreen, displayOutputScreen } from '../entrypoint';
import React from 'react';

export default class SceneSelectionScreen extends React.Component {
    render() {
        return (
            <div>
                <div>This is the scene selection screen!</div>
                <div className='button' onClick={() => displayImageChoiceScreen(this.props.app)}>Image choice</div>
                <div className='button' onClick={() => displayOutputScreen(this.props.app)}>Output</div>
            </div>
        );
    }
}