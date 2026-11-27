let filtreEix = "Tots";
let alumnat = JSON.parse(
    localStorage.getItem("bitacola_alumnat") || "[]"
);

let alumnesSeleccionats = [];

// ELEMENTS DE LA INTERFÍCIE

const campData = document.getElementById("data");
const campReflexio = document.getElementById("reflexio");
const etiquetes = document.querySelectorAll(".etiqueta");
const botoDesar = document.getElementById("desar");
const quadern = document.getElementById("registres");


// DATA AUTOMÀTICA

function dataAvui() {
    const avui = new Date();

    const any = avui.getFullYear();
    const mes = String(avui.getMonth() + 1).padStart(2, "0");
    const dia = String(avui.getDate()).padStart(2, "0");

    return `${any}-${mes}-${dia}`;
}

campData.value = dataAvui();


// RECUPERAR ELS REGISTRES DESATS

let registres = JSON.parse(
    localStorage.getItem("bitacola_registres") || "[]"
);


// SELECCIONAR I DESMARCAR ETIQUETES

etiquetes.forEach(etiqueta => {

    etiqueta.setAttribute("aria-pressed", "false");

    etiqueta.addEventListener("click", () => {

        etiqueta.classList.toggle("activa");

        etiqueta.setAttribute(
            "aria-pressed",
            etiqueta.classList.contains("activa")
        );

    });

});

let registreEnEdicio = null;
// DESAR UN NOU REGISTRE

botoDesar.addEventListener("click", () => {

    const text = campReflexio.value.trim();

    if (!text) {
        campReflexio.focus();
        return;
    }

    if (!campData.value) {
        campData.value = dataAvui();
    }

    const eixosSeleccionats = Array.from(
        document.querySelectorAll(".etiqueta.activa")
    ).map(etiqueta => etiqueta.dataset.eix);

    const nouRegistre = {
    id: registreEnEdicio ?? Date.now(),
    data: campData.value,
    text: text,
    eixos: eixosSeleccionats,
alumnes: [...alumnesSeleccionats]
};

const registresAnteriors = [...registres];

if (registreEnEdicio !== null) {

    registres = registres.map(registre =>
        registre.id === registreEnEdicio
            ? nouRegistre
            : registre
    );

} else {

    registres.push(nouRegistre);

}

try {
    localStorage.setItem(
        "bitacola_registres",
        JSON.stringify(registres)
    );
} catch (error) {
    registres = registresAnteriors;
    alert("No s'ha pogut desar el registre.");
    return;
}

registreEnEdicio = null;
botoDesar.textContent = "Desar registre";
document.getElementById("titol-formulari").textContent = "Nou registre";
document.getElementById("cancel-lar").hidden = true;

    campReflexio.value = "";
    alumnesSeleccionats = [];

document.getElementById("selector-alumnat").open = false;

mostrarSelectorAlumnat();
    campData.value = dataAvui();

    etiquetes.forEach(etiqueta => {
        etiqueta.classList.remove("activa");
        etiqueta.setAttribute("aria-pressed", "false");
    });

    

    mostrarRegistres();

    campReflexio.focus();

});


// FORMAT DE LA DATA

function formatarData(data) {

    const [any, mes, dia] = data.split("-");

    return `${dia}/${mes}/${any}`;

}


// MOSTRAR EL QUADERN DE BITÀCOLA

