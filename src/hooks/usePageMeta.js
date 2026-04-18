import { useEffect } from "react";

/**
 * Sets page-level SEO meta tags for each route.
 * Since this is a React SPA, we dynamically update <title> and meta tags
 * so each page has unique SEO information when rendered client-side.
 *
 * @param {Object} options
 * @param {string} options.title - Page title
 * @param {string} [options.description] - Meta description
 * @param {string} [options.canonicalPath] - Path portion for canonical URL (e.g. "/pricing")
 */
export default function usePageMeta({ title, description, canonicalPath }) {
  useEffect(() => {
    // Set document title
    document.title = title;

    // Update or create meta description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", description);
      } else {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        metaDesc.setAttribute("content", description);
        document.head.appendChild(metaDesc);
      }
    }

    // Update OG tags
    const ogTags = {
      "og:title": title,
      "og:description": description,
      "og:url": canonicalPath
        ? `https://paliavote.com${canonicalPath}`
        : undefined,
    };

    for (const [property, content] of Object.entries(ogTags)) {
      if (!content) continue;
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (tag) {
        tag.setAttribute("content", content);
      }
    }

    // Update Twitter tags
    const twitterTags = {
      "twitter:title": title,
      "twitter:description": description,
      "twitter:url": canonicalPath
        ? `https://paliavote.com${canonicalPath}`
        : undefined,
    };

    for (const [name, content] of Object.entries(twitterTags)) {
      if (!content) continue;
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (tag) {
        tag.setAttribute("content", content);
      }
    }

    // Update canonical link
    if (canonicalPath) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute("href", `https://paliavote.com${canonicalPath}`);
      }
    }
  }, [title, description, canonicalPath]);
}
