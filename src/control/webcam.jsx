require('babel-polyfill');

/**
 * Count the number of video input devices accessible and return a promise of that count.
 */
function countVideoDevices() {
    return new Promise((res, rej) =>
        navigator.mediaDevices.enumerateDevices()
            .then(devices => res(devices.filter(dev => dev.kind == 'videoinput').length))
    );
}

export { countVideoDevices };