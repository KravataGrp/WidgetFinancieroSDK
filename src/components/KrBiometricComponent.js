"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KrbiometricComponent = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const react_native_fingerprint_scanner_1 = require("react-native-fingerprint-scanner");
const AccessService_1 = require("../services/AccessService");
const LocalInfoService_1 = require("../services/LocalInfoService");
const DataType_1 = require("../models/enums/DataType");
const KrbiometricComponent = ({ activeParam, userId }) => {
    const [active, setActive] = (0, react_1.useState)(false);
    const generateKey = (size) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let key = '';
        for (let i = 0; i < size; i++) {
            key += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return key;
    };
    const login = async () => {
    };
    const checkAuthentication = async () => {
        try {
            await react_native_fingerprint_scanner_1.default.authenticate({
                title: 'Autenticación biometrica',
                description: 'Necesitamos saber quien eres',
            });
            const localInfoService = (0, LocalInfoService_1.default)();
            let apiKey = localInfoService.getLocalData(DataType_1.default.APIKEYACCESS);
            let secretKey = localInfoService.getLocalData(DataType_1.default.SECRETKEYACCESS);
            if (!apiKey || !secretKey) {
                apiKey = generateKey(16);
                secretKey = generateKey(32);
                const accessService = new AccessService_1.default();
                await accessService.registerAccessMode(userId, apiKey, secretKey);
                localInfoService.setLocalData(DataType_1.default.APIKEYACCESS, apiKey);
                localInfoService.setLocalData(DataType_1.default.SECRETKEYACCESS, secretKey);
            }
            else {
                await login();
            }
        }
        catch (error) {
            console.log(error);
        }
    };
    const handleOnLayout = async () => {
        try {
            await checkAuthentication();
        }
        catch (error) {
            console.log(error);
        }
    };
    return ((0, jsx_runtime_1.jsx)(react_native_1.View, { onLayout: handleOnLayout }));
};
exports.KrbiometricComponent = KrbiometricComponent;
