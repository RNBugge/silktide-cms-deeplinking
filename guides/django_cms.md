# django CMS → Silktide deep-link integration template

**Silktide support:** Custom (customer-built)  
**Recommended deep-link approach:** URL transform (derive editor URL from public URL)

Use this guide to enable Silktide’s **Edit** button to deep-link users from a page in Silktide to the correct editor screen in **django CMS**.

## How editing works in this CMS
django CMS provides a front-end editing toolbar for authenticated editors. Many setups can enter edit mode by adding a query flag (implementation varies).

## Recommended approach and why
Many setups allow entering edit mode by appending ?edit to the current page URL (logged-in editors).

### URL transform rule
**Example:** Public: https://example.com/page → Editor: https://example.com/page?edit

If this works in your environment, you can configure Silktide to derive the editor URL from the public URL using the rule above.

### Fallback if URL transform does not work
If your CMS requires internal IDs (and you cannot derive them from the public URL), use the **Meta tag** strategy instead.

## What Silktide needs
Silktide needs a URL that an editor should visit to edit **this specific public page** in your CMS. When a user clicks **Edit** in Silktide, they are sent to that `editorUrl` (and may be prompted to log in).

## Meta tag (fallback option)
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
No internal IDs needed if your project supports an edit-mode query flag; otherwise deep link to Django admin requires page IDs.

### Example editor URL patterns
- `URL transform (depends on setup): {PUBLIC_URL}?edit`

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
