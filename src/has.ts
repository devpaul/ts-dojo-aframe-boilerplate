import has, { add } from 'dojo-has/has';

add('webvr', function () {
    return has('host-browser') && 'getVRDisplays' in navigator;
});

add('gamepad', function () {
    return has('host-browser') && 'getGamepads' in navigator;
});

export default has;
