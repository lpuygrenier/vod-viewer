const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cliProgress = require('cli-progress');

const app = express();
const port = 8000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file was uploaded' });
  }

  const fileSize = req.file.size;
  const fileName = req.file.originalname;

  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  progressBar.start(fileSize, 0);

  const updateInterval = setInterval(() => {
    const progress = Math.min(progressBar.value + 8192, fileSize);
    progressBar.update(progress);
    if (progress >= fileSize) {
      clearInterval(updateInterval);
      progressBar.stop();
    }
  }, 10);

  res.json({ message: 'File uploaded successfully' });
});

app.get('/uploads', (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads');
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error('Error reading upload directory:', err);
      return res.status(500).json({ message: 'Error retrieving files' });
    }
    
    const fileList = files.map(file => ({
      name: file,
      url: `/uploads/${file}`
    }));
    
    res.json(fileList);
  });
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
  console.log(`Server running on port ${port}...`);
});
