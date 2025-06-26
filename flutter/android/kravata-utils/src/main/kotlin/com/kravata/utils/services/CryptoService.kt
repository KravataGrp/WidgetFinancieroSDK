package com.kravata.utils.services

import android.util.Log
import com.kravata.utils.models.EncryptedData
import org.bouncycastle.crypto.digests.SHA384Digest
import org.bouncycastle.crypto.generators.HKDFBytesGenerator
import org.bouncycastle.crypto.params.HKDFParameters
import org.bouncycastle.jce.provider.BouncyCastleProvider
import java.security.KeyFactory
import java.security.PrivateKey
import java.security.PublicKey
import java.security.spec.InvalidKeySpecException
import java.security.spec.PKCS8EncodedKeySpec
import java.security.spec.X509EncodedKeySpec
import java.util.Base64
import java.util.Date
import javax.crypto.Cipher
import javax.crypto.KeyAgreement
import javax.crypto.Mac
import javax.crypto.SecretKey
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec


class CryptoService() {

    fun encryptData(dataCipher: String, publicPem: String, privatePem: String, nonce: String, macKey : String): EncryptedData {
        try {
            val publicKey : PublicKey = readPublicKey(publicPem)
            val privateKey : PrivateKey = readPrivateKey(privatePem)
            val sharedKey : ByteArray? = doExchange(publicKey, privateKey)
            val timestamp : Long = Date().time / 1000
            if(sharedKey != null) {
                val derivedKey = deriveHkdf(sharedKey, 32)
                var cipherText: ByteArray = encryptData(dataCipher.encodeToByteArray(), derivedKey, (nonce + (timestamp.toInt() / 100).toString()).takeLast(16))
                val hmac : ByteArray = hmacSha384(cipherText, (macKey + (timestamp.toInt()).toString()))
                return EncryptedData(cipherText.toHexString(), hmac.toHexString(), timestamp.toString())
            }else{
                throw Exception("Error la encriptar datos")
            }
        } catch(e: InvalidKeySpecException){
            Log.e("BRAIAM2ERROR", e.message, e)
            throw e
        }
        catch (e: Exception) {
            Log.e("BRAIAMERROR", e.message, e)
            throw e
        }
    }

    private fun readPublicKey(pem: String): PublicKey {
        val pem = this.decodeBase64IfValid(pem)
        val encodedPrivateKey = pem.replace("-----BEGIN PUBLIC KEY-----", "")
            .replace("-----END PUBLIC KEY-----", "")
            .trim()
            .replace("\\s+".toRegex(), "")

        val publicKeyBytes = Base64.getDecoder().decode(encodedPrivateKey)

        val publicKeySpec = X509EncodedKeySpec(publicKeyBytes)
        val keyFactory: KeyFactory = KeyFactory.getInstance("EC", BouncyCastleProvider())
        return keyFactory.generatePublic(publicKeySpec)
    }



    private fun readPrivateKey(pem: String): PrivateKey {
        val pem = this.decodeBase64IfValid(pem)
        val privateKey: PrivateKey = pem.toPrivateKey()
        return privateKey
    }

    private fun doExchange(publicKey: PublicKey, privateKey: PrivateKey): ByteArray? {
        val keyAgreement = KeyAgreement.getInstance("ECDH", BouncyCastleProvider())
        keyAgreement.init(privateKey)
        keyAgreement.doPhase(publicKey, true)
        return keyAgreement.generateSecret()
    }

    private fun deriveHkdf(shareKeyBytes: ByteArray, length: Int): SecretKey {
        // Configuración de HKDF
        val algorithm = SHA384Digest()
        val salt: ByteArray? = null
        val info: ByteArray? = null

        // Crear un objeto HKDF
        val hkdf = HKDFBytesGenerator(algorithm)
        hkdf.init(HKDFParameters(shareKeyBytes, salt, info))

        // Derivar la llave
        val derivedKey = ByteArray(length)
        hkdf.generateBytes(derivedKey, 0, length)
        return SecretKeySpec(derivedKey, "AES")
    }


    private fun encryptData(data: ByteArray, clave: SecretKey, iv: String): ByteArray {
        val paddedData = padPkcs7(data, 16)

        val cipher = Cipher.getInstance("AES/CTR/NoPadding")
        val ivParameterSpec = IvParameterSpec(iv.toByteArray())

        cipher.init(Cipher.ENCRYPT_MODE, clave, ivParameterSpec)
        return cipher.doFinal(paddedData)
    }

    private fun padPkcs7(data: ByteArray, blockSize: Int = 16): ByteArray {
        val padding = blockSize - (data.size % blockSize)
        return data + ByteArray(padding) { padding.toByte() }
    }

    private fun hmacSha384(data: ByteArray, clave: String): ByteArray {
        val hmacKey: SecretKey = SecretKeySpec(clave.encodeToByteArray(), "HmacSHA384")
        val mac = Mac.getInstance("HmacSHA384")
        val secretKeySpec = SecretKeySpec(hmacKey.encoded, "HmacSHA384")
        mac.init(secretKeySpec)
        return mac.doFinal(data)
    }

    fun String.toPrivateKey(): PrivateKey {
        val encodedPrivateKey = this.replace("-----BEGIN PRIVATE KEY-----", "")
            .replace("-----END PRIVATE KEY-----", "")
            .trim()
            .replace("\\s+".toRegex(), "")

        val decodedPrivateKey = Base64.getDecoder().decode(encodedPrivateKey)

        val keySpec = PKCS8EncodedKeySpec(decodedPrivateKey)

        val keyFactory = KeyFactory.getInstance("EC", BouncyCastleProvider())

        return keyFactory.generatePrivate(keySpec)
    }

    fun ByteArray.toHexString(): String {
        return joinToString(separator = "") {
            "%02x".format(it)
        }
    }

    private fun decodeBase64IfValid(input: String): String {
        return try {
            val decodedBytes = Base64.getDecoder().decode(input)
            val decodedString = String(decodedBytes, Charsets.UTF_8)

            if (decodedString.any { it.isISOControl() && it != '\n' && it != '\r' && it != '\t' }) {
                return input
            } else {
                return decodedString
            }
        } catch (e: IllegalArgumentException) {
            return input
        }
    }
}