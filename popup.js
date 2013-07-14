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

// http://www.w3.org/TR/CSP/#parsing
function parse_policy(policy) {
    var result = {};
    var chunks = policy.split(';');
    var tmp;
    for (var i=0;i<chunks.length; i++) {
        for (var j=0;j<directives.length;j++) {
            tmp = chunks[i].split(directives[j] + ' ');
            if (tmp.length > 1) {
                result[directives[j]] = tmp[1].trim();
                break;
            }
        }
    }
    return result;
}

function save_policy() {
    var policies = [];
    var csp_value = '';
    var csp_chunks = {};
    localStorage["target"] = document.getElementById("target").value;

    if (localStorage.getItem('mode') == 2) {
        localStorage['policy'] = document.getElementById("policy").value;
        csp_chunks = parse_policy(localStorage['policy']);
        for (var i=0;i<directives.length;i++) {
            if (directives[i] in csp_chunks) {
                localStorage[directives[i]] = csp_chunks[directives[i]]; 
            } else {
                localStorage[directives[i]] = ''; 
            }
        }
    } else {
        for (var i=0;i<directives.length;i++) {
            localStorage.setItem(directives[i], document.getElementById(directives[i]).value);
            if (localStorage[directives[i]]) {
                csp_value += directives[i] + ' ' + localStorage[directives[i]] + '; ';
            }
        }
        if (csp_value) {
            csp_value = csp_value.slice(0, csp_value.length - 2);
        }
        localStorage['policy'] = csp_value;
    }

    if (document.getElementById("state").checked) {
        localStorage["state"] = 1;
    } else {
        localStorage["state"] = 0;
    }
    if (document.getElementById("report_only").checked) {
        localStorage["report_only"] = 1;
    } else {
        localStorage["report_only"] = 0;
    }
    var status = document.getElementById("status");
    var bg = chrome.extension.getBackgroundPage()
    if (bg.reload()) {
        status.innerHTML = "Policy has been saved.";
        status.style.display = 'block';
    } else {
        status.innerHTML = "Policy has not been saved! Please, check URL pattern.";
        status.style.display = 'block';
        localStorage["state"] = 0;
        document.getElementById("state").checked = false;
    }
    setTimeout(function() {
        status.style.display = 'none';
    }, 850);
}

function load_policy() {
    if (localStorage.getItem("target")) {
        document.getElementById("target").value = localStorage.getItem("target");
    }
    
    if (localStorage.getItem("policy")) {
        document.getElementById("policy").value = localStorage.getItem("policy");
    }
    for (var i=0;i<directives.length;i++) {
        if (localStorage.getItem(directives[i])) {
            document.getElementById(directives[i]).value = localStorage.getItem(directives[i]);
        }
    }

    if (localStorage["state"] == 1) {
        document.getElementById("state").checked = true;
    }
    if (localStorage["report_only"] == 1) {
        document.getElementById("report_only").checked = true;
    }
}

function reset_policy() {
    document.getElementById("target").value = '';

    for (var i=0;i<directives.length;i++) {
        if (localStorage.getItem(directives[i])) {
            document.getElementById(directives[i]).value = '';
        }
    }

    document.getElementById("state").checked = false;
    document.getElementById("report_only").checked = false;
}

function toggle_view() {
    var adv = document.getElementById("advanced");
    var advanced_link = document.getElementById("advanced_link");
    var simple_link = document.getElementById("simple_link");
    var simple = document.getElementById("simple");

    if (localStorage.getItem('mode') == 1) {
        advanced_link.style.display = 'inline';
        adv.style.display = 'none';
        simple_link.style.display = 'none';
        simple.style.display = 'block';
    } else {
        advanced_link.style.display = 'none';
        adv.style.display = 'block';
        simple_link.style.display = 'inline';
        simple.style.display = 'none';
    }
}

function switch2advanced() {
    localStorage['mode'] = 2;
    var csp_value = '';
    var tmp = '';
    for (var i=0;i<directives.length;i++) {
        tmp = document.getElementById(directives[i]).value.trim(); 
        if (tmp) {
            csp_value += directives[i] + ' ' + tmp + '; ';
        }
    }
    if (csp_value) {
        csp_value = csp_value.slice(0, csp_value.length - 2);
    }
    document.getElementById("policy").value = csp_value;
    toggle_view();
}

function switch2simple() {
    localStorage['mode'] = 1;
    var csp_chunks = parse_policy(document.getElementById("policy").value);
    for (var i=0;i<directives.length;i++) {
        if (directives[i] in csp_chunks) {
            document.getElementById(directives[i]).value = csp_chunks[directives[i]];
        } else {
            document.getElementById(directives[i]).value = '';
        }
    }
    toggle_view();
}

document.addEventListener('DOMContentLoaded', load_policy);
document.querySelector('#save').addEventListener('click', save_policy);
document.querySelector('#save').addEventListener('click', save_policy);
document.querySelector('#advanced_link').addEventListener('click', switch2advanced);
document.querySelector('#simple_link').addEventListener('click', switch2simple);

toggle_view();
