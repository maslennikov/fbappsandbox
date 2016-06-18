require.config({
    //By default load any module IDs from js/lib
    baseUrl: 'scripts',

    shim: {
        'facebook' : {
            exports: 'FB'
        },
        '_': {
            exports: '_'
        }
    },
    paths: {
        'facebook': '//connect.facebook.net/en_US/sdk',
        '_': '//cdn.jsdelivr.net/lodash/4.13.1/lodash.min'
    }
});

require(['main']);
