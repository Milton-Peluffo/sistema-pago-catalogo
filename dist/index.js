"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCatalogHandler = exports.uploadCatalogHandler = void 0;
var uploadCatalog_1 = require("./lambdas/uploadCatalog");
Object.defineProperty(exports, "uploadCatalogHandler", { enumerable: true, get: function () { return uploadCatalog_1.handler; } });
var getCatalog_1 = require("./lambdas/getCatalog");
Object.defineProperty(exports, "getCatalogHandler", { enumerable: true, get: function () { return getCatalog_1.handler; } });
//# sourceMappingURL=index.js.map