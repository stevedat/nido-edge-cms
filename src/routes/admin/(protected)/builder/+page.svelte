<script>
  import { t } from '$lib/i18n/index';
  import { Sparkles, Key, Wand2, Loader2, Play, Code, Copy, Check } from 'lucide-svelte';
  import { onMount } from 'svelte';
  
  let prompt = $state('');
  let apiKey = $state('');
  let provider = $state('gemini'); // gemini | claude | openai
  
  let mode = $state('auto'); // auto | manual
  let manualPayload = $state('');
  let systemPrompt = $state('');
  let copied = $state(false);
  
  let isGenerating = $state(false);
  let result = $state(null);
  let error = $state('');

  onMount(async () => {
      try {
          const res = await fetch('/api/v1/builder/generate');
          if (res.ok) {
              const data = await res.json();
              systemPrompt = data.systemPrompt;
          }
      } catch (e) {}
  });

  async function copyPrompt() {
      const fullPrompt = `${systemPrompt}\n\n=== YÊU CẦU CỦA TÔI ===\n${prompt || '[Mô tả web bạn muốn ở đây]'}`;
      await navigator.clipboard.writeText(fullPrompt);
      copied = true;
      setTimeout(() => copied = false, 2000);
  }

  async function handleGenerate() {
      if (mode === 'auto' && (!prompt || !apiKey)) {
          error = 'Vui lòng nhập Prompt và API Key';
          return;
      }
      if (mode === 'manual' && !manualPayload) {
          error = 'Vui lòng dán kết quả JSON từ AI vào';
          return;
      }

      isGenerating = true;
      error = '';
      result = null;

      try {
          const res = await fetch('/api/v1/builder/generate', {
              method: 'POST',
              body: JSON.stringify({ mode, prompt, apiKey, provider, manualPayload }),
              headers: { 'Content-Type': 'application/json' }
          });

          const data = await res.json();
          if (!res.ok) {
              throw new Error(data.message || 'Lỗi khi tạo website');
          }

          result = data;
      } catch (/** @type {any} */ err) {
          error = err.message;
      } finally {
          isGenerating = false;
      }
  }
</script>

