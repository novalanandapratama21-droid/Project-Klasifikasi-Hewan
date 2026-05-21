// =========================
// ELEMENT
// =========================

const imageUpload =
document.getElementById("imageUpload");

const previewImage =
document.getElementById("previewImage");

const predictBtn =
document.getElementById("predictBtn");

const loading =
document.getElementById("loading");

const resultContainer =
document.getElementById("resultContainer");

const animalName =
document.getElementById("animalName");

const confidenceText =
document.getElementById("confidenceText");

const progressFill =
document.getElementById("progressFill");


// =========================
// TEACHABLE MACHINE
// =========================

const MODEL_URL = "./model/";

let model;
let webcam;
let webcamActive = false;

async function loadModel(){

    model = await tmImage.load(

        MODEL_URL + "model.json",

        MODEL_URL + "metadata.json"

    );

    console.log("Model berhasil dimuat");
}

loadModel();

async function startWebcam(){

    // Kalau webcam aktif → matikan
    if(webcamActive){

        webcam.stop();
        resetPrediction();

        document
        .getElementById("webcam-container")
        .innerHTML = `
            <button onclick="startWebcam()">
                🎥 Aktifkan Kamera
            </button>
        `;

        webcamActive = false;

        return;
    }

    // Kalau belum aktif → nyalakan
    webcam = new tmImage.Webcam(
        300,
        300,
        true
    );

    await webcam.setup();

    await webcam.play();

    webcamActive = true;

    const container =
    document.getElementById(
        "webcam-container"
    );

    container.innerHTML = "";

    container.appendChild(
        webcam.canvas
    );

    // Tombol OFF
    const stopButton =
    document.createElement("button");

    stopButton.innerHTML =
    "❌ Matikan Kamera";

    stopButton.onclick =
    startWebcam;

    container.appendChild(
        stopButton
    );

    window.requestAnimationFrame(loop);

}

async function loop(){

    webcam.update();

    await predictWebcam();

    window.requestAnimationFrame(loop);

}

async function predictWebcam(){

    const prediction =
    await model.predict(webcam.canvas);

    let highest = prediction[0];

    for(
        let i = 1;
        i < prediction.length;
        i++
    ){

        if(
            prediction[i].probability >
            highest.probability
        ){

            highest = prediction[i];

        }
    }

    const confidence = (
        highest.probability * 100
    ).toFixed(2);

    animalName.innerHTML =
    highest.className;

    confidenceText.innerHTML =
    confidence + "%";

    progressFill.style.width =
    confidence + "%";

    resultContainer.style.display =
    "block";

}


// =========================
// PREVIEW IMAGE
// =========================

imageUpload.addEventListener(
    "change",

    function(event){

        const file =
        event.target.files[0];

        if(file){

            previewImage.src =
            URL.createObjectURL(file);

            previewImage.style.display =
            "block";
        }

    }
);


// =========================
// PREDICT
// =========================

predictBtn.addEventListener(

    "click",

    async function(){

        // Belum upload
        if(

             previewImage.style.display
             === "none"

            &&

            !webcamActive

        ){

            resetPrediction();
            alert(
                "Upload gambar atau aktifkan kamera terlebih dahulu!"
            );

            return;
        }

        // Loading
        loading.style.display =
        "block";

        resultContainer.style.display =
        "none";

        // Predict AI
        const prediction =
        await model.predict(
            previewImage
        );

        // Cari hasil tertinggi
        let highest =
        prediction[0];

        for(
            let i = 1;
            i < prediction.length;
            i++
        ){

            if(

                prediction[i].probability >

                highest.probability

            ){

                highest =
                prediction[i];
            }
        }

        // Confidence
        const confidence = (

            highest.probability * 100

        ).toFixed(2);

        // Delay biar smooth
        setTimeout(function(){

            loading.style.display =
            "none";

            resultContainer.style.display =
            "block";

            animalName.innerHTML =
            highest.className;

            confidenceText.innerHTML =
            confidence + "%";

            progressFill.style.width =
            confidence + "%";

        }, 1000);

    }
    
);

function showSection(sectionId){

    // Ambil semua section
    const sections = [

        document.getElementById("detectSection"),

        document.getElementById("questionSection")

    ];

    // Hide semua
    sections.forEach(function(section){

        section.style.display = "none";

    });

    // Tampilkan section dipilih
    document.getElementById(sectionId)
    .style.display = "flex";
}

function resetPrediction(){

    resultContainer.style.display =
    "none";

    animalName.innerHTML = "-";

    confidenceText.innerHTML = "0%";

    progressFill.style.width = "0%";

}
// DEFAULT SECTION
showSection("detectSection");