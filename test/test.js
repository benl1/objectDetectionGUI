const Application = require('spectron').Application
const assert = require('assert')
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')

const app = new Application({
  path: electronPath,
  args: [path.join(__dirname, "..")]
});
describe('Tests', function () {
    this.timeout(10000)
    beforeEach(function () {
      return app.start()
    })

    afterEach(function () {
    if (this.app && this.app.isRunning()) {
        return app.stop()
    }
  })

    it('shows an initial window', () => {
        const wc = app.client.getWindowCount()
        console.log(wc)
        //assert.deepStrictEqual(wc, 1, "Incorrect number of windows open on init. Make sure dev tools option is disabled.")
      // Please note that getWindowCount() will return 2 if `dev tools` are opened.
            assert.equal(wc, 2)

    });

    // it('clear images brings up pop-up', () => {
    //     const clear = $('#clear_images')
    //     clear.click()
    //     win = app.client.windowByIndex(1)
    //     assert(win.title == "Clear Images?")
    // })
})