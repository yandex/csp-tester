function save_options() {
    var status = document.getElementById("status");
    if (document.getElementById("standard_header").checked) {
        localStorage["standard_header"] = 1;
    } else {
        localStorage["standard_header"] = 0;
    }

    if (document.getElementById("web_kit_header").checked) {
        localStorage["web_kit_header"] = 1;
    } else {
        localStorage["web_kit_header"] = 0;
    }
    var bg = chrome.extension.getBackgroundPage()
    bg.reload();
    status.innerHTML = "Options have been saved.";
    status.style.display = 'block';
    setTimeout(function() {
        status.style.display = 'none';
    }, 850);
}

function load_options() {
    // Default values
    if (localStorage['standard_header'] == undefined) {
        localStorage['standard_header'] = 1;
        localStorage['web_kit_header'] = 0;
    }
    if (localStorage["standard_header"] == 1) {
        document.getElementById("standard_header").checked = true;
    }
    if (localStorage["web_kit_header"] == 1) {
        document.getElementById("web_kit_header").checked = true;
    }
}

document.addEventListener('DOMContentLoaded', load_options);
document.querySelector('#save').addEventListener('click', save_options);

