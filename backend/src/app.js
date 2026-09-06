import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import deviceRoutes from './routes/deviceRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import {notFound, errorHandler} from './middleware/error.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({limit: '1mb'}));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ok: true, app: 'Pehra API'}));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api', statsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
