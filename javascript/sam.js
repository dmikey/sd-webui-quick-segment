function samGetRealCoordinate(image, x1, y1) {
    if (image.naturalHeight * (image.width / image.naturalWidth) <= image.height) {
        // width is filled, height has padding
        const scale = image.naturalWidth / image.width
        const zero_point = (image.height - image.naturalHeight / scale) / 2
        const x = x1 * scale
        const y = (y1 - zero_point) * scale
        return [x, y]
    } else {
        // height is filled, width has padding
        const scale = image.naturalHeight / image.height
        const zero_point = (image.width - image.naturalWidth / scale) / 2
        const x = (x1 - zero_point) * scale
        const y = y1 * scale
        return [x, y]
    }
}

function switchToInpaintUpload() {
    switch_to_img2img_tab(4)
    return arguments;
}

// Helper to convert base64 to File object for Gradio upload
function base64ToFile(base64, filename) {
    try {
        const arr = base64.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    } catch (e) {
        console.error("Error converting base64 to file:", e);
        return null;
    }
}

// Function to set image in a Gradio image component using DataTransfer
function setGradioImageFromBase64(containerId, imageBase64) {
    const container = gradioApp().querySelector(containerId);
    if (!container) {
        console.log("Container not found:", containerId);
        return false;
    }

    const fileInput = container.querySelector('input[type="file"]');
    if (!fileInput) {
        console.log("No file input found in container:", containerId);
        return false;
    }

    const file = base64ToFile(imageBase64, 'image.png');
    if (!file) return false;

    const dt = new DataTransfer();
    dt.items.add(file);
    fileInput.files = dt.files;
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
}

// Send body mask to img2img inpaint upload
function sendToImg2ImgInpaint(imageBase64, maskBase64) {
    console.log("sendToImg2ImgInpaint called");

    // Switch to img2img tab
    const tabs = gradioApp().querySelector('#tabs');
    if (tabs) {
        const buttons = tabs.querySelectorAll(':scope > div:first-child > button');
        if (buttons && buttons.length > 1) {
            buttons[1].click(); // img2img tab
        }
    }

    // Wait for tab switch, then go to inpaint upload
    setTimeout(() => {
        switch_to_img2img_tab(4); // Inpaint upload tab

        setTimeout(() => {
            // Set the base image
            if (imageBase64) {
                setGradioImageFromBase64('#img_inpaint_base', imageBase64);
            }

            // Set the mask (with slight delay)
            setTimeout(() => {
                if (maskBase64) {
                    setGradioImageFromBase64('#img_inpaint_mask', maskBase64);
                }
            }, 500);
        }, 300);
    }, 200);

    return [imageBase64, maskBase64];
}

function samTabPrefix() {
    const tabs = gradioApp().querySelector('#tabs');
    if (tabs) {
        const buttons = tabs.querySelectorAll('button');
        if (buttons) {
            if (buttons[0].className.includes("selected")) {
                return "txt2img_sam_"
            } else if (buttons[1].className.includes("selected")) {
                return "img2img_sam_"
            }
        }
    }
    return "_sam_"
}

function samImmediatelyGenerate() {
    const runButton = gradioApp().getElementById(samTabPrefix() + "run_button");
    if (runButton && runButton.style.display !== "none") {
        runButton.click();
    }
}

function samIsRealTimePreview() {
    const realtime_preview = gradioApp().querySelector("#" + samTabPrefix() + "realtime_preview_checkbox input[type='checkbox']");
    return realtime_preview && realtime_preview.checked;
}

function samCreateDot(sam_image, image, coord, label) {
    const x = coord.x;
    const y = coord.y;
    const realCoord = samGetRealCoordinate(image, coord.x, coord.y);
    if (realCoord[0] >= 0 && realCoord[0] <= image.naturalWidth && realCoord[1] >= 0 && realCoord[1] <= image.naturalHeight) {
        const isPositive = label == (samTabPrefix() + "positive");
        const circle = document.createElement("div");
        circle.style.position = "absolute";
        circle.style.width = "10px";
        circle.style.height = "10px";
        circle.style.borderRadius = "50%";
        circle.style.left = x + "px";
        circle.style.top = y + "px";
        circle.className = label;
        circle.style.backgroundColor = isPositive ? "black" : "red";
        circle.title = (isPositive ? "positive" : "negative") + " point label, left click it to cancel.";
        sam_image.appendChild(circle);
        circle.addEventListener("click", e => {
            e.stopPropagation();
            circle.remove();
            if (gradioApp().querySelectorAll("." + samTabPrefix() + "positive").length != 0 ||
                gradioApp().querySelectorAll("." + samTabPrefix() + "negative").length != 0) {
                if (samIsRealTimePreview()) {
                    samImmediatelyGenerate();
                }
            }
        });
        if (samIsRealTimePreview()) {
            samImmediatelyGenerate();
        }
    }
}

function samRemoveDots() {
    const sam_image = gradioApp().getElementById(samTabPrefix() + "input_image");
    if (sam_image) {
        ["." + samTabPrefix() + "positive", "." + samTabPrefix() + "negative"].forEach(cls => {
            const dots = sam_image.querySelectorAll(cls);

            dots.forEach(dot => {
                dot.remove();
            });
        })
    }
    return arguments;
}

function create_submit_sam_args(args) {
    res = []
    for (var i = 0; i < args.length; i++) {
        res.push(args[i])
    }

    res[res.length - 1] = null

    return res
}


