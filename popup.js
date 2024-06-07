const btn =document.querySelector('.btn-btn-color');
btn.addEventListener('click', async() => {
  let [tab]=await chrome.tabs.query({active:true, currentWindow:true});
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id},
    function: highlight,
  });

} );


function highlight(){
  function getRandomRgbColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  }

  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const span = document.createElement("span");
  span.style.backgroundColor = getRandomRgbColor();
  range.surroundContents(span);

  selection.removeAllRanges();

}
console.log('Extension loaded');
console.log('chrome:', chrome);
console.log('chrome.storage:', chrome.storage);
console.log('chrome.storage.local:', chrome.storage ? chrome.storage.local : 'undefined');

document.getElementById('addButton').addEventListener('click', saveNote);
document.getElementById('retrieveButton').addEventListener('click', retrieveNote);

function saveNote() {
    const note = document.getElementById('noteInput').value;
    if (note.trim()) {
        chrome.storage.local.set({ addNote: note }, function() {
            alert('Note Added!');
        });
    } else {
        alert('Please write something to add.');
    }
}

function retrieveNote() {
    chrome.storage.local.get(['addNote'], function(result) {
        if (result.addNote) {
            document.getElementById('savedNote').textContent = result.addNote;
        } else {
            alert('No note found.');
        }
    });
}

// Optional: Load the saved note when the popup is loaded
document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['addNote'], function(result) {
        if (result.addNote) {
            document.getElementById('noteInput').value = result.addNote;
        }
    });
});
document.getElementById('shareButton').addEventListener('click', shareNote);
document.getElementById('searchButton').addEventListener('click', searchNote);
function shareNote() {
  chrome.storage.local.get(['addNote'], function(result) {
      if (result.addNote) {
          const shareData = {
              title: 'Shared Note',
              text: result.addNote,
          };

          navigator.share(shareData).then(() => {
              alert('Note shared successfully!');
          }).catch((error) => {
              alert('Error sharing note: ' + error);
          });
      } else {
          alert('No note found to share.');
      }
  });
}

function searchNote() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  chrome.storage.local.get(['addNote'], function(result) {
      if (result.addNote) {
          const note = result.addNote.toLowerCase();
          const startIndex = note.indexOf(query);

          if (startIndex !== -1) {
              const endIndex = startIndex + query.length;
              const originalNote = result.addNote;
              const highlightedNote = originalNote.substring(0, startIndex) +
                                      '<span class="highlight">' +
                                      originalNote.substring(startIndex, endIndex) +
                                      '</span>' +
                                      originalNote.substring(endIndex);
              document.getElementById('savedNote').innerHTML = highlightedNote;
          } else {
              alert('Search not found.');
          }
      } else {
          alert('No note found to search.');
      }
  });
}