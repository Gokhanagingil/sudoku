package com.gokhanagingil.kuskoyusudoku;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.os.SystemClock;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.google.ads.mediation.admob.AdMobAdapter;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.RequestConfiguration;
import com.google.android.ump.ConsentForm;
import com.google.android.ump.ConsentInformation;
import com.google.android.ump.ConsentRequestParameters;
import com.google.android.ump.UserMessagingPlatform;
import java.util.function.Consumer;

/** One non-collapsible, non-personalized HOME banner. No other ad formats exist. */
final class HomeBanner {
    private final Activity activity;
    private final ConsentInformation consent;
    private final Runnable statusChanged;
    private boolean wanted, foreground = true, destroyed, updating, infoReady, formLoading, formShowing, privacyFailed;
    private boolean initializing, initialized;
    private long retryAfter;
    private ConsentForm pendingForm;
    private AdView ad;
    private LinearLayout host;
    private View page;
    private int originalBottom;

    HomeBanner(Activity activity, Runnable statusChanged) {
        this.activity = activity;
        this.statusChanged = statusChanged;
        consent = UserMessagingPlatform.getConsentInformation(activity);
    }
    void setWanted(boolean value) {
        wanted = value;
        if (!eligible()) { removeBanner(); return; }
        reconcile();
    }
    void setForeground(boolean value) {
        foreground = value;
        if (!eligible()) removeBanner(); else reconcile();
    }
    private boolean eligible() { return wanted && foreground && !destroyed && !activity.isFinishing(); }
    boolean privacyRequired() {
        return consent.getPrivacyOptionsRequirementStatus() == ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED;
    }
    private void reconcile() {
        if (!eligible() || privacyFailed || SystemClock.elapsedRealtime() < retryAfter) return;
        if (!infoReady) {
            if (updating) return;
            updating = true;
            // Refresh at each process launch. Never trust a saved custom consent string.
            consent.requestConsentInfoUpdate(activity, new ConsentRequestParameters.Builder().build(), () -> {
                updating = false; infoReady = true; if (!destroyed) { statusChanged.run(); reconcile(); }
            }, error -> { updating = false; retryAfter = SystemClock.elapsedRealtime() + 60000; removeBanner(); });
            return;
        }
        if (formShowing || formLoading) return;
        if (consent.getConsentStatus() == ConsentInformation.ConsentStatus.REQUIRED) {
            if (pendingForm != null) {
                ConsentForm form = pendingForm; pendingForm = null; formShowing = true;
                form.show(activity, error -> {
                    formShowing = false; if (!destroyed) statusChanged.run();
                    if (error != null) { privacyFailed = true; removeBanner(); return; }
                    if (consent.canRequestAds()) initializeAds();
                });
            } else {
                formLoading = true;
                // Separate load and show: a slow consent response must NEVER interrupt a game.
                UserMessagingPlatform.loadConsentForm(activity, form -> {
                    formLoading = false; pendingForm = form;
                    if (eligible()) reconcile();
                }, error -> { formLoading = false; privacyFailed = true; removeBanner(); });
            }
            return;
        }
        if (consent.canRequestAds()) initializeAds();
    }
    private void initializeAds() {
        if (!eligible() || !consent.canRequestAds()) return;
        if (initialized) { loadBanner(); return; }
        if (initializing) return;
        initializing = true;
        MobileAds.setRequestConfiguration(new RequestConfiguration.Builder()
            .setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_G).build());
        new Thread(() -> MobileAds.initialize(activity, status -> activity.runOnUiThread(() -> {
            initializing = false; initialized = true;
            if (eligible() && consent.canRequestAds()) loadBanner();
        })), "denge-ad-init").start();
    }
    private int dp(int n) { return Math.round(n * activity.getResources().getDisplayMetrics().density); }
    private void loadBanner() {
        if (!eligible() || ad != null || !consent.canRequestAds()) return;
        FrameLayout root = activity.findViewById(android.R.id.content);
        if (root == null || root.getChildCount() == 0 || root.getWidth() <= 0) return;
        page = root.getChildAt(0);
        if (!(page.getLayoutParams() instanceof FrameLayout.LayoutParams)) return;
        FrameLayout.LayoutParams pageParams = (FrameLayout.LayoutParams) page.getLayoutParams();
        originalBottom = pageParams.bottomMargin;
        WindowInsetsCompat insets = ViewCompat.getRootWindowInsets(root);
        int bottom = insets == null ? 0 : insets.getInsets(WindowInsetsCompat.Type.systemBars()).bottom;
        int width = Math.min(480, Math.round(root.getWidth() / activity.getResources().getDisplayMetrics().density));
        AdSize size = AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(activity, width);
        host = new LinearLayout(activity); host.setOrientation(LinearLayout.VERTICAL);
        host.setGravity(Gravity.CENTER_HORIZONTAL); host.setBackgroundColor(Color.rgb(246, 240, 223));
        host.setPadding(0, dp(12), 0, bottom);
        TextView label = new TextView(activity); label.setText("Reklam"); label.setTextSize(11);
        label.setTextColor(Color.rgb(75, 87, 77)); label.setGravity(Gravity.CENTER);
        host.addView(label, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(18)));
        final AdView loadingAd = new AdView(activity); ad = loadingAd;
        loadingAd.setAdSize(size); loadingAd.setAdUnitId(BuildConfig.ADMOB_BANNER_ID);
        loadingAd.setVisibility(View.INVISIBLE);
        host.addView(loadingAd, new LinearLayout.LayoutParams(size.getWidthInPixels(activity), size.getHeightInPixels(activity)));
        int reserved = dp(30) + size.getHeightInPixels(activity) + bottom;
        root.addView(host, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, reserved, Gravity.BOTTOM));
        // Sibling native space, not an overlay over controls; reserve BEFORE the ad loads.
        pageParams.bottomMargin = originalBottom + reserved; page.setLayoutParams(pageParams);
        loadingAd.setAdListener(new AdListener() {
            @Override public void onAdLoaded() {
                if (ad != loadingAd || !eligible() || !consent.canRequestAds()) { loadingAd.destroy(); return; }
                loadingAd.setVisibility(View.VISIBLE);
            }
            @Override public void onAdFailedToLoad(LoadAdError error) {
                if (ad == loadingAd) { retryAfter = SystemClock.elapsedRealtime() + 60000; removeBanner(); }
            }
        });
        Bundle extras = new Bundle(); extras.putString("npa", "1");
        loadingAd.loadAd(new AdRequest.Builder().addNetworkExtrasBundle(AdMobAdapter.class, extras).build());
    }
    void showPrivacy(Consumer<Boolean> done) {
        removeBanner();
        if (!privacyRequired()) { done.accept(false); return; }
        formShowing = true;
        UserMessagingPlatform.showPrivacyOptionsForm(activity, error -> {
            formShowing = false; privacyFailed = error != null;
            if (!destroyed) statusChanged.run();
            done.accept(error != null);
            // A changed/withdrawn choice is checked anew; never resume an old ad.
            if (error == null && eligible()) reconcile();
        });
    }
    void resize() { removeBanner(); if (eligible()) reconcile(); }
    private void removeBanner() {
        AdView old = ad; ad = null;
        if (old != null) { old.setAdListener(null); old.pause(); old.destroy(); }
        if (host != null) {
            ViewGroup parent = (ViewGroup) host.getParent(); if (parent != null) parent.removeView(host);
            host = null;
            if (page != null && page.getLayoutParams() instanceof FrameLayout.LayoutParams) {
                FrameLayout.LayoutParams params = (FrameLayout.LayoutParams) page.getLayoutParams();
                params.bottomMargin = originalBottom; page.setLayoutParams(params);
            }
        }
        page = null;
    }
    void destroy() { destroyed = true; pendingForm = null; removeBanner(); }
}
