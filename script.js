const list = document.querySelector("#repository-list");
const status = document.querySelector("#status");
const count = document.querySelector("#entry-count");

function makeElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function sanitizeText(value, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  const text = value.trim();
  return text || fallback;
}

function normalizeRepositoryUrl(rawUrl) {
  if (typeof rawUrl !== "string") {
    return "";
  }

  try {
    const url = new URL(rawUrl);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function formatStarredDate(rawDate) {
  if (typeof rawDate !== "string" || !rawDate.trim()) {
    return "";
  }

  const dateValue = new Date(`${rawDate}T00:00:00`);
  if (Number.isNaN(dateValue.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(dateValue);
}

function renderRepository(repository) {
  const item = document.createElement("li");
  item.className = "repository-item";

  const details = document.createElement("div");
  const repositoryName = sanitizeText(repository?.repository, "Untitled repository");
  const repositoryUrl = normalizeRepositoryUrl(repository?.url);

  const link = repositoryUrl
    ? makeElement("a", "repository-name", repositoryName)
    : makeElement("span", "repository-name", repositoryName);

  if (repositoryUrl) {
    link.href = repositoryUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  const description = makeElement(
    "p",
    "repository-description",
    sanitizeText(repository?.description, "No description available.")
  );
  details.append(link, description);

  const metadata = document.createElement("div");
  metadata.className = "repository-meta";

  const language = sanitizeText(repository?.language);
  if (language) {
    metadata.append(makeElement("span", "repository-language", language));
  }

  const starredDate = formatStarredDate(repository?.starredAt);
  if (starredDate) {
    const date = document.createElement("time");
    date.dateTime = repository?.starredAt;
    date.textContent = starredDate;
    metadata.append(date);
  }

  item.append(details, metadata);
  return item;
}

async function loadRepositories() {
  try {
    if (window.location.protocol === "file:") {
      throw new Error("Open the page from a local web server before loading events.json.");
    }

    const response = await fetch("events.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }

    const repositories = await response.json();
    if (!Array.isArray(repositories)) {
      throw new Error("Repository data must be a list.");
    }

    const validRepositories = repositories.filter((repository) => {
      return repository && typeof repository === "object" && (
        sanitizeText(repository.repository, "") || sanitizeText(repository.url, "")
      );
    });

    list.replaceChildren(...validRepositories.map(renderRepository));
    count.textContent = String(validRepositories.length).padStart(2, "0");
    status.textContent = validRepositories.length
      ? ""
      : "No starred repositories yet.";
    status.classList.remove("is-error");
  } catch (error) {
    status.classList.add("is-error");
    status.textContent = window.location.protocol === "file:"
      ? "Open this page from a local web server to load the repository list."
      : "Could not load repositories. Please try again later.";
    console.error("Could not load events.json:", error);
  }
}

loadRepositories();