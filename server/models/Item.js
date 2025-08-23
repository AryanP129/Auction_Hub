import mongoose from 'mongoose';

const bidSubSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  amount: Number,
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  imageUrl: String,
  imagePath: String,
  startingPrice: { type: Number, required: true },
  currentPrice: { type: Number, default: 0 },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sellerName: String,
  bidHistory: [bidSubSchema],
  highestBidderName: String,
  endTime: Date,
  status: { type: String, enum: ['live','ended','paid','closed'], default: 'live' },
}, { timestamps: true });

export default mongoose.model('Item', itemSchema);
