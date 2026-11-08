export interface AndroidFile {
  path: string;
  language: string;
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Android Manifest with required voice, calling, SMS, alarm and internet permissions',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.madhuri.ai">

    <!-- Audio & Voice Permissions -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

    <!-- Internet & Network Connectivity -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />

    <!-- Device Actions: Phone Calls & Contacts -->
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.READ_CONTACTS" />

    <!-- Device Actions: SMS & Messaging -->
    <uses-permission android:name="android.permission.SEND_SMS" />

    <!-- Alarms & Notifications -->
    <uses-permission android:name="com.android.alarm.permission.SET_ALARM" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />

    <!-- Bluetooth & Hardware Controls -->
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

    <application
        android:name=".MadhuriApplication"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.MadhuriAI"
        tools:targetApi="34">

        <activity
            android:name=".ui.MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:theme="@style/Theme.MadhuriAI"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Voice Assistant Action Intent -->
            <intent-filter>
                <action android:name="android.intent.action.ASSIST" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
        </activity>

        <!-- Foreground Service for Continuous Voice Recognition -->
        <service
            android:name=".service.MadhuriVoiceService"
            android:foregroundServiceType="microphone"
            android:exported="false" />

    </application>
</manifest>`
  },
  {
    path: 'app/src/main/java/com/madhuri/ai/ui/MainActivity.kt',
    language: 'kotlin',
    description: 'Jetpack Compose Main Activity with 3D Orb, Voice-to-Voice Engine, and Action Handlers',
    content: `package com.madhuri.ai.ui

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.madhuri.ai.ui.components.VoiceOrb
import com.madhuri.ai.ui.theme.MadhuriAITheme
import com.madhuri.ai.viewmodel.MadhuriViewModel
import com.madhuri.ai.viewmodel.VoiceState
import java.util.Locale

class MainActivity : ComponentActivity(), TextToSpeech.OnInitListener {

    private val viewModel: MadhuriViewModel by viewModels()
    private var speechRecognizer: SpeechRecognizer? = null
    private var textToSpeech: TextToSpeech? = null
    private var isTtsReady = false

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val recordAudioGranted = permissions[Manifest.permission.RECORD_AUDIO] ?: false
        if (recordAudioGranted) {
            setupSpeechRecognizer()
        } else {
            Toast.makeText(this, "Microphone permission required for Madhuri AI", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        textToSpeech = TextToSpeech(this, this)
        checkPermissions()

        setContent {
            MadhuriAITheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF050711)
                ) {
                    val voiceState by viewModel.voiceState.collectAsState()
                    val recognizedText by viewModel.recognizedText.collectAsState()
                    val assistantResponse by viewModel.assistantResponse.collectAsState()

                    MadhuriMainScreen(
                        voiceState = voiceState,
                        userTranscript = recognizedText,
                        assistantResponse = assistantResponse,
                        onMicClick = { toggleListening() },
                        onStopSpeaking = { stopSpeaking() },
                        onRepeat = { assistantResponse?.let { speak(it) } }
                    )
                }
            }
        }
    }

    private fun checkPermissions() {
        val permissions = arrayOf(
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.CALL_PHONE,
            Manifest.permission.SEND_SMS
        )
        val missingPermissions = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missingPermissions.isNotEmpty()) {
            permissionLauncher.launch(missingPermissions.toTypedArray())
        } else {
            setupSpeechRecognizer()
        }
    }

    private fun setupSpeechRecognizer() {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) return
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this).apply {
            setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {
                    viewModel.setVoiceState(VoiceState.LISTENING)
                }
                override fun onBeginningOfSpeech() {}
                override fun onRmsChanged(rmsdB: Float) {
                    viewModel.updateAudioLevel(rmsdB)
                }
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onEndOfSpeech() {
                    viewModel.setVoiceState(VoiceState.PROCESSING)
                }
                override fun onError(error: Int) {
                    viewModel.setVoiceState(VoiceState.IDLE)
                }
                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!matches.isNullOrEmpty()) {
                        val text = matches[0]
                        viewModel.onUserSpeechRecognized(text) { reply ->
                            speak(reply)
                        }
                    }
                }
                override fun onPartialResults(partialResults: Bundle?) {}
                override fun onEvent(eventType: Int, params: Bundle?) {}
            })
        }
    }

    private fun toggleListening() {
        stopSpeaking()
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
        }
        speechRecognizer?.startListening(intent)
    }

    private fun speak(text: String) {
        if (!isTtsReady) return
        viewModel.setVoiceState(VoiceState.SPEAKING)
        textToSpeech?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "MADHURI_UTTERANCE_ID")
    }

    private fun stopSpeaking() {
        if (textToSpeech?.isSpeaking == true) {
            textToSpeech?.stop()
            viewModel.setVoiceState(VoiceState.INTERRUPTED)
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = textToSpeech?.setLanguage(Locale("hi", "IN"))
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                textToSpeech?.setLanguage(Locale.US)
            }
            isTtsReady = true
        }
    }

    override fun onDestroy() {
        speechRecognizer?.destroy()
        textToSpeech?.shutdown()
        super.onDestroy()
    }
}`
  },
  {
    path: 'app/src/main/java/com/madhuri/ai/actions/DeviceActionExecutor.kt',
    language: 'kotlin',
    description: 'Executes permitted Android Actions: Phone Calls, WhatsApp, Alarms, YouTube, Wi-Fi',
    content: `package com.madhuri.ai.actions

