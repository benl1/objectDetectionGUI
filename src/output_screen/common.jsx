import React from 'react';

/**
 * Render the bounding boxes contained within the json_response which meet the criteria in
 * box_settings to the given graphics context.
 * @param {CanvasRenderingContext2D} context 
 * @param {Object} json_response 
 * @param {Object} box_settings 
 */
function drawBoundingBoxes(context, json_response, box_settings) {
    const setting_box_count = box_settings['box_count'];
    const threshold = box_settings['threshold'];
    const boxes = json_response['boxes'];
    const scores = json_response['scores'];
    const boxes_and_scores = [];

    // create an array which is made up of 'tuples' (arrays of 2) of the form [box info, confidence score for box]
    for (let i = 0; i < boxes.length; i++) {
        boxes_and_scores.push([boxes[i], scores[i]]);
    }

    // sort the array of boxes and scores based on the confidence score for the box. tuples with a 
    // higher confidence value should be closer to the 0 index of the array. tuples with a lower
    // confidence value should be closer to the end of the array.
    const sorted_boxes_and_scores = boxes_and_scores.sort((pair1, pair2) => pair2[1] - pair1[1]);
    const results = [];

    // iterate through the sorted boxes and scores array. find all boxes which have a confidence
    // score greater than or equal to the given threshold and limit the number of boxes which
    // are added by the setting_box_count variable.
    let added_count = 0;
    for (let i = 0; i < boxes.length && added_count < setting_box_count; i++) {
        if (sorted_boxes_and_scores[i][1] >= threshold) {
            results.push(sorted_boxes_and_scores[i]);
            added_count++;
        } else {
            break;
        }
    }

    context.strokeStyle = 'red';
    context.font = '16px Verdana';

    // draw the bounding boxes and their associated scores to the scene image
    for (let i = 0; i < results.length; i++) {
        const current_result = results[i];
        const [top_x, top_y, bot_x, bot_y] = current_result[0]; // de-structuring!
        const confidence = current_result[1];

        context.strokeRect(top_x, top_y, bot_x, bot_y);
        context.strokeText(`${(confidence).toFixed(2)}`, top_x + 5, top_y + 5);
    }
}

/**
 * Used by the two output screens to change the size of the image or video when
 * the screen is resized. This is accomplished by setting state within the appropriate
 * object to be half the window's current width and three quarters of its current
 * height. 
 */
function resizeHandler() {
    const output_width = window.innerWidth * .5;
    const output_height = window.innerHeight * .75;
    this.setState({
        output_width: output_width,
        output_height: output_height,
    });
}

/**
 * Used on both of the output screens to customize the bounding boxes which are shown
 * on top of the image or video. 
 */
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
        // if the user has entered something invalid, return 0.5.
        return isNaN(parse_result) ? 0.5 : parse_result;
    }

    render() {
        return (
            <div>
                <label>Number of boxes:</label>
                <input type='number' min='1' max='10' defaultValue='5' ref={this.box_count_ref}></input>
                <label>Min threshold:</label>
                <input type='number' min='0' max='1' defaultValue='0.5' step='0.01' ref={this.threshold_ref}></input>
            </div>
        );
    }
}

export { drawBoundingBoxes, resizeHandler, BoundingBoxSettings };