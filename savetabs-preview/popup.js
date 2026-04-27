document.addEventListener('DOMContentLoaded', () => {
    const saveTabButton = document.getElementById('saveTabButton');
    const tabsList = document.getElementById('tabsList');
    const noTabsMessage = document.getElementById('noTabsMessage');
    const clearAllTabsButton = document.getElementById('clearAllTabsButton');

    // Function to render saved tabs
    function renderSavedTabs() {
        chrome.storage.local.get(['savedTabs'], (result) => {
            const savedTabs = result.savedTabs || [];
            tabsList.innerHTML = ''; // Clear existing list

            if (savedTabs.length === 0) {
                noTabsMessage.style.display = 'block';
                clearAllTabsButton.style.display = 'none';
                return;
            } else {
                noTabsMessage.style.display = 'none';
                clearAllTabsButton.style.display = 'block';
            }

            savedTabs.forEach((tab, index) => {
                const listItem = document.createElement('li');
                
                const link = document.createElement('a');
                link.href = tab.url;
                link.textContent = tab.title;
                link.target = '_blank'; // Open in new tab
                listItem.appendChild(link);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'X';
                deleteButton.classList.add('delete-btn');
                deleteButton.addEventListener('click', () => {
                    deleteTab(index);
                });
                listItem.appendChild(deleteButton);

                tabsList.appendChild(listItem);
            });
        });
    }

    // Function to save the current tab
    saveTabButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            if (currentTab) {
                const newTab = {
                    title: currentTab.title,
                    url: currentTab.url
                };

                chrome.storage.local.get(['savedTabs'], (result) => {
                    const savedTabs = result.savedTabs || [];
                    
                    // Check for duplicates before saving
                    const isDuplicate = savedTabs.some(tab => tab.url === newTab.url);
                    if (!isDuplicate) {
                        savedTabs.push(newTab);
                        chrome.storage.local.set({ savedTabs: savedTabs }, () => {
                            renderSavedTabs(); // Re-render the list after saving
                        });
                    } else {
                        // Optionally provide feedback to the user that the tab is already saved
                        // console.log("Tab already saved!");
                    }
                });
            }
        });
    });

    // Function to delete a tab
    function deleteTab(indexToDelete) {
        chrome.storage.local.get(['savedTabs'], (result) => {
            let savedTabs = result.savedTabs || [];
            savedTabs.splice(indexToDelete, 1); // Remove the tab at the specified index
            chrome.storage.local.set({ savedTabs: savedTabs }, () => {
                renderSavedTabs(); // Re-render the list after deletion
            });
        });
    }

    // Function to clear all tabs
    clearAllTabsButton.addEventListener('click', () => {
        // Ask for confirmation (optional but good practice)
        if (confirm('Are you sure you want to clear all saved tabs?')) {
            chrome.storage.local.set({ savedTabs: [] }, () => {
                renderSavedTabs(); // Re-render the list (it will be empty)
            });
        }
    });

    // Initial render when the popup is opened
    renderSavedTabs();
});