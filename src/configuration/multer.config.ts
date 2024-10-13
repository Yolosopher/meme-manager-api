import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';

const IMAGE_TEMP_FOLDER = process.env.IMAGE_TEMP_FOLDER!;

export const multerOptions: MulterOptions = {
  storage: diskStorage({
    destination: (_, file, cb) => {
      cb(null, IMAGE_TEMP_FOLDER);
    },
    filename(_, file, cb) {
      const uniqueSuffix = uuid();
      const fileExtension = file.originalname.split('.').pop();
      const finalFileName = `${uniqueSuffix}.${fileExtension}`;
      cb(null, finalFileName);
    },
  }),
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE!),
  },
  fileFilter(_, file, callback) {
    if (!file.mimetype.includes('image')) {
      return callback(
        new BadRequestException('Only image files are allowed!'),
        false,
      );
    }
    callback(null, true);
  },
};
