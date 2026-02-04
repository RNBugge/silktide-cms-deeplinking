const $ = (id) => document.getElementById(id);

let CMS = [];
let active = null;
let activeMarkdown = "";
let userTheme = null;

function labelize(value){
  if(!value) return "Not specified";
  return value.replaceAll("_"," ").replaceAll("-", " ");
}

function buildSummary(c){
  return [
    `# ${c.name}`,
    ``,
    `Category: ${c.category || "Not specified"}`,
    `Silktide support: ${labelize(c.silktide_support)}`,
    `Edit link strategy: ${labelize(c.edit_link_strategy)}`,
    `Retest strategy: ${labelize(c.retest_strategy)}`,
    ``,
    `Editor context:`,
    `${c.editor_context || "Not specified"}`,
    ``,
    `Notes:`,
    `${c.notes || "Not specified"}`,
    ``,
    `Original notes:`,
    `${c.notes_original || "Not specified"}`,
  ].join("\n");
}

function applyTheme(theme){
  const root = document.documentElement;
  if(theme === "dark"){
    root.setAttribute("data-theme","dark");
  }else if(theme === "light"){
    root.setAttribute("data-theme","light");
  }else{
    root.removeAttribute("data-theme");
  }
  const btn = $("themeToggle");
  if(btn){
    const isDark = (theme === "dark") || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    btn.setAttribute("aria-pressed", String(isDark));
  }
}

function loadTheme(){
  userTheme = localStorage.getItem("theme");
  applyTheme(userTheme);
}

function badgeClass(strategy){
  return strategy || "not_feasible";
}

function renderList(){
  const q = $("q").value.trim().toLowerCase();
  const support = $("filterSupport").value;
  const edit = $("filterEdit").value;

  const filtered = CMS.filter(c => {
    const matchesQ = !q || (c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
    const matchesSupport = !support || c.silktide_support === support;
    const matchesEdit = !edit || c.edit_link_strategy === edit;
    return matchesQ && matchesSupport && matchesEdit;
  });

  const list = $("list");
  list.innerHTML = "";

  if(filtered.length === 0){
    list.innerHTML = `<div class="muted">No matches.</div>`;
    return;
  }

  filtered.forEach(c => {
    const card = document.createElement("div");
    card.className = "card" + (active && active.slug === c.slug ? " active" : "");
    const tooltip = c.editor_context || c.notes || "";
    card.innerHTML = `
      <div class="cardTop">
        <div>
          <div class="cardTitle">${c.name}</div>
          <div class="cardSub">${c.category} • ${c.silktide_support === "built_in" ? "Silktide built-in" : "Customer-built"}</div>
        </div>
        <span class="badge ${badgeClass(c.edit_link_strategy)}">${c.edit_link_strategy.replaceAll("_"," ")}</span>
      </div>
      <div class="cardSub" style="margin-top:10px">${c.notes || c.editor_context || ""}</div>
      ${tooltip ? `<div class="tooltip" title="${tooltip.replaceAll('"',"&quot;")}">More detail</div>` : ""}
    `;
    card.addEventListener("click", () => selectCMS(c));
    list.appendChild(card);
  });
}

async function selectCMS(c){
  active = c;
  renderList();

  $("detailTitle").textContent = c.name;
  $("detailMeta").innerHTML = `
    <span class="badge ${badgeClass(c.edit_link_strategy)}">${c.edit_link_strategy.replaceAll("_"," ")}</span>
    <span class="badge">${c.silktide_support.replaceAll("_"," ")}</span>
  `;

  const summary = buildSummary(c);
  activeMarkdown = summary;
  $("copyMd").disabled = false;
  $("copyJson").disabled = false;

  $("detailBody").innerHTML = `
    <section class="detailBlock">
      <h3>Integration snapshot</h3>
      <p class="muted">A quick, customer-facing summary plus the technical notes used by the Silktide team.</p>
    </section>
    <section class="detailGrid">
      <div class="detailCard">
        <h4>Support status</h4>
        <p>${labelize(c.silktide_support)}</p>
      </div>
      <div class="detailCard">
        <h4>Edit link strategy</h4>
        <p>${labelize(c.edit_link_strategy)}</p>
      </div>
      <div class="detailCard">
        <h4>Retest approach</h4>
        <p>${labelize(c.retest_strategy)}</p>
      </div>
      <div class="detailCard">
        <h4>Category</h4>
        <p>${c.category || "Not specified"}</p>
      </div>
    </section>
    <section class="detailBlock">
      <h3>Editor context</h3>
      <p>${c.editor_context || "Not specified"}</p>
    </section>
    <section class="detailBlock">
      <h3>Integration notes</h3>
      <p>${c.notes || "Not specified"}</p>
    </section>
    <section class="detailBlock detailNote">
      <h3>Original notes</h3>
      <p>${c.notes_original || "Not specified"}</p>
    </section>
  `;
}

function bind(){
  ["q","filterSupport","filterEdit"].forEach(id => {
    $(id).addEventListener("input", renderList);
    $(id).addEventListener("change", renderList);
  });

  const themeBtn = $("themeToggle");
  if(themeBtn){
    themeBtn.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const next = isDark ? "light" : "dark";
      localStorage.setItem("theme", next);
      userTheme = next;
      applyTheme(next);
    });
  }

  $("copyMd").addEventListener("click", async () => {
    if(!activeMarkdown) return;
    try{
      await navigator.clipboard.writeText(activeMarkdown);
      const btn = $("copyMd");
      const old = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(()=> btn.textContent = old, 900);
    }catch(e){
      alert("Copy failed. Select the text manually from the template.");
    }
  });

  $("copyJson").addEventListener("click", async () => {
    if(!active) return;
    try{
      await navigator.clipboard.writeText(JSON.stringify(active, null, 2));
      const btn = $("copyJson");
      const old = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(()=> btn.textContent = old, 900);
    }catch(e){
      alert("Copy failed. Select the data manually.");
    }
  });
}

async function init(){
  loadTheme();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if(!userTheme){
      applyTheme(null);
    }
  });
  const res = await fetch("cms-data.json", {cache:"no-store"});
  CMS = await res.json();
  bind();
  renderList();
}

init();
