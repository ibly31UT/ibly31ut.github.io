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
		consumerKey: "1U3eY8uqCUIaBA",
		consumerSecret: "WLM29BUoWE7RS8WSj912hlywwcI",
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
		window.console.log(result);

		this.Elements.AuthConfirmation.text(result.scope).fadeIn().done(function() {
			this.Elements.AuthButton.fadeOut();
		});
	}

	function SetupOAuth() {
		var match = ('' + window.location.href).match(/state=(.*?)&code=(.*)&?/);
		window.console.log(match);
		var state = match ? match[1] : '';
		var code = match ? match[2] : '';

		randKey = Math.random().toString(36).substring(2);
		reddit = new Snoocore({
			userAgent: "ReddiSave/1.0:ibly31ut.github.io",
			oauth: { 
				type: "explicit", // required when using implicit OAuth
				mobile: false, // defaults to false.
				consumerKey: this.Config.consumerKey, 
				consumerSecret: this.Config.consumerSecret,
				state: randKey,
				redirectUri: this.Config.redirectUri,
				scope: [ "flair", "identity", "history", "edit", "read", "subscribe", "vote" ]
			}
		});

		window.console.log(window.location.href);

		if(code){
			this.Config.authorizationCode = code;
			window.console.log("state: " + state);
			window.console.log("code: " + code);

			var result = reddit.auth(code).always(function(result){
				window.console.log("Done result: ");
				window.console.log(result);
			});
			window.console.log("Immediately after:");
			window.console.log(result);

			// .done(function (result) {
   //          	this.GotInfo(result);
   //          });
		}

		authUrl = reddit.getExplicitAuthUrl();
		open()
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