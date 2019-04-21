function drawBoundingBoxes(context, json_response) {
    const num_boxes = json_response['boxes'].length;
    context.strokeStyle = 'red';

    // draw the bounding boxes and their associated scores to the scene image
    for (let i = 0; i < num_boxes; i++) {
        const [top_x, top_y, bot_x, bot_y] = json_response['boxes'][i];
        const confidence = json_response['scores'][i];
        const height = bot_y - top_y;

        context.strokeRect(top_x, top_y, bot_x, bot_y);
        context.strokeText(`${confidence}`, top_x + 5, top_y + height / 2);
    }
}

function resizeHandler(self) {
    console.log('got a resize request');
    const output_width = window.innerWidth * .5;
    const output_height = window.innerHeight * .75;
    console.log(self);
    self.setState({
        output_width: output_width,
        output_height: output_height,
    });
}

export { drawBoundingBoxes, resizeHandler };