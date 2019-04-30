// image_choice_screen.test.js
import React from 'react';
import { getImageDataFromURL, produceRGBArray } from '../src/control/imageops';
const fs = require('fs') 

describe('Video output screen', () => {
    const path = "<rootDir>/assets/robot.jpg"
    var imageData;
    // resolve async method
    beforeAll(() => getImageDataFromURL(path).then(response => {
        imageData = response;
    }));

    it('test that imageops functions work', async()=>{
        //check what imageData value currently is
        console.log(imageData)
        // first time we run this write the data to a file
        // after we have the data should change this part to compare function results with data in the written files
        fs.writeFile('image_data.txt', imageData, (err) => { 
            // In case of a error throw err. 
            if (err) throw err; 
        })
        // wr
        fs.writeFile('image_url.txt', (produceRGBArray(imageData)), (err) => { 
            // In case of a error throw err. 
            if (err) throw err; 
        })
    })

});