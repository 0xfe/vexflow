// Author: Ron B. Yeh
// MIT License
// See: https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API

// To generate current/ and reference/ images, follow these steps:
// `git checkout` a stable "reference" version of VexFlow (e.g., a recent release).
// `grunt reference` builds VexFlow and copies the build/ to the reference/ folder
// `git checkout` the new branch you are working on.
// `grunt` builds your latest "current" version.
// `grunt generate:current`
// `grunt generate:reference`
// Now you can use this tool to compare the current/ and reference/ images.

// Choose an image comparison mode with the number keys:
// 1 = SIDE-BY-SIDE
// 2 = ALTERNATE A | B
//     Use arrow keys to flip between images.
// 3 = STACK A + B
//     Use arrow keys to flip between images.
// 4 = IMAGE DIFF

// TODO: If this tool gets any more complicated, we should use something like React :-).

// Images we discovered in the vexflow/build/images/current folder.
let currentImages = {}; // FileSystemFileHandle
let currentImagesNames = [];

// Images we discovered in the vexflow/build/images/reference folder.
let referenceImages = {}; // FileSystemFileHandle
let referenceImagesNames = [];

let filterStrings = [];

let currentIMGElement;
let referenceIMGElement;

// Helper function.
function $(id) {
  return document.getElementById(id);
}

//////////////////////////////////////////////////////////////////////////////////////////////////
// View Mode

const SIDE_BY_SIDE = 0;
const ALTERNATE = 1;
const STACK = 2;
const DIFF = 3;

let viewMode = loadCurrentViewMode();

function loadCurrentViewMode() {
  const modeSaved = localStorage.getItem('vexflow.compare.viewMode');
  let modeValue;
  if (modeSaved === null) {
    modeValue = SIDE_BY_SIDE;
  } else {
    modeValue = parseInt(modeSaved);
    if (modeValue < SIDE_BY_SIDE || modeValue > DIFF) {
      modeValue = SIDE_BY_SIDE;
    }
  }
  localStorage.setItem('vexflow.compare.viewMode', modeValue);
  return modeValue;
}

function saveCurrentViewMode() {
  localStorage.setItem('vexflow.compare.viewMode', viewMode);
}

function setViewMode(mode) {
  viewMode = mode;
  saveCurrentViewMode();
  updateUIForViewMode();
}

// In ALTERNATE or STACK mode, this alternates between 0 and 1, and points to the image we are currently viewing.
let cursor = 0;

//////////////////////////////////////////////////////////////////////////////////////////////////
// Open Folders

// Choose a folder that contains two subfolders: current/ and reference/.
// Usually, this is the vexflow/build/images/ folder.
async function openImagesFolder() {
  // Ask the user to choose a folder.
  // Window.showDirectoryPicker() returns a handle for the directory.
  try {
    const dirHandle = await window.showDirectoryPicker();
    processImagesFolder(dirHandle);
  } catch (err) {
    // console.error(err.name, err.message); // AbortError The user aborted a request.
    console.log('The user closed the dialog without selecting a folder.');
  }
}

// Choose any folder that contains the current images. The folder does not need to be called 'current'.
async function openCurrentFolder() {
  // Ask the user to choose a folder.
  // Window.showDirectoryPicker() returns a handle for the directory.
  try {
    const dirHandle = await window.showDirectoryPicker();
    console.log(dirHandle);
  } catch (err) {
    // console.error(err.name, err.message); // AbortError The user aborted a request.
    console.log('The user closed the dialog without selecting a folder.');
  }
}

