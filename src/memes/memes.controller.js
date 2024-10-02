"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemesController = void 0;
var common_1 = require("@nestjs/common");
var auth_guard_1 = require("../auth/guards/auth.guard");
var platform_express_1 = require("@nestjs/platform-express");
var multer_config_1 = require("../configuration/multer.config");
var MemesController = function () {
    var _classDecorators = [(0, common_1.Controller)('memes')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _findAll_decorators;
    var _findOne_decorators;
    var _update_decorators;
    var _remove_decorators;
    var _create_decorators;
    var MemesController = _classThis = /** @class */ (function () {
        function MemesController_1(memesService) {
            this.memesService = (__runInitializers(this, _instanceExtraInitializers), memesService);
        }
        MemesController_1.prototype.findAll = function (authorId, page, orderBy) {
            var _a;
            var findAllDto = {
                page: 1,
                orderBy: {
                    createdAt: 'desc',
                },
            };
            if (page) {
                findAllDto.page = +page;
            }
            if (authorId) {
                findAllDto.authorId = +authorId;
            }
            if (orderBy) {
                var orderByDir = orderBy.startsWith('-') ? 'desc' : 'asc';
                findAllDto.orderBy = (_a = {},
                    _a[orderBy] = orderByDir,
                    _a);
            }
            return this.memesService.findAll(findAllDto);
        };
        MemesController_1.prototype.findOne = function (memeId) {
            if (isNaN(+memeId)) {
                throw new common_1.BadRequestException('Invalid meme ID');
            }
            return this.memesService.findOne(+memeId);
        };
        MemesController_1.prototype.update = function (request, memeId, updateMemeDto) {
            if (isNaN(+memeId)) {
                throw new common_1.BadRequestException('Invalid meme ID');
            }
            var userId = request.user.id;
            return this.memesService.update(+userId, +memeId, updateMemeDto);
        };
        MemesController_1.prototype.remove = function (request, memeId) {
            if (isNaN(+memeId)) {
                throw new common_1.BadRequestException('Invalid meme ID');
            }
            var userId = request.user.id;
            return this.memesService.remove(+userId, +memeId);
        };
        MemesController_1.prototype.create = function (req, createMemeDto, image) {
            if (!image) {
                throw new common_1.BadRequestException('Image file is required');
            }
            var id = req.user.id;
            return this.memesService.create(id, createMemeDto, image);
        };
        return MemesController_1;
    }());
    __setFunctionName(_classThis, "MemesController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _findAll_decorators = [(0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, common_1.UseGuards)(auth_guard_1.AuthGuard), (0, common_1.Get)()];
        _findOne_decorators = [(0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, common_1.UseGuards)(auth_guard_1.AuthGuard), (0, common_1.Get)(':memeId')];
        _update_decorators = [(0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, common_1.UseGuards)(auth_guard_1.AuthGuard), (0, common_1.Put)(':memeId')];
        _remove_decorators = [(0, common_1.HttpCode)(common_1.HttpStatus.OK), (0, common_1.UseGuards)(auth_guard_1.AuthGuard), (0, common_1.Delete)(':memeId')];
        _create_decorators = [(0, common_1.HttpCode)(common_1.HttpStatus.CREATED), (0, common_1.UseGuards)(auth_guard_1.AuthGuard), (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', multer_config_1.multerOptions)), (0, common_1.Post)()];
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: function (obj) { return "findAll" in obj; }, get: function (obj) { return obj.findAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: function (obj) { return "findOne" in obj; }, get: function (obj) { return obj.findOne; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: function (obj) { return "update" in obj; }, get: function (obj) { return obj.update; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: function (obj) { return "remove" in obj; }, get: function (obj) { return obj.remove; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: function (obj) { return "create" in obj; }, get: function (obj) { return obj.create; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MemesController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MemesController = _classThis;
}();
exports.MemesController = MemesController;
