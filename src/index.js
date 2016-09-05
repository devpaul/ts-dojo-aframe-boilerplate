(function () {
    var libsDirectory = './libs';
    require.config({
        baseUrl: '.',
        packages: [
            {
                name: 'app',
                location: './src'
            },
            {
                name: 'aframe',
                location: libsDirectory + "/aframe",
                main: 'aframe.min.js'
            },
            {
                name: 'dojo-core',
                location: libsDirectory + "/dojo-core"
            },
            {
                name: 'dojo-has',
                location: libsDirectory + "/dojo-has"
            },
            {
                name: 'dojo-shim',
                location: libsDirectory + "/dojo-shim"
            }
        ]
    });
    require(['aframe'], function () {
        require(['app/main'], function () { });
    });
}());
//# sourceMappingURL=../_debug/index.js.map