function mostrarRegistres() {

    mostrarSeguiment();

    quadern.innerHTML = "";

    if (registres.length === 0) {

        const missatge = document.createElement("p");

        missatge.textContent =
            "Encara no hi ha cap registre. El quadern anirà creixent al teu ritme.";

        missatge.style.color = "#777b74";

        quadern.appendChild(missatge);

        return;

    }

    const filtreAlumne =
    document.getElementById("filtre-alumnat").value || "Tots";

const registresFiltrats = registres.filter(registre => {

    const coincideixEix =
        filtreEix === "Tots" ||
        (registre.eixos || []).includes(filtreEix);

    const coincideixAlumne =
        filtreAlumne === "Tots" ||
        (registre.alumnes || []).includes(filtreAlumne);

    return coincideixEix && coincideixAlumne;

});

if (registresFiltrats.length === 0) {

    const missatge = document.createElement("p");

    missatge.textContent =
        "No hi ha cap reflexió que coincideixi amb els filtres seleccionats.";

    missatge.style.color = "#777b74";

    quadern.appendChild(missatge);

    return;
}

const registresOrdenats = [...registresFiltrats].sort(
    (a, b) =>
        b.data.localeCompare(a.data) || b.id - a.id
);

    registresOrdenats.forEach(registre => {

        const element = document.createElement("article");
        element.className = "registre";

        const data = document.createElement("div");
        data.className = "registre-data";
        data.textContent = formatarData(registre.data);
const botoEditar = document.createElement("button");

botoEditar.className = "boto-accio";
botoEditar.textContent = "✎";
botoEditar.title = "Editar registre";
botoEditar.type = "button";
botoEditar.setAttribute("aria-label", "Editar registre");

botoEditar.addEventListener("click", () => {
    editarRegistre(registre.id);
});

data.appendChild(botoEditar);
const botoEliminar = document.createElement("button");

botoEliminar.className = "boto-accio boto-eliminar";
botoEliminar.textContent = "🗑";
botoEliminar.title = "Eliminar registre";
botoEliminar.type = "button";
botoEliminar.setAttribute("aria-label", "Eliminar registre");

botoEliminar.addEventListener("click", () => {
    eliminarRegistre(registre.id);
});

data.appendChild(botoEliminar);
        const text = document.createElement("div");
        text.className = "registre-text";
        text.textContent = registre.text;

        const grupEtiquetes = document.createElement("div");
        grupEtiquetes.className = "registre-etiquetes";

        registre.eixos.forEach(eix => {

            const etiqueta = document.createElement("span");

            etiqueta.className =
                "mini-etiqueta " + eix.toLowerCase();

            etiqueta.textContent =
    eix === "Documentar" ? "Documentació" : eix;

            grupEtiquetes.appendChild(etiqueta);

        });

        element.appendChild(data);
        element.appendChild(text);
        element.appendChild(grupEtiquetes);
        const nomsAlumnes = (registre.alumnes || [])
    .map(id => alumnat.find(a => a.id === id))
    .filter(alumne => alumne)
    .map(alumne => alumne.nom);

if (nomsAlumnes.length > 0) {

    const vinculacions = document.createElement("div");

    vinculacions.className = "registre-alumnes";

    vinculacions.textContent =
        "♧ " + nomsAlumnes.join(" · ");

    element.appendChild(vinculacions);

}

        quadern.appendChild(element);

    });

}


// INICIAR L'APLICACIÓ

mostrarRegistres();
// ICONES D'INFORMACIÓ PEDAGÒGICA

etiquetes.forEach(etiqueta => {

    const contenidor = document.createElement("div");
    contenidor.className = "grup-etiqueta";

    etiqueta.parentNode.insertBefore(contenidor, etiqueta);
    contenidor.appendChild(etiqueta);

    const botoInfo = document.createElement("button");

    botoInfo.className = "boto-info";
    botoInfo.textContent = "ⓘ";
    botoInfo.title = "Consultar orientacions pedagògiques";
    botoInfo.type = "button";

    contenidor.appendChild(botoInfo);

});
// CONTINGUT PEDAGÒGIC DE LA BRÚIXOLA

const orientacions = {

    Comprendre: {
        titol: "Comprendre",
        pregunta: "Què està passant?",
        finalitat: "Aturar-nos a interpretar, donar sentit i prendre consciència del procés.",
        recursos: "Cercles de diàleg, converses obertes, VTS, mapes conceptuals, línia del temps, moments clau, glossari i preguntes metacognitives."
    },

    Explorar: {
        titol: "Explorar",
        pregunta: "I si ho féssim d'una altra manera?",
        finalitat: "Obrir possibilitats, experimentar i descobrir nous camins.",
        recursos: "Buscar referents, petites investigacions, nous materials, variacions, microreptes, restriccions creatives, hipòtesis i generació d'idees."
    },

    Consolidar: {
        titol: "Consolidar",
        pregunta: "Què necessita més temps?",
        finalitat: "Aprofundir, donar continuïtat i madurar allò que s'ha iniciat.",
        recursos: "Assajar, repetir, revisar, millorar, organitzar, planificar, acabar peces, distribuir tasques, preparar mostres i revisar acords."
    },

    Connectar: {
        titol: "Connectar",
        pregunta: "Amb què es relaciona això?",
        finalitat: "Establir relacions entre el procés creatiu i altres àmbits de l'experiència.",
        recursos: "Currículum, altres matèries, experiències personals, barri, entrevistes, visites, altres obres, actualitat, famílies i el món que habitem."
    },

    Documentar: {
        titol: "Documentació",
        pregunta: "Com deixem rastre del que anem descobrint?",
        finalitat: "Fer visible el procés, conservar-ne la memòria i facilitar-ne la reflexió posterior.",
        recursos: "Blog, mural, àudios, vídeos, fotografies comentades, llibreta d'artista, diari i portafolis."
    }

};

