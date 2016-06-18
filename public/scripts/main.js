define(['_', 'fb', 'yt'], function (_, fb, yt) {

    initTym();


    function initTym() {
        var api = window.tymAPI = window.tymAPI || {};
        var iframe = document.querySelector('iframe[src*="//www.youtube.com"]');
        var player, players = api.players = api.players || {};
        players['tym-player-1'] = {
            pause: function() {
                player.pauseVideo();
            },
            getCurrentTimecode: function () {
                return player.getCurrentTime();
            },
            getDuration: function() {
                return player.getDuration();
            },
            isReady: function() {
                if(window.YT.loaded) {
                    player = window.YT.get("player");
                }
                return window.YT.loaded;
            }
        };
    }

});
