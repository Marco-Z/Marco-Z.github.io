
var COLORS = {
    'stationary': 'rgb(170, 170, 170)',
    'non-motorized': 'rgb(233, 94, 40)',
    'non-motorized/bicycle': 'rgb(245, 153, 30)',
    'non-motorized/pedestrian': 'rgb(210, 104, 26)',
    'non-motorized/pedestrian/run': 'rgb(245, 30, 39)',
    'non-motorized/pedestrian/walk': 'rgb(210, 50, 26)',
    'motorized': 'rgb(38, 174, 147)',
    'motorized/rail': 'rgb(42, 192, 103)',
    'motorized/rail/metro': 'rgb(0, 138, 56)',
    'motorized/rail/tram': 'rgb(75, 206, 128)',
    'motorized/rail/train': 'rgb(3, 183, 76)',
    'motorized/road': 'rgb(44, 133, 172)',
    'motorized/road/bus': 'rgb(75, 155, 190)',
    'motorized/road/car': 'rgb(5, 86, 121)',
};

function record(e) {
    var now = new Date();
    var tag = e.target.value;
    if (!tag) {
        tag = window.prompt("activity", "unknown")
    }
    if (tag) {
        localStorage.setItem(now.getTime(), tag);
        list();
    }
}

function del(e) {
    var el = e.target.parentElement;
    localStorage.removeItem(el.id);
    el.style.display = "none";
    list();
}

function list() {
    var out = document.getElementById("timeline");
    out.innerHTML = "";
    for (const timestamp in localStorage) {
        if (localStorage.hasOwnProperty(timestamp)) {
            const element = localStorage[timestamp];
            var info = document.createElement("span");
            info.innerText = new Date(parseInt(timestamp)).toLocaleString() + ": " + element;
            var d = document.createElement("span");
            d.innerText = "x";
            d.className = "del";
            d.onclick = del;
            var leg = document.createElement("div");
            leg.id = timestamp;
            leg.appendChild(d);
            leg.appendChild(info);
            out.appendChild(leg);
        }
    }
}

function clear_ls() {
    if (confirm("Delete everything?")) {
        document.getElementById("timeline").innerHTML = "";
        localStorage.clear();
    }
}

function download() {
    var filename = "dump.json";
    var type = "text/plain";
    var data = JSON.stringify(localStorage);
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}


document.addEventListener('DOMContentLoaded', function () {
    console.log("loaded");
    
    document.querySelectorAll('#activities button').forEach(b => {
        b.addEventListener('click', record);
    });
    document.querySelector('#clear').addEventListener('click', clear_ls);
    document.querySelector('#save').addEventListener('click', download);
    list();
});