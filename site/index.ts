(<DojoLoader.RootRequire> require).config({
	baseUrl: '../..',
    packages: [
        {
            name: 'aframe',
            location: 'node_modules/aframe/dist',
            main: 'aframe.min.js'
        },
        {
            name: 'dojo-core',
            location: 'node_modules/dojo-core/dist/umd'
        },
        {
            name: 'dojo-has',
            location: 'node_modules/dojo-has/dist/umd'
        },
        {
            name: 'dojo-shim',
            location: 'node_modules/dojo-shim/dist/umd'
        }
    ]
});

require([ 'aframe' ], function () {
    require([ './main' ], function () { });
});
