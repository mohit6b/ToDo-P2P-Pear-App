Sets up persistent **Corestore** used by Autobase.

Create a new file named `storage.js` in the project directory
```bash
touch storage.js
```

Select and copy the full content below and paste it inside `storage.js` file in your Pear app!

```js
import Corestore from 'corestore'

let store = null

/**
 * Initialize and configure the Corestore for data persistence
 * Creates a timestamped directory for storage
 * @returns {Object} The initialized Corestore instance
 */
export function setupStorage() {
  // Initialize persistent storage with a timestamped directory
  if (!store) {
    store = new Corestore('./local-storage/storage-' + Date.now())
  }
  return store
}

/**
 * Get the current Corestore instance
 * @returns {Object} The current Corestore instance
 */
export function getStore() {
  if (!store) {
    throw new Error('Storage not initialized. Call setupStorage() first')
  }
  return store
}

/**
 * Ensure the store is ready for use
 * @returns {Promise} Resolves when the store is ready
 */
export async function ensureStoreReady() {
  if (!store) {
    throw new Error('Storage not initialized. Call setupStorage() first')
  }
  
  await store.ready()
  return store
}

/**
 * Create a replication stream for the store
 * @param {Object} connection The connection to replicate with
 * @returns {Object} The replication stream
 */
export function replicateStore(connection) {
  if (!store) {
    throw new Error('Storage not initialized. Call setupStorage() first')
  }
  
  return store.replicate(connection)
}
```

### Key Functions:
- `setupStorage()` – Initializes a new Corestore instance with timestamped directory.
- `replicateStore(peer)` – Replicates Corestore over a peer connection.
