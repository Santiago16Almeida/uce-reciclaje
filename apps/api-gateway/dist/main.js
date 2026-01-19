/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(4);
const microservices_1 = __webpack_require__(5);
const path_1 = __webpack_require__(6);
const app_controller_1 = __webpack_require__(7);
const app_service_1 = __webpack_require__(10);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            microservices_1.ClientsModule.register([
                // --- CUENTA 1: USUARIOS Y AUTENTICACIÓN (3.234.125.204) ---
                {
                    name: 'USER_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: { host: '3.234.125.204', port: 3001 },
                },
                {
                    name: 'AUTH_SERVICE', // El que usas con $env:NODE_OPTIONS
                    transport: microservices_1.Transport.TCP,
                    options: { host: '3.234.125.204', port: 3002 },
                },
                // --- CUENTA 2: IOT Y AUDITORÍA (52.200.64.213) ---
                {
                    name: 'IOT_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: { host: '52.200.64.213', port: 3003 },
                },
                {
                    name: 'DEPOSIT_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: { host: '52.200.64.213', port: 3004 },
                },
                {
                    name: 'AUDIT_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: { host: '52.200.64.213', port: 3008 },
                },
                // --- CUENTA 3 (ESTA INSTANCIA): RECOMPENSAS Y SALUD (Local) ---
                {
                    name: 'REWARD_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: { host: '127.0.0.1', port: 3006 },
                },
                {
                    name: 'HEALTH_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: { host: '127.0.0.1', port: 3010 },
                },
                {
                    name: 'RECYCLING_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: { host: '127.0.0.1', port: 3011 },
                },
                // --- CUENTA 4: REPORTES Y NOTIFICACIONES (100.52.80.163) ---
                {
                    name: 'REPORT_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: { host: '100.52.80.163', port: 3009 },
                },
                {
                    name: 'NOTIFICATION_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: { host: '100.52.80.163', port: 3007 },
                },
                // --- RESPALDO GRPC (Cuenta 1) ---
                {
                    name: 'AUTH_PACKAGE',
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'auth',
                        protoPath: (0, path_1.join)(__dirname, 'assets', 'auth.proto'),
                        url: '3.234.125.204:50051',
                        loader: {
                            keepCase: true,
                            longs: String,
                            enums: String,
                            defaults: true,
                            oneofs: true,
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
/* 3 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(4);
const microservices_1 = __webpack_require__(5);
const rxjs_1 = __webpack_require__(8);
const express_1 = __webpack_require__(9);
let AppController = class AppController {
    //Comunicacion entre microservicios
    constructor(authClient, userClient, authTcpClient, iotClient, depositClient, rewardClient, auditClient, notificationClient, reportClient, healthClient, recyclingClient) {
        this.authClient = authClient;
        this.userClient = userClient;
        this.authTcpClient = authTcpClient;
        this.iotClient = iotClient;
        this.depositClient = depositClient;
        this.rewardClient = rewardClient;
        this.auditClient = auditClient;
        this.notificationClient = notificationClient;
        this.reportClient = reportClient;
        this.healthClient = healthClient;
        this.recyclingClient = recyclingClient;
    }
    onModuleInit() {
        //this.getGrpcService();
        console.log('🚀 Gateway: Bypass gRPC activo para pruebas');
    }
    getGrpcService() {
        if (!this.authGrpcService) {
            try {
                this.authGrpcService = this.authClient.getService('AuthService');
            }
            catch (error) {
                console.error('❌ Gateway: Error gRPC:', error.message);
            }
        }
        return this.authGrpcService;
    }
    // --- RUTAS DE AUTENTICACIÓN ---
    async register(userData) {
        try {
            //Crear perfil en User-Service
            await (0, rxjs_1.firstValueFrom)(this.userClient.send({ cmd: 'create_user' }, {
                email: userData.email,
                nombre: userData.nombre,
                role: userData.role
            }));
            //Crear credenciales en Auth-Service
            const authAccount = await (0, rxjs_1.firstValueFrom)(this.authTcpClient.send({ cmd: 'register_auth' }, {
                email: userData.email,
                password: userData.password,
                role: userData.role
            }));
            return authAccount;
        }
        catch (error) {
            return { status: 'Error', message: 'Servicio Auth/User no disponible' };
        }
    }
    async login(credentials) {
        try {
            return await (0, rxjs_1.firstValueFrom)(this.authTcpClient.send({ cmd: 'login' }, credentials));
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Credenciales inválidas o microservicio Auth caído');
        }
    }
    // --- RUTAS DE DATOS ---
    async getAllUsers() {
        return (0, rxjs_1.firstValueFrom)(this.userClient.send({ cmd: 'get_all_users' }, {}));
    }
    async getProfile(email) {
        console.log('[Gateway] Pidiendo perfil para:', email);
        return (0, rxjs_1.firstValueFrom)(this.userClient.send({ cmd: 'get_user_profile' }, { email }));
    }
    // apps/api-gateway/src/app/app.controller.ts
    // apps/api-gateway/src/app/app.controller.ts
    async sumarPuntosBypass(puntos, email) {
        try {
            const respuesta = await (0, rxjs_1.firstValueFrom)(this.userClient.send({ cmd: 'add_points' }, { email, puntos: Number(puntos) }));
            return respuesta;
        }
        catch (e) {
            return { status: 'Error' };
        }
    }
    async getMonthlyReport() {
        try {
            const usuarios = await (0, rxjs_1.firstValueFrom)(this.userClient.send({ cmd: 'get_all_users' }, {}));
            const totalPuntos = usuarios.reduce((sum, u) => sum + (Number(u.puntos) || 0), 0);
            const totalBotellas = Math.floor(totalPuntos / 10);
            const sorted = [...usuarios].sort((a, b) => (Number(b.puntos) || 0) - (Number(a.puntos) || 0));
            const top = sorted[0];
            return {
                totalBotellas,
                ahorroCO2: `${(totalBotellas * 0.05).toFixed(2)}kg`,
                estudianteTop: top ? top.nombre : '---'
            };
        }
        catch (error) {
            return { totalBotellas: 0, ahorroCO2: '0.00kg', estudianteTop: '---' };
        }
    }
    async getRewards() {
        return (0, rxjs_1.firstValueFrom)(this.rewardClient.send({ cmd: 'get_catalog' }, {}));
    }
    async getHealth() {
        try {
            return await (0, rxjs_1.firstValueFrom)(this.healthClient.send({ cmd: 'get_status' }, {}));
        }
        catch (e) {
            return { status: 'Gateway OK', services: 'Sincronizando...' };
        }
    }
    async registrarDeposito(data) {
        console.log('[Gateway] Redirigiendo depósito para:', data.email);
        return this.depositClient.send({ cmd: 'depositar_botella' }, data);
    }
    async exportarReporte(res) {
        try {
            const usuarios = await (0, rxjs_1.firstValueFrom)(this.userClient.send({ cmd: 'get_all_users' }, {}));
            console.log('[Gateway] Enviando usuarios al Report-Service:', usuarios.length);
            const csvContent = await (0, rxjs_1.firstValueFrom)(this.reportClient.send({ cmd: 'export_csv' }, usuarios));
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=reporte_uce.csv');
            return res.status(200).send(csvContent);
        }
        catch (error) {
            console.error('[Gateway Error Export]', error.message);
            return res.status(500).send('Error al generar el archivo');
        }
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Post)('auth/register'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "register", null);
tslib_1.__decorate([
    (0, common_1.Post)('auth/login'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "login", null);
tslib_1.__decorate([
    (0, common_1.Get)('usuarios/todos'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getAllUsers", null);
tslib_1.__decorate([
    (0, common_1.Get)('perfil'),
    tslib_1.__param(0, (0, common_1.Query)('email')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getProfile", null);
tslib_1.__decorate([
    (0, common_1.Get)('sumar'),
    tslib_1.__param(0, (0, common_1.Query)('puntos')),
    tslib_1.__param(1, (0, common_1.Query)('email')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "sumarPuntosBypass", null);
tslib_1.__decorate([
    (0, common_1.Get)('reportes/mensual'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getMonthlyReport", null);
tslib_1.__decorate([
    (0, common_1.Get)('rewards'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getRewards", null);
tslib_1.__decorate([
    (0, common_1.Get)('health-check'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getHealth", null);
tslib_1.__decorate([
    (0, common_1.Post)('depositar'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "registrarDeposito", null);
tslib_1.__decorate([
    (0, common_1.Get)('reportes/exportar'),
    tslib_1.__param(0, (0, common_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_l = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _l : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "exportarReporte", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__param(0, (0, common_1.Inject)('AUTH_PACKAGE')),
    tslib_1.__param(1, (0, common_1.Inject)('USER_SERVICE')),
    tslib_1.__param(2, (0, common_1.Inject)('AUTH_SERVICE')),
    tslib_1.__param(3, (0, common_1.Inject)('IOT_SERVICE')),
    tslib_1.__param(4, (0, common_1.Inject)('DEPOSIT_SERVICE')),
    tslib_1.__param(5, (0, common_1.Inject)('REWARD_SERVICE')),
    tslib_1.__param(6, (0, common_1.Inject)('AUDIT_SERVICE')),
    tslib_1.__param(7, (0, common_1.Inject)('NOTIFICATION_SERVICE')),
    tslib_1.__param(8, (0, common_1.Inject)('REPORT_SERVICE')),
    tslib_1.__param(9, (0, common_1.Inject)('HEALTH_SERVICE')),
    tslib_1.__param(10, (0, common_1.Inject)('RECYCLING_SERVICE')),
    tslib_1.__metadata("design:paramtypes", [Object, typeof (_a = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _a : Object, typeof (_b = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _b : Object, typeof (_c = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _c : Object, typeof (_d = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _d : Object, typeof (_e = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _e : Object, typeof (_f = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _f : Object, typeof (_g = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _g : Object, typeof (_h = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _h : Object, typeof (_j = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _j : Object, typeof (_k = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _k : Object])
], AppController);


/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("rxjs");

/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("express");

/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(3);
const common_1 = __webpack_require__(4);
const microservices_1 = __webpack_require__(5);
const operators_1 = __webpack_require__(11);
const rxjs_1 = __webpack_require__(8);
let AppService = class AppService {
    constructor(userClient) {
        this.userClient = userClient;
    }
    obtenerPerfilUsuario(id) {
        console.log(`[Gateway Service] TCP -> get_user_profile para: ${id}`);
        return this.userClient.send('get_user_profile', { id }).pipe((0, operators_1.timeout)(5000), (0, operators_1.catchError)((err) => this.handleError(err)));
    }
    sumarPuntosUsuario(email, puntos) {
        console.log(`[Gateway Service] TCP -> sumar_puntos_evento para: ${email}`);
        // Enviamos los datos al microservicio
        return this.userClient.send('sumar_puntos_evento', { email, puntos }).pipe((0, operators_1.timeout)(5000), (0, operators_1.catchError)((err) => this.handleError(err)));
    }
    handleError(err) {
        console.error('[Gateway Error]', err.message);
        return (0, rxjs_1.of)({
            status: 'error',
            message: 'El User-Service no respondió.',
            details: err.message
        });
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, common_1.Inject)('USER_SERVICE')),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _a : Object])
], AppService);


/***/ }),
/* 11 */
/***/ ((module) => {

module.exports = require("rxjs/operators");

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
const app_module_1 = __webpack_require__(2);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        // Permitimos que el Dashboard desde la IP de la Cuenta 3 acceda
        origin: ['http://localhost:5000', 'http://100.50.26.228:5000'],
        methods: 'GET,POST,PUT,DELETE',
        credentials: true,
    });
    app.setGlobalPrefix('api');
    await app.listen(3000);
    console.log('🚀 Gateway operando en http://100.50.26.228:3000/api');
}

})();

/******/ })()
;
//# sourceMappingURL=main.js.map