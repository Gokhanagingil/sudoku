# Kuş Köyü: Denge

> `sudoku` depo adı tarihsel bir çalışma adıdır. Oyuncuya sunulan ürün **Kuş Köyü: Denge**'dir.

Kuş Köyü: Denge, Belgin'de sevilen sıcak Kuş Köyü hissini koruyan; yatay/dikey yol ve bahçe benzersizliğini komşuluk, sıralama ve toplam ilişkileriyle genişleten bağımsız bir mobil mantık oyunudur. Birincil hedef 60+ yaş grubudur.

## Oyun

Her bahçede N farklı taş vardır. Her taş her yatay yolda, her dikey yolda ve her bahçe bölgesinde yalnızca bir kez yer alır. İleri kademelerde ek ilişki işaretleri devreye girer:

- **Komşuluk noktası:** bağlı iki taş ardışıktır.
- **Sıra oku:** değer ok yönünde artar.
- **Toplam bağı:** bağlı iki yuvanın toplamı etiketteki sayıdır.

Tema, yalnızca taşların görünümünü değiştirir. Kuşlar, geometrik şekiller ve klasik sayılar aynı bulmacayı, notları ve ilerlemeyi paylaşır.

## Beşli ustalık yolu

| Kademe | Tahta | Açılma | Ödül | Mantık katmanı |
|---|---:|---:|---:|---|
| Acemi | 4×4 | 0 | 50 | Temel yatay/dikey/bahçe |
| Çırak | 6×6 | 250 | 80 | Ardışık komşuluk |
| Deneyimli | 6×6 | 800 | 120 | Komşuluk + sıralama |
| Usta | 9×9 | 1.800 | 170 | Büyük tahta + birleşik ilişkiler |
| Pro | 9×9 | 3.600 | 240 | Komşuluk + sıralama + toplam |

## Tamamlanan ürün kapsamı

- Deterministik 4×4, 6×6 ve 9×9 bulmaca üretimi
- Her bulmacada tek çözüm kontrolü
- İnsan tarafından açıklanabilir tek aday, gizli tek ve ilişki-tek çıkarımları
- İlk **300 bahçe** için otomatik kalite denetimi: 60 bahçe × 5 kademe
- Acemi → Pro arasında ölçülmüş, monoton artan zorluk profili
- İki kısa oynayarak öğrenme dersi: ilk yerleştirme + Not modu
- Kuşlar / Şekiller / Klasik tema değişimi; aktif oyun sıfırlanmaz
- Hücre-önce ve taş-önce giriş
- Not, geri alma, temizleme ve cevabı otomatik koymayan açıklayıcı ipucu
- İlişki kurallarına göre aday notlarının otomatik temizlenmesi
- İsteğe bağlı nazik hata kontrolü; hata veya ipucu puan düşürmez
- Büyük yazı, sayı desteği, yüksek kontrast, hareket azaltma, ses/titreşim ve süre ayarları
- Oyun ekranında ana akış için dikey scroll gerektirmeyen mobil yerleşim
- Otomatik yerel kayıt ve kaldığın yerden devam
- Ustalık arttıkça dekoratif olarak canlanan Kuş Köyü
- Çevrimdışı PWA kabuğu
- Capacitor Android projesi ve debug APK GitHub Actions hattı
- Hesapsız/serversız çalışma; mevcut sürümde analitik ve reklam SDK'sı yok

## Kalite kapıları

Hızlı CI kapısı (motor + UI smoke):

```bash
npm run check
npm test
npm run build
```

300 bölümlük içerik denetimi:

```bash
npm run audit:levels
```

`audit:levels`, her kademede 60 deterministik başlangıç bahçesini tek çözüm, kanonik çözüm, minimum başlangıç taşı, tekrar etmeme ve açıklanabilir çözüm akışı açısından doğrular.

## Yerel geliştirme

Gereksinim: Node.js 22+.

```bash
npm ci
npm run dev
```

Android debug APK:

```bash
npm run android:debug
```

## Mimari

```text
src/content.js          Kademe, kuş, tema ve köy ilerleme içeriği
src/game-core.js        Bulmaca üretimi, constraint çözücü, rating ve ipucu motoru
src/state.js            Sürümlü yerel kayıt ve çalışma durumu
src/actions.js          Oyun etkileşimleri, ilerleme ve geri alma
src/tutorial.js         İlk iki bahçenin oynayarak öğrenme akışı
src/*-view.js           Ana ekran, oyun ve modal sunum katmanı
src/ui.js               Tema tokenları, kuş SVG ve ortak UI yardımcıları
src/styles*.css         60+ odaklı responsive görsel sistem
scripts/audit-levels.js 300 bahçelik içerik kalite denetimi
scripts/build-static.js Çevrimdışı/Capacitor için deterministik statik paket
public/                 Manifest, service worker, gizlilik ve ikon
test/                   Hızlı motor/regresyon kapısı
```

Detaylı ürün sözleşmesi: [`docs/GAME_DESIGN_V2.md`](docs/GAME_DESIGN_V2.md)

## Yayın ayrımı

Kod, içerik motoru ve Android debug paket hattı ürün seviyesinde tamamlanabilir; **Store yayını** ayrıca gerçek 60+ katılımcılarla ilk kullanım gözlemi, fiziksel Android/TalkBack matrisi, imzalı AAB ve kapalı test geri bildirimini gerektirir. Bunlar kod içi testlerle ikame edilmez.
