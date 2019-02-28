from flask import Flask
from flask import jsonify
import numpy as np


app = Flask(__name__)

@app.route('/detect', methods=['POST', 'GET'])
def object_detector():
    #assume images are numpy arrays here
    num_rows = 1000
    num_cols = 1000
    # num_rows = scene_image.shape[0]
    # num_cols = scene_image.shape[1]
    boxes = [[0,0,num_cols//4, num_rows//4],[num_cols//2,num_rows//2,num_cols-1,num_rows-1]]
    scores = [.8,.4]
    returned = {}
    returned["boxes"] = boxes
    returned["scores"] = scores
    return jsonify(returned)


if __name__ == '__main__':
    app.run()