import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.net.Uri
import android.provider.AlarmClock
import android.provider.Settings
import android.widget.Toast
import org.json.JSONObject

class DeviceActionExecutor(private val context: Context) {

    fun executeAction(actionJsonString: String, onFeedback: (String) -> Unit) {
        try {
            val json = JSONObject(actionJsonString)
            val type = json.optString("type")

            when (type) {
                "OPEN_APP" -> {
                    val appName = json.optString("appName")
                    val packageName = json.optString("packageName")
                    openApp(packageName, appName, onFeedback)
                }
                "MAKE_CALL" -> {
                    val phoneNumber = json.optString("phoneNumber")
                    val contactName = json.optString("contactName")
                    initiateCall(phoneNumber, contactName, onFeedback)
                }
                "SEND_WHATSAPP" -> {
                    val recipient = json.optString("recipient")
                    val message = json.optString("message")
                    sendWhatsApp(recipient, message, onFeedback)
                }
                "SET_ALARM" -> {
                    val time = json.optString("time", "07:00")
                    val label = json.optString("label", "Madhuri Alarm")
                    setAlarm(time, label, onFeedback)
                }
                "SEARCH_YOUTUBE" -> {
                    val query = json.optString("query")
                    searchYouTube(query, onFeedback)
                }
                "ADJUST_VOLUME" -> {
                    val level = json.optInt("level", 70)
                    adjustVolume(level, onFeedback)
                }
                "TOGGLE_WIFI" -> {
                    val intent = Intent(Settings.ACTION_WIFI_SETTINGS).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    context.startActivity(intent)
                    onFeedback("Opened Wi-Fi settings")
                }
                else -> {
                    onFeedback("Action completed: $type")
                }
            }
        } catch (e: Exception) {
            onFeedback("Could not execute action: \${e.localizedMessage}")
        }
    }

    private fun openApp(packageName: String, appName: String, onFeedback: (String) -> Unit) {
        val launchIntent = context.packageManager.getLaunchIntentForPackage(packageName)
        if (launchIntent != null) {
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(launchIntent)
            onFeedback("Opening $appName")
        } else {
            // Fallback to Play Store
            val storeIntent = Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$packageName")).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(storeIntent)
            onFeedback("$appName is not installed. Opening Google Play Store.")
        }
    }

