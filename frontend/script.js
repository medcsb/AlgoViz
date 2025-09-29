const API_URL = 'http://localhost:1222/api';

// Global state
let currentArray = [];
let currentMaze = [];
let mazeStart = null;
let mazeEnd = null;
let mlData = null;
let isAnimating = false;

// Tab switching
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// ========== SORTING ==========
function generateNewArray() {
    currentArray = [];
    for (let i = 0; i < 50; i++) {
        currentArray.push(Math.floor(Math.random() * 90) + 10);
    }
    renderBars(currentArray);
}

function renderBars(arr, comparing = [], swapping = [], sorted = []) {
    const container = document.getElementById('barsContainer');
    container.innerHTML = '';
    
    const maxVal = Math.max(...arr);
    
    arr.forEach((val, idx) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${(val / maxVal) * 100}%`;
        
        if (sorted.includes(idx)) {
            bar.classList.add('sorted');
        } else if (comparing.includes(idx)) {
            bar.classList.add('comparing');
        } else if (swapping.includes(idx)) {
            bar.classList.add('swapping');
        }
        
        container.appendChild(bar);
    });
}

async function startSorting() {
    if (isAnimating) return;
    
    const algo = document.getElementById('sortAlgo').value;
    const btn = document.getElementById('sortBtn');
    btn.disabled = true;
    isAnimating = true;
    
    try {
        const response = await fetch(`${API_URL}/sort`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                array: currentArray,
                algorithm: algo
            })
        });
        
        const data = await response.json();
        await animateSorting(data.steps);
    } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to backend. Make sure the Python server is running on port 5000.');
    }
    
    btn.disabled = false;
    isAnimating = false;
}

async function animateSorting(steps) {
    const speed = document.getElementById('sortSpeed').value;
    
    for (let step of steps) {
        if (!isAnimating) break;
        
        renderBars(
            step.array,
            step.comparing || [],
            step.swapping || [],
            step.sorted || []
        );
        
        await new Promise(resolve => setTimeout(resolve, speed));
    }
}

function resetSorting() {
    isAnimating = false;
    generateNewArray();
}

document.getElementById('sortSpeed').addEventListener('input', (e) => {
    document.getElementById('sortSpeedValue').textContent = (e.target.value) + 'ms';
});

// ========== PATHFINDING ==========
function generateNewMaze() {
    const rows = 20;
    const cols = 25;
    
    fetch(`${API_URL}/pathfinding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows, cols })
    })
    .then(res => res.json())
    .then(data => {
        currentMaze = data.maze;
        mazeStart = [0, 0];
        mazeEnd = [rows - 1, cols - 1];
        renderMaze();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error connecting to backend. Make sure the Python server is running on port 5000.');
    });
}

function clearMaze() {
    if (!currentMaze.length) return;
    
    currentMaze = currentMaze.map(row => row.map(() => 0));
    renderMaze();
}

function renderMaze(visited = [], current = null, path = []) {
    const container = document.getElementById('mazeContainer');
    container.innerHTML = '';
    
    if (!currentMaze.length) return;
    
    const cols = currentMaze[0].length;
    container.style.gridTemplateColumns = `repeat(${cols}, 25px)`;
    
    currentMaze.forEach((row, r) => {
        row.forEach((cell, c) => {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            cellDiv.dataset.row = r;
            cellDiv.dataset.col = c;
            
            if (cell === 1) {
                cellDiv.classList.add('wall');
            }
            
            if (mazeStart && mazeStart[0] === r && mazeStart[1] === c) {
                cellDiv.classList.add('start');
            } else if (mazeEnd && mazeEnd[0] === r && mazeEnd[1] === c) {
                cellDiv.classList.add('end');
            } else if (path.some(p => p[0] === r && p[1] === c)) {
                cellDiv.classList.add('path');
            } else if (current && current[0] === r && current[1] === c) {
                cellDiv.classList.add('current');
            } else if (visited.some(v => v[0] === r && v[1] === c)) {
                cellDiv.classList.add('visited');
            }
            
            cellDiv.addEventListener('click', () => toggleCell(r, c));
            container.appendChild(cellDiv);
        });
    });
}

