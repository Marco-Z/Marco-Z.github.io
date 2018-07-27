var openFile = function (event) {
    var input = event.target;
    function loadFile(event) {
        var data = JSON.parse(this.result);
        data.name = this.fName
        timelines.sources.push(data);
    };    
    for (const i in input.files) {
        if (input.files.hasOwnProperty(i)) {
            const file = input.files[i];
            var reader = new FileReader();            
            reader.fName = file.name;
            reader.onload = loadFile;
            reader.readAsText(file);
        }
    }
};

var vLine = document.querySelector(".vl");

document.addEventListener('mousemove', function (e) {
    if (e.target.classList.contains("leg")) {
        vLine.style.left = e.clientX + 'px';
    } else {
        vLine.style.left = '-1px';
    }
});