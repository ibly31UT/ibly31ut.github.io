"use strict";

function Site() {
	var site = this;

	var waitForLoadTimeout = null;

	this.Elements = null;
	this.LoadElements = LoadElements;
	this.BindEvents = BindEvents;
	this.WaitForTemplate = WaitForTemplate;
	this.Init = Init;

	function WaitForTemplate(selector, pageObj){
		clearTimeout(waitForLoadTimeout);
		if(window.ReadyToLoad === undefined || !window.ReadyToLoad){
			waitForLoadTimeout = setTimeout(function(){ site.WaitForTemplate(selector, pageObj); }, 100);
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
		site.Elements = LoadElements();
		
	}

	function Init() {
		var app = this;
		app.BindEvents();
		console.log("Initing site.js");
	}
}