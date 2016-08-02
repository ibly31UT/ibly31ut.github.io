"use strict";

function Site() {
	var reddit;
	var authUrl = null;
	var randKey = null;

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
		window.console.log("User: " + result.name);
		this.Elements.AuthConfirmation.text(result.name).fadeIn().done(function() {
			this.Elements.AuthButton.fadeOut();
		});
	}

	function SetupOAuth() {
		var match = ('' + window.location.hash).match(/access_token=(.*?)&/);
		var accessToken = match ? match[1] : '';

		randKey = Math.random().toString(36).substring(2);
		reddit = new Snoocore({
			userAgent: "ReddiSave/1.0:ibly31ut.github.io",
			oauth: { 
				type: "explicit", // required when using implicit OAuth
				mobile: false, // defaults to false.
				consumerKey: "1U3eY8uqCUIaBA", 
				consumerSecret: "WLM29BUoWE7RS8WSj912hlywwcI",
				state: randKey,
				redirectUri: "https://ibly31ut.github.io/index.html",
				scope: [ "flair", "identity", "history", "edit", "read", "subscribe", "vote" ]
			}
		});

		if(accessToken){
			reddit.auth(accessToken).then(function () {
                this.AuthSuccess();
                return reddit('/api/v1/me').get();
            }).done(function (result) {
            	this.GotInfo(result);
            });
		}

		authUrl = reddit.getExplicitAuthUrl();
	}

	function BindEvents() {
		this.Elements = LoadElements();
		this.Elements.AuthButton.on("click", function (evt){
			window.location = authUrl;
		});
	}

	function Init() {
		var app = this;
		app.SetupOAuth();
		app.BindEvents();
		
	}

}