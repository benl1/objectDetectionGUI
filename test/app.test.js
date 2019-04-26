/**
 * This file tests the functions from /src/control/app.jsx
 */
import React from 'react';
import App from '../src/control/app.jsx';

test('add images', () => {
    const app = new App();
    app.addImage("test.png");

    expect(app.image_key).toBe(1);
});

test('remove images', () => {
    const app = new App();  
    app.addImage("test.png");
    app.addImage("test2.png");
    app.removeImage("test.png");
  
    expect(app.images).toEqual(["test2.png"]);
    expect(app.images.length).toBe(1);
});

test('remove all images', () => {
    const app = new App();
    app.addImage("test.png");
    app.addImage("test2.png");
    app.addImage("test3.png");
    app.removeAllImages()

    expect(app.image_key).toBe(0);
    expect(app.images.length).toBe(0);
    expect(app.images).toEqual([]);
});

test('return images', () => {
    const app = new App();
    app.addImage("test.png");
    app.addImage("test2.png");
    app.addImage("test3.png");

    expect(app.getImages()).toEqual(["test.png","test2.png","test3.png"]);
});