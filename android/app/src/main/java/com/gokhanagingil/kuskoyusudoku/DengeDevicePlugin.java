package com.gokhanagingil.kuskoyusudoku;

import android.app.Activity;
import android.content.Intent;
import android.view.WindowManager;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "DengeDevice")
public class DengeDevicePlugin extends Plugin {
    private HomeBanner banner;
    private boolean exporting;

    @Override public void load() {
        getActivity().runOnUiThread(() -> banner = new HomeBanner(getActivity(), () -> getBridge().triggerWindowJSEvent("denge-privacy")));
    }
    @PluginMethod public void setContext(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            if (Boolean.TRUE.equals(call.getBoolean("keepAwake", false))) getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            else getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            if (banner != null) banner.setWanted(Boolean.TRUE.equals(call.getBoolean("home", false)));
            JSObject status = new JSObject();
            status.put("available", true);
            status.put("privacyRequired", banner != null && banner.privacyRequired());
            call.resolve(status);
        });
    }
    @PluginMethod public void privacyOptions(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            if (banner == null) { call.resolve(); return; }
            banner.showPrivacy(error -> { JSObject status = new JSObject(); status.put("error", error); call.resolve(status); });
        });
    }
    @PluginMethod public void background(PluginCall call) {
        getActivity().runOnUiThread(() -> { getActivity().moveTaskToBack(true); call.resolve(); });
    }
    @PluginMethod public void exportBackup(PluginCall call) {
        String text = call.getString("text", "");
        if (text.getBytes(StandardCharsets.UTF_8).length > 2097152 || !text.contains("kus-koyu-denge-backup")) { call.reject("Invalid backup"); return; }
        getActivity().runOnUiThread(() -> {
            if (exporting) { call.reject("Export already open"); return; }
            exporting = true;
            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType("application/json");
            intent.putExtra(Intent.EXTRA_TITLE, "Kus-Koyu-Denge-yedek.json");
            try { startActivityForResult(call, intent, "saveDocument"); }
            catch (Exception error) { exporting = false; call.reject("Document picker unavailable"); }
        });
    }
    @ActivityCallback private void saveDocument(PluginCall call, ActivityResult result) {
        exporting = false;
        if (call == null) return;
        JSObject status = new JSObject();
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            status.put("saved", false); call.resolve(status); return;
        }
        try (OutputStream out = getContext().getContentResolver().openOutputStream(result.getData().getData(), "wt")) {
            if (out == null) throw new java.io.IOException("No output stream");
            out.write(call.getString("text", "").getBytes(StandardCharsets.UTF_8));
            status.put("saved", true); call.resolve(status);
        } catch (Exception error) { call.reject("Could not save backup"); }
    }
    @Override protected void handleOnPause() {
        getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (banner != null) banner.setForeground(false);
    }
    @Override protected void handleOnResume() { if (banner != null) banner.setForeground(true); }
    @Override protected void handleOnDestroy() { if (banner != null) banner.destroy(); }
    @Override public void handleOnConfigurationChanged(android.content.res.Configuration config) {
        if (banner != null) banner.resize();
    }
}
