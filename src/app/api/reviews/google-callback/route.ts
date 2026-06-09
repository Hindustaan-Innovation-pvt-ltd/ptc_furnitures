import { NextResponse } from "next/server";
import { updateGoogleConnection, syncGoogleReviews } from "@/lib/reviews";

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json({ success: false, error: "No authorization code found" }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${origin}/api/reviews/google-callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ success: false, error: "OAuth environment variables are missing" }, { status: 500 });
    }

    // Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return NextResponse.json({ success: false, error: tokenData.error_description || "Token exchange failed" }, { status: 400 });
    }

    const accessToken = tokenData.access_token;

    // Retrieve the authenticated user's profile info
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userData = await userRes.json();

    if (!userRes.ok) {
      return NextResponse.json({ success: false, error: "Failed to fetch user profile" }, { status: 400 });
    }

    const email = userData.email || "unknown@google.com";
    const name = "Pankaj Trading Co.";

    // Connect the Google profile in the MongoDB settings database
    await updateGoogleConnection({
      isConnected: true,
      accountEmail: email,
      businessName: name,
      lastSyncedAt: new Date().toLocaleString(),
    });

    // Run sync reviews
    await syncGoogleReviews(name);

    // Return HTML to update parent UI and close the popup window
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Google Authentication Success</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #1e293b; text-align: center; padding: 50px 20px; }
          .container { max-width: 400px; margin: 0 auto; background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
          h2 { color: #16a34a; font-size: 20px; font-weight: 800; margin-bottom: 8px; }
          p { font-size: 13.5px; color: #475569; margin-bottom: 24px; }
          .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #2563eb; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 0 auto; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Connection Successful!</h2>
          <p>Connected to <strong>${email}</strong>.<br>Synchronizing reviews for Pankaj Trading Co...</p>
          <div class="spinner"></div>
          <p style="color: #94a3b8; font-size: 11px; margin-top: 24px; margin-bottom: 0;">This window will close automatically.</p>
        </div>
        <script>
          setTimeout(function() {
            if (window.opener) {
              window.opener.postMessage({ type: 'GOOGLE_CONNECTED' }, window.opener.location.origin);
            }
            window.close();
          }, 1500);
        </script>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
