// mocks/electronMock.js
export const remote = {
    dialog: {
        // replace the showOpenDialog function with a spy which returns a value
        showMessageBox: jest.fn()
    }
};