const CLASS_COUNT = 13
const TREES = [
    "AR", "L", "PC", "PS", "AB"
]

const INITIAL_ZONES = [
    "particella"
]

var state = {
    zones: [...INITIAL_ZONES],
    trees: [...TREES],
    treeCountsByZone: {},
    selectedTree: TREES[0],
    selectedZone: INITIAL_ZONES[0]
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
    state = {
        zones: [...INITIAL_ZONES],
        trees: [...TREES],
        treeCountsByZone: {},
        selectedTree: TREES[0],
        selectedZone: INITIAL_ZONES[0]
    }
    for (const zone of state.zones) {
        initTreeCounts(zone, TREES)
    }
    renderZoneSelection(state.zones)
    renderTreeSelection(state.trees)
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

const renderZoneSelection = (zones) => {
    const zoneSelection = document.getElementById("zone-selection-form")
    zoneSelection.innerHTML = zones.map(zone => `
    <label for="${zone}">
        <input type="radio" name="zones" id="${zone}" value="${zone}" class="hidden">
        <span class="name">${zone}</span>
    </label>
    `).join("")

    zoneSelection.onchange = (event) => {
        state.selectedZone = event.target.value
        renderTreeSelection(state.trees)
        saveData()
    }
    document.getElementById(state.selectedZone).click()
}

const renderTreeSelection = (trees) => {
    const treeSelection = document.getElementById("tree-selection")
    const treeRadios = trees.map(tree => `
    <label for="${tree}">
        <input type="radio" name="trees" id="${tree}" value="${tree}" class="hidden">
        <span class="name">${tree}</span>
    </label>
    `).join("")

    treeSelection.innerHTML = `
    <form id="tree-selection-form" class="grid col-2">
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
    } else {
        state.zones = state.zones.filter(zone => newZone !== zone)
        delete state.treeCountsByZone[newZone]
        if (state.selectedZone === newZone) {
            state.selectedZone = state.zones[0]
        }
    }
    renderZoneSelection(state.zones)
    input.value = null
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
        treeCountByClass = {}
        for (tree in state.treeCountsByZone[zone]) {
            for (treeClass in state.treeCountsByZone[zone][tree]) {
                treeCountByClass[treeClass] = treeCountByClass[treeClass] || {}
                treeCountByClass[treeClass][tree] = state.treeCountsByZone[zone][tree][treeClass]
            }
        }
        data = []
        for (treeClass in treeCountByClass) {
            data.push({classe: treeClass, ...(treeCountByClass[treeClass])})
        }
        
        const ws = XLSX.utils.json_to_sheet(data)
        XLSX.utils.book_append_sheet(wb, ws, zone)
    }
    XLSX.writeFile(wb,filename);
}

loadData()
renderZoneSelection(state.zones)
renderTreeSelection(state.trees)
renderCounters(state.selectedTree)
