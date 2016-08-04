/* exported Site */

var Site = (function() {
	'use strict';
	var waitForLoadTimeout = null;
	var WaitDialogCloseTimeout = null;

	var Elements = {
		WaitDialog: $("#_waitDialog"),
		Body: $("body"),
		HiddenBSModal: $("")
	};
	var LoadElements = LoadElements;
	var BindEvents = BindEvents;
	var LoadTemplate = LoadTemplate;
	var PostWithJson = PostWithJson;
	var Init = Init;
	var HashVars = null;
	var Auth = null;

	var CreateInternalHandler = function(timeoutId, handler) {
		return function(data, textStatus, errorThrown) {

			if (timeoutId !== null) {
				clearTimeout(timeoutId);

				//remove display incase the modal is shown and hidden so fast that it gets in a bad state and blocks the page.
				Elements.WaitDialog.on("hidden.bs.modal", function() {
					$('body').removeClass('modal-open');
					$('.modal-backdrop').remove();
					$(this).css("display", "");
				}).modal("hide");
			}

			if (WaitDialogCloseTimeout !== null) {
				clearTimeout(WaitDialogCloseTimeout);
			}

			if (handler !== null && typeof handler === "function") {
				handler(data, textStatus, errorThrown);
			}

		};
	};

	PostWithJson = function(url, data, success, error, noWaitDialog) {
		var timeoutId = null;
		WaitDialogCloseTimeout = null;
		if (!error) {
			error = function(XMLHttpRequest, textStatus, errorThrown) {
				if (XMLHttpRequest.status === 0) {
					return;
				}

				if (XMLHttpRequest.responseJSON !== null && XMLHttpRequest.responseJSON !== undefined && XMLHttpRequest.responseJSON.Redirect !== null && XMLHttpRequest.responseJSON.Redirect !== undefined) {
					//AjaxAwareHandleErrorAttribute will have caught a CommunicationException or EndpointNotFoundException to get here
					Redirect(XMLHttpRequest.responseJSON.Redirect);
				} else if (errorThrown !== null && errorThrown !== undefined) {
					alert("PostWithJson failed for " + url + "\n Error : " + textStatus + " \n\n\n\n" + errorThrown);
				} else {
					alert("PostWithJson for " + url + "has failed, no errors defined");
				}

			};

		}

		if (noWaitDialog ? true : false === false) {
			timeoutId = setTimeout(function() {
				Elements.WaitDialog.modal("show");
				WaitDialogCloseTimeout = setTimeout(function() {
					clearTimeout(WaitDialogCloseTimeout);
					Elements.WaitDialog.modal("hide");
				}, 30000);
			}, 1000);
		}

		$.ajax({
			url: url,
			type: "POST",
			data: JSON.stringify(data),
			dataType: "json",
			contentType: 'application/json; charset=utf-8',
			traditional: true,
			success: CreateInternalHandler(timeoutId, WaitDialogCloseTimeout, success),
			error: CreateInternalHandler(timeoutId, WaitDialogCloseTimeout, error),
			timeout: 20000
		});
	};

	var IE8Redirect = function(url) {
		var referLink = document.createElement('a');
		referLink.href = url;

		document.body.appendChild(referLink);
		referLink.click();
	};

	var Redirect = function(url) {
		//IE 8 redirect hack to add the referrer header
		if (navigator.userAgent.toLowerCase().indexOf("msie 8.") > 0) {
			IE8Redirect(url);
		} else {
			window.location = url;
		}
	};

	LoadTemplate = function(templateObj) {
		console.log("Loading template: " + templateObj);
		console.log("url to grab is: " + templateObj.url);
		console.log("When done we'll place it in: " + templateObj.selector);

		return $.ajax({
			url: templateObj.url,
			type: "GET",
			contentType: 'text/html',
			timeout: 20000
		}).done(function(data){
			var tmpl = $.templates(data);
			console.log(tmpl);
			var inp = { startingStatus: "stoopid status", startingResults: "stoopider results" };
			var html = tmpl.render(inp);
			console.log(html);
			$(templateObj.selector).html(html);
			setInterval(function(){
				templateObj.onComplete();
				console.log("Post on complete");
			}, 50);
		}).fail(function(data){
			console.log("Loading of template failed!");
			console.log(data);
		});

		/*clearTimeout(waitForLoadTimeout);
		if (window.ReadyToLoad === undefined || !window.ReadyToLoad) {
			waitForLoadTimeout = setTimeout(function() { LoadTemplate(selector, pageObj); }, 100);
		} else {
			var templateHTML = window.TemplateHTML;
			var tmpl = $.templates(templateHTML);
			console.log(tmpl);

			var data = { pageObj: pageObj, endScript: "</script>" };
			var html = $.li(data);
			console.log(html);
			Elements.html(html);
		}*/
	};

	LoadElements = function() {
		return {
			Elementy: $("#document")
		};
	};

	BindEvents = function() {
		Elements = LoadElements();
	};

	Init = function(hashVars) {
		BindEvents();
		HashVars = hashVars;
	};

	return {
		Init: Init,
		HashVars: HashVars,
		PostWithJson: PostWithJson,
		Auth: Auth,
		LoadTemplate: LoadTemplate
	};

}());
