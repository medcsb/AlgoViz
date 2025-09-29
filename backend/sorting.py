# ============ SORTING ALGORITHMS ============

def bubble_sort(arr):
    steps = []
    arr_copy = arr.copy()
    n = len(arr_copy)
    
    for i in range(n):
        for j in range(0, n - i - 1):
            steps.append({
                'array': arr_copy.copy(),
                'comparing': [j, j + 1],
                'sorted': list(range(n - i, n))
            })
            
            if arr_copy[j] > arr_copy[j + 1]:
                arr_copy[j], arr_copy[j + 1] = arr_copy[j + 1], arr_copy[j]
                steps.append({
                    'array': arr_copy.copy(),
                    'swapping': [j, j + 1],
                    'sorted': list(range(n - i, n))
                })
    
    steps.append({
        'array': arr_copy.copy(),
        'sorted': list(range(n)),
        'comparing': [],
        'complete': True
    })
    
    return steps

def quick_sort(arr):
    steps = []
    arr_copy = arr.copy()
    sorted_indices = set()  # Track sorted elements
    
    def partition(low, high):
        pivot = arr_copy[high]
        i = low - 1
        
        steps.append({
            'array': arr_copy.copy(),
            'pivot': high,
            'range': [low, high],
            'sorted': list(sorted_indices)
        })
        
        for j in range(low, high):
            steps.append({
                'array': arr_copy.copy(),
                'comparing': [j, high],
                'pivot': high,
                'sorted': list(sorted_indices)
            })
            
            if arr_copy[j] < pivot:
                i += 1
                arr_copy[i], arr_copy[j] = arr_copy[j], arr_copy[i]
                if i != j:
                    steps.append({
                        'array': arr_copy.copy(),
                        'swapping': [i, j],
                        'pivot': high,
                        'sorted': list(sorted_indices)
                    })
        
        arr_copy[i + 1], arr_copy[high] = arr_copy[high], arr_copy[i + 1]
        steps.append({
            'array': arr_copy.copy(),
            'swapping': [i + 1, high],
            'pivot': i + 1,
            'sorted': list(sorted_indices)
        })
        
        return i + 1
    
    def quick_sort_helper(low, high):
        if low < high:
            pi = partition(low, high)
            sorted_indices.add(pi)  # Pivot is now in correct position
            quick_sort_helper(low, pi - 1)
            quick_sort_helper(pi + 1, high)
        elif low == high:
            # Single element is sorted
            sorted_indices.add(low)
    
    quick_sort_helper(0, len(arr_copy) - 1)
    
    steps.append({
        'array': arr_copy.copy(),
        'sorted': list(range(len(arr_copy))),
        'complete': True
    })
    
    return steps

def merge_sort(arr):
    steps = []
    arr_copy = arr.copy()
    sorted_ranges = []  # Track which ranges are sorted
    
    def get_sorted_indices():
        # Merge overlapping ranges to get all sorted indices
        if not sorted_ranges:
            return []
        
        # Flatten all sorted ranges
        sorted_set = set()
        for start, end in sorted_ranges:
            sorted_set.update(range(start, end + 1))
        return list(sorted_set)
    
    def merge(left, mid, right):
        left_arr = arr_copy[left:mid + 1]
        right_arr = arr_copy[mid + 1:right + 1]
        
        i = j = 0
        k = left
        
        while i < len(left_arr) and j < len(right_arr):
            steps.append({
                'array': arr_copy.copy(),
                'comparing': [left + i, mid + 1 + j],
                'merging': [left, right],
                'sorted': get_sorted_indices()
            })
            
            if left_arr[i] <= right_arr[j]:
                arr_copy[k] = left_arr[i]
                i += 1
            else:
                arr_copy[k] = right_arr[j]
                j += 1
            k += 1
            
            steps.append({
                'array': arr_copy.copy(),
                'merging': [left, right],
                'sorted': get_sorted_indices()
            })
        
        while i < len(left_arr):
            arr_copy[k] = left_arr[i]
            i += 1
            k += 1
            steps.append({
                'array': arr_copy.copy(),
                'merging': [left, right],
                'sorted': get_sorted_indices()
            })
        
        while j < len(right_arr):
            arr_copy[k] = right_arr[j]
            j += 1
            k += 1
            steps.append({
                'array': arr_copy.copy(),
                'merging': [left, right],
                'sorted': get_sorted_indices()
            })
        
        # After merging, this range is sorted
        sorted_ranges.append((left, right))
    
    def merge_sort_helper(left, right):
        if left < right:
            mid = (left + right) // 2
            merge_sort_helper(left, mid)
            merge_sort_helper(mid + 1, right)
            merge(left, mid, right)
    
    merge_sort_helper(0, len(arr_copy) - 1)
    
    steps.append({
        'array': arr_copy.copy(),
        'sorted': list(range(len(arr_copy))),
        'complete': True
    })
    
    return steps

# ============ INSERTION SORT ============
def insertion_sort(arr):
    steps = []
    arr_copy = arr.copy()
    n = len(arr_copy)

    for i in range(1, n):
        key = arr_copy[i]
        j = i - 1

        # Comparing phase
        steps.append({
            'array': arr_copy.copy(),
            'comparing': [j, i],
            'sorted': list(range(i))
        })

        while j >= 0 and arr_copy[j] > key:
            arr_copy[j + 1] = arr_copy[j]
            steps.append({
                'array': arr_copy.copy(),
                'swapping': [j, j + 1],
                'sorted': list(range(i))
            })
            j -= 1

        arr_copy[j + 1] = key
        steps.append({
            'array': arr_copy.copy(),
            'inserting': j + 1,
            'sorted': list(range(i + 1))
        })

    steps.append({
        'array': arr_copy.copy(),
        'sorted': list(range(n)),
        'complete': True
    })
    return steps


# ============ SELECTION SORT ============
def selection_sort(arr):
    steps = []
    arr_copy = arr.copy()
    n = len(arr_copy)

    for i in range(n):
        min_idx = i

        # Highlight the current unsorted region
        for j in range(i + 1, n):
            steps.append({
                'array': arr_copy.copy(),
                'comparing': [min_idx, j],
                'sorted': list(range(i))
            })

            if arr_copy[j] < arr_copy[min_idx]:
                min_idx = j

        # Swap the found minimum into position
        if min_idx != i:
            arr_copy[i], arr_copy[min_idx] = arr_copy[min_idx], arr_copy[i]
            steps.append({
                'array': arr_copy.copy(),
                'swapping': [i, min_idx],
                'sorted': list(range(i + 1))
            })
        else:
            steps.append({
                'array': arr_copy.copy(),
                'sorted': list(range(i + 1))
            })

    steps.append({
        'array': arr_copy.copy(),
        'sorted': list(range(n)),
        'complete': True
    })
    return steps