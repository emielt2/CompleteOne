'use strict';
//Angular utils namespace
var angularUtils = {};
var esuiteAngularConfig = {};


// String omzetten naar json indien de string een geldige JSON string is.
(function (funcName, utils) {
    utils[funcName] = function (jsonString) {
        try {
            var o = JSON.parse(jsonString);
            if (o && typeof o === 'object') {
                return o;
            }
        }
        catch (e) {
            return false;
        }
        return false;
    };
})('tryParseJSON', angularUtils);


//functie voor het bootstrappen van angular
(function (funcName, utils, $) {

    //private function
    function bootstrapAngular(appName) {
        var urlIdentityConfig = utils.getRestBasePath() + 'identity/config';
        $.get(urlIdentityConfig, function (data) {
            var config =  utils.tryParseJSON(data);
            if (config) {
                esuiteAngularConfig = config;
                angular.bootstrap(document, [appName]);
            } else {
                //nog niet ingelogd op rest-services.. wachten met bootstrappen angular
                window.setTimeout(function () {
                    bootstrapAngular(appName);
                }, 200);
            }
        });
    }

    //public interface
    utils[funcName] = function (appName) {
        utils.docReady(function () {
            bootstrapAngular(appName);
        });
    };

})('bootstrapAngular', angularUtils, jQuery);


//functie welke het basepat van de rest-services terug geeft, voor beheer /beheer/rest/ en voor mp zal dit /mp/rest/ zijn
(function (funcName, utils) {
    utils[funcName] = function () {
        return '/' + window.location.pathname.split('/')[1] + '/rest/';
    };
})('getRestBasePath', angularUtils);


/**
 * docReady gaat later af dan angular.element(document).ready() en $(document).ready() en werkt ook in ie10
 * wordt gebruikt om angular te bootstrappen in main.js van ganeral-taglibrary
 *
 */
(function (funcName, utils) {
    // The public function name defaults to window.docReady
    // but you can pass in your own object and own function name and those will be used
    // if you want to put them in a different namespace
    funcName = funcName || 'docReady';
    utils = utils || window;
    var readyList = [];
    var readyFired = false;
    var readyEventHandlersInstalled = false;

    // call this when the document is ready
    // this function protects itself against being called more than once
    function ready() {
        if (!readyFired) {
            // this must be set to true before we start calling callbacks
            readyFired = true;
            for (var i = 0; i < readyList.length; i++) {
                // if a callback here happens to add new ready handlers,
                // the docReady() function will see that it already fired
                // and will schedule the callback to run right after
                // this event loop finishes so all handlers will still execute
                // in order and no new ones will be added to the readyList
                // while we are processing the list
                readyList[i].fn.call(window, readyList[i].ctx);
            }
            // allow any closures held by these functions to free
            readyList = [];
        }
    }

    function readyStateChange() {
        if (document.readyState === 'complete') {
            ready();
        }
    }

    // This is the one public interface
    // the context argument is optional - if present, it will be passed
    // as an argument to the callback
    utils[funcName] = function (callback, context) {
        // if ready has already fired, then just schedule the callback
        // to fire asynchronously, but right away
        if (readyFired) {
            setTimeout(function () {
                callback(context);
            }, 1);
            return;
        } else {
            // add the function and context to the list
            readyList.push({fn: callback, ctx: context});
        }
        // if document already ready to go, schedule the ready function to run
        if (document.readyState === 'complete') {
            setTimeout(ready, 1);
        } else if (!readyEventHandlersInstalled) {
            // otherwise if we don't have event handlers installed, install them
            if (document.addEventListener) {
                // first choice is DOMContentLoaded event
                document.addEventListener('DOMContentLoaded', ready, false);
                // backup is window load event
                window.addEventListener('load', ready, false);
            } else {
                // must be IE
                document.attachEvent('onreadystatechange', readyStateChange);
                window.attachEvent('onload', ready);
            }
            readyEventHandlersInstalled = true;
        } else {
            readyEventHandlersInstalled = false;
        }
    };
})('docReady', angularUtils);

/**
 * Methode om de hoogte van de taak iframe te kunnen bepalen en de redirect events te laten plaatsvinden buiten de iframe
 */
(function (funcName, utils) {
    utils[funcName] = function (iframe) {
        iframe.height = iframe.contentWindow.document.body.scrollHeight;

        var iframeJq = $('#taakScherm');
        //Max hoogte van de panel zetten zodat wanneer er aan een textarea gesleept word er een scrollbalk verschijnt, .css() werkt om de een of andere
        // reden niet dus vandaar een attr met style
        iframeJq.contents().find('#ng-taakscherm-box').attr('style', 'max-height: ' + iframeJq.height() + 'px;');
    };
})('taakIframeLoad', angularUtils);

