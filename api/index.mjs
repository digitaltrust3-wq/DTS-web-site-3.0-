import app from "../server/app.mjs";

// Vercel rewrites nested API URLs to this single function. Restore the public
// pathname before Express evaluates its routes and preserve the query string.
export default function handler(request, response) {
  const currentUrl = new URL(request.url || "/api", "https://internal.invalid");
  const nestedPath = currentUrl.searchParams.get("_path");
  currentUrl.searchParams.delete("_path");

  if (nestedPath) {
    const query = currentUrl.searchParams.toString();
    request.url = `/api/${nestedPath}${query ? `?${query}` : ""}`;
  }

  return app(request, response);
}
