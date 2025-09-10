package app.lovable.photogarden.guardian;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.net.Uri;
import android.util.Log;
import androidx.core.content.FileProvider;
import java.io.File;
import java.util.ArrayList;

public class ShareActivity extends Activity {
    private static final String TAG = "ShareActivity";
    private static final String FILE_PROVIDER_AUTHORITY = "app.lovable.photogarden.guardian.fileprovider";
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Intent intent = getIntent();
        String action = intent.getAction();
        String type = intent.getType();
        
        Log.d(TAG, "ShareActivity started with action: " + action + ", type: " + type);
        
        if (Intent.ACTION_SEND.equals(action) && type != null) {
            if (type.startsWith("image/")) {
                handleSendImage(intent);
            }
        } else if (Intent.ACTION_SEND_MULTIPLE.equals(action) && type != null) {
            if (type.startsWith("image/")) {
                handleSendMultipleImages(intent);
            }
        }
        
        finish();
    }
    
    private void handleSendImage(Intent intent) {
        Uri imageUri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
        if (imageUri != null) {
            Log.d(TAG, "Handling single image share: " + imageUri.toString());
            // Handle single image sharing
            // This method can be extended to process the shared image
        }
    }
    
    private void handleSendMultipleImages(Intent intent) {
        ArrayList<Uri> imageUris = intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM);
        if (imageUris != null) {
            Log.d(TAG, "Handling multiple image share, count: " + imageUris.size());
            // Handle multiple images sharing
            // This method can be extended to process the shared images
        }
    }
    
    /**
     * Generates a content URI for a file using the configured FileProvider
     * This is essential for sharing files on Android 7+ due to security restrictions
     */
    public static Uri getContentUriForFile(Activity activity, File file) {
        try {
            Uri contentUri = FileProvider.getUriForFile(
                activity, 
                FILE_PROVIDER_AUTHORITY, 
                file
            );
            Log.d(TAG, "Generated content URI: " + contentUri.toString() + " for file: " + file.getAbsolutePath());
            return contentUri;
        } catch (IllegalArgumentException e) {
            Log.e(TAG, "Failed to generate content URI for file: " + file.getAbsolutePath(), e);
            return null;
        }
    }
    
    /**
     * Grants URI permissions for sharing
     */
    public static void grantUriPermissions(Activity activity, Intent shareIntent, Uri contentUri) {
        shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        shareIntent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        Log.d(TAG, "Granted URI permissions for: " + contentUri.toString());
    }
}