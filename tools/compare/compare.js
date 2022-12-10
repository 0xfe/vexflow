// Author: Ron B. Yeh

// See: https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API

// store a reference to our file handle
let fileHandle;

// Images we discovered in the vexflow/build/images/current folder.
const currentImages = {}; // FileSystemFileHandle
const currentImagesNames = [];
// Images we discovered in the vexflow/build/images/reference folder.
const referenceImages = {}; // FileSystemFileHandle
const referenceImagesNames = [];

let filterStrings = [];

let currentIMGElement;
let referenceIMGElement;

const SIDE_BY_SIDE = 0;
const OVERLAY = 1;
let viewMode = SIDE_BY_SIDE;

async function openTheFolder() {
  // Ask the user to choose a folder.
  // Window.showDirectoryPicker() returns a handle for the directory.
  try {
    const dirHandle = await window.showDirectoryPicker();
    listDirectoryContents(dirHandle);
  } catch (err) {
    // console.error(err.name, err.message); // AbortError The user aborted a request.
    console.log('The user closed the dialog without selecting a folder.');
  }
}

function addListeners() {
  document.addEventListener('dragover', (e) => {
    // Prevent navigation.
    e.preventDefault();
  });

  document.addEventListener('drop', async (e) => {
    // Prevent navigation.
    e.preventDefault();
    // Process all of the items.
    for (const item of e.dataTransfer.items) {
      // Careful: `kind` will be 'file' for both file _and_ directory entries.
      if (item.kind === 'file') {
        const handle = await item.getAsFileSystemHandle();
        if (handle.kind === 'directory') {
          listDirectoryContents(handle);
        }
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    e = e || window.event;
    switch (e.key) {
      case 'Enter':
        openTheFolder();
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
        flipBetweenImages();
        break;
      case ' ': // SPACE BAR
        toggleViewMode();
        break;
      default:
        break;
    }
  });
}

async function listDirectoryContents(dirHandle) {
  // Get a list of entries in the directory.
  const entries = await dirHandle.values();
  for await (const entry of entries) {
    if (entry.kind === 'directory') {
      if (entry.name === 'current') {
        await getImagesFromCurrentFolder(entry);
      } else if (entry.name === 'reference') {
        await getImagesFromReferenceFolder(entry);
      }
    }
  }

  populateSelectBoxes();
}

async function getImagesFromCurrentFolder(dirHandle) {
  const entries = await dirHandle.values();
  for await (const entry of entries) {
    const fileName = entry.name;
    currentImages[fileName] = entry;
    currentImagesNames.push(fileName);
  }

  currentImagesNames.sort();
}
async function getImagesFromReferenceFolder(dirHandle) {
  const entries = await dirHandle.values();
  for await (const entry of entries) {
    const fileName = entry.name;
    referenceImages[fileName] = entry;
    referenceImagesNames.push(fileName);
  }

  referenceImagesNames.sort();
}

function populateSelectBoxes() {
  // Left Side: Current Images
  document.getElementById('currentImages').innerHTML = buildOptionsHTMLString(currentImagesNames, 'current_');

  // Right Side: Reference Images
  document.getElementById('referenceImages').innerHTML = buildOptionsHTMLString(referenceImagesNames, 'reference_');
}

// Uses filterStrings to filter the list of images.
// Returns a string of HTML <option></option> that match the filter.
function buildOptionsHTMLString(imageNamesArray, idPrefix) {
  let options = '';

  for (let imageName of imageNamesArray) {
    const lowerCaseImageName = imageName.toLowerCase();
    const allFiltersMatch = filterStrings.every((filter) => lowerCaseImageName.includes(filter));
    if (allFiltersMatch) {
      options += `<option id="${idPrefix + imageName}" value="${imageName}">${imageName}</option>`;
    }
  }
  return options;
}

let timeoutID = 0;
function filterResults() {
  let filterString = document.getElementById('filter').value;
  filterString = filterString.toLowerCase().replace(/,/g, ' ');
  filterStrings = filterString.split(' ');
  console.log(filterStrings);

  // Filter the list with at least a 400ms delay after the last letter was typed.
  clearTimeout(timeoutID);
  timeoutID = setTimeout(() => {
    populateSelectBoxes();
  }, 400);
}

async function selectedCurrentImage() {
  let selectBox = document.getElementById('currentImages');

  // Select the corresponding item on the right side.
  let selectedImageFileName = selectBox.options[selectBox.selectedIndex].value;
  let referenceImage = document.getElementById('reference_' + selectedImageFileName);
  referenceImage.selected = true;

  showImages(selectedImageFileName);
}

async function selectedReferenceImage() {
  let selectBox = document.getElementById('referenceImages');

  // Select the corresponding item on the left side.
  let selectedImageFileName = selectBox.options[selectBox.selectedIndex].value;
  let currentImage = document.getElementById('current_' + selectedImageFileName);
  currentImage.selected = true;

  showImages(selectedImageFileName);
}

async function showImages(selectedImageFileName) {
  const currentFileHandle = currentImages[selectedImageFileName];
  const referenceFileHandle = referenceImages[selectedImageFileName];

  const cFile = await currentFileHandle.getFile();
  const rFile = await referenceFileHandle.getFile();

  const cURL = URL.createObjectURL(cFile);
  const rURL = URL.createObjectURL(rFile);

  const imagesContainer = document.getElementById('images');

  // Clear the images container.
  while (imagesContainer.firstChild) {
    imagesContainer.removeChild(imagesContainer.firstChild);
  }

  // Add the two new images.
  currentIMGElement = document.createElement('img');
  currentIMGElement.id = 'currentImage';
  currentIMGElement.src = cURL;
  currentIMGElement.style.zIndex = 1;
  imagesContainer.appendChild(currentIMGElement);

  referenceIMGElement = document.createElement('img');
  referenceIMGElement.id = 'referenceImage';
  referenceIMGElement.src = rURL;
  referenceIMGElement.style.zIndex = -1;
  imagesContainer.appendChild(referenceIMGElement);

  updateImagesForViewMode();
  updateLabelsForViewMode();
}

function flipBetweenImages() {
  currentIMGElement.style.zIndex = -1 * currentIMGElement.style.zIndex;
  referenceIMGElement.style.zIndex = -1 * referenceIMGElement.style.zIndex;
  updateLabelsForViewMode();
}

function toggleViewMode() {
  viewMode = 1 - viewMode;
  updateImagesForViewMode();
  updateLabelsForViewMode();
}

function updateImagesForViewMode() {
  if (viewMode === SIDE_BY_SIDE) {
    currentIMGElement.style.position = 'static';
    referenceIMGElement.style.position = 'static';
  } else {
    currentIMGElement.style.position = 'absolute';
    referenceIMGElement.style.position = 'absolute';
  }
}

function updateLabelsForViewMode() {
  if (viewMode === SIDE_BY_SIDE) {
    document.getElementById('labelCurrent').style.opacity = 1;
    document.getElementById('labelReference').style.opacity = 1;
  } else {
    if (currentIMGElement.style.zIndex > referenceIMGElement.style.zIndex) {
      console.log('CURRENT!!!');
      document.getElementById('labelCurrent').style.opacity = 1;
      document.getElementById('labelReference').style.opacity = 0.4;
    } else {
      console.log('REFERENCE');
      document.getElementById('labelCurrent').style.opacity = 0.4;
      document.getElementById('labelReference').style.opacity = 1;
    }
  }
}
