import has, { add } from 'dojo-has/has';

add('webvr', function () {
    return 'getVRDisplays' in navigator;
});

add('gamepad', function () {
    return 'getGamepads' in navigator;
});

export default has;
