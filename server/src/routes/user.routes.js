const router = require("express").Router();
const cloudinary = require("../config/cloudinary");
const upload = require("../config/multer");
const fs = require("fs");
const os = require('os');
const path = require('path');
const auth = require("../middleware/auth.middleware");
const User = require("../models/user.model");

// Protected route to upload avatar
router.post('/upload-avatar', auth, upload.single('image'), async (req, res) => {
    try {
        console.log('Starting avatar upload for user:', req.user);
        
        const user = await User.findById(req.user);
        if (!user) {
            console.log('User not found:', req.user);
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('User found:', user._id);

        console.log('FILE:', req.file && (req.file.originalname || req.file.fieldname));

        // multer.memoryStorage places the file buffer on req.file.buffer
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Convert buffer to data URI and upload (first attempt)
        const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        console.log('Uploading data URI to Cloudinary (attempt 1)...');
        try {
            const result = await cloudinary.uploader.upload(dataUri, { folder: 'campus-mart/avatars', resource_type: 'image' });
            console.log('Cloudinary upload result:', result && result.public_id);

            // Delete previous Cloudinary image if present
            if (user.cloudinary_id) {
                try { await cloudinary.uploader.destroy(user.cloudinary_id); } catch (delErr) { console.log('Failed to delete previous Cloudinary image:', delErr.message || delErr); }
            }

            user.avatar = result.secure_url;
            user.cloudinary_id = result.public_id;
            await user.save();
            console.log('User updated successfully with Cloudinary URL');
            return res.status(200).json({ message: 'Avatar uploaded successfully', avatar: result.secure_url, public_id: result.public_id });
        } catch (uploadErr) {
            console.log('Cloudinary upload error (data URI):', uploadErr && uploadErr.message ? uploadErr.message : uploadErr);
            // If Cloudinary rejects the data URI as invalid image, try writing a temp file and uploading by path
            if (uploadErr && uploadErr.message && uploadErr.message.toLowerCase().includes('invalid image')) {
                try {
                    const ext = path.extname(req.file.originalname) || (req.file.mimetype === 'image/png' ? '.png' : '.jpg');
                    const tmpPath = path.join(os.tmpdir(), `upload-${Date.now()}${ext}`);
                    fs.writeFileSync(tmpPath, req.file.buffer);
                    console.log('Wrote temp file for Cloudinary upload:', tmpPath);

                    const result2 = await cloudinary.uploader.upload(tmpPath, { folder: 'campus-mart/avatars', resource_type: 'image' });
                    console.log('Cloudinary upload result (file):', result2 && result2.public_id);

                    // Clean up temp file
                    try { fs.unlinkSync(tmpPath); } catch (e) { console.log('Failed to delete temp file:', e.message || e); }

                    if (user.cloudinary_id) {
                        try { await cloudinary.uploader.destroy(user.cloudinary_id); } catch (delErr) { console.log('Failed to delete previous Cloudinary image:', delErr.message || delErr); }
                    }

                    user.avatar = result2.secure_url;
                    user.cloudinary_id = result2.public_id;
                    await user.save();
                    console.log('User updated successfully with Cloudinary URL (file)');
                    return res.status(200).json({ message: 'Avatar uploaded successfully', avatar: result2.secure_url, public_id: result2.public_id });
                } catch (fileUploadErr) {
                    console.log('Cloudinary upload error (file):', fileUploadErr && fileUploadErr.message ? fileUploadErr.message : fileUploadErr);
                    return res.status(500).json({ message: 'Image upload failed', error: fileUploadErr.message || fileUploadErr });
                }
            }

            try { console.log('Full upload error:', JSON.stringify(uploadErr, Object.getOwnPropertyNames(uploadErr))); } catch (e) { console.log(uploadErr); }
            return res.status(500).json({ message: 'Image upload failed', error: uploadErr.message || uploadErr });
        }

    } catch (error) {
        console.log('Upload error:', error);
        // Clean up temp file on error
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
                console.log('Temp file cleaned up on error');
            } catch (unlinkError) {
                console.log('Error deleting temp file:', unlinkError);
            }
        }
        res.status(500).json({ message: "Image upload failed", error: error.message });
    }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
