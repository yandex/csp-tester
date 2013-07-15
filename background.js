var callback = function(details) {
    var csp_names = ['Content-Security-Policy', 'X-WebKit-CSP'];
    var csp_name = '';
    var csp_value = localStorage['policy'];
    
    for (var i; i<csp_names.length; i++) {
        csp_name = csp_names[i];
        if (localStorage['report_only'] == 1) {
            csp_name += '-Report-Only';
        }
        details.responseHeaders.push({name: csp_name, value: csp_value});
    }
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
