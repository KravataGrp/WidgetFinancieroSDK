"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const DataType_1 = __importDefault(require("../models/enums/DataType"));
const ApiService_1 = __importDefault(require("./ApiService"));
const EncryptService_1 = __importDefault(require("./EncryptService"));
const LocalInfoService_1 = __importDefault(require("./LocalInfoService"));
class AccessService extends ApiService_1.default {
    constructor() {
        super();
    }
    __loadKeys() {
        return __awaiter(this, void 0, void 0, function* () {
            this.__apiKey = yield (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.APIKEY);
            this.__secretKey = yield (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.SECRETKEY);
            this.__publicKeyECC = yield (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.PUBLICKEYECC);
            this.__saltNonce = yield (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.SALTNONCE);
            this.__saltHMac = yield (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.SALTHMAC);
            if (!this.__apiKey || !this.__secretKey || !this.__publicKeyECC || !this.__saltNonce || !this.__saltHMac) {
                throw new Error('ApiKey, SecretKey, publicKeyECC, saltNonce, saltHMac is required');
            }
        });
    }
    __getPrivateKeyTemp() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                let keyAccess = {
                    'apiKey': this.__apiKey,
                    'secretKey': this.__secretKey,
                };
                let subdomain = (_a = yield (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.SUBDOMAIN)) !== null && _a !== void 0 ? _a : 'v4ky7utf2gzo';
                const api = axios_1.default.create({
                    baseURL: `https://${subdomain}.${this.domain}`,
                });
                const response = yield api.post('/api/settings/keyaccestemp', keyAccess);
                return response.data.tempKey;
            }
            catch (error) {
                console.error('Error en getPrivateKeyTemp');
                console.error(JSON.stringify(error));
            }
        });
    }
    /**
     * Ejecuta la logica de negocio para solicitar el private key ECC
     * Ejecuta servicios de encriptacion de datos
     * Obtiene la url que se mostrara en el widget
     * @returns la url que se mosrara en el widget
     */
    getUrlWidget(clientNumber, countryCode) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            let urlWidget = yield (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.URLWIDGET);
            if (!urlWidget) {
                yield this.__loadKeys();
                let privateKey = yield this.__getPrivateKeyTemp();
                if (!privateKey) {
                    throw new Error('Private Temp Key invalid');
                }
                let deviceID = yield (0, LocalInfoService_1.default)().getDeviceID();
                if (!deviceID) {
                    throw new Error('No es posible obtener el deviceId y es requerido');
                }
                let jsonEncrypt = {
                    'clientNumber': `+${countryCode}${clientNumber}`,
                    'deviceId': deviceID,
                };
                console.log('procede a encriptar');
                let encryptedData = yield (0, EncryptService_1.default)().encryptInfo(JSON.stringify(jsonEncrypt), {
                    publicKeyECC: this.__publicKeyECC,
                    privateKeyTemp: privateKey,
                    saltNonce: (_a = this.__saltNonce) !== null && _a !== void 0 ? _a : '',
                    saltHMac: (_b = this.__saltHMac) !== null && _b !== void 0 ? _b : '',
                });
                console.debug('data Encriptada: ');
                console.debug(encryptedData);
                urlWidget = yield this.__getWidgetUrl(encryptedData.textEncrypted, encryptedData.hmac, encryptedData.timestamp);
                if (urlWidget) {
                    yield (0, LocalInfoService_1.default)().setLocalData(DataType_1.default.URLWIDGET, urlWidget);
                }
                else {
                    throw new Error('Error in get url widget');
                }
            }
            return urlWidget;
        });
    }
    registerAccessMode(tokens, userId, apiKey, secretKey, deviceID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let req = {
                    'userId': userId,
                    'keyName': 'biometric',
                    'accessKey': apiKey,
                    'privateKey': secretKey,
                    'boosterKey': '',
                    'metadataAccess': '{}',
                };
                let headers = {
                    'Authorization': `Bearer ${tokens.accessToken}`,
                    'Content-Type': 'application/json',
                    'X-Device-ID': 'undefined',
                };
                let subdomain = yield (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.SUBDOMAIN);
                const api = axios_1.default.create({
                    baseURL: `https://${subdomain}.${this.domain}`,
                    headers: headers,
                });
                const response = yield api.post('/api/token/register', req);
                console.debug('Retorno: ');
                console.debug(response.data);
                return response.data;
            }
            catch (error) {
                console.error('Error in registerAccessMode');
                console.error(error);
                throw error;
            }
        });
    }
    loginBiometric(deviceID, apiKey, secretKey) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.debug('Iniciando LoginBiometric');
                let req = {
                    'grant_type': 'password',
                    'accessKey': apiKey,
                    'privateKey': secretKey,
                    'scope': 'private',
                };
                const basicAuth = `${apiKey}:${secretKey}`;
                let headers = {
                    'Authorization': `Basic ${btoa(basicAuth)}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Device-ID': 'undefined',
                };
                let subdomain = yield (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.SUBDOMAIN);
                const api = axios_1.default.create({
                    baseURL: `https://${subdomain}.${this.domain}`,
                    headers: headers,
                });
                const response = yield api.post('/api/token/login', new URLSearchParams(req).toString());
                console.debug('Retorno LoginBiometric: ');
                console.debug(response.data);
                return response.data;
            }
            catch (error) {
                console.error('Error el LogicBiometric');
                console.error(error);
                throw error;
            }
        });
    }
    __getWidgetUrl(encryptedData, hmac, timestamp) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                let req = {
                    'textEncrypted': encryptedData,
                    'hmac': hmac,
                    'timestamp': timestamp,
                };
                let subdomain = (_a = yield (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.SUBDOMAIN)) !== null && _a !== void 0 ? _a : 'v4ky7utf2gzo';
                const api = axios_1.default.create({
                    baseURL: `https://${subdomain}.${this.domain}`,
                });
                const response = yield api.post('/api/settings/urlwidget', req);
                console.debug('respuesta: ');
                console.debug(response.data);
                return response.data.urlAccess;
            }
            catch (error) {
                console.error('Error en getWidgetUrl');
                console.error(error);
            }
        });
    }
}
exports.default = AccessService;
