"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const LocalInfoService_1 = __importDefault(require("./LocalInfoService"));
const DataType_1 = __importDefault(require("../models/enums/DataType"));
class ApiService {
    constructor() {
        this.domain = 'kravata.co';
        this._api = axios_1.default.create();
        (0, LocalInfoService_1.default)().getLocalData(DataType_1.default.SUBDOMAIN).then((subdomain) => {
            if (!subdomain) {
                subdomain = 'v4ky7utf2gzo';
            }
            this._api = axios_1.default.create({
                baseURL: `https://${subdomain}.${this.domain}`,
            });
        });
    }
}
exports.default = ApiService;
