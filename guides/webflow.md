# Webflow → Silktide deep-link integration template

**Silktide support:** Custom (customer-built)  
**Recommended deep-link approach:** Not feasible (no reliable per-page editor link)

Use this guide to enable Silktide’s **Edit** button to deep-link users from a page in Silktide to the correct editor screen in **Webflow**.

## How editing works in this CMS
Webflow’s Designer/Editor deep links rely on internal identifiers (e.g., pageId in Designer URLs). Public URLs generally cannot be converted into those editor links without maintaining a mapping (often via API).

## Recommended approach and why
Webflow editing URLs are not reliably derivable from public URLs without internal IDs; deep linking to a specific page is typically not feasible.

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
