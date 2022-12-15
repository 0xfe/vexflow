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

// Helper function.
function $(id) {
  return document.getElementById(id);
}

// Images we discovered in the vexflow/build/images/current folder.
let currentImages = {}; // FileSystemFileHandle
let currentImagesNames = [];

// Images we discovered in the vexflow/build/images/reference folder.
let referenceImages = {}; // FileSystemFileHandle
let referenceImagesNames = [];

let filterStrings = [];

// <img> elements so we can display the current & reference images.
let currentImageElement;
let referenceImageElement;

// Use canvas for the image diff.
let currentCanvas;
let currentContext;
let currentImageWidth = 0;
let currentImageHeight = 0;

let referenceCanvas;
let referenceContext;
let referenceImageWidth = 0;
let referenceImageHeight = 0;

let diffHelperFunction;
let diffCanvas;
let diffContext;

let imagesContainer;

//////////////////////////////////////////////////////////////////////////////////////////////////
// View Mode

const SIDE_BY_SIDE = 0; // Show current / reference images side-by-side.
const ALTERNATE = 1; // Alternate between current / reference images.
const STACK = 2; // Show current / reference images stacked on top of each other. The top image is translucent with 80% opacity.
const DIFF = 3; // Show a visual diff between the current / reference images.

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
// IMAGES
//     Choose a folder that contains two subfolders: current/ and reference/.
//     Usually, this is the vexflow/build/images/ folder.
// CURRENT
//     Choose any folder that contains the current images. The folder does not need to be called 'current'.
// REFERENCE
//     Choose any folder that contains the reference images. The folder does not need to be called 'reference'.
function getDirectoryPicker(processCallback) {
  return async function () {
    // Ask the user to choose a folder.
    // Window.showDirectoryPicker() returns a handle for the directory.
    try {
      const dirHandle = await window.showDirectoryPicker();
      processCallback(dirHandle);
    } catch (err) {
      // console.error(err.name, err.message); // AbortError The user aborted a request.
      console.log('The user closed the dialog without selecting a folder.');
    }
  };
}

function openImagesFolder() {
  getDirectoryPicker(processImagesFolder)();
}

function openCurrentFolder() {
  getDirectoryPicker(processCurrentFolder)();
}

function openReferenceFolder() {
  getDirectoryPicker(processReferenceFolder)();
}

//////////////////////////////////////////////////////////////////////////////////////////////////

function addClickListeners() {
  $('chooseImagesFolder').addEventListener('click', getDirectoryPicker(processImagesFolder));
  $('chooseCurrentFolder').addEventListener('click', getDirectoryPicker(processCurrentFolder));
  $('chooseReferenceFolder').addEventListener('click', getDirectoryPicker(processReferenceFolder));
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
  const getProcessFolderHandler = (processCallback) => async (e) => {
    // Prevent navigation.
    e.preventDefault();

    // Process all items, but stop once we find the first folder.
    for (const item of e.dataTransfer.items) {
      // item.kind will be 'file' for both file _and_ directory entries.
      if (item.kind === 'file') {
        const handle = await item.getAsFileSystemHandle();
        if (handle.kind === 'directory') {
          processCallback(handle);
          return;
        }
      }
    }
  };

  $('drop-target-images').addEventListener('drop', getProcessFolderHandler(processImagesFolder));
  $('drop-target-current').addEventListener('drop', getProcessFolderHandler(processCurrentFolder));
  $('drop-target-reference').addEventListener('drop', getProcessFolderHandler(processReferenceFolder));
}

function app(diffFunction) {
  imagesContainer = $('images');
  addListeners();
  setDiffFunction(diffFunction);
}

