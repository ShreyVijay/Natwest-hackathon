const express = require('express');
const multer = require('multer');
const { executionEngineUrl } = require('../config/runtime');

const router = express.Router();

const sanitizeFilename = (name) => name.replace(/[^a-zA-Z0-9.-]/g, '_');

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB limit
});

// @route   POST /api/upload
// @desc    Upload a dataset by proxying to the execution engine
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const safeName = sanitizeFilename(req.file.originalname || 'dataset.csv');
        const form = new FormData();
        form.append(
            'file',
            new Blob([req.file.buffer], { type: req.file.mimetype || 'text/csv' }),
            safeName,
        );

        const engineRes = await fetch(`${executionEngineUrl}/upload_dataset`, {
            method: 'POST',
            body: form,
        });

        const payload = await engineRes.json().catch(() => ({}));
        if (!engineRes.ok) {
            return res.status(502).json({
                message: 'Execution Engine rejected file upload',
                details: payload?.detail || payload?.message || `HTTP ${engineRes.status}`,
            });
        }

        return res.status(200).json({
            message: 'File uploaded successfully',
            dataset_ref: payload.dataset_ref,
            filename: payload.filename,
            size: payload.size || req.file.size,
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Server Error processing upload', error: error.message });
    }
});

module.exports = router;
