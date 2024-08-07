import { deleteWork, addWork } from "../services/api.js";
import { works, galleryDisplay, filters } from "./home.js";

const modalBtn = document.getElementById("modal-btn");
const modalBtnClose = document.getElementById("close-modal");
const dialog = document.getElementById("modal");

/* ----- DIALOG MANAGEMENT ------ */
// Opening and closing modal 1
modalBtn.addEventListener("click", (e) => {
    modalGalleryDisplay(works);
    dialog.showModal();
});

modalBtnClose.addEventListener("click", (e) => {
    dialog.close();
});

// close modal and putting it back to first state if clicking outside of area
// reset to first modal state if not on it
dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
        dialog.close();
        if (modalGallery.classList.contains("hidden")) {
            switchModal();
        }
    }
});

// Swap between modal 1 & modal 2
const modalGallery = document.getElementById("gallery-modal");
const modalAddImg = document.getElementById("image-modal");
const goModalImage = document.getElementById("switch-modal");

goModalImage.addEventListener("click", (e) => {
    switchModal();
})

const goBackModal = document.getElementById("back-initial-modal");
goBackModal.addEventListener("click", (e) => {
    switchModal();
})

// Close modal 2
const modal2BtnClose = document.getElementById("close-modal2");
modal2BtnClose.addEventListener("click", (e) => {
    // Setting it back to modal 1 for next interaction
    switchModal();
    dialog.close();
});

function switchModal() {
    if (!modalGallery.classList.contains("hidden")) {
        modalGallery.classList.add("hidden");
        modalAddImg.classList.remove("hidden");
    } else {
        modalGallery.classList.remove("hidden");
        modalAddImg.classList.add("hidden");
    }
}

/* ----- MODAL SECTION 1 ------ */
// Handling modal 1 gallery display & delete function in trash-bin icon
function modalGalleryDisplay(worksContent) {
    const galleryModal = document.getElementById("gallery-content");
    galleryModal.innerHTML = "";
    for (let i = 0; i < worksContent.length; i++) {
        const modalContainer = document.createElement("div")
        modalContainer.classList.add("image-modal");
        galleryModal.appendChild(modalContainer);
        const img = document.createElement("img");
        modalContainer.appendChild(img);
        img.src = worksContent[i].imageUrl;
        img.alt = worksContent[i].title;

        const iconContainer = document.createElement("div");
        iconContainer.classList.add("icon-container");
        modalContainer.appendChild(iconContainer);
        const icon = document.createElement("i");
        icon.classList.add("fa-solid", "fa-trash-can");
        iconContainer.appendChild(icon);

        iconContainer.addEventListener("click", async (e) => {
            if (confirm("Confirmer-vous la suppression?")) {
                try {
                    await deleteWork(worksContent[i].id);
                    modalContainer.remove();
                    const workGallery = document.getElementById("work-gallery-" + worksContent[i].id);
                    workGallery.remove();
                    worksContent.splice(i, 1);
                } catch (error) {
                    alert("Une erreur est survenue");
                }
            }
        })
    }
}

/* ----- MODAL SECTION 2 ------ */
// Modal 2 img file preview handler
const imgPreview = document.getElementById("img-preview");
const iconImage = document.getElementById("img-preview-modal");
const imgcontainer = document.getElementById("img-upload-container");
const imgUpload = document.getElementById("img-upload");

imgUpload.addEventListener("change", (e) => {
    const file = imgUpload.files[0];
    if (file) {

        // Check if file type is JPG or PNG
        if (file.type !== "image/png" && file.type !== "image/jpeg") {
            alert("Veuillez sélectionner un fichier image de type JPG ou PNG.");
            imgUpload.value = "";
            return;
        }

        // Check if file size exceeds 4MB (4 * 1024 * 1024 bytes)
        if (file.size > 4 * 1024 * 1024) {
            alert("Fichier trop volumineux. Veuillez sélectionner un fichier de moins de 4 Mo.");
            imgUpload.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            imgPreview.src = e.target.result;
            imgPreview.classList.remove("hidden");
            iconImage.classList.add("hidden");
            imgcontainer.classList.add("hidden");
        }
        reader.readAsDataURL(file);
    }
});

// Modal 2 checking all fields to allow sending
const title = document.getElementById("title");
const option = document.getElementById("id-select");
const uploadImg = document.getElementById("modal-send");

title.addEventListener("input", checkFields);
option.addEventListener("change", checkFields);
imgUpload.addEventListener("change", checkFields);

function checkFields() {
    // Check if all fields are filled before allowing to send
    if (title.value !== "" && option.selectedIndex !== 0 && imgUpload.files.length !== 0) {
        uploadImg.removeAttribute("disabled");
    } else {
        uploadImg.setAttribute("disabled", true);
    }
}

// Modal 2 form > select generation from API
formOptions(filters);
function formOptions(filters) {
    for (let i = 0; i < filters.length; i++) {
        const optionSelect = document.createElement("option");
        if (i == 0) {
            option.value = filters[0].name = "";
        }
        console.log("filter " + i);
        optionSelect.value = i;
        optionSelect.innerText = filters[i].name;
        option.append(optionSelect);
    }
}

// Modal 2 sending all fields to add to the API
uploadImg.addEventListener("click", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title.value);
    formData.append("category", Number(option.value));
    formData.append("image", imgUpload.files[0]);

    console.log(formData.get("image"))
    const response = await addWork(formData);

    if (response.status === 201) {
        title.value = "";
        option.value = "";
        imgPreview.src = "";
        imgPreview.classList.add("hidden");
        iconImage.classList.remove("hidden");
        imgcontainer.classList.remove("hidden");
        checkFields();
        switchModal();
        dialog.close();
        const newWork = await response.json();
        works.push(newWork);
        galleryDisplay(works);
    } else {
        alert('Failed to add work');
    }
});
