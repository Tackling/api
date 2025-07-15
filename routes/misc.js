const express = require('express');
const humanizeDuration = require('humanize-duration');
const router = express.Router();

const humanizer = humanizeDuration.humanizer({
  largest: 3,
  units: ['y', 'mo', 'w', 'd', 'h', 'm', 's'],
  round: true,
  spacer: '',
  delimiter: ', ',
  conjunction: ' & ',
  language: 'shortEn',
  languages: {
    shortEn: {
      y: () => 'y',
      mo: () => 'mo',
      w: () => 'w',
      d: () => 'd',
      h: () => 'h',
      m: () => 'm',
      s: () => 's'
    }
  }
});

router.get('/misc', async (req, res) => {
  const start = Date.now();
  await new Promise(resolve => setTimeout(resolve, 5));
  const ping = Date.now() - start;

  const memoryUsage = process.memoryUsage();
  const heapUsedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
  const rssMB = (memoryUsage.rss / 1024 / 1024).toFixed(2);
  const uptime = humanizer(process.uptime().toFixed(0) * 1000);

  res.json({
    ping: `${ping} ms`,
    heapUsedMB: `${heapUsedMB} MB`,
    rssMB: `${rssMB} MB`,
    uptime
  });
});

module.exports = router;
