var express = require('express');
var router = express.Router();
const { uploadVideo, ensureMultipartField } = require('../middleware/storage');

// TODO: Add your upload video routes here
// Example:
// router.post('/', function(req, res, next) {
//   // Handle video upload
// });


router.post('/', ensureMultipartField, uploadVideo.single('video'), (req, res) => {
    try {
        const video = req.file;
        if (!video) {
            return res.status(400).json({ status: 400, message: 'No video file uploaded' });
        }

        const videoUrl = `${req.protocol}s://${req.get('host')}/videos/${video.filename}`;
        res.status(200).json({ status: 200, message: 'Video uploaded successfully', videoUrl });
           
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }

});



module.exports = router;

