package com.kravata.utils.models

data class EncryptedData(
    val textEncrypted: String,
    val hmac: String,
    val timestamp: String
)