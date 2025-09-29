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
    
    if not array:
        array = [random.randint(10, 100) for _ in range(20)]
    
    if algorithm == 'bubble':
        steps = sorting.bubble_sort(array)
    elif algorithm == 'quick':
        steps = sorting.quick_sort(array)
    elif algorithm == 'merge':
        steps = sorting.merge_sort(array)
    else:
        return jsonify({'error': 'Unknown algorithm'}), 400
    
    return jsonify({'steps': steps, 'original': array})

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
    
    if algorithm == 'dijkstra':
        steps = path_finding.dijkstra(maze, start, end)
    elif algorithm == 'astar':
        steps = path_finding.a_star(maze, start, end)
    else:
        return jsonify({'error': 'Unknown algorithm'}), 400
    
    return jsonify({'steps': steps, 'maze': maze})

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