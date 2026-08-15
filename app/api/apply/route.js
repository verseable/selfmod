import { NextResponse } from "next/server";
import { QUESTIONS, SERVER_NAME } from "../../questions";

const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;
const MAX_EMBED = 5800; // safety margin under Discord's 6000-char embed limit

function clip(str, max) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max - 12) + "... [cut]" : str;
}

export async function POST(req) {
  if (!WEBHOOK) {
    return NextResponse.json(
      {
        error:
          "This form isn't connected yet. An admin needs to add the Discord webhook.",
      },
      { status: 500 }
    );
  }

  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json(
      { error: "We couldn't read your application. Please try again." },
      { status: 400 }
    );
  }

  // Honeypot: a filled hidden field means a bot. Pretend it worked, send nothing.
  if (data._gotcha) {
    return NextResponse.json({ ok: true });
  }

  // Server-side validation of required questions.
  const missing = QUESTIONS.filter(
    (q) => q.required && !String(data[q.name] || "").trim()
  ).map((q) => q.label);

  if (missing.length) {
    return NextResponse.json(
      { error: `Please answer: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  // Build embed fields from answered questions.
  const rawFields = QUESTIONS.filter((q) =>
    String(data[q.name] || "").trim()
  ).map((q) => ({
    name: clip(q.label, 256),
    value: clip(String(data[q.name]).trim(), 1024),
    inline: Boolean(q.inline),
  }));

  const applicant = clip(String(data.discordUsername || "Unknown").trim(), 200);
  const description = `**${applicant}** applied to join the ${SERVER_NAME} staff team.`;
  const footerText = `${SERVER_NAME} · Moderator applications`;

  // Keep the whole embed comfortably under Discord's 6000-char ceiling.
  let used = description.length + footerText.length + 120;
  const fields = [];
  for (const f of rawFields) {
    const cost = f.name.length + f.value.length + 8;
    if (used + cost > MAX_EMBED) {
      const room = MAX_EMBED - used - f.name.length - 30;
      if (room > 40) {
        fields.push({ ...f, value: f.value.slice(0, room) + "... [cut]" });
      }
      break;
    }
    used += cost;
    fields.push(f);
  }

  const embed = {
    title: "New moderator application",
    description,
    color: 0x5865f2,
    fields: fields.slice(0, 25),
    timestamp: new Date().toISOString(),
    footer: { text: footerText },
  };

  try {
    const res = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: `${SERVER_NAME} Applications`,
        embeds: [embed],
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Discord webhook failed:", res.status, body);
      return NextResponse.json(
        {
          error:
            "We couldn't deliver your application. Please try again in a moment.",
        },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("Webhook request error:", err);
    return NextResponse.json(
      {
        error:
          "We couldn't deliver your application. Please try again in a moment.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
