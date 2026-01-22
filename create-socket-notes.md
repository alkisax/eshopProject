# Α. Init & npm i και γιατί

## React (client)

- `npm create vite@latest my-react-app`
- `npm i socket.io-client`
  Χρειάζεσαι το socket.io-client για να ανοίξει WebSocket-ish σύνδεση προς τον server Socket.io.

## Node (server)

```bash
mkdir my-socket-server
cd my-socket-server
npm init -y
```

- Στο package.json:

```json
"scripts": {
  "dev": "node --watch index.js"
}
```

- `npm i express cors socket.io`
  express: για να στήσεις server app (κανάλια/REST κλπ).
  cors: για να επιτρέψεις cross-origin requests από Vite (5173).
  socket.io: ο server του socket.io (το “backend κομμάτι” των sockets).
  Σημείωση: το http ΔΕΝ το κάνεις npm i γιατί είναι built-in Node module.

- (1) Imports και app

```ts
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
```

app.use(cors()) επιτρέπει στο frontend (άλλο origin/port) να συνδεθεί. Χωρίς αυτό, συχνά θα “κόβεται” η σύνδεση (ειδικά σε dev).

- (2) HTTP server

```ts
import http from "http";
const server = http.createServer(app);
```

Το Socket.io θέλει HTTP server instance (όχι μόνο Express app), γιατί “κουμπώνει” πάνω στο επίπεδο transport.

- (3) Socket.io server

```ts
import { Server } from "socket.io";

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
```

Αυτό είναι το “socket layer” του backend. Το origin πρέπει να ταιριάζει με το frontend σου (Vite = 5173).

- (4) Listen

```ts
server.listen(3001, () => {
  console.log("server is running");
});
```

# B. Simple emit (η πρώτη σύνδεση και το πρώτο “σήμα”)
## back
Το πρώτο πράγμα που θες να καταλάβεις:
Client κάνει connect στο server
Server ακούει “connection” και παίρνει ένα socket (unique per user/tab)

```ts
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
});
```

io.on("connection") = handler που τρέχει κάθε φορά που ανοίγει νέα socket σύνδεση.
socket.id = unique id για αυτόν τον client.

## front
```tsx
import { io } from "socket.io-client";
const socket = io("http://localhost:3001");
```
Αυτή η γραμμή ανοίγει σύνδεση.
Αν κάνεις refresh, γίνεται νέα σύνδεση → θα ξαναδείς backend log.

# Γ. Send message (emit από client + receive στο backend + broadcast)
- 1) **Front**: emit
```tsx
socket.emit("send_message", { message });
```
"send_message" είναι το όνομα του event.
{ message } είναι το payload (data object).

- 2) **back**: listen στο event
```tsx
socket.on("send_message", (data) => {
  console.log("received:", data);
});
```

- 3) **back**: στέλνω σε άλλους clients
```tsx
socket.broadcast.emit("receive_message", data);
```
broadcast = στέλνει σε όλους εκτός από αυτόν που το έστειλε.

-  4) **Front**: receive
```tsx
useEffect(() => {
  socket.on("receive_message", (data) => {
    setMessageReceived(data.message);
  });
}, []);
```

# Δ. Rooms & Join (σύντομα αλλά χρήσιμα)

Τα rooms είναι “ομαδοποίηση sockets”.

Θες π.χ.:
chat ανά “κανάλι”
chat ανά “orderId”
chat ανά “lobby/game”

1) **backend** Join σε room
```ts
socket.on("join_room", (roomId) => {
  socket.join(roomId);
});
```
```ts
socket.join(roomId) = αυτός ο client μπαίνει σε room.
```
2) **backend** Emit σε room 
```
socket.to(roomId).emit("receive_message", data);
```
socket.to(roomId) = στείλε σε όλους στο room εκτός του sender.

3) **Front**: ζητάει join
```tsx
socket.emit("join_room", roomId);
```