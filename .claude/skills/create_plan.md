---
name: create_plan
description: Araştırma çıktısından detaylı uygulama planı oluştur. Kod yazmadan önce planı kullanıcıyla iterate et.
---

Plan konusu: $ARGUMENTS

## Adımlar

1. thoughts/shared/research/ klasöründe ilgili araştırma dosyasını bul ve oku
2. Şu soruları yanıtlayan bir plan taslağı oluştur:
   - Hangi dosyalar değişecek? (tam yollarıyla)
   - Kaç fazda yapılacak?
   - Her fazın başarı kriteri nedir?
   - Risk ve edge case'ler neler?
3. Planı kullanıcıya göster ve şunu sor: "Yanlış veya eksik gördüğün bir şey var mı?"
4. Kullanıcı geri bildirimine göre güncelle, en az 1 iterasyon yap

## Plan Formatı

Her faz için:
- Ne yapılacak
- Hangi dosyalar değişecek
- Doğrulama komutu (npm run lint vb.)
- Başarı kriteri

## Çıktı

Onaylanan planı şuraya kaydet:
thoughts/shared/plans/YYYY-MM-DD_[konu].md

Kullanıcıya bildir, implement_plan ile devam edebileceğini söyle.
