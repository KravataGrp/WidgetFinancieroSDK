"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_native_encrypted_storage_1 = require("react-native-encrypted-storage");
const react_native_device_info_1 = require("react-native-device-info");
const LocalInfoService = () => {
    const setLocalData = async (key, value) => {
        await react_native_encrypted_storage_1.default.setItem(key, value);
    };
    const getLocalData = async (key) => {
        let res = await react_native_encrypted_storage_1.default.getItem(key);
        if (res) {
            return res;
        }
        return null;
    };
    const removeLocalData = async (key) => {
        await react_native_encrypted_storage_1.default.removeItem(key);
        return true;
    };
    const clearAllData = async () => {
        await react_native_encrypted_storage_1.default.clear();
    };
    //**Permite obtener el InstalacionID para saber que la solicitud es unica. */
    const getDeviceID = async () => {
        console.debug('entro a obtner la info del dispositivo');
        const deviceID = await react_native_device_info_1.default.getAndroidId();
        const apiLevel = await react_native_device_info_1.default.getApiLevel();
        const devideId = await react_native_device_info_1.default.getDeviceId();
        const deviceName = await react_native_device_info_1.default.getDeviceName();
        const instanceId = await react_native_device_info_1.default.getInstanceId();
        const uniqueId = await react_native_device_info_1.default.getUniqueId();
        return `${uniqueId}_${deviceName}`;
    };
    return { setLocalData, getLocalData, removeLocalData, getDeviceID, clearAllData };
};
exports.default = LocalInfoService;
