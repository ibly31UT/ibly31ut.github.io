"use strict";

function Site() {
	var reddit;
	var authUrl = null;
	var randKey = null;

	this.Rest = {
		AccessToken: "/api/v1/access_token",
		Me: "/api/v1/me"
	};

	this.Config = {
		consumerKey: "PmMIThJN2lAM7w",
		redirectUri: "https://ibly31ut.github.io/index.html",
		authorizationCode: "invalid",
	};

	this.Elements = null;
	this.LoadElements = LoadElements;
	this.AuthSuccess = AuthSuccess;
	this.GotInfo = GotInfo;
	this.BindEvents = BindEvents;
	this.SetupOAuth = SetupOAuth;
	this.Init = Init;

	function LoadElements() {
		return {
			AuthButton: $("#authButton"),
			AuthConfirmation: $("#authConfirmation")
		};
	}

	function AuthSuccess() {
		this.Elements.AuthButton.addClass('btn-success').text("Logged in...").unbind('click');

	}

	function GotInfo(result) {
		console.log(result);

		this.Elements.AuthConfirmation.text(result.name).fadeIn().done(function() {
			this.Elements.AuthButton.fadeOut();
		});
	}

	function SetupOAuth() {
		//var match = ('' + window.location.href).match(/state=(.*?)&accessToken=(.*)&?/);
		var match = ('' + window.location.href).match(/accessToken=(.*)&?/);
		console.log(match);
		console.log(window.location.href);
		var state = match ? match[1] : '';
		var accessToken = match ? match[2] : '';

		randKey = Math.random().toString(36).substring(2);
		reddit = new Snoocore({
			userAgent: "ReddiSave/1.0:ibly31ut.github.io",
			oauth: { 
				type: "implicit", // required when using implicit OAuth
				mobile: true, // defaults to false.
				consumerKey: this.Config.consumerKey, 
				state: randKey,
				redirectUri: this.Config.redirectUri,
				scope: [ "flair", "identity", "history", "edit", "read", "subscribe", "vote" ]
			}
		});

		if(accessToken){
			this.Config.accessToken = accessToken;
			console.log("state: " + state);
			console.log("code: " + accessToken);

			if (accessToken) {
	            reddit.auth(accessToken).then(function () {
	                this.AuthSuccess();
	                return reddit('/api/v1/me').get();
	            }).done(function (result) {
	                var name = result.name;
	                this.GotInfo(result);
	            });
	        }

			// .done(function (result) {
   //          	this.GotInfo(result);
   //          });
		} else{
			console.log("No state or code found");
		}

		//{"access_token": "ITpEom6AZ8CsJMQklWV-57fCJFo", "token_type": "bearer", "expires_in": 3600, "scope": "edit flair history identity read subscribe vote"}

		authUrl = reddit.getImplicitAuthUrl();
	}

	function BindEvents() {
		this.Elements = LoadElements();
		this.Elements.AuthButton.on("click", function (){
			window.location = authUrl;
		});
	}

	function Init() {
		var app = this;
		app.SetupOAuth();
		app.BindEvents();
		
	}

}