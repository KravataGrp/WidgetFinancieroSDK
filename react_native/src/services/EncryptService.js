"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_module_1 = __importDefault(require("../native-modules/crypto-module"));
const buffer_1 = __importDefault(require("buffer"));
const EncryptService = () => {
    const encryptInfo = async (textToEncrypte, options) => {
        console.debug('encriptando');
        let publicKey = buffer_1.default.Buffer.from(options.publicKeyECC, 'base64').toString('ascii');
        const privateKey = buffer_1.default.Buffer.from(options.privateKeyTemp, 'base64').toString('ascii');
        console.debug('entrando a back');
        let data = await crypto_module_1.default.encryptData(textToEncrypte, publicKey, privateKey, options.saltNonce, options.saltHMac);
        const [textEncrypted, hmac, timestamp] = data.split(':');
        return { 'textEncrypted': textEncrypted, 'hmac': hmac, 'timestamp': timestamp };
    };
    return { encryptInfo };
};
exports.default = EncryptService;
