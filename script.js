document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("formular");
    const raspuns = document.getElementById("raspuns");
    const toggleTheme = document.getElementById("toggleTheme");
    const resetBtn = document.getElementById("resetData");
    const loader = document.getElementById("loader");

    // 🔹 LOAD THEME
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }

    // 🔹 TOGGLE DARK MODE
    toggleTheme.addEventListener("click", () => {
        document.body.classList.toggle("dark");

        let theme = document.body.classList.contains("dark") ? "dark" : "light";
        localStorage.setItem("theme", theme);
    });

    // 🔹 LOAD USER
    let savedUser = localStorage.getItem("user");

    if (savedUser) {
        let user = JSON.parse(savedUser);
        raspuns.innerHTML = `👋 Bine ai revenit, <b>${user.nume}</b>`;
    }

    // 🔹 FORM SUBMIT
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        loader.style.display = "block";

        setTimeout(() => {

            let nume = document.getElementById("nume").value.trim();
            let varsta = parseInt(document.getElementById("varsta").value);
            let email = document.getElementById("email").value.trim();

            let erori = [];

            if (nume.length < 3) {
                erori.push("Numele prea scurt");
            }

            if (varsta < 10 || varsta > 100) {
                erori.push("Vârsta invalidă");
            }

            if (!email.includes("@")) {
                erori.push("Email invalid");
            }

            if (erori.length > 0) {
                raspuns.style.color = "red";
                raspuns.innerHTML = "❌ " + erori.join("<br>");
                loader.style.display = "none";
                return;
            }

            let user = { nume, varsta, email };
            localStorage.setItem("user", JSON.stringify(user));

            raspuns.style.color = "green";
            raspuns.innerHTML = `✅ Bun venit ${nume}!`;

            loader.style.display = "none";
            form.reset();

        }, 1500); // loading fake
    });

    // 🔹 RESET DATA
    resetBtn.addEventListener("click", () => {
        localStorage.removeItem("user");
        raspuns.innerHTML = "🗑 Date șterse!";
        raspuns.style.color = "orange";
    });

});