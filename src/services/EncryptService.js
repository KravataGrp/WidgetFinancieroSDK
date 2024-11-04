"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_module_1 = require("../native-modules/crypto-module");
const EncryptService = () => {
    const encryptInfo = async (textToEncrypte, options) => {
        let publicKey = atob(options.publicKeyECC);
        const privateKey = atob(options.privateKeyTemp);
        let data = await crypto_module_1.default.encryptData(textToEncrypte, publicKey, privateKey, options.saltNonce, options.saltHMac);
        const [textEncrypted, hmac, timestamp] = data.split(':');
        return { 'textEncrypted': textEncrypted, 'hmac': hmac, 'timestamp': timestamp };
    };
    return { encryptInfo };
};
exports.default = EncryptService;
