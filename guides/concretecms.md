# Concrete CMS (Concrete5) → Silktide deep-link integration template

**Silktide support:** Custom (customer-built)  
**Recommended deep-link approach:** Depends (try URL transform, otherwise meta tag)

Use this guide to enable Silktide’s **Edit** button to deep-link users from a page in Silktide to the correct editor screen in **Concrete CMS (Concrete5)**.

## How editing works in this CMS
Concrete CMS editing happens either inline (for logged-in editors) or via dashboard composer with internal IDs. Public URL alone usually isn’t enough for a deterministic dashboard deep link.

## Recommended approach and why
Some sites use on-page editing (same URL for editors), others route through dashboard pages with cID. If you can reliably derive edit mode from public URL, use transform; otherwise meta tag with page ID.

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
If using a dashboard deep link, use the page ID. If inline editing is enabled, you may be able to deep link to the same URL and rely on the editor bar.

### Example editor URL patterns
- `Dashboard edit (example): https://{SITE}/index.php/dashboard/sitemap/full#page:{PAGE_ID}`

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
