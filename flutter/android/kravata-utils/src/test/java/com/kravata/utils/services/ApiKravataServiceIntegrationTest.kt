package com.kravata.utils.services

import android.content.Context
import android.util.Log
import androidx.test.core.app.ApplicationProvider
import com.kravata.utils.models.DataType
import kotlinx.coroutines.runBlocking
import okhttp3.OkHttpClient
import org.junit.Assert
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertSame
import org.junit.Before
import org.junit.Test
import org.mockito.ArgumentMatchers.any
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito.doNothing
import org.mockito.Mockito.doReturn
import org.mockito.Mockito.mock
import org.mockito.Mockito.mockStatic
import org.mockito.Mockito.spy
import org.mockito.Mockito.`when`

class ApiKravataServiceIntegrationTest {

    private lateinit var context: Context
    private lateinit var storage: SecurityStorageService
    private lateinit var client: OkHttpClient
    private lateinit var service: ApiKravataService

    @Before
    fun setup() {
        context = mock(Context::class.java)
        storage = mock(SecurityStorageService::class.java)
        client = OkHttpClient()

        val realService  = ApiKravataService(context, storage, client)
        service = spy(realService)
    }

    @Test
    fun `getUrlWidget returns url when all keys are set`() = runBlocking {
        `when`(storage.getKey(DataType.SUBDOMAIN)).thenReturn("v4ky7utf2gzo")
        `when`(storage.getKey(DataType.APIKEY)).thenReturn("Rj5dxnq2F8Kb6xCM")
        `when`(storage.getKey(DataType.SECRETKEY)).thenReturn("F9Na9vkmKWCvqchcFNLAHAxhkNmf2FEf")
        `when`(storage.getKey(DataType.PUBLICKEYECC)).thenReturn("LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUZZd0VBWUhLb1pJemowQ0FRWUZLNEVFQUFvRFFnQUVzb202TlhlcjBxYTc4eG1JZGgyZXY5N0VJc3Q0RG8zSgprUk9xbG1lbHhYRHJvS1JlOFIyMjI0UUNOS1Z0WDhLT2liWUZNcDZCUXVWRGE2T0VVRFFEVWc9PQotLS0tLUVORCBQVUJMSUMgS0VZLS0tLS0K")
        `when`(storage.getKey(DataType.SALTNONCE)).thenReturn("TxgR3czMk8LBf5BU")
        `when`(storage.getKey(DataType.SALTHMAC)).thenReturn("yDoiZzVIvV1J1Rfk")
        `when`(storage.getKey(DataType.DOMAIN)).thenReturn("kravata.co")
        `when`(storage.getKey(DataType.URLWIDGET)).thenReturn("")

        doNothing().`when`(storage).saveKey(DataType.SUBDOMAIN, "v4ky7utf2gzo")
        doReturn("Device2").`when`(service).getDeviceId()

        var url = service.getUrlWidget("3112133387", "57")
        Assert.assertTrue(url.contains("kravata.co"))
    }

}