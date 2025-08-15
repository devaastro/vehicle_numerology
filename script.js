// Global variables
let numerologyData = {};

// Load JSON data
async function loadNumerologyData() {
    try {
        const response = await fetch('vehicle_numerology.json');
        const data = await response.json();
        numerologyData = data.numerology_data;
        console.log('Numerology data loaded successfully');
    } catch (error) {
        console.error('Error loading numerology data:', error);
        showError('Failed to load numerology data. Please refresh the page.');
    }
}

// Alphabet to number mapping
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

// Calculate numerology for vehicle number
function calculateVehicleNumerology(vehicleNumber) {
    if (!vehicleNumber || vehicleNumber.trim() === '') {
        throw new Error('Please enter a vehicle number');
    }

    const cleanNumber = vehicleNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    if (cleanNumber.length === 0) {
        throw new Error('Please enter a valid vehicle number');
    }

    let sum = 0;
    let steps = [];
    let breakdown = [];

    // Process each character
    for (let char of cleanNumber) {
        if (char >= '0' && char <= '9') {
            // It's a digit
            const digit = parseInt(char);
            sum += digit;
            breakdown.push(`${char.toUpperCase()} = ${digit}`);
        } else if (alphabetToNumber[char]) {
            // It's a letter
            const value = alphabetToNumber[char];
            sum += value;
            breakdown.push(`${char.toUpperCase()} = ${value}`);
        }
    }

    steps.push(`Original: ${vehicleNumber.toUpperCase()}`);
    steps.push(`Breakdown: ${breakdown.join(', ')}`);
    steps.push(`Sum: ${breakdown.map(b => b.split(' = ')[1]).join(' + ')} = ${sum}`);

    // Reduce to single digit
    let reductionSteps = [];
    while (sum > 9) {
        const digits = sum.toString().split('').map(d => parseInt(d));
        reductionSteps.push(`${sum} → ${digits.join(' + ')} = ${digits.reduce((a, b) => a + b, 0)}`);
        sum = digits.reduce((a, b) => a + b, 0);
    }

    if (reductionSteps.length > 0) {
        steps.push(`Reduction: ${reductionSteps.join(', ')}`);
    }

    steps.push(`Final Number: ${sum}`);

    return {
        finalNumber: sum,
        steps: steps,
        breakdown: breakdown
    };
}

// Main calculation function
async function calculateNumerology() {
    const vehicleNumberInput = document.getElementById('vehicleNumber');
    const vehicleNumber = vehicleNumberInput.value.trim();

    // Clear previous results
    hideAllSections();

    if (!vehicleNumber) {
        showError('Please enter a vehicle number');
        return;
    }

    try {
        // Calculate numerology
        const calculation = calculateVehicleNumerology(vehicleNumber);
        const finalNumber = calculation.finalNumber;

        // Show calculation steps
        showCalculationSteps(calculation);

        // Get numerology data
        if (numerologyData[finalNumber]) {
            showNumerologyResult(finalNumber, numerologyData[finalNumber]);
        } else {
            throw new Error('Numerology data not found for this number');
        }

    } catch (error) {
        showError(error.message);
    }
}

// Show calculation steps
function showCalculationSteps(calculation) {
    const calculationSection = document.getElementById('calculationSection');
    const calculationSteps = document.getElementById('calculationSteps');
    const finalNumber = document.getElementById('finalNumber');

    let stepsHtml = '<div class="calculation-steps">';
    calculation.steps.forEach(step => {
        stepsHtml += `<div>${step}</div>`;
    });
    stepsHtml += '</div>';

    calculationSteps.innerHTML = stepsHtml;
    finalNumber.textContent = calculation.finalNumber;
    
    calculationSection.style.display = 'block';
}

// Show numerology result
function showNumerologyResult(number, data) {
    const resultSection = document.getElementById('resultSection');
    const resultNumber = document.getElementById('resultNumber');
    const planetName = document.getElementById('planetName');
    const planetEnglish = document.getElementById('planetEnglish');
    const positiveAspects = document.getElementById('positiveAspects');
    const negativeAspects = document.getElementById('negativeAspects');
    const adviceText = document.getElementById('adviceText');
    const suitableText = document.getElementById('suitableText');

    // Set basic info
    resultNumber.textContent = number;
    planetName.textContent = data.planet;
    planetEnglish.textContent = `(${data.planet_english})`;

    // Set positive aspects
    positiveAspects.innerHTML = '';
    data.positive_aspects.forEach(aspect => {
        const li = document.createElement('li');
        li.textContent = aspect;
        positiveAspects.appendChild(li);
    });

    // Set negative aspects
    negativeAspects.innerHTML = '';
    data.negative_aspects.forEach(aspect => {
        const li = document.createElement('li');
        li.textContent = aspect;
        negativeAspects.appendChild(li);
    });

    // Set advice and suitable for
    adviceText.textContent = data.advice;
    suitableText.textContent = data.suitable_for;

    resultSection.style.display = 'block';
}

// Show error message
function showError(message) {
    const errorSection = document.getElementById('errorSection');
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
}

// Hide all result sections
function hideAllSections() {
    document.getElementById('calculationSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('errorSection').style.display = 'none';
}

// Clear all results and input
function clearResults() {
    document.getElementById('vehicleNumber').value = '';
    hideAllSections();
    document.getElementById('vehicleNumber').focus();
}

// Handle Enter key press
document.addEventListener('DOMContentLoaded', function() {
    const vehicleNumberInput = document.getElementById('vehicleNumber');
    
    vehicleNumberInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            calculateNumerology();
        }
    });

    // Auto-format input (uppercase)
    vehicleNumberInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.toUpperCase();
    });

    // Load numerology data on page load
    loadNumerologyData();
});

// Add some example numbers for testing
function addExampleNumbers() {
    const examples = ['CG20J5339', 'MH01AB1234', '1234', 'UP14AT7890'];
    console.log('Example numbers for testing:', examples);
}