// Choose any folder that contains the reference images. The folder does not need to be called 'reference'.
async function openReferenceFolder() {
  // Ask the user to choose a folder.
  // Window.showDirectoryPicker() returns a handle for the directory.
  try {
    const dirHandle = await window.showDirectoryPicker();
    console.log(dirHandle);
  } catch (err) {
    // console.error(err.name, err.message); // AbortError The user aborted a request.
    console.log('The user closed the dialog without selecting a folder.');
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////

function droppedFilesOnImagesDropTarget() {}

function droppedFilesOnSelectBoxCurrent(e) {
  [...e.dataTransfer.items].forEach((item, i) => {
    // If dropped items aren't files, reject them
    if (item.kind === 'file') {
      const file = item.getAsFile();
      console.log(`CURR: file[${i}].name = ${file.name}`);
    }
  });
}

function droppedFilesOnSelectBoxReference(e) {
  [...e.dataTransfer.items].forEach((item, i) => {
    // If dropped items aren't files, reject them
    if (item.kind === 'file') {
      const file = item.getAsFile();
      console.log(`REF: file[${i}].name = ${file.name}`);
    }
  });
}

let dragCounter = 0;
function addWindowDragListeners() {
  window.addEventListener(
    'dragover',
    (e) => {
      e.preventDefault();
    },
    false
  );
  window.addEventListener(
    'drop',
    (e) => {
      e.preventDefault();
      hideDropTargets();
    },
    false
  );

  window.addEventListener('dragenter', async (e) => {
    // Prevent navigation.
    e.preventDefault();
    // Show the overlay drop targets.
    $('drop-target-overlay').style.display = 'block';
    dragCounter++;
  });

  window.addEventListener('dragleave', async (e) => {
    // Prevent navigation.
    e.preventDefault();
    // Hide the overlay drop targets.
    dragCounter--;
    if (dragCounter === 0) {
      hideDropTargets();
    }
  });
}

function hideDropTargets() {
  $('drop-target-overlay').style.display = 'none';
}

function addDropTargets() {
  $('drop-target-images').addEventListener('drop', async (e) => {
    // Prevent navigation.
    e.preventDefault();

    // Process all of the items.
    for (const item of e.dataTransfer.items) {
      // Careful: `kind` will be 'file' for both file _and_ directory entries.
      if (item.kind === 'file') {
        const handle = await item.getAsFileSystemHandle();
        if (handle.kind === 'directory') {
          processImagesFolder(handle);
        }
      }
    }
  });

  $('drop-target-current').addEventListener('drop', async (e) => {
    // Prevent navigation.
    e.preventDefault();

    // Process all of the items.
    for (const item of e.dataTransfer.items) {
      // Careful: `kind` will be 'file' for both file _and_ directory entries.
      if (item.kind === 'file') {
        const handle = await item.getAsFileSystemHandle();
        if (handle.kind === 'directory') {
          console.log(handle);
          // processImagesFolder(handle);
        }
      }
    }
  });

  $('drop-target-reference').addEventListener('drop', async (e) => {
    // Prevent navigation.
    e.preventDefault();

    // Process all of the items.
    for (const item of e.dataTransfer.items) {
      // Careful: `kind` will be 'file' for both file _and_ directory entries.
      if (item.kind === 'file') {
        const handle = await item.getAsFileSystemHandle();
        if (handle.kind === 'directory') {
          console.log(handle);
          // processImagesFolder(handle);
        }
      }
    }
  });
}

function addListeners() {
  addWindowDragListeners();
  addDropTargets();

  // Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    e = e || window.event;
    const isAltKeyPressed = e.altKey;
    const key = e.key.toLowerCase();
    switch (key) {
      case 'escape':
        hideHelpText();
        hideDropTargets();
        document.activeElement.blur();
        break;
      case 'c':
        if (isAltKeyPressed) {
          console.log('Open the current/ folder.');
          openCurrentFolder();
        }
        break;
      case 'r':
        if (isAltKeyPressed) {
          console.log('Open the reference/ folder.');
          openReferenceFolder();
        }
        break;
      case 'o':
      case 'i':
        if (isAltKeyPressed) {
          console.log('Open the images/ folder.');
          openImagesFolder();
        }
        break;
      case 'arrowleft':
      case 'arrowright':
        if (isFocusedOnInput()) {
          return;
        }
        cursor = 1 - cursor;
        updateUIForViewMode();
        break;
      case '1':
        if (isFocusedOnInput()) {
          return;
        }
        setViewMode(SIDE_BY_SIDE);
        break;
      case '2':
        if (isFocusedOnInput()) {
          return;
        }
        setViewMode(ALTERNATE);
        break;
      case '3':
        if (isFocusedOnInput()) {
          return;
        }
        setViewMode(STACK);
        break;
      case '4':
        if (isFocusedOnInput()) {
          return;
        }
        setViewMode(DIFF);
        break;
      case 'enter':
        // Nothing for now.
        break;
      case ' ': // SPACE BAR
        // Nothing for now.
        break;
      default:
        // Nothing for now.
        console.log('Unhandled Shortcut:', key);
        break;
    }
  });
}

// Process the images/ folder and look for the current/ and reference/ subfolders.
// dirHandle is of type FileSystemDirectoryHandle.
async function processImagesFolder(dirHandle) {
  const entries = await dirHandle.values();
  for await (const entry of entries) {
    if (entry.kind === 'directory') {
      if (entry.name === 'current') {
        console.log('Found current/ folder!');
        await processCurrentFolder(entry);
      } else if (entry.name === 'reference') {
        console.log('Found reference/ folder!');
        await processReferenceFolder(entry);
      }
    }
  }
}

