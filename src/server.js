require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 E-Shopping Management System running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`📍 Products: http://localhost:${PORT}/api/products`);
  console.log(`📍 Orders: http://localhost:${PORT}/api/orders`);
});