const express = require('express');
const router = express.Router();
const db = require('./db');

// Get dashboard counts
router.get('/dashboard/summary', (req, res) => {
  const summaryQuery = `
    SELECT 
      (SELECT COUNT(*) FROM customers) AS customers,
      (SELECT COUNT(*) FROM agents) AS agents,
      (SELECT COUNT(*) FROM patches) AS patches,
      (SELECT COUNT(*) FROM patch_deployments) AS deployments
  `;
  db.query(summaryQuery, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result[0]);
  });
});

// Patch deployment status table
router.get('/dashboard/deployments', (req, res) => {
  const query = `
    SELECT a.hostname, a.status as agent_status, a.ip_address, pd.deployment_status, pd.deployment_time
    FROM patch_deployments pd
    JOIN agents a ON pd.agent_id = a.agent_id
    ORDER BY pd.deployment_time DESC
    LIMIT 10;
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Notifications
router.get('/dashboard/notifications', (req, res) => {
  const query = `
    SELECT action_type, timestamp, details 
    FROM activity_logs 
    ORDER BY timestamp DESC 
    LIMIT 5
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

module.exports = router;
