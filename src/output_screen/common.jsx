import React from 'react';

function drawBoundingBoxes(context, json_response, box_settings) {
    const setting_box_count = box_settings['box_count'];
    const num_boxes = Math.min(json_response['boxes'].length, setting_box_count);
    context.strokeStyle = 'red';

    // draw the bounding boxes and their associated scores to the scene image
    for (let i = 0; i < num_boxes; i++) {
        const [top_x, top_y, bot_x, bot_y] = json_response['boxes'][i];
        const confidence = json_response['scores'][i];
        if (confidence < box_settings['threshold']) continue;
        const height = bot_y - top_y;

        context.strokeRect(top_x, top_y, bot_x, bot_y);
        context.strokeText(`${confidence}`, top_x + 5, top_y + height / 2);
    }
}

function resizeHandler() {
    const output_width = window.innerWidth * .5;
    const output_height = window.innerHeight * .75;
    this.setState({
        output_width: output_width,
        output_height: output_height,
    });
    this.state.output_width = output_width;
    this.state.output_height = output_height;
}

class BoundingBoxSettings extends React.Component {
    constructor(props) {
        super(props);
        this.box_count_ref = React.createRef();
        this.threshold_ref = React.createRef();
    }

    getNumBoxes() {
        return this.box_count_ref.current.value;
    }

    getThreshold() {
        const parse_result = parseFloat(this.threshold_ref.current.value);
        return isNaN(parse_result) ? 0.5 : parse_result;
    }

    render() {
        return (
            <div>
                <label>Number of boxes:</label>
                <input type='number' min='1' max='10' defaultValue='5' ref={this.box_count_ref}></input>
                <label>Min threshold:</label>
                <input type='text' defaultValue='0.5' ref={this.threshold_ref}></input>
            </div>
        );
    }
}

export { drawBoundingBoxes, resizeHandler, BoundingBoxSettings };