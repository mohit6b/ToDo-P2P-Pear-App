import { appendToAutobase, initAutobase } from './autobase-setup.js'

// Application state
let todos = []
let peerCount = 0

// UI binding: DOM reference for peer count display
const peerCountElement = document.getElementById('peer-count')

/**
 * Update peer count and UI display
 * @param {Number} delta - Change in peer count (positive or negative)
 */
export function updatePeerCount(delta = 0) {
  peerCount += delta
  // Ensure count doesn't go below 0
  peerCount = Math.max(0, peerCount)
  updatePeerCountUI()
}

/**
 * Updates peer count on the UI.
 */
function updatePeerCountUI() {
  if (peerCountElement) {
    peerCountElement.textContent = peerCount
  }
}

/**
 * Get current todos list
 * @returns {Array} Current todos
 */
export function getTodos() {
  return [...todos]
}

/**
 * Adds a new todo entry to Autobase.
 * @param {String} text - Todo text content
 * @param {String} source - 'local' or 'remote' source
 * @param {Number} id - Unique ID for the todo
 */
export async function addTodo(text, source = 'local', id = Date.now()) {
  // Only append to autobase if this is a local operation
  if (source === 'local') {
    const autobase = initAutobase()
    if (autobase) {
      await appendToAutobase({
        type: 'add',
        id,
        text
      })
      await loadTodosFromView()
    }
  } 
  // For remote operations (like direct UI updates), we can still
  // handle them without going through autobase again
  else if (source === 'remote') {
    const todo = { id, text, completed: false }
    if (!todos.some(t => t.id === id)) {
      todos.push(todo)
      renderTodos()
    }
  }
}

/**
 * Removes a todo entry through Autobase.
 * @param {Number} id - Todo ID to delete
 * @param {String} source - 'local' or 'remote' source
 */
export async function deleteTodo(id, source = 'local') {
  if (source === 'local') {
    const autobase = initAutobase()
    if (autobase) {
      await appendToAutobase({
        type: 'delete',
        id
      })
      await loadTodosFromView()
    }
  } else if (source === 'remote') {
    // For remote UI updates
    todos = todos.filter(todo => todo.id !== id)
    renderTodos()
  }
}

/**
 * Toggles the completion status of a todo entry.
 * @param {Number} id - Todo ID to toggle
 * @param {String} source - 'local' or 'remote' source
 */
export async function toggleTodo(id, source = 'local') {
  if (source === 'local') {
    const autobase = initAutobase()
    if (autobase) {
      await appendToAutobase({
        type: 'toggle',
        id
      })
      await loadTodosFromView()
    }
  } else if (source === 'remote') {
    // For remote UI updates
    todos = todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed }
      }
      return todo
    })
    renderTodos()
  }
}

/**
 * Reads and interprets the current state from the Autobase view.
 * Constructs the in-memory todo list from stored operations.
 */
export async function loadTodosFromView() {
  const autobase = initAutobase()
  if (!autobase || !autobase.view) {
    console.warn('Cannot load todos: Autobase or view not available')
    return
  }
  
  const todoMap = new Map()
  
  for (let i = 0; i < autobase.view.length; i++) {
    try {
      const operation = await autobase.view.get(i)
      
      switch (operation.type) {
        case 'add':
          todoMap.set(operation.id, {
            id: operation.id,
            text: operation.text,
            completed: false
          })
          break
        case 'toggle':
          if (todoMap.has(operation.id)) {
            const todo = todoMap.get(operation.id)
            todo.completed = !todo.completed
            todoMap.set(operation.id, todo)
          }
          break
        case 'delete':
          todoMap.delete(operation.id)
          break
      }
    } catch (err) {
      console.error('Error reading view:', err)
    }
  }

  todos = Array.from(todoMap.values())
  renderTodos()
}

/**
 * Renders the list of todos on the web UI.
 */
export function renderTodos() {
  const todoList = document.getElementById('todo-list')
  if (!todoList) {
    console.warn('Todo list element not found')
    return
  }
  
  todoList.innerHTML = ''

  todos.forEach(todo => {
    const li = document.createElement('li')
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = todo.completed
    checkbox.addEventListener('change', () => toggleTodo(todo.id, 'local'))

    const span = document.createElement('span')
    span.textContent = todo.text

    const deleteBtn = document.createElement('button')
    deleteBtn.textContent = 'Delete'
    deleteBtn.className = 'delete-button'
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id, 'local'))

    li.appendChild(checkbox)
    li.appendChild(span)
    li.appendChild(deleteBtn)
    todoList.appendChild(li)
  })
}

// Make todo functions available globally for event handlers
window.toggleTodo = toggleTodo
window.deleteTodo = deleteTodo