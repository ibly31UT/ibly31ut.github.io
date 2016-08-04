/* globals Site */
/* exported Auth */

var Auth = (function() {
    'use strict';
    var reddit;
    var authUrl = null;
    var randKey = null;

    var Config = {
        OAuth: null
    };

    var Elements = null;

    var LoadElements = function() {
        return {
            AuthButton: $("#authButton"),
            AuthConfirmation: $("#authConfirmation"),
            AuthNameSpan: $("#authNameSpan"),
            FetchButton: $("#fetchButton"),
            Status: $("#status"),
            Result: $("#result")
        };
    };

    var AuthSuccess = function() {
        Elements.AuthButton.addClass('btn-success').text("Logged in...").unbind('click');
    };

    var GotInfo = function(result) {
        console.log(result);
        Config.me = result;

        Elements.AuthNameSpan.text(result.name).fadeIn(500, function() {
            Elements.AuthButton.fadeOut();
            Elements.FetchButton.fadeIn();
        });
    };

    var SetupOAuth = function() {
        console.log(window.location.hash);
        console.log(window.location.queryString);

        randKey = Math.random().toString(36).substring(1);
        reddit = new Snoocore({
            userAgent: "ReddiSave/1.0:ibly31ut.github.io",
            oauth: Config.OAuth
        });

        if (Config.OAuth.access_token !== undefined) {

            reddit.auth(Config.OAuth.access_token).then(function() {
                AuthSuccess();
                return reddit('/api/v1/me').get();
            }).done(function(result) {
                GotInfo(result);
            });
        } else {
            console.log("No state or code found");
        }

        authUrl = reddit.getImplicitAuthUrl();
    };

    var ViewSavedPosts = function() {
        $(this).unbind('click');
        GetSavedPosts();
    };

    var arrData = [];

    var GetSavedPosts = function(params) {
        params = params || Config.OAuth;
        console.log("Params:");
        console.log(params);
        if (!Config.me.name) {
            return GetSavedPosts(params);
        }
        reddit('/user/' + Config.me.name + '/saved').get(params).then(function(result) {
            arrData = arrData.concat(result.data.children);
            Elements.Status.text('... getting saved posts ...');
            if (result.data.after) {
                params.after = result.data.after;

                GetSavedPosts(params);
                console.log(arrData.length);
            } else {
                ShowSavedPosts(SortPosts(arrData));
            }
        });
    };

    var SortPosts = function(data) {

        return (sortArr(makeArr()));

        function makeArr() {
            var list = [];

            // [{name:,val:,arr:},{...},{..}]
            for (var i = 0, l = data.length; i < l; i++) {
                var e = data[i],
                    found = false;
                //check if it exists
                for (var n = 0; n < list.length; n++) {
                    if (list[n].name == e.data.subreddit) {
                        found = true; //add to existing
                        break;
                    }
                }

                if (found) { //adding to existing
                    list[n].val += 1;
                    list[n].arr.push(e.data);
                } else {
                    list.push({
                        name: e.data.subreddit,
                        val: 1,
                        arr: [e.data]
                    });
                }
            }
            return list;
        }

        //make obj { subbreddit : {num:0, arr : {data,data...}} cant use array because then would have to loop again to find right subbreddit to add the new item
        function sortArr(arr) {
            var l = arr.length;
            for (var i = 0; i < l - 1; i++) {
                for (var j = i + 1; j < l; j++) {
                    if (arr[i].val < arr[j].val) {
                        swap(i, j, arr);
                    }
                }
            }

            function swap(a, b, arr) {
                var c = arr[a];
                arr[a] = arr[b];
                arr[b] = c;
            }
            return arr;
        }

    };

    var ShowSavedPosts = function(data) {
        console.log(data);
        var rows = $('<div class="rows">');
        var row = $('<div class="row"><div class="name"></div><div class="val"></div></div>');
        data.forEach(function(v) {
            var r = row.clone();
            r.find('.name').text(v.name);
            r.find('.val').text(v.val);
            r.click(function() {
                console.log("clicky mcgee: " + v.name + "and val: " + v.val);
                //showPanel(v);
            });
            rows.append(r);
        });
        Elements.Result.append(rows);
        Elements.Status.text("Done.....Enjoy!");
    };

    var LoadVars = function() {
        Config.OAuth = {
            type: "implicit",
            consumerKey: "PmMIThJN2lAM7w",
            scope: ["flair", "identity", "history", "edit", "read", "subscribe", "vote"],
            redirectUri: "https://ibly31ut.github.io/default.html?template=auth",
            token_type: "bearer",
            limit: 100
        };
        console.log("Assigning config");
        Config.OAuth = Object.assign(Config.OAuth, Site.HashVars);
        console.log(Config);
    };

    var BindEvents = function() {
        Elements = LoadElements();
        Elements.AuthButton.on("click", function() {
            window.location = authUrl;
        });
        Elements.FetchButton.on("click", ViewSavedPosts);
    };

    var Init = function() {
        LoadVars();
        SetupOAuth();
        BindEvents();
    };

    return {
        Init: Init,
        Config: Config
    };

}());

//tiny pub sub
(function($) {
    'use strict';
    var o = $({});

    $.subscribe = function() {
        o.on.apply(o, arguments);
    };

    $.unsubscribe = function() {
        o.off.apply(o, arguments);
    };

    $.publish = function() {
        o.trigger.apply(o, arguments);
    };

}(jQuery));
