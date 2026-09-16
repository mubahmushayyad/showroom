// Core roles — section 2 of the guide: Super Admin → Admin → Manager → Customer.
export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  CUSTOMER: 'Customer',
};

// Vehicle catalog status (Car model — the guide's "Vehicle", section 9).
export const STATUS = { AVAILABLE: 'Available', RESERVED: 'Reserved', SOLD: 'Sold', INACTIVE: 'Inactive' };

// Application-to-Delivery state flow — section 8 of the guide.
export const APP_STATUS = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'ASSIGNED',
  'IN_PROCESS',
  'VEHICLE_SELECTED',
  'FINANCE_SETUP',
  'PAYMENT_IN_PROGRESS',
  'READY_FOR_DELIVERY',
  'COMPLETED',
  'OVERDUE',
];

// Human-readable labels for the raw status codes above.
export const APP_STATUS_LABELS = {
  PENDING: 'Pending Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ASSIGNED: 'Manager Assigned',
  IN_PROCESS: 'Verification In Process',
  VEHICLE_SELECTED: 'Vehicle Selected',
  FINANCE_SETUP: 'Finance Plan Set Up',
  PAYMENT_IN_PROGRESS: 'Payments In Progress',
  READY_FOR_DELIVERY: 'Ready For Delivery',
  COMPLETED: 'Completed',
  OVERDUE: 'Overdue',
};

// Status Rules — section 20 of the guide. Used to only show the next
// legal status(es) in dropdowns, never letting the UI skip a step.
export const STATUS_NEXT = {
  PENDING: ['APPROVED', 'REJECTED', 'PENDING'],
  APPROVED: ['ASSIGNED'],
  ASSIGNED: ['IN_PROCESS'],
  IN_PROCESS: ['VEHICLE_SELECTED', 'REJECTED'],
  VEHICLE_SELECTED: ['FINANCE_SETUP'],
  FINANCE_SETUP: ['PAYMENT_IN_PROGRESS'],
  PAYMENT_IN_PROGRESS: ['READY_FOR_DELIVERY', 'OVERDUE'],
  OVERDUE: ['PAYMENT_IN_PROGRESS', 'READY_FOR_DELIVERY'],
  READY_FOR_DELIVERY: ['COMPLETED'],
  REJECTED: [],
  COMPLETED: [],
};

export const COLORS = ['White', 'Black', 'Silver', 'Blue', 'Red', 'Grey'];
export const FUEL = ['Petrol', 'Hybrid', 'EV', 'Diesel'];
export const TRANSMISSION = ['Automatic', 'Manual'];
export const LOW_STOCK = 2;

export const FREQUENCIES = ['Monthly', 'Quarterly'];

export const STORAGE = {
  SESSION: 'udevs_session',
  TOKEN: 'udevs_token',
  SETTINGS: 'udevs_settings_cache',
};

// Reference credentials for local testing only — the actual login call
// goes to POST /api/auth/login on the backend (services/authApi.js).
// Seed these via `npm run db:seed` in /backend.
export const DEMO_LOGIN_HINTS = [
  { role: ROLES.SUPER_ADMIN, email: 'superadmin@udevs.com', password: 'SuperAdmin@123' },
  { role: ROLES.ADMIN, email: 'admin@udevs.com', password: 'Admin@123' },
  { role: ROLES.MANAGER, email: 'manager@udevs.com', password: 'Manager@123' },
  { role: ROLES.CUSTOMER, email: 'customer@udevs.com', password: 'Customer@123' },
];

// Landing route per role, used by AppRoutes/Guard after login.
export const HOME_ROUTE = {
  [ROLES.SUPER_ADMIN]: '/super-admin',
  [ROLES.ADMIN]: '/admin',
  [ROLES.MANAGER]: '/manager',
  [ROLES.CUSTOMER]: '/customer',
};
