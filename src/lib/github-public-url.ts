/** Pure URL gate: catalog `private` + repo name, no GitHub API. */

export const PUBLIC_GITHUB_LOGIN = "duketopceo";

export function publicGithubUrl(
  isPrivate: boolean,
  repoName: string,
  accountLogin: string = PUBLIC_GITHUB_LOGIN
): string | null {
  if (isPrivate) return null;
  const name = repoName.trim();
  if (!name) return null;
  return `https://github.com/${accountLogin}/${name}`;
}
