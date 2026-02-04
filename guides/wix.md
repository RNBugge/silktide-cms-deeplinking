# Wix → Silktide deep-link integration template

**Silktide support:** Custom (customer-built)  
**Recommended deep-link approach:** Not feasible (no reliable per-page editor link)

Use this guide to enable Silktide’s **Edit** button to deep-link users from a page in Silktide to the correct editor screen in **Wix**.

## How editing works in this CMS
Wix does not expose a stable, per-page editor URL that can be derived from the public URL in a way Silktide can use. Editors typically navigate via the Wix dashboard and site editor.

## Recommended approach and why
Deep linking to edit a specific page is generally not feasible; Wix uses editor/session context. Consider linking to the site dashboard only, or skip edit links.

In this case, we recommend one of these alternatives:
- Link the **Edit** button to a general CMS dashboard/home (less precise), or
- Skip deep linking and rely on your internal workflow to locate pages from their public URL.

## What Silktide needs
Silktide needs a URL that an editor should visit to edit **this specific public page** in your CMS. When a user clicks **Edit** in Silktide, they are sent to that `editorUrl` (and may be prompted to log in).

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
