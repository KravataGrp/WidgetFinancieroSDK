package com.kravata.utils.services

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import com.kravata.utils.models.DataType

class SecurityStorageService(private val context: Context) {

    private val PREF_FILE_NAME = "kravata_secure_prefs"

    private val prefs by lazy {
        EncryptedSharedPreferences.create(
            PREF_FILE_NAME,
            MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC),
            context,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    fun saveKey(key: DataType, value: String) {
        prefs.edit().putString(key.name, value).apply()
    }

    fun getKey(key: DataType): String? {
        return prefs.getString(key.name, null)
    }
}