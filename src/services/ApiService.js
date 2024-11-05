"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const LocalInfoService_1 = require("./LocalInfoService");
const DataType_1 = require("../models/enums/DataType");
class ApiService {
    domain = 'kravata.co';
    _api = axios_1.default.create();
    constructor() {
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
