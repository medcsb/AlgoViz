import * as ML from './ML.js';
import * as path_finding from './path_finding.js';
import * as sorting from './sorting.js';

// Tab switching
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

window.switchTab = switchTab;

// ========== SORTING ==========
window.generateNewArray = sorting.generateNewArray;
window.renderBars = sorting.renderBars;
window.startSorting = sorting.startSorting;
window.resetSorting = sorting.resetSorting;

document.getElementById('sortSpeed').addEventListener('input', (e) => {
    document.getElementById('sortSpeedValue').textContent = (e.target.value) + 'ms';
});

// ========== PATHFINDING ==========
window.generateNewMaze = path_finding.generateNewMaze;
window.renderMaze = path_finding.renderMaze;
window.startPathfinding = path_finding.startPathfinding;
window.resetPathfinding = path_finding.resetPathfinding;
window.clearMaze = path_finding.clearMaze;

document.getElementById('pathSpeed').addEventListener('input', (e) => {
    document.getElementById('pathSpeedValue').textContent = (e.target.value) + 'ms';
});

// ========== ML CLASSIFICATION ==========
window.loadMLData = ML.loadMLData;
window.startMLTraining = ML.startMLTraining;
window.resetML = ML.resetML;
window.renderMLVisualization = ML.renderMLVisualization;

document.getElementById('mlSpeed').addEventListener('input', (e) => {
    document.getElementById('mlSpeedValue').textContent = e.target.value + 'ms';
});

// Initialize on page load
window.onload = () => {
    generateNewArray();
    generateNewMaze();
};