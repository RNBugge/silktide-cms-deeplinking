# Adobe Commerce (Magento) → Silktide deep-link integration template

**Silktide support:** Custom (customer-built)  
**Recommended deep-link approach:** Meta tag (page outputs editor URL)

Use this guide to enable Silktide’s **Edit** button to deep-link users from a page in Silktide to the correct editor screen in **Adobe Commerce (Magento)**.

## How editing works in this CMS
Adobe Commerce (Magento) admin editing is entity-ID based (CMS pages/blocks, products, categories). Public URLs are usually rewritten for SEO and don’t contain the admin IDs.

## Recommended approach and why
Admin edit screens use entity IDs and often require an authenticated session; do not include tokens in editor URLs. Use meta tag with non-tokenized edit URL.

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
Use the entity ID available in your rendering layer (CMS page id, product id, category id) and your admin base URL.

### Example editor URL patterns
- `https://{ADMIN_HOST}/admin/cms/page/edit/page_id/{PAGE_ID}`
- `https://{ADMIN_HOST}/admin/catalog/product/edit/id/{PRODUCT_ID}`
- `https://{ADMIN_HOST}/admin/catalog/category/edit/id/{CATEGORY_ID}`

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
