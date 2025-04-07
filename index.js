// app.js - Entry point that bootstraps the UI and sets up listeners

import { setupStorage } from './src/storage.js'
import { initAutobase, setupAutobase } from './src/autobase-setup.js'
import { createPairingInvite, joinWithInvite } from './src/pairing.js'
import { addTodo, renderTodos } from './src/todo-store.js'
import { initNetwork } from './src/network.js'

// Initialize the application
async function initApp() {
  // Initialize storage and network
  const store = setupStorage()
  const swarm = initNetwork()
  
  // Set up UI event listeners
  setupEventListeners()
  
  return { store, swarm }
}

// Set up UI event listeners
function setupEventListeners() {
  // Button to create a new invite
  document.querySelector('#create-invite').addEventListener('click', async () => {
    try {
      await createPairingInvite()
    } catch (error) {
      console.error("Error creating invitation:", error)
      alert("Failed to create invitation: " + error.message)
    }
  })

  // Form to join an existing network
  document.querySelector('#join-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const inviteHex = document.querySelector('#invite-input').value.trim()
    const userData = document.querySelector('#userdata-input').value.trim()

    if (!inviteHex) {
      alert("Invite code is required.")
      return
    }

    try {
      await joinWithInvite(inviteHex, userData)
    } catch (error) {
      console.error("Error joining network:", error)
      alert("Failed to join network: " + error.message)
    }
  })

  // Close alert/invite box
  document.querySelector('#close-alert').addEventListener('click', () => {
    document.getElementById('output').classList.add('hidden')
  })

  // Todo form submission
  document.querySelector('#todo-form').addEventListener('submit', (e) => {
    e.preventDefault()
    const input = document.querySelector('#todo-input')
    const text = input.value.trim()
    if (text) {
      addTodo(text, 'local')
      input.value = ''
    }
  })
}

// Make todo functions available globally for event handlers
window.addTodo = addTodo

// Initialize the application
initApp().catch(err => {
  console.error('Failed to initialize application:', err)
  alert('Failed to start the application: ' + err.message)
})