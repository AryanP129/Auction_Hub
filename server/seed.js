import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Item from './models/Item.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/auction_ultra';
await mongoose.connect(uri);

const titles = [
  'Vintage Camera', 'Gaming Laptop', 'Smartphone Pro', 'Wireless Headphones', 'Mountain Bike',
  'Mechanical Keyboard', '4K Monitor', 'Designer Watch', 'Retro Console', 'Drone 4K',
  'Acoustic Guitar', 'Leather Backpack', 'Action Figure Set', 'Smartwatch', 'Robot Vacuum',
  'Air Purifier', 'Projector HD', 'Graphics Card', 'Sneakers Limited', 'Art Painting'
];

const images = [1,2,3,4,5,6,7,8,9,10].map(n => `https://picsum.photos/seed/auction${n}/800/600`);

await Item.deleteMany({});

const now = Date.now();
const items = Array.from({length:50}).map((_,i)=> ({
  title: titles[i % titles.length] + ' #' + (i+1),
  description: 'Quality item, lightly used. Auction demo listing ' + (i+1),
  imageUrl: images[i % images.length],
  startingPrice: 500 + (i*50),
  currentPrice: 500 + (i*50),
  sellerName: 'Seeder',
  endTime: new Date(now + (i%7 + 1)*24*60*60*1000),
  status: 'live'
}));
await Item.insertMany(items);
console.log('Seeded', items.length, 'items');
await mongoose.disconnect();
