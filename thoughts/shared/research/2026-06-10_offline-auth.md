# Offline / Network Error Handling in Auth — Research

**Date:** 2026-06-10
**Goal:** Handle offline/network errors in auth with a clear Turkish user message.

---

## Finding 1 — signinAsGuest console.error presence

**File:** `context/AuthContext.js`, line 243

```js
} catch (error) {
  console.error("Error during guest sign-in:", error);  // line 243 — present
  throw error;
}
```

**Conclusion:** YES, `console.error` is present and fires on every error including network failures. The task requires removing/silencing it since the UI already surfaces the error via toast.

---

## Finding 2 — react-native-appwrite error shape on network failure

**SDK:** `node_modules/react-native-appwrite/dist/cjs/sdk.js`

AppwriteException definition (lines 77–85):
```js
class AppwriteException extends Error {
  constructor(message, code = 0, type = '', response = '') {
    super(message);
    this.name = 'AppwriteException';
    this.message = message;
    this.code = code;
    this.type = type;
    this.response = response;
  }
}
```

Client.call() catch (lines 469–474):
```js
catch (e) {
  if (e instanceof AppwriteException) { throw e; }
  throw new AppwriteException(e.message);  // wraps plain fetch Error
}
```

When the device is offline, React Native's `fetch` throws a plain `Error` with `message = "Network request failed"`. The SDK wraps it:

| Property | Value on network failure |
|----------|--------------------------|
| `.name`  | `"AppwriteException"` |
| `.message` | `"Network request failed"` |
| `.code` | `0` (default — no HTTP status) |
| `.type` | `""` |
| `.response` | `""` |

Both `createEmailPasswordSession()` and `createAnonymousSession()` go through `client.call()` and produce the same shape.

**Detection condition:** `error.code === 0` is reliable. Adding `error.message?.toLowerCase().includes("network")` as belt-and-suspenders is the established project pattern.

---

## Finding 3 — Current error surfacing in signin.jsx

**Email signin catch (lines 92–98):**
```js
} catch (error) {
  if (error.code === "EMAIL_NOT_VERIFIED") {
    setNotVerified(true);
    showToast.info("E-postanı doğrula", "...");
  } else {
    showToast.error("Giriş başarısız", "E-posta veya şifre hatalı");
  }
}
```
No network branch — offline shows the same "wrong credentials" message.

**Guest signin inline catch (lines 219–225):**
```js
onPress={async () => {
  try {
    await signinAsGuest();
  } catch {
    showToast.error("Hata", "Misafir girişi başarısız");
  }
}}
```
No error inspection at all — offline shows the same generic message.

---

## Existing pattern to follow

`app/signup.jsx` (lines 157–163) and `app/forgot-password.jsx` (lines 77–79) already use:
```js
if (error.code === 0 || error.message?.toLowerCase().includes("network")) {
  showToast.error("Ağ Hatası", "İnternet bağlantınızı kontrol edin.");
} else { /* ... */ }
```

---

## Proposed minimal fix

### (a) Remove guest console.error — `context/AuthContext.js` line 243
```js
// Before:
} catch (error) {
  console.error("Error during guest sign-in:", error);
  throw error;
}
// After:
} catch (error) {
  throw error;
}
```

### (b) Add network branch to email signin — `app/signin.jsx` handleEmailSignin catch
```js
} catch (error) {
  if (error.code === "EMAIL_NOT_VERIFIED") {
    setNotVerified(true);
    showToast.info("E-postanı doğrula", "Giriş yapmadan önce e-postandaki doğrulama linkine tıkla.");
  } else if (error.code === 0 || error.message?.toLowerCase().includes("network")) {
    showToast.error("İnternet bağlantısı yok", "Bağlantını kontrol edip tekrar dene.");
  } else {
    showToast.error("Giriş başarısız", "E-posta veya şifre hatalı");
  }
}
```

### (c) Add network branch to guest signin — `app/signin.jsx` inline catch
```js
} catch (error) {
  if (error.code === 0 || error.message?.toLowerCase().includes("network")) {
    showToast.error("İnternet bağlantısı yok", "Bağlantını kontrol edip tekrar dene.");
  } else {
    showToast.error("Hata", "Misafir girişi başarısız");
  }
}
```
Note: the inline catch needs to receive the `error` object — change `catch {` to `catch (error) {`.

---

## Files to touch

| File | Change |
|------|--------|
| `context/AuthContext.js:243` | Remove `console.error(...)` line |
| `app/signin.jsx:95–98` | Add network branch to handleEmailSignin catch |
| `app/signin.jsx:222–224` | Change `catch {` to `catch (error) {`; add network branch |

No new imports needed. No new tokens needed.

---

**RESEARCH_READY**
