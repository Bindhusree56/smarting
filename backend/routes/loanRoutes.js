const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/auth');

const {
  requestLoan,
  approveLoan,
  rejectLoan,
  getMyLoans,
  getLoanById,
} = require('../controllers/loanController');

// Member requests a loan
router.post('/request', protect, requestLoan);

// Member views own loans
router.get('/my', protect, getMyLoans);

// Head approves loan
router.put('/:id/approve', protect, approveLoan);

// Head rejects loan
router.put('/:id/reject', protect, rejectLoan);

// View single loan
router.get('/:id', protect, getLoanById);

module.exports = router;