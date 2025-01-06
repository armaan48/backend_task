# Contact Identification and Merging System

## Unique Approach: SQL-based DSU (Disjoint Set Union)

This system implements **Disjoint Set Union (DSU)** directly in SQL, using **path compression** and **union by rank** to efficiently manage contact groups.

- **Path Compression**: The `find_contact_optimized` function quickly finds the root of any contact, optimizing subsequent lookups.
- **Union by Rank**: The `union_contacts_optimized` function merges two contacts based on their set size (rank), ensuring balanced trees for fast operations.
- **Transactions**: All operations are wrapped in a transaction to ensure data consistency.

## Time Complexity

- **Find Operation**: **O(α(N))**, where α(N) is the inverse Ackermann function, which is nearly constant for practical input sizes.
- **Union Operation**: **O(log N)** for rank-based merging.
- **Final Query**: **O(K + log N)**, where K is the number of related contacts and N is the total number of contacts.

### Overall Endpoint Complexity: **O(K + log N)**
