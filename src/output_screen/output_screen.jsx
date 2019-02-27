import { displayImageChoiceScreen } from '../entrypoint';
import React from 'react';

export default class OutputScreen extends React.Component {
    render() {
        return (<div>
            <div>This is the output screen, where frames will be displayed.</div>
            <div className='button' onClick={() => displayImageChoiceScreen(this.props.app)}>Image choice</div>
        </div>);
    }
}