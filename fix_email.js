const fs = require('fs');
let content = fs.readFileSync('lib/email.ts', 'utf8');

// Add wrapper
const wrapper = `import { createAdminClient } from '@/lib/supabase/server'

async function sendWithLog(template_name: string, to: string, subject: string, html: string) {
  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html })
    const admin = createAdminClient()
    await admin.from('email_logs').insert({
      template_name, recipient: to, subject, status: error ? 'error' : 'success', error: error ? error.message : null
    })
    if (error) console.error(\`[Email Error] \${template_name} to \${to}:\`, error)
    return { data, error }
  } catch (err: any) {
    console.error(\`[Email Exception] \${template_name} to \${to}:\`, err)
    return { data: null, error: err }
  }
}
`;

content = content.replace(/const APP_URL =.*?\n/, match => match + '\n' + wrapper);

// Replace 1: BuyerCredentials
content = content.replace(
  /return resend\.emails\.send\(\{\s*from: FROM,\s*to: opts\.to,\s*subject: ('.*?'),\s*html: `([\s\S]*?)`,\s*\}\)/,
  'return sendWithLog("BuyerCredentials", opts.to, $1, `$2`)'
);

// Replace 2: ExhibitorCredentials
content = content.replace(
  /return resend\.emails\.send\(\{\s*from: FROM,\s*to: opts\.to,\s*subject: ('.*?'),\s*html: `([\s\S]*?)`,\s*\}\)/,
  'return sendWithLog("ExhibitorCredentials", opts.to, $1, `$2`)'
);

// Replace 3: MeetingConfirmation
content = content.replace(
  /return resend\.emails\.send\(\{\s*from: FROM,\s*to: opts\.to,\s*subject: (`.*?`),\s*html: `([\s\S]*?)`,\s*\}\)/,
  'return sendWithLog("MeetingConfirmation", opts.to, $1, `$2`)'
);

// Replace 4: BookingNotification
content = content.replace(
  /return resend\.emails\.send\(\{\s*from: FROM,\s*to: opts\.to,\s*subject: (`.*?`),\s*html: `([\s\S]*?)`,\s*\}\)/,
  'return sendWithLog("BookingNotification", opts.to, $1, `$2`)'
);

fs.writeFileSync('lib/email.ts', content);
console.log('Fixed lib/email.ts');
