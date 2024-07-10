const CLASS_COUNT = 13
const TREES = [
    "AR", "L", "PC", "PS", "AB"
]

var state = {
    zones: [],
    trees: [...TREES],
    treeCountsByZone: {},
    selectedTree: TREES[0],
    selectedZone: null
}

const getEmptyCounts = (classes) => 
    [...Array(classes).keys()]
        .reduce((acc, treeClass) => ({...acc, [treeClass+1]: 0}), {})

const getEmptyTreeCounts = (trees) => 
    trees.reduce((acc, tree) => ({...acc, [tree]: getEmptyCounts(CLASS_COUNT)}), {})

const initTreeCounts = (zone, trees) => {
    state.treeCountsByZone[zone] = getEmptyTreeCounts(trees)
}

const renderCounters = (tree) => {
    if (!state.selectedZone) {
        document.getElementById("tree-counts").innerHTML = null
        return
    }
    const treeCountSection = document.getElementById("tree-counts")
    treeCountSection.innerHTML = null
    treeCountSection.setAttribute("tree", tree)
    const zone = state.selectedZone

    const treeCountByClass = state.treeCountsByZone[zone][tree]
    for (const treeClass in treeCountByClass) {
        const stepper = createStepper(treeClass, treeCountByClass[treeClass])
        treeCountSection.innerHTML += stepper
    }
}

const saveData = () => {
    localStorage.setItem("state", JSON.stringify(state))
}

const loadData = () => {
    const savedState = localStorage.getItem("state")
    if (savedState) {
        state = JSON.parse(savedState)
        return
    }
    for (const zone of state.zones) {
        initTreeCounts(zone, TREES)
    }
}

const resetData = () => {
    const shouldDelete = confirm("Cancella tutto?");
    if (!shouldDelete) {
        return;
    }
    state = {
        zones: [],
        trees: [...TREES],
        treeCountsByZone: {},
        selectedTree: TREES[0],
        selectedZone: null
    }
    saveData()
    document.getElementById("zone-selection-form").innerHTML = null
    document.getElementById("tree-selection-form").innerHTML = null
    document.getElementById("tree-counts").innerHTML = null
}

const update = (target, op) => {
    const sign = op === "+" ? 1 : -1
    const zone = state.selectedZone
    const tree = state.selectedTree
    const treeClass = target.id
    const newValue = Math.max(0, state.treeCountsByZone[zone][tree][treeClass] + 1 * sign)
    state.treeCountsByZone[zone][tree][treeClass] = newValue
    target.getElementsByClassName("count")[0].innerText = newValue
}

const step = (target) => {
    const start = Date.now()
    target.ontouchend = (e) => {
        e.preventDefault()
        const end = Date.now()
        const op = end-start < 400 ? "+" : "-"
        update(target, op)
        saveData()
        updateTreeTotals()
        updateZoneTotals()
    }
    target.onmouseup = target.ontouchend
}

const createStepper = (treeClassName, treeCount) => {
    return `
    <button class="stepper" ontouchstart="step(this)" id=${treeClassName}>
        <div class="class">${treeClassName}</div>
        <div class="count">${treeCount}</div>
    </button>`
}

const countTreeTotal = (zone, tree) => {
    const treeCounts = state.treeCountsByZone[zone]
    return Object.values(treeCounts[tree]).reduce((a,b) => a+b);
}

const countZoneTotal = (zone) => {
    const treeCounts = state.treeCountsByZone[zone]
    return Object.keys(treeCounts)
        .map(tree => countTreeTotal(zone, tree))
        .reduce((a,b) => a+b)
}

const updateZoneTotals = () => {
    const totalElement = document
        .getElementById(state.selectedZone)
        .parentElement
        .getElementsByClassName("count")[0]
    const total = countZoneTotal(state.selectedZone)
    totalElement.innerText = total
}

