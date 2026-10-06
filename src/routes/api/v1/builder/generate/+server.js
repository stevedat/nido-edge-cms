// @ts-nocheck
import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/auth';
import { core } from '$lib/server/core';

const SYSTEM_PROMPT = `Bạn là một chuyên gia lập trình SvelteKit và Kiến trúc sư Hệ thống CMS.
Người dùng muốn tạo một trang web. Nhiệm vụ của bạn là sinh ra 2 thứ dưới định dạng JSON duy nhất.

{
  "ui": "<Mã nguồn component Svelte>",
  "schema": [
    { "id": "field_name", "label": "Nhãn", "type": "text | image | number | rich-text" }
  ]
}

LUẬT CHO MÃ NGUỒN (ui):
1. Mã nguồn Svelte chỉ được dùng các class của Tailwind V4, ĐẶC BIỆT LÀ các token biến CSS sau của dự án:
   - Màu nền: \`bg-main-bg\`, \`bg-soft-bg\`, \`bg-surface\`
   - Màu chữ: \`text-text-main\`, \`text-text-muted\`, \`text-primary\`
   - Viền: \`border-border-subtle\`, \`border-border-strong\`
2. TUYỆT ĐỐI KHÔNG DÙNG hex color (VD: \`#000\`, \`#fff\`, \`bg-gray-100\`, \`bg-white\`).
3. MỌI DỮ LIỆU ĐỘNG (ví dụ: tên gói tập, giá tiền, lời đánh giá) KHÔNG ĐƯỢC hardcode. Hãy gọi nó qua biến \`data.dynamicData.XYZ\`.
   VD: \`{#each data.dynamicData.services as service}\` thay vì gõ tay từng cái.

LUẬT CHO CẤU TRÚC CMS (schema):
1. Dựa trên các dữ liệu động bạn dùng ở mã nguồn Svelte, hãy định nghĩa cấu trúc mảng JSON để CMS tạo trang Admin tương ứng.
2. Form schema của chúng tôi cần id (tương ứng với trường dữ liệu), label (tên hiển thị), và type (loại dữ liệu).
3. Đảm bảo cấu trúc schema đủ để người dùng nhập được toàn bộ dữ liệu cần thiết cho giao diện bạn vừa vẽ.

Hãy TRẢ VỀ CHỈ MỘT CHUỖI JSON ĐÚNG CHUẨN, không có \`\`\`json ở đầu.`;

export async function GET() {
    return json({ systemPrompt: SYSTEM_PROMPT });
}

export async function POST({ request, cookies, locals }) {
    // Only authenticated admins can generate sites
    await requireAuth(request, cookies, ['admin']);

    const { mode, prompt, apiKey, provider, manualPayload } = await request.json();

    try {
        let generatedUi = '';
        let generatedSchema = [];

        if (mode === 'manual') {
            if (!manualPayload) {
                return json({ message: 'Thiếu dữ liệu JSON thủ công' }, { status: 400 });
            }
            
            // Allow parsing even if they pasted markdown ```json ... ```
            let cleanPayload = manualPayload.trim();
            if (cleanPayload.startsWith('```json')) {
                cleanPayload = cleanPayload.replace(/^```json/, '').replace(/```$/, '').trim();
            } else if (cleanPayload.startsWith('```')) {
                cleanPayload = cleanPayload.replace(/^```/, '').replace(/```$/, '').trim();
            }

            const parsed = JSON.parse(cleanPayload);
            if (!parsed.ui || !parsed.schema) {
                throw new Error("JSON không hợp lệ. Phải chứa 'ui' và 'schema'");
            }
            generatedUi = parsed.ui;
            generatedSchema = parsed.schema;
            
        } else {
            // Auto API Mode
            if (!prompt || !apiKey) {
                return json({ message: 'Missing prompt or apiKey' }, { status: 400 });
            }

            if (provider === 'gemini') {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            response_mime_type: 'application/json',
                        }
                    })
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error?.message || 'Gemini API Error');
                }

                const data = await res.json();
                const textResponse = data.candidates[0].content.parts[0].text;
                
                const parsed = JSON.parse(textResponse);
                generatedUi = parsed.ui;
                generatedSchema = parsed.schema;
            } else {
                return json({ message: 'Provider not fully implemented yet' }, { status: 400 });
            }
        }

        // 1. Save UI to (public) layout or page
        const storage = core.getStorage(locals.domain);
        
        // Ensure scripts tag contains data import
        const svelteCode = `<script>
    let { data } = $props();
</script>

${generatedUi}`;

        await storage.writeFile(`src/routes/(public)/+page.svelte`, svelteCode, 'utf-8');

        // 2. Save schema to the tenant's dynamic configuration
        await storage.writeFile(`src/content/${locals.domain}/schema.json`, JSON.stringify({
            _generatedBy: 'AI-Builder',
            fields: generatedSchema
        }, null, 2), 'utf-8');

        // 3. Setup a mock data structure so the frontend doesn't crash before first save
        const mockData = { dynamicData: {} };
        generatedSchema.forEach(field => {
            if (field.type === 'text' || field.type === 'rich-text') mockData.dynamicData[field.id] = 'Generated Content';
            if (field.type === 'number') mockData.dynamicData[field.id] = 0;
            if (field.type === 'image') mockData.dynamicData[field.id] = 'https://placehold.co/600x400';
            // Simple array handling for repetitive blocks
            if (field.id.endsWith('s') || field.id.endsWith('List')) {
                mockData.dynamicData[field.id] = [];
            }
        });
        await storage.writeFile(`src/content/${locals.domain}/dynamicData.json`, JSON.stringify(mockData, null, 2), 'utf-8');
        
        // Also overwrite layout server load to provide this data to public routes
        const layoutServerCode = `
import { core } from '$lib/server/core';

export async function load({ locals }) {
    const storage = core.getStorage(locals.domain);
    let dynamicData = {};
    try {
        const raw = await storage.readFile('src/content/' + locals.domain + '/dynamicData.json', 'utf-8');
        if (raw) dynamicData = JSON.parse(raw).dynamicData || JSON.parse(raw);
    } catch(e) { /* ignore */ }

    return {
        domain: locals.domain,
        dynamicData
    };
}
`;
        await storage.writeFile(`src/routes/(public)/+layout.server.js`, layoutServerCode, 'utf-8');

        return json({ success: true, message: 'Website generated successfully' });
    } catch (err) {
        return json({ message: err.message }, { status: 500 });
    }
}
