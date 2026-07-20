# Claude Çalışma Modları — Frontend Kalite Sistemi

> Amaç: Mafilu frontend'ini Awwwards/ajans kalitesine taşımak. Her oturumda
> **tek mod aktif** olur; modlar sırayla uygulanır, karıştırılmaz ("çorba yasak").
> Kullanım: "Mod 1'i aktif et" / "Mod 2 ile şu bileşeni cilala" gibi.

---

## MOD 1 — İskelet Aşaması (Structure Mode)

**Kaynak yaklaşımlar:** `anthropics/frontend-design`, `vercel-labs/vercel-react-best-practices`

**Görev:** Yerleşimi ve React mimarisini kusursuz oturtmak. Görsel süsleme YOK.

### Layout kuralları
- Tek net görsel yön seç ve bağlı kal; güvenli-ortalama tasarım yerine tutarlı cesur seçim
- Asimetri, üst üste binme (overlap) ve grid kırma **hiyerarşiyi keskinleştirdiğinde** kullanılır, süs olsun diye değil
- Simetrik kart ızgarası ancak gerçekten doğru çözümse kullanılır
- Boşluk ritmi token'lardan gelir (`--space-*`), elle rastgele padding yazılmaz
- Okuma akışı sıra dışı yerleşimde bile net kalmalı

### React/performans kuralları (Vercel)
- Server Component varsayılandır; `"use client"` yalnızca etkileşim gereken yaprakta
- Effect içinde türetilebilir state tutma; render sırasında hesapla veya `useMemo`
- Liste render'larında sabit `key`; index-key yalnızca statik listelerde
- Ağır kütüphaneler (`gsap`, editör, chart) dinamik import ile yüklenir
- Görsellerde açık `width/height`; hero dışında `loading="lazy"`
- Senkron `setState`-in-effect yasak (repo lint kuralı zaten engelliyor)

### Bu modda YAPILMAZ
- Renk paleti kararı, gölge/doku, animasyon (Mod 2 ve 3'ün işi)

---

## MOD 2 — Cila ve Renk Aşaması (Art Director Mode)

**Kaynak yaklaşımlar:** `pbakaus/polish`, `jakubkrehel/make-interfaces-feel-better`, `jakubkrehel/oklch-skill`

**Görev:** İskelet bitmiş tasarımı "insan elinden çıkmış" hale getirmek.

### OKLCH renk kuralları
- Tüm renkler `oklch()` — HEX/RGB yeni kod'a girmez (mevcut proje token'ları zaten OKLCH)
- Aynı role sahip renkler aynı Lightness bandında tutulur (ör. tüm vurgular L≈0.80-0.85)
- Hover/active varyantları hue sabit tutulup L ve C oynanarak türetilir — asla "biraz koyusu" diye göz kararı HEX
- Nötrler tam gri değil; markanın hue'sundan eser taşır (Mafilu: `hue ≈ 95`, sıcak kömür)
- Kontrast: gövde metni ≥ 4.5:1, büyük tipografi ≥ 3:1

### Cila kontrol listesi (her bileşen için)
- [ ] Optik hizalama: ikonlar ve metin görsel merkeze göre, kutu merkezine göre değil
- [ ] Boşluk ritmi: kardeş elemanlar arası boşluklar ölçekten (4/8/12/16/24/32...), rastgele değil
- [ ] Gölgeler tek ışık kaynağından: aynı sayfada farklı yönlere düşen gölge olamaz
- [ ] Border-radius tutarlılığı: iç içe köşelerde iç radius < dış radius
- [ ] Metin satır uzunluğu 45-75 karakter; başlıklarda `text-wrap: balance`
- [ ] Boş/yükleniyor/hata durumları da tasarlanmış (kör beyaz kutu yasak)
- [ ] Hover/focus/active üçlüsü her etkileşimli elemanda kasıtlı ve görünür

---

## MOD 3 — Ruh Üfleme Aşaması (Motion Mode)

**Kaynak yaklaşımlar:** `emilkowalski/apple-design`, `emilkowalski/emil-design-eng`

**Görev:** Bitmiş tasarıma Apple kalitesinde akıcılık kazandırmak.
Projedeki araçlar: **GSAP + ScrollTrigger + Lenis** (kurulu), gerekirse Framer Motion.

