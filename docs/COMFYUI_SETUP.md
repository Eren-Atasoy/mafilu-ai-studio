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

## 3. Video Modeli (Wan 2.1 I2V — görselden video, tutarlılık için)

Video üretimi **görselden** yapılır (image-to-video): önce görsel üretilir,
beğenilen görsel galerideki **"Videoya Dönüştür"** ile canlandırılır. Bu akış,
prompttan video üretmeye göre çok daha tutarlı sonuç verir — özellikle kısa
film / çizgi film gibi sahne ve karakter tutarlılığı gereken işlerde.

Gerekli modeller (GGUF eklentisi için bkz. 3.6):

- `wan2.1-i2v-14b-480p-Q4_K_S.gguf` (city96/Wan2.1-I2V-14B-480P-gguf) → `models\unet\` (~9,6 GB)
- `clip_vision_h.safetensors` (Comfy-Org/Wan_2.1_ComfyUI_repackaged) → `models\clip_vision\` (~1,2 GB)
- `umt5_xxl_fp8_e4m3fn_scaled.safetensors` (aynı repo) → `models\text_encoders\` (~6,3 GB)
- `wan_2.1_vae.safetensors` (aynı repo) → `models\vae\`
- LightX2V distill LoRA (Kijai/WanVideo_comfy) → `models\loras\wan21_lightx2v_distill_rank32.safetensors`

Workflow repoda hazır: `comfy/workflows/video-from-image.json` — 81 kare,
16 fps (~5 sn), 4 adım (LightX2V sayesinde). Süre: 8 GB VRAM'de ~8-12 dk.
Video boyutu kaynak görselin yönelimine göre otomatik seçilir
(yatay 768×512, dikey 512×896, kare 640×640).

✅ Uygulamadaki akış: Görsel üret → galeride "Videoya Dönüştür" → hareket
açıklaması yaz → video, görselin ilk karesinden üretilir.

## 3.5 Prompt Zenginleştirme (şiddetle önerilir, ücretsiz)

Yerel modeller Türkçe anlamaz ve kısa promptlarla kötü sonuç verir. `.env`'e
ücretsiz bir [Google AI Studio anahtarı](https://aistudio.google.com/apikey) ekle:

```
GEMINI_API_KEY=<anahtarın>
```

Böylece kullanıcının Türkçe promptu, üretimden önce otomatik olarak detaylı
İngilizce sinematik prompta çevrilir. Anahtar yoksa prompt olduğu gibi geçer
(pipeline kırılmaz) ama kalite belirgin düşer.

## 3.6 GGUF Eklentisi ve Maksimum Kalite Görsel (FLUX)

Wan I2V ve FLUX modelleri GGUF formatında çalışır (8 GB VRAM'e quantization +
RAM offload ile sığarlar):

1. `custom_nodes\` altına [ComfyUI-GGUF](https://github.com/city96/ComfyUI-GGUF)
   klonla ve gömülü Python'a `pip install gguf` yap.
2. Formdaki **Kalite → Maksimum** görseli FLUX.1-dev ile üretir (~2-3 dk;
   Hızlı mod SDXL Turbo ~15 sn). Gerekli dosyalar:
   - `flux1-dev-Q5_K_S.gguf` (city96/FLUX.1-dev-gguf) → `models\unet\`
   - `clip_l.safetensors` (comfyanonymous/flux_text_encoders) → `models\text_encoders\`
   - `t5xxl_fp8_e4m3fn.safetensors` (aynı repo) → `models\text_encoders\`
   - `ae.safetensors` (Flux VAE, açık aynadan) → `models\vae\flux_ae.safetensors`
3. ComfyUI'yi yeniden başlat. Workflow'lar repoda hazır:
   `comfy/workflows/image.json`, `image-max.json`, `video-from-image.json`.

## 4. Sık Karşılaşılanlar

| Belirti | Sebep / Çözüm |
|---|---|
| Kart "Başarısız: ComfyUI isteği reddetti" | ComfyUI kapalı — `run_nvidia_gpu.bat` çalışıyor mu? |
| Kart "Başarısız: Workflow dosyası eksik" | Repo güncel mi? `comfy/workflows/` klasörünü kontrol et. |
| "Video üretimi için kaynak görsel gerekli" | Video, galerideki bir görselden "Videoya Dönüştür" ile başlatılır. |
| Üretim çok yavaş / OOM | Çözünürlüğü ve kare sayısını düşür; ComfyUI'yi `--lowvram` ile başlat. |
| Çıktı geldi ama galeri boş | Workflow'da SaveImage/SaveVideo düğümü olmalı (Preview yetmez). |

## 5. Canlıya Geçiş (Sprint 5)

`.env`'de üç satır:

```
MEDIA_PROVIDER=fal
FAL_KEY=<fal.ai anahtarın>
FAL_VIDEO_MODEL=<image-to-video modeli, örn. fal-ai/kling-video/v1.6/standard/image-to-video>
FAL_IMAGE_MODEL=<örn. fal-ai/flux/schnell>
```

fal.ai, ComfyUI workflow'larını da barındırabilir — yereldeki özel workflow'un
(LoRA, IP-Adapter, stil kilidi vb.) canlıda aynen çalıştırılabilir.
