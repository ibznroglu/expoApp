---
name: validate_plan
description: Tamamlanan implementasyonu plan ile karşılaştır, doğrulama raporu üret.
---

Plan dosyası: $ARGUMENTS

## Adımlar

1. thoughts/shared/plans/ klasöründe ilgili plan dosyasını oku
2. git log --oneline -10 ile son commit'lere bak
3. npm run lint çalıştır
4. Değişen dosyaları plan ile karşılaştır

## Rapor Formatı

thoughts/shared/prs/YYYY-MM-DD_[konu]-validation.md dosyasına kaydet:

---
## Doğrulama Raporu — [tarih]

### ✅ Doğru Uygulananlar
- [madde]

### ⚠️ Plandan Sapmalar
- [madde] — [açıklama]

### ❌ Eksik veya Hatalı
- [madde]

### Doğrulama
- [ ] npm run lint: [sonuç]

### Genel Durum
[HAZIR / DÜZELTME GEREKİYOR / KRİTİK SORUN]
---

Raporu kullanıcıya göster. HAZIR ise commit öner.
