import { NextRequest, NextResponse } from 'next/server';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xlgwboov';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { type, reaction, feedback, name, contact } = body;

    // Build the Formspree payload with named fields
    const formData: Record<string, string> = {
      _subject: type === 'interest'
        ? `Novacoin — ${name} wants to stay in the loop`
        : `Novacoin — New ${reaction || 'feedback'} response`,
      Submission_type: type === 'interest' ? 'Interest (join conversation)' : 'Feedback',
    };

    if (reaction) {
      const labels: Record<string, string> = {
        yes: 'YES, I\'D TRY IT',
        maybe: 'MAYBE — TELL ME MORE',
        dontget: 'I DON\'T GET IT YET',
        no: 'NOT FOR ME',
      };
      formData.Reaction = `${reaction} — ${labels[reaction] || reaction}`;
    }

    if (feedback?.trim()) {
      formData.Feedback = feedback.trim();
    }

    if (name?.trim()) {
      formData.Name = name.trim();
    }

    if (contact?.trim()) {
      formData['Email_or_WhatsApp'] = contact.trim();
    }

    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Formspree error:', res.status, errText);
      return NextResponse.json({ error: 'Failed to submit' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Feedback API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