const renderZoneSelection = (zones) => {
    if (!state.zones.length) {
        document.getElementById("zone-selection-form").innerHTML = null
        return
    }
    const zoneSelection = document.getElementById("zone-selection-form")
    zoneSelection.innerHTML = zones.map(zone => `
    <label for="${zone}">
        <input type="radio" name="zones" id="${zone}" value="${zone}" class="hidden">
        <span class="zone">
            <span class="name">${zone}</span>
            <div class="count">${countZoneTotal(zone)}</div>
        </span>
    </label>
    `).join("")

    zoneSelection.onchange = (event) => {
        state.selectedZone = event.target.value
        renderTreeSelection(state.trees)
        saveData()
    }
    document.getElementById(state.selectedZone).click()
}

const updateTreeTotals = () => {
    const totalElement = document
        .getElementById(state.selectedTree)
        .parentElement
        .getElementsByClassName("count")[0]
    const total = countTreeTotal(state.selectedZone, state.selectedTree)
    totalElement.innerText = total
}

const renderTreeSelection = (trees) => {
    if (!state.selectedZone) {
        document.getElementById("tree-selection-form").innerHTML = null
        return
    }
    const treeSelection = document.getElementById("tree-selection")
    const treeRadios = trees.map(tree => `
    <label for="${tree}">
        <input type="radio" name="trees" id="${tree}" value="${tree}" class="hidden">
        <span class="tree">
            <div class="name">${tree}</div>
            <div class="count">${countTreeTotal(state.selectedZone, tree)}</div>
        </span>
    </label>
    `).join("")

    treeSelection.innerHTML = `
    <form id="tree-selection-form" class="grid col-3">
        ${treeRadios}
    </form>`

    document.getElementById("tree-selection-form").onchange = (event) => {
        state.selectedTree = event.target.value
        renderCounters(state.selectedTree)
        saveData()
    }
    document.getElementById(state.selectedTree).click()
}

const onZoneConfirm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const input = e.target.getElementsByTagName("input")[0];
    const newZone = input.value

    if (!state.zones.includes(newZone)) {
        state.zones.push(newZone)
        initTreeCounts(newZone, TREES)
        if (!state.selectedZone) {
            state.selectedZone = state.zones[0] || null
        }
    } else {
        state.zones = state.zones.filter(zone => newZone !== zone)
        delete state.treeCountsByZone[newZone]
        if (state.selectedZone === newZone) {
            state.selectedZone = state.zones[0]
        }
    }
    renderZoneSelection(state.zones)
    renderTreeSelection(state.selectedTree)
    renderCounters(state.selectedTree)
    input.value = ""
    saveData()
}

const getNotes = () => {
    return document.getElementById("note").value
}

const exportData = () => {
    filename=`martellata_${new Date().toLocaleDateString("it")}.xlsx`
    const wb = XLSX.utils.book_new()

    const notesSheet = XLSX.utils.json_to_sheet([{note: getNotes()}])
    XLSX.utils.book_append_sheet(wb, notesSheet, "note")

    for (zone in state.treeCountsByZone) {
        let i = 0
        treeCountByClass = {"totale": {}}
        for (tree in state.treeCountsByZone[zone]) {
            for (treeClass in state.treeCountsByZone[zone][tree]) {
                treeCountByClass[treeClass] = treeCountByClass[treeClass] || {}
                treeCountByClass[treeClass][tree] = state.treeCountsByZone[zone][tree][treeClass]
            }
        }
        treeCountByClass["totale"][zone] = countZoneTotal(zone)
        data = []
        for (treeClass in treeCountByClass) {
            data.push({classe: treeClass, ...(treeCountByClass[treeClass])})
        }
        
        const ws = XLSX.utils.json_to_sheet(data)
        const columns = "BCDEFGHIJKLMNOPQRSTUVWYYZ"
        const row = CLASS_COUNT + 2
        for (let i = 0; i < state.trees.length; i++) {
            const col = columns[i]
            const formula = `SUM(${col}1:${col}${row-1})`
            XLSX.utils.sheet_set_array_formula(ws, `${col}${row}`, formula);
        }
        XLSX.utils.sheet_set_array_formula(ws, `${columns[state.trees.length]}${row}`, `SUM(${columns[0]}${row}:${columns[state.trees.length-1]}${row})`);
        XLSX.utils.book_append_sheet(wb, ws, zone)
    }
    XLSX.writeFile(wb,filename);
}

loadData()
renderZoneSelection(state.zones)
renderTreeSelection(state.trees)
renderCounters(state.selectedTree)
