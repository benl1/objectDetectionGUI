// image_choice_screen.test.js
import React from 'react';
import { getImageDataFromURL, produceRGBArray } from '../src/control/imageops';
import { exportAllDeclaration } from '@babel/types';
const fs = require('fs') 


describe('Video output screen', () => {
    
    // var imageData;
    jest.setTimeout(20000)
    // resolve async method
    //beforeAll(() => getImageDataFromURL(path).then(response => {
    //    imageData = response;
    });

    // it('test that imageops functions work', ()=>{
    //     //check what imageData value currently is
    //     const path = "<rootDir>/assets/robot.jpg"
    //     return getImageDataFromURL(path).then(data => {
            
    //         fs.writeFile('image_data.txt', data, (err))
    //         if (err) throw err;
    //         fs.writeFile('image_url.txt', (produceRGBArray(data), (err)))
    //         if (err) throw err;   
    //     })
    //     // console.log(imageData)
    //     // // first time we run this write the data to a file
    //     // // after we have the data should change this part to compare function results with data in the written files
    //     // fs.writeFile('image_data.txt', imageData, (err) => { 
    //     //     // In case of a error throw err. 
    //     //     if (err) throw err; 
    //     // })
    //     // // wr
    //     // fs.writeFile('image_url.txt', (produceRGBArray(imageData)), (err) => { 
    //     //     // In case of a error throw err. 
    //     //     if (err) throw err; 
    //     // })
    // })

    test('test that imageops functions work', async () => {
        const path = "<rootDir>/assets/robot.jpg"
        const data = await getImageDataFromURL(path)
        fs.writeFile('image_data.txt', data, (err))
        if (err) throw err;
        fs.writeFile('image_url.txt', (produceRGBArray(data), (err)))
        if (err) throw err;   
    })

// });