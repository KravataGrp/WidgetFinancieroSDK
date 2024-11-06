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
const react_native_encrypted_storage_1 = __importDefault(require("react-native-encrypted-storage"));
const react_native_device_info_1 = __importDefault(require("react-native-device-info"));
const LocalInfoService = () => {
    const setLocalData = (key, value) => __awaiter(void 0, void 0, void 0, function* () {
        yield react_native_encrypted_storage_1.default.setItem(key, value);
    });
    const getLocalData = (key) => __awaiter(void 0, void 0, void 0, function* () {
        let res = yield react_native_encrypted_storage_1.default.getItem(key);
        if (res) {
            return res;
        }
        return null;
    });
    const removeLocalData = (key) => __awaiter(void 0, void 0, void 0, function* () {
        yield react_native_encrypted_storage_1.default.removeItem(key);
        return true;
    });
    const clearAllData = () => __awaiter(void 0, void 0, void 0, function* () {
        yield react_native_encrypted_storage_1.default.clear();
    });
    //**Permite obtener el InstalacionID para saber que la solicitud es unica. */
    const getDeviceID = () => __awaiter(void 0, void 0, void 0, function* () {
        console.debug('entro a obtner la info del dispositivo');
        const deviceID = yield react_native_device_info_1.default.getAndroidId();
        const apiLevel = yield react_native_device_info_1.default.getApiLevel();
        const devideId = yield react_native_device_info_1.default.getDeviceId();
        const deviceName = yield react_native_device_info_1.default.getDeviceName();
        const instanceId = yield react_native_device_info_1.default.getInstanceId();
        const uniqueId = yield react_native_device_info_1.default.getUniqueId();
        return `${uniqueId}_${deviceName}`;
    });
    return { setLocalData, getLocalData, removeLocalData, getDeviceID, clearAllData };
};
exports.default = LocalInfoService;
