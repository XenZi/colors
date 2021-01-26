// Global selections
const colorDivs = document.querySelectorAll(".color");
const generateButton = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustButtons = document.querySelectorAll(".adjust");
const lockButtons = document.querySelectorAll(".lock");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryContainer = document.querySelector(".library-container");
const libraryButton = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");
let initialColors;
let savedPalettes = [];
// Event Listeners
generateButton.addEventListener("click", randomColors);
sliders.forEach((slider) => {
    slider.addEventListener("input", hslControls);
});
colorDivs.forEach((slider, index) => {
    slider.addEventListener("change", () => {
        updateTextUI(index);
    });
});
currentHexes.forEach(hex => {
    hex.addEventListener("click", () => {
        copyToClipboard(hex);
    });
});
popup.addEventListener("transitionend", () => {
    const popupBox = popup.children[0];
    popupBox.classList.remove("active");
    popup.classList.remove("active");
});
adjustButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
        sliderOpen(index);
    });
});
closeAdjustments.forEach((button, index) => {
    button.addEventListener("click", () => {
        sliderClose(index);
    });
});
lockButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
        lockColor(index);
    });
});
saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libraryButton.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);
// Functions
function generateHex() {
    const hexColor = chroma.random();
    return hexColor;
}
function randomColors() {
    initialColors = [];
    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();
        if(div.classList.contains("locked")) {
            initialColors.push(hexText.innerText);
            return;
        }
        else {
            initialColors.push(randomColor.hex());
        }
        // Adding color to the background and changing HEX value of the color
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;

        // Checking the text contrast between the background and text color
        checkTextContrast(randomColor, hexText);

        // Initial colorize sliders
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll(".sliders input");
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];
        colorizeSliders(color, hue, brightness, saturation);
    });

    // Reseting inputs
    resetInputs();

    // Checking for contrast of buttons
    adjustButtons.forEach((button, index) => {
        checkTextContrast(initialColors[index], button);
        checkTextContrast(initialColors[index], lockButtons[index]);
    });
}
function resetInputs() {
    const sliders = document.querySelectorAll(".sliders input");
    sliders.forEach((slider) => {
        if(slider.name === "hue") {
            const hueColor = initialColors[slider.getAttribute("data-hue")];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = hueValue;
        }
        if(slider.name === "brightness") {
            const brightnessColor = initialColors[slider.getAttribute("data-bright")];
            const brightnessValue = chroma(brightnessColor).hsl()[2]; // It is on the second index because array is [hue[0], saturation[1], lighting[2]]
            slider.value = brightnessValue;
        }
        if(slider.name === "saturation") {
            const saturationColor = initialColors[slider.getAttribute("data-sat")];
            const saturationValue = chroma(saturationColor).hsl()[1];
            slider.value = saturationValue;
        }
    });
}
function checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();
    if(luminance > 0.5) {
        text.style.color = "black";
    }
    else {
        text.style.color = "white";
    }
} 
function colorizeSliders(color, hue, brightness, saturation) {
    //  Saturation
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);
    // Brightness
    const midBright = color.set("hsl.l", 0.5);
    const scaleBright = chroma.scale(["black", midBright, "white"]);
    
    // Input update
    saturation.style.background = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
    brightness.style.background = `linear-gradient(to right, ${scaleBright(0)},${scaleBright(0.5)}, ${scaleBright(1)})`;
    hue.style.background = `linear-gradient(to right, rgb(204, 75, 75), rgb(204, 204, 75), rgb(75, 204, 75), rgb(75, 204, 204), rgb(75, 75, 204), rgb(204, 75, 204), rgb(204, 75, 75))`;
}
function hslControls(e) {
    const index = e.target.getAttribute("data-bright") || e.target.getAttribute("data-sat") || e.target.getAttribute("data-hue");
    let sliders = e.target.parentElement.querySelectorAll("input[type='range']");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];
    const currentColor = initialColors[index];
    let color = chroma(currentColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);
    colorDivs[index].style.background = color;

    // Updating inputs

    colorizeSliders(color, hue, brightness, saturation);
}
function updateTextUI(index) {
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector("h2");
    const icons = activeDiv.querySelectorAll(".controls button");
    textHex.innerText = color.hex();
    checkTextContrast(color, textHex);
    for(icon of icons) {
        checkTextContrast(color, icon);
    }
}
function copyToClipboard(hex) {
    const el = document.createElement("textarea");
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    // Pop up animation
    const popupBox = popup.children[0];
    popupBox.classList.add("active");
    popup.classList.add("active");
}
function sliderOpen(index) {
    sliderContainers[index].classList.toggle("active");
}
function sliderClose(index) {
    sliderContainers[index].classList.remove("active");
}
function lockColor(index) {
    colorDivs[index].classList.toggle("locked");
    lockButtons[index].children[0].classList.toggle("fa-lock-open");
    lockButtons[index].children[0].classList.toggle("fa-lock");
}
function openPalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.add("active");
    popup.classList.add("active");
}
function closePalette(e) {
    const popup = saveContainer.children[0];
    popup.classList.remove("active");
    saveContainer.classList.remove("active");
}
function savePalette(e) {
    saveContainer.classList.remove("active");
    popup.classList.remove("active");
    const name = saveInput.value;
    const colors = [];
    currentHexes.forEach((hex) => {
        colors.push(hex.innerHTML);
    });
    let paletteNr;
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
    if(paletteObjects) {
        paletteNr = paletteObjects.length;
    }
    else {
        paletteNr = savedPalettes.length;
    }
    const paletteObj = {
        name, colors, nr:paletteNr
    }
    savedPalettes.push(paletteObj); 
    console.log(paletteObj);
    // Local Storage
    savetoLocal(paletteObj);
    saveInput.value = "";

    // Generating the palette for library
    const palette = document.createElement("div");
    palette.classList.add("custom-palette");
    const title = document.createElement("h4");
    title.innerText = paletteObj.name;
    const preview = document.createElement("div");
    preview.classList.add("small-preview");
    paletteObj.colors.forEach(color => {
        const smallDiv = document.createElement("div");
        smallDiv.style.background = color;
        preview.appendChild(smallDiv);
    });
    const paletteBtn = document.createElement("button");
    paletteBtn.classList.add("pick-palette-btn");
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.innerText = "Select";
    // Attaching event listeners
    paletteBtn.addEventListener("click", e => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        savedPalettes[paletteIndex].colors.forEach((color, index) => {
            initialColors.push(color);
            colorDivs[index].style.background = color;
            const text = colorDivs[index].children[0];
            checkTextContrast(color,text);
            updateTextUI(index);
        });
        resetInputs();
    });
    //Append to library

    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);
}
function savetoLocal(paletteObj) {
    let localPalettes;
    if(localStorage.getItem("palettes") === null) {
        localPalettes = [];
    }
    else {
        localPalettes = JSON.parse(localStorage.getItem("palettes"));
    }
    localPalettes.push(paletteObj);
    localStorage.setItem("palettes", JSON.stringify(localPalettes));
}
function openLibrary() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add("active");
    popup.classList.add("active");
}
function closeLibrary() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove("active");
    popup.classList.remove("active");
}
function getLocal() {
    if(localStorage.getItem("palettes") === null) {
        localPalettes = [];
    }
    else {
            const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
            savedPalettes = [...paletteObjects];
            paletteObjects.forEach((paletteObj) => {
            const palette = document.createElement("div");
            palette.classList.add("custom-palette");
            const title = document.createElement("h4");
            title.innerText = paletteObj.name;
            const preview = document.createElement("div");
            preview.classList.add("small-preview");
            paletteObj.colors.forEach(color => {
                const smallDiv = document.createElement("div");
                smallDiv.style.background = color;
                preview.appendChild(smallDiv);
            });
            const paletteBtn = document.createElement("button");
            paletteBtn.classList.add("pick-palette-btn");
            paletteBtn.classList.add(paletteObj.nr);
            paletteBtn.innerText = "Select";
            // Attaching event listeners
            paletteBtn.addEventListener("click", e => {
                closeLibrary();
                const paletteIndex = e.target.classList[1];
                initialColors = [];
                paletteObjects[paletteIndex].colors.forEach((color, index) => {
                    initialColors.push(color);
                    colorDivs[index].style.background = color;
                    const text = colorDivs[index].children[0];
                    checkTextContrast(color,text);
                    updateTextUI(index);
                });
                resetInputs();
            });
            //Append to library
        
            palette.appendChild(title);
            palette.appendChild(preview);
            palette.appendChild(paletteBtn);
            libraryContainer.children[0].appendChild(palette);
        });
    }
}
getLocal();
randomColors();