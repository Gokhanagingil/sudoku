# Kuş Köyü: Denge — Ürün ve Oyun Sözleşmesi

**Repo:** `Gokhanagingil/sudoku`  
**Ürün adı:** Kuş Köyü: Denge  
**Birincil hedef:** 60+ yetişkinler  
**Durum:** Oynanabilir ürün kapsamı uygulanmış; Store öncesi fiziksel kullanıcı/cihaz doğrulaması ayrı kapıdır.

## 1. Ürün kimliği

Oyuncu bir sayı tablosu doldurmaz; Kuş Köyü'ndeki yuvaların dengesini kurar. Matematiksel omurga düzenli bir Latin/bölge mantığıdır, ancak görsel dil yuva, bahçe, yol ve kuş yerleştirmedir.

Belgin uygulaması değiştirilmez. Denge bağımsız paket ve kayıt alanına sahiptir; yalnızca sevilen Kuş Köyü görsel duygusunu sürdürür.

## 2. Ana kural

N×N tahtada N farklı `GameToken` bulunur. Her taş:

1. her yatay yolda bir kez,
2. her dikey yolda bir kez,
3. her bahçe bölgesinde bir kez

yer alır.

Kuş `Maviş`, geometrik `●` ve klasik `1`, aynı mantıksal `GameToken(1)` değerinin farklı sunumlarıdır.

## 3. Özgün ilişki katmanı

### Komşuluk noktası

İki komşu yuva arasındaki dolu nokta, değerlerin ardışık olduğunu söyler. 3–4 geçerlidir; 3–5 değildir.

### Sıra oku

Okun başladığı yuvadaki değer, okun gösterdiği yuvadaki değerden küçüktür.

### Toplam bağı

İki bağlı yuvanın ortasındaki etiket, değerlerin toplamıdır. Yalnız Pro kademesinde kullanılır.

Bu üç ilişki, aday hesaplama, çözücü, hata denetimi, not temizleme ve ipucu motorunda gerçek constraint olarak uygulanır; yalnız görsel süs değildir.

## 4. Zorluk modeli

Zorluk sadece başlangıç taşlarının sayısı değildir. Üretici her aday bulmacayı insanın takip edebileceği tekniklerle analiz eder ve bir rating üretir.

| Kademe | Boyut | Başlangıç hedefi | İlişki planı | 60 bahçe ortalama rating* |
|---|---:|---:|---|---:|
| Acemi | 4×4 | 8 | — | 8.0 |
| Çırak | 6×6 | 16 | 4 komşuluk | 24.6 |
| Deneyimli | 6×6 | 12 | 5 komşuluk + 3 sıra | 45.4 |
| Usta | 9×9 | 31 | 7 komşuluk + 5 sıra | 81.8 |
| Pro | 9×9 | 24 | 9 komşuluk + 6 sıra + 5 toplam | 134.3 |

\* 300 başlangıç bahçesinin 7 Eylül 2026 otomatik audit sonucu. Rating ürün içi skor değildir; içerik kalibrasyonu içindir.

Kullanılan açıklanabilir temel teknikler:

- tek aday,
- yatay/dikey/bahçede gizli tek,
- ilişki kısıtı nedeniyle tek aday.

İpucu motoru bu tekniklerin nedenini Türkçe açıklar ve cevabı kendi kendine yerleştirmez.

## 5. İlk kullanım eğitimi

Uzun öğretici ekran yoktur.

### Acemi Bahçe 1 — İlk çıkarım

- Sistem çözülebilir hedef yuvayı belirler ve yalnız o yuvayı parlatır.
- Oyuncu yuvayı seçer.
- Sistem yalnız doğru tek adayı parlatır.
- Oyuncu taşı kendisi yerleştirir.
- Eğitim biter; oyun normal devam eder.

### Acemi Bahçe 2 — Not

- Not düğmesi parlatılır.
- Birden fazla adayı olan örnek yuva seçtirilir.
- Tek bir aday küçük not olarak eklettirilir.
- Oyuncu Not'un cevap değil, aday işareti olduğunu yaşayarak görür.

