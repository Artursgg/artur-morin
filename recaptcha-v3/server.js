const express = require('express');
const app = express();
const PORT = 3000;

const RECAPTCHA_SECRET = '6LdzCR8sAAAAAByR9D7ud0qxxJkBLlA4aOb-uYFK'; // replace this with your secret key

app.use(express.json());
app.use(express.static('public')); // serves HTML from /public folder

app.post('/verify-recaptcha', async (req, res) => {
  const token = req.body.token;
  if (!token) return res.status(400).json({ success: false, message: 'No token provided' });

  const params = new URLSearchParams();
  params.append('secret', RECAPTCHA_SECRET);
  params.append('response', token);

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: params
    });

    const data = await response.json();
    if (data.success && data.score >= 0.5) {
      res.json({ success: true, score: data.score });
    } else {
      res.json({ success: false, score: data.score });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
