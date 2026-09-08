# Kuş Köyü: Denge

60+ oyuncular için sakin, açıklayıcı ve uzun soluklu mantık oyunu. Belgin uygulamasından bağımsızdır. Oyuncu hesabı ve giriş ekranı yoktur.

## 1.1.0 yayın adayı

Sevilen kurallar, puanlar, kuşlar ve bulmaca kimlikleri korunur. Geometrik taşlar ve aday notları daha büyük vektör çizimlerdir. Yerel kayıt doğrulaması, JSON yedekleme/geri yükleme, ara verince duran süre, Android geri düğmesi ve ekranı açık tutma iyileştirilmiştir.

Reklam yalnızca ilk bahçe tamamlandıktan sonra köy ana ekranında küçük bir native banner olarak yer alır. Oyun tahtası, öğretici, sonuç, ayarlar ve gizlilik sayfasında reklam yoktur. NPA ve UMP izin kontrolü kullanılır; reklam hataları oyunu engellemez. Debug ve doğrulama paketleri Google test kimlikleri kullanır.

**Yayın durumu:** İmzasız doğrulama AAB’si Play’e yüklenemez. Kalıcı yükleme anahtarı, gerçek AdMob kimlikleri, onaylı destek adresi ve yayınlanmış gizlilik URL’si olmadan imzalı yayın iş akışı durur. Play Console’a otomatik gönderim/yayın yapılmaz. Cihaz/TalkBack ve gerçek yapılandırmalı izin/reklam kabulü ayrıca gerekir.

## Oyun

Acemi, Çırak, Deneyimli, Usta, Pro; 4×4, 6×6 ve 9×9 bahçeler. Temel tekrarsız yerleştirme yanında komşuluk, sıra ve toplam ilişkileri vardır. Kuşlar, Şekiller ve Klasik temaları aynı değerleri gösterir. İlk iki bölümde oynayarak öğretim, aday notları, geri alma, açıklayıcı ipuçları ve dekoratif köy ilerlemesi vardır. Süre/ceza/can baskısı yoktur.

## Geliştirme

Node.js22+.

```sh
npm ci
npm run check
npm test
npm run audit:levels
npm run build
npm run dev
```

Gerçek tarayıcı kontrolü: derlemeden sonra `pip install playwright==1.57.0`, `python -m playwright install chromium`, `python scripts/browser-smoke.py`.

Android: `npm run android:debug`. Anahtar gerektirmeyen derleme doğrulaması: `npm run android:sync && cd android && ./gradlew bundleRelease -PvalidationBuild=true`. Bu ikinci komutun çıktısı **UNSIGNED / TEST ONLY** olur; Play’e yüklenmez.

## Yayın belgeleri

- [Yayın hazırlığı ve sahip yapılandırması](docs/PLAY_RELEASE.md)
- [Veri güvenliği çalışma kâğıdı](docs/DATA_SAFETY.md)
- [Türkçe mağaza metinleri](docs/STORE_LISTING_TR.md)

GitHub Actions: Quality Gate, Play Readiness ve yalnızca elle çalıştırılan Signed Play Bundle. Aktif uygulama `src/*.js` modülleridir; eski React prototip dosyaları çalışma paketine alınmaz. Android paket kimliği `com.gokhanagingil.kuskoyusudoku`, versionCode2, versionName1.1.0, targetSdk36’dır.
