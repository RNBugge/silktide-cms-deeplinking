# Craft CMS → Silktide deep-link integration template

**Silktide support:** Built-in (Silktide)  
**Recommended deep-link approach:** Built-in


**Silktide guide:** https://help.silktide.com/en/articles/8020842-how-to-integrate-silktide-with-craft-cms-3

Use this guide to enable Silktide’s **Edit** button to deep-link users from a page in Silktide to the correct editor screen in **Craft CMS**.

## How editing works in this CMS
Built-in Craft CMS integration (guide references Craft CMS 3).

## Recommended approach and why
Silktide has a **built-in** integration for this CMS. Use the Silktide guide above to enable deep links (no custom meta-tag work required unless your setup is unusual).

## What Silktide needs
Silktide needs a URL that an editor should visit to edit **this specific public page** in your CMS. When a user clicks **Edit** in Silktide, they are sent to that `editorUrl` (and may be prompted to log in).

## Notes for unusual setups
If your CMS instance uses a custom authoring domain, custom routing, or multiple environments, you may need to adjust settings so the **Edit** link points to the correct authoring environment.

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
