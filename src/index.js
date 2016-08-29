(function () {
    var nodeModules = '../node_modules';
    require.config({
        baseUrl: '.',
        packages: [
            {
                name: 'app',
                location: './src'
            },
            {
                name: 'aframe',
                location: nodeModules + "/aframe/dist",
                main: 'aframe.min.js'
            },
            {
                name: 'dojo-core',
                location: nodeModules + "/dojo-core/dist/umd"
            },
            {
                name: 'dojo-has',
                location: nodeModules + "/dojo-has/dist/umd"
            },
            {
                name: 'dojo-shim',
                location: nodeModules + "/dojo-shim/dist/umd"
            }
        ]
    });
    require(['aframe'], function () {
        require(['app/main'], function () { });
    });
}());
//# sourceMappingURL=../_debug/index.js.map