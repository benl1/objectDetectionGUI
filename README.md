# Electron App for Object Detection

## Current build and run process

Clone the directory and cd into it.

Run `npm install -g electron` to get the required electron version on your system (the node_modules are already included, if for some reason you need to delete these, `run npm install` to download the node modules from the `package-lock.json` file).

Before you can run the app, you have to transpile the `.jsx` files in `src/*` into `.js` files in a directory which will be created called `dist/`. This is all taken care of with the `npm start` command. 

To run the full app run `npm start`
