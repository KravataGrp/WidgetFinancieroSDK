"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const React = __importStar(require("react"));
const react_1 = require("react");
const react_native_1 = require("react-native");
const react_native_webview_1 = __importDefault(require("react-native-webview"));
const react_native_fingerprint_scanner_1 = __importDefault(require("react-native-fingerprint-scanner"));
const LocalInfoService_1 = __importDefault(require("../services/LocalInfoService"));
const DataType_1 = __importDefault(require("../models/enums/DataType"));
const token_1 = require("../helpers/token");
const AccessService_1 = __importDefault(require("../services/AccessService"));
const KrWebViewComponent = ({ url, activeBiometric }) => {
    //TODO> Implementar logica para
    //* Escuchar los mensajes de texto
    //* Guardar el refreshKey en KeyChain para usarlo cuando se cargue de nuevo la pagina
    const webviewRef = React.createRef();
    const [userId, setUserId] = (0, react_1.useState)('d12495f9-b91a-474f-83a1-6069b428a2b8');
    const [otpCode, setOtpCode] = (0, react_1.useState)('569346');
    const [tokens, setTokens] = (0, react_1.useState)(null);
    const [isStarted, setIsStarted] = (0, react_1.useState)(false);
    console.debug('se cargo la pagina');
    const requiresLegacyAuthentication = (() => {
        return parseInt(react_native_1.Platform.Version.toString()) < 23;
    });
    const authCurrent = (() => __awaiter(void 0, void 0, void 0, function* () {
        console.debug('Entro a authCurrent');
        return yield react_native_fingerprint_scanner_1.default.authenticate({ title: 'Log in with Biometrics', description: 'Necesitamos saber quien eres' });
    }));
    const authLegacy = (() => __awaiter(void 0, void 0, void 0, function* () {
        console.debug('Entro a authLegacy');
        yield react_native_fingerprint_scanner_1.default
            .authenticate({ onAttempt: handleAuthenticationAttemptedLegacy });
    }));
    const handleAuthenticationAttemptedLegacy = (error) => {
        console.error('Error en handleAuthenticationAttemptedLegacy: ');
        console.error(error);
    };
    const registerBiometricLogin = (() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const localInfoService = (0, LocalInfoService_1.default)();
            yield localInfoService.setLocalData(DataType_1.default.APIKEYACCESS, 'YjvqVka1c8pqTxba');
            yield localInfoService.setLocalData(DataType_1.default.SECRETKEYACCESS, 'GgPNzNOpoXK68q20OW7a0BFu0dgCrgLn');
            let apiKey = yield localInfoService.getLocalData(DataType_1.default.APIKEYACCESS);
            let secretKey = yield localInfoService.getLocalData(DataType_1.default.SECRETKEYACCESS);
            if (!apiKey || !secretKey) {
                apiKey = (0, token_1.generateKey)(16);
                secretKey = (0, token_1.generateKey)(32);
                let deviceId = yield localInfoService.getDeviceID();
                const accessService = new AccessService_1.default();
                yield accessService.registerAccessMode(tokens, userId, apiKey, secretKey, deviceId);
                localInfoService.setLocalData(DataType_1.default.APIKEYACCESS, apiKey);
                localInfoService.setLocalData(DataType_1.default.SECRETKEYACCESS, secretKey);
            }
        }
        catch (error) {
            console.error('Error en registerBiometricLogin');
            console.error(error);
        }
    }));
    const loginBiometric = (() => __awaiter(void 0, void 0, void 0, function* () {
        let deviceID = yield (0, LocalInfoService_1.default)().getDeviceID();
        let apiKey = yield (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.APIKEYACCESS);
        let secretKey = yield (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.SECRETKEYACCESS);
        console.debug('Entro a loginBiometric');
        if (deviceID && apiKey && secretKey) {
            const accessService = new AccessService_1.default();
            let res = yield accessService.loginBiometric(deviceID, apiKey, secretKey);
            yield injectTokenBiometric(res.access_token, res.refresh_token, res.expires_in);
            setIsStarted(true);
        }
        else {
            throw Error('No es posible iniciar sesion');
        }
    }));
    const injectTokenBiometric = ((accessToken, refreshToken, expiredToken) => __awaiter(void 0, void 0, void 0, function* () {
        let dateNow = new Date();
        dateNow.setSeconds(dateNow.getSeconds() + parseInt(expiredToken));
        dateNow = dateNow.getTime().toString();
        console.debug('Va a intectar el codigo');
        const jsCode = `
        setTimeout(() => {
          localStorage.setItem("kra_accessToken", "${accessToken}");
          localStorage.setItem("kra_refreshToken", "${refreshToken}");
          localStorage.setItem("kra_expireDate", "${dateNow}");
        }, 1000);
      `;
        if (webviewRef.current) {
            webviewRef.current.injectJavaScript(jsCode);
        }
    }));
    (0, react_1.useEffect)(() => {
        const executeAsync = (() => __awaiter(void 0, void 0, void 0, function* () {
            console.debug('Entro a inyectar verificacion de codigo');
            //TODO> Montar proceso de obtener codigo OTP desde el SMS.
            // setTimeout(() =>{ injectCodeVerification(); }, 5000); 
            if (activeBiometric) {
                console.debug('activeBiometric es true');
                let accessToken = yield (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.APIKEYACCESS);
                console.debug('Obtuvo el accessToken');
                if (!accessToken && !tokens) {
                    console.log('Va a mirar los localstorage en la pagina');
                    setTimeout(() => { getTokens(); }, 10000);
                }
                else if (tokens && !isStarted) {
                    if (requiresLegacyAuthentication()) {
                        authLegacy().then(() => __awaiter(void 0, void 0, void 0, function* () {
                            console.log('Va a iniciar sesion con biometrico');
                            yield registerBiometricLogin();
                            console.log('Inicia proceso de sersion');
                            yield loginBiometric();
                        }))
                            .catch((error) => {
                            console.error('Error en authLegacy: ');
                            console.error(error);
                        });
                    }
                    else {
                        authCurrent().then(() => __awaiter(void 0, void 0, void 0, function* () {
                            console.log('Va a iniciar sesion con biometrico');
                            yield registerBiometricLogin();
                            console.log('Inicia proceso de sersion');
                            yield loginBiometric();
                        }))
                            .catch((error) => {
                            console.error('Error en authLegacy: ');
                            console.error(error);
                        });
                    }
                }
            }
        }));
        const injectCodeVerification = () => {
            console.debug('entro a inyeccion de codigo de acceso');
            const jsCode = `
          if(document.getElementById("number1")){
            document.getElementById("number1").value = "${otpCode.toString()[0]}";
            document.getElementById("number2").value = "${otpCode.toString()[1]}";
            document.getElementById("number3").value = "${otpCode.toString()[2]}";
            document.getElementById("number4").value = "${otpCode.toString()[3]}";
            document.getElementById("number5").value = "${otpCode.toString()[4]}";
            document.getElementById("number6").value = "${otpCode.toString()[5]}";
            document.getElementById("number6").dispatchEvent(new Event("keyup"));
          }
        `;
            if (webviewRef.current) {
                webviewRef.current.injectJavaScript(jsCode);
            }
            console.debug('Finalizo inyection de acceso');
        };
        const getTokens = (() => {
            const jsCode = `
          setTimeout(() => {
            if(localStorage.getItem('kra_accessToken')){
                  const datosLocalStorage = JSON.stringify({ 'accessToken': localStorage.getItem('kra_accessToken') });
                  window.ReactNativeWebView.postMessage(datosLocalStorage);
            }
          }, 1000);
        `;
            if (webviewRef.current) {
                webviewRef.current.injectJavaScript(jsCode);
            }
        });
        executeAsync();
    });
    const handleMessage = (event) => {
        console.debug('obtuvo el mensaje respuesta de webView');
        console.debug(event.nativeEvent.data);
        setTokens(JSON.parse(event.nativeEvent.data));
    };
    const handleOnLayout = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.debug('Entro a activar mensajes');
            //TODO> Implementar listener de mensajes SMS
        }
        catch (error) {
            console.error("error en flujo");
            console.error(error);
        }
    });
    const handlePress = () => {
        if (react_native_1.Platform.OS === 'android') {
            react_native_1.BackHandler.exitApp();
        }
        else {
            // Para iOS, utiliza el método 'pop' de la navegación
        }
    };
    console.debug('url es: ' + url);
    return (<react_native_1.View onLayout={handleOnLayout}>
        <react_native_1.TouchableOpacity onPress={handlePress}>
          <react_native_1.Text>Regresar</react_native_1.Text>
        </react_native_1.TouchableOpacity>
        <react_native_webview_1.default ref={webviewRef} source={{ uri: url }} style={{ width: '100%', height: 800 }} javaScriptEnabled={true} domStorageEnabled={true} startInLoadingState={true} onMessage={handleMessage}/>
      </react_native_1.View>);
};
exports.default = KrWebViewComponent;
