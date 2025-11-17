const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../authentication/verifyToken');
const { authorizeRoles } = require('../authentication/authRoles');

const adminDashboardRoutes = require('../admin/admin-dashboard');

router.use(authenticateToken);
router.use(authorizeRoles(['admin']));

router.use('/dashboard', adminDashboardRoutes); 

module.exports = router;
