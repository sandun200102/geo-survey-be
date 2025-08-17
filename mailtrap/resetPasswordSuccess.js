export const resetPasswordSuccessEmailGoogle = (email, username) => {
    const scriptURL = "https://script.google.com/macros/s/AKfycbxNmex0pwlfw5gcZEWNYEOZVA7NpGc_xSMbq7Qpz1mYyn9z_OzVbEN0Z_QobgSoIJ667A/exec"; // Replace with your actual script URL

    fetch(scriptURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username }),
    })
        .then((res) => res.text())
        .then((msg) => console.log("Server response:", msg))
        .catch((err) => console.error("Error sending email:", err));
}
    