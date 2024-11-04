"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KrWebViewComponent = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const react_native_webview_1 = require("react-native-webview");
const react_native_fingerprint_scanner_1 = require("react-native-fingerprint-scanner");
const LocalInfoService_1 = require("../services/LocalInfoService");
const DataType_1 = require("../models/enums/DataType");
const token_1 = require("../helpers/token");
const AccessService_1 = require("../services/AccessService");
const KrWebViewComponent = ({ url, activeBiometric }) => {
    //TODO> Implementar logica para
    //* Escuchar los mensajes de texto
    //* Guardar el refreshKey en KeyChain para usarlo cuando se cargue de nuevo la pagina
    const webviewRef = react_1.default.createRef();
    const [userId, setUserId] = (0, react_1.useState)('d12495f9-b91a-474f-83a1-6069b428a2b8');
    const [otpCode, setOtpCode] = (0, react_1.useState)('569346');
    const [tokens, setTokens] = (0, react_1.useState)(null);
    const [isStarted, setIsStarted] = (0, react_1.useState)(false);
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
    });
    (0, react_1.useEffect)(() => {
        const executeAsync = (async () => {
            console.debug('Entro a inyectar verificacion de codigo');
            //TODO> Montar proceso de obtener codigo OTP desde el SMS.
            // setTimeout(() =>{ injectCodeVerification(); }, 5000); 
            if (activeBiometric) {
                console.debug('activeBiometric es true');
                let accessToken = await (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.APIKEYACCESS);
                console.debug('Obtuvo el accessToken');
                if (!accessToken && !tokens) {
                    console.log('Va a mirar los localstorage en la pagina');
                    setTimeout(() => { getTokens(); }, 10000);
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
    const handleOnLayout = async () => {
        try {
            console.debug('Entro a activar mensajes');
            //TODO> Implementar listener de mensajes SMS
        }
        catch (error) {
            console.error("error en flujo");
            console.error(error);
        }
    };
    const handlePress = () => {
        if (react_native_1.Platform.OS === 'android') {
            react_native_1.BackHandler.exitApp();
        }
        else {
            // Para iOS, utiliza el método 'pop' de la navegación
        }
    };
    console.debug('url es: ' + url);
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { onLayout: handleOnLayout, children: [(0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { onPress: handlePress, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { children: "Regresar" }) }), (0, jsx_runtime_1.jsx)(react_native_webview_1.default, { ref: webviewRef, source: { uri: url }, style: { width: '100%', height: 800 }, javaScriptEnabled: true, domStorageEnabled: true, startInLoadingState: true, onMessage: handleMessage })] }));
};
exports.KrWebViewComponent = KrWebViewComponent;
