import { state } from './state.js';

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
                problem_type: problem,
                epochs: 50
            })
        });
        
        const data = await response.json();
        state.mlData = data.data;
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
    
    // Find data bounds
    const xValues = X.map(p => p[0]);
    const yValues = X.map(p => p[1]);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    
    const padding = 50;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;
    
    function scaleX(x) {
        return padding + ((x - minX) / (maxX - minX)) * width;
    }
    
    function scaleY(y) {
        return canvas.height - padding - ((y - minY) / (maxY - minY)) * height;
    }
    
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
        const y = scaleY(point[1]);
        
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        
        // Color by actual class
        if (y[i] === 0) {
            ctx.fillStyle = '#3b82f6';
        } else {
            ctx.fillStyle = '#ef4444';
        }
        ctx.fill();
        
        // Border by prediction
        if (predictions && predictions[i] !== y[i]) {
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 3;
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
}

export function updateMetrics(step) {
    document.getElementById('epoch').textContent = step.epoch;
    document.getElementById('loss').textContent = step.loss.toFixed(4);
    document.getElementById('accuracy').textContent = (step.accuracy * 100).toFixed(2) + '%';
}

export function resetML() {
    state.isAnimating = false;
    const canvas = document.getElementById('mlCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    document.getElementById('epoch').textContent = '0';
    document.getElementById('loss').textContent = '0.0000';
    document.getElementById('accuracy').textContent = '0.00%';
}