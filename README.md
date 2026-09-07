# Kuş Köyü Sudoku

Kuş Köyü Sudoku, Belgin uygulamasındaki sevilen Kuş Köyü duygusunu koruyan; yalnızca Sudoku deneyimine odaklanan, çevrimdışı ve 60+ yaş erişilebilirliği öncelikli bir mobil oyundur.

## Ürün vaadi

- Tek oyun, net amaç: satır, sütun ve bölge Sudoku'su.
- Beş puanla açılan kademe: Acemi, Çırak, Deneyimli, Usta ve Pro.
- Kuşlar, Geometrik Şekiller ve Klasik Sayılar arasında bulmacayı sıfırlamadan tema değişimi.
- Not alma, geri alma, temizleme, açıklayıcı ipucu ve isteğe bağlı nazik hata kontrolü.
- Süre baskısı, can/enerji, seri cezası ve pay-to-win yok.
- Otomatik yerel kayıt; hesap gerektirmeden çevrimdışı oynama.
- İlk iki Acemi bulmacasında oynayarak öğrenme.

## Şu an çalışan dikey dilim

- Benzersiz çözümlü 4×4, 6×6 ve 9×9 bulmaca üretimi
- Beş seviyeli puan ve kilit açma sistemi
- Belgin'den taşınan tanıdık dokuz kuş ve yaşayan köy görsel dili
- Hücre-önce ve simge-önce olmak üzere iki doğal giriş biçimi
- Akıllı not temizleme ve sınırsız geri alma
- Tema, büyük yazı, yüksek kontrast, hareket azaltma, süre, ses, titreşim ve ekranı açık tutma ayarları
- PWA/çevrimdışı temel ve Capacitor Android yapılandırması
- Birim testleri ve üretim derlemesi

## Yerel geliştirme

Gereksinim: Node.js 22 veya üzeri.

```bash
npm install
npm run dev
```

Doğrulama:

```bash
npm test
npm run build
```

Android debug APK:

```bash
npm run android:debug
```

## Mimari

```text
src/domain       Sudoku, zorluk, tema ve puan kuralları
src/state        Sürümlü yerel kayıt ve oyun durum makinesi
src/components   Tahta, simge, araç çubuğu ve ortak arayüzler
src/screens      Ana ekran, oyun, ayarlar ve sonuç akışları
src/hooks        Cihaz davranışları
```

Tema katmanı yalnızca `GameToken` sunumunu değiştirir. Sudoku sayıları, çözüm, notlar ve ilerleme kaydı temadan bağımsızdır.

## Kalite kapısı

Store yayını için yalnızca derlenmesi yeterli kabul edilmez. Fiziksel Android cihazlarda 60+ kullanıcı testi, tekniklere göre zorluk kalibrasyonu, geniş içerik paketi, TalkBack kontrolü, imzalı AAB, gizlilik metni ve Store görselleri tamamlanmadan sürüm “yayına hazır” sayılmaz.

Detaylı plan: [docs/STORE_READINESS.md](docs/STORE_READINESS.md)
