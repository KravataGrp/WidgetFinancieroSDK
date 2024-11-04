"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const DataType_1 = require("../models/enums/DataType");
const ApiService_1 = require("./ApiService");
const EncryptService_1 = require("./EncryptService");
const LocalInfoService_1 = require("./LocalInfoService");
class AccessService extends ApiService_1.default {
    __apiKey;
    __secretKey;
    __publicKeyECC;
    __saltNonce;
    __saltHMac;
    constructor() {
        super();
    }
    async __loadKeys() {
        this.__apiKey = await (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.APIKEY);
        this.__secretKey = await (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.SECRETKEY);
        this.__publicKeyECC = await (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.PUBLICKEYECC);
        this.__saltNonce = await (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.SALTNONCE);
        this.__saltHMac = await (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.SALTHMAC);
        if (!this.__apiKey || !this.__secretKey || !this.__publicKeyECC || !this.__saltNonce || !this.__saltHMac) {
            throw new Error('ApiKey, SecretKey, publicKeyECC, saltNonce, saltHMac is required');
        }
    }
    async __getPrivateKeyTemp() {
        try {
            let keyAccess = {
                'apiKey': this.__apiKey,
                'secretKey': this.__secretKey,
            };
            const respuesta = await this._api.post('/api/settings/keyaccestemp', keyAccess);
            return respuesta.data.tempKey;
        }
        catch (error) {
            console.error('Error en getPrivateKeyTemp');
            console.error(error);
        }
    }
    /**
     * Ejecuta la logica de negocio para solicitar el private key ECC
     * Ejecuta servicios de encriptacion de datos
     * Obtiene la url que se mostrara en el widget
     * @returns la url que se mosrara en el widget
     */
    async getUrlWidget(clientNumber, countryCode) {
        let urlWidget = await (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.URLWIDGET);
        if (!urlWidget) {
            await this.__loadKeys();
            let privateKey = await this.__getPrivateKeyTemp();
            if (!privateKey) {
                throw new Error('Private Temp Key invalid');
            }
            let deviceID = await (0, LocalInfoService_1.default)().getDeviceID();
            if (!deviceID) {
                throw new Error('No es posible obtener el deviceId y es requerido');
            }
            let jsonEncrypt = {
                'clientNumber': `+${countryCode}${clientNumber}`,
                'deviceId': deviceID,
            };
            let encryptedData = await (0, EncryptService_1.default)().encryptInfo(JSON.stringify(jsonEncrypt), {
                publicKeyECC: this.__publicKeyECC,
                privateKeyTemp: privateKey,
                saltNonce: this.__saltNonce ?? '',
                saltHMac: this.__saltHMac ?? '',
            });
            urlWidget = await this.__getWidgetUrl(encryptedData.textEncrypted, encryptedData.hmac, encryptedData.timestamp);
            if (urlWidget) {
                await (0, LocalInfoService_1.default)().setLocalData(DataType_1.default.URLWIDGET, urlWidget);
            }
            else {
                throw new Error('Error in get url widget');
            }
        }
        return urlWidget;
    }
    async registerAccessMode(tokens, userId, apiKey, secretKey, deviceID) {
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
            let subdomain = await (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.SUBDOMAIN);
            const api = axios_1.default.create({
                baseURL: `https://${subdomain}.${this.domain}`,
                headers: headers,
            });
            const response = await api.post('/api/token/register', req);
            console.debug('Retorno: ');
            console.debug(response.data);
            return response.data;
        }
        catch (error) {
            console.error('Error in registerAccessMode');
            console.error(error);
            throw error;
        }
    }
    async loginBiometric(deviceID, apiKey, secretKey) {
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
            let subdomain = await (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.SUBDOMAIN);
            const api = axios_1.default.create({
                baseURL: `https://${subdomain}.${this.domain}`,
                headers: headers,
            });
            const response = await api.post('/api/token/login', new URLSearchParams(req).toString());
            console.debug('Retorno LoginBiometric: ');
            console.debug(response.data);
            return response.data;
        }
        catch (error) {
            console.error('Error el LogicBiometric');
            console.error(error);
            throw error;
        }
    }
    async __getWidgetUrl(encryptedData, hmac, timestamp) {
        try {
            let req = {
                'textEncrypted': encryptedData,
                'hmac': hmac,
                'timestamp': timestamp,
            };
            const respuesta = await this._api.post('/api/settings/urlwidget', req);
            return respuesta.data.urlAccess;
        }
        catch (error) {
            console.error('Error en getWidgetUrl');
            console.error(error);
        }
    }
}
exports.default = AccessService;
