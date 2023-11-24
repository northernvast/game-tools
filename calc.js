function last(array) { return array[array.length -1]; }

function round(number, scale) {
    let power = Math.pow(10, scale);
    return Math.round(number * power) / power;
}

function format(number, scale) {
    if (scale == 0) {
        return Math.floor(number).toString();
    }
    let s = Math.floor(number * Math.pow(10, scale)).toString();
    let p = s.length - scale;
    return s.slice(0, p) + "." + s.slice(p);
}

class PossibleValue {
    constructor(stat, quantities) {
        this.stat = stat;
        this.quantities = quantities;
    }

    #calc(digits) {
        let [low, med, high] = this.stat.initialValues;
        let [l, m, h] = this.quantities;
        let n = Math.pow(10, digits);
        return Math.floor(n*low*l + n*med*m + n*high*h) / n;
    }

    get value() { return this.#calc(3); }

    get displayValue() { return format(this.value, this.stat.scale); }

    get level() { return this.quantities.reduce((a,b)=>a+b, -1); }

    get score() { return round(this.value / last(this.stat.initialValues) * this.stat.weight * 10, 1); }
}

class SubStat {
    static COMBINATIONS = [ // 83 combinations
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

    constructor(name, initialValues, scale, weight) {
        this.name = name;
        this.initialValues = initialValues;
        this.scale = scale;
        this.weight = weight;
        this.values = new Array(83);
        this.groups = [];

        for (let i = 0; i < 83; i++) {
            this.values[i] = new PossibleValue(this, SubStat.COMBINATIONS[i]);
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
}

/* UI components */

const data = [
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

// Very pale tone
const COLORS = ["#FBDAC8","#FEECD2","#FFFCDB","#D4ECEA","#D3DEF1","#D2CCE6"];

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

class SubStatPicker {
    constructor(parent, index) {
        this.names = parent.getElementsByClassName("sub-stat-names")[0];
        this.values = parent.getElementsByClassName("sub-stat-display-values")[0];
        this.weight = parent.getElementsByClassName("sub-stat-weight")[0];
        this.details = parent.getElementsByClassName("sub-stat-details")[0];

        for (let stat of data) {
            this.names.appendChild(createElementWithText("option", stat.name));
        }
        this.names.selectedIndex = index;

        this.updateWeight();
        this.updateValues();
        this.updateDetails();

        this.names.addEventListener("change", () => {
            this.updateWeight();
            this.updateValues();
            this.updateDetails();
        });

        this.weight.addEventListener("change", () => {
            data[this.names.selectedIndex].weight = this.weight.value;
            this.updateDetails();
        });

        this.values.addEventListener("change", () => {
            this.updateDetails();
        });
    }

    updateWeight() {
        this.weight.value = data[this.names.selectedIndex].weight;
    }

    updateValues() {
        clear(this.values);
        let stat = data[this.names.selectedIndex];
        for (let group of stat.groups) {
            let op = createElementWithText("option", group[0].displayValue);
            op.style.background = COLORS[group[0].level];
            this.values.appendChild(op);
        }
    }

    updateDetails() {
        clear(this.details)
        let tr = document.createElement("tr");
        tr.appendChild(createElementWithText("th", "強化"));
        tr.appendChild(createElementWithText("th", "近似値"));
        tr.appendChild(createElementWithText("th", "low"));
        tr.appendChild(createElementWithText("th", "med"));
        tr.appendChild(createElementWithText("th", "high"));
        tr.appendChild(createElementWithText("th", "score"));
        this.details.appendChild(tr);

        let stat = data[this.names.selectedIndex];
        for (let v of stat.groups[this.values.selectedIndex]) {
            tr = document.createElement("tr");
            tr.style.background = COLORS[v.level];
            tr.appendChild(createElementWithText("td", "+" + v.level));
            tr.appendChild(createElementWithText("td", v.value));
            tr.appendChild(createElementWithText("td", v.quantities[0]));
            tr.appendChild(createElementWithText("td", v.quantities[1]));
            tr.appendChild(createElementWithText("td", v.quantities[2]));
            tr.appendChild(createElementWithText("td", v.score));
            this.details.appendChild(tr);
        }
    }
}

const pickers = [];
const score = document.getElementById("score");

function updateScore() {
    let min = 0;
    let max = 0;
    for (let i = 0; i < 4; i++) {
        let stat = data[pickers[i].names.selectedIndex];
        let group = stat.groups[pickers[i].values.selectedIndex];
        min += group[0].score;
        max += group[group.length -1].score;
    }
    if (min == max) {
        score.textContent = round(min,1);
    } else {
        score.innerHTML = `${round(min,1)}&ndash;${round(max,1)}`;
    }
}

function init() {
    let parents = document.getElementsByClassName("sub-stat");
    pickers.push(new SubStatPicker(parents[0], 1));
    pickers.push(new SubStatPicker(parents[1], 5));
    pickers.push(new SubStatPicker(parents[2], 7));
    pickers.push(new SubStatPicker(parents[3], 8));

    for (let s of pickers) {
        s.names.addEventListener("change", updateScore);
        s.values.addEventListener("change", updateScore);
        s.weight.addEventListener("change", updateScore);
    }
    updateScore();
}

init();