// MOSTRAR I OCULTAR LES ORIENTACIONS

const panellOrientacio =
    document.getElementById("orientacio-eix");

let eixObert = null;

document.querySelectorAll(".grup-etiqueta").forEach(grup => {

    const etiqueta = grup.querySelector(".etiqueta");
    const botoInfo = grup.querySelector(".boto-info");

    botoInfo.setAttribute("aria-expanded", "false");

    botoInfo.addEventListener("click", () => {

        const eix = etiqueta.dataset.eix;

        document.querySelectorAll(".boto-info").forEach(boto => {
            boto.setAttribute("aria-expanded", "false");
        });

        if (eixObert === eix) {

            panellOrientacio.hidden = true;
            eixObert = null;
            return;

        }

        const info = orientacions[eix];

        panellOrientacio.innerHTML = `
            <h3>${info.titol}</h3>
            <p class="pregunta-eix">${info.pregunta}</p>
            <p>${info.finalitat}</p>
            <p><strong>Recursos i possibilitats:</strong></p>
            <p>${info.recursos}</p>
        `;

        panellOrientacio.className = eix.toLowerCase();
        panellOrientacio.hidden = false;

        botoInfo.setAttribute("aria-expanded", "true");

        eixObert = eix;

    });

});
// EDITAR UN REGISTRE EXISTENT

function editarRegistre(id) {

    const registre = registres.find(r => r.id === id);

    if (!registre) return;

    registreEnEdicio = id;

    campData.value = registre.data;
    campReflexio.value = registre.text;
    alumnesSeleccionats = [...(registre.alumnes || [])];

mostrarSelectorAlumnat();

document.getElementById("selector-alumnat").open = false;

    etiquetes.forEach(etiqueta => {

        const seleccionada = registre.eixos.includes(
            etiqueta.dataset.eix
        );

        etiqueta.classList.toggle("activa", seleccionada);

        etiqueta.setAttribute(
            "aria-pressed",
            String(seleccionada)
        );

    });

    botoDesar.textContent = "Desar modificacions";
    document.getElementById("titol-formulari").textContent = "Editar registre";
    document.getElementById("cancel-lar").hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    campReflexio.focus({ preventScroll: true });

}// ELIMINAR UN REGISTRE

function eliminarRegistre(id) {

    if (registreEnEdicio === id) {
        alert("Acaba l'edició abans d'eliminar aquest registre.");
        return;
    }

    const confirmacio = confirm(
        "Vols eliminar definitivament aquest registre?"
    );

    if (!confirmacio) return;

    const registresAnteriors = [...registres];

    registres = registres.filter(registre =>
        registre.id !== id
    );

    try {

        localStorage.setItem(
            "bitacola_registres",
            JSON.stringify(registres)
        );

    } catch (error) {

        registres = registresAnteriors;
        alert("No s'ha pogut eliminar el registre.");
        return;

    }

    mostrarRegistres();

}// CANCEL·LAR L'EDICIÓ

document.getElementById("cancel-lar").addEventListener("click", () => {

    registreEnEdicio = null;

    campReflexio.value = "";
    alumnesSeleccionats = [];

mostrarSelectorAlumnat();

document.getElementById("selector-alumnat").open = false;
    campData.value = new Date().toLocaleDateString("sv-SE");

    etiquetes.forEach(etiqueta => {

        etiqueta.classList.remove("activa");
        etiqueta.setAttribute("aria-pressed", "false");

    });

    botoDesar.textContent = "Desar registre";
    document.getElementById("titol-formulari").textContent = "Nou registre";

    document.getElementById("cancel-lar").hidden = true;

    panellOrientacio.hidden = true;
    eixObert = null;

    document.querySelectorAll(".boto-info").forEach(boto => {
        boto.setAttribute("aria-expanded", "false");
    });

});
// NAVEGACIÓ ENTRE BITÀCOLA I CONFIGURACIÓ

const paginaBitacola =
    document.getElementById("pagina-bitacola");

