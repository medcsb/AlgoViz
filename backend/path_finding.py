import random
from collections import deque

# ============ PATHFINDING ALGORITHMS ============

def generate_maze(rows, cols):
    maze = [[0 for _ in range(cols)] for _ in range(rows)]
    
    # Add random walls (30% density)
    for i in range(rows):
        for j in range(cols):
            if random.random() < 0.3:
                maze[i][j] = 1
    
    return maze

def dijkstra(maze, start, end):
    steps = []
    rows, cols = len(maze), len(maze[0])
    
    # Ensure start and end are not walls
    maze[start[0]][start[1]] = 0
    maze[end[0]][end[1]] = 0
    
    visited = set()
    distances = {(start[0], start[1]): 0}
    parent = {}
    unvisited = [(0, start[0], start[1])]
    
    directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    
    while unvisited:
        unvisited.sort()
        dist, r, c = unvisited.pop(0)
        
        if (r, c) in visited:
            continue
        
        visited.add((r, c))
        
        steps.append({
            'visited': list(visited),
            'current': [r, c],
            'path': []
        })
        
        if r == end[0] and c == end[1]:
            # Reconstruct path
            path = []
            curr = (r, c)
            while curr in parent:
                path.append(list(curr))
                curr = parent[curr]
            path.append(list(start))
            path.reverse()
            
            steps.append({
                'visited': list(visited),
                'current': [r, c],
                'path': path,
                'complete': True
            })
            break
        
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            
            if (0 <= nr < rows and 0 <= nc < cols and 
                maze[nr][nc] == 0 and (nr, nc) not in visited):
                
                new_dist = dist + 1
                
                if (nr, nc) not in distances or new_dist < distances[(nr, nc)]:
                    distances[(nr, nc)] = new_dist
                    parent[(nr, nc)] = (r, c)
                    unvisited.append((new_dist, nr, nc))
    
    return steps

def a_star(maze, start, end):
    steps = []
    rows, cols = len(maze), len(maze[0])
    
    maze[start[0]][start[1]] = 0
    maze[end[0]][end[1]] = 0
    
    def heuristic(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])
    
    visited = set()
    g_score = {(start[0], start[1]): 0}
    f_score = {(start[0], start[1]): heuristic(start, end)}
    parent = {}
    open_set = [(f_score[(start[0], start[1])], start[0], start[1])]
    
    directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    
    while open_set:
        open_set.sort()
        _, r, c = open_set.pop(0)
        
        if (r, c) in visited:
            continue
        
        visited.add((r, c))
        
        steps.append({
            'visited': list(visited),
            'current': [r, c],
            'path': []
        })
        
        if r == end[0] and c == end[1]:
            path = []
            curr = (r, c)
            while curr in parent:
                path.append(list(curr))
                curr = parent[curr]
            path.append(list(start))
            path.reverse()
            
            steps.append({
                'visited': list(visited),
                'current': [r, c],
                'path': path,
                'complete': True
            })
            break
        
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            
            if (0 <= nr < rows and 0 <= nc < cols and 
                maze[nr][nc] == 0 and (nr, nc) not in visited):
                
                tentative_g = g_score[(r, c)] + 1
                
                if (nr, nc) not in g_score or tentative_g < g_score[(nr, nc)]:
                    parent[(nr, nc)] = (r, c)
                    g_score[(nr, nc)] = tentative_g
                    f_score[(nr, nc)] = tentative_g + heuristic([nr, nc], end)
                    open_set.append((f_score[(nr, nc)], nr, nc))
    
    return steps

def bfs(maze, start, end):
    steps = []
    rows, cols = len(maze), len(maze[0])
    
    maze[start[0]][start[1]] = 0
    maze[end[0]][end[1]] = 0
    
    visited = set()
    parent = {}
    queue = deque([start])
    
    directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    
    while queue:
        r, c = queue.popleft()
        
        if (r, c) in visited:
            continue
        
        visited.add((r, c))
        steps.append({
            'visited': list(visited),
            'current': [r, c],
            'path': []
        })
        
        if (r, c) == end:
            # Reconstruct path
            path = []
            curr = (r, c)
            while curr in parent:
                path.append(list(curr))
                curr = parent[curr]
            path.append(list(start))
            path.reverse()
            
            steps.append({
                'visited': list(visited),
                'current': [r, c],
                'path': path,
                'complete': True
            })
            break
        
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if (0 <= nr < rows and 0 <= nc < cols and
                maze[nr][nc] == 0 and (nr, nc) not in visited):
                if (nr, nc) not in queue:
                    parent[(nr, nc)] = (r, c)
                    queue.append((nr, nc))
    
    return steps


# ============ DFS ============
def dfs(maze, start, end):
    steps = []
    rows, cols = len(maze), len(maze[0])

    maze[start[0]][start[1]] = 0
    maze[end[0]][end[1]] = 0

    visited = set()
    parent = {}
    stack = [start]
    pushed = set([tuple(start)])  # track what’s already on stack

    directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]

    while stack:
        r, c = stack.pop()

        visited.add((r, c))
        steps.append({
            'visited': list(visited),
            'current': [r, c],
            'path': []
        })

        if (r, c) == end:
            # Reconstruct path
            path = []
            curr = (r, c)
            while curr in parent:
                path.append(list(curr))
                curr = parent[curr]
            path.append(list(start))
            path.reverse()

            steps.append({
                'visited': list(visited),
                'current': [r, c],
                'path': path,
                'complete': True
            })
            break

        # Push neighbors in **reverse order** for DFS
        for dr, dc in directions[::-1]:
            nr, nc = r + dr, c + dc
            if (0 <= nr < rows and 0 <= nc < cols and
                maze[nr][nc] == 0 and (nr, nc) not in visited and (nr, nc) not in pushed):
                parent[(nr, nc)] = (r, c)
                stack.append((nr, nc))
                pushed.add((nr, nc))

    return steps