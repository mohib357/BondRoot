# BondRoot ProGuard / R8 Rules for Production Build (.aab)

# Preserve Capacitor Bridge & App Package Classes
-keep class com.getcapacitor.** { *; }
-keep class com.bondroot.app.** { *; }

# Preserve JavascriptInterface Methods
-keepclasseswithmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Preserve WebChromeClient File Chooser Callbacks
-keepclassmembers class * extends android.webkit.WebChromeClient {
    public void openFileChooser(...);
    public boolean onShowFileChooser(...);
}

# Preserve WebKit & Native Android Classes
-keep class android.webkit.** { *; }

# Debugging Stack Trace Preservation
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