const paginaConfiguracio =
    document.getElementById("pagina-configuracio");

document.getElementById("obrir-configuracio")
    .addEventListener("click", () => {

        paginaBitacola.hidden = true;
        paginaConfiguracio.hidden = false;

        window.scrollTo(0, 0);

    });

document.getElementById("tornar-bitacola")
    .addEventListener("click", () => {

        paginaConfiguracio.hidden = true;
        paginaBitacola.hidden = false;
        mostrarCapcaleraProjecte();
mostrarSelectorAlumnat();
mostrarFiltreAlumnat();
mostrarRegistres();

        window.scrollTo(0, 0);

    });
    // DESAR I RECUPERAR LES DADES DEL PROJECTE

const campsProjecte = [
    "nom-projecte",
    "nom-centre",
    "nom-grup",
    "curs-academic"
];

let dadesProjecte = JSON.parse(
    localStorage.getItem("bitacola_projecte") || "{}"
);

campsProjecte.forEach(camp => {

    document.getElementById(camp).value =
        dadesProjecte[camp] || "";

});

document.getElementById("desar-configuracio")
    .addEventListener("click", () => {

        const novesDades = {};

        campsProjecte.forEach(camp => {

            novesDades[camp] =
                document.getElementById(camp).value.trim();

        });

        try {

            localStorage.setItem(
                "bitacola_projecte",
                JSON.stringify(novesDades)
            );

            dadesProjecte = novesDades;
            const nouAlumnat = prepararNousAlumnes();

localStorage.setItem(
    "bitacola_alumnat",
    JSON.stringify(nouAlumnat)
);

alumnat = nouAlumnat;

campImportacio.value = "";
mostrarAlumnat();

        } catch (error) {

            alert("No s'ha pogut desar la configuració.");
            return;

        }
alert("Configuració desada correctament.");

    });
    // GESTIÓ DE L'ALUMNAT



const campImportacio =
    document.getElementById("llista-importacio");

function prepararNousAlumnes() {

    const noms = campImportacio.value
        .split("\n")
        .map(nom => nom.trim())
        .filter(nom => nom !== "");

    const nouAlumnat = [...alumnat];

    noms.forEach(nom => {

    const existent = nouAlumnat.find(alumne =>
        alumne.nom.toLocaleLowerCase("ca") ===
        nom.toLocaleLowerCase("ca")
    );

    if (existent) {

        existent.actiu = true;

    } else {

        nouAlumnat.push({
            id: crypto.randomUUID(),
            nom: nom,
            actiu: true
        });

    }

});

    return nouAlumnat;

}
// MOSTRAR LA LLISTA D'ALUMNES

function mostrarAlumnat() {

    const llista = document.getElementById("llista-alumnes");

    llista.innerHTML = "";

    const alumnesActius = alumnat
        .filter(alumne => alumne.actiu)
        .sort((a, b) => a.nom.localeCompare(b.nom, "ca"));

    mostrarBaixes();

if (alumnesActius.length === 0) return;

    const recompte = document.createElement("p");

    recompte.className = "recompte-alumnes";
    recompte.textContent =
        "Alumnes participants: " + alumnesActius.length;

    llista.appendChild(recompte);

    const graella = document.createElement("div");

    graella.className = "graella-alumnes";

    alumnesActius.forEach(alumne => {

        const fitxa = document.createElement("div");

        fitxa.className = "fitxa-alumne";
        fitxa.textContent = alumne.nom;
        const botoEditar = document.createElement("button");

botoEditar.className = "boto-accio";
botoEditar.textContent = "✎";
botoEditar.title = "Editar nom";
botoEditar.type = "button";
botoEditar.setAttribute("aria-label", "Editar nom");

botoEditar.addEventListener("click", () => {
    editarAlumne(alumne.id);
});

fitxa.appendChild(botoEditar);
const botoBaixa = document.createElement("button");

botoBaixa.className = "boto-accio boto-baixa";
botoBaixa.textContent = "−";
botoBaixa.title = "Donar de baixa";
botoBaixa.type = "button";
botoBaixa.setAttribute("aria-label", "Donar de baixa");

botoBaixa.addEventListener("click", () => {
    baixaAlumne(alumne.id);
});

fitxa.appendChild(botoBaixa);

        graella.appendChild(fitxa);

    });

    llista.appendChild(graella);

}

mostrarAlumnat();
// EDITAR EL NOM D'UN ALUMNE

