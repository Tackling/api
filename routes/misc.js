const express = require('express');
const router = express.Router();

router.get('/ping', async (req, res) => {
  const start = Date.now();
  await new Promise(resolve => setTimeout(resolve, 5));
  const ping = Date.now() - start;

  const memoryUsage = process.memoryUsage();
  const heapUsedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
  const rssMB = (memoryUsage.rss / 1024 / 1024).toFixed(2);

  res.json({
    ping: `${ping} ms`,
    heapUsedMB: `${heapUsedMB} MB`,
    rssMB: `${rssMB} MB`,
    uptime: `${process.uptime().toFixed(2)} seconds`,
  });
});

module.exports = router;
