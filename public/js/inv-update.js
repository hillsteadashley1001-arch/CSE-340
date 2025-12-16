// Enable the update button when any form field changes
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("updateForm")
  if (!form) return

  const submitButton = form.querySelector("button[type='submit']")
  if (!submitButton) return

  form.addEventListener("input", () => {
    submitButton.disabled = false
  })
})