function editarAlumne(id) {

    const alumne = alumnat.find(a => a.id === id);

    if (!alumne) return;

    const resposta = prompt(
        "Modifica el nom de l'alumne:",
        alumne.nom
    );

    if (resposta === null) return;

    const nouNom = resposta.trim();

    if (!nouNom) return;

    const duplicat = alumnat.some(a =>
        a.id !== id &&
        a.nom.toLocaleLowerCase("ca") ===
        nouNom.toLocaleLowerCase("ca")
    );

    if (duplicat) {
        alert("Ja existeix un alumne amb aquest nom.");
        return;
    }

    const nouAlumnat = alumnat.map(a =>
        a.id === id ? { ...a, nom: nouNom } : a
    );

    try {

        localStorage.setItem(
            "bitacola_alumnat",
            JSON.stringify(nouAlumnat)
        );

        alumnat = nouAlumnat;

    } catch (error) {

        alert("No s'ha pogut modificar el nom.");
        return;

    }

    mostrarAlumnat();

}
// DONAR DE BAIXA UN ALUMNE

function baixaAlumne(id) {

    const alumne = alumnat.find(a => a.id === id);

    if (!alumne) return;

    const confirmacio = confirm(
        "Vols donar de baixa " + alumne.nom +
        "? Es conservaran les reflexions vinculades."
    );

    if (!confirmacio) return;

    const nouAlumnat = alumnat.map(a =>
        a.id === id ? { ...a, actiu: false } : a
    );

    try {

        localStorage.setItem(
            "bitacola_alumnat",
            JSON.stringify(nouAlumnat)
        );

        alumnat = nouAlumnat;

    } catch (error) {

        alert("No s'ha pogut donar de baixa l'alumne.");
        return;

    }

    mostrarAlumnat();

}
// MOSTRAR ELS ALUMNES DONATS DE BAIXA

function mostrarBaixes() {

    const apartat = document.getElementById("apartat-baixes");
    const resum = document.getElementById("resum-baixes");
    const llista = document.getElementById("llista-baixes");

    const alumnesBaixa = alumnat
        .filter(alumne => !alumne.actiu)
        .sort((a, b) => a.nom.localeCompare(b.nom, "ca"));

    apartat.hidden = alumnesBaixa.length === 0;

    resum.textContent =
        "Alumnes donats de baixa (" + alumnesBaixa.length + ")";

    llista.innerHTML = "";

    alumnesBaixa.forEach(alumne => {

        const fitxa = document.createElement("div");

        fitxa.className = "fitxa-alumne";
        fitxa.textContent = alumne.nom;

        llista.appendChild(fitxa);

    });

}
// VINCULACIÓ DE REFLEXIONS AMB L'ALUMNAT



function mostrarSelectorAlumnat() {

    const apartat = document.getElementById("vinculacio-alumnat");
    const llista = document.getElementById("alumnes-seleccionables");

    const alumnesActius = alumnat
        .filter(alumne => alumne.actiu)
        .sort((a, b) => a.nom.localeCompare(b.nom, "ca"));

    apartat.hidden = alumnesActius.length === 0;

    llista.innerHTML = "";

    alumnesActius.forEach(alumne => {

        const boto = document.createElement("button");

        boto.type = "button";
        boto.className = "alumne-seleccionable";
        boto.textContent = alumne.nom;
        boto.classList.toggle(
    "actiu",
    alumnesSeleccionats.includes(alumne.id)
);

boto.addEventListener("click", () => {

    if (alumnesSeleccionats.includes(alumne.id)) {

        alumnesSeleccionats = alumnesSeleccionats.filter(
            id => id !== alumne.id
        );

    } else {

        alumnesSeleccionats.push(alumne.id);

    }

    mostrarSelectorAlumnat();

});

        llista.appendChild(boto);

       });

    const resum = document.getElementById("alumnes-seleccionats");

    resum.innerHTML = "";

    alumnesSeleccionats.forEach(id => {

        const alumne = alumnat.find(a => a.id === id);

        if (!alumne) return;

        const etiqueta = document.createElement("button");

        etiqueta.type = "button";
        etiqueta.className = "alumne-vinculat";
        etiqueta.textContent = alumne.nom + " ×";

        etiqueta.addEventListener("click", () => {

            alumnesSeleccionats = alumnesSeleccionats.filter(
                a => a !== id
            );

            mostrarSelectorAlumnat();

        });

        resum.appendChild(etiqueta);

    });

}