function toggleCell(r, c) {
    if (isAnimating) return;
    
    if (!mazeStart) {
        mazeStart = [r, c];
        currentMaze[r][c] = 0;
    } else if (!mazeEnd) {
        mazeEnd = [r, c];
        currentMaze[r][c] = 0;
    } else {
        if (mazeStart[0] === r && mazeStart[1] === c) {
            mazeStart = null;
        } else if (mazeEnd[0] === r && mazeEnd[1] === c) {
            mazeEnd = null;
        } else {
            currentMaze[r][c] = currentMaze[r][c] === 0 ? 1 : 0;
        }
    }
    
    renderMaze();
}

async function startPathfinding() {
    if (isAnimating || !mazeStart || !mazeEnd) {
        alert('Please set both start and end points!');
        return;
    }
    
    const algo = document.getElementById('pathAlgo').value;
    const btn = document.getElementById('pathBtn');
    btn.disabled = true;
    isAnimating = true;
    
    try {
        const response = await fetch(`${API_URL}/pathfinding`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                maze: currentMaze,
                start: mazeStart,
                end: mazeEnd,
                algorithm: algo
            })
        });
        
        const data = await response.json();
        await animatePathfinding(data.steps);
    } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to backend. Make sure the Python server is running on port 5000.');
    }
    
    btn.disabled = false;
    isAnimating = false;
}

async function animatePathfinding(steps) {
    const speed = document.getElementById('pathSpeed').value;
    
    for (let step of steps) {
        if (!isAnimating) break;
        
        renderMaze(step.visited, step.current, step.path);
        await new Promise(resolve => setTimeout(resolve, speed));
    }
}

function resetPathfinding() {
    isAnimating = false;
    renderMaze();
}

document.getElementById('pathSpeed').addEventListener('input', (e) => {
    document.getElementById('pathSpeedValue').textContent = (e.target.value) + 'ms';
});

// ========== ML CLASSIFICATION ==========
async function startMLTraining() {
    if (isAnimating) return;
    
    const problem = document.getElementById('mlProblem').value;
    const btn = document.getElementById('mlBtn');
    btn.disabled = true;
    isAnimating = true;
    
    try {
        const response = await fetch(`${API_URL}/ml-classification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                problem_type: problem,
                epochs: 50
            })
        });
        
        const data = await response.json();
        mlData = data.data;
        await animateMLTraining(data.steps);
    } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to backend. Make sure the Python server is running on port 5000.');
    }
    
    btn.disabled = false;
    isAnimating = false;
}

async function animateMLTraining(steps) {
    const speed = parseInt(document.getElementById('mlSpeed').value);
    
    for (let step of steps) {
        if (!isAnimating) break;
        
        renderMLVisualization(step);
        updateMetrics(step);
        
        await new Promise(resolve => setTimeout(resolve, speed));
    }
}

function renderMLVisualization(step) {
    const canvas = document.getElementById('mlCanvas');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!mlData) return;
    
    const X = mlData.X;
    const y = mlData.y;
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

function updateMetrics(step) {
    document.getElementById('epoch').textContent = step.epoch;
    document.getElementById('loss').textContent = step.loss.toFixed(4);
    document.getElementById('accuracy').textContent = (step.accuracy * 100).toFixed(2) + '%';
}

function resetML() {
    isAnimating = false;
    const canvas = document.getElementById('mlCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    document.getElementById('epoch').textContent = '0';
    document.getElementById('loss').textContent = '0.0000';
    document.getElementById('accuracy').textContent = '0.00%';
}

document.getElementById('mlSpeed').addEventListener('input', (e) => {
    document.getElementById('mlSpeedValue').textContent = e.target.value + 'ms';
});

// Initialize on page load
generateNewArray();
generateNewMaze();