document.getElementById('sortAsc').addEventListener('click', () => {
  const col = parseInt(document.getElementById('colNum').value);
  if (!isNaN(col) && col >= 0 && col <= 39) {
    console.log("Sorting up by column:", col);
    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
      browser.tabs.sendMessage(tabs[0].id, {action: "sort", column: col, order: "asc"});
    });
  }
});

document.getElementById('sortDesc').addEventListener('click', () => {
  const col = parseInt(document.getElementById('colNum').value);
  if (!isNaN(col) && col >= 0 && col <= 39) {
    console.log("Sorting down by column:", col);
    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
      browser.tabs.sendMessage(tabs[0].id, {action: "sort", column: col, order: "desc"});
    });
  }
});

document.getElementById('exportBtn').addEventListener('click', () => {
  console.log("Exporting all data to CSV...");
  browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
    browser.tabs.sendMessage(tabs[0].id, {action: "export"});
  });
});

document.getElementById('filterBtn').addEventListener('click', () => {
  const value = document.getElementById('filterInput').value.trim();
  if (value) {
    console.log("Applying filter with keyword:", value);
    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
      browser.tabs.sendMessage(tabs[0].id, {action: "filter", keyword: value});
    });
  }
});

document.getElementById('groupBtn').addEventListener('click', () => {
  const colsInput = document.getElementById('groupCols').value;
  const cols = colsInput.split(',')
    .map(c => parseInt(c.trim()))
    .filter(c => !isNaN(c) && c >= 0 && c <= 39);

  console.log("Grouping by columns:", cols);

  if (cols.length > 0) {
    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
      browser.tabs.sendMessage(tabs[0].id, {action: "group", columns: cols});
    });
  } else {
    console.warn("No valid columns specified for grouping.");
  }
});

document.getElementById('reloadBtn').addEventListener('click', () => {
  console.log("Reloading current page...");
  browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
    browser.tabs.reload(tabs[0].id);
  });
});

document.getElementById('exportGroupBtn').addEventListener('click', () => {
  console.log("Exporting selected group...");
  browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
    browser.tabs.sendMessage(tabs[0].id, {action: "exportGroup"});
  });
});
