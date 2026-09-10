export default function handler(req, res) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (forwarded ? forwarded.split(',')[0].trim() : null) || req.socket?.remoteAddress || '127.0.0.1';
  res.status(200).json({ ip });
}
