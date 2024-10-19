const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load input from input.json
const inputPath = path.join(__dirname, 'input.json');
const inputData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

const n = inputData.keys.n;
const k = inputData.keys.k;

// Helper function to convert number from a given base to base 10
function toBase10(base, value) {
    return parseInt(value, base);
}

// Prepare the shares from the input JSON data
const shares = [];

Object.keys(inputData).forEach((key) => {
    if (key !== 'keys') {
        const base = parseInt(inputData[key].base, 10);
        const value = inputData[key].value;
        shares.push({ x: parseInt(key), y: toBase10(base, value) });
    }
});

// Helper function to generate random coefficients for the polynomial
function generateCoefficients(secret, degree) {
    const coefficients = [secret];  // First coefficient is the secret
    for (let i = 1; i <= degree; i++) {
        coefficients.push(parseInt(crypto.randomBytes(32).toString('hex'), 16));
    }
    return coefficients;
}

// Function to evaluate the polynomial at a given x
function evaluatePolynomial(coefficients, x) {
    let result = coefficients[0];
    for (let i = 1; i < coefficients.length; i++) {
        result += coefficients[i] * Math.pow(x, i);
    }
    return result;
}

// Lagrange Interpolation - Derive the secret from shares
function lagrangeInterpolation(shares) {
    let secret = 0;

    for (let i = 0; i < shares.length; i++) {
        let li = 1;
        for (let j = 0; j < shares.length; j++) {
            if (i !== j) {
                li *= (0 - shares[j].x) / (shares[i].x - shares[j].x);
            }
        }
        secret += li * shares[i].y;
    }

    return Math.round(secret);  // Round the result to the nearest integer
}

// Function to derive the secret from the shares
function deriveSecret(shares) {
    return lagrangeInterpolation(shares);
}

// Main execution
console.log("Shares:", shares);
const secret = deriveSecret(shares);
console.log("Derived secret:", secret);
