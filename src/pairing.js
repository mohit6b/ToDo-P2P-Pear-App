import BlindPairing from 'blind-pairing'
import { getSwarm, broadcastToPeers } from './network.js'
import { setupAutobase, getAutobaseKey, getLocalWriterKey } from './autobase-setup.js'
import { replicateStore } from './storage.js'
import { updatePeerCount } from './todo-store.js'

// Track connected peers and members
const connectedPeers = new Map()
let connectedMembers = new Map()

/**
 * Creates a new Autobase network and initializes a peer-to-peer invite using BlindPairing.
 * Generates a unique invite code that can be shared with other users to join the session.
 * @returns {Promise<Object>} The invitation data
 */
export async function createPairingInvite() {
  try {
    // Set up the autobase first (or get existing one)
    await setupAutobase()
    const autobaseKey = getAutobaseKey()
    
    // Create a BlindPairing invite using the autobase key
    const swarm = getSwarm()
    const memberBPInstance = new BlindPairing(swarm, { poll: 5000 })
    const { invite, publicKey, discoveryKey } = BlindPairing.createInvite(autobaseKey)
    
    // Set up BlindPairing member
    const member = memberBPInstance.addMember({
      discoveryKey,
      async onadd(candidate) {
        console.log('New candidate found with ID:', candidate.inviteId)
        
        // Store candidate in map
        connectedPeers.set(candidate.inviteId, candidate)
        
        // Open connection and confirm with autobase key
        candidate.open(publicKey)
        candidate.confirm({ key: autobaseKey })
        
        // Increment peer count
        updatePeerCount(1)
        
        console.log('Connected peers:', [...connectedPeers.keys()])
      }
    })
    
    // Wait for member to be ready
    await member.flushed()
    
    // Prepare invitation data
    const data = {
      invite: invite.toString('hex'),
      autobaseKey: autobaseKey.toString('hex'),
      discoveryKey: discoveryKey.toString('hex')
    }

    // Display the invitation info
    displayInviteInfo(data)
    
    return data
    
  } catch (error) {
    console.error("Error creating invitation:", error)
    throw error
  }
}

/**
 * Displays invitation information in the UI
 * @param {Object} data The invitation data to display
 */
function displayInviteInfo(data) {
  const alertBox = document.getElementById('output')
  const alertText = document.getElementById('alert-text')

  alertText.innerHTML = '' // Clear previous
  for (const [key, value] of Object.entries(data)) {
    alertText.innerHTML += `<div class="output-row">
      <span class="output-key">${key}</span>
      <span class="output-value" title="${value}">${value.slice(0, 80)}${value.length > 80 ? '...' : ''}</span>
      <button class="copy-button" onclick="navigator.clipboard.writeText('${value}')">Copy</button>
    </div>`
  }

  alertBox.classList.remove('hidden')
}

/**
 * Join an existing Autobase network using a shared BlindPairing invite.
 * This function handles secure pairing and requests write access from the host.
 * @param {String} inviteHex The invite code in hex format
 * @param {String} userData User data to identify this peer
 * @returns {Promise<Boolean>} Whether joining was successful
 */
export async function joinWithInvite(inviteHex, userData) {
  try {
    const invite = Buffer.from(inviteHex, 'hex')
    const userDataBuffer = Buffer.from(userData || 'anonymous user')
    const swarm = getSwarm()

    // Create BlindPairing instance
    const candidateBPInstance = new BlindPairing(swarm, { poll: 5000 })

    // Initiate pairing
    const connectingCandidate = candidateBPInstance.addCandidate({
      invite,
      userData: userDataBuffer,
      async onadd(result) {
        console.log('Connected to member:', result)

        connectedMembers.set(invite.toString('hex'), result)

        if (result && result.key) {
          const remoteAutobaseKey = result.key

          // Set up autobase with the provided key
          await setupAutobase(remoteAutobaseKey)
          
          // Request write access from the host
          requestWriteAccess(userData)
        }

        updatePeerCount(1)
      }
    })

    console.time('pairing')
    await connectingCandidate.pairing
    console.timeEnd('pairing')

    if (connectingCandidate.paired) {
      console.log('Successfully paired')
      alert("Successfully joined the network! Waiting for write access...")
      return true
    } else {
      alert("Failed to pair. Please try again.")
      return false
    }

  } catch (err) {
    console.error('Join error:', err)
    throw err
  }
}

/**
 * Request write access from the host
 * @param {String} userData User data to identify this peer
 */
function requestWriteAccess(userData) {
  const localKey = getLocalWriterKey()
  
  if (!localKey) {
    console.error('Cannot request write access: local key not available')
    return
  }
  
  const requestWriteMsg = JSON.stringify({
    type: 'requestWriteAccess',
    key: localKey.toString('hex'),
    userData: userData
  })

  broadcastToPeers(requestWriteMsg)
}

/**
 * Handles a write access request from a peer
 * @param {Object} data The write access request data
 */
export async function handleWriteAccessRequest(data) {
  console.log('Received write access request from:', data.userData)
  
  if (data.key) {
    try {
      // Import the addWriter function here to avoid circular dependencies
      const { addWriter } = await import('./autobase-setup.js')
      
      // Add the writer to autobase
      await addWriter(data.key)
      
      console.log('Added new writer:', data.userData)
      
      // Send confirmation
      const confirmMessage = JSON.stringify({
        type: 'writeAccessGranted',
        forKey: data.key
      })
      
      broadcastToPeers(confirmMessage)
    } catch (err) {
      console.error('Failed to add writer:', err)
    }
  }
}