mostrarSelectorAlumnat();
mostrarRegistres();
// SEGUIMENT DEL PROCÉS

function mostrarSeguiment() {

    const grafic = document.getElementById("grafic-eixos");

    const eixos = [
        { id: "Comprendre", nom: "Comprendre", color: "#78945b" },
        { id: "Explorar", nom: "Explorar", color: "#c39b39" },
        { id: "Consolidar", nom: "Consolidar", color: "#bd8068" },
        { id: "Connectar", nom: "Connectar", color: "#568da8" },
        { id: "Documentar", nom: "Documentació", color: "#555b65" }
    ];

    const recomptes = eixos.map(eix =>
        registres.filter(registre =>
            (registre.eixos || []).includes(eix.id)
        ).length
    );

    const maxim = Math.max(1, ...recomptes);


    grafic.innerHTML = "";

    eixos.forEach((eix, index) => {

        const fila = document.createElement("div");
        fila.className = "fila-seguiment";

        const nom = document.createElement("span");
        nom.className = "nom-eix";
        nom.textContent = eix.nom;

        const pista = document.createElement("div");
        pista.className = "pista-barra";

        const barra = document.createElement("div");
        barra.className = "barra-seguiment";
        barra.style.backgroundColor = eix.color;
        barra.style.width = (recomptes[index] / maxim * 100) + "%";

        const nombre = document.createElement("span");
        nombre.className = "nombre-seguiment";
        nombre.textContent = recomptes[index];

        pista.appendChild(barra);

        fila.appendChild(nom);
        fila.appendChild(pista);
        fila.appendChild(nombre);

        grafic.appendChild(fila);

    });

}

mostrarSeguiment();
// FILTRES DEL QUADERN



const botonsFiltre = document.querySelectorAll(".filtre-eix");

botonsFiltre.forEach(boto => {

    boto.addEventListener("click", () => {

        filtreEix = boto.dataset.filtre;

        botonsFiltre.forEach(b => {
            b.classList.toggle("actiu", b === boto);
        });

        mostrarRegistres();

    });

});
// CARREGAR EL FILTRE PER ALUMNAT

function mostrarFiltreAlumnat() {

    const contenidor = document.getElementById(
        "filtre-alumnat-contenidor"
    );

    const selector = document.getElementById("filtre-alumnat");

    const seleccioAnterior = selector.value;

    const alumnesOrdenats = [...alumnat].sort(
        (a, b) => a.nom.localeCompare(b.nom, "ca")
    );

    contenidor.hidden = alumnesOrdenats.length === 0;

    selector.innerHTML = '<option value="Tots">Tot l’alumnat</option>';

    alumnesOrdenats.forEach(alumne => {

        const opcio = document.createElement("option");

        opcio.value = alumne.id;
        opcio.textContent = alumne.nom +
            (alumne.actiu ? "" : " (baixa)");

        selector.appendChild(opcio);

    });

    selector.value = seleccioAnterior || "Tots";

    if (!selector.value) {
        selector.value = "Tots";
    }

}

mostrarFiltreAlumnat();
document.getElementById("filtre-alumnat")
    .addEventListener("change", mostrarRegistres);
    // MOSTRAR LES DADES DEL PROJECTE A LA CAPÇALERA

function mostrarCapcaleraProjecte() {

    const capcalera = document.getElementById("capcalera-projecte");

    const titol = document.getElementById("titol-projecte");

    const informacio = document.getElementById("informacio-projecte");

    titol.textContent = dadesProjecte["nom-projecte"] || "";

    const dades = [
        dadesProjecte["nom-centre"],
        dadesProjecte["nom-grup"],
        dadesProjecte["curs-academic"]
    ].filter(Boolean);

    informacio.textContent = dades.join(" · ");

    capcalera.hidden =
        !titol.textContent && dades.length === 0;

}

mostrarCapcaleraProjecte();
// EXPORTAR UNA CÒPIA DE SEGURETAT

