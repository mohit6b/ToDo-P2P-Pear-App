import Autobase from 'autobase'
import { getStore, ensureStoreReady } from './storage.js'
import { loadTodosFromView } from './todo-store.js'

// Autobase instance and key
let autobase = null
let autobaseKey = null

/**
 * Initialize a new Autobase instance
 * @returns {Object} The initialized Autobase
 */
export function initAutobase() {
  return autobase
}

/**
 * Get the current Autobase key
 * @returns {Buffer} The Autobase key
 */
export function getAutobaseKey() {
  return autobaseKey
}

/**
 * Create or join an Autobase instance
 * @param {Buffer|null} existingKey - Key of an existing Autobase to join, or null to create a new one
 * @returns {Promise<Object>} The initialized Autobase instance
 */
export async function setupAutobase(existingKey = null) {
  try {
    const store = getStore()
    await ensureStoreReady()
    
    autobaseKey = existingKey || null

    autobase = new Autobase(store, autobaseKey, {
      apply,
      open,
      valueEncoding: 'json'
    })
    
    await autobase.ready()

    // Log the Autobase key for identification
    if (!existingKey) {
      autobaseKey = autobase.key
      console.log("New Autobase Key:", autobaseKey.toString('hex'))
    } else {
      console.log("Joined Autobase Key:", autobaseKey.toString('hex'))
    }

    // Subscribe to autobase updates
    autobase.on('update', async () => {
      console.log('Autobase update detected - loading todos')
      await loadTodosFromView()
    })
    
    // Initial load of todos
    await autobase.update()
    console.log("Autobase view length:", autobase.view.length)
    await loadTodosFromView()
    
    return autobase
  } catch (error) {
    console.error("Error setting up Autobase:", error)
    throw error
  }
}

/**
 * Opens a named core within the Corestore.
 * This is used to persist the application's view.
 */
function open(store) {
  return store.get({ name: 'todos', valueEncoding: 'json' })
}

/**
 * Autobase view reducer. Applies incoming nodes to the view.
 * Handles writer permissions and todo operations.
 */
async function apply(nodes, view, host) {
  for (const { value } of nodes) {
    if (value === null) continue
    
    if (value.addWriter) {
      const key = Buffer.from(value.addWriter, 'hex')
      await host.addWriter(key, { indexer: true })
      console.log('Writer added via apply():', key.toString('hex'))
      continue
    }
    
    if (value.type === 'add' || value.type === 'delete' || value.type === 'toggle') {
      await view.append(value)
    }
  }
}

/**
 * Add a new operation to the Autobase
 * @param {Object} operation - The operation to append
 * @returns {Promise<void>}
 */
export async function appendToAutobase(operation) {
  if (!autobase) {
    throw new Error('Autobase not initialized')
  }
  
  await autobase.append(operation)
  await autobase.update()
}

/**
 * Check if we have write access to the Autobase
 * @returns {Boolean} Whether we have write access
 */
export function hasWriteAccess() {
  return autobase && autobase.writable
}

/**
 * Add a writer to the Autobase
 * @param {Buffer|String} writerKey - The key of the writer to add
 * @param {Object} options - Options for adding the writer
 * @returns {Promise<void>}
 */
export async function addWriter(writerKey, options = { indexer: true }) {
  if (!autobase) {
    throw new Error('Autobase not initialized')
  }
  
  if (typeof writerKey === 'string') {
    writerKey = Buffer.from(writerKey, 'hex')
  }
  
  await autobase.append({
    addWriter: writerKey.toString('hex'),
    type: 'grantAccess'
  })
  
  await autobase.update()
}

/**
 * Get the local writer key
 * @returns {Buffer|null} The local writer key, or null if Autobase is not initialized
 */
export function getLocalWriterKey() {
  if (!autobase || !autobase.local) {
    return null
  }
  
  return autobase.local.key
}