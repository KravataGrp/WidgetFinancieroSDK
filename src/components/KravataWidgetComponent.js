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
const KrWebViewComponent_1 = __importDefault(require("./KrWebViewComponent"));
const AccessService_1 = __importDefault(require("../services/AccessService"));
const KravataWidgetComponent = ({ title, phoneClient, countryCodeClient, activeBiometric }) => {
    const [url, setUrl] = (0, react_1.useState)('');
    const handleOnLayout = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let accessServices = new AccessService_1.default();
            setUrl(yield accessServices.getUrlWidget(phoneClient, countryCodeClient));
        }
        catch (error) {
            console.error('Error in HandleOnLayout');
            console.error(JSON.stringify(error));
            console.error(error);
        }
    });
    return (<react_native_1.View onLayout={handleOnLayout}>
            <react_native_1.Text>{title}</react_native_1.Text>
            {url && <KrWebViewComponent_1.default url={url} activeBiometric={activeBiometric}/>}
        </react_native_1.View>);
};
exports.default = KravataWidgetComponent;
