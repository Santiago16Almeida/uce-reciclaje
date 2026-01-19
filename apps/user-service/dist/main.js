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
const typeorm_1 = __webpack_require__(6);
const microservices_1 = __webpack_require__(2);
const app_controller_1 = __webpack_require__(7);
const app_service_1 = __webpack_require__(8);
const user_entity_1 = __webpack_require__(10);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            // 1. Conexión a PostgreSQL (Cuenta 1)
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                // IMPORTANTE: Dentro de la misma EC2 usamos la IP del bridge
                host: process.env.DB_HOST || '172.17.0.1',
                port: parseInt(process.env.DB_PORT) || 5433,
                username: process.env.DB_USER || 'uce_admin',
                password: process.env.DB_PASSWORD || 'uce_password',
                database: process.env.DB_NAME || 'uce_users_db',
                entities: [user_entity_1.User],
                synchronize: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User]),
            // Conexión a Kafka
            microservices_1.ClientsModule.register([
                {
                    name: 'KAFKA_SERVICE',
                    transport: microservices_1.Transport.KAFKA,
                    options: {
                        client: {
                            brokers: [process.env.KAFKA_BROKERS || '100.52.80.163:9092'],
                            initialRetryTime: 100,
                            retries: 8
                        },
                        consumer: {
                            groupId: `user-consumer-v2`,
                            allowAutoTopicCreation: true
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
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(5);
const microservices_1 = __webpack_require__(2);
const app_service_1 = __webpack_require__(8);
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    //Consultar Perfil a traves del gateway
    async handleGetProfile(data) {
        console.log('[User-Service] Consultando perfil para:', data.email);
        try {
            // Retorna el usuario completo con los puntos para el Dashboard
            return await this.appService.buscarPorEmail(data.email);
        }
        catch (error) {
            console.error('❌ Error al obtener perfil:', error.message);
            return { status: 'Error', message: 'Usuario no encontrado' };
        }
    }
    // Sincronizacion de botellas con kafka
    async manejarBotellaRecicladaNueva(data) {
        try {
            console.log('[User-Service] 📨 Evento Kafka recibido:', data);
            // Validamos si viene como userId o email
            const email = data.email || data.userId;
            const puntos = Number(data.puntos);
            if (email && !isNaN(puntos)) {
                await this.appService.sumarPuntos(email, puntos);
                console.log(`[User-Service] ✅ Puntos (${puntos}) sumados a: ${email}`);
            }
        }
        catch (error) {
            console.error('⚠️ Error procesando evento Kafka:', error.message);
        }
    }
    async handleCreateUser(data) {
        return await this.appService.createUser(data);
    }
    async handleSumarPuntos(data) {
        console.log('--- USER SERVICE: RECIBIENDO PUNTOS ---');
        console.log('Datos:', data);
        return await this.appService.sumarPuntos(data.email, Number(data.puntos));
    }
    // Canjes desde kafka-
    async manejarCanje(data) {
        try {
            const email = data.email;
            const puntos = Number(data.puntos);
            if (email && !isNaN(puntos)) {
                // En el service, crea una función que reste o usa sumarPuntos con valor negativo
                await this.appService.sumarPuntos(email, -puntos);
                console.log(`[User-Service] 📉 Canje procesado: -${puntos} puntos a ${email}`);
            }
        }
        catch (error) {
            console.error('⚠️ Error procesando canje:', error.message);
        }
    }
    async handleGetAllUsers() {
        console.log('[User-Service] Extrayendo lista completa de usuarios...');
        // Aquí llamamos a la función que acabamos de crear
        return await this.appService.findAll();
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_user_profile' }),
    tslib_1.__param(0, (0, microservices_1.Payload)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "handleGetProfile", null);
tslib_1.__decorate([
    (0, microservices_1.EventPattern)('botella_nueva'),
    tslib_1.__param(0, (0, microservices_1.Payload)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "manejarBotellaRecicladaNueva", null);
tslib_1.__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'create_user' }),
    tslib_1.__param(0, (0, microservices_1.Payload)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "handleCreateUser", null);
tslib_1.__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'add_points' }),
    tslib_1.__param(0, (0, microservices_1.Payload)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "handleSumarPuntos", null);
tslib_1.__decorate([
    (0, microservices_1.EventPattern)('canje_realizado'),
    tslib_1.__param(0, (0, microservices_1.Payload)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "manejarCanje", null);
tslib_1.__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_all_users' }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "handleGetAllUsers", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(6);
const typeorm_2 = __webpack_require__(9);
const user_entity_1 = __webpack_require__(10);
let AppService = class AppService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async createUser(data) {
        const existing = await this.userRepository.findOne({ where: { email: data.email } });
        if (existing)
            return existing;
        const user = this.userRepository.create({
            nombre: data.nombre,
            email: data.email,
            rol: data.role || 'estudiante',
            puntos: 0
        });
        return await this.userRepository.save(user);
    }
    async sumarPuntos(email, puntos) {
        const usuario = await this.userRepository.findOne({ where: { email } });
        if (!usuario)
            return { status: 'Error', message: 'No existe' };
        const nuevoPuntaje = Number(usuario.puntos) + Number(puntos);
        usuario.puntos = nuevoPuntaje < 0 ? 0 : nuevoPuntaje;
        const guardado = await this.userRepository.save(usuario);
        console.log(`[User-Service] DB Actualizada: ${email} ahora tiene ${usuario.puntos}`);
        //NOTIFICACIONES vIA N8N
        let premioLogrado = null;
        // Determinamos acorde a los canjes
        if (usuario.puntos === 100) {
            premioLogrado = "Vale un Parqueadero Preferencial";
        }
        else if (usuario.puntos === 50) {
            premioLogrado = "Vale un Ticket Comedor UCE";
        }
        else if (usuario.puntos === 10) {
            premioLogrado = "Vale Copia Gratis Biblioteca";
        }
        // Si el usuario alcanzó 10 puntos, disparamos n8n
        if (premioLogrado) {
            console.log(`[User-Service] 🚀 Meta alcanzada (${usuario.puntos} pts). Premio: ${premioLogrado}`);
            //URL n8n
            fetch('http://localhost:5678/webhook/alerta-reciclaje', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    estudiante: usuario.nombre,
                    email: usuario.email,
                    puntosActuales: usuario.puntos,
                    premio: premioLogrado,
                    facultad: "UCE - Ingeniería",
                    fecha: new Date().toLocaleDateString()
                })
            }).catch(err => console.error('⚠️ Error al conectar con n8n:', err.message));
        }
        return { ...guardado, status: 'Success' };
    }
    async buscarPorEmail(email) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user)
            throw new Error('No existe el usuario');
        return user;
    }
    async findAll() {
        return await this.userRepository.find({
            where: { rol: 'estudiante' },
            order: { puntos: 'DESC' }
        });
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], AppService);


