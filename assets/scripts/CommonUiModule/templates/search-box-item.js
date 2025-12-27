export default function(data) {
  return `<div>
  <div class="SG-search-item__summary">
    <span class="SG-search-item__summary-label">${data.name}</span>
    <span class="SG-search-item__summary-caption">${data.section}</span>
  </div>
  <div class="SG-search-item__details">
    <span class="SG-search-item__details-name">${data.name}</span>
    <div class="SG-search-item__details-preview">
      ${data.preview}
    </div>
    <div class="SG-search-item__details-meta">
      Type: ${data.type}<br>
      Section: ${data.section}<br>
      Element: ${data.descriptor}
    </div>
  </div>
</div>`;
}