<div class="max-w-4xl mx-auto space-y-6 pb-20">
  <!-- Header -->
  <header class="flex items-center justify-between mb-8">
      <div>
          <h1 class="text-2xl font-bold text-text-main flex items-center gap-2">
              <Sparkles size={24} strokeWidth={1.75} class="text-primary" />
              {t('builder.title') || 'AI Builder (Beta)'}
          </h1>
          <p class="text-text-muted mt-1">
              {t('builder.description') || 'Mô tả website bạn muốn, AI sẽ tự động sinh giao diện và trang Admin.'}
          </p>
      </div>
  </header>

  <!-- Tabs -->
  <div class="flex gap-2 p-1 bg-surface border border-border-subtle rounded-xl w-fit">
      <button 
          onclick={() => mode = 'auto'}
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all {mode === 'auto' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main hover:bg-soft-bg'}"
      >
          Tự động (Cần API Key)
      </button>
      <button 
          onclick={() => mode = 'manual'}
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all {mode === 'manual' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main hover:bg-soft-bg'}"
      >
          Thủ công (Miễn phí)
      </button>
  </div>

  <!-- Builder Form -->
  <div class="bg-surface border border-border-subtle rounded-3xl p-6 lg:p-8 space-y-6">
      
      {#if mode === 'auto'}
      <!-- Auto Mode -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
              <label class="block text-sm font-medium text-text-muted" for="provider">
                  {t('builder.provider') || 'AI Provider'}
              </label>
              <select 
                  id="provider"
                  bind:value={provider}
                  class="w-full bg-main-bg border border-border-subtle rounded-xl px-4 min-h-[44px] text-text-main focus:border-primary focus:outline-none transition-all"
              >
                  <option value="gemini">Google Gemini (Khuyên dùng)</option>
                  <option value="claude">Anthropic Claude 3.5</option>
                  <option value="openai">OpenAI GPT-4o</option>
              </select>
          </div>
          
          <div class="space-y-2">
              <label class="block text-sm font-medium text-text-muted flex items-center gap-1" for="apiKey">
                  <Key size={14} strokeWidth={1.75} />
                  {t('builder.api_key') || 'API Key'}
              </label>
              <input 
                  id="apiKey"
                  type="password"
                  bind:value={apiKey}
                  placeholder="Nhập API Key của bạn..."
                  class="w-full bg-main-bg border border-border-subtle rounded-xl px-4 min-h-[44px] text-text-main focus:border-primary focus:outline-none transition-all"
              />
          </div>
      </div>
      {/if}

      {#if mode === 'manual'}
      <!-- Manual Mode Info -->
      <div class="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl space-y-3">
          <h3 class="text-indigo-400 font-medium text-sm">Cách dùng miễn phí (Dùng ChatGPT/Claude của bạn)</h3>
          <ol class="text-text-muted text-sm list-decimal pl-4 space-y-1">
              <li>Nhập mô tả web bạn muốn vào ô Yêu cầu bên dưới.</li>
              <li>Bấm nút <strong>Copy Mẫu Lệnh</strong>.</li>
              <li>Mở ChatGPT hoặc Claude, dán lệnh đó vào.</li>
              <li>Copy đoạn mã JSON mà AI trả về, dán vào ô <strong>Kết quả JSON</strong>.</li>
          </ol>
      </div>
      {/if}

      <!-- Prompt -->
      <div class="space-y-2">
          <label class="block text-sm font-medium text-text-muted flex items-center gap-1" for="prompt">
              <Wand2 size={14} strokeWidth={1.75} />
              {t('builder.prompt') || 'Yêu cầu (Prompt)'}
          </label>
          <textarea 
              id="prompt"
              bind:value={prompt}
              placeholder="Ví dụ: Tạo trang web Coach Sức khoẻ gồm giới thiệu, gói tập và học viên..."
              rows="3"
              class="w-full bg-main-bg border border-border-subtle rounded-xl p-4 text-text-main focus:border-primary focus:outline-none transition-all resize-none"
          ></textarea>
          
          {#if mode === 'manual'}
          <div class="flex justify-end pt-1">
              <button 
                  onclick={copyPrompt}
                  class="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-soft-bg text-text-main hover:bg-border-subtle transition-all active:scale-95"
              >
                  {#if copied}
                      <Check strokeWidth={2.25} size={14} class="text-green-500" /> {t('builder.copiedPrompt', { defaultValue: 'Đã sao chép!' })}
                  {:else}
                      <Copy strokeWidth={1.75} size={14} /> {t('builder.copyPromptBtn', { defaultValue: 'Sao chép câu lệnh mẫu cho ChatGPT/Claude' })}
                  {/if}
              </button>
          </div>
          {/if}
      </div>

      {#if mode === 'manual'}
      <div class="space-y-2 pt-4 border-t border-border-subtle">
          <label class="block text-sm font-medium text-text-muted flex items-center gap-1" for="manualPayload">
              <Code size={14} strokeWidth={1.75} />
              Dán kết quả JSON từ ChatGPT vào đây
          </label>
          <textarea 
              id="manualPayload"
              bind:value={manualPayload}
              placeholder="Dán mã JSON vào đây..."
              rows="6"
              class="w-full bg-main-bg border border-border-subtle rounded-xl p-4 text-text-main font-mono text-xs focus:border-primary focus:outline-none transition-all resize-none"
          ></textarea>
      </div>
      {/if}

      <!-- Actions -->
      <div class="flex items-center justify-end pt-4 border-t border-border-subtle">
          <button
              onclick={handleGenerate}
              disabled={isGenerating || (mode === 'auto' && (!prompt || !apiKey)) || (mode === 'manual' && !manualPayload)}
              class="flex items-center gap-2 bg-primary text-white font-medium px-6 py-2.5 rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 min-h-[44px]"
          >
              {#if isGenerating}
                  <Loader2 size={18} strokeWidth={1.75} class="animate-spin" />
                  {mode === 'manual' ? 'Đang cập nhật hệ thống...' : 'Đang sinh trang web...'}
              {:else}
                  <Play size={18} strokeWidth={1.75} />
                  {mode === 'manual' ? 'Cập nhật Web' : 'Tự động tạo'}
              {/if}
          </button>
      </div>
  </div>

  <!-- Error Message -->
  {#if error}
  <div class="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-start gap-3">
      <p class="text-sm">{error}</p>
  </div>
  {/if}

  <!-- Success Message -->
  {#if result}
  <div class="bg-green-500/10 border border-green-500/20 p-6 rounded-3xl space-y-4">
      <h3 class="text-green-400 font-medium flex items-center gap-2">
          <Check size={18} strokeWidth={2.5} />
          Hoàn tất! Cỗ máy đã xử lý xong:
      </h3>
      <ul class="text-text-muted space-y-2 text-sm list-disc pl-5">
          <li>Giao diện (Frontend) đã được lưu vào thư mục public.</li>
          <li>Cấu trúc CMS (Schema) đã được tạo và kích hoạt.</li>
      </ul>
      <div class="flex gap-4 pt-2">
          <a href="/" target="_blank" class="text-primary hover:underline text-sm font-medium">Xem Website →</a>
      </div>
  </div>
  {/if}
</div>
