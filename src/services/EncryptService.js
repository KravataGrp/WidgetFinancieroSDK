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
const crypto_module_1 = __importDefault(require("../native-modules/crypto-module"));
const buffer_1 = __importDefault(require("buffer"));
const EncryptService = () => {
    const encryptInfo = (textToEncrypte, options) => __awaiter(void 0, void 0, void 0, function* () {
        console.debug('encriptando');
        let publicKey = buffer_1.default.Buffer.from(options.publicKeyECC, 'base64').toString('ascii');
        const privateKey = buffer_1.default.Buffer.from(options.privateKeyTemp, 'base64').toString('ascii');
        console.debug('entrando a back');
        let data = yield crypto_module_1.default.encryptData(textToEncrypte, publicKey, privateKey, options.saltNonce, options.saltHMac);
        const [textEncrypted, hmac, timestamp] = data.split(':');
        return { 'textEncrypted': textEncrypted, 'hmac': hmac, 'timestamp': timestamp };
    });
    return { encryptInfo };
};
exports.default = EncryptService;
