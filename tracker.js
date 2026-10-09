const select = document.getElementById("countrySelect");
const searchButton = document.getElementById("searchButton");
const universityList = document.getElementById("universityList");
const status = document.getElementById("status");
const resultsTitle = document.getElementById("resultsTitle");
const resultCount = document.getElementById("resultCount");
const filterBar = document.getElementById("filterBar");
const nameFilter = document.getElementById("nameFilter");
const clearFilter = document.getElementById("clearFilter");
let universities = [];
const directoryUrl = "https://cdn.jsdelivr.net/gh/Hipo/university-domains-list@master/world_universities_and_domains.json";

async function loadCountries() {
  try {
    const response = await fetch("./data.json");
    if (!response.ok) throw new Error("Country list unavailable");
    const countries = await response.json();
    countries.sort((a, b) => a.name.localeCompare(b.name)).forEach(({ name }) => {
      const option = document.createElement("option"); option.value = name; option.textContent = name; select.append(option);
    });
  } catch { showStatus("We couldn't load the country list.", "Please refresh the page and try again."); }
}
function showStatus(title, message, loading = false) {
  universityList.replaceChildren(); status.className = `empty-state${loading ? " loading" : ""}`; status.hidden = false;
  status.innerHTML = `<span class="empty-icon" aria-hidden="true">${loading ? "…" : "✦"}</span><h3>${title}</h3><p>${message}</p>`;
}
function displayUniversities() {
  const query = nameFilter.value.trim().toLowerCase();
  const visible = universities.filter(university => university.name.toLowerCase().includes(query));
  universityList.replaceChildren(); resultCount.textContent = `${visible.length} ${visible.length === 1 ? "university" : "universities"}`;
  if (!visible.length) { showStatus("No matches yet", "Try a different university name or clear your filter."); resultCount.hidden = true; return; }
  status.hidden = true; resultCount.hidden = false;
  const fragment = document.createDocumentFragment();
  visible.forEach((university, index) => {
    const card = document.createElement("article"); card.className = "university-card"; card.style.animationDelay = `${Math.min(index * 35, 280)}ms`;
    const top = document.createElement("div"); top.className = "card-top";
    const name = document.createElement("h3"); name.textContent = university.name;
    const tag = document.createElement("span"); tag.className = "country-tag"; tag.textContent = university.country;
    const web = university.web_pages?.[0] || "";
    const domain = document.createElement("p");
    try { domain.textContent = web ? new URL(web).hostname.replace("www.", "") : "Website unavailable"; } catch { domain.textContent = "Website unavailable"; }
    top.append(name, tag); card.append(top, domain);
    if (web) { const link = document.createElement("a"); link.href = web; link.target = "_blank"; link.rel = "noopener noreferrer"; link.textContent = "Visit official website ↗"; card.append(link); }
    fragment.append(card);
  });
  universityList.append(fragment);
}
async function getUniversities() {
  const country = select.value;
  if (!country) { showStatus("Choose a destination first", "Select a country above to see its universities."); return; }
  searchButton.disabled = true; showStatus(`Looking in ${country}…`, "Finding universities for you.", true);
  resultsTitle.textContent = `Universities in ${country}`; filterBar.hidden = true; resultCount.hidden = true;
  try {
    // The original Hipo search server is offline. Use its maintained data file
    // from a CDN, then filter the directory locally for the selected country.
    const response = await fetch(directoryUrl);
    if (!response.ok) throw new Error("Directory request failed");
    const directory = await response.json();
    universities = directory.filter(university => university.country === country);
    nameFilter.value = ""; filterBar.hidden = false; displayUniversities();
  } catch { universities = []; showStatus("We couldn't complete that search", "Check your connection and try again in a moment."); }
  finally { searchButton.disabled = false; }
}
searchButton.addEventListener("click", getUniversities);
select.addEventListener("change", getUniversities);
nameFilter.addEventListener("input", displayUniversities);
clearFilter.addEventListener("click", () => { nameFilter.value = ""; displayUniversities(); nameFilter.focus(); });
loadCountries();