document.getElementById("exportar-copia")
    .addEventListener("click", () => {

        const copia = {
            aplicacio: "Bitacola",
            versio: 1,
            dataExportacio: new Date().toISOString(),
            projecte: dadesProjecte,
            alumnat: alumnat,
            registres: registres
        };

        const contingut = JSON.stringify(copia, null, 2);

        const arxiu = new Blob(
            [contingut],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(arxiu);

        const enllac = document.createElement("a");

        enllac.href = url;
        enllac.download = "Bitacola_copia_" + dataAvui() + ".json";

        document.body.appendChild(enllac);

        enllac.click();

        enllac.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

    });
    // VALIDAR UNA CÒPIA DE SEGURETAT

function validarCopia(copia) {

    return (
        copia !== null &&
        typeof copia === "object" &&
        copia.aplicacio === "Bitacola" &&
        copia.versio === 1 &&
        copia.projecte !== null &&
        typeof copia.projecte === "object" &&
        !Array.isArray(copia.projecte) &&
        Array.isArray(copia.alumnat) &&
        Array.isArray(copia.registres) &&

        copia.alumnat.every(alumne =>
            alumne &&
            typeof alumne.id === "string" &&
            typeof alumne.nom === "string" &&
            typeof alumne.actiu === "boolean"
        ) &&

        copia.registres.every(registre =>
            registre &&
            typeof registre.id === "number" &&
            typeof registre.data === "string" &&
            typeof registre.text === "string" &&
            Array.isArray(registre.eixos) &&
            (
    registre.alumnes === undefined ||
    Array.isArray(registre.alumnes)
)
        )
    );

}
// IMPORTAR UNA CÒPIA DE SEGURETAT

document.getElementById("arxiu-copia")
    .addEventListener("change", async () => {

        const selector = document.getElementById("arxiu-copia");
        const arxiu = selector.files[0];

        if (!arxiu) return;

        let copia;

        try {

            const contingut = await arxiu.text();
            copia = JSON.parse(contingut);

            if (!validarCopia(copia)) {
                throw new Error("Còpia no vàlida");
            }

        } catch (error) {

            alert("L'arxiu no és una còpia de Bitàcola vàlida.");
            return;

        }

        const confirmacio = confirm(
            "La còpia conté " +
            copia.registres.length + " reflexions i " +
            copia.alumnat.length + " alumnes.\n\n" +
            "La importació substituirà totes les dades actuals.\n\n" +
            "Vols continuar?"
        );

        if (!confirmacio) return;

        const claus = [
            "bitacola_projecte",
            "bitacola_alumnat",
            "bitacola_registres"
        ];

        const dadesAnteriors = claus.map(
            clau => localStorage.getItem(clau)
        );

        try {

            localStorage.setItem(
                claus[0], JSON.stringify(copia.projecte)
            );

            localStorage.setItem(
                claus[1], JSON.stringify(copia.alumnat)
            );

            localStorage.setItem(
                claus[2], JSON.stringify(copia.registres)
            );

        } catch (error) {

            try {

                claus.forEach((clau, index) => {

                    if (dadesAnteriors[index] === null) {
                        localStorage.removeItem(clau);
                    } else {
                        localStorage.setItem(
                            clau, dadesAnteriors[index]
                        );
                    }

                });

                alert("No s'ha pogut importar la còpia. S'han recuperat les dades anteriors.");

            } catch (errorRecuperacio) {

                alert("Error d'emmagatzematge. Recupera les dades des d'una còpia de seguretat.");

            }

            return;

        }

        alert("Còpia importada correctament.");

        window.location.reload();

    });
    // SELECCIONAR UNA CÒPIA DE SEGURETAT

document.getElementById("importar-copia")
    .addEventListener("click", () => {

        const selector = document.getElementById("arxiu-copia");

        selector.value = "";

        selector.click();

    });
    // MENÚ D'EXPORTACIÓ DEL QUADERN

const opcionsExportacio =
    document.getElementById("opcions-exportacio");

document.getElementById("exportar-quadern")
    .addEventListener("click", () => {

        opcionsExportacio.hidden =
            !opcionsExportacio.hidden;

    });

document.getElementById("cancel-lar-exportacio")
    .addEventListener("click", () => {

        opcionsExportacio.hidden = true;

    });
    // GENERAR EL QUADERN IMPRIMIBLE

function imprimirQuadern(reflexions, subtitol) {

    if (reflexions.length === 0) {
        alert("No hi ha reflexions per exportar.");
        return;
    }

    const finestra = window.open("", "_blank");

    if (!finestra) {
        alert("El navegador ha bloquejat la finestra d'impressió.");
        return;
    }

    const doc = finestra.document;

    doc.title = "Bitàcola - Quadern de reflexions";
    doc.documentElement.lang = "ca";

    const estil = doc.createElement("style");

    estil.textContent = `
        @page {
            size: A4;
            margin: 20mm;
        }

        body {
            font-family: Georgia, serif;
            color: #343b30;
            line-height: 1.6;
            max-width: 800px;
            margin: 30px auto;
            padding: 20px;
        }

        h1 {
            font-size: 36px;
            margin-bottom: 0;
        }

        h2 {
            font-size: 22px;
            margin-bottom: 5px;
        }

        .informacio {
            color: #777b74;
            font-size: 13px;
        }

        article {
            border-top: 1px solid #d8dbd3;
            padding: 18px 0;
            break-inside: avoid;
        }

        .data {
            font-weight: bold;
            font-size: 14px;
        }

        .reflexio {
            white-space: pre-wrap;
            overflow-wrap: anywhere;
        }

        .etiquetes, .alumnes {
            font-size: 12px;
            color: #666;
        }

        @media print {
            body {
                margin: 0;
                padding: 0;
            }
        }
    `;

    doc.head.appendChild(estil);

    function afegirElement(pare, tipus, text, classe) {

        const element = doc.createElement(tipus);

        element.textContent = text;

        if (classe) {
            element.className = classe;
        }

        pare.appendChild(element);

        return element;
    }

    afegirElement(doc.body, "h1", "Bitàcola");

    afegirElement(
        doc.body, "p",
        "Deixar rastre del procés", "informacio"
    );

    afegirElement(
        doc.body, "h2",
        dadesProjecte["nom-projecte"] || "Quadern de reflexions"
    );

    const informacio = [
        dadesProjecte["nom-centre"],
        dadesProjecte["nom-grup"],
        dadesProjecte["curs-academic"]
    ].filter(Boolean).join(" · ");

    afegirElement(doc.body, "p", informacio, "informacio");

    afegirElement(
        doc.body, "p",
        subtitol + " · " + reflexions.length + " reflexions",
        "informacio"
    );

    const ordenades = [...reflexions].sort(
        (a, b) => b.data.localeCompare(a.data) || b.id - a.id
    );

    ordenades.forEach(registre => {

        const article = doc.createElement("article");

        doc.body.appendChild(article);

        const data = new Date(registre.data + "T12:00:00")
            .toLocaleDateString("ca-ES", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });

        afegirElement(article, "div", data, "data");

        afegirElement(
            article, "p", registre.text, "reflexio"
        );

        const eixos = (registre.eixos || []).map(
            eix => eix === "Documentar" ? "Documentació" : eix
        );

        if (eixos.length) {
            afegirElement(
                article, "p",
                eixos.join(" · "), "etiquetes"
            );
        }

        const noms = (registre.alumnes || [])
            .map(id => alumnat.find(alumne => alumne.id === id))
            .filter(Boolean)
            .map(alumne => alumne.nom);

        if (noms.length) {
            afegirElement(
                article, "p",
                "Alumnat: " + noms.join(", "), "alumnes"
            );
        }

    });

    finestra.focus();
    finestra.print();

}
// ACTIVAR L'EXPORTACIÓ DEL QUADERN

