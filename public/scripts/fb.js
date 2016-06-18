define(['facebook'], function(FB){
    FB.init({
        appId: '238020449924177',
        xfbml: true,
        version: 'v2.6'
    });

    // ADD ADDITIONAL FACEBOOK CODE HERE
    FB.Canvas.setAutoGrow(); // This is important, exclude this and the internet blows up


    // Logging in
    function onLogin(response) {

        console.log('onLogin:', response.status);
      // if (response.status == 'connected') {
      //   FB.api('/me?fields=first_name', function(data) {
      //     var welcomeBlock = document.getElementById('fb-welcome');
      //     welcomeBlock.innerHTML = data.first_name;
      //   });
      // }
    }

    FB.getLoginStatus(function(response) {
      // Check login status on load, and if the user is
      // already logged in, go directly to the welcome message.
      if (response.status == 'connected') {
        onLogin(response);
      } else {
        // Otherwise, show Login dialog first.
        // FB.login(function(response) {
        //   onLogin(response);
        // }, {scope: 'public_profile, user_friends, user_likes, user_posts, read_insights, read_audience_network_insights, manage_pages, pages_show_list, pages_manage_cta, pages_manage_instant_articles'});
      }
    });

    return {
        FB: FB,
        api: function(/*...*/) {
            var args = [].slice.call(arguments, 0);
            return new Promise(function(resolve, reject) {
                FB.api.apply(FB, args.concat(function(res) {
                    if (res.error) {
                        reject(res.error);
                    } else {
                        resolve(res);
                    }
                }));
            });
        }
    };
});
