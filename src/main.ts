import has from './has';
import Promise from 'dojo-shim/Promise';

console.log(`WebVR is supported: ${ has('webvr') }`);
console.log(`Gamepad is supported: ${ has('gamepad') }`);

export default {
	// TODO Add a reference to your main application object after initialization
	app: Promise.resolve(null)
}
