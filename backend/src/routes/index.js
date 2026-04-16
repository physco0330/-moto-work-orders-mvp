const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const clientRoutes = require('./client.routes');
const bikeRoutes = require('./bike.routes');
const workOrderRoutes = require('./workOrder.routes');
const checklistItemRoutes = require('./checklistItem.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/clients', clientRoutes);
router.use('/bikes', bikeRoutes);
router.use('/work-orders', workOrderRoutes);
router.use('/checklist-items', checklistItemRoutes);

module.exports = router;
