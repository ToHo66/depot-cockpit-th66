export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    app: 'Depot-Cockpit TH66 Professional',
    version: '2.0.0',
    eodhdConfigured: Boolean(process.env.EODHD_API_KEY),
    time: new Date().toISOString()
  });
}
