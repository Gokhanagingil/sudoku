package com.gokhanagingil.kuskoyusudoku;

import android.os.Bundle;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle savedInstanceState) {
        registerPlugin(DengeDevicePlugin.class);
        super.onCreate(savedInstanceState);
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override public void handleOnBackPressed() {
                if (getBridge() != null) getBridge().triggerWindowJSEvent("denge-back");
                else moveTaskToBack(true);
            }
        });
    }
}