Her iki ders de `Geç` ile kapatılabilir ve tekrar zorla gösterilmez.

## 6. 60+ UX kabul kriterleri

- Ana oyun akışında dikey scroll gerekmemesi.
- Birincil kontrollerin alt bölgede, büyük ve birbirinden ayrık olması.
- Not modunun yalnız renkle değil `Açık/Kapalı` metniyle belirtilmesi.
- Kuşların yalnız renkle ayrılmaması; gövde/desen + isteğe bağlı sayı desteği.
- Sürenin kapalı varsayılması ve puanı hiçbir zaman etkilememesi.
- Hatanın sert ses, can kaybı veya puan cezası üretmemesi.
- İpucunun otomatik cevap koymaması.
- Geri almanın kullanıcı açısından sınırsız hissettirilmesi; son 100 durum teknik tamponu pratikte fazlasıyla yeterlidir.
- TalkBack etiketinde yatay yol, dikey yol, boş/dolu durum ve taş bilgisinin bulunması.
- Hareket azaltma ve yüksek kontrast seçeneklerinin bulunması.
- Desteklenen cihazlarda ekranı açık tutma.

## 7. Tema sözleşmesi

`birds`, `shapes`, `numbers` yalnız sunum katmanıdır. Tema değişiminde aşağıdakiler korunur:

- bulmaca kimliği ve çözüm,
- yerleştirmeler,
- notlar,
- geri alma geçmişi,
- eğitim durumu,
- puan ve tamamlanma.

## 8. Ustalık ve köy

Puan yalnız ilerleme için kullanılır. Aynı puzzle ID ikinci kez ödül üretmez. İpucu, hata, geri alma ve süre ödülü azaltmaz.

Köy 0 / 250 / 800 / 1.800 / 3.600 puan eşiklerinde dekoratif olarak zenginleşir. Bu bir ekonomi ya da yönetim oyunu değildir ve bulmaca avantajı vermez.

## 9. İçerik kalite kapısı

Başlangıç paketi 5 × 60 = **300 bahçe** olarak denetlenir. `npm run audit:levels` şu koşulları fail-closed doğrular:

- tek çözüm,
- kanonik çözümle eşleşme,
- kademe başlangıç taşı alt sınırı,
- aynı kademede tekrar etmeme,
- temel açıklanabilir tekniklerle çözümün tamamlanması,
- aynı tier/ordinal için deterministik üretim,
- Acemi → Pro ortalama rating artışı.

Motor 60'tan sonraki ordinals için de deterministik bahçe üretmeye devam eder; 300 sayısı ilk kalite-onaylı paket sınırıdır.

## 10. Teknik ve dağıtım

- Web katmanı framework bağımsız ES module'dür.
- Statik build, kaynakları `dist/` altına deterministik olarak kopyalar; bu yapı PWA ve Capacitor tarafından aynen tüketilir.
- PWA shell service worker ile çevrimdışı önbelleğe alınır.
- Android `webDir=dist` kullanır.
- Uygulama kimliği tarihsel uyumluluk için `com.gokhanagingil.kuskoyusudoku` kalabilir; görünen uygulama adı `Kuş Köyü: Denge`dir.
- Bu sürüm sunucu, hesap, analitik veya reklam SDK'sı gerektirmez.

## 11. Otomasyonla tamamlanamayacak yayın kapıları

Aşağıdakiler “kod tamamlandı” iddiasından ayrı tutulur ve gerçek cihaz/insan kanıtı gerektirir:

- en az 8 adet 60+ katılımcıyla ilk kullanım gözlemi,
- küçük/büyük fiziksel Android telefon ve tablet matrisi,
- TalkBack ile gerçek cihaz navigasyonu,
- imzalı release AAB ve Play Console kapalı test,
- kapalı test geri bildiriminden doğan son UX düzeltmeleri,
- Store görselleri ve son veri güvenliği beyanı.

Bu kapılar geçilmeden “Store'a yayınlanmaya hazır” etiketi verilmez; ancak oyun fonksiyonları ve debug paket hattı bunlardan bağımsız olarak tamamlanır.
