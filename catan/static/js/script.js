document.getElementById("resourceAmount").addEventListener("click", function(event) {    
    var src = event.srcElement;
    var operation = src.parentNode.classList[0];

    if(operation === "plus"){
        var delta = 1;
    } else if (operation === "minus") {
        var delta = -1
    }
    
    var elements = [...src.parentNode.parentNode.childNodes];
    var count = elements.filter(function(element) {
        if(element.classList){
            return element.classList.contains("count")
        } else {
            return false
        }
    })[0]
    var amount = parseInt(count.innerText); 
    amount += delta;
    count.innerText = amount

})

function getChildren(n, skipMe) {
    var r = [];
    for (; n; n = n.nextSibling)
        if (n.nodeType == 1 && n != skipMe)
            r.push(n);
    return r;
};

function getSiblings(n) {
    return getChildren(n.parentNode.firstChild, n);
}
