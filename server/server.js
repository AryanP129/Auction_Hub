import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import itemsRouter from './routes/items.js';
import authRouter from './routes/auth.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });

// attach io to req for routes
app.use((req, _res, next) => { req.io = io; next(); });

app.use(express.json());
app.use(cookieParser());

// Mongo
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/auction_ultra';
mongoose.connect(uri).then(()=>console.log('Mongo connected')).catch(err=>console.error('Mongo error', err.message));

// Static
app.use(express.static(path.join(__dirname, '..', 'client')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API
app.use('/api/auth', authRouter);
app.use('/api/items', itemsRouter);

// SPA files
const sendFile = (res, name) => res.sendFile(path.join(__dirname, '..', 'client', name));
app.get('/', (_req, res) => sendFile(res, 'index.html'));
app.get('/item.html', (_req, res) => sendFile(res, 'item.html'));
app.get('/login.html', (_req, res) => sendFile(res, 'login.html'));
app.get('/signup.html', (_req, res) => sendFile(res, 'signup.html'));
app.get('/my-bids.html', (_req, res) => sendFile(res, 'my-bids.html'));
app.get('/sell-item.html', (_req, res) => sendFile(res, 'sell-item.html'));

// Sockets
io.on('connection', (socket) => {
  socket.on('joinItem', (itemId) => { socket.join(itemId); });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log('Server on http://localhost:'+PORT));
