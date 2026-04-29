require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./models/User');
const MilkSubmission = require('./models/MilkSubmission');
const Order    = require('./models/Order');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🔌 Connected to MongoDB');

  await User.deleteMany({});
  await MilkSubmission.deleteMany({});
  await Order.deleteMany({});

  const hash = p => bcrypt.hash(p, 12);

  const [admin, farmer, customer] = await User.insertMany([
    { name:'Admin User',  email:'admin@dairy.com',    password: await hash('admin123'),    role:'admin'    },
    { name:'Ram Kumar',   email:'farmer@dairy.com',   password: await hash('farmer123'),   role:'farmer'   },
    { name:'Priya Singh', email:'customer@dairy.com', password: await hash('customer123'), role:'customer', phone:'9876543210', address:'123 MG Road, Delhi' },
  ]);

  const milkRecords = [
    { farmer: farmer._id, date: new Date('2025-01-08'), quantity: 15, grade: 'A', status: 'verified', pricePerLitre: 60, earnings: 900 },
    { farmer: farmer._id, date: new Date('2025-01-09'), quantity: 12, grade: 'B', status: 'verified', pricePerLitre: 60, earnings: 720 },
    { farmer: farmer._id, date: new Date('2025-01-10'), quantity: 18, grade: 'A', status: 'verified', pricePerLitre: 60, earnings: 1080 },
    { farmer: farmer._id, date: new Date('2025-01-11'), quantity: 10, grade: 'A', status: 'pending',  pricePerLitre: 60, earnings: 0    },
    { farmer: farmer._id, date: new Date('2025-01-12'), quantity: 14, grade: 'A', status: 'pending',  pricePerLitre: 60, earnings: 0    },
  ];
  await MilkSubmission.insertMany(milkRecords);

  const orderRecords = [
    { customer: customer._id, quantity: 3.5, packets:{oneL:3,halfL:1}, deliveryDate: new Date('2025-01-15'), status:'delivered', pricePerLitre:60, totalPrice:210 },
    { customer: customer._id, quantity: 2.0, packets:{oneL:2,halfL:0}, deliveryDate: new Date('2025-01-22'), status:'approved',  pricePerLitre:60, totalPrice:120 },
    { customer: customer._id, quantity: 1.5, packets:{oneL:1,halfL:1}, deliveryDate: new Date('2025-01-28'), status:'pending',   pricePerLitre:60, totalPrice:90  },
  ];
  await Order.insertMany(orderRecords);

  console.log('✅ Demo data seeded!');
  console.log('----------------------------');
  console.log('🔑 Admin:    admin@dairy.com    / admin123');
  console.log('🌾 Farmer:   farmer@dairy.com   / farmer123');
  console.log('🛒 Customer: customer@dairy.com / customer123');
  console.log('----------------------------');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
