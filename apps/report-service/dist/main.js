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
const app_controller_1 = __webpack_require__(6);
const app_service_1 = __webpack_require__(7);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [],
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
const microservices_1 = __webpack_require__(2); // Añadimos Payload
const app_service_1 = __webpack_require__(7);
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    async obtenerReporte() {
        return this.appService.generarReporteMensual();
    }
    exportarDatos(usuarios) {
        console.log('--- REPORT SERVICE: Generando CSV con datos reales ---');
        return this.appService.generarCSV(usuarios);
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_monthly' }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "obtenerReporte", null);
tslib_1.__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'export_csv' }),
    tslib_1.__param(0, (0, microservices_1.Payload)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Array]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "exportarDatos", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(5);
let AppService = class AppService {
    constructor() {
        this.ahorroCO2Base = 0.05;
    }
    generarCSV(usuarios) {
        const header = "Nombre,Email,Puntos,Rol\n";
        const rows = usuarios.map(u => {
            const nombre = u.nombre || 'Sin nombre';
            const email = u.email || 'Sin email';
            const puntos = u.puntos || 0;
            const rol = u.rol || 'estudiante';
            return `${nombre},${email},${puntos},${rol}`;
        }).join("\n");
        return header + rows;
    }
    generarReporteDinamico(usuarios) {
        const totalPuntos = usuarios.reduce((sum, u) => sum + (Number(u.puntos) || 0), 0);
        const totalBotellas = Math.floor(totalPuntos / 10);
        const top = [...usuarios].sort((a, b) => (b.puntos || 0) - (a.puntos || 0))[0];
        return {
            totalBotellas,
            ahorroCO2: `${(totalBotellas * this.ahorroCO2Base).toFixed(2)}kg`,
            estudianteTop: top ? top.nombre : '---'
        };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
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
    const app = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
        transport: microservices_1.Transport.TCP,
        options: {
            host: '0.0.0.0',
            port: 3012,
        },
    });
    await app.listen();
    console.log('📊 Report-Service listo en puerto 3012 (Cuenta 4)');
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map