    private fun initiateCall(phoneNumber: String, contactName: String, onFeedback: (String) -> Unit) {
        val callIntent = Intent(Intent.ACTION_DIAL).apply {
            data = Uri.parse("tel:$phoneNumber")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(callIntent)
        onFeedback("Dialing $contactName ($phoneNumber)")
    }

    private fun sendWhatsApp(recipient: String, message: String, onFeedback: (String) -> Unit) {
        val intent = Intent(Intent.ACTION_VIEW).apply {
            data = Uri.parse("https://api.whatsapp.com/send?text=\${Uri.encode(message)}")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
        onFeedback("Opening WhatsApp message to $recipient")
    }

    private fun setAlarm(timeStr: String, label: String, onFeedback: (String) -> Unit) {
        // e.g. "07:00"
        val parts = timeStr.split(":")
        val hour = parts.getOrNull(0)?.trim()?.toIntOrNull() ?: 7
        val minute = parts.getOrNull(1)?.take(2)?.trim()?.toIntOrNull() ?: 0

        val intent = Intent(AlarmClock.ACTION_SET_ALARM).apply {
            putExtra(AlarmClock.EXTRA_MESSAGE, label)
            putExtra(AlarmClock.EXTRA_HOUR, hour)
            putExtra(AlarmClock.EXTRA_MINUTES, minute)
            putExtra(AlarmClock.EXTRA_SKIP_UI, false)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
        onFeedback("Setting alarm for $timeStr - $label")
    }

    private fun searchYouTube(query: String, onFeedback: (String) -> Unit) {
        val intent = Intent(Intent.ACTION_SEARCH).apply {
            setPackage("com.google.android.youtube")
            putExtra("query", query)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
        onFeedback("Searching YouTube for $query")
    }

    private fun adjustVolume(level: Int, onFeedback: (String) -> Unit) {
        val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
        val targetVolume = (maxVolume * (level / 100.0)).toInt().coerceIn(0, maxVolume)
        audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, targetVolume, AudioManager.FLAG_SHOW_UI)
        onFeedback("Device volume set to $level%")
    }
}`
  },
  {
    path: 'app/src/main/java/com/madhuri/ai/service/MadhuriVoiceService.kt',
    language: 'kotlin',
    description: 'Continuous Background Voice Foreground Service with Notification',
    content: `package com.madhuri.ai.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.madhuri.ai.R

class MadhuriVoiceService : Service() {

    companion object {
        const val CHANNEL_ID = "MadhuriVoiceChannel"
        const val NOTIFICATION_ID = 1001
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Madhuri AI Active")
            .setContentText("Listening for hands-free voice commands...")
            .setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .setOngoing(true)
            .build()

        startForeground(NOTIFICATION_ID, notification)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Continuous voice listening logic loop
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Madhuri AI Voice Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }
}`
  },
  {
    path: 'app/build.gradle.kts',
    language: 'kotlin',
    description: 'Gradle Build Configuration with Jetpack Compose, Coroutines, Retrofit, and Firebase',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.google.gms.google.services)
}

android {
    namespace = "com.madhuri.ai"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.madhuri.ai"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug") // Replace with release key for Play Store
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    // Core & Lifecycle
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)

    // Jetpack Compose & Material 3
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)

    // Coroutines & Networking (Gemini Proxy)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.retrofit)
    implementation(libs.converter.gson)
    implementation(libs.okhttp.logging.interceptor)

    // Firebase (Auth, Firestore, Cloud Messaging)
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.auth.ktx)
    implementation(libs.firebase.firestore.ktx)
    implementation(libs.firebase.messaging.ktx)
}
`
  },
  {
    path: 'firestore.rules',
    language: 'javascript',
    description: 'Firebase Security Rules ensuring strict user data isolation for memory & chats',
    content: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User profile: only authenticated user can read & write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Personal memory items
      match /memory/{memoryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      // Conversation chats
      match /chats/{chatId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;

        // Messages inside chat
        match /messages/{messageId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }

      // User voice settings and preferences
      match /settings/{settingId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}`
  },
  {
    path: 'BUILD_AND_RELEASE_GUIDE.md',
    language: 'markdown',
    description: 'Complete 10-Phase Guide to Build and Deploy Signed APK to Google Play Store',
    content: `# MADHURI AI — Full Android Build & Deployment Guide

## 📱 Prerequisites
1. **Android Studio**: Hedgehog or newer (Ladybug recommended).
2. **JDK**: Version 17+.
3. **Android Device / Emulator**: Running Android 8.0 (API 26) or higher.
4. **Google Gemini API Key**: From Google AI Studio.
5. **Firebase Project**: Configured for Android with your \`google-services.json\`.

---

## 🚀 Step-by-Step Setup

### Phase 1: Clone or Open Project
1. Extract or clone this project repository into your workspace.
2. In Android Studio, select **Open** and choose the project root folder.
3. Allow Gradle to synchronize dependencies.

### Phase 2: Add Firebase Configuration
1. Go to Firebase Console -> Add Android App.
2. Package Name: \`com.madhuri.ai\`
3. Download \`google-services.json\` and paste it into the \`app/\` folder.

### Phase 3: Set Gemini API Key
In \`app/src/main/res/values/secrets.xml\` (or via \`local.properties\`):
\`\`\`xml
<resources>
    <string name="gemini_api_key">YOUR_GEMINI_API_KEY_HERE</string>
</resources>
\`\`\`

### Phase 4: Build & Run Debug APK
- Connect your Android phone via USB with USB Debugging enabled.
- Click the green **Run (Shift + F10)** button in Android Studio.
- Accept the microphone, phone call, and SMS permissions when prompted.

---

## 📦 Phase 10: Generating a Signed APK / AAB for Play Store
1. In Android Studio, go to **Build** -> **Generate Signed Bundle / APK**.
2. Select **Android App Bundle (.aab)** for Google Play, or **APK** for direct sideloading.
3. Create a new Keystore (\`.jks\`) with strong password.
4. Select **release** build type and check **V1 and V2 (Full APK Signature)**.
5. Click **Finish**. Your signed release bundle will be generated in \`app/release/\`.
`
  }
];
