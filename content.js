let originalData = [];
let currentData = [];

function getPreText() {
  const pre = document.querySelector("pre");
  if (pre) {
    return pre.innerText.split("\n").filter(Boolean);
  } else {
    return [...originalData];
  }
}

function setPreText(lines) {
  currentData = [...lines];

  let pre = document.querySelector("pre");

  if (!pre) {
    const container = document.querySelector("div");
    if (container) {
      pre = document.createElement("pre");
      container.parentNode.replaceChild(pre, container);
    }
  }

  if (pre) {
    pre.innerText = lines.join("\n");
  }
}

function sortPreContent(columnIndex, order = 'asc') {
  console.log("Sorting by column:", columnIndex, "order:", order);

  let lines = getPreText();

  lines.sort((a, b) => {
    const aCols = a.split(",").map(s => s.trim());
    const bCols = b.split(",").map(s => s.trim());

    const valA = aCols[columnIndex] || "";
    const valB = bCols[columnIndex] || "";

    if (!isNaN(valA) && !isNaN(valB)) {
      return order === 'asc' ? valA - valB : valB - valA;
    }

    return order === 'asc'
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  setPreText(lines);
}

function exportToCSV() {
  console.log("Exporting all data to CSV...");

  let csvLines = [];

  const groupedContainer = document.querySelector(".grouped-container");

  if (groupedContainer) {
    
    const groups = groupedContainer.querySelectorAll(".grouped-container > div");

    groups.forEach(groupDiv => {
      const title = groupDiv.querySelector("strong").textContent.trim();
      const items = groupDiv.querySelectorAll("li");

      csvLines.push(title);

      items.forEach(item => {
        csvLines.push(item.textContent.trim());
      });

      csvLines.push("");
    });
  } else if (currentData.length > 0) {
    csvLines = [...currentData];
  } else {
    const pre = document.querySelector("pre");
    if (pre) {
      csvLines = pre.innerText.split("\n").filter(Boolean);
    }
  }

  if (csvLines.length === 0) {
    console.warn("No content to export.");
    return;
  }

  const csvContent = csvLines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "arkime-export.csv";
  a.click();

  URL.revokeObjectURL(url);
}

function filterPreContent(keyword) {
  console.log("Filtering by keyword:", keyword);

  let lines = getPreText();
  const lowerKeyword = keyword.toLowerCase();
  lines = lines.filter(line => line.toLowerCase().includes(lowerKeyword));
  setPreText(lines);
}

function groupAndRender(columns) {
  console.log("Grouping by columns:", columns);

  const lines = getPreText();

  if (lines.length === 0) {
    console.warn("No data found in <pre> for grouping!");
    return;
  }

  const grouped = {};

  lines.forEach(line => {
    const parts = line.split(',').map(s => s.trim());

    const key = columns
      .map(col => (parts[col] !== undefined ? parts[col].trim().toLowerCase() : `[missing-col-${col}]`))
      .join(" | ");

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(line);
  });

  // Remove existing content
  const oldPre = document.querySelector("pre");
  const oldContainer = document.querySelector(".grouped-container");

  if (oldContainer) {
    oldContainer.remove();
  }

  const container = document.createElement("div");
  container.className = "grouped-container";
  container.style.padding = "1em";
  container.style.fontFamily = "sans-serif";

  const COLORS = [
    "#ffe0b2", "#c8e6c9", "#bbdefb", "#f8bbd0",
    "#d1c4e9", "#ffecb3", "#b2dfdb", "#ffe0e0", "#f5f5f5"
  ];

  let colorIndex = 0;

  Object.entries(grouped).forEach(([key, groupLines]) => {
    const ruleDiv = document.createElement("div");
    ruleDiv.style.marginBottom = "1.5em";
    ruleDiv.style.borderLeft = "5px solid #4CAF50";
    ruleDiv.style.padding = "1em";
    ruleDiv.style.backgroundColor = COLORS[colorIndex % COLORS.length];
    ruleDiv.style.borderRadius = "5px";

    const title = document.createElement("strong");
    title.textContent = `Group: ${key} (${groupLines.length} items)`;
    ruleDiv.appendChild(title);

    const exportBtn = document.createElement("button");
    exportBtn.textContent = "Export this group";
    exportBtn.style.marginTop = "5px";
    exportBtn.style.fontSize = "0.8em";
    exportBtn.style.border = "none";
    exportBtn.style.padding = "4px 8px";
    exportBtn.style.backgroundColor = "#4CAF50";
    exportBtn.style.color = "white";
    exportBtn.style.borderRadius = "3px";
    exportBtn.style.cursor = "pointer";

    exportBtn.onclick = () => {
	  window.selectedGroup = groupLines;
	  exportGroupToCSV(groupLines);
	};

    ruleDiv.appendChild(exportBtn);

    const list = document.createElement("ul");
    list.style.marginTop = "0.5em";
    groupLines.forEach(line => {
      const item = document.createElement("li");
      item.style.listStyleType = "none";
      item.textContent = line;
      list.appendChild(item);
    });

    ruleDiv.appendChild(list);
    container.appendChild(ruleDiv);

    colorIndex++;
  });

  if (oldPre) {
    oldPre.parentNode.replaceChild(container, oldPre);
  } else if (document.body.firstChild) {
    document.body.insertBefore(container, document.body.firstChild);
  } else {
    document.body.appendChild(container);
  }
}

function exportGroupToCSV(groupLines) {
  console.log("Exporting selected group to CSV...");

  const csv = groupLines.join('\n');
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "arkime-group-export.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function observePreContent() {
  const pre = document.querySelector("pre");
  if (!pre) return;

  const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        console.log("Content in <pre> has changed:", pre.innerText);
        if (window.lastGroupColumns) {
          groupAndRender(window.lastGroupColumns);
        }
      }
    }
  });

  observer.observe(pre, { childList: true, characterData: true, subtree: true });
}

observePreContent();

// Main message handler
browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("Received message from popup:", msg);

  if (msg.action === "sort") {
    setPreText(getPreText());
    sortPreContent(msg.column, msg.order);
  } else if (msg.action === "export") {
    exportToCSV();
  } else if (msg.action === "filter") {
    filterPreContent(msg.keyword);
  } else if (msg.action === "group") {
    window.lastGroupColumns = msg.columns;
    groupAndRender(msg.columns);
  } else if (msg.action === "exportGroup") {
    exportGroupToCSV(window.selectedGroup || []);
  }
});
