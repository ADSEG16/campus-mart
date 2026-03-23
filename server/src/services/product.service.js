const cloudinary = require('../config/cloudinary');
const sharp = require('sharp');
const fileType = require('file-type');

/**
 * Upload buffer to Cloudinary
 */
const uploadImageBufferToCloudinary = async (buffer, options = {}) => {
	if (!buffer) {
		throw new Error('No file buffer provided');
	}

	// 🔍 Detect actual file type (VERY IMPORTANT)
	const type = await fileType.fromBuffer(buffer);

	if (!type || !type.mime.startsWith('image/')) {
		throw new Error('Invalid file type. Only image files are allowed');
	}

	// ✅ Optional: Light validation (not strict like before)
	try {
		await sharp(buffer).metadata();
	} catch (error) {
		throw new Error('Corrupted or unsupported image file');
	}

	return new Promise((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream(
			{
				folder: options.folder || 'campus-mart/products',
				resource_type: 'image',
			},
			(error, result) => {
				if (error) return reject(error);

				resolve({
					secureUrl: result.secure_url,
					publicId: result.public_id,
				});
			}
		);

		stream.end(buffer);
	});
};

/**
 * Upload multiple images
 */
const uploadManyImages = async (files = [], options = {}) => {
	if (!files.length) return [];

	return Promise.all(
		files.map((file) =>
			uploadImageBufferToCloudinary(file.buffer, options)
		)
	);
};

/**
 * Delete multiple images
 */
const deleteManyFromCloudinary = async (publicIds = []) => {
	if (!publicIds.length) return;

	await Promise.all(
		publicIds.filter(Boolean).map((id) =>
			cloudinary.uploader.destroy(id)
		)
	);
};

/**
 * Upload profile image
 */
const uploadSingleProfileImage = async (file) => {
	if (!file || !file.buffer) {
		throw new Error('Profile image is required');
	}

	return uploadImageBufferToCloudinary(file.buffer, {
		folder: 'campus-mart/profiles',
	});
};

/**
 * Upload student ID (image OR PDF)
 */
const uploadStudentIdDocument = async (file) => {
	if (!file || !file.buffer) {
		throw new Error('Student ID file is required');
	}

	const type = await fileType.fromBuffer(file.buffer);

	const allowed = [
		'image/jpeg',
		'image/png',
		'image/webp',
		'application/pdf',
	];

	if (!type || !allowed.includes(type.mime)) {
		throw new Error('Only JPG, PNG, WEBP or PDF files are allowed');
	}

	return new Promise((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream(
			{
				folder: 'campus-mart/student-ids',
				resource_type: 'auto',
			},
			(error, result) => {
				if (error) return reject(error);

				resolve({
					secureUrl: result.secure_url,
					publicId: result.public_id,
				});
			}
		);

		stream.end(file.buffer);
	});
};

module.exports = {
	uploadImageBufferToCloudinary,
	uploadManyImages,
	deleteManyFromCloudinary,
	uploadSingleProfileImage,
	uploadStudentIdDocument,
};