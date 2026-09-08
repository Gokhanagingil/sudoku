# Data safety çalışma kâğıdı — Android 1.1.0

Bu dosya sahibin Play Console beyanını hazırlaması içindir; gönderilmiş/onaylanmış beyan değildir. Son paket ve AdMob yapılandırması ile birlikte kontrol edilmelidir.

## Uygulamanın kendi verileri

Hesap/login, Google giriş, e-posta toplama, kullanıcı profili, sağlık verisi, konum izni, kişiler, mikrofon, kamera, Firebase Analytics veya özel telemetri yoktur. Oyun puanı/notları/ayarları cihazda kalır. JSON yedeği kullanıcının seçtiği dosyaya yazılır; bir sunucumuza gönderilmez. Web/PWA reklam SDK’sı yüklemez.

## Android reklam SDK’sı

Google Mobile Ads 25.4.0 + UMP4.0.0 kullanılır. Sadece ana ekran banner; NPA=1, UMP canRequestAds kontrolü. Bunlar veri toplamayı tamamen kapatmaz. Google’ın resmi SDK açıklamasına göre aşağıdakiler toplanabilir/paylaşılabilir:

| Play veri grubu | SDK davranışı | Beyan hazırlığında kontrol |
|---|---|---|
| Yaklaşık konum | IP üzerinden genel konum çıkarımı | Kesin konum GPS izni yok; yaklaşık konumu yok saymayın |
| Uygulama etkinliği / etkileşimler | Açılış, dokunma, reklam/video etkileşimleri | Reklam, ölçüm ve kötüye kullanımı önleme amaçlarını kontrol edin |
| Uygulama bilgileri ve performans | Tanılama, çökme/performance bilgileri | SDK bildirimine uygun alt türleri seçin |
| Cihaz veya diğer kimlikler | Cihaz/uygulama/SDK tanımlayıcıları | AD_ID izninin kaldırılması tüm tanımlayıcıları kapatmaz |

Toplama/paylaşım amaçları ve zorunlu/isteğe bağlı, geçici işleme/saklama yanıtlarını gerçek dağıtıma göre doğrulayın. Kullanıcı ret seçiminde hangi SDK işlemlerinin sürdüğünü test etmeden “tamamen isteğe bağlı” demeyin. SDK aktarımı TLS kullanır. Uygulama geliştiricisi üçüncü taraf SDK davranışının beyanından sorumludur.

Manifestten `com.google.android.gms.permission.AD_ID` ve Android Ad Services AD_ID/ATTRIBUTION/TOPICS izinleri açıkça kaldırılır. Bu özellikle modern Android izin erişimini sınırlar; eski Android’de veya farklı SDK kimliklerinde veri işlenmediğinin kanıtı değildir. Play Advertising ID sorusunu yalnızca kaynak manifestine bakıp otomatik “Hayır” işaretlemeyin; birleştirilmiş manifest ve kullanılan SDK sürümünün davranışını kontrol edin.

## Gizlilik, silme ve erişim

Uygulama içi gizlilik metni ve aynı metnin erişilebilir HTTPS sayfası zorunlu yayın kapısıdır. UMP gerektirdiğinde Ayarlar’da reklam gizlilik tercihleri görünür. Kayıtlar Android uygulama verilerini silme ile kaldırılabilir; kişisel JSON yedekleri ayrıca silinir. Uygulama hesabı olmadığı için hesap silme akışı eklenmemiştir. Bu durum veri güvenliği/gizlilik sorumluluğunu ortadan kaldırmaz.

## Yayın öncesi test kanıtları

AdMob gerçek uygulama kimliği, mesaj yapılandırması ve yayıncı app-ads.txt bu çalışma anında yoktur. Bu yüzden bölgesel UMP ekranının, gerçek reklam servisinin veya reklam SDK veri akışının cihaz üzerinde tamamıyla doğrulandığı iddia edilmez. Test kimlikleriyle derleme başarılı olsa bile bu üç alan yayın kabulünde açık kalır.

Resmi SDK rehberi: https://developers.google.com/admob/android/privacy/play-data-disclosure
UMP: https://developers.google.com/admob/android/privacy
Play: https://support.google.com/googleplay/android-developer/answer/10787469
