/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const mongoose_1 = __webpack_require__(6); // MongoDB, no Redis
const app_controller_1 = __webpack_require__(7);
const app_service_1 = __webpack_require__(8);
const audit_schema_1 = __webpack_require__(10);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            // MongoDB para Auditoría
            // Usamos el bridge de Docker para conectar con el contenedor de Mongo en la misma instancia
            mongoose_1.MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://172.17.0.1:27017/uce_audit_db'),
            mongoose_1.MongooseModule.forFeature([{ name: audit_schema_1.Audit.name, schema: audit_schema_1.AuditSchema }]),
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);


/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("@nestjs/mongoose");

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const microservices_1 = __webpack_require__(3);
const app_service_1 = __webpack_require__(8);
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    // Escucha al Kafa
    async manejarEventoAuditoria(data) {
        const payload = typeof data === 'string' ? JSON.parse(data) : data;
        return await this.appService.crearLog(payload);
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, microservices_1.EventPattern)('uce.reciclaje.botella_depositada'),
    tslib_1.__param(0, (0, microservices_1.Payload)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "manejarEventoAuditoria", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var AppService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(1);
const mongoose_1 = __webpack_require__(6);
const mongoose_2 = __webpack_require__(9);
const audit_schema_1 = __webpack_require__(10);
let AppService = AppService_1 = class AppService {
    constructor(auditModel) {
        this.auditModel = auditModel;
        this.logger = new common_1.Logger(AppService_1.name);
    }
    async crearLog(data) {
        try {
            this.logger.log(`[QA] Intentando registrar auditoría para usuario: ${data.userId}`);
            const nuevoLog = new this.auditModel({
                accion: 'DEPOSITO_BOTELLA',
                usuarioId: data.userId || 'ANONIMO',
                detalles: {
                    peso: data.peso,
                    puntosAsignados: data.puntos,
                    fechaOriginal: data.fecha
                }
            });
            const resultado = await nuevoLog.save();
            this.logger.log(`[DB Mongo] Log guardado con ID: ${resultado._id}`);
            return resultado;
        }
        catch (error) {
            this.logger.error('Error al conectar o guardar en MongoDB', error.stack);
            throw error;
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = AppService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, mongoose_1.InjectModel)(audit_schema_1.Audit.name)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object])
], AppService);


/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuditSchema = exports.Audit = void 0;
const tslib_1 = __webpack_require__(5);
const mongoose_1 = __webpack_require__(6);
const mongoose_2 = __webpack_require__(9);
let Audit = class Audit extends mongoose_2.Document {
};
exports.Audit = Audit;
tslib_1.__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }) // <-- Agrega el tipo aquí
    ,
    tslib_1.__metadata("design:type", String)
], Audit.prototype, "accion", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }) // <-- Agrega el tipo aquí
    ,
    tslib_1.__metadata("design:type", String)
], Audit.prototype, "usuarioId", void 0);
tslib_1.__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }) // <-- Esto también ayuda
    ,
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Audit.prototype, "fecha", void 0);
exports.Audit = Audit = tslib_1.__decorate([
    (0, mongoose_1.Schema)({ timestamps: true }) // REQUISITO 6: Registro de fecha y hora
], Audit);
exports.AuditSchema = mongoose_1.SchemaFactory.createForClass(Audit);


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(2);
const microservices_1 = __webpack_require__(3);
const app_module_1 = __webpack_require__(4);
async function bootstrap() {
    // Lo creamos como microservicio TCP para que el Gateway lo vea en el 3008
    const app = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
        transport: microservices_1.Transport.TCP,
        options: {
            host: '0.0.0.0', // Importante para AWS
            port: 3008,
        },
    });
    await app.listen();
    common_1.Logger.log('🚀 Audit-Service (Solo Mongo) listo en puerto TCP 3008');
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map