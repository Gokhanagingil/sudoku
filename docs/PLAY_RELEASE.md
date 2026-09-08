# Kuş Köyü: Denge — 1.1.0 yayın hazırlığı

Durum: teknik yayın adayı. Google Play’e henüz yüklenmedi. İmzalanmamış doğrulama AAB’si ve debug APK yayın paketi değildir.

## Ürün kararı

Oyuncu hesabı veya giriş ekranı yoktur. Kur, aç, oyna. İlerleme cihazda tutulur; isteğe bağlı JSON yedekleme ve geri yükleme vardır. Otomatik cihazlar arası eşitleme yoktur. Eski Belgin uygulaması ve onun kayıtları değiştirilmez.

Bu sürüm sevilen kuralları, puanları, bulmaca üretimini ve kuş görünümünü değiştirmez. Şekiller aynı kimliklerle SVG olarak daha büyük gösterilir; aday notları büyütülür. Arka plan/ana ekran/menüler süreye eklenmez. Depolama hatası kullanıcıdan saklanmaz. Ayarlar klavye odağını korur; Android geri düğmesi ve ekranı açık tutma gerçek native köprüden yönetilir.

Reklam yalnızca ilk bahçe tamamlandıktan sonra köy ana ekranındadır. Tahta, öğretici, sonuç, ayarlar ve gizlilik sayfasında yoktur. Banner küçük, açılmayan adaptif biçimdedir; düğmelerin üzerine bindirilmez. Tam ekran, geçiş, ödüllü video ve uygulama açılış reklamı eklenmemiştir. NPA istekleri ve UMP izin kontrolü kullanılır. İzin/reklam hatası oyunu engellemez.

## Sahibin bir kez yapılandıracağı bilgiler

GitHub Settings → Environments → `google-play`. Bu ortam için gerekli inceleyici/onay ve yalnızca main dağıtım kuralı koyun.

Ortam değişkenleri (Variables):
- `ADMOB_APP_ID`: Bu uygulama için gerçek `ca-app-pub-…~…` kimliği.
- `ADMOB_BANNER_ID`: Bu uygulama için gerçek `ca-app-pub-…/…` banner kimliği.
- `PRIVACY_POLICY_URL`: Herkesin giriş yapmadan açabildiği, HTTPS üzerinden yayınlanmış HTML gizlilik metni.
- `SUPPORT_EMAIL`: Mağazada ve gizlilik metninde yayınlanmasını onayladığınız destek e-postası.

