import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next){
  try{
    const token = req.cookies?.token || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Auth required' });
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    req.user = { id: payload.id, email: payload.email, name: payload.name };
    next();
  }catch(e){
    return res.status(401).json({ message: 'Invalid token' });
  }
}
