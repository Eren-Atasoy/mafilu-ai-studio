# 📋 Mafilu AI Studio — Görev Panosu (Trello)

> **Deadline:** 2 Ağustos 23:59 · **Başlangıç:** 12 Temmuz · **Süre:** 21 gün
> **Happy Path:** Giriş → Proje oluştur → Prompt yaz → AI video üret → Editörde düzenle → Paylaş → Başarı ✅
>
> **Kurallar:**
> - Her task = 1 profesyonel commit + push
> - Her sprint sonunda DUR → Product Owner (Eren) test eder → onay sonrası sonraki sprint
> - Scope büyütmek YASAK — Happy Path'i kırmayan hiçbir şey öncelik değildir

---

## 🧱 Sprint 1 — Temel Altyapı, Auth & Dashboard (12–17 Temmuz)

**Sprint Hedefi:** Kullanıcı kayıt olup giriş yapabilir, proje oluşturup listeleyebilir. Site canlıda.

- [x] **S1-T1:** Next.js 15 (App Router) + TypeScript + Tailwind CSS kurulumu
- [x] **S1-T2:** shadcn/ui kurulumu + tema (Türkçe UI, i18n'e hazır metin yapısı)
- [x] **S1-T3:** Supabase projesi bağlantısı — client/server helper'lar, env yapısı
- [x] **S1-T4:** Veritabanı şeması + RLS politikaları (profiles, projects, generations, timeline_items, publications) — SQL migration dosyası
- [x] **S1-T5:** Auth — kayıt ol / giriş yap / çıkış (Supabase Auth, e-posta + şifre)
- [x] **S1-T6:** Korumalı dashboard layout (sidebar + header + auth middleware)
- [x] **S1-T7:** Proje Yönetimi ekranı — proje oluştur / listele / sil (CRUD)
- [ ] **S1-T8:** Vercel deploy + mafilu.com domain bağlantısı *(PO'dan Supabase + Vercel erişimi bekleniyor)*

**✋ SPRINT 1 SONU — PO TESTİ:** Kayıt ol → giriş yap → proje oluştur → çıkış yap. Canlı linkte çalışıyor mu?

---

## ⚙️ Sprint 2 — AI Üretim Motoru (17–22 Temmuz)

**Sprint Hedefi:** Kullanıcı prompt girer, AI video/görsel üretilir, galeriye düşer.

- [x] **S2-T1:** Replicate API entegrasyonu — server-side client + model seçimi (wan-2.2-t2v-fast video + flux-schnell görsel)
- [x] **S2-T2:** Üretim API route'u — prompt al, Replicate prediction başlat, `generations` tablosuna kaydet
- [x] **S2-T3:** Replicate webhook (prod) + polling (yerel) — çıktı Supabase Storage'a kaydedilir, durum güncellenir
- [x] **S2-T4:** Prompt ekranı (proje içi) — prompt girişi, tip seçimi (video/görsel), üretim başlat butonu
- [x] **S2-T5:** Üretim durumu takibi — 5 sn'lik polling ile "üretiliyor → tamamlandı" gösterimi
- [x] **S2-T6:** Üretim galerisi — proje içindeki tüm üretimleri grid'de göster, önizleme

**✋ SPRINT 2 SONU — PO TESTİ:** Prompt yaz → üret → videonun galeriye düştüğünü gör.

---

## 🎬 Sprint 3 — "Illusion" Editör (22–27 Temmuz)

**Sprint Hedefi:** CapCut hissi veren timeline editörü. Gerçek render yok — state DB'de tutulur.

- [ ] **S3-T1:** Editör sayfası iskeleti — önizleme alanı + timeline paneli layout'u
- [ ] **S3-T2:** Timeline klip bileşeni — galeriden klip ekleme, drag-and-drop ile sıralama (dnd-kit)
- [ ] **S3-T3:** Sıralı video önizleme — klipleri arka arkaya oynatan player (illusion)
- [ ] **S3-T4:** Text/altyazı overlay — klip üstüne metin ekleme, konum/stil seçimi
- [ ] **S3-T5:** Stok müzik seçici — 3-5 hazır müzik, önizlemede çalma
- [ ] **S3-T6:** Editör state'inin DB'ye kaydı (`timeline_items`) — otomatik kaydet
- [ ] **S3-T7:** "Dışa Aktar" butonu — timeline'ı yayına hazır olarak işaretle

**✋ SPRINT 3 SONU — PO TESTİ:** Klipleri sırala → altyazı ekle → müzik seç → önizle → dışa aktar.

---

## 📤 Sprint 4 — Yayınlama & Landing (27–30 Temmuz)

**Sprint Hedefi:** Tek tıkla Instagram/TikTok'a gerçek paylaşım (Ayrshare) + vitrin.

- [ ] **S4-T1:** Ayrshare API entegrasyonu — server-side client, hesap bağlantısı
- [ ] **S4-T2:** Paylaşım akışı UI — platform seç (Instagram/TikTok), açıklama yaz, paylaş butonu
- [ ] **S4-T3:** Paylaşım sonucu — başarı ekranı + `publications` tablosuna kayıt + paylaşım geçmişi
- [ ] **S4-T4:** Ayrshare hatası için zarif fallback (demo günü sigortası)
- [ ] **S4-T5:** Landing page — hero, özellikler, CTA (jürinin ilk göreceği yüz)

**✋ SPRINT 4 SONU — PO TESTİ:** Uçtan uca Happy Path: giriş → üret → düzenle → paylaş → başarı.

---

## ✨ Sprint 5 — Cilalama & Demo (30 Temmuz – 2 Ağustos)

**Sprint Hedefi:** Sıfır kırık akış. Son 2 gün koda dokunulmaz.

- [ ] **S5-T1:** Happy Path uçtan uca bug taraması ve düzeltmeler
- [ ] **S5-T2:** Mobil/responsive kontrol (jüri telefondan açabilir)
- [ ] **S5-T3:** Demo verisi — dolu görünen hesap, hazır projeler, örnek üretimler
- [ ] **S5-T4:** README + canlı link + ekran görüntüleri (repo vitrini)
- [ ] **S5-T5:** 🎥 3 dakikalık demo videosu çekimi (PO ile birlikte) — **31 Tem'den sonra koda dokunmak yasak**

---

## 🔑 Product Owner'dan Beklenen Girdiler

| Ne | Ne zaman lazım | Durum |
|---|---|---|
| Supabase projesi (URL + anon key + service role key) | Sprint 1, T3 | ⏳ |
| Vercel hesabı + mafilu.com DNS erişimi | Sprint 1, T8 | ⏳ |
| Replicate API token (+ biraz kredi) | Sprint 2, T1 | ⏳ |
| Ayrshare API key (ücretsiz hesap) | Sprint 4, T1 | ⏳ |
| Stok müzik dosyaları (telifsiz, 3-5 adet) | Sprint 3, T5 | ⏳ |

---

## 🚫 Scope Dışı (2 Ağustos'a kadar YAPILMAYACAK)

- Gerçek video render/birleştirme (ffmpeg) — illusion yeterli
- Ödeme/abonelik sistemi
- Takım/çoklu kullanıcı işbirliği
- Şifremi unuttum, e-posta doğrulama akışları (Supabase varsayılanı yeter)
- Çoklu dil (yapı hazır olacak, çeviri sonra)
- Runway/Luma gibi premium modeller
