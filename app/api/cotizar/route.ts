import { NextRequest, NextResponse } from 'next/server';

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

export async function GET() {
  // Healthcheck sencillo para comprobar que la ruta existe
  return NextResponse.json({ ok: true, method: 'GET' });
}

export async function POST(req: NextRequest) {
  try {
    // Cargamos 'resend' de forma diferida para poder capturar 'module not found'
    const { Resend } = await import('resend').catch((e) => {
      throw new Error('Dependencia "resend" no instalada. Ejecuta: npm i resend');
    });

    const body = await req.json().catch(() => ({}));
    const { name, email, phone, message, items } = body as {
      name?: string;
      email?: string;
      phone?: string;
      message?: string;
      items?: CartItem[];
    };

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ ok: false, error: 'Falta RESEND_API_KEY en variables de entorno' }, { status: 500 });
    }
    if (!process.env.COTIZACION_TO_EMAIL) {
      return NextResponse.json({ ok: false, error: 'Falta COTIZACION_TO_EMAIL en variables de entorno' }, { status: 500 });
    }

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
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${price !== null ? new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(price) : '-'}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${total !== null ? new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(total) : '-'}</td>
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
        <p style="text-align:right;margin-top:12px"><strong>Subtotal:</strong> ${new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(subtotal)}</p>
      </div>
    `;

    const resend = new Resend(process.env.RESEND_API_KEY!);
    const to = process.env.COTIZACION_TO_EMAIL!.split(',').map(s => s.trim()).filter(Boolean);
    const subject = `Nueva cotización: ${name || 'Cliente'} (${safeItems.length} ítems)`;

    await resend.emails.send({
      from: process.env.COTIZACION_FROM_EMAIL || 'Cotizaciones <no-reply@resend.dev>',
      to,
      reply_to: email || undefined,
      subject,
      html,
    });

    if (process.env.COTIZACION_COPY_TO_CLIENT === 'true' && email) {
      await resend.emails.send({
        from: process.env.COTIZACION_FROM_EMAIL || 'Cotizaciones <no-reply@resend.dev>',
        to: [email],
        subject: 'Hemos recibido tu solicitud de cotización',
        html: `<p>Hola ${name || ''},</p><p>Hemos recibido tu solicitud y te contactaremos a la brevedad.</p>${html}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    // Devolvemos SIEMPRE JSON para evitar el “Unexpected token '<'”
    return NextResponse.json({ ok: false, error: err?.message || 'Error desconocido' }, { status: 500 });
  }
}
