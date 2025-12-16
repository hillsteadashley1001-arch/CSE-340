document.addEventListener("DOMContentLoaded", () => {
  const classificationList = document.getElementById("classificationList")
  const inventoryDisplay = document.getElementById("inventoryDisplay")

  if (!classificationList || !inventoryDisplay) return

  classificationList.addEventListener("change", async () => {
    const classificationId = classificationList.value
    if (!classificationId) {
      inventoryDisplay.innerHTML = ""
      return
    }

    try {
      const response = await fetch(`/inv/getInventory/${classificationId}`)

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }

      const data = await response.json()
      inventoryDisplay.innerHTML = buildInventoryTable(data)
    } catch (error) {
      console.error("Error fetching inventory:", error)
      inventoryDisplay.innerHTML =
        "<p class='error'>Unable to load inventory. Please try again.</p>"
    }
  })
})

/**
 * Build inventory table HTML
 */
function buildInventoryTable(items) {
  if (!items || !items.length) {
    return "<p>No inventory items found.</p>"
  }

  let table = `
    <table>
      <thead>
        <tr>
          <th>Make</th>
          <th>Model</th>
          <th>Modify</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
  `

  items.forEach(item => {
    table += `
      <tr>
        <td>${escapeHTML(item.inv_make)}</td>
        <td>${escapeHTML(item.inv_model)}</td>
        <td><a href="/inv/edit/${item.inv_id}">Modify</a></td>
        <td><a href="/inv/delete/${item.inv_id}">Delete</a></td>
      </tr>
    `
  })

  table += `
      </tbody>
    </table>
  `

  return table
}

/**
 * Basic HTML escaping for safety
 */
function escapeHTML(str = "") {
  return str.replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]))
}
