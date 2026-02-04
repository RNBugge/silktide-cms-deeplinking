# Optimizely CMS → Silktide deep-link integration template

**Silktide support:** Custom (customer-built)  
**Recommended deep-link approach:** Depends (try URL transform, otherwise meta tag)

Use this guide to enable Silktide’s **Edit** button to deep-link users from a page in Silktide to the correct editor screen in **Optimizely CMS**.

## How editing works in this CMS
Optimizely CMS editing generally occurs in the Optimizely edit UI using internal content references/IDs. Some implementations support on-page editing modes that can be entered via a query flag, but this is not universal.

## Recommended approach and why
Optimizely supports on-page editing; some implementations use epieditmode=True on specific CMS URLs (often includes internal IDs). Treat as meta tag by default, but URL transform may work if your preview URLs are deterministic.

Start by testing whether a simple **URL transform** can open edit mode for a page. If it cannot, implement the **Meta tag** strategy.

## What Silktide needs
Silktide needs a URL that an editor should visit to edit **this specific public page** in your CMS. When a user clicks **Edit** in Silktide, they are sent to that `editorUrl` (and may be prompted to log in).

## Meta tag (Silktide “Edit” button)
Silktide reads a per-page meta tag in the HTML `<head>`:

```html
<meta name="silktide-cms" content="BASE64_ENCODED_JSON">
```

The Base64 value must decode to JSON like:

```json
{ "cms": "YOUR_CMS_NAME", "editorUrl": "https://cms.example.com/edit/..." }
```

### Rules
- `editorUrl` must be an absolute URL that opens the editor for **this specific page**.
- Do **not** include authentication tokens, usernames, or any secret values (Base64 is reversible).
- If the editor URL needs internal IDs, generate the meta tag dynamically at render time.

### How to build `editorUrl` in this CMS
If your site supports an edit-mode flag, you may be able to use URL transform. Otherwise use meta tag generated from the current content reference/ID.

### Example editor URL patterns
- `Depends: sometimes {PUBLIC_URL}?epieditmode=true (confirm in your environment)`
- `Otherwise: use meta tag with a link to the edit UI for the current content item.`

### Sample PHP (Base64-encode JSON)
```php
<?php
$payload = [
  "cms" => "YOUR_CMS_NAME",
  "editorUrl" => $editorUrl, // build this per-page
];

$encoded = base64_encode(json_encode($payload));
echo '<meta name="silktide-cms" content="' . htmlspecialchars($encoded, ENT_QUOTES) . '">';
?>
```

(If you don’t use PHP, replicate the same logic in your server-side language.)

## Validation checklist
1. Open **two different pages** on your site and view page source.
2. Search for `silktide-cms` and confirm the meta tag exists in the `<head>` (if using meta-tag strategy).
3. Base64-decode the `content` value and confirm:
   - `cms` is correct
   - `editorUrl` opens the right editor for that page
4. In Silktide, open the page inspector and click **Edit**.

## Security notes
- Base64 is **not** encryption; anyone can decode it.
- Do not embed any values that authenticate a user (tokens, one-time links, usernames).
- The editor URL should rely on normal CMS authentication/session behavior.
