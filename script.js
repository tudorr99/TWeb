document.addEventListener("DOMContentLoaded", function () {

    const toggleTheme = document.getElementById("toggleTheme");
    const resetBtn    = document.getElementById("resetData");
    const loader      = document.getElementById("loader");
    const raspuns     = document.getElementById("raspuns");
    const form        = document.getElementById("formular");

    // ── Dark mode: aplică pe orice pagină ─────────────────────────────────
    function applyTheme() {
        const isDark = localStorage.getItem("theme") === "dark";
        document.body.classList.toggle("dark", isDark);
        if (toggleTheme)
            toggleTheme.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
    }
    applyTheme();

    if (toggleTheme) {
        toggleTheme.addEventListener("click", () => {
            const isDark = document.body.classList.toggle("dark");
            localStorage.setItem("theme", isDark ? "dark" : "light");
            toggleTheme.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
        });
    }

    // ── Doar pe pagina cu formular ─────────────────────────────────────────
    if (!form) return;

    // Salut utilizator salvat anterior
    const savedUser = localStorage.getItem("user");
    if (savedUser && raspuns) {
        const u = JSON.parse(savedUser);
        raspuns.innerHTML = `👋 Bine ai revenit, <b>${u.nume}</b>!`;
    }

    // ── Validare client ────────────────────────────────────────────────────
    function validate(nume, varsta, email) {
        const errors = [];
        if (nume.length < 3)
            errors.push("Numele este prea scurt (minim 3 caractere).");
        if (!/^[a-zA-ZăâîșțĂÂÎȘȚ\s\-]+$/.test(nume))
            errors.push("Numele poate conține doar litere.");
        const v = parseInt(varsta);
        if (isNaN(v) || v < 10 || v > 100)
            errors.push("Vârsta trebuie să fie între 10 și 100.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            errors.push("Adresa de email este invalidă.");
        return errors;
    }

    // ── Submit → CGI ───────────────────────────────────────────────────────
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const nume   = document.getElementById("nume").value.trim();
        const varsta = document.getElementById("varsta").value.trim();
        const email  = document.getElementById("email").value.trim();

        const errors = validate(nume, varsta, email);
        if (errors.length > 0) {
            raspuns.style.color = "red";
            raspuns.innerHTML   = "❌ " + errors.join("<br>");
            return;
        }

        if (loader) loader.style.display = "block";
        raspuns.innerHTML = "";

        // Trimite ca JSON (cel mai simplu de parsat pe server)
        fetch("/cgi-bin/formular.py", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ nume, varsta, email })
        })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (loader) loader.style.display = "none";
            if (data.status === "ok") {
                localStorage.setItem("user", JSON.stringify({ nume, varsta, email }));
                raspuns.style.color = "green";
                raspuns.innerHTML   = "✅ " + data.message;
                form.reset();
            } else {
                raspuns.style.color = "red";
                raspuns.innerHTML   = "❌ " + data.message;
            }
        })
        .catch(err => {
            if (loader) loader.style.display = "none";
            raspuns.style.color = "red";
            raspuns.innerHTML   = "⚠️ Eroare la server: " + err.message;
        });
    });

    // ── Reset ──────────────────────────────────────────────────────────────
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            localStorage.removeItem("user");
            raspuns.innerHTML   = "🗑 Date șterse!";
            raspuns.style.color = "orange";
        });
    }
});
