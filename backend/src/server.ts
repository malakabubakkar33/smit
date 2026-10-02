import app from './app.js';
import { ENV } from './config/env.js';

const PORT = ENV.PORT || 5000;

// In standalone local development, start the Express HTTP server on PORT 5000.
// On Vercel, serverless function invocation handles HTTP requests directly.
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('====================================================');
    console.log(`🚀 SMIT Web Class Backend running on http://localhost:${PORT}`);
    console.log(`📡 Environment: ${ENV.NODE_ENV}`);
    console.log('====================================================');
  });
}

export default app;
