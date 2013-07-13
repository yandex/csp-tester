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

function save_policy() {
    policies = []
    localStorage["target"] = document.getElementById("target").value;

    for (var i=0;i<directives.length;i++) {
        localStorage.setItem(directives[i], document.getElementById(directives[i]).value);
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

document.addEventListener('DOMContentLoaded', load_policy);
document.querySelector('#save').addEventListener('click', save_policy);
document.querySelector('#reset').addEventListener('click', reset_policy);
