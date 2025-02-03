const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cliProgress = require('cli-progress');
const ffmpeg = require('fluent-ffmpeg');

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

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.mp4', '.mkv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4 and MKV files are allowed.'));
    }
  }
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file was uploaded' });
  }

  const inputPath = req.file.path;
  const outputPath = path.join(__dirname, 'uploads', `compressed_${req.file.originalname}`);
  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

  progressBar.start(100, 0);
  
  ffmpeg(inputPath)
    .videoCodec('libx264')
    .outputOptions('-crf', '28') // Lower CRF for higher quality, higher for smaller size
    .on('progress', (progress) => {
      progressBar.update(Math.min(Math.round(progress.percent), 100));
    })
    .on('end', () => {
      progressBar.stop();
      fs.unlink(inputPath, (err) => { // Delete original file
        if (err) console.error('Error deleting original:', err);
        fs.rename(outputPath, inputPath, (err) => { // Replace with compressed version
          if (err) console.error('Error renaming compressed file:', err);
          res.json({ 
            message: 'File compressed and saved successfully',
            originalSize: req.file.size,
            compressedSize: fs.statSync(inputPath).size
          });
        });
      });
    })
    .on('error', (err) => {
      progressBar.stop();
      console.error('Compression error:', err);
      res.status(500).json({ message: 'Compression failed' });
    })
    .save(outputPath);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
