const list = document.querySelector("#repository-list");
const status = document.querySelector("#status");
const count = document.querySelector("#entry-count");

function makeElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function renderRepository(repository) {
  const item = document.createElement("li");
  item.className = "repository-item";

  const details = document.createElement("div");
  const link = makeElement("a", "repository-name", repository.repository);
  link.href = repository.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  const description = makeElement(
    "p",
    "repository-description",
    repository.description
  );
  details.append(link, description);

  const metadata = document.createElement("div");
  metadata.className = "repository-meta";
  metadata.append(makeElement("span", "repository-language", repository.language));

  const date = document.createElement("time");
  date.dateTime = repository.starredAt;
  date.textContent = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(`${repository.starredAt}T00:00:00`));
  metadata.append(date);

  item.append(details, metadata);
  return item;
}

async function loadRepositories() {
  try {
    const response = await fetch("events.json");
    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }

    const repositories = await response.json();
    if (!Array.isArray(repositories)) {
      throw new Error("Repository data must be a list.");
    }

    list.replaceChildren(...repositories.map(renderRepository));
    count.textContent = String(repositories.length).padStart(2, "0");
    status.textContent = repositories.length
      ? ""
      : "No starred repositories yet.";
  } catch (error) {
    status.classList.add("is-error");
    status.textContent = "Could not load repositories. Please try again later.";
    console.error("Could not load events.json:", error);
  }
}

loadRepositories();