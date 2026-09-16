const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');
const { genId } = require('../utils/idGenerator');
require('../models');
const { User, Vehicle, Supplier, Customer, Setting } = require('../models');

// Matches src/utils/constants.js DEMO_LOGIN_HINTS in the frontend.
const DEMO_USERS = [
  { role: 'Super Admin', email: 'superadmin@udevs.com', password: 'SuperAdmin@123', firstName: 'Super', lastName: 'Admin' },
  { role: 'Admin', email: 'admin@udevs.com', password: 'Admin@123', firstName: 'Ops', lastName: 'Admin' },
  { role: 'Manager', email: 'manager@udevs.com', password: 'Manager@123', firstName: 'Demo', lastName: 'Manager' },
  { role: 'Customer', email: 'customer@udevs.com', password: 'Customer@123', firstName: 'Demo', lastName: 'Customer' },
];

// Mirrors src/data/seedSuppliers.js
const SUPPLIERS = [
  { key: 'SUP-001', company: 'Toyota Indus Motors', contact: 'Ahsan Malik', email: 'sales@toyota.example', phone: '03001230001', city: 'Karachi', address: 'Korangi Industrial Area', cnic: '35202-1111111-1', status: 'Active', notes: 'OEM partner' },
  { key: 'SUP-002', company: 'Pak Auto Traders', contact: 'Sara Khan', email: 'info@pakauto.example', phone: '03001230002', city: 'Lahore', address: 'MM Alam Road', cnic: '35202-2222222-2', status: 'Active', notes: 'Multi-brand supplier' },
  { key: 'SUP-003', company: 'EV Mobility Pakistan', contact: 'Hamza Ali', email: 'hello@evmobility.example', phone: '03001230003', city: 'Islamabad', address: 'Blue Area', cnic: '35202-3333333-3', status: 'Active', notes: 'EV supplier' },
];

// Mirrors src/data/seedCars.js (image URLs kept as the public Unsplash
// placeholders from the frontend seed; local corolla.jpeg is dropped
// since it lives in the frontend bundle, not here).
const CARS = [
  { key: 'CAR-001', make: 'Toyota', model: 'Corolla', year: 2026, variant: 'Grande', purchaseRate: 6500000, sellingPrice: 7250000, colors: ['White', 'Black', 'Silver'], stock: 4, fuel: 'Petrol', transmission: 'Automatic', mileage: '15,000 km', engine: '1800cc', description: 'Premium family sedan with advanced safety and comfort features.', images: ['https://images.unsplash.com/photo-1623869675184-3b8de5e5320b?auto=format&fit=crop&w=1200&q=80'], status: 'Available', supplierKey: 'SUP-001', featured: true },
  { key: 'CAR-002', make: 'Honda', model: 'Civic', year: 2025, variant: 'Oriel', purchaseRate: 7200000, sellingPrice: 7950000, colors: ['White', 'Black', 'Blue'], stock: 2, fuel: 'Petrol', transmission: 'Automatic', mileage: '12,500 km', engine: '1500cc Turbo', description: 'Modern sedan with turbocharged performance and premium cabin.', images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'], status: 'Available', supplierKey: 'SUP-002', featured: true },
  { key: 'CAR-003', make: 'KIA', model: 'Sportage', year: 2026, variant: 'AWD', purchaseRate: 9100000, sellingPrice: 10100000, colors: ['Silver', 'Black', 'Grey'], stock: 1, fuel: 'Petrol', transmission: 'Automatic', mileage: '8,000 km', engine: '2000cc', description: 'Comfortable SUV designed for city and long-distance travel.', images: ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80'], status: 'Available', supplierKey: 'SUP-002', featured: false },
  { key: 'CAR-004', make: 'MG', model: 'ZS EV', year: 2025, variant: 'Luxury', purchaseRate: 8500000, sellingPrice: 9400000, colors: ['Blue', 'White'], stock: 3, fuel: 'EV', transmission: 'Automatic', mileage: '6,500 km', engine: 'Electric', description: 'Practical electric SUV with modern connected features.', images: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80'], status: 'Available', supplierKey: 'SUP-003', featured: true },
  { key: 'CAR-005', make: 'Toyota', model: 'Yaris', year: 2025, variant: 'ATIV', purchaseRate: 4700000, sellingPrice: 5250000, colors: ['White', 'Silver'], stock: 0, fuel: 'Petrol', transmission: 'Automatic', mileage: '19,000 km', engine: '1500cc', description: 'Efficient compact sedan for everyday driving.', images: ['https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80'], status: 'Sold', supplierKey: 'SUP-001', featured: false },
];

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync();

  console.log('Seeding demo users...');
  const usersByRole = {};
  for (const u of DEMO_USERS) {
    const existing = await User.findOne({ where: { email: u.email } });
    if (existing) {
      usersByRole[u.role] = existing;
      console.log(`  – ${u.email} already exists, skipping.`);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 10);
    const created = await User.create({
      id: genId('USR'),
      firstName: u.firstName,
      lastName: u.lastName,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      password: hashed,
      phone: '03001234567',
      cnic: '35202-0000000-0',
      role: u.role,
      status: 'Active',
    });
    usersByRole[u.role] = created;
    console.log(`  + created ${u.role}: ${u.email} / ${u.password}`);
  }

  console.log('Seeding suppliers...');
  const supplierIdByKey = {};
  for (const s of SUPPLIERS) {
    const existing = await Supplier.findOne({ where: { company: s.company } });
    if (existing) {
      supplierIdByKey[s.key] = existing.id;
      continue;
    }
    const { key, ...rest } = s;
    const created = await Supplier.create({ id: genId('SUP'), ...rest });
    supplierIdByKey[key] = created.id;
  }

  console.log('Seeding vehicles...');
  for (const c of CARS) {
    const existing = await Vehicle.findOne({ where: { make: c.make, model: c.model, variant: c.variant } });
    if (existing) continue;
    const { key, supplierKey, ...rest } = c;
    await Vehicle.create({ id: genId('CAR'), ...rest, supplierId: supplierIdByKey[supplierKey] || null });
  }

  console.log('Seeding demo customer profile...');
  const demoCustomerUser = usersByRole['Customer'];
  if (demoCustomerUser) {
    const existingProfile = await Customer.findOne({ where: { userId: demoCustomerUser.id } });
    if (!existingProfile) {
      await Customer.create({
        id: genId('CUS'),
        userId: demoCustomerUser.id,
        name: demoCustomerUser.name,
        email: demoCustomerUser.email,
        phone: demoCustomerUser.phone,
        cnic: demoCustomerUser.cnic,
        address: 'Lahore, Pakistan',
        city: 'Lahore',
      });
    }
  }

  console.log('Ensuring settings row exists...');
  const existingSettings = await Setting.findByPk(1);
  if (!existingSettings) await Setting.create({ id: 1, darkMode: true, data: {} });

  console.log('\n✔ Seed complete. Demo credentials:');
  DEMO_USERS.forEach((u) => console.log(`   ${u.role.padEnd(11)} ${u.email.padEnd(24)} ${u.password}`));

  process.exit(0);
}

seed().catch((err) => {
  console.error('✘ Seed failed:', err);
  process.exit(1);
});
