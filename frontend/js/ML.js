import { state } from './state.js';

// Make sure state has mlProblemType property
if (!state.hasOwnProperty('mlProblemType')) {
    state.mlProblemType = null;
}

export async function startMLTraining() {
    if (state.isAnimating) return;
    
    const problem = document.getElementById('mlProblem').value;
    const btn = document.getElementById('mlBtn');
    btn.disabled = true;
    state.isAnimating = true;
    
    try {
        const response = await fetch(`${state.API_URL}/ml-classification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                problem_type: problem
            })
        });
        
        const data = await response.json();
        state.mlData = data.data;
        state.mlProblemType = problem;
        await animateMLTraining(data.steps);
    } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to backend. Make sure the Python server is running on ' + state.API_URL.split('/api')[0] + '.');
    }
    
    btn.disabled = false;
    state.isAnimating = false;
}

export async function animateMLTraining(steps) {
    const speed = parseInt(document.getElementById('mlSpeed').value);
    
    for (let step of steps) {
        if (!state.isAnimating) break;
        
        renderMLVisualization(step);
        updateMetrics(step);
        
        await new Promise(resolve => setTimeout(resolve, speed));
    }
}

export function renderMLVisualization(step) {
    const canvas = document.getElementById('mlCanvas');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!state.mlData) return;
    
    const X = state.mlData.X;
    const y = state.mlData.y;
    const predictions = step.predictions;
    
    // Find data bounds with padding
    const xValues = X.map(p => p[0]);
    const yValues = X.map(p => p[1]);
    const minX = Math.min(...xValues) - 1;
    const maxX = Math.max(...xValues) + 1;
    const minY = Math.min(...yValues) - 1;
    const maxY = Math.max(...yValues) + 1;
    
    const padding = 50;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;
    
    function scaleX(x) {
        return padding + ((x - minX) / (maxX - minX)) * width;
    }
    
    function scaleY(y) {
        return canvas.height - padding - ((y - minY) / (maxY - minY)) * height;
    }
    
    // Draw decision boundary
    drawDecisionBoundary(ctx, step.weights, minX, maxX, minY, maxY, scaleX, scaleY);
    
    // Draw axes
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw data points
    X.forEach((point, i) => {
        const x = scaleX(point[0]);
        const yPos = scaleY(point[1]);
        
        ctx.beginPath();
        ctx.arc(x, yPos, 5, 0, 2 * Math.PI);
        
        // Color by actual class
        if (y[i] === 0) {
            ctx.fillStyle = '#3b82f6';
        } else {
            ctx.fillStyle = '#ef4444';
        }
        ctx.fill();
        
        // Add border if misclassified
        if (predictions && predictions[i] !== y[i]) {
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
    
    // Draw legend
    ctx.font = '14px Arial';
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(padding, 10, 15, 15);
    ctx.fillStyle = '#000';
    ctx.fillText('Class 0', padding + 20, 22);
    
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(padding + 100, 10, 15, 15);
    ctx.fillStyle = '#000';
    ctx.fillText('Class 1', padding + 120, 22);
    
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(padding + 200, 10, 15, 15);
    ctx.fillStyle = '#000';
    ctx.fillText('Misclassified', padding + 220, 22);
}

function drawDecisionBoundary(ctx, weights, minX, maxX, minY, maxY, scaleX, scaleY) {
    if (!weights) return;
    
    const resolution = 100;
    const stepX = (maxX - minX) / resolution;
    const stepY = (maxY - minY) / resolution;
    
    // Create a grid and evaluate the network at each point
    for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
            const x = minX + i * stepX;
            const y = minY + j * stepY;
            
            const prediction = evaluateNetwork(x, y, weights, state.mlProblemType);
            
            // Color based on prediction confidence
            const alpha = Math.abs(prediction - 0.5) * 0.3; // Max 0.15 opacity
            if (prediction > 0.5) {
                ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`; // Red for class 1
            } else {
                ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`; // Blue for class 0
            }
            
            ctx.fillRect(scaleX(x), scaleY(y), 
                        Math.ceil(stepX * (maxX - minX) / resolution * 10), 
                        Math.ceil(stepY * (maxY - minY) / resolution * 10));
        }
    }
}

function evaluateNetwork(x, y, weights, problemType) {
    if (problemType === 'linear') {
        // Linear classifier: sigmoid(w * x + b)
        const w = weights['linear.weight'][0]; // [w1, w2]
        const b = weights['linear.bias'][0];
        const z = w[0] * x + w[1] * y + b;
        return sigmoid(z);
    } else {
        // MLP: hidden layer -> output layer
        const w1 = weights['fc1.weight']; // [hidden_size, 2]
        const b1 = weights['fc1.bias'];
        const w2 = weights['fc2.weight']; // [1, hidden_size]
        const b2 = weights['fc2.bias'];
        
        // First layer with ReLU
        const hidden = [];
        for (let i = 0; i < w1.length; i++) {
            const z = w1[i][0] * x + w1[i][1] * y + b1[i];
            hidden.push(Math.max(0, z)); // ReLU
        }
        
        // Output layer with sigmoid
        let output = b2[0];
        for (let i = 0; i < hidden.length; i++) {
            output += w2[0][i] * hidden[i];
        }
        
        return sigmoid(output);
    }
}

function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

export function updateMetrics(step) {
    document.getElementById('epoch').textContent = step.epoch;
    document.getElementById('loss').textContent = (step.loss * 100).toFixed(2) + '%';
    document.getElementById('accuracy').textContent = (step.accuracy * 100).toFixed(2) + '%';
}

export function resetML() {
    state.isAnimating = false;
    state.mlData = null;
    state.mlProblemType = null;
    
    const canvas = document.getElementById('mlCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    document.getElementById('epoch').textContent = '0';
    document.getElementById('loss').textContent = '0.00%';
    document.getElementById('accuracy').textContent = '0.00%';
}