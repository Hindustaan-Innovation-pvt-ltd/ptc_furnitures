import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    // Render a helpful guide on how to configure Google OAuth in the environment
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Google OAuth Setup Required</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #1e293b; padding: 40px 20px; line-height: 1.5; }
          .container { max-width: 550px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
          h2 { color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.025em; }
          p { font-size: 14px; color: #475569; }
          ol { font-size: 13.5px; color: #334155; padding-left: 20px; }
          li { margin-bottom: 10px; }
          code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #0f172a; border: 1px solid #e2e8f0; }
          pre { background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px dashed #cbd5e1; font-family: monospace; font-size: 11px; margin-top: 8px; overflow-x: auto; color: #0f172a; }
          .btn { display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; margin-top: 16px; cursor: pointer; border: none; transition: background-color 0.2s; }
          .btn:hover { background: #1d4ed8; }
          .btn-secondary { background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0; margin-left: 8px; }
          .btn-secondary:hover { background: #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Google OAuth Setup Required</h2>
          <p>To connect a real Google account, you must configure a Google OAuth Client ID and Secret in your project's <code>.env</code> file.</p>
          
          <h4 style="margin-bottom: 8px; color: #0f172a; font-size: 14px; font-weight: 700;">Setup Instructions:</h4>
          <ol>
            <li>Go to the <a href="https://console.cloud.google.com/" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 600;">Google Cloud Console Credentials Page</a>.</li>
            <li>Create or select your project, click <strong>Create Credentials</strong>, and choose <strong>OAuth client ID</strong>.</li>
            <li>Select <strong>Web application</strong> as the Application type.</li>
            <li>Under <strong>Authorized redirect URIs</strong>, add:<br>
              <code style="display: inline-block; margin-top: 4px;">${origin}/api/reviews/google-callback</code>
            </li>
            <li>Click Save, and copy the <strong>Client ID</strong> and <strong>Client Secret</strong>.</li>
            <li>Open the <code>.env</code> file in your workspace and add:
              <pre>GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret</pre>
            </li>
            <li>Restart your development server (<code>npm run dev</code>).</li>
          </ol>
          
          <div style="margin-top: 24px; border-t: 1px solid #f1f5f9; pt: 16px;">
            <button class="btn" onclick="window.location.reload();">Retry Connection</button>
            <button class="btn btn-secondary" onclick="window.close();">Close Window</button>
          </div>
        </div>
      </body>
      </html>
    `;
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  }

  const redirectUri = `${origin}/api/reviews/google-callback`;
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`;

  return NextResponse.redirect(authUrl);
}
