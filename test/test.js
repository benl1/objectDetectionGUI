const Application = require('spectron').Application
const assert = require('assert')
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
// const ImageChoice = require('../src/image_choice_screen/image_choice_screen.jsx');

const app = new Application({
  path: electronPath,
  args: [path.join(__dirname, "..")]
});

global.before(function () {
  chai.should();
  chai.use(chaiAsPromised);
});

describe('Tests', function () {
  this.timeout(10000)

  beforeEach(function () {
    return app.start()
  })

  afterEach(function () {
    if (app && app.isRunning()) {
        return app.stop()
    }
  })

  it('shows an initial window', () => {
      // const wc = app.client.getWindowCount()
      // console.log(wc)
      // assert.deepStrictEqual(wc, 1, "Incorrect number of windows open on init. Make sure dev tools option is disabled.")
      // Please note that getWindowCount() will return 2 if `dev tools` are opened.
      //assert.equal(wc, 2)

    return app.client.waitUntilWindowLoaded()
      .getWindowCount().should.eventually.equal(1);

  });

  it('test upload button', async() => {
    // await app.client.click(ImageChoice.UploadImageButton).element(ImageChoice.file_upload).should.eventually.exist;
    return app.client.click('#upload_image_button')
  });

    // it('clear images brings up pop-up', () => {
    //     const clear = $('#clear_images')
    //     clear.click()
    //     win = app.client.windowByIndex(1)
    //     assert(win.title == "Clear Images?")
    // })
})