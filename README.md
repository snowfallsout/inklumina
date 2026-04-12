# Colorfield

Live MBTI particle-art display. Phones scan a QR on the big screen, submit their MBTI type, and particles bloom on the canvas.

## Quick start

```bash
npm install
node server.js
# Open http://localhost:3000 on the PC
```

---

## Running for on-site phone scanning

Phones must reach the PC over WiFi. Follow these steps once per venue.

### 1 — Find the PC's LAN IPv4

Open **PowerShell** or **cmd** and run:

```
ipconfig
```

Look for the **Wireless LAN adapter Wi-Fi** section → **IPv4 Address**, e.g. `192.168.0.68`.

### 2 — Set the IP in the display

1. Open `http://localhost:3000` on the PC.
2. Click **⊕ 新场次 / 历史** (bottom-centre button) to open the session panel.
3. Enter `192.168.0.68` (or `192.168.0.68:3000`) in the IP field.
4. Click **生成二维码**.

The QR in the panel updates, and the corner QR on the main screen updates immediately — no page reload needed.

### 3 — Allow port 3000 through Windows Firewall

Run this once in an **admin PowerShell**:

```powershell
New-NetFirewallRule -DisplayName "Colorfield 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### 4 — Set WiFi to Private network

Windows blocks inbound connections on **Public** networks.

- Open **Settings → Network & Internet → Wi-Fi → [your network] → Properties**
- Set **Network profile type** to **Private**.

### 5 — Test

On a phone connected to the same WiFi, scan either QR. It should open `http://192.168.0.68:3000/mobile.html`.
