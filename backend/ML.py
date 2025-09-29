import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

# ============ ML CLASSIFICATION ============

def generate_classification_data(problem_type, n_samples=200):
    """Generate classification datasets"""
    np.random.seed(42)
    
    if problem_type == 'linear':
        # Linearly separable data - two Gaussian clusters
        X1 = np.random.randn(n_samples // 2, 2) * 0.8 + np.array([2, 2])
        X2 = np.random.randn(n_samples // 2, 2) * 0.8 + np.array([-2, -2])
        X = np.vstack([X1, X2])
        y = np.hstack([np.zeros(n_samples // 2), np.ones(n_samples // 2)])
        
    elif problem_type == 'xor':
        # XOR pattern - requires hidden layers
        n_per_class = n_samples // 4
        X1 = np.random.randn(n_per_class, 2) * 0.5 + np.array([1.5, 1.5])
        X2 = np.random.randn(n_per_class, 2) * 0.5 + np.array([-1.5, -1.5])
        X3 = np.random.randn(n_per_class, 2) * 0.5 + np.array([1.5, -1.5])
        X4 = np.random.randn(n_per_class, 2) * 0.5 + np.array([-1.5, 1.5])
        X = np.vstack([X1, X2, X3, X4])
        y = np.hstack([np.zeros(n_per_class), np.zeros(n_per_class), 
                       np.ones(n_per_class), np.ones(n_per_class)])
        
    elif problem_type == 'circle':
        # Concentric circles - inner circle is class 0, outer is class 1
        n_per_class = n_samples // 2
        
        # Inner circle
        theta1 = np.random.uniform(0, 2 * np.pi, n_per_class)
        r1 = np.random.uniform(0, 1.5, n_per_class)
        X1 = np.column_stack([r1 * np.cos(theta1), r1 * np.sin(theta1)])
        
        # Outer circle
        theta2 = np.random.uniform(0, 2 * np.pi, n_per_class)
        r2 = np.random.uniform(2.5, 4, n_per_class)
        X2 = np.column_stack([r2 * np.cos(theta2), r2 * np.sin(theta2)])
        
        X = np.vstack([X1, X2])
        y = np.hstack([np.zeros(n_per_class), np.ones(n_per_class)])
    
    # Shuffle the data
    indices = np.random.permutation(len(X))
    X = X[indices]
    y = y[indices]
    
    return X.tolist(), y.tolist()


class LinearClassifier(nn.Module):
    """Simple linear classifier for linearly separable data"""
    def __init__(self):
        super().__init__()
        self.linear = nn.Linear(2, 1)
    
    def forward(self, x):
        return torch.sigmoid(self.linear(x))


class MLPClassifier(nn.Module):
    """Multi-layer perceptron for XOR and circle patterns"""
    def __init__(self, hidden_size=8):
        super().__init__()
        self.fc1 = nn.Linear(2, hidden_size)
        self.fc2 = nn.Linear(hidden_size, 1)
    
    def forward(self, x):
        x = torch.relu(self.fc1(x))
        return torch.sigmoid(self.fc2(x))


def train_neural_network(X, y, problem_type, max_epochs=10000, batch_size=10):
    """
    Train neural network and return snapshots every 10 epochs
    """
    X_tensor = torch.FloatTensor(X)
    y_tensor = torch.FloatTensor(y).reshape(-1, 1)
    
    # Choose model based on problem type
    if problem_type == 'linear':
        model = LinearClassifier()
        learning_rate = 0.1
    else:  # xor or circle
        model = MLPClassifier(hidden_size=16)
        learning_rate = 0.01
    
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    
    steps = []
    
    for epoch in range(max_epochs):
        # Forward pass
        outputs = model(X_tensor)
        loss = criterion(outputs, y_tensor)
        
        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        
        # Record every 10 epochs
        if epoch % batch_size == 0 or epoch == max_epochs - 1:
            with torch.no_grad():
                predictions = (outputs > 0.5).float().squeeze().numpy().tolist()
                accuracy = (outputs.round() == y_tensor).float().mean().item()
                
                # Extract weights for visualization
                weights = {}
                for name, param in model.named_parameters():
                    weights[name] = param.data.numpy().tolist()
                
                steps.append({
                    'epoch': epoch,
                    'loss': float(loss.item()),
                    'accuracy': float(accuracy),
                    'predictions': predictions,
                    'weights': weights
                })
                
                # Stop if we reach 99% accuracy
                if accuracy >= 0.99:
                    break
    
    return steps


def simple_neural_network(X, y, problem_type):
    """Main entry point for training"""
    return train_neural_network(X, y, problem_type)