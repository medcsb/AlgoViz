import { playBeep } from "./sound.js";
import { state } from "./state.js";

export function generateNewMaze() {
    const rows = 20;
    const cols = 25;
    
    fetch(`${state.API_URL}/pathfinding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows, cols })
    })
    .then(res => res.json())
    .then(data => {
        state.currentMaze = data.maze;
        state.mazeStart = [0, 0];
        state.mazeEnd = [rows - 1, cols - 1];
        renderMaze();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error connecting to backend. Make sure the Python server is running on ' + state.API_URL.split('/api')[0] + '.');
    });
}

export function clearMaze() {
    if (!state.currentMaze.length) return;
    
    state.currentMaze = state.currentMaze.map(row => row.map(() => 0));
    renderMaze();
}

function renderMaze(visited = [], current = null, path = []) {
    const container = document.getElementById('mazeContainer');
    container.innerHTML = '';
    
    if (!state.currentMaze.length) return;
    
    const cols = state.currentMaze[0].length;
    container.style.gridTemplateColumns = `repeat(${cols}, 25px)`;
    
    state.currentMaze.forEach((row, r) => {
        row.forEach((cell, c) => {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            cellDiv.dataset.row = r;
            cellDiv.dataset.col = c;
            
            if (cell === 1) {
                cellDiv.classList.add('wall');
            }
            
            if (state.mazeStart && state.mazeStart[0] === r && state.mazeStart[1] === c) {
                cellDiv.classList.add('start');
            } else if (state.mazeEnd && state.mazeEnd[0] === r && state.mazeEnd[1] === c) {
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
    if (state.isAnimating) return;
    
    if (!state.mazeStart) {
        state.mazeStart = [r, c];
        state.currentMaze[r][c] = 0;
    } else if (!state.mazeEnd) {
        state.mazeEnd = [r, c];
        state.currentMaze[r][c] = 0;
    } else {
        if (state.mazeStart[0] === r && state.mazeStart[1] === c) {
            state.mazeStart = null;
        } else if (state.mazeEnd[0] === r && state.mazeEnd[1] === c) {
            state.mazeEnd = null;
        } else {
            state.currentMaze[r][c] = state.currentMaze[r][c] === 0 ? 1 : 0;
        }
    }
    
    renderMaze();
}

export async function startPathfinding() {
    if (state.isAnimating || !state.mazeStart || !state.mazeEnd) {
        alert('Please set both start and end points!');
        return;
    }
    
    const algo = document.getElementById('pathAlgo').value;
    const btn = document.getElementById('pathBtn');
    btn.disabled = true;
    state.isAnimating = true;
    
    try {
        const response = await fetch(`${state.API_URL}/pathfinding`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                maze: state.currentMaze,
                start: state.mazeStart,
                end: state.mazeEnd,
                algorithm: algo
            })
        });
        
        const data = await response.json();
        await animatePathfinding(data.steps);
    } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to backend. Make sure the Python server is running on ' + state.API_URL.split('/api')[0] + '.');
    }
    
    btn.disabled = false;
    state.isAnimating = false;
}

async function animatePathfinding(steps) {
    const speed = document.getElementById('pathSpeed').value;
    
    for (let step of steps) {
        if (!state.isAnimating) break;
        
        renderMaze(step.visited, step.current, step.path);

        // Play sound for visiting cells
        if (step.current) {
            const frequency = 300 + (step.visited.length % 100) * 5;
            playBeep(frequency, Math.max(20, speed / 2), 'square');
        }
        await new Promise(resolve => setTimeout(resolve, speed));
    }
}

export function resetPathfinding() {
    state.isAnimating = false;
    renderMaze();
}