// dirHandle is of type FileSystemDirectoryHandle.
async function processCurrentFolder(dirHandle) {
  currentImages = {};
  currentImagesNames = [];

  const entries = await dirHandle.values();
  for await (const entry of entries) {
    const fileName = entry.name;
    currentImages[fileName] = entry;
    currentImagesNames.push(fileName);
  }

  currentImagesNames.sort();
  updateSelectBoxForCurrentImages();
}

// dirHandle is of type FileSystemDirectoryHandle.
async function processReferenceFolder(dirHandle) {
  referenceImages = {};
  referenceImagesNames = [];

  const entries = await dirHandle.values();
  for await (const entry of entries) {
    const fileName = entry.name;
    referenceImages[fileName] = entry;
    referenceImagesNames.push(fileName);
  }

  referenceImagesNames.sort();
  updateSelectBoxForReferenceImages();
}

// Left Side: Current Images
function updateSelectBoxForCurrentImages() {
  $('selectBoxCurrent').innerHTML = buildOptionsHTMLString(currentImagesNames, 'current_');
}

// Right Side: Reference Images
function updateSelectBoxForReferenceImages() {
  $('selectBoxReference').innerHTML = buildOptionsHTMLString(referenceImagesNames, 'reference_');
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
  let filterString = $('filter').value;
  filterString = filterString.toLowerCase().replace(/,/g, ' ');
  filterStrings = filterString.split(' ');

  // Filter the list with at least a 400ms delay after the last letter was typed.
  clearTimeout(timeoutID);
  timeoutID = setTimeout(() => {
    updateSelectBoxForCurrentImages();
    updateSelectBoxForReferenceImages();
  }, 400);
}

async function selectedCurrentImage() {
  let selectBox = $('selectBoxCurrent');

  // Select the corresponding item on the right side.
  let selectedImageFileName = selectBox.options[selectBox.selectedIndex].value;
  let referenceImage = $('reference_' + selectedImageFileName);
  referenceImage.selected = true;

  showImages(selectedImageFileName);
}

async function selectedReferenceImage() {
  let selectBox = $('selectBoxReference');

  // Select the corresponding item on the left side.
  let selectedImageFileName = selectBox.options[selectBox.selectedIndex].value;
  let currentImage = $('current_' + selectedImageFileName);
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

  const imagesContainer = $('images');

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

  updateUIForViewMode();
}

function flipBetweenImages() {
  currentIMGElement.style.zIndex = cursor;
  referenceIMGElement.style.zIndex = 1 - cursor;
  updateLabelsForViewMode();
}

function showHelpText() {
  $('help-text').style.display = 'block';
}

function hideHelpText() {
  $('help-text').style.display = 'none';
}

//////////////////////////////////////////////////////////////////////////////////////////////////
// Different View Modes

function updateUIForViewMode() {
  switch (viewMode) {
    case SIDE_BY_SIDE:
      console.log('Show current / reference images side by side.');
      break;
    case ALTERNATE:
      console.log('Alternate between current / reference images.');
      break;
    case STACK:
      console.log(
        'Show current / reference images stacked on top of each other. The top image is translucent with 50% opacity.'
      );
      break;
    case DIFF:
      console.log('Show a visual diff between the current / reference images.');
      break;
    default:
      console.log('Unknown view mode.');
      break;
  }

  updateImagesForViewMode();
  updateLabelsForViewMode();
}

function updateImagesForViewMode() {
  switch (viewMode) {
    case SIDE_BY_SIDE:
      currentIMGElement.style.position = 'static';
      referenceIMGElement.style.position = 'static';
      break;
    case ALTERNATE:
      currentIMGElement.style.position = 'absolute';
      referenceIMGElement.style.position = 'absolute';
      break;
    case STACK:
      updateStackedImages();
      break;
    case DIFF:
      break;
    default:
      console.log('Unknown view mode.');
      break;
  }
}

function updateLabelsForViewMode() {
  switch (viewMode) {
    case SIDE_BY_SIDE:
      $('labelCurrent').style.opacity = 1;
      $('labelReference').style.opacity = 1;
      break;
    case ALTERNATE:
      break;
    case STACK:
      if (currentIMGElement.style.zIndex > referenceIMGElement.style.zIndex) {
        console.log('CURRENT!!!');
        $('labelCurrent').style.opacity = 1;
        $('labelReference').style.opacity = 0.4;
      } else {
        console.log('REFERENCE');
        $('labelCurrent').style.opacity = 0.4;
        $('labelReference').style.opacity = 1;
      }
      break;
    case DIFF:
      break;
    default:
      console.log('Unknown view mode.');
      break;
  }
}

function updateStackedImages() {
  currentIMGElement.style.position = 'absolute';
  referenceIMGElement.style.position = 'absolute';
}

function isFocusedOnInput() {
  return document.activeElement.tagName === 'INPUT';
}
