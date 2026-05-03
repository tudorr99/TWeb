document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("formular");
    const raspuns = document.getElementById("raspuns");
    const toggleTheme = document.getElementById("toggleTheme");
    const resetBtn = document.getElementById("resetData");
    const loader = document.getElementById("loader");

    // ── LOAD THEME ──────────────────────────────────────────────
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        if (toggleTheme) {
            toggleTheme.textContent = "☀️ Light Mode";
        }
    }

    // ── TOGGLE DARK MODE ─────────────────────────────────────────
    if (toggleTheme) {
        toggleTheme.addEventListener("click", () => {
            document.body.classList.toggle("dark");
            const isDark = document.body.classList.contains("dark");
            localStorage.setItem("theme", isDark ? "dark" : "light");
            toggleTheme.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
        });
    }

    // ── LOAD SAVED USER ───────────────────────────────────────────
    const savedUser = localStorage.getItem("user");
    if (savedUser && raspuns) {
        const user = JSON.parse(savedUser);
        raspuns.innerHTML = `👋 Bine ai revenit, <b>${user.nume}</b>!`;
        raspuns.style.color = "#27ae60";
    }

    // ── VALIDARE ────────────────────────────────────────────────

    function setError(fieldId, mesaj) {
        const field = document.getElementById(fieldId);
        const errSpan = document.getElementById("err-" + fieldId);
        if (field) field.classList.add("invalid");
        if (errSpan) errSpan.textContent = mesaj;
    }

    function clearError(fieldId) {
        const field = document.getElementById(fieldId);
        const errSpan = document.getElementById("err-" + fieldId);
        if (field) field.classList.remove("invalid");
        if (errSpan) errSpan.textContent = "";
    }

    function validareCamp(fieldId) {
        const el = document.getElementById(fieldId);
        if (!el) return true;

        const val = el.value.trim();
        clearError(fieldId);

        if (fieldId === "nume") {
            if (val.length < 3) {
                setError("nume", "⚠️ Minim 3 caractere.");
                return false;
            }
        }

        if (fieldId === "varsta") {
            const v = parseInt(val);
            if (isNaN(v) || v < 10 || v > 100) {
                setError("varsta", "⚠️ 10 - 100.");
                return false;
            }
        }

        if (fieldId === "email") {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) {
                setError("email", "⚠️ Email invalid.");
                return false;
            }
        }

        return true;
    }

    ["nume", "varsta", "email"].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        el.addEventListener("blur", () => validareCamp(id));
        el.addEventListener("input", () => clearError(id));
    });

    // ── FORM SUBMIT CU AJAX 🔥 ───────────────────────────────────
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault(); // 🔥 NU MAI FACE REFRESH

            const numeOk = validareCamp("nume");
            const varstaOk = validareCamp("varsta");
            const emailOk = validareCamp("email");

            if (!numeOk || !varstaOk || !emailOk) {
                if (raspuns) {
                    raspuns.style.color = "red";
                    raspuns.innerHTML = "❌ Corectează erorile.";
                }
                return;
            }

            const formData = new FormData(form);

            if (loader) loader.style.display = "block";

            fetch("cgi-bin/formular.py", {
                method: "POST",
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                loader.style.display = "none";

                if (data.success) {
                    raspuns.style.color = "green";
                    raspuns.innerHTML = `✅ ${data.message}`;
                } else {
                    raspuns.style.color = "red";
                    raspuns.innerHTML = `❌ ${data.errors.join("<br>")}`;
                }
            })
            .catch(err => {
                loader.style.display = "none";
                raspuns.style.color = "red";
                raspuns.innerHTML = "❌ Eroare server.";
                console.error(err);
            });
        });
    }

    // ── RESET DATA ────────────────────────────────────────────────
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            localStorage.removeItem("user");
            if (raspuns) {
                raspuns.innerHTML = "🗑 Date șterse!";
                raspuns.style.color = "orange";
            }
            if (form) form.reset();
            ["nume", "varsta", "email"].forEach(id => clearError(id));
        });
    }

});