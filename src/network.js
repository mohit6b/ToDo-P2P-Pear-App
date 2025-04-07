import Hyperswarm from 'hyperswarm'
import { replicateStore } from './storage.js'
import { updatePeerCount } from './todo-store.js'
import { handleWriteAccessRequest } from './pairing.js'

// Swarm instance
let swarm = null

/**
 * Initialize the Hyperswarm network
 * @returns {Object} The initialized Hyperswarm instance
 */
export function initNetwork() {
  if (!swarm) {
    swarm = new Hyperswarm()
    setupSwarmHandlers()
  }
  return swarm
}

/**
 * Get the current Hyperswarm instance
 * @returns {Object} The current Hyperswarm instance
 */
export function getSwarm() {
  if (!swarm) {
    return initNetwork()
  }
  return swarm
}

/**
 * Set up global event handlers for the swarm
 */
function setupSwarmHandlers() {
  swarm.on('connection', handlePeerConnection)
}

/**
 * Handle a new peer connection
 * @param {Object} peer The connected peer
 */
function handlePeerConnection(peer) {
  console.log('New peer connected')
  
  // Set up replication
  replicateStore(peer)
  
  // Set up message handling
  peer.on('data', data => handlePeerMessage(data, peer))
  
  // Handle disconnection
  peer.on('close', () => {
    console.log('Peer disconnected')
    updatePeerCount(-1)
  })
  
  // Handle errors
  peer.on('error', err => {
    console.error('Peer connection error:', err)
  })
}

/**
 * Handle a message from a peer
 * @param {Buffer} data The message data
 * @param {Object} peer The peer that sent the message
 */
function handlePeerMessage(data, peer) {
  try {
    const message = data.toString()
    if (!message.startsWith('{') || !message.endsWith('}')) return

    const jsonData = JSON.parse(message)
    console.log('Received peer message:', jsonData.type)
    
    // Route message to appropriate handler
    switch (jsonData.type) {
      case 'requestWriteAccess':
        handleWriteAccessRequest(jsonData)
        break
      case 'writeAccessGranted':
        console.log('Write access granted for', jsonData.forKey)
        break
      default:
        console.log('Unknown message type:', jsonData.type)
    }
  } catch (e) {
    console.warn('Ignored non-JSON or malformed message:', e.message)
  }
}

/**
 * Broadcast a message to all connected peers
 * @param {String} message The message to broadcast
 */
export function broadcastToPeers(message) {
  if (!swarm) {
    console.warn('Cannot broadcast: Swarm not initialized')
    return
  }
  
  for (const peer of swarm.connections) {
    try {
      peer.write(message)
    } catch (e) {
      console.error('Error sending to peer:', e)
    }
  }
}

/**
 * Send a message to a specific peer
 * @param {Object} peer The peer to send to
 * @param {String|Object} message The message to send
 */
export function sendToPeer(peer, message) {
  try {
    if (typeof message === 'object') {
      message = JSON.stringify(message)
    }
    
    peer.write(message)
  } catch (e) {
    console.error('Error sending to specific peer:', e)
  }
}

/**
 * Join a topic in the swarm
 * @param {Buffer} topic The topic to join
 */
export function joinTopic(topic) {
  if (!swarm) {
    swarm = initNetwork()
  }
  
  swarm.join(topic)
}

/**
 * Leave a topic in the swarm
 * @param {Buffer} topic The topic to leave
 */
export function leaveTopic(topic) {
  if (!swarm) {
    console.warn('Cannot leave topic: Swarm not initialized')
    return
  }
  
  swarm.leave(topic)
}