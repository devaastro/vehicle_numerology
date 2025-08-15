// === GLOBALS ===
let numerologyData = {};
const HISTORY_KEY = 'vehicleHistory';
const MAX_DAYS = 30 * 24 * 60 * 60 * 1000; // 30 days

// === LOAD DATA ===
async function loadNumerologyData() {
    try {
        const response = await fetch('vehicle_numerology.json');
        const data = await response.json();
        numerologyData = data.numerology_data;
    } catch (error) {
        console.error('Error loading numerology data:', error);
        showError('Failed to load numerology data. Please refresh the page.');
    }
}

// === MAPPING ===
const alphabetToNumber = {
    'a': 1, 'i': 1, 'j': 1, 'q': 1, 'y': 1,
    'b': 2, 'k': 2, 'r': 2,
    'c': 3, 'g': 3, 'l': 3, 's': 3,
    'd': 4, 'm': 4, 't': 4,
    'e': 5, 'h': 5, 'n': 5, 'x': 5,
    'u': 6, 'v': 6, 'w': 6,
    'o': 7, 'z': 7,
    'f': 8, 'p': 8
};

// === NUMEROLOGY CALCULATION ===
function calculateVehicleNumerology(vehicleNumber) {
    if (!vehicleNumber.trim()) throw new Error('Please enter a vehicle number');

    const cleanNumber = vehicleNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (!cleanNumber) throw new Error('Please enter a valid vehicle number');

    let sum = 0;
    let breakdown = [];
    let steps = [];

    for (let char of cleanNumber) {
        if (!isNaN(char)) {
            sum += parseInt(char);
            breakdown.push(`${char.toUpperCase()} = ${char}`);
        } else if (alphabetToNumber[char]) {
            sum += alphabetToNumber[char];
            breakdown.push(`${char.toUpperCase()} = ${alphabetToNumber[char]}`);
        }
    }

    steps.push(`Original: ${vehicleNumber.toUpperCase()}`);
    steps.push(`Breakdown: ${breakdown.join(', ')}`);
    steps.push(`Sum: ${breakdown.map(b => b.split(' = ')[1]).join(' + ')} = ${sum}`);

    while (sum > 9) {
        const digits = sum.toString().split('').map(Number);
        steps.push(`Reduction: ${sum} → ${digits.join(' + ')} = ${digits.reduce((a, b) => a + b)}`);
        sum = digits.reduce((a, b) => a + b);
    }

    steps.push(`Final Number: ${sum}`);

    return { finalNumber: sum, steps, breakdown };
}

// === DISPLAY FUNCTIONS ===
function showCalculationSteps(calculation) {
    const calculationSteps = document.getElementById('calculationSteps');
    const finalNumber = document.getElementById('finalNumber');
    calculationSteps.innerHTML = calculation.steps.map(step => `<div>${step}</div>`).join('');
    finalNumber.textContent = calculation.finalNumber;
    document.getElementById('calculationSection').style.display = 'block';
}

function showNumerologyResult(number, data) {
    document.getElementById('resultNumber').textContent = number;
    document.getElementById('planetName').textContent = data.planet;
    document.getElementById('planetEnglish').textContent = `(${data.planet_english})`;

    const posList = document.getElementById('positiveAspects');
    const negList = document.getElementById('negativeAspects');
    posList.innerHTML = data.positive_aspects.map(a => `<li>${a}</li>`).join('');
    negList.innerHTML = data.negative_aspects.map(a => `<li>${a}</li>`).join('');

    document.getElementById('adviceText').textContent = data.advice;
    document.getElementById('suitableText').textContent = data.suitable_for;

    document.getElementById('resultSection').style.display = 'block';
}

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorSection').style.display = 'block';
}

function hideAllSections() {
    document.getElementById('calculationSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('errorSection').style.display = 'none';
}

function clearResults() {
    document.getElementById('vehicleNumber').value = '';
    hideAllSections();
}

// === HISTORY FUNCTIONS ===
function saveHistory(vehicleNumber, finalNumber) {
    let history = getHistory();
    history.push({ value: vehicleNumber, finalNumber, date: Date.now() });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function getHistory() {
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    const now = Date.now();
    history = history.filter(item => (now - item.date) < MAX_DAYS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return history;
}

function renderHistory() {
    const history = getHistory();
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    if (history.length === 0) {
        historyList.innerHTML = '<li class="empty">No history yet</li>';
        return;
    }

    history.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
            <span class="history-text">${item.value} → ${item.finalNumber}</span>
            <button class="delete-btn" data-index="${index}">✕</button>
        `;

        li.querySelector('.history-text').addEventListener('click', () => {
            document.getElementById('vehicleNumber').value = item.value;
            calculateNumerology();
            toggleSidebar(false);
        });

        li.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            let h = getHistory();
            h.splice(index, 1);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
            renderHistory();
        });

        historyList.appendChild(li);
    });
}

function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
}

// === SIDEBAR CONTROL ===
function toggleSidebar(force = null) {
    const sidebar = document.getElementById('historySidebar');
    const overlay = document.getElementById('overlay');
    const isOpen = sidebar.classList.contains('open');

    if (force === true || (!isOpen && force !== false)) {
        sidebar.classList.add('open');
        overlay.classList.add('show');
    } else {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    }
}

// === MAIN CALCULATION ===
async function calculateNumerology() {
    const vehicleNumber = document.getElementById('vehicleNumber').value.trim();
    hideAllSections();
    if (!vehicleNumber) {
        showError('Please enter a vehicle number');
        return;
    }

    try {
        const calculation = calculateVehicleNumerology(vehicleNumber);
        const finalNumber = calculation.finalNumber;
        showCalculationSteps(calculation);
        if (numerologyData[finalNumber]) {
            showNumerologyResult(finalNumber, numerologyData[finalNumber]);
        } else throw new Error('Numerology data not found for this number');

        saveHistory(vehicleNumber, finalNumber);
    } catch (error) {
        showError(error.message);
    }
}

// === EVENT LISTENERS ===
document.addEventListener('DOMContentLoaded', () => {
    loadNumerologyData();
    document.getElementById('historyToggle').addEventListener('click', () => {
        toggleSidebar(true);
        renderHistory();
    });
    document.getElementById('closeSidebar').addEventListener('click', () => toggleSidebar(false));
    document.getElementById('overlay').addEventListener('click', () => toggleSidebar(false));
    document.getElementById('vehicleNumber').addEventListener('keypress', e => {
        if (e.key === 'Enter') calculateNumerology();
    });
    document.getElementById('vehicleNumber').addEventListener('input', e => {
        e.target.value = e.target.value.toUpperCase();
    });
});
