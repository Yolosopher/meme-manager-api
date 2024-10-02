"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemesService = void 0;
var common_1 = require("@nestjs/common");
var MemesService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var MemesService = _classThis = /** @class */ (function () {
        function MemesService_1(databaseService, imageService) {
            this.databaseService = databaseService;
            this.imageService = imageService;
            this.per_page = 10;
        }
        MemesService_1.prototype.create = function (authorId, createMemeDto, image) {
            return __awaiter(this, void 0, void 0, function () {
                var error_1, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.imageService.uploadImage(image)];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            throw new common_1.HttpException('Error uploading image to S3', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                        case 3: return [4 /*yield*/, this.databaseService.meme.create({
                                data: __assign(__assign({}, createMemeDto), { authorId: authorId, imageName: image.filename }),
                            })];
                        case 4:
                            result = _a.sent();
                            // delete local image
                            this.imageService.deleteLocalImage(image.filename);
                            return [2 /*return*/, result];
                    }
                });
            });
        };
        MemesService_1.prototype.findAll = function (_a) {
            return __awaiter(this, arguments, void 0, function (_b) {
                var where, result, memesWithSignedUrls, _i, result_1, meme, imageUrl;
                var orderBy = _b.orderBy, page = _b.page, authorId = _b.authorId;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            where = authorId ? { authorId: authorId } : undefined;
                            return [4 /*yield*/, this.databaseService.meme.findMany({
                                    take: this.per_page,
                                    skip: (page - 1) * this.per_page,
                                    orderBy: orderBy
                                        ? orderBy
                                        : {
                                            createdAt: 'desc',
                                        },
                                    where: where,
                                })];
                        case 1:
                            result = _c.sent();
                            if (result.length === 0) {
                                throw new common_1.NotFoundException('No memes found');
                            }
                            memesWithSignedUrls = [];
                            _i = 0, result_1 = result;
                            _c.label = 2;
                        case 2:
                            if (!(_i < result_1.length)) return [3 /*break*/, 5];
                            meme = result_1[_i];
                            return [4 /*yield*/, this.imageService.getSignedUrl(meme.imageName)];
                        case 3:
                            imageUrl = _c.sent();
                            memesWithSignedUrls.push(__assign(__assign({}, meme), { imageUrl: imageUrl }));
                            _c.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5: return [2 /*return*/, memesWithSignedUrls];
                    }
                });
            });
        };
        MemesService_1.prototype.findOne = function (memeId) {
            return __awaiter(this, void 0, void 0, function () {
                var foundMeme, imageUrl;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.databaseService.meme.findUnique({
                                where: {
                                    id: memeId,
                                },
                            })];
                        case 1:
                            foundMeme = _a.sent();
                            if (!foundMeme) {
                                throw new common_1.NotFoundException("Meme with ID ".concat(memeId, " not found"));
                            }
                            return [4 /*yield*/, this.imageService.getSignedUrl(foundMeme.imageName)];
                        case 2:
                            imageUrl = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, foundMeme), { imageUrl: imageUrl })];
                    }
                });
            });
        };
        MemesService_1.prototype.update = function (userId, memeId, updateMemeDto) {
            return __awaiter(this, void 0, void 0, function () {
                var foundMeme;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(memeId)];
                        case 1:
                            foundMeme = _a.sent();
                            // Check if the user is the author of the meme
                            if (foundMeme.authorId !== userId) {
                                throw new common_1.ForbiddenException('You are not the author of this meme');
                            }
                            return [4 /*yield*/, this.databaseService.meme.update({
                                    where: {
                                        id: memeId,
                                    },
                                    data: updateMemeDto,
                                })];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        MemesService_1.prototype.remove = function (userId, memeId) {
            return __awaiter(this, void 0, void 0, function () {
                var foundMeme, meme;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.findOne(memeId)];
                        case 1:
                            foundMeme = _a.sent();
                            // Check if the user is the author of the meme
                            if (foundMeme.authorId !== userId) {
                                throw new common_1.ForbiddenException('You are not the author of this meme');
                            }
                            return [4 /*yield*/, this.databaseService.meme.delete({
                                    where: {
                                        id: memeId,
                                    },
                                })];
                        case 2:
                            meme = _a.sent();
                            return [2 /*return*/, meme];
                    }
                });
            });
        };
        return MemesService_1;
    }());
    __setFunctionName(_classThis, "MemesService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MemesService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MemesService = _classThis;
}();
exports.MemesService = MemesService;
