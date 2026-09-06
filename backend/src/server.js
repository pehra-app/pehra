import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { attachSocketServer } from './services/socket.js';

const port = process.env.PORT || 5000;

await connectDB();
const httpServer = http.createServer(app);
attachSocketServer(httpServer);
httpServer.listen(port, '0.0.0.0', () => {
  console.log(`Pehra API running on port ${port}`);
});
