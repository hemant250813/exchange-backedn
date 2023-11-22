const router = require('express').Router();
const adminRoute = require('./admin/admin');
const appRoute = require('./api/index');

// Admin router
router.use('/admin', adminRoute);

// APP router
router.use('/api', appRoute);


module.exports = router;
