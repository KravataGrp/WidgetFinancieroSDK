package com.kravata.utils.services

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import androidx.test.platform.app.InstrumentationRegistry
import com.kravata.utils.models.DataType
import okhttp3.OkHttpClient
import org.junit.Assert.assertSame
import org.junit.Before
import org.junit.Test

class ApiKravataServiceTest {


    private lateinit var context: Context
    private lateinit var storage: SecurityStorageService
    private lateinit var client: OkHttpClient
    private lateinit var service: ApiKravataService

    @Before
    fun setup() {
        context = InstrumentationRegistry.getInstrumentation().targetContext
        storage = SecurityStorageService(context)
        client = OkHttpClient()

        service = ApiKravataService(context, storage, client)
    }

    @Test
    fun getUrlWidgetValid() {

        storage.saveKey(DataType.SUBDOMAIN, "v4ky7utf2gzo")
        storage.saveKey(DataType.APIKEY, "Rj5dxnq2F8Kb6xCM")
        storage.saveKey(DataType.SECRETKEY, "F9Na9vkmKWCvqchcFNLAHAxhkNmf2FEf")
        storage.saveKey(DataType.PUBLICKEYECC, "LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUZZd0VBWUhLb1pJemowQ0FRWUZLNEVFQUFvRFFnQUVzb202TlhlcjBxYTc4eG1JZGgyZXY5N0VJc3Q0RG8zSgprUk9xbG1lbHhYRHJvS1JlOFIyMjI0UUNOS1Z0WDhLT2liWUZNcDZCUXVWRGE2T0VVRFFEVWc9PQotLS0tLUVORCBQVUJMSUMgS0VZLS0tLS0K")
        storage.saveKey(DataType.SALTNONCE, "TxgR3czMk8LBf5BU")
        storage.saveKey(DataType.SALTHMAC, "yDoiZzVIvV1J1Rfk")
        storage.saveKey(DataType.DOMAIN, "kravata.co")

        var url = service.getUrlWidget("3112133233", "+57")
        assertSame("kravata.co", url)

    }
}