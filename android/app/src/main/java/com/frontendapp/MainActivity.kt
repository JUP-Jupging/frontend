package com.frontendapp

import android.content.pm.PackageManager
import android.content.pm.Signature
import android.os.Build
import android.os.Bundle
import android.util.Base64
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import java.security.MessageDigest

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "FrontEndApp"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    Log.i("KAKAO_KEY_HASH", getKeyHash() ?: "null")
  }

  private fun getKeyHash(): String? {
    return try {
      val signatures: Array<Signature> = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        // Android 9 (API 28)+ : GET_SIGNING_CERTIFICATES
        val pkgInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
          packageManager.getPackageInfo(
            packageName,
            PackageManager.PackageInfoFlags.of(PackageManager.GET_SIGNING_CERTIFICATES.toLong())
          )
        } else {
          @Suppress("DEPRECATION")
          packageManager.getPackageInfo(packageName, PackageManager.GET_SIGNING_CERTIFICATES)
        }

        val si = pkgInfo.signingInfo
        when {
          si == null -> emptyArray()
          si.hasMultipleSigners() -> si.apkContentsSigners ?: emptyArray()
          else -> si.signingCertificateHistory ?: emptyArray()
        }
      } else {
        // Pre-P : GET_SIGNATURES (deprecated)
        @Suppress("DEPRECATION")
        packageManager.getPackageInfo(packageName, PackageManager.GET_SIGNATURES)
          .signatures ?: emptyArray()
      }

      val firstSig = signatures.firstOrNull() ?: return null
      val md = MessageDigest.getInstance("SHA")
      val digest = md.digest(firstSig.toByteArray())
      Base64.encodeToString(digest, Base64.NO_WRAP)
    } catch (e: Exception) {
      Log.e("KAKAO_KEY_HASH", "Failed to compute key hash", e)
      null
    }
  }
}
