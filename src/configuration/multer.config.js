"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerOptions = void 0;
var common_1 = require("@nestjs/common");
var multer_1 = require("multer");
var uuid_1 = require("uuid");
var IMAGE_TEMP_FOLDER = process.env.IMAGE_TEMP_FOLDER;
exports.multerOptions = {
    storage: (0, multer_1.diskStorage)({
        destination: function (_, file, cb) {
            cb(null, IMAGE_TEMP_FOLDER);
        },
        filename: function (_, file, cb) {
            var uniqueSuffix = (0, uuid_1.v4)();
            var fileExtension = file.originalname.split('.').pop();
            var finalFileName = "".concat(uniqueSuffix, ".").concat(fileExtension);
            cb(null, finalFileName);
        },
    }),
    limits: {
        fileSize: Number(process.env.MAX_FILE_SIZE),
    },
    fileFilter: function (_, file, callback) {
        if (!file.mimetype.includes('image')) {
            return callback(new common_1.BadRequestException('Only image files are allowed!'), false);
        }
        callback(null, true);
    },
};