function submit_dino() {
    res = []
    for (var i = 0; i < arguments.length; i++) {
        res.push(arguments[i])
    }

    res[res.length - 2] = null
    res[res.length - 1] = null
    return res
}

function submit_sam() {
    let res = create_submit_sam_args(arguments);
    let positive_points = [];
    let negative_points = [];
    const sam_image = gradioApp().getElementById(samTabPrefix() + "input_image");
    const image = sam_image.querySelector('img');
    const classes = ["." + samTabPrefix() + "positive", "." + samTabPrefix() + "negative"];
    classes.forEach(cls => {
        const dots = sam_image.querySelectorAll(cls);
        dots.forEach(dot => {
            const width = parseFloat(dot.style["left"]);
            const height = parseFloat(dot.style["top"]);
            if (cls == "." + samTabPrefix() + "positive") {
                positive_points.push(samGetRealCoordinate(image, width, height));
            } else {
                negative_points.push(samGetRealCoordinate(image, width, height));
            }
        });
    });
    res[2] = positive_points;
    res[3] = negative_points;
    return res
}

samPrevImg = {
    "txt2img_sam_": null,
    "img2img_sam_": null,
}

// Add "Send to Quick Body Mask" buttons to the image_buttons divs
let samButtonsInjected = false;

function injectSamButtons() {
    if (samButtonsInjected) return;

    const buttonContainers = [
        { id: 'image_buttons_txt2img', gallery: 'txt2img_gallery', prefix: 'txt2img_sam_' },
        { id: 'image_buttons_img2img', gallery: 'img2img_gallery', prefix: 'img2img_sam_' }
    ];

    let allFound = true;

    buttonContainers.forEach(config => {
        const container = gradioApp().getElementById(config.id);
        if (!container) {
            allFound = false;
            return;
        }

        // Find the form div inside the container (where the other buttons are)
        const formDiv = container.querySelector('.form');
        if (!formDiv) {
            allFound = false;
            return;
        }

        // Check if button already exists
        if (formDiv.querySelector('#sam_send_' + config.id)) return;

        // Create the button with matching classes
        const btn = document.createElement('button');
        btn.id = 'sam_send_' + config.id;
        btn.className = 'lg secondary gradio-button tool svelte-cmf5ev';
        btn.textContent = '🎯';
        btn.title = 'Send to Quick Body Mask';
        btn.onclick = () => sendToQuickBodyMask(config.gallery);

        formDiv.appendChild(btn);
    });

    if (allFound) {
        samButtonsInjected = true;
    }
}

onUiUpdate(() => {
    // Inject buttons if not done yet
    injectSamButtons();

    const sam_image = gradioApp().getElementById(samTabPrefix() + "input_image")
    if (sam_image) {
        const image = sam_image.querySelector('img')
        if (image && samPrevImg[samTabPrefix()] != image.src) {
            samRemoveDots();
            samPrevImg[samTabPrefix()] = image.src;

            image.addEventListener("click", event => {
                const rect = event.target.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                samCreateDot(sam_image, event.target, { x, y }, samTabPrefix() + "positive");
            });

            image.addEventListener("contextmenu", event => {
                event.preventDefault();
                const rect = event.target.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                samCreateDot(sam_image, event.target, { x, y }, samTabPrefix() + "negative");
            });

            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'src' && mutation.target === image) {
                        samRemoveDots();
                        samPrevImg[samTabPrefix()] = image.src;
                    }
                });
            });

            observer.observe(image, { attributes: true });
        } else if (!image) {
            samRemoveDots();
            samPrevImg[samTabPrefix()] = null;
        }
    }
})

function sendToQuickBodyMask(galleryId) {
    const gallery = gradioApp().getElementById(galleryId);
    if (!gallery) {
        console.error("Gallery not found: " + galleryId);
        return;
    }

    const selectedImage = gallery.querySelector('.selected img') || gallery.querySelector('img');
    if (!selectedImage) {
        alert("Please select an image in the gallery first.");
        return;
    }

    const imageSrc = selectedImage.src;

    // Determine target tab (txt2img or img2img)
    const isImg2Img = galleryId.includes('img2img');
    const tabPrefix = isImg2Img ? 'img2img_sam_' : 'txt2img_sam_';

    // Find the input image component in the Quick Body Mask accordion
    // We use the elem_id we assigned in Python
    const targetContainer = gradioApp().querySelector('#' + tabPrefix + 'body_input_image');

    // Open the accordion if it's closed
    // The 'open' class is on the label-wrap element when accordion is open
    const accordion = gradioApp().querySelector('#' + tabPrefix + 'accordion');
    if (accordion) {
        const labelWrap = accordion.querySelector('.label-wrap');
        if (labelWrap && !labelWrap.classList.contains('open')) {
            labelWrap.click();
        }
    }

    if (targetContainer) {
        // Use the helper to set the image
        // We need to fetch the image blob first if it's a URL
        fetch(imageSrc)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "image.png", { type: "image/png" });
                const dt = new DataTransfer();
                dt.items.add(file);
                const fileInput = targetContainer.querySelector('input[type="file"]');
                if (fileInput) {
                    fileInput.files = dt.files;
                    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
    } else {
        console.error("Could not find Quick Body Mask input image container: #" + tabPrefix + "body_input_image");
    }
}