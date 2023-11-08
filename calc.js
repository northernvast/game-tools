function floor(value, digits) {
    let n = Math.pow(10, digits);
    return Math.floor(value * n) / n;
}

function round(value, digits) {
    let n = Math.pow(10, digits);
    return Math.round(value * n) / n;
}

class SubStatCandidate {
    #decimalPlaces;

    constructor(decimalPlaces, initialValues, combination) {
        this.#decimalPlaces = decimalPlaces;
        this.initialValues = initialValues;
        this.combination = combination;
    }

    #calc() {
        let [low, med, high] = this.initialValues;
        let [l, m, h] = this.combination;
        return low*l + med*m + high*h;
    }
    
    get value() {
        let maxDigits = 0;
        for (let i = 0; i < 3; i++) {
            if (this.combination[i] > 0) {
                let decimalPart = this.initialValues[i].toString().split(".")[1];
                if (decimalPart != undefined && maxDigits < decimalPart.length) {
                    maxDigits = decimalPart.length;
                }
            }
        }
        return floor(this.#calc(), maxDigits < 3 ? maxDigits : 3);
    }

    get displayedVal() {
        return floor(this.#calc(), this.#decimalPlaces);
    }

    get timesToUpgrade() {
        let [l, m, h] = this.combination;
        return l + m + h -1;
    }

    get growth() {
        return this.#calc() / this.initialValues[2];
    }
}

let COMBINATIONS = [ // 83 combinations
    [1,0,0],[0,1,0],[0,0,1],[2,0,0],[1,1,0],[1,0,1],[0,2,0],[0,1,1],[0,0,2],[3,0,0],
    [2,1,0],[2,0,1],[1,2,0],[1,1,1],[1,0,2],[0,3,0],[0,2,1],[0,1,2],[0,0,3],[4,0,0],
    [3,1,0],[3,0,1],[2,2,0],[2,1,1],[2,0,2],[1,3,0],[1,2,1],[1,1,2],[1,0,3],[0,4,0],
    [0,3,1],[0,2,2],[0,1,3],[0,0,4],[5,0,0],[4,1,0],[4,0,1],[3,2,0],[3,1,1],[3,0,2],
    [2,3,0],[2,2,1],[2,1,2],[2,0,3],[1,4,0],[1,3,1],[1,2,2],[1,1,3],[1,0,4],[0,5,0],
    [0,4,1],[0,3,2],[0,2,3],[0,1,4],[0,0,5],[6,0,0],[5,1,0],[5,0,1],[4,2,0],[4,1,1],
    [4,0,2],[3,3,0],[3,2,1],[3,1,2],[3,0,3],[2,4,0],[2,3,1],[2,2,2],[2,1,3],[2,0,4],
    [1,5,0],[1,4,1],[1,3,2],[1,2,3],[1,1,4],[1,0,5],[0,6,0],[0,5,1],[0,4,2],[0,3,3],
    [0,2,4],[0,1,5],[0,0,6]
];

class SubStat {
    constructor(name, weight, decimalPlaces, initialValues) {
        this.name = name;
        this.weight = weight;
        this.initialValues = initialValues;
        this.candidates = [];
        this.groups = [];

        for (let c of COMBINATIONS) {
            this.candidates.push(new SubStatCandidate(decimalPlaces, initialValues, c));
        }

        this.candidates.sort((a,b) => a.value - b.value);

        let prev = 0;
        let group = [];
        let isFirst = true;
        for (let c of this.candidates) {
            if (isFirst) {
                isFirst = false;
            } else if (prev != c.displayedVal) {
                this.groups.push(group);
                group = [];
            }
            prev = c.displayedVal;
            group.push(c);
        }
        this.groups.push(group);
    }

    getScore(candidate) {
        return round(candidate.growth * this.weight * 10, 1);
    }
}

const DATA = [
    new SubStat("HP", 0.60, 0, [33.87, 38.103755, 42.33751]),
    new SubStat("攻撃力", 0.60, 0, [16.935, 19.051877, 21.168754]),
    new SubStat("防御力", 0.60, 0, [16.935, 19.051877, 21.168754]),
    new SubStat("速度", 1.04, 0, [2.0, 2.3, 2.6]),
    new SubStat("HP%", 1, 1, [3.456, 3.888, 4.32]),
    new SubStat("攻撃力%", 1, 1, [3.456, 3.888, 4.32]),
    new SubStat("防御力%", 1, 1, [4.32, 4.86, 5.4]),
    new SubStat("会心率", 1, 1, [2.592, 2.916, 3.24]),
    new SubStat("会心ダメージ", 1, 1, [5.184, 5.832, 6.48]),
    new SubStat("撃破特攻", 1, 1, [5.184, 5.832, 6.48]),
    new SubStat("効果命中", 1, 1, [3.456, 3.888, 4.32]),
    new SubStat("効果抵抗", 1, 1, [3.456, 3.888, 4.32])
];

/* UI components */

function clear(e) {
    while (e.firstChild != null) {
        e.removeChild(e.firstChild);
    }
}

function createElementWithText(tagName, text) {
    e = document.createElement(tagName);
    e.appendChild(document.createTextNode(text));
    return e;
}

function updateNames(names) {
    clear(names);
    for (let stat of DATA) {
        names.appendChild(createElementWithText("option", stat.name));
    }
}

const COLORS = ["#99DDFF", "#99FFDD", "#99FF99", "#DDFF99", "#FFDD99", "#FF9999"];
const MIXED_COLORS = ["#99EEEE", "#99FFBB", "#BBFF99", "#EEEE99", "#FFBB99"];

function updateValues(names, values) {
    clear(values);
    let stat = DATA[names.selectedIndex];
    for (let group of stat.groups) {
        let op = createElementWithText("option", group[0].displayedVal);

        let first = group[0].timesToUpgrade;
        let other = first;
        for (let i = 1; i < group.length; i++) {
            other = group[i].timesToUpgrade;
            if (first != other) {  break; }
        }
        if (first < other) {
            op.style.background = MIXED_COLORS[first];
        } else if (first == other) {
            op.style.background = COLORS[first];
        } else {
            op.style.background = MIXED_COLORS[other]
        }

        values.appendChild(op);
    }
}

function updateCandidates(names, values, candidates) {
    clear(candidates);
    let stat = DATA[names.selectedIndex];
    let tr = document.createElement("tr");
    tr.appendChild(createElementWithText("th", "強化"));
    tr.appendChild(createElementWithText("th", "近似値"));
    tr.appendChild(createElementWithText("th", "low"));
    tr.appendChild(createElementWithText("th", "med"));
    tr.appendChild(createElementWithText("th", "high"));
    tr.appendChild(createElementWithText("th", "score"));
    candidates.appendChild(tr);

    for (let candidate of stat.groups[values.selectedIndex]) {
        tr = document.createElement("tr");
        tr.style.background = COLORS[candidate.timesToUpgrade];
        tr.appendChild(createElementWithText("td", "+" + candidate.timesToUpgrade));
        tr.appendChild(createElementWithText("td", candidate.value));
        tr.appendChild(createElementWithText("td", candidate.combination[0]));
        tr.appendChild(createElementWithText("td", candidate.combination[1]));
        tr.appendChild(createElementWithText("td", candidate.combination[2]));
        tr.appendChild(createElementWithText("td", stat.getScore(candidate)));
        candidates.appendChild(tr);
    }
}

function updateWeight(names, weight) {
    weight.value = DATA[names.selectedIndex].weight;
}

function updateScore(elements) {
    let min = 0;
    let max = 0;
    for (let o of elements) {
        let stat = DATA[o.names.selectedIndex];
        let group = stat.groups[o.values.selectedIndex];

        min += stat.getScore(group[0]);
        max += stat.getScore(group[group.length -1]);
    }
    min = round(min, 1);
    max = round(max, 1);
    if (min == max) {
        document.getElementById("score").textContent = min;
    } else {
        document.getElementById("score").innerHTML = `${min}&ndash;${max}`;
    }
}

function init() {
    let elements = [];
    for (let i = 0; i < 4; i++) {
        let names = document.getElementById("sub-stat-names" + i);
        let values = document.getElementById("sub-stat-values" + i);
        let candidates = document.getElementById("sub-stat-candidates" + i);
        let weight = document.getElementById("sub-stat-weight" + i);
        elements.push({names: names, values: values});

        updateNames(names);
        switch (i) {
            case 0: names.selectedIndex = 1; break;
            case 1: names.selectedIndex = 5; break;
            case 2: names.selectedIndex = 7; break;
            case 3: names.selectedIndex = 8; break;
            default:
        }
        updateValues(names, values);
        updateCandidates(names, values, candidates);
        updateWeight(names, weight);


        names.addEventListener("change", () => {
            updateValues(names, values);
            updateCandidates(names, values, candidates);
            updateWeight(names, weight);
            updateScore(elements);
        });

        values.addEventListener("change", () => {
            updateCandidates(names, values, candidates);
            updateScore(elements);
        });

        weight.addEventListener("change", () => {
            DATA[names.selectedIndex].weight = weight.value;
            updateCandidates(names, values, candidates);
            updateWeight(names, weight);
            updateScore(elements);
        });
    }
    updateScore(elements);
}

init();
