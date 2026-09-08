# 1.1.0 doğrulama ve güvenli deneme kurulumu

## Eski oyunu koruma

Önceki 0.1.0 debug APK ile ilk 1.1.0 derlemesinin debug sertifikaları karşılaştırıldı ve farklı oldukları görüldü. Bu nedenle yeni debug yapısına `.preview` paket eki ve “Kuş Köyü Denge • Deneme” etiketi eklendi. Böylece deneme APK’sı eski oyunu kaldırmadan ayrı uygulama olarak kurulabilir. Eski oyunun verilerine dokunmaz; eski ilerlemeyi otomatik taşımaz.

Release paket kimliği değişmez: `com.gokhanagingil.kuskoyusudoku`. Preview kimliği `com.gokhanagingil.kuskoyusudoku.preview` olur. Preview’de yeni oluşturulan yedekler gerçek sürümde geri yüklenebilir. Eski 0.1.0 yedek arayüzü içermediği için o kurulumdan ilk geçiş ayrıca ele alınmalıdır. Eski oyunu kaydı korunmadan kaldırmayın.

## Doğrulanan teknik kapsam

PR #2 ilk tam uygulama commitinde (79cb7746256b557859d7747b5d0614ae57dac812):
- 29/29 otomatik test; 300/300 başlangıç bahçesi kontrolü.
- 18 gerçek HTTP/Chromium kontrolü: ilk giriş, 12 ekran/tahta ölçüsü, not/tema koruma, yeniden açma, geri alma, yedek dışa/içe aktarma, gizlilikten dönüş, çevrimdışı yeniden açma.
- Android assembleDebug, bundleRelease -PvalidationBuild=true ve lintDebug başarılı.
- APK içindeki shapes/backup/native/clock modülleri kaynakla birebir karşılaştırıldı.
- Doğrulama AAB’sinin imzasız olduğu jarsigner ile görüldü. Yayın paketi değildir.
- Üretilen APK/AAB içinde uygulamayla paketlenmiş `.so` kütüphanesi yok; bu kontrol cihaz/pre-launch doğrulamasının yerine geçmez.

Bu dosyadan sonraki commitler için son CI sonucunu esas alın. PR/mian Readiness artifactları gerçek commit, paket hashleri, ekran görüntüleri ve rapor içerir. Doğrulama AAB’si gerçek reklam kimliği veya sahibin imzası taşımaz. Gerçek cihazda yayıncı yapılandırmalı UMP/banner, Android dosya seçici, TalkBack ve Play ön lansman kabulü ayrıca beklenir.

## Bağımlılık taraması

8 Eylül 2026 tam npm taramasında aynı kök duyurudan kaynaklanan üç moderate düğüm görüldü: geliştirme aracı `@capacitor/cli → xcode → uuid`, GHSA-w5hq-g745-h8pq (uuid v3/v5/v6 buffer denetimi). Bunlar iOS proje aracının geliştirme bağımlılıklarıdır; statik Android web paketine npm/node_modules ağacı eklenmez. Üretim npm bağımlılıkları için ayrı `npm audit --omit=dev --audit-level=moderate` kapısı geçti. Bu, tüm geliştirme ağacı için “sıfır güvenlik bulgusu” anlamına gelmez.

Tam audit JSON her CI’da artifact olarak saklanır. CLI’nin düzeltilmiş sürümü ve özellikle iOS etkinleştirilmeden önce bu araç zinciri yeniden değerlendirilmelidir; kontrolsüz `npm audit fix --force` uygulanmadı. Runtime ve native SDK kontrolleri ile araç zinciri raporu birbirinin yerine geçirilmez.

## Yayıncıdan gerekenler

`PLAY_RELEASE.md` içindeki gerçek AdMob App/Banner ID, UMP mesaj yapılandırması, app-ads.txt, herkese açık gizlilik URL’si ve onaylı destek e-postası; kalıcı yükleme anahtarı ve GitHub environment secretları; Play Console hesap/anket/test işlemleri. Bu bilgiler paylaşılmış veya oluşturulmuş varsayılmaz. Hiçbir Play yayını yapılmadı.
