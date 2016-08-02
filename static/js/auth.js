"use strict";
/* jsignore: assign */
/* jsignore: Site */

function Auth() {
	var reddit;
	var authUrl = null;
	var randKey = null;
	var Auth = this;

	this.Config = function() {
		return {
			OAuth: assign({ 
				type: "implicit",
				consumerKey: "PmMIThJN2lAM7w",
				scope: [ "flair", "identity", "history", "edit", "read", "subscribe", "vote" ],
				redirectUri: "https://ibly31ut.github.io/default.html?template=auth",
				token_type: "bearer",
				limit: 100
			}, Site.HashVars)
		};
	};

	this.Elements = null;
	this.LoadElements = LoadElements;
	this.AuthSuccess = AuthSuccess;
	this.GotInfo = GotInfo;
	this.BindEvents = BindEvents;
	this.SetupOAuth = SetupOAuth;
	this.GetSavedPosts = GetSavedPosts;
	this.ShowSavedPosts = ShowSavedPosts;
	this.ViewSavedPosts = ViewSavedPosts;
	this.SortPosts = SortPosts;
	this.Init = Init;

	function LoadElements() {
		return {
			AuthButton: $("#authButton"),
			AuthConfirmation: $("#authConfirmation"),
			AuthNameSpan: $("#authNameSpan"),
			FetchButton: $("#fetchButton"),
			Status: $("#status"),
			Result: $("#result")
		};
	}

	function AuthSuccess() {
		Auth.Elements.AuthButton.addClass('btn-success').text("Logged in...").unbind('click');
	}

	function GotInfo(result) {
		console.log(result);
		Auth.Config.me = result;

		Auth.Elements.AuthNameSpan.text(result.name).fadeIn(500, function() {
			Auth.Elements.AuthButton.fadeOut();
			Auth.Elements.FetchButton.fadeIn();
		});
	}

	function SetupOAuth() {
        console.log(window.location.hash);
        console.log(window.location.queryString);

		randKey = Math.random().toString(36).substring(2);
		reddit = new Snoocore({
			userAgent: "ReddiSave/1.0:ibly31ut.github.io",
			oauth: Auth.Config.OAuth
		});

		if(Auth.Config.OAuth.access_token !== undefined){

            reddit.auth(access_token).then(function () {
                Auth.AuthSuccess();
                return reddit('/api/v1/me').get();
            }).done(function (result) {
                Auth.GotInfo(result);
            });
		} else{
			console.log("No state or code found");
		}

		//{"access_token": "ITpEom6AZ8CsJMQklWV-57fCJFo", "token_type": "bearer", "expires_in": 3600, "scope": "edit flair history identity read subscribe vote"}

		authUrl = reddit.getImplicitAuthUrl();
	}

	function ViewSavedPosts() {
        $(this).unbind('click');
        Auth.GetSavedPosts();
    }

    var arrData = [];

    function GetSavedPosts(params) {
        params = params || Auth.Config.OAuth;
        console.log("Params:");
        console.log(params);
        if (!Auth.Config.me.name) {
        	return Auth.GetSavedPosts(params);
        }
        reddit('/user/' + Auth.Config.me.name + '/saved').get(params).then(function (result) {
            arrData = arrData.concat(result.data.children);
            Auth.Elements.Status.text('... getting saved posts ...');
            if (result.data.after) {
                params.after = result.data.after;

                Auth.GetSavedPosts(params);
                console.log(arrData.length);
            } else {
                Auth.ShowSavedPosts(Auth.SortPosts(arrData));
            }
        });
    }

    function SortPosts(data) {

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

    }

    function ShowSavedPosts(data) {
        console.log(data);
        var rows = $('<div class="rows">');
        var row = $('<div class="row"><div class="name"></div><div class="val"></div></div>');
        data.forEach(function (v) {
            var r = row.clone();
            r.find('.name').text(v.name);
            r.find('.val').text(v.val);
            r.click(function () {
            	console.log("clicky mcgee: " + v.name + "and val: " + v.val);
                //showPanel(v);
            });
            rows.append(r);
        });
        Auth.Elements.Result.append(rows);
        Auth.Elements.Status.text("Done.....Enjoy!");
    }

	function BindEvents() {
		Auth.Elements = LoadElements();
		Auth.Elements.AuthButton.on("click", function (){
			window.location = authUrl;
		});
		Auth.Elements.FetchButton.on("click", Auth.ViewSavedPosts);
	}

	function Init() {
		var app = this;
		app.SetupOAuth();
		app.BindEvents();
	}
}

Site.Auth = new Auth();
Site.Auth.Init();