### Emil Kowalski hareket prensipleri
- **Sadece compositor animasyonu:** `transform`, `opacity`, `clip-path`, (nadiren `filter`) — asla width/height/top/left
- **Süreler:** mikro-etkileşim 150-250ms, giriş/çıkış 300-500ms, sahne geçişi ≤ 800ms; 1sn üstü animasyon neredeyse her zaman hatadır
- **Easing:** girişlerde `ease-out` ailesi (hız→yavaşlama); `ease-in-out` yalnızca yer değiştirmede; sürükleme/fiziksel etkileşimde spring
- **Origin farkındalığı:** eleman nereden tetiklendiyse oradan büyür/açılır (menü butonundan, kart kendi merkezinden)
- **Çıkışlar girişlerden hızlı:** kapanma animasyonu ≈ açılışın %60-70'i
- **Kesintiye dayanıklılık:** kullanıcı animasyon ortasında etkileşime geçebilmeli; animasyon input'u bloklamaz
- **Bir sahnede tek kahraman:** aynı anda dikkat çeken tek büyük hareket; gerisi destek (stagger ≤ 100ms aralık)
- **Amaçsız animasyon eklenmez:** her hareket ya hiyerarşi kurar ya geri bildirim verir ya da mekânsal süreklilik sağlar

### Proje pratikleri
- `prefers-reduced-motion` her yeni animasyonda ilk günden desteklenir
- Sonsuz döngü animasyonları (float, boil) giriş animasyonlarıyla **aynı elemanda aynı property'yi** paylaşamaz (bkz. `lp-social-float` deseni — çakışma dersi)
- ScrollTrigger'lar `gsap.context` içinde kurulur, unmount'ta `revert()`

---

## 🚫 Uzak Durulacaklar

1. **Shadcn varsayılan görünümü (landing ve pazarlama yüzeylerinde):** gri border +
   default kart + default buton kombinasyonu "AI yaptı" diye bağırır. Shadcn/Radix
   yalnızca **headless mantık** (dialog, select, focus yönetimi) için kullanılır;
   görünüm her zaman Mafilu tasarım dilinden gelir. *(Uygulama içi formlarda mevcut
   shadcn bileşenleri kalabilir; yeniden tasarım sırası geldiğinde ele alınır.)*
2. **canvas-design tarzı yaklaşımlar:** kod yerine PNG/statik görsel üreten akışlar —
   bu projede işimiz kodla.
3. **React Native / mobil-app skill'leri:** kapsam dışı, bağlamı kirletir.
4. **Aşırı TypeScript mimarisi tartışması (grill-me tarzı):** UI iterasyonunu yavaşlatır;
   tip güvenliği mevcut lint/tsc seviyesinde yeterli.
5. **Genel yasaklar:** mor-gradyan-beyaz klişesi, amaçsız hover parıltıları, uniform
   padding'li kart yığınları, 1sn+ süren "sinematik" olduğu sanılan animasyonlar,
   `!important` ile cila, inline HEX renk.

---

## Mevcut Durum Haritası (2026-07-19)

| Yüzey | Durum | Uygulanmış modlar |
|---|---|---|
| Landing (`src/components/landing/`) | **"The Void"**: Netflix karanlığı × Mr. Robot — neon MAFILU tabelası, sidewave piksel geçişi, vitrin duvarı | Mod 1+2+3 uygulandı (karakalem/sketchpunk tamamen kaldırıldı — geri getirilmez) |
| Auth sayfaları (`src/app/(auth)/`) | **The Void terminal oturumu** — lp-panel pencere, lp-input/lp-label/lp-alert, PixelLink geçişleri | Mod 1+2 uygulandı |
| Dashboard + Studio (`src/app/(app)/`) | VHS raf Mod 1 iskeleti hazır | Mod 2+3 bekliyor; The Void paletine uyarlanacak |

Landing tasarım token'ları: `src/components/landing/landing.css` (`--lp-*` OKLCH seti):
zift `--lp-void`, neon kırmızı `--lp-red` (#FF003C), fosfor beyazı `--lp-ink`,
kül çizgi `--lp-line`, lacivert derinlik `--lp-navy`. Display font: Anton (`--font-display`).
