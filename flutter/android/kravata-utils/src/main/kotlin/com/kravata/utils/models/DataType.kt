package com.kravata.utils.models

enum class DataType(val value: String) {
    SUBDOMAIN("subdomain"),
    APIKEY("apiKey"),
    SECRETKEY("secretKey"),
    PUBLICKEYECC("publicKeyECC"),
    SALTNONCE("saltNonce"),
    SALTHMAC("saltHMac"),
    URLWIDGET("urlWidget"),
    APIKEYACCESS("apiKeyAccess"),
    SECRETKEYACCESS("secretKeyAccess"),
    USERID("userId"),
    DOMAIN("domain");
}
