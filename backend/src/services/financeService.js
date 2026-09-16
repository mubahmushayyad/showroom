const { Installment, Payment } = require('../models');
const { genId } = require('../utils/idGenerator');

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

function addPeriod(date, frequency, periods = 1) {
  const d = new Date(date);
  const months = frequency === 'Quarterly' ? 3 * periods : 1 * periods;
  d.setMonth(d.getMonth() + months);
  return d;
}

// Section 18 of the guide:
//   financedAmount = vehiclePrice - downPayment
//   installment schedule generated from duration + frequency
// Computed and persisted server-side only — never trusted from React.
function computeFinance({ vehiclePrice, downPayment, duration }) {
  const financedAmount = Math.max(round2(vehiclePrice) - round2(downPayment), 0);
  const base = round2(financedAmount / duration);
  return { financedAmount, installmentAmount: base };
}

// Builds the Installment rows for a freshly created FinancePlan. The
// last installment absorbs any rounding remainder so the schedule sums
// to exactly `financedAmount`.
async function generateInstallments({ financePlanId, financedAmount, duration, frequency, startDate }) {
  const base = round2(financedAmount / duration);
  const rows = [];
  let allocated = 0;

  for (let i = 1; i <= duration; i++) {
    const isLast = i === duration;
    const amount = isLast ? round2(financedAmount - allocated) : base;
    allocated = round2(allocated + amount);

    rows.push({
      id: genId('INST'),
      financePlanId,
      seq: i,
      dueDate: addPeriod(startDate, frequency, i),
      amount,
      paidAmount: 0,
      status: 'Pending',
    });
  }

  return Installment.bulkCreate(rows);
}

// Applies a payment amount across an application's outstanding
// installments, oldest-due first (FIFO), splitting across more than
// one installment if the payment covers several at once. Returns the
// created Payment row plus the list of installments that were touched.
async function applyPayment({ applicationId, financePlanId, amount, method, reference }) {
  const installments = await Installment.findAll({
    where: { financePlanId },
    order: [['seq', 'ASC']],
  });

  let remaining = round2(amount);
  let firstTouchedId = null;
  const touched = [];

  for (const inst of installments) {
    if (remaining <= 0) break;
    const due = round2(Number(inst.amount) - Number(inst.paidAmount));
    if (due <= 0) continue;

    const applied = Math.min(due, remaining);
    inst.paidAmount = round2(Number(inst.paidAmount) + applied);
    inst.status = inst.paidAmount >= Number(inst.amount) ? 'Paid' : 'Partially Paid';
    await inst.save();

    remaining = round2(remaining - applied);
    if (!firstTouchedId) firstTouchedId = inst.id;
    touched.push(inst);
  }

  const payment = await Payment.create({
    id: genId('PAY'),
    applicationId,
    installmentId: firstTouchedId,
    amount: round2(amount),
    method,
    reference: reference || null,
    paymentDate: new Date(),
    status: 'Completed',
  });

  return { payment, touched, overpaidAmount: remaining };
}

module.exports = { computeFinance, generateInstallments, applyPayment, round2 };
