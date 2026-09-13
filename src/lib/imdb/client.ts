/**
 * Lightweight IMDb GraphQL client for title enrichment
 */

export async function getImdbGenres(imdbId: string): Promise<string[]> {
  if (!imdbId) return [];
  try {
    const query = {
      query: `query GetTitleGenres($id: ID!) {
        title(id: $id) {
          genres {
            genres {
              text
            }
          }
        }
      }`,
      variables: { id: imdbId },
    };

    const res = await fetch("https://api.graphql.imdb.com/", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-imdb-client-name": "imdb-web-next",
      },
      body: JSON.stringify(query),
      next: { revalidate: 86400 }, // 24-hour cache
    });

    if (!res.ok) return [];
    const json = await res.json();
    const genres = json.data?.title?.genres?.genres?.map((g: any) => g.text) || [];
    return genres;
  } catch (err) {
    console.error("IMDb genres fetch error:", err);
    return [];
  }
}
