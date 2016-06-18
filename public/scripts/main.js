define(['_', 'fb'], function (_, fb) {

    var contestP = null;

    $('#contestUrl').change(function() {
        contestP = nodeFromUrl($('#contestUrl').val());

        contestP.then(function(contest) {
            console.log('> Contest:', contest);

            contest.participantsP = getParticipants(contest);
            var renderP = renderContestCard(contest).then(function() {
                renderSponsor(contest);
            });

            Promise.all([contest.participantsP, renderP])
                .then(function([participants]) {
                    $('#contestWidget .contest-participants').text(
                        _.keys(participants).length + ' participants').show();
                });


        });
    });

    $('#launchBtn').click(function() {
        if (!contestP) return;

        $(this).addClass('active');
        $('#launchBtn .button-caption').text("Shuffling...");

        contestP.then(function(contest) {
            getWinner(contest).then(function(winner) {
                //inserting a visible delay to tease people
                setTimeout(function() {
                    $('#launchBtn .button-caption').text("The winner is:");
                    $('#launchBtn').removeClass('active');
                    showWinner(winner, contest.sponsor);
                }, 1300);
            });
        }).catch(function(err) {
            console.log('> Error: ', err);
            $('#launchBtn .button-caption').text("Error!");
            $('#launchBtn').removeClass('active');
        });
    });

    function nodeFromUrl(url) {
        var id = photoIdFromUrl(url)
                || postIdFromUrl(url);
        if (!id) throw new Error('Node URL format not supported: ' + url);

        return id.then(function(node) {
            return fb.api(node, {fields: 'from, images, name, name_tags'})
                .then(function(node) {
                    var obj = {
                        _orig: node,
                        id: node.id,
                        text: node.name,
                        image: _.get(node, 'images[0].source'),
                        sponsor: _.find(node.name_tags, {type: 'page'})
                    };
                    return obj;
                });
        });
    }

    function renderContestCard(contest) {
        var promise = new Promise(function(resolve, reject) {
            var template = _.template($("#contestWidgetTpl").text());

            $('#contestWidget').html(template({
                contest: _.extend({}, contest,{
                    text: _.truncate(contest.text, {length: 100, separator: ' '})
                })
            }));

            resolve();
        });
        return promise;
    }

    function renderSponsor(contest) {
        if (!contest.sponsor) return;

        var template = _.template($("#pageWidgetTpl").text());
        $('#sponsorWidget').html(template(contest.sponsor));
        fb.FB.XFBML.parse();
        $('#contestSponsor').show();
    }

    function getParticipants(contest) {
        return Promise.all([
            collectPaginated(contest.id + '/reactions'),
            collectPaginated(contest.id + '/comments')])

            .then(function([likes, comments]) {
                var map = {};
                _.each(likes, function(like) {
                    var key = like.id;
                    map[key] = map.key || _.pick(like, ['id', 'name']);
                    _.extend(map[key], {like: like});
                });
                _.each(comments, function(comment) {
                    var key = comment.from.id;
                    map[key] = map.key || _.pick(comment.from, ['id', 'name']);
                    _.extend(map[key], {comment: comment});
                });
                console.log("> Participants:", map);
                return map;
            });
    }

    function collectPaginated(url) {
        var promise = new Promise(function(resolve, reject) {
            var data = [];
            fb.api(url)
                .then(collector)
                .catch(reject);

            function collector(res) {
                data = data.concat(res.data);
                if (!res.paging || !res.paging.next) return resolve(data);

                return fb.api(res.paging.next)
                    .then(collector)
                    .catch(reject);
            }
        });
        return promise;
    }

    function getWinner(contest) {
        return contest.participantsP.then(function(contestants) {
            contest._candidates = _.isEmpty(contest._candidates)
                ? _.shuffle(_.keys(contestants))
                : contest._candidates;

            var candidate = contest._candidates.pop();
            if (!candidate) return null;

            return contestants[candidate];
        });
    }

    function showWinner(winner, sponsor) {
        console.log("> Winner: ", winner);
        if (!winner) return $('#winner').html('No winner :(');

        var template = _.template($("#winnerWidgetTpl").text());
        $('#winner').html(template({winner, sponsor}));
    }

    function photoIdFromUrl(url) {
        var splits = parseUrl(url).pathname.split('/');
        if (splits.indexOf('photos') != 2) return '';

        return new Promise(function(resolve) {
            resolve(splits[splits.length - 1]);
        });
    }

    function postIdFromUrl(url) {
        var splits = parseUrl(url).pathname.split('/');
        if (splits.indexOf('posts') != 2) return '';

        var postid = splits[splits.length - 1];
        var pagename = splits[1];
        return fb.api(pagename).then(function(res) {
            return res.id + '_' + postid;
        });
    }

    function pageFromUrl(url) {
        var splits = parseUrl(url).pathname.split('/');
        var id = splits[splits.length - 1];
        if (!id) throw new Error('Page URL format not supported: ' + url);

        return fb.api(id);
    }

    function parseUrl(url) {
        var parser = document.createElement('a'),
            searchObject = {},
            queries, split, i;

        // Let the browser do the work
        parser.href = url;
        // Convert query string to object
        queries = parser.search.replace(/^\?/, '').split('&');
        for( i = 0; i < queries.length; i++ ) {
            split = queries[i].split('=');
            searchObject[split[0]] = split[1];
        }
        return {
            protocol: parser.protocol,
            host: parser.host,
            hostname: parser.hostname,
            port: parser.port,
            pathname: parser.pathname.replace(/\/$/, ''),
            search: parser.search,
            searchObject: searchObject,
            hash: parser.hash
        };
    }

});
