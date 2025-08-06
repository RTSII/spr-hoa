document.addEventListener('DOMContentLoaded', () => {
    const downloadButton = document.querySelector(".tui-image-editor-main-container .tui-image-editor-download-btn");
    console.log(downloadButton); // Check the console output
    if (downloadButton) {
        downloadButton.addEventListener("click", (event) => {
            console.log("Download button clicked!");
        });
    } else {
        console.error("Download button not found in the DOM.");
    }

    const modalTrigger = document.querySelector('.modal-trigger');
    if (modalTrigger) {
        modalTrigger.addEventListener('click', () => {
            console.log('Modal triggered');
        });
    } else {
        console.error('Modal trigger element not found');
    }
});
