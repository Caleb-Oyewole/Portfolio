# Make newsletter + contact emails actually send (free, no domain needed)

Why: locally your Gmail SMTP attempt timed out, and free hosts like Render block SMTP ports.
Brevo sends over HTTPS, so it works everywhere.

1. Sign up at https://www.brevo.com (free: 300 emails/day).
2. Brevo -> Senders, Domains & Dedicated IPs -> Senders -> add your Gmail address and click the verification link they email you.
3. Brevo -> SMTP & API -> API Keys -> generate a key.
4. In portfolio-backend/backend/.env (never commit it):

       BREVO_API_KEY=your-key
       MAIL_FROM=Caleb <your-verified-gmail@gmail.com>
       CONTACT_INBOX=your-verified-gmail@gmail.com
       FRONTEND_URL=http://localhost:5173        # your deployed frontend URL in production

   Leave SMTP_HOST empty. (If BREVO_API_KEY is set it takes priority.)
5. Restart uvicorn (--reload does not watch .env), subscribe from the site, and the confirm email arrives in the inbox.

No key set? Emails are just printed in the terminal, so you can still copy the confirm link while developing.

Check it works: from portfolio-backend/backend run `python send_test_email.py you@gmail.com` (prints the real error if it fails).
