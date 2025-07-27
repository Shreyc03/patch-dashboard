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

router.get('/customers', (req, res) => {
  const {
    search = '',
    status = '',
    os = '',
    sort = 'organization_name',
    order = 'asc',
    page = 1,
    limit = 10
  } = req.query;

  const offset = (page - 1) * limit;

  const filters = [];
  if (status) filters.push(`status = ${db.escape(status)}`);
  if (os) filters.push(`os_version_used LIKE ${db.escape('%' + os + '%')}`);
  if (search) {
    const s = db.escape('%' + search + '%');
    filters.push(`(
      organization_name LIKE ${s} OR
      contact_email LIKE ${s} OR
      location LIKE ${s}
    )`);
  }

  const whereClause = filters.length ? 'WHERE ' + filters.join(' AND ') : '';

  const query = `
    SELECT customer_id, organization_name, contact_email, location, onboarded_date, status, os_version_used
    FROM customers
    ${whereClause}
    ORDER BY ${db.escapeId(sort)} ${order === 'desc' ? 'DESC' : 'ASC'}
    LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// All Agents
router.get('/agents', (req, res) => {
  const { search = '', status = '', sort = 'hostname', order = 'ASC', page = 1, limit = 10 } = req.query;

  const offset = (page - 1) * limit;
  const allowedSorts = ['hostname', 'status', 'last_seen'];
  const allowedOrder = ['ASC', 'DESC'];

  const sortColumn = allowedSorts.includes(sort) ? sort : 'hostname';
  const sortOrder = allowedOrder.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(a.hostname LIKE ? OR a.ip_address LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (status) {
    conditions.push('a.status = ?');
    params.push(status);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT 
      a.agent_id,
      a.hostname,
      a.ip_address,
      a.status,
      a.os_version,
      a.last_seen,
      c.organization_name AS customer_name
    FROM agents a
    LEFT JOIN customers c ON a.customer_id = c.customer_id
    ${whereClause}
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT ? OFFSET ?
  `;

  db.query(query, [...params, parseInt(limit), parseInt(offset)], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// All Patches
router.get('/patches', (req, res) => {
  const { os, platform, sort = 'release_date', order = 'desc', q, page = 1, limit = 10 } = req.query;

  const filters = [];
  const values = [];

  if (os) {
    filters.push(`p.os_version_supported LIKE ?`);
    values.push(`%${os}%`);
  }

  if (platform) {
    filters.push(`p.platform = ?`);
    values.push(platform);
  }

  if (q) {
    filters.push(`(p.patch_version LIKE ? OR p.description LIKE ?)`);
    values.push(`%${q}%`, `%${q}%`);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const query = `
    SELECT 
      p.patch_id,
      p.patch_version,
      p.release_date,
      p.description,
      p.file_url,
      p.platform,
      p.os_version_supported,
      p.status,
      COUNT(pd.deployment_id) AS total_deployments,
      SUM(CASE WHEN pd.deployment_status = 'Success' THEN 1 ELSE 0 END) AS success_count,
      SUM(CASE WHEN pd.deployment_status = 'Failed' THEN 1 ELSE 0 END) AS failed_count
    FROM patches p
    LEFT JOIN patch_deployments pd ON p.patch_id = pd.patch_id
    ${whereClause}
    GROUP BY p.patch_id
    ORDER BY ${sort} ${order}
    LIMIT ? OFFSET ?;
  `;

  db.query(query, [...values, parseInt(limit), parseInt(offset)], (err, results) => {
    if (err) {
      console.error('Error fetching patches:', err);
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// Activity Logs
// Timeline - recent entries
router.get('/activity/timeline', (req, res) => {
  const query = `
    SELECT action_type, details, timestamp
    FROM activity_logs
    ORDER BY timestamp DESC
    LIMIT 10
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Summary - grouped by action_type
router.get('/activity/summary', (req, res) => {
  const query = `
    SELECT action_type, COUNT(*) as count
    FROM activity_logs
    GROUP BY action_type
    ORDER BY count DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Full activity logs
router.get('/activity/all', (req, res) => {
  const query = `
    SELECT agent_id, action_type, details, timestamp
    FROM activity_logs
    ORDER BY timestamp DESC
    LIMIT 50
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

module.exports = router;
