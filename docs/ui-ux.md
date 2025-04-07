The application is organized into the following modules:

```
├── `index.html`: The HTML UI layout 
├── `index.js`: Entry point that bootstraps the UI and sets up listeners 
├── `package.json`: Project metadata and configuration 
├── `src`
|   ├── `autobase-setup.js`: Sets up Autobase and handles view logic 
|   ├── `network.js`: Handles peer networking and message broadcasting 
|   ├── `pairing.js`: Handles BlindPairing invite/join logic 
|   ├── `storage.js`: Initializes Corestore for data persistence 
|   └── `todo-store.js`: In-memory todo logic and rendering 
```

Start by defining the app's layout in index.html:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="./style.css" />
  <script type='module' src='./index.js'></script>
</head>
<body>
  <div id="titlebar">
    <pear-ctrl></pear-ctrl>
  </div>
  <main>
    <div id="peer-status" style="margin-bottom: 1rem; font-weight: bold;">
      Connected Peers: <span id="peer-count">0</span>
    </div>
    
    <div class="content-container">
      <div id="setup" class="section">
        <button id="create-invite" class="action-button">Create</button>

        <div id="or">— or —</div>

        <form id="join-form" class="form-container">
          <input
            type="text"
            id="invite-input"
            placeholder="Invite"
            required
            class="form-input"
          />
          <input
            type="text"
            id="userdata-input"
            placeholder="User Data"
            required
            class="form-input"
          />
          <button type="submit" id="join-button" class="join-button">Join</button>
        </form>
        
        <div class="alert-container">
          <div id="output" class="alert-modal hidden">
            <div class="alert-content">
              <span class="close-button" id="close-alert">&times;</span>
              <pre id="alert-text"></pre>
            </div>
          </div>
        </div>
      </div>

      <div id="todo-section" class="section">
        <h2 class="section-title">Todo List</h2>
        <form id="todo-form" class="form-container">
          <input
            type="text"
            id="todo-input"
            placeholder="Add a new task"
            required
            class="form-input"
          />
          <button type="submit" class="join-button">Add Task</button>
        </form>
        <ul id="todo-list" class="todo-list"></ul>
      </div>
    </div>
  </main>
</body>
</html>
```

Select and copy the full HTML above and paste it inside `index.html` file in your Pear app!

### HTML code breakdown

- **`<head>`**:
    - Loads external CSS (`style.css`) for styling.
    - Loads the main JavaScript module (`index.js`) for app logic.
- **`<body>`**:
    - **`#titlebar`**: Hosts the `<pear-ctrl>` element, which integrates native Pear window controls.
    - **`#peer-status`**: Displays the number of currently connected peers.
    - **`#setup`**: Allows the user to either create a new invite or join using an existing invite code.
    - **`#todo-section`**: Provides a form to add new tasks and a list to display all current tasks.
    - **`.alert-modal`**: Modal popup to display invite codes after clicking "Create".

- **`Key Elements`**
    - `#create-invite`: Button to generate a new invite.
    - `#join-form`: A form where the user inputs an invite and optional user data to join an existing session.
    - `#output`: Modal that shows the invite key for sharing.
    - `#todo-form`: Lets users add a new task.
    - `#todo-list`: Displays all tasks, updated in real-time with peer syncing.

Create a new file named `style.css` in the project directory
```bash
touch style.css
```

