# Electron App for Object Detection

## Current build and run process

Clone the directory and cd into it.

Run `npm install -g electron` to get the required electron version on your system (the node_modules are already included, if for some reason you need to delete these, `run npm install` to download the node modules from the `package-lock.json` file).

Before you can run the app, you have to transpile the `.jsx` files in `src/*` into `.js` files in a directory which will be created called `dist/`. To do this, run the three commands: `npm run entrypoint`, `npm run image-choice-screen`, and `npm run control`. This will be simplified in the future, but for now we're stuck running all three. 

You can then run `electron .` or `npm run electron`, if you prefer longer, fancier-looking commands.
