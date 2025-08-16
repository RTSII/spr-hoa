// Replace document.write with safer alternatives
const content = '<div>Dynamic Content</div>'
const target = document.getElementById('target-element')
if (target) {
  target.innerHTML = content
} else {
  console.error('Target element not found')
}