Select and copy the full CSS below and paste it inside `style.css` file in your Pear app!
```css
pear-ctrl[data-platform="darwin"] {
    margin-top: 12px;
    margin-left: 10px;
  }
  
  #titlebar {
    -webkit-app-region: drag;
    height: 30px;
    width: 100%;
    position: fixed;
    left: 0;
    top: 0;
    background-color: #B0D94413;
    filter: drop-shadow(2px 10px 6px #888);
  }
  
  button,
  input {
    all: unset;
    border: 1px ridge #B0D944;
    background: #000;
    color: #B0D944;
    padding: .45rem;
    font-family: monospace;
    font-size: 1rem;
    line-height: 1rem;
  }
  
  body {
    background-color: #001601;
    font-family: monospace;
    margin: 0;
    padding: 0;
  }
  
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    color: white;
    justify-content: flex-start;
    align-items: center;
    margin: 0;
    padding: 2rem;
    padding-top: 3rem;
  }
  
  .hidden {
    display: none !important;
  }
  
  #or {
    margin: 1.5rem 0;
    color: #B0D944;
    text-align: center;
  }
  
  #setup {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  #loading {
    align-self: center;
  }
  
  #chat {
    display: flex;
    flex-direction: column;
    width: 100vw;
    padding: .75rem;
  }
  
  #header {
    margin-top: 2.2rem;
    margin-bottom: 0.75rem;
  }
  
  #details {
    display: flex;
    justify-content: space-between;
  }
  
  #messages {
    flex: 1;
    font-family: 'Courier New', Courier, monospace;
    overflow-y: scroll;
  }
  
  #message-form {
    display: flex;
  }
  
  #message {
    flex: 1;
  }
  
  .output-row {
    background: #1e1e1e;
    color: #B0D944;
    font-family: monospace;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .output-key {
    font-weight: bold;
    margin-right: 1rem;
    white-space: nowrap;
  }
  
  .output-value {
    flex: 1;
    overflow-x: auto;
    white-space: nowrap;
    background: #111;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
    max-width: 64ch;
    text-overflow: ellipsis;
    margin-right: 1rem;
  }
  
  .copy-button {
    cursor: pointer;
    color: #B0D944;
    border: 1px solid #B0D944;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
    background: black;
    transition: background 0.2s ease;
  }
  
  .copy-button:hover {
    background: #2a2a2a;
  }

  
  .content-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
    max-width: 900px;
  }
  
  .section {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem;
    background: #001601;
    border: 1px ridge #B0D944;
    border-radius: 8px;
  }
  
  .action-button,
  .join-button,
  .delete-button {
    background-color: #B0D944;
    color: #000;
    padding: 0.5rem 2rem;
    font-weight: bold;
    border-radius: 6px;
    font-family: monospace;
    font-size: 1rem;
    text-align: center;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 200px;
    margin: 0 auto;
  }
  
  .action-button:hover,
  .join-button:hover,
  .delete-button:hover {
    background-color: #d4f25b;
  }
  
  .form-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 600px;
  }
  
  .form-input {
    width: 100%;
    box-sizing: border-box;
    padding: 0.75rem;
    background: #000;
    color: #B0D944;
    border: 1px ridge #B0D944;
    font-family: monospace;
    font-size: 1rem;
  }
  
  .alert-container {
    width: 100%;
    margin-top: 1rem;
  }
  
  .alert-modal {
    position: fixed;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #1e1e1e;
    border: 2px solid #B0D944;
    padding: 1rem;
    z-index: 1000;
    border-radius: 10px;
    color: #B0D944;
    max-width: 90%;
    max-height: 70vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  }
  
.alert-content {
  position: relative;
  padding-right: 2.5rem; /* Add space for close icon */
}
  
  .close-button {
    position: absolute;
    top: 0;
    right: 0;
    color: #B0D944;
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
    padding: 0.25rem 0.75rem;
  }
  
  .close-button:hover {
    color: #ffffff;
  }
  
  /* Todo List Styles */
  .todo-section {
    color: #B0D944;
  }
  
  .section-title {
    color: #B0D944;
    font-family: monospace;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .todo-list {
    list-style: none;
    padding: 0;
    margin-top: 1rem;
    width: 100%;
    max-width: 600px;
  }
  
  .todo-item {
    display: flex;
    align-items: center;
    margin-bottom: 0.75rem;
    padding: 0.75rem;
    background: #000;
    border: 1px ridge #B0D944;
    border-radius: 4px;
    color: #B0D944;
    font-family: monospace;
  }
  
  .todo-item input[type="checkbox"] {
    margin-right: 0.75rem;
    accent-color: #B0D944;
    cursor: pointer;
  }
  
  .todo-item span {
    flex-grow: 1;
    color: #B0D944;
  }
  
  .todo-item .delete-button {
    background-color: #B0D944;
    color: #000;
    padding: 0.5rem 1rem;
    font-weight: bold;
    border-radius: 6px;
    font-family: monospace;
    font-size: 1rem;
    text-align: center;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: auto;
    margin: 0;
  }
  
  .todo-item .delete-button:hover {
    background-color: #d4f25b;
  }
  
  .todo-item.completed span {
    text-decoration: line-through;
    opacity: 0.7;
  }
```

This stylesheet styles a Pear Runtime-based peer-to-peer Todo app with a retro terminal aesthetic. Some key elements are:
- `Dark terminal` theme using black background and green highlights (#B0D944)
- Responsive and `centered layout` for forms and todo items
- `Custom buttons` and `alerts` with hover effects and smooth transitions
- `Draggable title` bar for desktop-like UI on Electron/Darwin systems
- Todo list interactivity, including `delete` and `checkbox` support