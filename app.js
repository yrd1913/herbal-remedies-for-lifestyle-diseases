(function () {
  const guide = window.symptomGuide || { diseases: [], symptoms: [], mappings: [] };
  const normalise = (value) => String(value || "").trim().toLocaleLowerCase();
  const diseasesById = new Map((guide.diseases || []).map((entry) => [entry.id, entry]));
  const mappedSymptomIds = new Set((guide.mappings || []).map((entry) => entry[1]));
  const symptoms = (guide.symptoms || [])
    .filter((entry) => mappedSymptomIds.has(entry.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  function symptomUrl(symptom) {
    return `results.html?symptom=${encodeURIComponent(symptom.name)}`;
  }

  function setUpHome() {
    const options = document.getElementById("symptom-options");
    const chips = document.getElementById("symptom-chips");
    if (!options || !chips) return;

    symptoms.forEach((symptom, index) => {
      const option = document.createElement("option");
      option.value = symptom.name;
      options.append(option);

      const link = document.createElement("a");
      link.href = symptomUrl(symptom);
      link.className = "symptom-chip";
      link.textContent = symptom.name;
      if (index >= 24) link.hidden = true;
      chips.append(link);
    });

    const showButton = document.getElementById("show-symptoms");
    if (showButton && symptoms.length > 24) {
      showButton.hidden = false;
      showButton.textContent = `Show all ${symptoms.length} symptoms`;
      showButton.addEventListener("click", () => {
        chips.querySelectorAll("[hidden]").forEach((chip) => { chip.hidden = false; });
        showButton.hidden = true;
      });
    }
  }

  function makeTextElement(tag, text, className) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = text;
    return element;
  }

  function makeConditionCard(condition) {
    const card = document.createElement("article");
    card.className = "condition-card";
    const titleBlock = document.createElement("header");
    titleBlock.className = "condition-header";
    titleBlock.append(
      makeTextElement("p", "Guide entry associated with this symptom", "condition-kicker"),
      makeTextElement("h3", condition.name)
    );

    const remedies = document.createElement("section");
    remedies.className = "condition-detail remedies-detail";
    remedies.append(makeTextElement("h4", "Herbal remedies"));
    const remedyTags = document.createElement("div");
    remedyTags.className = "remedy-tags";
    (condition.remedies || []).forEach((remedy) => remedyTags.append(makeTextElement("span", remedy)));
    remedies.append(remedyTags);

    const care = document.createElement("section");
    care.className = "condition-detail";
    care.append(makeTextElement("h4", "Care at home"), makeTextElement("p", condition.care));

    const doctor = document.createElement("section");
    doctor.className = "condition-detail doctor-detail";
    doctor.append(makeTextElement("h4", "When to see a doctor"), makeTextElement("p", condition.doctor));

    card.append(titleBlock, remedies, care, doctor);
    return card;
  }

  function setUpResults() {
    const name = document.getElementById("symptom-name");
    if (!name) return;

    const searchValue = new URLSearchParams(window.location.search).get("symptom") || "";
    const symptom = symptoms.find((entry) => normalise(entry.name) === normalise(searchValue));
    const relatedDiseaseIds = new Set(
      (guide.mappings || []).filter((entry) => symptom && entry[1] === symptom.id).map((entry) => entry[0])
    );
    const matches = [...relatedDiseaseIds].map((id) => diseasesById.get(id)).filter(Boolean);
    const resultContent = document.getElementById("result-content");
    const noResult = document.getElementById("no-result");

    if (!matches.length) {
      name.textContent = "your symptom";
      noResult.hidden = false;
      return;
    }

    name.textContent = symptom.name;
    document.getElementById("result-summary").textContent = `The supplied workbook links this symptom with ${matches.length} guide ${matches.length === 1 ? "entry" : "entries"}. Review each entry carefully; a symptom alone cannot identify a condition.`;
    document.getElementById("match-count").textContent = `${matches.length} ${matches.length === 1 ? "match" : "matches"}`;

    const results = document.getElementById("condition-results");
    matches.forEach((condition) => results.append(makeConditionCard(condition)));
    resultContent.hidden = false;
  }

  setUpHome();
  setUpResults();
})();

