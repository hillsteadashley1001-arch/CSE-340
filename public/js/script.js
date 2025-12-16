/**
 * Global client-side helpers
 * Loaded on all pages
 */

document.addEventListener("DOMContentLoaded", () => {
  enableFlashDismiss()
  enableDeleteConfirm()
})

/**
 * Allow flash/notice messages to be dismissed
 */
function enableFlashDismiss() {
  const notices = document.querySelectorAll(".notice, .success, .error")

  notices.forEach(msg => {
    msg.style.cursor = "pointer"
    msg.title = "Click to dismiss"
    msg.addEventListener("click", () => {
      msg.remove()
    })
  })
}

/**
 * Confirm destructive delete actions
 * Applies to delete inventory + reviews
 */
function enableDeleteConfirm() {
  const deleteLinks = document.querySelectorAll(
    "a[href*='/delete'], form[action*='/delete']"
  )

  deleteLinks.forEach(el => {
    el.addEventListener("click", event => {
      const confirmed = confirm(
        "Are you sure? This action cannot be undone."
      )
      if (!confirmed) {
        event.preventDefault()
      }
    })
  })
}
