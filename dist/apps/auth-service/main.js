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
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(6);
const typeorm_1 = __webpack_require__(7);
const app_controller_1 = __webpack_require__(8);
const app_service_1 = __webpack_require__(9);
const auth_entity_1 = __webpack_require__(11);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                // En AWS usamos el bridge de Docker para llegar al contenedor de Postgres
                host: process.env.DB_HOST || '172.17.0.1',
                port: parseInt(process.env.DB_PORT) || 5433,
                username: 'uce_admin',
                password: 'uce_password',
                database: 'uce_users_db',
                entities: [auth_entity_1.UserAuth],
                synchronize: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([auth_entity_1.UserAuth]),
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

module.exports = require("@nestjs/common");

/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(6);
const microservices_1 = __webpack_require__(2);
const app_service_1 = __webpack_require__(9);
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    async validateToken(data) {
        const result = await this.appService.validateToken(data);
        return {
            valid: result.valid,
            userId: result.userId || '',
            role: result.role || ''
        };
    }
    async register(data) {
        return await this.appService.register(data);
    }
    async login(data) {
        return await this.appService.login(data);
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, microservices_1.GrpcMethod)('AuthService', 'ValidateToken'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "validateToken", null);
tslib_1.__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'register_auth' }),
    tslib_1.__param(0, (0, microservices_1.Payload)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "register", null);
tslib_1.__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'login' }),
    tslib_1.__param(0, (0, microservices_1.Payload)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "login", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(6);
const typeorm_1 = __webpack_require__(7);
const typeorm_2 = __webpack_require__(10);
const auth_entity_1 = __webpack_require__(11);
const ioredis_1 = tslib_1.__importDefault(__webpack_require__(12));
const bcrypt = tslib_1.__importStar(__webpack_require__(13));
let AppService = class AppService {
    constructor(authRepository) {
        this.authRepository = authRepository;
        // Configuración de Redis para manejo de errores
        this.redis = new ioredis_1.default({
            host: 'localhost',
            port: 6379,
            lazyConnect: true,
            maxRetriesPerRequest: 1
        });
        this.redis.on('error', () => console.warn('⚠️ Redis fuera de línea. Las sesiones no se persistirán pero el login funcionará.'));
    }
    async register(data) {
        try {
            const exists = await this.authRepository.findOne({ where: { email: data.email } });
            if (exists)
                return { status: 'Error', message: 'El usuario ya existe en Auth' };
            // Encriptar la contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(data.password, salt);
            const newUser = this.authRepository.create({
                email: data.email,
                password: hashedPassword,
                role: data.role || 'estudiante'
            });
            await this.authRepository.save(newUser);
            console.log(`[Auth-Service] ✅ Credenciales encriptadas creadas para: ${data.email}`);
            return { status: 'Success', message: 'Credenciales guardadas con éxito' };
        }
        catch (e) {
            console.error('❌ Error en registro:', e.message);
            return { status: 'Error', message: 'Error al acceder a la base de datos' };
        }
    }
    async login(credentials) {
        try {
            const user = await this.authRepository.findOne({
                where: { email: credentials.email }
            });
            if (!user) {
                return { status: 'Error', message: 'Usuario no registrado en el sistema de autenticación' };
            }
            // Comparar contraseña ingresada con el hash de la DB
            const isMatch = await bcrypt.compare(credentials.password, user.password);
            if (!isMatch) {
                return { status: 'Error', message: 'Contraseña incorrecta' };
            }
            // Generar Token
            const token = 'jwt_' + Math.random().toString(36).substring(2, 15);
            // Intentar guardar en Redis para persistencia de sesión
            try {
                await this.redis.set(`session:${token}`, JSON.stringify({ userId: user.email, role: user.role }), 'EX', 3600);
            }
            catch (e) {
                console.warn('⚠️ No se pudo guardar sesión en Redis, procediendo con bypass.');
            }
            console.log(`[Auth-Service] 🔑 Login exitoso: ${user.email}`);
            return {
                status: 'Success',
                token,
                role: user.role,
                email: user.email
            };
        }
        catch (error) {
            console.error('❌ Error en login:', error.message);
            return { status: 'Error', message: 'Error interno en el servidor de autenticación' };
        }
    }
    async validateToken(data) {
        if (data.token.startsWith('jwt_'))
            return { valid: true, userId: 'session_active', role: 'user' };
        try {
            const result = await this.redis.get(`session:${data.token}`);
            if (!result)
                return { valid: false };
            const parsed = JSON.parse(result);
            return { valid: true, userId: parsed.userId, role: parsed.role };
        }
        catch (error) {
            return { valid: false };
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(auth_entity_1.UserAuth)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], AppService);


/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserAuth = void 0;
const tslib_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(10);
let UserAuth = class UserAuth {
};
exports.UserAuth = UserAuth;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    tslib_1.__metadata("design:type", Number)
], UserAuth.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    tslib_1.__metadata("design:type", String)
], UserAuth.prototype, "email", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], UserAuth.prototype, "password", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ default: 'estudiante' }),
    tslib_1.__metadata("design:type", String)
], UserAuth.prototype, "role", void 0);
exports.UserAuth = UserAuth = tslib_1.__decorate([
    (0, typeorm_1.Entity)('auth_credentials')
], UserAuth);


/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = require("ioredis");

/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = require("bcrypt");

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
const path_1 = __webpack_require__(3);
const app_module_1 = __webpack_require__(4);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // gRPC - Canal de seguridad
    app.connectMicroservice({
        transport: microservices_1.Transport.GRPC,
        options: {
            package: 'auth',
            protoPath: (0, path_1.join)(__dirname, 'assets', 'auth.proto'),
            url: '0.0.0.0:50051',
        },
    });
    // TCP - Canal para el Gateway
    app.connectMicroservice({
        transport: microservices_1.Transport.TCP,
        options: { host: '0.0.0.0', port: 4001 },
    });
    await app.startAllMicroservices();
    await app.listen(4003, '0.0.0.0');
    console.log('✅ Auth-Service: TCP en 4001 | gRPC en 50051');
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map