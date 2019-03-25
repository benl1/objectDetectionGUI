import { displayImageChoiceScreen, displaySceneSelectionScreen } from '../entrypoint';
import React from 'react';

export default class OutputScreen extends React.Component {
    constructor(props){
        super(props)
        var holder = [props.canvases[0]]
        this.state = {
            canvases: holder.map((ele, index) => <CanvasEle canvas={ele} key={index} />)
        } 
        console.log(this.state.canvases)
    }

    render() {
        var self = this
        return (
            <div>
                <OutputScreenContainer />
                <div className='button' onClick={() => displayImageChoiceScreen(this.props.app)}>Image choice</div>
                <div className='button' onClick={() => displaySceneSelectionScreen(this.props.app, self)}>Scene selection</div>
                <div className="outputImage">
                    {this.state.canvases}
                </div>
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

 class CanvasEle extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            canvas: props.canvas
        }
    }

    render() {
        var canvas = <canvas ref="canvas" width={300} height={300}/>
        canvas.getContext("2d").putImageData(this.state.canvas.getContext("2d").getImageData(0, 0, this.state.canvas.width, this.state.canvas.height), 0, 0)
        return (
            <div>
                {canvas}
            </div>
        );
    }
}