document.getElementById("exportar-tot")
    .addEventListener("click", () => {

        opcionsExportacio.hidden = true;

        imprimirQuadern(registres, "Quadern complet");

    });

document.getElementById("exportar-seleccio")
    .addEventListener("click", () => {

        const filtreAlumne =
            document.getElementById("filtre-alumnat").value || "Tots";

        const seleccio = registres.filter(registre => {

            const coincideixEix =
                filtreEix === "Tots" ||
                (registre.eixos || []).includes(filtreEix);

            const coincideixAlumne =
                filtreAlumne === "Tots" ||
                (registre.alumnes || []).includes(filtreAlumne);

            return coincideixEix && coincideixAlumne;

        });

        opcionsExportacio.hidden = true;

        const criteris = [];

if (filtreEix !== "Tots") {

    criteris.push(
        "Àmbit: " +
        (filtreEix === "Documentar" ? "Documentació" : filtreEix)
    );

}

if (filtreAlumne !== "Tots") {

    const alumne = alumnat.find(
        a => a.id === filtreAlumne
    );

    if (alumne) {
        criteris.push("Alumne: " + alumne.nom);
    }

}

const subtitol = criteris.length
    ? criteris.join(" · ")
    : "Quadern complet";

imprimirQuadern(seleccio, subtitol);

    });