/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.User = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(9);
let User = class User {
};
exports.User = User;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    tslib_1.__metadata("design:type", Number)
], User.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "nombre", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, unique: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "email", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'estudiante' }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "rol", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    tslib_1.__metadata("design:type", Number)
], User.prototype, "puntos", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    tslib_1.__metadata("design:type", Boolean)
], User.prototype, "estaActivo", void 0);
exports.User = User = tslib_1.__decorate([
    (0, typeorm_1.Entity)('usuarios')
], User);


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
// apps/user-service/src/main.ts
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // TCP: Aquí es donde el Gateway de la Cuenta 3 te buscará
    app.connectMicroservice({
        transport: microservices_1.Transport.TCP,
        options: {
            host: '0.0.0.0', // IMPORTANTE: 0.0.0.0 para que AWS permita tráfico externo
            port: 3001
        },
    });
    // CANAL KAFKA: (Tu configuración actual está bien)
    /*app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: { brokers: ['localhost:9092'] },
        consumer: { groupId: `user-group-${Date.now()}` }
      },
    });*/
    await app.startAllMicroservices();
    // CAMBIO CLAVE: Escuchar HTTP en el 4002 (o cualquier otro que no sea 3001)
    const httpPort = process.env.PORT || 4002;
    await app.listen(httpPort, '0.0.0.0');
    console.log(`✅ User-Service: TCP en 3001 | HTTP en ${httpPort}`);
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map