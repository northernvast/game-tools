function round(value, digits) {
    let n = Math.pow(10, digits);
    return Math.round(value * n) / n;
}

function format(value, digits) {
    if (digits == 0) {
        return Math.floor(value).toString();
    }
    let s = Math.floor(value * Math.pow(10, digits)).toString();
    let p = s.length - digits;
    return s.slice(0, p) + "." + s.slice(p);
}

class PossibleValue {
    #decimalPlaces;

    constructor(initialValues, combination, decimalPlaces) {
        this.initialValues = initialValues;
        this.combination = combination;
        this.#decimalPlaces = decimalPlaces;
    }

    // not accurate
    #calc(digits) {
        let [low, med, high] = this.initialValues;
        let [l, m, h] = this.combination;
        let n = Math.pow(10, digits);
        return Math.floor(n*low*l + n*med*m + n*high*h) / n;
    }

    get value() {
        return this.#calc(3);
    }

    get displayValue() {
        return format(this.value, this.#decimalPlaces); // String
    }

    get timesUpgrade() {
        let [l, m, h] = this.combination;
        return l + m + h -1;
    }

    get rate() {
        return this.value / this.initialValues[2];
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
    constructor(name, initialValues, decimalPlaces, weight) {
        this.name = name;
        this.values = new Array(83);
        this.groups = [];
        this.weight = weight;

        for (let i = 0; i < COMBINATIONS.length; i++) {
            this.values[i] = new PossibleValue(initialValues, COMBINATIONS[i], decimalPlaces);
        }

        this.values.sort((a,b) => a.value - b.value);

        let prev = "";
        let group = [];
        let isFirst = true;
        for (let v of this.values) {
            let crnt = v.displayValue;
            if (isFirst) {
                isFirst = false;
            } else if (crnt != prev) {
                this.groups.push(group);
                group = [];
            }
            group.push(v);
            prev = crnt;
        }
        this.groups.push(group);
    }

    calcScore(v) {
        return round(v.rate * this.weight * 10, 1);
    }
}

const DATA = [
    new SubStat("HP", [33.87, 38.103755, 42.33751], 0, 0.60),
    new SubStat("攻撃力", [16.935, 19.051877, 21.168754], 0, 0.60),
    new SubStat("防御力", [16.935, 19.051877, 21.168754], 0, 0.60),
    new SubStat("速度", [2.0, 2.3, 2.6], 0, 1.04),
    new SubStat("HP%", [3.456, 3.888, 4.32], 1, 1),
    new SubStat("攻撃力%", [3.456, 3.888, 4.32], 1, 1),
    new SubStat("防御力%", [4.32, 4.86, 5.4], 1, 1),
    new SubStat("会心率", [2.592, 2.916, 3.24], 1, 1),
    new SubStat("会心ダメージ", [5.184, 5.832, 6.48], 1, 1),
    new SubStat("撃破特攻", [5.184, 5.832, 6.48], 1, 1),
    new SubStat("効果命中", [3.456, 3.888, 4.32], 1, 1),
    new SubStat("効果抵抗", [3.456, 3.888, 4.32], 1, 1)
];

/* UI components */

// Very pale tone
const COLORS = ["#FBDAC8","#FEECD2","#FFFCDB","#D4ECEA","#D3DEF1","#D2CCE6"];

const NAMES_ELEMENTS = [];
const DISPLAY_VALUES_ELEMENTS = [];
const DETAILS_ELEMENTS = [];
const WEIGHT_ELEMENTS = [];

for (let i = 0; i < 4; i++) {
    NAMES_ELEMENTS[i] = document.getElementById("sub-stat-names" + i);
    DISPLAY_VALUES_ELEMENTS[i] = document.getElementById("sub-stat-display-values" + i);
    DETAILS_ELEMENTS[i] = document.getElementById("sub-stat-details" + i);
    WEIGHT_ELEMENTS[i] = document.getElementById("sub-stat-weight" + i);
}

const SCORE_ELEMENT = document.getElementById("score");

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

function updateNamesElement(index) {
    clear(NAMES_ELEMENTS[index]);
    for (let stat of DATA) {
        NAMES_ELEMENTS[index].appendChild(createElementWithText("option", stat.name));
    }
}

function updateDisplayValuesElement(index) {
    clear(DISPLAY_VALUES_ELEMENTS[index]);
    let stat = DATA[NAMES_ELEMENTS[index].selectedIndex];
    for (let group of stat.groups) {
        let op = createElementWithText("option", group[0].displayValue);
        op.style.background = COLORS[group[0].timesUpgrade];
        DISPLAY_VALUES_ELEMENTS[index].appendChild(op);
    }
}

function updateDetailsElement(index) {
    clear(DETAILS_ELEMENTS[index]);
    let stat = DATA[NAMES_ELEMENTS[index].selectedIndex];
    let tr = document.createElement("tr");
    tr.appendChild(createElementWithText("th", "強化"));
    tr.appendChild(createElementWithText("th", "近似値"));
    tr.appendChild(createElementWithText("th", "low"));
    tr.appendChild(createElementWithText("th", "med"));
    tr.appendChild(createElementWithText("th", "high"));
    tr.appendChild(createElementWithText("th", "score"));
    DETAILS_ELEMENTS[index].appendChild(tr);

    for (let v of stat.groups[DISPLAY_VALUES_ELEMENTS[index].selectedIndex]) {
        tr = document.createElement("tr");
        tr.style.background = COLORS[v.timesUpgrade];
        tr.appendChild(createElementWithText("td", "+" + v.timesUpgrade));
        tr.appendChild(createElementWithText("td", v.value));
        tr.appendChild(createElementWithText("td", v.combination[0]));
        tr.appendChild(createElementWithText("td", v.combination[1]));
        tr.appendChild(createElementWithText("td", v.combination[2]));
        tr.appendChild(createElementWithText("td", stat.calcScore(v)));
        DETAILS_ELEMENTS[index].appendChild(tr);
    }
}

function updateWeightElement(index) {
    WEIGHT_ELEMENTS[index].value = DATA[NAMES_ELEMENTS[index].selectedIndex].weight;
}

function updateScoreElement() {
    let min = 0;
    let max = 0;
    for (let i = 0; i < 4; i++) {
        let stat = DATA[NAMES_ELEMENTS[i].selectedIndex];
        let group = stat.groups[DISPLAY_VALUES_ELEMENTS[i].selectedIndex];
        min += stat.calcScore(group[0]);
        max += stat.calcScore(group[group.length -1]);
    }
    min = round(min, 1);
    max = round(max, 1);
    if (min == max) {
        SCORE_ELEMENT.textContent = min;
    } else {
        SCORE_ELEMENT.innerHTML = `${min}&ndash;${max}`;
    }
}

function init() {
    for (let i = 0; i < 4; i++) {
        updateNamesElement(i);
        switch (i) {
            case 0: NAMES_ELEMENTS[i].selectedIndex = 1; break;
            case 1: NAMES_ELEMENTS[i].selectedIndex = 5; break;
            case 2: NAMES_ELEMENTS[i].selectedIndex = 7; break;
            case 3: NAMES_ELEMENTS[i].selectedIndex = 8; break;
            default:
        }
        updateDisplayValuesElement(i);
        updateDetailsElement(i);
        updateWeightElement(i);
        NAMES_ELEMENTS[i].addEventListener("change", () => {
            updateDisplayValuesElement(i);
            updateDetailsElement(i);
            updateWeightElement(i);
            updateScoreElement();
        });
        DISPLAY_VALUES_ELEMENTS[i].addEventListener("change", () => {
            updateDetailsElement(i);
            updateScoreElement();
        });
        WEIGHT_ELEMENTS[i].addEventListener("change", () => {
            DATA[NAMES_ELEMENTS[i].selectedIndex].weight = WEIGHT_ELEMENTS[i].value;
            updateDetailsElement(i);
            updateWeightElement(i);
            updateScoreElement();
        });
    }
    updateScoreElement();
}

init();
