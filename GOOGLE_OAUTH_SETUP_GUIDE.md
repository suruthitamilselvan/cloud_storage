# 🔑 How to Setup Real Live Google OAuth 2.0 Sign-In for CloudVault

To enable **real live Google Sign-In** where clicking **"Continue with Google"** opens your laptop's actual Google Account picker directly on Google's servers (`accounts.google.com`), follow these 4 simple steps to get a free **Google OAuth Client ID**.

---

## 📌 Step 1: Open Google Cloud Console

1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Sign in with your Google Account (`suruthitamilselvan10@gmail.com`).
3. Click **Select a project** (or **Create Project**) at the top and name it **CloudVault**.

---

## 📌 Step 2: Configure OAuth Consent Screen (One-time setup)

1. Navigate to **APIs & Services** > **OAuth consent screen** on the left menu.
2. Select **User Type**: **External** and click **Create**.
3. Fill in basic details:
   - **App name**: `CloudVault`
   - **User support email**: `suruthitamilselvan10@gmail.com`
   - **Developer contact email**: `suruthitamilselvan10@gmail.com`
4. Click **Save and Continue** through Scopes and Test Users.

---

## 📌 Step 3: Create Web OAuth 2.0 Client ID

1. Navigate to **APIs & Services** > **Credentials**.
2. Click **+ CREATE CREDENTIALS** at the top and select **OAuth client ID**.
3. Select **Application type**: **Web application**.
4. Set **Name**: `CloudVault Web Client`
5. Under **Authorized JavaScript origins**, click **+ ADD URI** and add:
   ```text
   http://localhost:3000
   ```
6. Under **Authorized redirect URIs**, click **+ ADD URI** and add:
   ```text
   http://localhost:3000
   ```
7. Click **CREATE**. A popup will display your **Client ID** (it ends with `.apps.googleusercontent.com`).

---

## 📌 Step 4: Add Client ID to CloudVault `.env` File

Open [`frontend/.env`](file:///d:/internship/frontend/.env) in your editor and replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your new Client ID:

```env
VITE_GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
```

---

## ✅ What Happens After Adding Your Client ID:

1. When you click **Continue with Google**, the official **Google Identity Services (GIS)** popover will immediately trigger directly from `accounts.google.com`.
2. It will display all signed-in Google accounts on your laptop (`suruthitamilselvan10@gmail.com`, `st7616@srmist.edu.in`, etc.).
3. Selecting any account authenticates your real Google email address securely with a verified Google ID Token (JWT)!
