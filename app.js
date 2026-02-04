const $ = (id) => document.getElementById(id);

let CMS = [];
let active = null;
let activeMarkdown = "";
let userTheme = null;

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
    card.innerHTML = `
      <div class="cardTop">
        <div>
          <div class="cardTitle">${c.name}</div>
          <div class="cardSub">${c.category} • ${c.silktide_support === "built_in" ? "Silktide built-in" : "Customer-built"}</div>
        </div>
        <span class="badge ${badgeClass(c.edit_link_strategy)}">${c.edit_link_strategy.replaceAll("_"," ")}</span>
      </div>
      <div class="cardSub" style="margin-top:10px">${c.notes || ""}</div>
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

  $("copyMd").disabled = true;
  $("openGuide").setAttribute("aria-disabled","true");
  $("openGuide").href = "#";

  try{
    const res = await fetch(c.guide_path, {cache:"no-store"});
    const md = await res.text();
    activeMarkdown = md;
    $("detailBody").innerHTML = marked.parse(md);
    $("copyMd").disabled = false;
    $("openGuide").href = c.guide_path;
    $("openGuide").removeAttribute("aria-disabled");
  }catch(e){
    $("detailBody").innerHTML = `<p class="muted">Could not load guide file. If you're opening this directly from disk, run a local server (see footer).</p>`;
  }
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
