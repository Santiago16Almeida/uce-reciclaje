/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(5);
const microservices_1 = __webpack_require__(2);
const app_controller_1 = __webpack_require__(6);
const app_service_1 = __webpack_require__(7);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            microservices_1.ClientsModule.register([
                {
                    name: 'KAFKA_SERVICE',
                    transport: microservices_1.Transport.KAFKA,
                    options: {
                        client: {
                            // Usamos la IP estática de la Cuenta 4 para consistencia total
                            brokers: [process.env.KAFKA_BROKERS || '100.52.80.163:9092'],
                        },
                        consumer: {
                            groupId: 'notification-consumer',
                        },
                    },
                },
            ]),
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(5);
const microservices_1 = __webpack_require__(2);
const app_service_1 = __webpack_require__(7);
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    async escucharNotificacion(data) {
        const payload = typeof data === 'string' ? JSON.parse(data) : data;
        return this.appService.enviarNotificacion(payload);
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, microservices_1.EventPattern)('uce.reciclaje.botella_depositada'),
    tslib_1.__param(0, (0, microservices_1.Payload)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "escucharNotificacion", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var AppService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(5);
let AppService = AppService_1 = class AppService {
    constructor() {
        this.logger = new common_1.Logger(AppService_1.name);
    }
    enviarNotificacion(data) {
        //Lógica de negocio activada por evento
        const { userId, puntos } = data;
        this.logger.log(`[EMAIL SIMULATED] Enviando correo a: ${userId}`);
        this.logger.log(`Contenido: "¡Felicidades! Has ganado ${puntos} puntos por reciclar una botella en la UCE."`);
        return { status: 'Notificación enviada' };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = AppService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AppService);


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
const core_1 = __webpack_require__(1);
const microservices_1 = __webpack_require__(2);
const app_module_1 = __webpack_require__(3);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // 1. Canal KAFKA: Para reaccionar a eventos de botellas automáticamente
    app.connectMicroservice({
        transport: microservices_1.Transport.KAFKA,
        options: {
            client: { brokers: [process.env.KAFKA_BROKERS || '100.52.80.163:9092'] },
            consumer: { groupId: 'notification-consumer' },
        },
    });
    // 2. Canal TCP: Para que el Gateway lo llame en el puerto 3007
    app.connectMicroservice({
        transport: microservices_1.Transport.TCP,
        options: {
            host: '0.0.0.0', // Permitir tráfico desde el Gateway
            port: 3007
        },
    });
    await app.startAllMicroservices();
    await app.listen(4005, '0.0.0.0'); // API HTTP para Health Checks
    console.log('🔔 Notification-Service: Kafka Activo | TCP: 3007 | HTTP: 4005');
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map