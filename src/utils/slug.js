const slugifySegment = (value) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const buildGroupSlug = (username, groupName) => {
  const usernameSlug = slugifySegment(username);
  const groupNameSlug = slugifySegment(groupName);

  return `/${usernameSlug}-${groupNameSlug}`;
};

module.exports = { slugifySegment, buildGroupSlug };
