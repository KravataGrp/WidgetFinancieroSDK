package com.kravata.modules

// CryptoModuleTest.kt
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import junit.framework.TestCase.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.ArgumentMatchers.anyObject
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mock
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.`when`
import org.mockito.MockitoAnnotations
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.TextLayoutMode


@RunWith(RobolectricTestRunner::class)
@Config(sdk = [28])
class CryptoModuleTest {

    @Mock
    lateinit var reactContext: ReactApplicationContext

    private lateinit var cryptoModule: com.kravata.modules.CryptoModule
    private lateinit var promise: Promise

    @Before
    fun setup() {
        MockitoAnnotations.initMocks(this)
        cryptoModule = com.kravata.modules.CryptoModule(reactContext)
        promise = mock(Promise::class.java)
    }

    @Test
    fun checkActiveTest() {
        val cryptoModule = com.kravata.modules.CryptoModule(reactContext)
        val res = cryptoModule.checkActive()

        // Verificar que el texto cifrado no sea igual al original
        assertEquals("true", res)
    }

    @Test
    fun encryptDataTest() {
        val cryptoModule = com.kravata.modules.CryptoModule(reactContext)

        val dataCipher = "{ \"clientNumber\": \"+573156172828\" ,  \"deviceId\":\"6544543\"}"

        val publicPem = "-----BEGIN PUBLIC KEY-----\n" +
                "MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEsom6NXer0qa78xmIdh2ev97EIst4Do3J\n" +
                "kROqlmelxXDroKRe8R2224QCNKVtX8KOibYFMp6BQuVDa6OEUDQDUg==\n" +
                "-----END PUBLIC KEY-----\n"

        val privatePem = "-----BEGIN PRIVATE KEY-----\n" +
                "MIGEAgEAMBAGByqGSM49AgEGBSuBBAAKBG0wawIBAQQgtlSXuQ+NNszxDECGpIcc\n" +
                "UAC0vPR98R9mDOk7e31oTgihRANCAAQg2kLrJJfmGvl5OtNYhc3FBCoexbZuKA2E\n" +
                "owsQfy7ajCKVfKrzQXa6/8IYjQcZztYYMJVzgi5uWfOBe4A5Hi7L\n" +
                "-----END PRIVATE KEY-----\n"

        val nonce = "TxgR3czMk8LBf5BU"

        val macKey = "yDoiZzVIvV1J1Rfk"

        `when`(promise.resolve(anyString())).then {
            // Verificar que se llame con el resultado esperado
            println("REtorno: " + it.arguments[0].toString())
            assert(it.arguments[0].toString().length > 5)
        }

        cryptoModule.encryptData(dataCipher, publicPem, privatePem, nonce, macKey, promise)

        verify(promise).resolve(anyObject())
    }

//    @Test
//    fun encryptData_ErrorAlCifrarTest() {
//        val cryptoModule = com.kravata.modules.CryptoModule(reactContext)
//
//        val dataCipher = "Datos cifrados"
//        val publicPem = "Clave pública PEM"
//        val privatePem = "Clave privada PEM"
//        val macKey = "Clave MAC"
//
//        cryptoModule.encryptData(dataCipher, publicPem, privatePem, "", macKey, promise)
//
//        verify(promise).reject("Error al cifrar datos")
//    }
}