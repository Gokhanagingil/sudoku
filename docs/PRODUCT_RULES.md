# Ürün ve UX Kuralları

## Değişmezler

1. Mevcut Belgin uygulaması, kodu, kayıtları ve paket kimliği değişmez.
2. Yeni uygulama yalnızca Sudoku içerir; tema seçimi oyun mantığını değiştirmez.
3. Oyuncu hiçbir zaman hata, ipucu, ara verme veya kaçırdığı gün nedeniyle puan kaybetmez.
4. Zorluk yalnızca başlangıç simgesi sayısıyla değil, gereken çözüm teknikleriyle kalibre edilir.
5. Her yayımlanan bulmaca tek çözümlüdür ve otomatik çözücüden geçer.
6. İlk kez açılışta “Başla”; yalnız yarım kalmış gerçek bir kayıt varsa “Kaldığın yerden devam et” görünür.
7. Temel eylemler sürükleme, uzun basma veya gizli jest gerektirmez.
8. Renk hiçbir zaman tek ayırt edici unsur değildir. Kuş adı, şekil silueti ve isteğe bağlı sayı desteği birlikte kullanılır.

## Beşli ustalık yolu

| Kademe | Tahta | Açılma puanı | Tamamlama puanı | Deneyim hedefi |
|---|---:|---:|---:|---|
| Acemi | 4×4 | 0 | 50 | Kuralı ve dokunma akışını öğrenme |
| Çırak | 6×6 | 250 | 80 | Satır, sütun ve bölgeyi birlikte izleme |
| Deneyimli | 6×6 | 800 | 120 | Notlarla birkaç adım planlama |
| Usta | 9×9 | 1.800 | 170 | Klasik Sudoku derinliği |
| Pro | 9×9 | 3.600 | 240 | İleri mantık zincirleri |

Puanlar yalnızca ilerleme ve görünür köy gelişimi içindir. Oyun gücü satın alınamaz.

## Tema sözleşmesi

- Kuşlar: Belgin'deki tanıdık kuş ailesi ve sıcak köy dili.
- Geometrik: dokuz farklı siluet; renge bağlı olmayan ayrım.
- Klasik: yüksek kontrastlı büyük sayılar.
- Tema oyun sırasında değiştirilebilir; açık bulmaca, notlar, süre ve puan korunur.
- Kuş ve şekil temalarında küçük sayı desteği varsayılan olarak açıktır, ayarlardan kapatılabilir.

## Öğretici

- Yalnızca ilk iki Acemi bulmacasında görünür.
- Kullanıcı önce “Birlikte yapalım” diyerek öğreticiyi bilinçli başlatır.
- İlk ders satırı, ikinci ders sütunu öğretir.
- Parlayan yuva ve parlayan doğru simge dışında kalan eylemler geçici olarak sakinleştirilir.
- Öğretici her adımın nedenini söyler; yalnızca “buraya dokun” demez.
- Kullanıcı iki dersi birden geçebilir.

## 60+ erişilebilirlik tabanı

- Metin varsayılanı en az 16–18 px, ana eylemler en az 56 px yüksektir.
- Renk + simge + metin birlikte kullanılır.
- Süre varsayılan olarak gizlidir ve puanı etkilemez.
- Animasyonlar kısa ve sakin, tamamen azaltılabilir.
- Ses ve titreşim destekleyicidir; hiçbir bilgi yalnız bunlarla verilmez.
- Oyun sırasında ekranı açık tutma varsayılan olarak açıktır.
- Yanlış yerleşim “Bir daha bakalım” diliyle açıklanır; can veya hata sayacı yoktur.
