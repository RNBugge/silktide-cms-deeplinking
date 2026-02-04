# HubSpot CMS → Silktide deep-link integration template

**Silktide support:** Custom (customer-built)  
**Recommended deep-link approach:** Meta tag (page outputs editor URL)

Use this guide to enable Silktide’s **Edit** button to deep-link users from a page in Silktide to the correct editor screen in **HubSpot CMS**.

## How editing works in this CMS
HubSpot CMS editing happens inside the HubSpot app and editor URLs are driven by portal/account identifiers and internal content IDs. Public URLs don’t include those IDs.

## Recommended approach and why
HubSpot editor URLs include portal ID and content ID. If your templates can access these IDs, emit meta tag; otherwise edit deep links may be limited.

Because the editor URL typically requires internal IDs (page ID / entry ID / UUID), a simple URL transform is not reliable. The most dependable approach is to output a **per-page meta tag** containing the correct editor URL.

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
Use HubSpot’s page/blog content identifiers available in server-side rendering or via HubSpot APIs, then build an app URL for editing the content.

### Example editor URL patterns
- `https://app.hubspot.com/website/{PORTAL_ID}/pages/{CONTENT_ID}/edit`
- `httpss: https://app.hubspot.com/website/{PORTAL_ID}/blog/{CONTENT_ID}/edit`

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
