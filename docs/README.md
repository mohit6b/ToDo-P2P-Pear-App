# 📝 Building a Peer-to-Peer ToDo App with Pear, Blind Pairing & AutoBase

This document will walk you through setting up a peer-to-peer (P2P) ToDo app that runs in the [Pear](https://docs.pears.com/) runtime. The app uses **Blind Pairing**, **Hyperswarm** and **AutoBase** to create private, peer-to-peer ToDo list sharing application.

---

## Prerequisites

- [Prerequisites](./prerequisites.md)

## Step 1: Project Initialization

- [Project Initialization](./initialization.md)

---

## Step 2: Launch the App 

- [Launch the App](./launch.md)

---

## Step 3: Project Structure, HTML and CSS Styles

- [Project Structure, HTML and CSS Styles](./ui-ux.md)

## Step 4: Main Application Logic

### File Structure

```
|-- index.js
|-- src
|   ├── autobase-setup.js
|   ├── network.js
|   ├── pairing.js
|   ├── storage.js
|   └── todo-store.js
```

---

#### Flow Overview

1. User opens the app → `index.js` triggers `initApp()`.
2. App creates or joins an Autobase → `autobase-setup.js`.
3. Networking is initialized using Hyperswarm → `network.js`.
4. Peer invitation happens using BlindPairing → `pairing.js`.
5. Peers exchange messages and replicate data.
6. ToDos are stored in Corestore and synced via Autobase.

#### Add **entry point** logic (`index.js`) of the app
- [App Entrypoint](./app/entrypoint.md)

#### Add **autobase-setup** logic (`autobase-setup.js`) of the app
- [App Autobase Setup](./app/autobase.md)

#### Add **networking** logic (`network.js`) of the app
- [App Networking layer](./app/network.md)

#### Add **pairing** logic (`pairing.js`) of the app
- [App Pairing Setup](./app/pairing.md)

#### Add **storage** logic (`storage.js`) of the app
- [App Storage Setup](./app/storage.md)

#### Add **todo-store** logic (`todo-store.js`) of the app
- [App ToDo Store](./app/todo.md)


## Step 5: Run ToDo P2P Application

- [Run ToDo App](./run.md)

## Step 6: Demo
- [Demo Video](https://youtu.be/xF-d9oacR0Q)

- [Demo Video](https://youtu.be/ME6jIPFaZ2A)