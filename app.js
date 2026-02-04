const $ = (id) => document.getElementById(id);

let CMS = [];
let active = null;
let activeMarkdown = "";
let userTheme = null;

function labelize(value){
  if(!value) return "Not specified";
  return value.replaceAll("_"," ").replaceAll("-", " ");
}

function renderMarkdown(value){
  if(!value) return "";
  if(typeof marked !== "undefined"){
    return marked.parse(value);
  }
  return value;
}

function editorContextText(value){
  if(!value) return "";
  if(typeof value === "string") return value;
  if(typeof value === "object"){
    const parts = [];
    if(value.strategy) parts.push(`Strategy: ${labelize(value.strategy)}`);
    if(value.silktide_support) parts.push(`Support: ${labelize(value.silktide_support)}`);
    if(value.primary_docs) parts.push(`Docs: ${value.primary_docs}`);
    return parts.join(" • ") || JSON.stringify(value);
  }
  return String(value);
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
    `${editorContextText(c.editor_context) || "Not specified"}`,
    ``,
    `Notes:`,
    `${c.notes || "Not specified"}`,
    ``,
    `Original notes:`,
    `${c.notes_original || "Not specified"}`,
  ].join("\n");
}

function getTemplate(c){
  if(c.template_md) return c.template_md;
  return buildSummary(c);
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
    const editStrategy = c.edit_link_strategy || "not_feasible";
    const card = document.createElement("div");
    card.className = "card" + (active && active.slug === c.slug ? " active" : "");
    const editorText = editorContextText(c.editor_context);
    const tooltip = editorText || c.notes || "";
    card.innerHTML = `
      <div class="cardTop">
        <div>
          <div class="cardTitle">${c.name}</div>
          <div class="cardSub">${c.category} • ${c.silktide_support === "built_in" ? "Silktide built-in" : "Customer-built"}</div>
        </div>
        <span class="badge ${badgeClass(editStrategy)}">${labelize(editStrategy)}</span>
      </div>
      <div class="cardSub" style="margin-top:10px">${renderMarkdown(c.notes || editorText || "")}</div>
      ${tooltip ? `<div class="tooltip" title="${tooltip.replaceAll('"',"&quot;")}">More detail</div>` : ""}
    `;
    card.addEventListener("click", () => selectCMS(c));
    list.appendChild(card);
  });
}

async function selectCMS(c){
  active = c;
  renderList();

  const editStrategy = c.edit_link_strategy || "not_feasible";
  const editorText = editorContextText(c.editor_context);

  $("detailTitle").textContent = c.name;
  $("detailMeta").innerHTML = `
    <span class="badge ${badgeClass(editStrategy)}">${labelize(editStrategy)}</span>
    <span class="badge">${labelize(c.silktide_support)}</span>
  `;

  const template = getTemplate(c);
  activeMarkdown = template;
  $("copyMd").disabled = false;
  $("copyJson").disabled = false;

  $("detailBody").innerHTML = renderMarkdown(template);
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
