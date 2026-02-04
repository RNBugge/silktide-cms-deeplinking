# Cascade CMS (Hannon Hill) → Silktide deep-link integration template

**Silktide support:** Custom (customer-built)  
**Recommended deep-link approach:** Meta tag (page outputs editor URL)

Use this guide to enable Silktide’s **Edit** button to deep-link users from a page in Silktide to the correct editor screen in **Cascade CMS** by **Hannon Hill**.

## How editing works in this CMS
Cascade CMS is an enterprise CMS where content items (pages, blocks, files, etc.) are managed as **assets** inside the Cascade UI. The URL you use to edit an item in Cascade typically includes an **internal asset identifier** (an ID) and sometimes an asset type.

Public site URLs are usually path-based (e.g., `/about/`) and do **not** include that internal asset ID.

## Recommended approach and why
Because the Cascade editor URL is typically **asset-ID based**, Silktide usually cannot convert a public URL into an editor URL using a simple string transformation (host swap / path rewrite / query flag).

The most reliable approach is to output a **per-page `<meta name="silktide-cms">` tag** that contains the exact `editorUrl` for the current page (including its internal asset ID).

## What Silktide needs
Silktide needs a URL that an editor should visit to edit **this specific public page** in Cascade CMS. When a user clicks **Edit** in Silktide, they are sent to that `editorUrl` (and may be prompted to log in).

## Meta tag (Silktide “Edit” button)
Silktide reads a per-page meta tag in the HTML `<head>`:

```html
<meta name="silktide-cms" content="BASE64_ENCODED_JSON">
```

The Base64 value must decode to JSON like:

```json
{ "cms": "Cascade CMS", "editorUrl": "https://cms.example.edu/entity/open.act?type=page&id=12345" }
```

### Rules
- `editorUrl` must be an **absolute URL** that opens the editor for **this specific page**.
- Do **not** include authentication tokens, usernames, or any secret values (Base64 is reversible).
- Generate the meta tag **dynamically per page** if the editor URL needs an internal asset ID.

### How to build `editorUrl` in this CMS
1. In Cascade CMS, open a page in the editor and copy the URL from your browser.
2. Identify the **asset ID** and (if present) the **asset type** in that URL.
3. In your site template/layout (the part that renders `<head>`), build the editor URL for the current page by inserting the current page’s asset ID.

> Cascade’s templating varies by implementation (Velocity/JSP/XML). Most implementations can access a page’s internal identifier in the rendering context or metadata. If you’re unsure which variable provides the asset ID, search your Cascade template documentation for “page id”, “asset id”, or “identifier”, or ask your Cascade implementer.

### Example editor URL patterns
Your exact editor URL may differ depending on your Cascade version and configuration. Common shapes include:
- `https://{CMS_HOST}/entity/open.act?type=page&id={ASSET_ID}`
- `https://{CMS_HOST}/entity/open.act?type=page&id={ASSET_ID}&siteId={SITE_ID}`

Use the pattern you see in your own Cascade UI when editing a page.

### Sample PHP (Base64-encode JSON)
```php
<?php
$payload = [
  "cms" => "Cascade CMS",
  "editorUrl" => $editorUrl, // build this per-page
];

$encoded = base64_encode(json_encode($payload));
echo '<meta name="silktide-cms" content="' . htmlspecialchars($encoded, ENT_QUOTES) . '">';
?>
```

(If you don’t use PHP, replicate the same logic in your server-side language.)

## Validation checklist
1. Open **two different pages** on your site and view page source.
2. Search for `silktide-cms` and confirm the meta tag exists in the `<head>`.
3. Base64-decode the `content` value and confirm:
   - `cms` is correct (e.g., `Cascade CMS`)
   - `editorUrl` differs between pages (different `{ASSET_ID}`)
   - Opening `editorUrl` takes you to the correct page editor in Cascade (after login)
4. In Silktide, open the page inspector and click **Edit**.

## Security notes
- Base64 is **not** encryption; anyone can decode it.
- Do not embed any values that authenticate a user (tokens, one-time links, usernames).
- The editor URL should rely on normal CMS authentication/session behavior.
