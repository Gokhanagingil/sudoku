# Kuş Köyü: Denge — Oyun Tasarımı V2

**Durum:** Uygulamaya alınan ürün yönü  
**Repo:** `Gokhanagingil/sudoku`  
**Ana fikir:** Sudoku'ya benzeyen çıkarım omurgasını koru; Sudoku kopyası üretme.

## 1. Ürün kimliği

Oyuncu bir sayı tablosu doldurmuyor; Kuş Köyü'ndeki yuvaların dengesini kuruyor. Tahta matematiksel olarak düzenli bir mantık problemi olsa da görsel dil "hücre doldurma" yerine bahçe, yuva, patika ve kuş yerleştirme hissi verir.

Çalışma adı **Kuş Köyü: Denge**. Repo adının `sudoku` olarak kalması teknik açıdan sorun değildir; mağaza adı daha sonra kullanıcı testiyle kesinleştirilebilir.

## 2. Değişmeyen ana kural

N×N tahtada N farklı oyun taşı bulunur. Her taş:

1. her yatay yolda bir kez,
2. her dikey yolda bir kez,
3. her bahçe bölgesinde bir kez

yer alır.

Bu kural, tema ne olursa olsun aynıdır. Kuş `Maviş`, geometrik `●` ve klasik `1` aynı `GameToken(1)` değerinin farklı sunumlarıdır.

## 3. Sudoku'nun üzerine çıkan ilişki katmanı

### 3.1 Komşuluk noktası

İki komşu yuva arasındaki dolu nokta, iki taşın sıra değerlerinin ardışık olduğunu söyler. Örnek: 3 ve 4 olabilir; 3 ve 5 olamaz.

### 3.2 Sıra oku

Okun başladığı yuvadaki değer, okun gösterdiği yuvadaki değerden küçüktür.

### 3.3 Toplam bağı

İki bağlı yuvanın ortasındaki küçük etiket, bu iki yuvanın sıra değerleri toplamını gösterir. Bu ilişki ileri seviyelerde devreye girer.

## 4. Zorluk modeli

Zorluk "kaç hücre boş" ölçüsü değildir. İçerik kalitesi, bulmacanın insan mantığıyla çözüm sırasındaki teknik gereksinimine göre ölçülmelidir.

### Acemi

- 4×4
- İlişki ipucu yok
- Tek aday ve gizli tek mantığı
- İlk iki bölüm bağlamsal eğitim

### Çırak

- 6×6
- Komşuluk noktaları
- Tek aday + bölge kesişimi
- Daha az başlangıç taşı

### Deneyimli

- 6×6
- Komşuluk + sıra oku
- Birden fazla ipucunu birlikte okuma
- Not kullanımı doğal biçimde faydalı hale gelir

### Usta

- 9×9
- Büyük tahta
- Komşuluk + sıra
- Aday çiftleri ve zincirli çıkarımlar için içerik kalibrasyonu

### Pro

- 9×9
- Komşuluk + sıra + toplam
- Düşük başlangıç yoğunluğu
- Birkaç mantık tekniğini art arda kullanma

> Motor tek çözümü doğrular. Store seviyesine gelmeden önce ikinci aşamada "insan tekniği çözücüsü" her bulmacaya teknik profili ve difficulty score atamalıdır.

## 5. 60+ UX sözleşmesi

Bu maddeler özellik değil kabul kriteridir:

- Oyun ekranının temel akışında dikey scroll gerekmemesi hedeflenir.
- Ana aksiyonlar alt bölgede sabittir ve en az 48 dp dokunma hedefi taşır; hedef 56–64 dp'dir.
- İlk kullanımda tam ekran metin duvarı gösterilmez.
- İlk aksiyon "boş yuvaya dokun" olarak görsel bağlamda öğretilir.
- Kuşlar yalnız renk ile ayırt edilmez; biçim ve isteğe bağlı sıra numarası birlikte kullanılır.
- Yanlış hamle sesli/sert biçimde cezalandırılmaz.
- İpucu cevabı otomatik koymaz; oyuncunun son eylemi kendisinin yapmasına izin verir.
- Not modu açıkken durum hem renk hem metinle (`Açık`) belirtilir.
- Geri alma sınırsız kullanıcı deneyimi olarak ele alınır.
- Süre kapalı varsayılır; açıldığında skor veya ödül üzerinde etkisi yoktur.
- TalkBack/ekran okuyucu etiketleri hücrede satır, sütun, durum ve taş bilgisini söylemelidir.

## 6. Tema sözleşmesi

Tema yalnızca `GameToken` sunumunu değiştirir.

- `birds`: Kuş Köyü'nün ana marka yüzü
- `shapes`: Geometrik şekiller
- `numbers`: Klasik sayı görünümü

Aşağıdakiler tema değişiminde asla sıfırlanmaz:

- bulmaca kimliği
- çözüm
- oyuncu yerleştirmeleri
- notlar
- geri alma geçmişi
- puan ve tamamlanma durumu

## 7. Retention: köyün canlanması

Bulmaca dışına ikinci bir ekonomi/management oyunu eklenmez. Bunun yerine ustalık puanı yükseldikçe ana ekrandaki köy dekoratif olarak canlanır:

- yeni kuşlar görünür,
- çiçekler çoğalır,
- ev/yuva detayları artar,
- sahne daha yaşayan hale gelir.

Bu ilerleme oyuncuya duygusal süreklilik verir, ancak bulmaca kurallarına avantaj sağlamaz.

## 8. Puan ve kilit açma

Puan yalnızca ustalık ilerlemesidir. İpucu, hata düzeltme veya uzun süre harcama ödülü azaltmaz. Aynı puzzle ID ikinci kez çözülürse tekrar ustalık puanı verilmez.

## 9. Kalite kapıları

### V2 temel kapısı

- [x] Ürün yönü Sudoku kopyasından bağımsızlaştırıldı
- [x] 4×4 / 6×6 / 9×9 tasarım kararı
- [x] İlişki constraint modeli
- [x] tema bağımsız kayıt sözleşmesi
- [x] beş kademe puan sistemi

### Beta kapısı

- [ ] İnsan tekniği çözücüsü ve difficulty rating
- [ ] En az 150 kalite taramasından geçmiş puzzle seed'i
- [ ] 9×9 küçük ekran görsel regresyon matrisi
- [ ] İlk kullanım gözlem testi: en az 8 adet 60+ katılımcı
- [ ] TalkBack fiziksel cihaz testi
- [ ] Android paketleme + debug APK

### Store kapısı

- [ ] Kapalı testten UX düzeltmeleri
- [ ] İmzalı AAB
- [ ] Gizlilik/veri güvenliği kontrolü
- [ ] Çökme/ANR kontrolü
- [ ] En az 300 kalite onaylı normal bölüm + günlük bulmaca havuzu

## 10. Bir sonraki büyük teknik adım

Bir sonraki büyük iş, **human-technique solver + curated level pack + Android physical-device UX** üçlüsüdür. Bu üçü tamamlanmadan yalnızca daha fazla özellik eklemek ürün kalitesini artırmaz.
