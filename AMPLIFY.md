# Deploy the frontend on AWS Amplify Hosting (required by the challenge)

1. AWS console -> **AWS Amplify** -> **Create new app** -> **GitHub** -> authorise -> pick `Caleb-Oyewole/Portfolio`, branch `main`.
2. Tick **"My app is a monorepo"** and set the app root to `portfolio-frontend`. The root `amplify.yml` already holds the build settings (`npm install`, `npm run build`, output `dist`).
3. **Environment variables:** add `VITE_API_URL` = your backend's HTTPS address (for example the CloudFront URL from the EC2 guide), no trailing slash and no `/api`.
   Without it the site still loads with its built-in content, but projects from GitHub will not appear.
4. Save and deploy. Wait for the green build, then open the `https://main.xxxxxx.amplifyapp.com` URL.
5. **Single-page-app rewrite** (so `/admin` and the newsletter links work on refresh): Amplify -> Hosting -> **Rewrites and redirects** -> Open text editor, add:

       [{ "source": "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>", "target": "/index.html", "status": "200", "condition": null }]

6. Backend: once the EC2/CloudFront address works, set `FRONTEND_URL` and `CORS_ORIGINS` on the server to the Amplify URL, then `sudo systemctl restart portfolio`.
7. Every `git push` to `main` redeploys the site automatically.

For the Builder Center project write-up, note the AWS services used: Amplify Hosting (frontend), EC2 (API), CloudFront (HTTPS in front of the API).
