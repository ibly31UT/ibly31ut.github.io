"use strict";

function Auth() {
	var reddit;
	var authUrl = null;
	var randKey = null;
	var Site = this;

	this.Config = {
		consumerKey: "PmMIThJN2lAM7w",
		redirectUri: "https://ibly31ut.github.io/default.html?template=auth",
		scope: [ "flair", "identity", "history", "edit", "read", "subscribe", "vote" ],
		type: "implicit",
		mobile: true
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
			FetchButton: $("#fetchButton")
		};
	}

	function AuthSuccess() {
		Site.Elements.AuthButton.addClass('btn-success').text("Logged in...").unbind('click');
	}

	function GotInfo(result) {
		console.log(result);
		Site.Config.me = result;

		Site.Elements.AuthNameSpan.text(result.name).fadeIn(500, function() {
			Site.Elements.AuthButton.fadeOut();
			Site.Elements.FetchButton.fadeIn();
		});
	}

	function SetupOAuth() {
		//var match = ('' + window.location.href).match(/state=(.*?)&accessToken=(.*)&?/);
		var match = location.hash.match(/^#?(.*)$/)[1];
		if (match)
		{
		   console.log(match[1]);
		   console.log(match[2]);
		   console.log(match[3]);
		}
		match = ('' + window.location.hash).match(/([A-Za-z]*)=(.*?)&/);
        var accessToken = match ? match[1] : '';
        console.log(window.location.href);

		randKey = Math.random().toString(36).substring(2);
		reddit = new Snoocore({
			userAgent: "ReddiSave/1.0:ibly31ut.github.io",
			oauth: Site.Config
		});

		if(accessToken){
			Site.Config.accessToken = accessToken;

			if (accessToken) {
	            reddit.auth(accessToken).then(function () {
	                Site.AuthSuccess();
	                return reddit('/api/v1/me').get();
	            }).done(function (result) {
	                Site.GotInfo(result);
	            });
	        }
		} else{
			console.log("No state or code found");
		}

		//{"access_token": "ITpEom6AZ8CsJMQklWV-57fCJFo", "token_type": "bearer", "expires_in": 3600, "scope": "edit flair history identity read subscribe vote"}

		authUrl = reddit.getImplicitAuthUrl();
	}

	function ViewSavedPosts() {
        $(this).unbind('click');
        Site.GetSavedPosts();
    }

    var arrData = [];

    function GetSavedPosts(params) {
        params = params || {};
        params.limit = 200;
        if (!Site.Config.me.name) {
        	return Site.GetSavedPosts(params);
        }
        reddit('/user/' + Site.Config.me.name + '/saved').get(params).then(function (result) {
            arrData = arrData.concat(result.data.children);
            Site.Elements.Status.text('...getting data...');
            if (result.data.after) {
                params.after = result.data.after;
                Site.GetSavedPosts(params);
                console.log(arrData.length);
            } else {
                Site.ShowSavedPosts(Site.SortPosts(arrData));
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
        Site.Elements.Result.append(rows);
        Site.Elements.Status.text("Done.....Enjoy!");
    }

	function BindEvents() {
		Site.Elements = LoadElements();
		Site.Elements.AuthButton.on("click", function (){
			window.location = authUrl;
		});
		Site.Elements.FetchButton.on("click", Site.ViewSavedPosts);
	}

	function Init() {
		var app = this;
		app.SetupOAuth();
		app.BindEvents();
	}
}

var auth = new Auth();
auth.Init();