Ortam sırları (Secrets):
- `ANDROID_KEYSTORE_BASE64`: Kalıcı yükleme anahtarını içeren JKS’nin base64 içeriği.
- `ANDROID_STORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

Anahtarı, parolaları ve base64 içeriğini sohbete veya repoya koymayın. Şifreli ve erişimi sınırlı en az iki yedek saklayın. Daha önce bu paket için Play anahtarı oluşturulduysa onu kullanın; rastgele yeni anahtar oluşturmayın. Yeni uygulama için yerel makinede etkileşimli komut örneği:

```sh
keytool -genkeypair -v -keystore denge-upload.jks -alias denge-upload -keyalg RSA -keysize 3072 -validity 10000
```

Google Play App Signing’de uygulama imza anahtarı ile yükleme anahtarı farklı rollerdedir. Buradaki iş akışı yalnızca sahibin yükleme anahtarıyla AAB üretir. Play Console’a otomatik yükleme/yayın yoktur.

## Gizlilik ve reklam kurulumu

1. `public/privacy.html` metnini onaylayın. `SUPPORT_EMAIL` ile `npm run build` çalıştırınca `dist/privacy.html` iletişim alanı doldurulur. Dosyayı ve `public/privacy.js` dosyasını herkese açık HTTPS sitenize koyun. Play Console’a aynı URL’yi girin. Taslak iletişim uyarısıyla yayın yapmayın.
2. AdMob’da bu uygulamayı, standart banner reklam birimini ve Privacy & messaging mesajlarını oluşturun. Büyüyen/collapsible banner kullanmayın. Yenilemeyi agresifleştirmeyin; hassas kategorileri ve uygunsuz reklamları AdMob kontrollerinden gözden geçirin. Kod G içerik derecesi talep eder; bu tek başına reklam içeriği garantisi değildir.
3. AdMob’ın size verdiği `app-ads.txt` satırını geliştirici web sitenizin köküne koyun. Sahipliği ve uygulama hazır olma incelemesini tamamlayın. Gerçek yayıncı kimliği olmadan uydurma satır yayınlamayın.
4. `docs/DATA_SAFETY.md` beyanlarını gerçek SDK/izinler/hesap ayarları ve son cihaz ölçümüyle doğrulayın. Hesap olmaması “hiç veri toplanmıyor” anlamına gelmez.

## Doğrulama ve üretim paketi

PR ve main için `Play Readiness`: gerçek HTTP tarayıcı testleri, çevrimdışı yeniden açma, ekran ölçüleri, Android debug derlemesi, release derleme doğrulaması ve Android lint. Üretilen `UNSIGNED_TEST_ONLY.aab`, Google test reklam kimlikleri taşır: PLAY’E YÜKLEMEYİN.

Gerçek yayın için tüm kalite kapıları ve aşağıdaki cihaz kontrolleri geçtikten sonra Actions → `Signed Play Bundle (manual)` → Run workflow → `main` ve kabul edilen tam commit SHA. İş akışı eksik anahtarda, test AdMob kimliklerinde, erişilemeyen/taslak gizlilik URL’sinde durur. Çıktı `Kus_Koyu_Denge_1.1.0_Play.aab`, commit ve SHA-256 dosyalarıdır. Başarılı imzalı çıktı olmadan teknik adayı yüklenebilir yayın olarak nitelendirmeyin.

Paket: `com.gokhanagingil.kuskoyusudoku`; versionCode **2**, versionName **1.1.0**; minSdk24; target/compileSdk36. Kod 2 daha önce Play’de kullanıldıysa sonraki yüklemeden önce artırın. Npm paketi geçmiş geliştirme sürüm numarasını taşır; Android’in yayımlanan sürümü Gradle’dan gelir.

## Play Console sırası

Geliştirici hesabınızı ve kimlik/cihaz doğrulamasını tamamlayın. Uygulama oluşturun; Oyun → Bulmaca, Türkçe, yetişkin hedef kitle. Oyun 60+ için tasarlanmıştır; çocuklara yönelik uygulama olarak işaretlemeyin. İçerik derecelendirme anketini gerçek içerikle yanıtlayın; resmi IARC sonucunu önceden varsaymayın.

Ana mağaza girişi için `STORE_LISTING_TR.md`, gerçek ekran görüntüleri, 512×512 ikon ve 1024×500 özellik görseli kullanın. Reklam içerir beyanı: Evet. Uygulama erişimi: giriş gerekmez. Data safety/gizlilik/Advertising ID beyanlarını son paketle tutarlı doldurun. Sonra imzalı AAB’yi önce dahili teste, gerekiyorsa kapalı teste yükleyin. Ön lansman raporu ve cihaz kontrollerini inceleyin. Yayın onayı Google’a aittir.

13 Kasım 2023 sonrasında açılmış yeni kişisel geliştirici hesapları için üretime başvurmadan önce en az 12 test kullanıcısının en az son 14 gün boyunca kesintisiz katıldığı kapalı test şartı vardır. Hesabın türü/tarihi burada doğrulanmadı. Elden APK denemesi bu Play Console koşulunun tamamlandığı anlamına gelmez.

## Hâlâ gerçek cihazda doğrulanacaklar

- Samsung/Xiaomi/Pixel en az küçük ve büyük ekranda şekiller ve notların okunması; TalkBack ile hücre/aday adı, Not açık/kapalı ve diyalog odağı.
- Yedek oluşturma, iptal, bozuk dosya reddi, iki Android cihaz arasında geri yükleme; telefon araması/uyku/uygulamaya dönüşte süre ve kayıt.
- AdMob yapılandırıldıktan sonra TEST cihazında EEA izin kabul/ret/değiştirme, çevrimdışı/no-fill ve yavaş reklam yanıtı sırasında oyuna geçiş. Oyuna geçildiğinde hiçbir geç reklam/form kalmamalı. Gerçek reklama deneme amacıyla tıklamayın.
- API36 kenardan kenara alanlar, sistem geri hareketi, font büyütme; yeni imzalı yüklemenin Play ön lansman raporu ve 16 KB uyumluluğu.

Önceki debug APK farklı anahtarla imzalanmış olabilir. İmza uyuşmazlığında cihaz eski APK üstüne yenisini kurmaz. Eski oyunu/yüklemeyi **yedek almadan silmeyin**. Önceki 0.1.0’da yedek düğmesi olmadığı için o kurulumdan ilk geçiş ayrıca planlanmalıdır. Android kullanıcı verilerini koruyan debug güncelleme için aynı orijinal debug anahtarı gerekir; bunun varlığı varsayılmamalıdır.

## Resmi kaynaklar (8 Eylül 2026 kontrolü)

- https://support.google.com/googleplay/android-developer/answer/11926878
- https://support.google.com/googleplay/android-developer/answer/14151465
- https://support.google.com/googleplay/android-developer/answer/9842756
- https://developers.google.com/admob/android/privacy
- https://developers.google.com/admob/android/privacy/play-data-disclosure
- https://support.google.com/admob/answer/14538460
- https://support.google.com/googleplay/android-developer/answer/9866151
