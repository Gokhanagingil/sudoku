# Store Kalitesine Gidiş Planı

## A — Temel dikey dilim

- [x] Ayrı ürün ve ayrı paket kimliği
- [x] Veri tabanlı 4×4, 6×6, 9×9 Sudoku motoru
- [x] Tek çözüm kontrolü
- [x] Beş kademe ve puanla açılma
- [x] Not, geri al, temizle, ipucu ve otomatik kayıt
- [x] Üç görsel tema
- [x] Belgin görsel sürekliliği
- [x] İlk iki bölüm öğreticisi
- [x] PWA ve Android paketleme temeli

## B — İçerik ve zorluk kalitesi

- [ ] Çözüm tekniği sınıflandırıcısı: naked/hidden single, pair, pointing pair, box-line, X-Wing
- [ ] Her kademe için en az 100 insan tarafından gözden geçirilmiş başlangıç bulmacası
- [ ] Tekrarlı kalıp algılama ve içerik çeşitlilik ölçümü
- [ ] Açıklayıcı, çok basamaklı ipucu motoru
- [ ] Günlük bulmaca ve kaçırılan günlere cezasız arşiv
- [ ] Çevrimdışı içerik paketlerinin sürümlenmesi

## C — 60+ UX doğrulaması

- [ ] En az 8 katılımcıyla ilk kullanım testi
- [ ] 360×640, 390×844, büyük Android telefon ve 10 inç tablet kontrolü
- [ ] Büyük yazıda kaydırmadan anlaşılabilir ana oyun görevi
- [ ] 9×9 hücre seçim hatası ve simge ayrıştırma ölçümü
- [ ] TalkBack sırası ve ekran okuyucu etiketleri
- [ ] Düşük görme/yüksek kontrast ve hareket azaltma kontrolü
- [ ] Yarım bırakma, yeniden açma ve cihaz yeniden başlatma dayanıklılığı

## D — Mobil ve Store hazırlığı

- [x] Android güvenli alanları ve geri tuşu
- [ ] Android arka plan/geri dönüş yaşam döngüsü cihaz testi
- [ ] Android 8+ fiziksel cihaz matrisi
- [ ] İmzalı release AAB ve sürümleme
- [x] Özgün 512×512 uygulama ikonu ve native açılış ekranı
- [ ] Feature graphic ve telefon/tablet ekran görüntüleri
- [ ] Türkçe Store metni ve gizlilik politikası
- [ ] Veri güvenliği formu; hesap/izleme yoksa açık beyan
- [ ] Çökme ve performans izleme için ayrı mahremiyet kararı
- [ ] Kapalı test → 60+ UAT → production kararı

## Yayın kriteri

Tüm testler yeşil olsa bile C ve D bölümleri tamamlanmadan “Store'a hazır” etiketi kullanılmaz. İlk hedef, fiziksel cihazda ilk Acemi bulmacasının hiçbir açıklama dokümanı gerektirmeden tamamlanmasıdır.