function addListeners() {
  addClickListeners();
  addWindowDragListeners();
  addDropTargets();

  // Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    e = e || window.event;
    const isControlOrMetaKeyPressed = e.ctrlKey || e.metaKey;
    const isShiftKeyPressed = e.shiftKey;
    const key = e.key.toLowerCase();
    switch (key) {
      case 'escape':
        hideHelpText();
        hideDropTargets();
        document.activeElement.blur();
        break;
      case 'c':
        if (isControlOrMetaKeyPressed && isShiftKeyPressed) {
          e.preventDefault();
          openCurrentFolder();
        }
        break;
      case 'r':
        if (isControlOrMetaKeyPressed && isShiftKeyPressed) {
          e.preventDefault();
          openReferenceFolder();
        }
        break;
      case 'o':
      case 'i':
        if (isControlOrMetaKeyPressed && isShiftKeyPressed) {
          e.preventDefault();
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
        // console.log('Unhandled Shortcut:', key);
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
    if (entry.kind === 'directory') {
      continue;
    }
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
    if (entry.kind === 'directory') {
      continue;
    }
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

  // Select the corresponding item on the right side, if it exists.
  let selectedImageFileName = selectBox.options[selectBox.selectedIndex].value;
  let correspondingElement = $('reference_' + selectedImageFileName);
  if (correspondingElement) {
    correspondingElement.selected = true;
  }

  showImages(selectedImageFileName);
}

async function selectedReferenceImage() {
  let selectBox = $('selectBoxReference');

  // Select the corresponding item on the left side, if it exists.
  let selectedImageFileName = selectBox.options[selectBox.selectedIndex].value;
  let correspondingElement = $('current_' + selectedImageFileName);
  if (correspondingElement) {
    correspondingElement.selected = true;
  }

  showImages(selectedImageFileName);
}

function createCanvas(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  return canvas;
}

async function showImages(selectedImageFileName) {
  const currentFileHandle = currentImages[selectedImageFileName];
  const referenceFileHandle = referenceImages[selectedImageFileName];

  const cFile = await currentFileHandle.getFile();
  const rFile = await referenceFileHandle.getFile();

  // Clear the images container.
  while (imagesContainer.firstChild) {
    imagesContainer.removeChild(imagesContainer.firstChild);
  }

  const cURL = URL.createObjectURL(cFile);
  const rURL = URL.createObjectURL(rFile);

  currentImageElement = new Image();
  currentImageElement.src = cURL;
  currentImageElement.onload = () => {
    currentImageElement.id = 'currentImage';
    currentImageElement.style.zIndex = 1;
    const w = currentImageElement.naturalWidth;
    const h = currentImageElement.naturalHeight;
    // Make a canvas of the same size and assign it to currentCanvas.
    currentCanvas = createCanvas(w, h);
    // Draw the image onto the canvas.
    currentContext = currentCanvas.getContext('2d', {
      willReadFrequently: true,
    });
    currentContext.drawImage(currentImageElement, 0, 0, w, h);
    currentImageWidth = w;
    currentImageHeight = h;
  };

  referenceImageElement = new Image();
  referenceImageElement.src = rURL;
  referenceImageElement.onload = () => {
    referenceImageElement.id = 'referenceImage';
    referenceImageElement.style.zIndex = -1;
    const w = referenceImageElement.naturalWidth;
    const h = referenceImageElement.naturalHeight;
    // Make a canvas of the same size and assign it to referenceCanvas.
    referenceCanvas = createCanvas(w, h);
    // Draw the image onto the canvas.
    referenceContext = referenceCanvas.getContext('2d', {
      willReadFrequently: true,
    });
    referenceContext.drawImage(referenceImageElement, 0, 0, w, h);
    referenceImageWidth = w;
    referenceImageHeight = h;
  };

  await currentImageElement.decode();
  await referenceImageElement.decode();
  updateUIForViewMode();
}

function flipBetweenImages() {
  currentImageElement.style.zIndex = cursor;
  referenceImageElement.style.zIndex = 1 - cursor;
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
  updateImagesForViewMode();
  updateLabelsForViewMode();
}

function addImageElements() {
  imagesContainer.appendChild(currentImageElement);
  imagesContainer.appendChild(referenceImageElement);
}

function removeImageElements() {
  if (currentImageElement && currentImageElement.parentNode === imagesContainer) {
    imagesContainer.removeChild(currentImageElement);
  }
  if (referenceImageElement && referenceImageElement.parentNode === imagesContainer) {
    imagesContainer.removeChild(referenceImageElement);
  }
}

function updateImagesForViewMode() {
  currentImageElement.style.opacity = 1.0;
  referenceImageElement.style.opacity = 1.0;

  switch (viewMode) {
    case SIDE_BY_SIDE:
      removeDiffCanvas();
      addImageElements();
      currentImageElement.style.position = 'static';
      referenceImageElement.style.position = 'static';
      break;
    case ALTERNATE:
      removeDiffCanvas();
      addImageElements();
      updateAlternatingImages();
      break;
    case STACK:
      removeDiffCanvas();
      addImageElements();
      updateStackedImages();
      break;
    case DIFF:
      updateDiff();
      break;
    default:
      console.log('Unknown view mode.');
      break;
  }
}

function updateLabelsForViewMode() {
  switch (viewMode) {
    case SIDE_BY_SIDE:
    case DIFF:
      $('labelCurrent').style.opacity = 1;
      $('labelReference').style.opacity = 1;
      break;
    case ALTERNATE:
    case STACK:
      if (currentImageElement.style.zIndex > referenceImageElement.style.zIndex) {
        $('labelCurrent').style.opacity = 1;
        $('labelReference').style.opacity = 0.4;
      } else {
        $('labelCurrent').style.opacity = 0.4;
        $('labelReference').style.opacity = 1;
      }
      break;
    default:
      console.log('Unknown view mode.');
      break;
  }
}

function updateAlternatingImages() {
  currentImageElement.style.position = 'absolute';
  referenceImageElement.style.position = 'absolute';
  currentImageElement.style.opacity = 1.0;
  referenceImageElement.style.opacity = 1.0;
  if (cursor === 0) {
    currentImageElement.style.zIndex = 1;
    referenceImageElement.style.zIndex = -1;
  } else {
    referenceImageElement.style.zIndex = 1;
    currentImageElement.style.zIndex = -1;
  }
}

function updateStackedImages() {
  currentImageElement.style.position = 'absolute';
  referenceImageElement.style.position = 'absolute';
  if (cursor === 0) {
    currentImageElement.style.zIndex = 1;
    currentImageElement.style.opacity = 0.8;
    referenceImageElement.style.zIndex = -1;
    referenceImageElement.style.opacity = 1.0;
  } else {
    referenceImageElement.style.zIndex = 1;
    referenceImageElement.style.opacity = 0.8;
    currentImageElement.style.zIndex = -1;
    currentImageElement.style.opacity = 1.0;
  }
}

function removeDiffCanvas() {
  if (diffCanvas && diffCanvas.parentNode) {
    diffCanvas.parentNode.removeChild(diffCanvas);
  }
}

function updateDiff() {
  removeImageElements();

  const c = currentContext.getImageData(0, 0, currentImageWidth, currentImageHeight);
  const r = referenceContext.getImageData(0, 0, referenceImageWidth, referenceImageHeight);

  const maxW = Math.max(currentImageWidth, referenceImageWidth);
  const maxH = Math.max(currentImageHeight, referenceImageHeight);

  removeDiffCanvas();
  diffCanvas = createCanvas(maxW, maxH);
  diffContext = diffCanvas.getContext('2d');

  const diffImage = diffContext.createImageData(maxW, maxH);
  diffHelperFunction(c.data, r.data, diffImage.data, maxW, maxH, { threshold: 0.1 });

  diffContext.putImageData(diffImage, 0, 0);
  imagesContainer.appendChild(diffCanvas);
}

function isFocusedOnInput() {
  return document.activeElement.tagName === 'INPUT';
}

function setDiffFunction(fcn) {
  diffHelperFunction = fcn;
}
