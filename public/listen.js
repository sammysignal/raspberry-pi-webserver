function deleteAllVoicemail() {
  let response = confirm("Are you sure you want to delete all voicemail?");
  if (!response) {
    return;
  }
  let deletePath = `${window.location.origin}${window.location.pathname}delete`;
  fetch(deletePath, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      window.location.reload();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}


function deleteVoicemail(el) {
  const deleteUri = el.dataset['url']
  let response = confirm(`Are you sure you want to delete the following message?\n${deleteUri}`);
  if (!response) {
    return;
  }

  let deletePath = `${window.location.origin}${window.location.pathname}deleteOne?toDelete=${encodeURIComponent(deleteUri)}`;
  fetch(deletePath, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      window.location.reload();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
