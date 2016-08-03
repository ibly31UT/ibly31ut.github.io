/* exported Site */

var Site = (function() {
    'use strict';
    var waitForLoadTimeout = null;
    var WaitDialogCloseTimeout = null;

    var Elements = {
        WaitDialog: $("#_waitDialog")
    };
    var LoadElements = LoadElements;
    var BindEvents = BindEvents;
    var WaitForTemplate = WaitForTemplate;
    var Init = Init;
    var HashVars = null;
    var Auth = null;

    var createInternalHandler = function(timeoutId, handler) {
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

    var PostWithJson = function(url, data, success, error, noWaitDialog) {
        var timeoutId = null;
        WaitDialogCloseTimeout = null;
        if (!error) {
            error = function(XMLHttpRequest, textStatus, errorThrown) {
                if (XMLHttpRequest.status === 0) {
                    return;
                }

                if (XMLHttpRequest.responseJSON !== null && XMLHttpRequest.responseJSON !== undefined && XMLHttpRequest.responseJSON.Redirect !== null && XMLHttpRequest.responseJSON.Redirect !== undefined) {
                    //AjaxAwareHandleErrorAttribute will have caught a CommunicationException or EndpointNotFoundException to get here
                    redirect(XMLHttpRequest.responseJSON.Redirect);
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
            success: createInternalHandler(timeoutId, WaitDialogCloseTimeout, success),
            error: createInternalHandler(timeoutId, WaitDialogCloseTimeout, error),
            timeout: 60000
        });
    };

    var iE8Redirect = function(url) {
        var referLink = document.createElement('a');
        referLink.href = url;

        document.body.appendChild(referLink);
        referLink.click();
    };

    var redirect = function(url) {
        //IE 8 redirect hack to add the referrer header
        if (navigator.userAgent.toLowerCase().indexOf("msie 8.") > 0) {
            iE8Redirect(url);
        } else {
            window.location = url;
        }
    };

    WaitForTemplate = function(selector, pageObj) {
        clearTimeout(waitForLoadTimeout);
        if (window.ReadyToLoad === undefined || !window.ReadyToLoad) {
            waitForLoadTimeout = setTimeout(function() { WaitForTemplate(selector, pageObj); }, 100);
        } else {
            var templateHTML = window.TemplateHTML;
            var tmpl = $.templates(templateHTML);
            console.log(tmpl);

            var data = { pageObj: pageObj };
            var html = tmpl.render(data);
            console.log(html);
            $("#content").html(html);
        }
    };

    LoadElements = function() {
        return {
            Elementy: $("#document")
        };
    };

    BindEvents = function() {
        Elements = LoadElements();

        if (Object.prototype.assign === undefined || Object.prototype.assign === null) {
            Object.prototype.assign = function(object, source) {
                Object.keys(source).forEach(function(key) { object[key] = source[key]; });
            };
        }
    };

    Init = function(hashVars) {
        BindEvents();
        HashVars = hashVars;
    };

    return {
        Init: Init,
        HashVars: HashVars,
        PostWithJson: PostWithJson,
        Auth: Auth
    };

}());
