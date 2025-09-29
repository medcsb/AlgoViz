import { playBeep } from "./sound.js";
import { state } from "./state.js";

export function generateNewArray() {
    state.currentArray = [];
    for (let i = 0; i < 50; i++) {
        state.currentArray.push(Math.floor(Math.random() * 90) + 10);
    }
    renderBars(state.currentArray);
}

export function renderBars(arr, comparing = [], swapping = [], sorted = []) {
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

export async function startSorting() {
    if (state.isAnimating) return;
    
    const algo = document.getElementById('sortAlgo').value;
    const btn = document.getElementById('sortBtn');
    btn.disabled = true;
    state.isAnimating = true;
    
    try {
        const response = await fetch(`${state.API_URL}/sort`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                array: state.currentArray,
                algorithm: algo
            })
        });
        
        const data = await response.json();
        await animateSorting(data.steps);
    } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to backend. Make sure the Python server is running on ' + state.API_URL.split('/api')[0] + '.');
    }
    
    btn.disabled = false;
    state.isAnimating = false;
}

export async function animateSorting(steps) {
    const speed = document.getElementById('sortSpeed').value;
    
    for (let step of steps) {
        if (!state.isAnimating) break;
        
        renderBars(
            step.array,
            step.comparing || [],
            step.swapping || [],
            step.sorted || []
        );

        // Play sound for comparisons (throttled)
        if (step.comparing && step.comparing.length > 0) {
            const val = step.array[step.comparing[0]];
            const frequency = 200 + (val / 100) * 400; // Narrower, more pleasant range
            playBeep(frequency, Math.max(30, speed / 3), 'sine'); // Shorter duration, sine wave
        }
        
        await new Promise(resolve => setTimeout(resolve, speed));
    }
}

export function resetSorting() {
    state.isAnimating = false;
    generateNewArray();
}