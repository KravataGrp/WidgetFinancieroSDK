"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KravataWidgetComponent = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const KrWebViewComponent_1 = require("./KrWebViewComponent");
const AccessService_1 = require("../services/AccessService");
const KravataWidgetComponent = ({ title, phoneClient, countryCodeClient, activeBiometric }) => {
    const [url, setUrl] = (0, react_1.useState)('');
    const handleOnLayout = async () => {
        try {
            let accessServices = new AccessService_1.default();
            setUrl(await accessServices.getUrlWidget(phoneClient, countryCodeClient));
            // setUrl('https://v4ky7utf2gzo-fr.kravata.co/dashboard?token=a2de41a5da30a817faa43d839ff3727bd3798b1cd738642c06f499b768f0cd75');
        }
        catch (error) {
            console.error('Error in HandleOnLayout');
            console.error(error);
        }
    };
    return ((0, jsx_runtime_1.jsxs)(react_native_1.View, { onLayout: handleOnLayout, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { children: title }), url && (0, jsx_runtime_1.jsx)(KrWebViewComponent_1.KrWebViewComponent, { url: url, activeBiometric: activeBiometric })] }));
};
exports.KravataWidgetComponent = KravataWidgetComponent;
