import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from './Cloudinary.config';

// Extend the Params type to include `folder`
type ExtendedParams = {
  folder: string;
  allowed_formats: string[];
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_uploads', // Cloudinary folder name
    allowed_formats: ['jpg', 'jpeg', 'png'],
  } as ExtendedParams, // Cast as the extended type
});

const upload = multer({ storage });

export default upload;