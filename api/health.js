export default function handler(req, res) {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "CompanyCareers Backend",
    method: req.method,
    url: req.url
  });
}