from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import random
import numpy as np
import json

import ML
import path_finding
import sorting

app = Flask(__name__, static_folder="../frontend", static_url_path="")
CORS(app)

# ============ API ENDPOINTS ============

@app.route('/')
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route('/api/sort', methods=['POST'])
def sort_array():
    data = request.json
    array = data.get('array', [])
    algorithm = data.get('algorithm', 'bubble')

    algorithms = {
        'bubble': sorting.bubble_sort,
        'quick': sorting.quick_sort,
        'merge': sorting.merge_sort,
        'insertion': sorting.insertion_sort,
        'selection': sorting.selection_sort
    }

    func = algorithms.get(algorithm)
    if not func:
        return jsonify({'error': 'Unknown algorithm'}), 400
    
    return jsonify({'steps': func(array), 'original': array})

@app.route('/api/pathfinding', methods=['POST'])
def pathfinding():
    data = request.json
    rows = data.get('rows', 20)
    cols = data.get('cols', 20)
    start = data.get('start')
    end = data.get('end')
    algorithm = data.get('algorithm', 'dijkstra')
    maze = data.get('maze')
    
    if not maze:
        maze = path_finding.generate_maze(rows, cols)
    
    if not start:
        start = [0, 0]
    if not end:
        end = [rows - 1, cols - 1]

    algorithms = {
        'dijkstra': path_finding.dijkstra,
        'astar': path_finding.a_star,
        'bfs': path_finding.bfs,
        'dfs': path_finding.dfs
    }
    
    func = algorithms.get(algorithm)
    if not func:
        return jsonify({'error': 'Unknown algorithm'}), 400
    
    steps = func(maze, tuple(start), tuple(end))
    return jsonify({
        'steps': steps,
        'maze': maze,
        'start': start,
        'end': end
    })

@app.route('/api/ml-classification', methods=['POST'])
def ml_classification():
    data = request.json
    problem_type = data.get('problem_type', 'linear')
    epochs = data.get('epochs', 50)
    
    X, y = ML.generate_classification_data(problem_type)
    steps = ML.simple_neural_network(X, y, epochs)
    
    return jsonify({
        'steps': steps,
        'data': {
            'X': X,
            'y': y
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=1222)