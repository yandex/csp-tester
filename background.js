var directives = [
    'default-src',
    'script-src',
    'object-src',
    'style-src',
    'img-src',
    'media-src',
    'frame-src',
    'font-src',
    'connect-src',
    'sandbox',
    'report-uri'
    ];

var callback = function(details) {
    var csp_name = 'Content-Security-Policy';
    var csp_value = '';

    if (localStorage['report_only'] == 1) {
        csp_name = 'Content-Security-Policy-Report-Only';
    }

    for (var i=0;i<directives.length;i++) {
        if (localStorage.getItem(directives[i])) {
            csp_value += directives[i] + ' ' + localStorage.getItem(directives[i]) + ';';
        }
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
