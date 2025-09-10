package app.lovable.photogarden.guardian;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.net.Uri;
import androidx.core.content.FileProvider;
import java.io.File;

public class ShareActivity extends Activity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Intent intent = getIntent();
        String action = intent.getAction();
        String type = intent.getType();
        
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
            // Handle single image
        }
    }
    
    private void handleSendMultipleImages(Intent intent) {
        // Handle multiple images
    }
    
    public static Uri getContentUriForFile(Activity activity, File file) {
        return FileProvider.getUriForFile(
            activity, 
            "app.lovable.photogarden.guardian.fileprovider", 
            file
        );
    }
}