import numpy as np
from collections import defaultdict
from itertools import combinations

def cosine_similarity(X, Y=None):
    """
    Compute cosine similarity between rows of matrix X (and optionally Y).
    Mathematically equivalent to sklearn.metrics.pairwise.cosine_similarity.
    """
    if Y is None:
        Y = X
    
    # Compute norms
    X_norm = np.linalg.norm(X, axis=1, keepdims=True)
    Y_norm = np.linalg.norm(Y, axis=1, keepdims=True)
    
    # Avoid division by zero
    X_norm[X_norm == 0] = 1
    Y_norm[Y_norm == 0] = 1
    
    # Dot product and normalize
    # X/X_norm is shape (n, d), normalized
    # Res is (n, m)
    return np.dot(X / X_norm, (Y / Y_norm).T)

class SimpleTfidf:
    """
    A lightweight TF-IDF Vectorizer alternative using only NumPy.
    Supports fit_transform and transform.
    """
    def __init__(self):
        self.vocabulary = {}
        self.idf = None
        self.feature_names = []

    def fit_transform(self, docs):
        # 1. Tokenize and build vocabulary
        token_docs = [doc.split() for doc in docs]
        unique_tokens = sorted(list(set([t for doc in token_docs for t in doc])))
        self.vocabulary = {token: i for i, token in enumerate(unique_tokens)}
        self.feature_names = unique_tokens
        
        n_docs = len(docs)
        n_features = len(unique_tokens)
        
        # 2. Compute TF (Term Frequency)
        tf = np.zeros((n_docs, n_features))
        doc_counts = np.zeros(n_features)
        
        for i, doc in enumerate(token_docs):
            for token in doc:
                if token in self.vocabulary:
                    tf[i, self.vocabulary[token]] += 1
            
            # For IDF: count document if it contains the token
            unique_doc_tokens = set(doc)
            for token in unique_doc_tokens:
                if token in self.vocabulary:
                    doc_counts[self.vocabulary[token]] += 1
        
        # 3. Compute IDF (Inverse Document Frequency)
        # Using the formula: log(N / df) + 1 (similar to sklearn smooth_idf=False)
        self.idf = np.log((n_docs + 1) / (doc_counts + 1)) + 1
        
        # 4. Multiply TF * IDF
        tfidf = tf * self.idf
        
        # 5. L2 Normalize rows (to match sklearn default)
        norms = np.linalg.norm(tfidf, axis=1, keepdims=True)
        norms[norms == 0] = 1
        return tfidf / norms

    def get_feature_names_out(self):
        return np.array(self.feature_names)

def apriori(df, min_support=0.1):
    """
    A simplified Apriori implementation using only NumPy/Pandas.
    df: DataFrame of transactions (0/1 or True/False)
    """
    n_transactions = len(df)
    itemsets = []
    
    # Calculate support for individual items
    support = df.mean()
    frequent_items = support[support >= min_support].index.tolist()
    
    # L1: Frequent 1-itemsets
    L1 = {frozenset([item]): support[item] for item in frequent_items}
    itemsets.append(L1)
    
    # Convert df to numpy for faster counting
    data = df.values
    columns = list(df.columns)
    col_to_idx = {col: i for i, col in enumerate(columns)}
    
    k = 2
    while True:
        prev_L = itemsets[k-2]
        # Candidate generation
        candidates = set()
        prev_items = list(prev_L.keys())
        for i in range(len(prev_items)):
            for j in range(i + 1, len(prev_items)):
                item_i = prev_items[i]
                item_j = prev_items[j]
                union = item_i | item_j
                if len(union) == k:
                    candidates.add(union)
        
        if not candidates:
            break
            
        # Count support for candidates
        current_L = {}
        for cand in candidates:
            # Mask the data to find rows containing the candidate
            indices = [col_to_idx[item] for item in cand]
            count = np.all(data[:, indices], axis=1).sum()
            supp = count / n_transactions
            if supp >= min_support:
                current_L[cand] = supp
                
        if not current_L:
            break
            
        itemsets.append(current_L)
        k += 1
        
    return itemsets

def association_rules(itemsets_list, min_confidence=0.5):
    """
    Generates association rules from frequent itemsets.
    Returns a list of dictionaries with antecedents, consequents, support, and confidence.
    """
    rules = []
    
    # Flatten itemsets for lookup
    all_frequent_itemsets = {}
    for itemsets in itemsets_list:
        all_frequent_itemsets.update(itemsets)
        
    for itemset, support in all_frequent_itemsets.items():
        if len(itemset) < 2:
            continue
            
        # Generate all non-empty proper subsets
        subsets = []
        items = list(itemset)
        for r in range(1, len(items)):
            for combo in combinations(items, r):
                subsets.append(frozenset(combo))
                
        for antecedent in subsets:
            consequent = itemset - antecedent
            if antecedent in all_frequent_itemsets:
                confidence = support / all_frequent_itemsets[antecedent]
                if confidence >= min_confidence:
                    rules.append({
                        'antecedents': antecedent,
                        'consequents': consequent,
                        'support': support,
                        'confidence': confidence,
                        'list': list(consequent) # Helper for sorting
                    })
    
    return rules
