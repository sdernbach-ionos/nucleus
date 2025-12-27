export default function(data) {
  return `<div class="SG-color-preview">
  <div class="SG-color-preview__circle" style="background-color: ${data.color}; border-color: ${data.darker}"></div>
  <div class="SG-color-preview__typo" style="color: ${data.color}">Aa</div>
</div>`;
}
