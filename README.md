# Kuş Köyü: Denge

> Repo adı `sudoku` tarihsel bir çalışma adıdır. Ürün Sudoku kopyası değildir.

**Kuş Köyü: Denge**, Belgin uygulamasında sevilen sıcak Kuş Köyü duygusunu koruyan; satır–sütun–bahçe benzersizliğini komşuluk, sıralama ve toplam ilişkileriyle genişleten, 60+ yaş erişilebilirliğini birinci sınıf gereksinim kabul eden bağımsız bir mantık oyunudur.

## Neden klasik Sudoku değil?

Klasik Sudoku yalnızca başlangıç omurgasıdır. Denge'de aynı temel çıkarım fikri farklı ilişki katmanlarıyla büyür:

- Her satırda, sütunda ve bahçede her taş bir kez bulunur.
- **Komşuluk noktası:** bağlı iki taşın sıra değeri ardışıktır.
- **Sıra oku:** değerler ok yönünde artar.
- **Toplam bağı:** iki yuvanın toplamı verilen değere eşittir.
- Zorluk yalnızca daha az başlangıç taşıyla değil, çözüm sırasında gereken mantık teknikleriyle artar.

Bu yapı kuş, geometrik şekil ve klasik sayı temalarında aynı bulmacayı, notları ve ilerlemeyi korur.

## Ürün ilkeleri

- 60+ için büyük dokunma hedefleri, sakin hiyerarşi ve yüksek okunabilirlik
- İlk iki Acemi bahçesinde oynayarak öğrenme; uzun talimat ekranı yok
- Not alma, sınırsız geri alma, temizleme ve açıklayıcı ipucu
- İpucu cevabı otomatik yerleştirmez; doğru yuvayı ve mantığı açıklar
- Süre isteğe bağlıdır ve puanı etkilemez
- Can, enerji, seri cezası, hata cezası ve pay-to-win yok
- Otomatik yerel kayıt ve kaldığın yerden devam
- Tema değişimi yalnızca sunumdur; oyun mantığı değişmez
- Köy, ustalık puanı arttıkça görsel olarak canlanır; ayrı bir yönetim oyunu değildir

## Beşli ustalık yolu

| Kademe | Tahta | Açılma | Bulmaca ödülü | Yeni mantık |
|---|---:|---:|---:|---|
| Acemi | 4×4 | 0 | 50 | Temel satır/sütun/bahçe |
| Çırak | 6×6 | 250 | 80 | Ardışık komşuluk |
| Deneyimli | 6×6 | 800 | 120 | Komşuluk + sıralama |
| Usta | 9×9 | 1.800 | 170 | Büyük tahta + birleşik ilişkiler |
| Pro | 9×9 | 3.600 | 240 | Daha az başlangıç + toplam ilişkileri |

## Hedef kapsam

- Deterministik 4×4, 6×6 ve 9×9 bulmaca üretimi
- Her bulmaca için tek çözüm kontrolü
- İlişki ipuçları: ardışık, sıralama, toplam
- Kuşlar / Geometrik Şekiller / Klasik temaları
- Tema değiştirirken aktif oyun ve notların korunması
- Hücre-önce ve taş-önce giriş
- Not modu, akıllı not temizleme, geri alma ve temizleme
- Açıklayıcı, otomatik yerleştirmeyen ipucu
- Nazik isteğe bağlı hata kontrolü
- Büyük yazı, yüksek kontrast, hareket azaltma, sayı desteği ve ekranı açık tutma
- İlk Acemi deneyimi için bağlamsal eğitim
- Çevrimdışı kullanım
- Ustalık puanı ve beş kademeli kilit açma

Ürün tasarımı: [`docs/GAME_DESIGN_V2.md`](docs/GAME_DESIGN_V2.md)
