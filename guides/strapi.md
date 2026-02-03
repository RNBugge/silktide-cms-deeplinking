# Strapi → Silktide deep-link integration template

**Silktide support:** Custom (customer-built)  
**Recommended deep-link approach:** Meta tag (page outputs editor URL)

Use this template to enable Silktide’s **Edit** button to deep-link users from a page in Silktide to the correct editor screen in **Strapi**.

## CMS-specific considerations
Emit meta tag with collection type + entry ID and Strapi admin URL.

## What Silktide needs
Silktide needs a URL that a user should visit to edit a given public page in your CMS. When a user clicks **Edit** in Silktide, they are sent to that `editorUrl` (and may be prompted to log in).

## Recommended approach
### Use Meta tag (recommended)
Most CMSs use editor URLs that include **internal IDs** (page IDs, entry IDs, GUIDs). Those IDs are usually not present in the public URL, so URL transforms are not reliable.
Use the meta tag format below to output the correct editor URL for each page.

## Meta tag format (Silktide “Edit” button)

Silktide reads a per-page meta tag in the HTML `<head>`:

```html
<meta name="silktide-cms" content="BASE64_ENCODED_JSON">
```

The Base64 value must decode to JSON like:

```json
{ "cms": "YOUR_CMS_NAME", "editorUrl": "https://cms.example.com/edit/..." }
```

**Rules**
- `editorUrl` should be an absolute URL that opens the editor for **this specific page**.
- Do **not** include authentication tokens, usernames, or any secret values (Base64 is reversible).
- If your editor URL requires internal IDs (page/entry GUIDs), generate this tag dynamically at render time.

### Sample PHP (Base64-encode JSON)

If your stack can output server-side HTML, you can use this pattern:

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
2. Search for `silktide-cms` and confirm the meta tag exists in the `<head>`.
3. Base64-decode the `content` value and confirm:
   - `cms` is correct
   - `editorUrl` opens the right CMS editor for that page
4. In Silktide, open a page in the inspector and click **Edit**:
   - If you’re not logged in to the CMS, you may be prompted to log in first.

## Security notes

- Base64 is **not** encryption; anyone can decode it.
- Do not embed any values that authenticate a user (tokens, one-time links, usernames).
- The editor URL should rely on normal CMS authentication/session behavior.
