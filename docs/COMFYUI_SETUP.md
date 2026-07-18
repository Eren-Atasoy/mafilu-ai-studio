# 🖥️ ComfyUI Kurulum Rehberi (Yerel, 0 TL Üretim)

> Hedef donanım: **NVIDIA RTX 4060 Laptop (8 GB VRAM)** — görsel üretimi rahat,
> video için LTX-Video sınıfı hafif modeller uygundur.
>
> Mimari: Uygulama `MEDIA_PROVIDER=comfyui` iken tüm üretim istekleri
> `COMFYUI_URL`'e (varsayılan `http://127.0.0.1:8188`) gider. Workflow şablonları
> `comfy/workflows/` klasöründedir; canlıya geçişte tek env değişikliğiyle
> fal.ai'ye dönülür — kod değişmez.

## 1. ComfyUI'yi Kur (10 dk)

1. [ComfyUI Releases](https://github.com/comfyanonymous/ComfyUI/releases) sayfasından
   **Windows Portable (nvidia)** zip'ini indir.
2. Örneğin `D:\ComfyUI` içine çıkar.
3. `run_nvidia_gpu.bat`'ı çalıştır → tarayıcıda `http://127.0.0.1:8188` açılır.
4. Açık kaldığı sürece Mafilu üretim yapabilir. (Uygulama ile aynı anda çalışmalı.)

## 2. Görsel Modeli (SDXL Turbo — 8 GB'de çalışır, ~7 GB indirme)

1. [DreamShaper XL v2.1 Turbo](https://huggingface.co/Lykon/dreamshaper-xl-v2-turbo/resolve/main/DreamShaperXL_Turbo_v2_1.safetensors)
   dosyasını indir.
2. **Dosya adını `dreamshaper_xl_turbo.safetensors` yap** (repodaki `comfy/workflows/image.json`
   bu adı bekler — farklı bir checkpoint kullanacaksan JSON'daki `ckpt_name`'i değiştir).
3. `<ComfyUI kurulumun>\ComfyUI\models\checkpoints\` klasörüne koy.
4. ComfyUI'yi yeniden başlat.

> Not: Turbo model 8 adımda üretir (workflow'da ayarlı) — hem hızlı hem SD 1.5'ten
> belirgin kaliteli. Çözünürlük ve negative prompt, uygulamadaki kategori
> presetlerinden (`src/lib/presets.ts`) gelir.

✅ Bu kadar — **görsel üretimi hazır.** Uygulamadan "Görsel" seçip prompt yazınca
ComfyUI kuyruğuna düşer, çıktı Supabase Storage'a kopyalanır.

## 3. Video Modeli (LTX-Video — 8 GB VRAM'de çalışan en pratik seçenek)

LTX-Video workflow'ları kişisel kuruluma göre değiştiği için repoya hazır
`video.json` koymadık — kendi çalışan workflow'unu export edeceksin:

1. ComfyUI arayüzünde: **Workflow → Browse Templates → Video** altından
   **LTX-Video (Text to Video)** şablonunu aç.
2. Şablon eksik modelleri söyler; genellikle şunlar gerekir:
   - `ltx-video-2b-v0.9.5.safetensors` → `models\checkpoints\`
   - `t5xxl_fp8_e4m3fn.safetensors` (metin kodlayıcı) → `models\text_encoders\`
   (ComfyUI'nin model indirme diyaloğu linkleri verir; toplam ~8 GB.)
3. Şablonu bir kez çalıştırıp video aldığından emin ol.
   8 GB VRAM için öneri: çözünürlük **768×512**, kare sayısı **97 (≈4 sn)** civarında tut.
4. Prompt kutusundaki metni birebir şu yer tutucuyla değiştir: `__PROMPT__`
   Varsa seed alanına da `__SEED__` yazabilirsin (opsiyonel).
5. **Menü → Workflow → Export (API)** ile JSON'u indir ve repoda
   `comfy/workflows/video.json` olarak kaydet.

✅ Artık uygulamadan "Video" üretimi de yerelde çalışır. `video.json` yoksa
uygulama bunu açıklayan Türkçe bir hata gösterir (pipeline kırılmaz).

## 3.5 Prompt Zenginleştirme (şiddetle önerilir, ücretsiz)

Yerel modeller Türkçe anlamaz ve kısa promptlarla kötü sonuç verir. `.env`'e
ücretsiz bir [Google AI Studio anahtarı](https://aistudio.google.com/apikey) ekle:

```
GEMINI_API_KEY=<anahtarın>
```

Böylece kullanıcının Türkçe promptu, üretimden önce otomatik olarak detaylı
İngilizce sinematik prompta çevrilir. Anahtar yoksa prompt olduğu gibi geçer
(pipeline kırılmaz) ama kalite belirgin düşer.

## 3.6 Maksimum Kalite Modu (opsiyonel, ~25 GB)

Formdaki **Kalite → Maksimum** seçeneği, 8 GB VRAM'de GGUF quantization +
RAM offload ile çalışan en iyi açık modelleri kullanır (yavaş ama en kaliteli):

| Tür | Model | Süre (yaklaşık) |
|---|---|---|
| Görsel | FLUX.1-dev (GGUF Q5) | 1-3 dk |
| Video | Wan 2.1 14B (GGUF Q4) + LightX2V 4-adım LoRA | 5-15 dk |

Kurulum:

1. `custom_nodes\` altına [ComfyUI-GGUF](https://github.com/city96/ComfyUI-GGUF)
   klonla ve gömülü Python'a `pip install gguf` yap.
2. Modelleri indir:
   - `flux1-dev-Q5_K_S.gguf` (city96/FLUX.1-dev-gguf) → `models\unet\`
   - `clip_l.safetensors` (comfyanonymous/flux_text_encoders) → `models\text_encoders\`
   - `ae.safetensors` (FLUX.1-schnell reposundan) → `models\vae\flux_ae.safetensors`
   - `wan2.1-t2v-14b-Q4_K_S.gguf` (city96/Wan2.1-T2V-14B-gguf) → `models\unet\`
   - `umt5_xxl_fp8_e4m3fn_scaled.safetensors` (Comfy-Org/Wan_2.1_ComfyUI_repackaged) → `models\text_encoders\`
   - `wan_2.1_vae.safetensors` (aynı repo) → `models\vae\`
   - LightX2V distill LoRA (Kijai/WanVideo_comfy) → `models\loras\wan21_lightx2v_distill_rank32.safetensors`
3. ComfyUI'yi yeniden başlat. Workflow'lar repoda hazır:
   `comfy/workflows/image-max.json` ve `video-max.json`.

## 4. Sık Karşılaşılanlar

| Belirti | Sebep / Çözüm |
|---|---|
| Kart "Başarısız: ComfyUI isteği reddetti" | ComfyUI kapalı — `run_nvidia_gpu.bat` çalışıyor mu? |
| Kart "Başarısız: ... video.json dosyasını oluşturun" | Adım 3 tamamlanmadı. |
| Üretim çok yavaş / OOM | Çözünürlüğü ve kare sayısını düşür; ComfyUI'yi `--lowvram` ile başlat. |
| Çıktı geldi ama galeri boş | Workflow'da SaveImage/SaveVideo düğümü olmalı (Preview yetmez). |

## 5. Canlıya Geçiş (Sprint 5)

`.env`'de üç satır:

```
MEDIA_PROVIDER=fal
FAL_KEY=<fal.ai anahtarın>
FAL_VIDEO_MODEL=<seçilen model, örn. fal-ai/ltx-video>
FAL_IMAGE_MODEL=<örn. fal-ai/flux/schnell>
```

fal.ai, ComfyUI workflow'larını da barındırabilir — yereldeki özel workflow'un
(LoRA, IP-Adapter, stil kilidi vb.) canlıda aynen çalıştırılabilir.
