import express from 'express';
import multer from 'multer';
import path from 'path';
import Item from '../models/Item.js';
import { requireAuth } from '../middleware_auth.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    cb(null, Date.now() + '-' + Math.round(Math.random()*1e9) + (ext || '.jpg'));
  }
});
const upload = multer({ storage, limits: { fileSize: 5*1024*1024 } });

router.get('/', async (_req, res) => {
  const items = await Item.find().sort({ createdAt: -1 }).lean();
  res.json(items);
});

router.get('/:id', async (req, res) => {
  const it = await Item.findById(req.params.id).lean();
  if (!it) return res.status(404).json({ message: 'Not found' });
  res.json(it);
});

router.post('/sell', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, startingPrice, endTime, imageUrl } = req.body;
    if (!title || !startingPrice) return res.status(400).json({ message: 'Missing fields' });
    const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;
    const item = await Item.create({
      title,
      description,
      imageUrl: imagePath ? undefined : imageUrl,
      imagePath,
      startingPrice: Number(startingPrice),
      currentPrice: Number(startingPrice),
      seller: req.user.id,
      sellerName: req.user.name,
      endTime: endTime ? new Date(endTime) : new Date(Date.now()+7*24*60*60*1000),
      status: 'live'
    });
    req.io.emit('newItem', item);
    res.json({ message: 'Item listed', item });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Create failed' }); }
});

router.post('/:id/bid', requireAuth, async (req, res) => {
  try {
    const { amount } = req.body;
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.status !== 'live') return res.status(400).json({ message: 'Auction not live' });
    if (new Date() > new Date(item.endTime)) return res.status(400).json({ message: 'Auction ended' });
    if (Number(amount) <= item.currentPrice) return res.status(400).json({ message: 'Bid must be higher' });
    item.currentPrice = Number(amount);
    item.highestBidderName = req.user.name;
    item.bidHistory = item.bidHistory || [];
    item.bidHistory.push({ user: req.user.id, name: req.user.name, amount: Number(amount), createdAt: new Date() });
    await item.save();
    req.io.to(item._id.toString()).emit('bidUpdated', { itemId: item._id.toString(), amount: Number(amount), bidder: req.user.name });
    res.json({ message: 'Bid placed', item });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Bid failed' }); }
});

router.get('/me/selling', requireAuth, async (req, res) => {
  const items = await Item.find({ seller: req.user.id }).sort({ createdAt: -1 }).lean();
  res.json(items);
});

router.get('/me/bids', requireAuth, async (req, res) => {
  const items = await Item.find({ 'bidHistory.user': req.user.id }).sort({ updatedAt: -1 }).lean();
  res.json(items.map(it => ({
    itemId: it._id,
    title: it.title,
    imageUrl: it.imageUrl,
    imagePath: it.imagePath,
    currentPrice: it.currentPrice,
    myMaxBid: Math.max(...it.bidHistory.filter(b => String(b.user) === req.user.id).map(b => b.amount)),
    endTime: it.endTime,
    status: it.status
  })));
});

export default router;
