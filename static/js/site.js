"use strict";

function assign(object, source) {
	Object.keys(source).forEach(function(key) {
		object[key] = source[key];
	});
}

var Site = null;

function Site() {
	Site = this;
	var waitForLoadTimeout = null;

	this.Elements = null;
	this.LoadElements = LoadElements;
	this.BindEvents = BindEvents;
	this.WaitForTemplate = WaitForTemplate;
	this.Init = Init;
	this.HashVars = null;
	this.Auth = null;

	function WaitForTemplate(selector, pageObj){
		clearTimeout(waitForLoadTimeout);
		if(window.ReadyToLoad === undefined || !window.ReadyToLoad){
			waitForLoadTimeout = setTimeout(function(){ Site.WaitForTemplate(selector, pageObj); }, 100);
		} else{ 
			var templateHTML = window.TemplateHTML;
			var tmpl = $.templates(templateHTML);
			console.log(tmpl);

			var data = {name: "ibly beetchesss", pageObj: pageObj};
			var html = tmpl.render(data);
			console.log(html);
			$("#content").html(html);
		}
	}

	function LoadElements() {
		return {
			
		};
	}

	function BindEvents() {
		Site.Elements = LoadElements();
	}

	function Init(hashVars) {
		Site.BindEvents();
		Site.HashVars = hashVars;
	}
}