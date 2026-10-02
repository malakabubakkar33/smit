import app from './app.js';
import { ENV } from './config/env.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : (ENV.PORT || 5000);

// In Vercel Services, Express runs as a web service process listening on process.env.PORT.
// In standalone local dev, it listens on PORT 5000.
app.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log(`🚀 SMIT Web Class Backend listening on http://0.0.0.0:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log('====================================================');
});

export default app;
