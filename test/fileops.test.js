import React from 'react';
import {readFile} from '../src/control/fileops'

const fs = require('fs') 
/**
 * This file tests the functions defined in the fileops
 */
test('it reads a file', () => {
    const filepath = "assets/test.txt";
    
    const out = readFile(filepath);
    var word = out.toString('ascii')
    expect(word).toEqual("foo");
})