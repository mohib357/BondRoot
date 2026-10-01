package com.bondroot.app;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.content.FileProvider;
import com.getcapacitor.BridgeActivity;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class MainActivity extends BridgeActivity {

    private ValueCallback<Uri[]> mFilePathCallback;
    private String mCameraPhotoPath;
    private long lastBackPressedTime = 0;

    private final ActivityResultLauncher<Intent> fileChooserLauncher =
        registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
            if (mFilePathCallback == null) {
                return;
            }
            Uri[] results = null;
            if (result.getResultCode() == RESULT_OK) {
                Intent data = result.getData();
                if (data == null || data.getData() == null) {
                    if (mCameraPhotoPath != null) {
                        results = new Uri[]{Uri.parse(mCameraPhotoPath)};
                    }
                } else {
                    String dataString = data.getDataString();
                    if (dataString != null) {
                        results = new Uri[]{Uri.parse(dataString)};
                    }
                }
            }
            mFilePathCallback.onReceiveValue(results);
            mFilePathCallback = null;
        });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 1. Hardware Back Button Handling via AndroidX OnBackPressedDispatcher
        setupBackNavigation();

        WebView webView = getBridge().getWebView();
        if (webView != null) {
            // 2. Over-Scroll & Bounce Removal
            webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

            // 3. WebSettings & Persistence Configurations
            configureWebSettings(webView);

            // 4. Custom WebChromeClient for File Choosing & Camera Upload
            setupWebChromeClient(webView);
        }
    }

    private void setupBackNavigation() {
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView webView = getBridge().getWebView();
                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                } else {
                    if (System.currentTimeMillis() - lastBackPressedTime < 2000) {
                        finish();
                    } else {
                        lastBackPressedTime = System.currentTimeMillis();
                        Toast.makeText(MainActivity.this, "পুনরায় ব্যাক বোতাম চাপলে অ্যাপ থেকে বের হয়ে যাবেন", Toast.LENGTH_SHORT).show();
                    }
                }
            }
        });
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configureWebSettings(WebView webView) {
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Cookie Persistence
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);
        cookieManager.flush();
    }

    private void setupWebChromeClient(WebView webView) {
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (mFilePathCallback != null) {
                    mFilePathCallback.onReceiveValue(null);
                }
                mFilePathCallback = filePathCallback;

                Intent captureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                if (captureIntent.resolveActivity(getPackageManager()) != null) {
                    File photoFile = null;
                    try {
                        photoFile = createImageFile();
                        captureIntent.putExtra("PhotoPath", mCameraPhotoPath);
                    } catch (IOException ignored) {
                    }

                    if (photoFile != null) {
                        mCameraPhotoPath = "file:" + photoFile.getAbsolutePath();
                        Uri photoURI = FileProvider.getUriForFile(
                            MainActivity.this,
                            getApplicationContext().getPackageName() + ".fileprovider",
                            photoFile
                        );
                        captureIntent.putExtra(MediaStore.EXTRA_OUTPUT, photoURI);
                    } else {
                        captureIntent = null;
                    }
                }

                Intent contentSelectionIntent = new Intent(Intent.ACTION_GET_CONTENT);
                contentSelectionIntent.addCategory(Intent.CATEGORY_OPENABLE);
                contentSelectionIntent.setType("image/*");

                Intent[] intentArray = captureIntent != null ? new Intent[]{captureIntent} : new Intent[0];

                Intent chooserIntent = new Intent(Intent.ACTION_CHOOSER);
                chooserIntent.putExtra(Intent.EXTRA_INTENT, contentSelectionIntent);
                chooserIntent.putExtra(Intent.EXTRA_TITLE, "ছবি নির্বাচন করুন (Select Image)");
                chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, intentArray);

                try {
                    fileChooserLauncher.launch(chooserIntent);
                } catch (ActivityNotFoundException e) {
                    mFilePathCallback = null;
                    return false;
                }

                return true;
            }
        });
    }

    private File createImageFile() throws IOException {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
        String imageFileName = "JPEG_" + timeStamp + "_";
        File storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        return File.createTempFile(imageFileName, ".jpg", storageDir);
    }
}
