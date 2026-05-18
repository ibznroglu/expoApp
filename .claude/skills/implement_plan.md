---
name: implement_plan
description: Planı faz faz uygula. Her fazdan sonra doğrulama çalıştır, manuel doğrulama için dur.
---

Plan dosyası: $ARGUMENTS

## Adımlar

1. thoughts/shared/plans/ klasöründe belirtilen plan dosyasını oku
2. Kullanıcıya hangi fazı uygulamak istediğini sor
3. Sadece o fazı uygula, planda olmayan dosyalara dokunma
4. Faz bitince npm run lint çalıştır
5. Kullanıcıya şunu göster:

## Faz Tamamlama Raporu

✅ Faz [N] tamamlandı

Değiştirilen dosyalar:
- [dosya yolu]

Doğrulama:
- [ ] npm run lint: [sonuç]

Manuel kontrol et:
- [ ] [kontrol edilmesi gereken şeyler]

Context durumu: [%X]
%60'ı aştıysa: /compact çalıştır, sonra devam et.

## Hata Protokolü

- Hata çıkarsa kök nedeni çöz, semptomu bastırma
- 2 denemede düzelmezse dur, kullanıcıya bildir
