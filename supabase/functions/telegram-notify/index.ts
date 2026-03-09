import "jsr:@supabase/functions-js/edge-runtime.d.ts"

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const TELEGRAM_API = "https://api.telegram.org/bot"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

/* ------------------------------------------------------------------ */
/*  Message formatters                                                 */
/* ------------------------------------------------------------------ */

function formatNewInquiry(r: Record<string, unknown>): string {
  const lines: string[] = [
    `\u{1F4E9} <b>Новая заявка — Galerie du Temps</b>`,
    ``,
    `\u{1F464} ${r.name || "—"}`,
    `\u{1F4E7} ${r.email || "—"}`,
  ]
  if (r.phone) lines.push(`\u{1F4F1} ${r.phone}`)
  if (r.product_title) lines.push(`\u{1F3F7} Товар: ${r.product_title}`)
  lines.push(``)
  lines.push(`\u{1F4AC} ${truncate(String(r.message || ""), 500)}`)
  lines.push(``)
  lines.push(
    `\u{1F550} ${formatDate(String(r.created_at || new Date().toISOString()))}`,
  )
  return lines.join("\n")
}

function formatAdminReply(r: Record<string, unknown>): string {
  return [
    `\u{2709}\u{FE0F} <b>Ответ отправлен клиенту</b>`,
    ``,
    `\u{1F4CB} Тикет: ${r.inquiry_name || "—"}`,
    `\u{270D}\u{FE0F} Автор: ${r.author || "admin"}`,
    ``,
    `\u{1F4AC} ${truncate(String(r.content || ""), 500)}`,
  ].join("\n")
}

function formatStatusChange(r: Record<string, unknown>): string {
  const statusEmoji: Record<string, string> = {
    new: "\u{1F7E2}",
    open: "\u{1F535}",
    pending: "\u{1F7E1}",
    on_hold: "\u{1F7E0}",
    solved: "\u{2705}",
    closed: "\u{26AB}",
  }
  const emoji = statusEmoji[String(r.new_status)] || "\u{1F504}"
  return [
    `${emoji} <b>Статус изменён</b>`,
    ``,
    `\u{1F4CB} ${r.inquiry_name || "Тикет"}`,
    `${r.from_status || "—"} \u{2192} <b>${r.new_status || "—"}</b>`,
    `\u{270D}\u{FE0F} ${r.changed_by || "admin"}`,
  ].join("\n")
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function truncate(text: string, max: number): string {
  return text.length > max ? text.substring(0, max) + "..." : text
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ru-RU", {
      timeZone: "Asia/Almaty",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
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
    const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")
    const CHAT_ID = Deno.env.get("TELEGRAM_ADMIN_CHAT_ID")

    if (!BOT_TOKEN || !CHAT_ID) {
      console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID")
      return new Response(
        JSON.stringify({ error: "Telegram not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }

    const { type, record } = await req.json()

    if (!type || !record) {
      return new Response(
        JSON.stringify({ error: "Missing type or record" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }

    // Format message based on type
    let text: string
    switch (type) {
      case "new_inquiry":
        text = formatNewInquiry(record)
        break
      case "admin_reply":
        text = formatAdminReply(record)
        break
      case "status_change":
        text = formatStatusChange(record)
        break
      default:
        return new Response(
          JSON.stringify({ error: `Unknown type: ${type}` }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        )
    }

    // Send via Telegram Bot API
    const tgRes = await fetch(`${TELEGRAM_API}${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    })

    if (!tgRes.ok) {
      const errBody = await tgRes.text()
      console.error("Telegram API error:", tgRes.status, errBody)
      return new Response(
        JSON.stringify({ error: "Telegram send failed", status: tgRes.status }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }

    const tgData = await tgRes.json()
    return new Response(
      JSON.stringify({ success: true, message_id: tgData.result?.message_id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  } catch (err) {
    console.error("telegram-notify error:", err)
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  }
})
