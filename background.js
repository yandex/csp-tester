var callback = function(details) {
    var csp_names = ['Content-Security-Policy'];
        
    if (localStorage.getItem('standard_header') == 0) {
        csp_names = [];
    }
    
    if (localStorage.getItem('web_kit_header') == 1) {
        csp_names.push('X-WebKit-CSP');
    }
    
    var csp_name = '';
    var csp_value = localStorage['policy'];

    details.responseHeaders.map(function(val, i, arr){
        for (var j=0; j<csp_names.length; j++) {
            if (val.name == csp_names[j]) {
                arr.splice(i, 1);
            }
        }
    });

    for (var i=0; i<csp_names.length; i++) {
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
