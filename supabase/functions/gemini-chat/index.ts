import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const GEMINI_MODEL = "gemini-2.0-flash"
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

/* ------------------------------------------------------------------ */
/*  System prompt                                                      */
/* ------------------------------------------------------------------ */

function buildSystemPrompt(products: any[]): string {
  const catalog = products.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description?.substring(0, 150),
    price: p.price,
    category: p.category,
    condition: p.condition,
    era: p.era,
    brand: p.brand,
  }))

  return `Ты — AI-консультант винтажного маркетплейса "Galerie du Temps" в Вене, Австрия.
Общайся только на русском языке.

ТВОЯ РОЛЬ:
- Помогаешь покупателям найти идеальную винтажную вещь
- Задаёшь уточняющие вопросы для подбора
- Рекомендуешь конкретные товары из каталога

СТИЛЬ ОБЩЕНИЯ:
- Вежливый, профессиональный, с лёгким энтузиазмом к винтажу
- Краткие ответы (2-4 предложения), не перегружай информацией
- Используй эмодзи умеренно (максимум 1-2 на сообщение)

АЛГОРИТМ РАБОТЫ:
1. Поприветствуй и спроси, что ищет клиент
2. Уточни БЮДЖЕТ (диапазон цен в евро)
3. Уточни СТИЛЬ и ПРЕДПОЧТЕНИЯ (эпоха, категория)
4. Уточни ПОВОД (подарок, для себя, интерьер, коллекция)
5. Предложи 1-3 подходящих товара из каталога

ФОРМАТ РЕКОМЕНДАЦИЙ:
Когда рекомендуешь товар, обязательно укажи его ID в формате [ID:xxx], где xxx — id товара.
Пример: "Рекомендую этот прекрасный портфель [ID:1] — настоящая Италия 60-х!"

ОГРАНИЧЕНИЯ:
- Рекомендуй ТОЛЬКО товары из каталога ниже
- Если подходящих товаров нет — честно скажи об этом
- Не обсуждай цены конкурентов и не торгуйся
- Не давай советов по реставрации или ремонту
- Если вопрос не связан с товарами — вежливо перенаправь к теме покупок

КАТАЛОГ ТОВАРОВ:
${JSON.stringify(catalog)}`
}

/* ------------------------------------------------------------------ */
/*  Handler                                                            */
/* ------------------------------------------------------------------ */

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { messages } = await req.json()

    if (!messages?.length) {
      return new Response(
        JSON.stringify({ error: "No messages provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }

    // Fetch products from Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )

    const { data: products } = await supabase
      .from("products")
      .select(
        "id, title, description, price, category, condition, era, brand, image_url",
      )
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(100)

    // Build prompt & convert messages
    const systemPrompt = buildSystemPrompt(products || [])
    const contents = messages.map(
      (m: { role: string; text: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text }],
      }),
    )

    // Call Gemini
    const geminiKey = Deno.env.get("GEMINI_API_KEY")
    if (!geminiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }

    const geminiRes = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 1024,
        },
      }),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error("Gemini API error:", geminiRes.status, errText)
      return new Response(
        JSON.stringify({
          error:
            geminiRes.status === 429
              ? "Слишком много запросов. Подождите немного."
              : "Ошибка AI-сервиса. Попробуйте позже.",
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }

    const geminiData = await geminiRes.json()
    const reply =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Извините, не удалось сформировать ответ."

    // Extract product IDs from [ID:xxx] markers
    const idMatches = [...reply.matchAll(/\[ID:([^\]]+)\]/g)]
    const recommendedProducts = idMatches
      .map((m: RegExpMatchArray) =>
        (products || []).find((p: any) => String(p.id) === m[1]),
      )
      .filter(Boolean)

    // Clean reply text
    const cleanReply = reply.replace(/\s*\[ID:[^\]]+\]/g, "")

    return new Response(
      JSON.stringify({ reply: cleanReply, products: recommendedProducts }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  } catch (err) {
    console.error("Edge function error:", err)
    return new Response(
      JSON.stringify({
        error: "Ошибка сервера. Попробуйте позже.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
})
