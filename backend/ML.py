import numpy as np

# ============ ML CLASSIFICATION ============

def generate_classification_data(problem_type):
    np.random.seed(42)
    
    if problem_type == 'linear':
        # Linearly separable data
        X1 = np.random.randn(50, 2) + np.array([2, 2])
        X2 = np.random.randn(50, 2) + np.array([-2, -2])
        X = np.vstack([X1, X2])
        y = np.hstack([np.zeros(50), np.ones(50)])
        
    elif problem_type == 'circular':
        # Circular pattern
        theta = np.random.uniform(0, 2 * np.pi, 100)
        r1 = np.random.uniform(0, 2, 50)
        r2 = np.random.uniform(3, 5, 50)
        
        X1 = np.column_stack([r1 * np.cos(theta[:50]), r1 * np.sin(theta[:50])])
        X2 = np.column_stack([r2 * np.cos(theta[50:]), r2 * np.sin(theta[50:])])
        X = np.vstack([X1, X2])
        y = np.hstack([np.zeros(50), np.ones(50)])
        
    elif problem_type == 'xor':
        # XOR pattern
        X1 = np.random.randn(25, 2) + np.array([2, 2])
        X2 = np.random.randn(25, 2) + np.array([-2, -2])
        X3 = np.random.randn(25, 2) + np.array([2, -2])
        X4 = np.random.randn(25, 2) + np.array([-2, 2])
        X = np.vstack([X1, X2, X3, X4])
        y = np.hstack([np.zeros(25), np.zeros(25), np.ones(25), np.ones(25)])
    
    return X.tolist(), y.tolist()

def simple_neural_network(X, y, epochs=50):
    X = np.array(X)
    y = np.array(y).reshape(-1, 1)
    
    # Simple 2-layer network
    np.random.seed(42)
    w1 = np.random.randn(2, 4) * 0.5
    b1 = np.zeros((1, 4))
    w2 = np.random.randn(4, 1) * 0.5
    b2 = np.zeros((1, 1))
    
    learning_rate = 0.1
    steps = []
    
    def sigmoid(x):
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))
    
    def sigmoid_derivative(x):
        return x * (1 - x)
    
    for epoch in range(epochs):
        # Forward pass
        z1 = np.dot(X, w1) + b1
        a1 = sigmoid(z1)
        z2 = np.dot(a1, w2) + b2
        a2 = sigmoid(z2)
        
        # Calculate loss
        loss = np.mean((y - a2) ** 2)
        
        # Backward pass
        dz2 = (a2 - y) * sigmoid_derivative(a2)
        dw2 = np.dot(a1.T, dz2)
        db2 = np.sum(dz2, axis=0, keepdims=True)
        
        dz1 = np.dot(dz2, w2.T) * sigmoid_derivative(a1)
        dw1 = np.dot(X.T, dz1)
        db1 = np.sum(dz1, axis=0, keepdims=True)
        
        # Update weights
        w1 -= learning_rate * dw1
        b1 -= learning_rate * db1
        w2 -= learning_rate * dw2
        b2 -= learning_rate * db2
        
        if epoch % 5 == 0:
            predictions = (a2 > 0.5).astype(int).flatten().tolist()
            accuracy = np.mean(predictions == y.flatten())
            
            steps.append({
                'epoch': epoch,
                'loss': float(loss),
                'accuracy': float(accuracy),
                'predictions': predictions,
                'weights': {
                    'w1': w1.tolist(),
                    'w2': w2.tolist()
                }
            })
    
    return steps