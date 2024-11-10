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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const react_1 = require("react");
const react_native_1 = require("react-native");
const react_native_webview_1 = __importDefault(require("react-native-webview"));
const FontAwesome_1 = __importDefault(require("react-native-vector-icons/FontAwesome"));
const react_native_fingerprint_scanner_1 = __importDefault(require("react-native-fingerprint-scanner"));
const LocalInfoService_1 = __importDefault(require("../services/LocalInfoService"));
const DataType_1 = __importDefault(require("../models/enums/DataType"));
const token_1 = require("../helpers/token");
const AccessService_1 = __importDefault(require("../services/AccessService"));
const KrWebViewComponent = ({ url, activeBiometric, showBackButton }) => {
    const webviewRef = React.createRef();
    const [userId, setUserId] = (0, react_1.useState)('d12495f9-b91a-474f-83a1-6069b428a2b8');
    const [otpCode, setOtpCode] = (0, react_1.useState)('');
    const [tokens, setTokens] = (0, react_1.useState)(null);
    const [isStarted, setIsStarted] = (0, react_1.useState)(false);
    const [receiveSmsPermission, setReceiveSmsPermission] = (0, react_1.useState)('');
    console.debug('se cargo la pagina');
    const requiresLegacyAuthentication = (() => {
        return parseInt(react_native_1.Platform.Version.toString()) < 23;
    });
    const authCurrent = (async () => {
        console.debug('Entro a authCurrent');
        return await react_native_fingerprint_scanner_1.default.authenticate({ title: 'Log in with Biometrics', description: 'Necesitamos saber quien eres' });
    });
    const authLegacy = (async () => {
        console.debug('Entro a authLegacy');
        await react_native_fingerprint_scanner_1.default
            .authenticate({ onAttempt: handleAuthenticationAttemptedLegacy });
    });
    const handleAuthenticationAttemptedLegacy = (error) => {
        console.error('Error en handleAuthenticationAttemptedLegacy: ');
        console.error(error);
    };
    const registerBiometricLogin = (async () => {
        try {
            const localInfoService = (0, LocalInfoService_1.default)();
            await localInfoService.setLocalData(DataType_1.default.APIKEYACCESS, 'YjvqVka1c8pqTxba');
            await localInfoService.setLocalData(DataType_1.default.SECRETKEYACCESS, 'GgPNzNOpoXK68q20OW7a0BFu0dgCrgLn');
            let apiKey = await localInfoService.getLocalData(DataType_1.default.APIKEYACCESS);
            let secretKey = await localInfoService.getLocalData(DataType_1.default.SECRETKEYACCESS);
            if (!apiKey || !secretKey) {
                apiKey = (0, token_1.generateKey)(16);
                secretKey = (0, token_1.generateKey)(32);
                let deviceId = await localInfoService.getDeviceID();
                const accessService = new AccessService_1.default();
                await accessService.registerAccessMode(tokens, userId, apiKey, secretKey, deviceId);
                localInfoService.setLocalData(DataType_1.default.APIKEYACCESS, apiKey);
                localInfoService.setLocalData(DataType_1.default.SECRETKEYACCESS, secretKey);
            }
        }
        catch (error) {
            console.error('Error en registerBiometricLogin');
            console.error(error);
        }
    });
    const loginBiometric = (async () => {
        let deviceID = await (0, LocalInfoService_1.default)().getDeviceID();
        let apiKey = await (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.APIKEYACCESS);
        let secretKey = await (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.SECRETKEYACCESS);
        console.debug('Entro a loginBiometric');
        if (deviceID && apiKey && secretKey) {
            const accessService = new AccessService_1.default();
            let res = await accessService.loginBiometric(deviceID, apiKey, secretKey);
            await injectTokenBiometric(res.access_token, res.refresh_token, res.expires_in);
            setIsStarted(true);
        }
        else {
            throw Error('No es posible iniciar sesion');
        }
    });
    const injectTokenBiometric = (async (accessToken, refreshToken, expiredToken) => {
        let dateNow = new Date();
        dateNow.setSeconds(dateNow.getSeconds() + parseInt(expiredToken));
        dateNow = dateNow.getTime().toString();
        console.debug('Va a intectar el codigo de acceso biometrico');
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
    });
    const requestSmsPermission = async () => {
        try {
            console.debug("Va a requerir el permiso");
            const permission = await react_native_1.PermissionsAndroid.request(react_native_1.PermissionsAndroid.PERMISSIONS.RECEIVE_SMS);
            setReceiveSmsPermission(permission);
        }
        catch (err) {
            console.log(err);
        }
    };
    (0, react_1.useEffect)(() => {
        requestSmsPermission();
    }, []);
    (0, react_1.useEffect)(() => {
        if (receiveSmsPermission === react_native_1.PermissionsAndroid.RESULTS.GRANTED) {
            let subscriber = react_native_1.DeviceEventEmitter.addListener('onSMSReceived', message => {
                console.log(typeof (message));
                const res = JSON.parse(message.replace('NativeMap', '"NativeMap"'));
                const otpRegex = /\d{6}/;
                const otp = res.NativeMap.messageBody.match(otpRegex);
                if (otp) {
                    setOtpCode(otp.toString());
                }
            });
            return () => {
                subscriber.remove();
            };
        }
    }, [receiveSmsPermission]);
    console.debug('Va a entrar a OTP Code');
    if (otpCode) {
        console.debug('entro a OTP Code');
        const executeAsync = (async () => {
            if (!await (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.APIKEYACCESS)) {
                console.debug('Entro a inyectar verificacion de codigo');
                await injectCodeVerification();
            }
            if (activeBiometric) {
                console.debug('activeBiometric es true');
                let accessToken = await (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.APIKEYACCESS);
                console.debug('Obtuvo el accessToken');
                if (!accessToken && !tokens) {
                    console.log('Va a mirar los localstorage en la pagina');
                    setTimeout(() => { getTokens(); }, 5000);
                }
                else if (tokens && !isStarted) {
                    if (requiresLegacyAuthentication()) {
                        authLegacy().then(async () => {
                            console.log('Va a iniciar sesion con biometrico');
                            await registerBiometricLogin();
                            console.log('Inicia proceso de sersion');
                            await loginBiometric();
                        })
                            .catch((error) => {
                            console.error('Error en authLegacy: ');
                            console.error(error);
                        });
                    }
                    else {
                        authCurrent().then(async () => {
                            console.log('Va a iniciar sesion con biometrico');
                            await registerBiometricLogin();
                            console.log('Inicia proceso de sersion');
                            await loginBiometric();
                        })
                            .catch((error) => {
                            console.error('Error en authLegacy: ');
                            console.error(error);
                        });
                    }
                }
            }
        });
        const injectCodeVerification = async () => {
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
            return true;
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
    }
    const handleMessage = (event) => {
        console.debug('obtuvo el mensaje respuesta de webView');
        console.debug(event.nativeEvent.data);
        setTokens(JSON.parse(event.nativeEvent.data));
    };
    const handlePress = () => {
        if (react_native_1.Platform.OS.toLowerCase() == 'android') {
            react_native_1.BackHandler.exitApp();
        }
        else {
            // Para iOS, utiliza el método 'pop' de la navegación
        }
    };
    const styles = react_native_1.StyleSheet.create({
        container: {
            flex: 1,
        },
        webView: {
            width: '100%',
            height: '100%',
        },
    });
    console.debug('url es: ' + url);
    return (<react_native_1.View style={styles.container}>
        {showBackButton &&
            <react_native_1.TouchableOpacity onPress={handlePress}>
          <FontAwesome_1.default name="chevron-left" size={20} color="#4F8EF7"/>
        </react_native_1.TouchableOpacity>}
        <react_native_webview_1.default ref={webviewRef} source={{ uri: url }} style={styles.webView} javaScriptEnabled={true} domStorageEnabled={true} startInLoadingState={true} onMessage={handleMessage}/>
      </react_native_1.View>);
};
exports.default = KrWebViewComponent;
