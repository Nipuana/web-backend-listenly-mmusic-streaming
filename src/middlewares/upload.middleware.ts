import multer from "multer";
import uuid from "uuid";
import path from "path";
import fs from "fs";
import { HttpError } from "../errors/http-error";

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
const audioDir = path.join(uploadDir, 'audio');
const imageDir = path.join(uploadDir, 'images');
const pfpDir = path.join(imageDir, 'pfp');
const songImgDir = path.join(imageDir, 'song_img');
const playlistImgDir = path.join(imageDir, 'playlist_img');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
}
if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
}
if (!fs.existsSync(pfpDir)) {
    fs.mkdirSync(pfpDir, { recursive: true });
}
if (!fs.existsSync(songImgDir)) {
    fs.mkdirSync(songImgDir, { recursive: true });
}
if (!fs.existsSync(playlistImgDir)) {
    fs.mkdirSync(playlistImgDir, { recursive: true });
}

// Storage configuration for images
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Route images to subdirectories based on field name
        if (file.fieldname === 'profilePicture') {
            cb(null, pfpDir);
        } else if (file.fieldname === 'coverImage') {
            cb(null, songImgDir);
        } else if (file.fieldname === 'playlistCover') {
            cb(null, playlistImgDir);
        } else {
            cb(null, imageDir); // fallback
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuid.v4();
        const extension = path.extname(file.originalname);
        cb(null, uniqueSuffix + extension);
    }
});

// Storage configuration for audio files
const audioStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, audioDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuid.v4();
        const extension = path.extname(file.originalname);
        cb(null, uniqueSuffix + extension);
    }
});

// File filter for images
const imageFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new HttpError(400, 'Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
};

// File filter for audio files
const audioFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    const allowedExtensions = ['.mp3', '.wav', '.ogg'];
    const extension = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(extension)) {
        cb(null, true);
    } else {
        cb(new HttpError(400, 'Invalid file type. Only MP3, WAV and OGG audio files are allowed.'));
    }
};

// Multer instance for image uploads
export const upload = multer({
    storage: imageStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
});

// Multer instance for audio uploads
export const audioUpload = multer({
    storage: audioStorage,
    fileFilter: audioFileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB limit for audio files
});

export const uploads = {
    single: (fieldName: string) => upload.single(fieldName),
    array: (fieldName: string, maxCount: number) => upload.array(fieldName, maxCount),
    fields: (fieldsArray: { name: string; maxCount?: number }[]) => upload.fields(fieldsArray)
};

export const audioUploads = {
    single: (fieldName: string) => audioUpload.single(fieldName),
    array: (fieldName: string, maxCount: number) => audioUpload.array(fieldName, maxCount),
    fields: (fieldsArray: { name: string; maxCount?: number }[]) => audioUpload.fields(fieldsArray)
};

// Combined storage for song uploads (audio + cover image)
const songStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'audioFile') {
            cb(null, audioDir);
        } else if (file.fieldname === 'coverImage') {
            cb(null, songImgDir);
        } else {
            cb(null, uploadDir);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuid.v4();
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

// Combined file filter for song uploads
const songFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.fieldname === 'audioFile') {
        const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
        const allowedExtensions = ['.mp3', '.wav', '.ogg'];
        const extension = path.extname(file.originalname).toLowerCase();
        
        if (allowedAudioTypes.includes(file.mimetype) || allowedExtensions.includes(extension)) {
            cb(null, true);
        } else {
            cb(new HttpError(400, 'Invalid audio file type. Only MP3, WAV and OGG are allowed.'));
        }
    } else if (file.fieldname === 'coverImage') {
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedImageTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new HttpError(400, 'Invalid image file type. Only JPEG, PNG and GIF are allowed.'));
        }
    } else {
        cb(null, true);
    }
};

// Multer instance for song uploads (audio + optional cover image)
export const songUpload = multer({
    storage: songStorage,
    fileFilter: songFileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB limit
});

export const songUploads = {
    fields: () => songUpload.fields([
        { name: 'audioFile', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ])
};