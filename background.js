'use strict';

var callback = function(details) {
    var csp_name = 'Content-Security-Policy';
    var csp_value = localStorage['policy'];

    details.responseHeaders.map(function(val, i, arr) {
        if (val.name == csp_name) {
            arr.splice(i, 1);
        }
    });

    if (localStorage['report_only'] == 1) {
        csp_name += '-Report-Only';
    }

    details.responseHeaders.push({name: csp_name, value: csp_value});
    return {responseHeaders: details.responseHeaders};
};

var reload = function() {
    var urls = {urls:[localStorage['target']]};
    chrome.webRequest.onHeadersReceived.removeListener(callback);
    if (localStorage['state'] == 1) {
        chrome.webRequest.onHeadersReceived.addListener(callback, urls,  ["blocking", "responseHeaders"]);
    }
    return true;
};

reload();
