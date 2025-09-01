import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

type CartItem = {
  id: string;
  brand?: string;
  model?: string;
  price?: number | null;
  quantity: number;
  blurb?: string;
  image?: string;
  category?: string;
};

function currency(n: number) {
  try { return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n); }
  catch { return `$${n}`; }
}

export async function GET() {
  // Healthcheck simple
  return NextResponse.json({ ok: true, method: 'GET' });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, phone, message, items } = body as {
      name?: string; email?: string; phone?: string; message?: string; items?: CartItem[];
    };

    const safeItems: CartItem[] = Array.isArray(items) ? items : [];
    const rows = safeItems.map((it, i) => {
      const qty = it.quantity ?? 1;
      const price = typeof it.price === 'number' ? it.price : null;
      const total = price !== null ? price * qty : null;
      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${i + 1}</td>
          <td style="padding:8px;border-bottom:1px solid #eee">${it.brand || ''}</td>
          <td style="padding:8px;border-bottom:1px solid #eee"><strong>${it.model || it.id}</strong></td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${qty}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${price !== null ? currency(price) : '-'}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${total !== null ? currency(total) : '-'}</td>
        </tr>
      `;
    }).join('');
    const subtotal = safeItems.reduce((acc, it) => acc + ((typeof it.price === 'number' ? it.price : 0) * (it.quantity ?? 1)), 0);

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif">
        <h2>Nueva solicitud de cotización</h2>
        <p><strong>Nombre:</strong> ${name || ''}</p>
        <p><strong>Email:</strong> ${email || ''}</p>
        <p><strong>Teléfono:</strong> ${phone || ''}</p>
        ${message ? `<p><strong>Mensaje:</strong> ${message}</p>` : ''}

        <h3>Ítems solicitados</h3>
        <table style="border-collapse:collapse;width:100%">
          <thead>
            <tr>
              <th style="text-align:left;padding:8px;border-bottom:1px solid #ccc">#</th>
              <th style="text-align:left;padding:8px;border-bottom:1px solid #ccc">Marca</th>
              <th style="text-align:left;padding:8px;border-bottom:1px solid #ccc">Modelo</th>
              <th style="text-align:center;padding:8px;border-bottom:1px solid #ccc">Cant.</th>
              <th style="text-align:right;padding:8px;border-bottom:1px solid #ccc">Precio</th>
              <th style="text-align:right;padding:8px;border-bottom:1px solid #ccc">Total</th>
            </tr>
          </thead>
          <tbody>${rows || '<tr><td colspan="6" style="padding:8px">Sin ítems</td></tr>'}</tbody>
        </table>
        <p style="text-align:right;margin-top:12px"><strong>Subtotal:</strong> ${currency(subtotal)}</p>
      </div>
    `;

    // --------- Transporter para Zoho Mail ---------
    // Zoho (global): smtp.zoho.com (587 STARTTLS o 465 SSL/TLS)
    // Si usas Zoho EU: smtp.zoho.eu
    const host = process.env.SMTP_HOST || 'smtp.zoho.com';
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true'; // true => 465

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,                  // 465 = true, 587 = false
      requireTLS: !secure,     // fuerza STARTTLS cuando no es 465
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
      // logger: true,
      // debug: true,
    });

    // Verificar credenciales/conexión antes de enviar
    await transporter.verify();

    const toList = (process.env.COTIZACION_TO_EMAIL || '').split(',').map(s => s.trim()).filter(Boolean);
    if (toList.length === 0) throw new Error('Define COTIZACION_TO_EMAIL en .env.local');

    const fromAddr = process.env.COTIZACION_FROM_EMAIL || `Cotizaciones <${process.env.SMTP_USER}>`;
    const subject = `Nueva cotización: ${name || 'Cliente'} (${safeItems.length} ítems)`;

    await transporter.sendMail({
      from: fromAddr,
      to: toList,
      replyTo: email || undefined,
      subject,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Error desconocido' }, { status: 500 });
  }
}
