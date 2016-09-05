(function () {
	const nodeModules = '../node_modules';

	(<DojoLoader.RootRequire> require).config({
		baseUrl: '.',
		packages: [
			{
				name: 'app',
				location: './src'
			},
			{
				name: 'aframe',
				location: `${ nodeModules }/aframe/dist`,
				main: 'aframe.min.js'
			},
			{
				name: 'dojo-core',
				location: `${ nodeModules }/dojo-core`
			},
			{
				name: 'dojo-has',
				location: `${ nodeModules }/dojo-has`
			},
			{
				name: 'dojo-shim',
				location: `${ nodeModules }/dojo-shim`
			}
		]
	});

	require([ 'aframe' ], function () {
		require([ 'app/main' ], function () { });
	});
}());
