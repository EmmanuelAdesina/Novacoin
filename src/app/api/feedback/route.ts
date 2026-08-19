import { NextRequest, NextResponse } from 'next/server';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xlgwboov';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { type, q1_what_is_it, q2_use_cases, q3_why_not, q4_would_try, open_feedback, name, contact } = body;

    const labels: Record<string, string> = {
      'digital-money': 'Digital money',
      investment: 'An investment',
      'payment-app': 'A payment app',
      'not-sure': "I'm honestly not sure",
      'send-friends': 'Send money to friends',
      hold: 'Hold it',
      pay: 'Pay for things',
      receive: 'Receive money',
      'send-family': 'Send money to family',
      communities: 'Use it with online communities',
      'no-use': "I don't see a use for it yet",
      'bank-transfer': 'I already use bank transfers',
      'no-trust': "I don't trust digital assets",
      'dont-understand': "I don't understand them",
      'lose-money': 'I would worry about losing money',
      scams: 'I would worry about scams',
      'no-need': "I don't see the need",
      other: 'Something else',
      yes: 'YES - I\'D TRY IT',
      maybe: 'MAYBE - I\'M NOT CONVINCED',
      no: "NO - I DON'T SEE THE POINT",
    };

    const formData: Record<string, string> = {
      _subject: type === 'interest'
        ? `Novacoin — ${name || 'Someone'} wants updates`
        : `Novacoin — New validation response`,
      Submission_type: type === 'interest' ? 'Interest (stay posted)' : 'Feedback (questionnaire)',
    };

    if (q1_what_is_it) {
      formData.Q1_What_is_NovaCoin = labels[q1_what_is_it] || q1_what_is_it;
    }

    if (q2_use_cases?.length) {
      formData.Q2_Would_use_for = q2_use_cases.map((v: string) => labels[v] || v).join(', ');
    }

    if (q3_why_not) {
      formData.Q3_Why_not = labels[q3_why_not] || q3_why_not;
    }

    if (q4_would_try) {
      formData.Q4_Would_try = labels[q4_would_try] || q4_would_try;
    }

    if (open_feedback?.trim()) {
      formData.Open_feedback = open_feedback.trim();
    }

    if (name?.trim()) {
      formData.Name = name.trim();
    }

    if (contact?.trim()) {
      formData['WhatsApp_or_Email'] = contact.trim();
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
