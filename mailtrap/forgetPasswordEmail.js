export const sendPasswordResetEmailGoogle = (email, username ,token, client_URL) => {
    const scriptURL = "https://script.google.com/macros/s/AKfycbytzTkXq1dXdo2OzlX6010hK21p7bYm4WaoQoZ23Mb3fEp_nMz9hXuwZXGb6VCC2L9d/exec"; // Replace with your actual script URL

    fetch(scriptURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username , token, client_URL}),
    })
        .then((res) => res.text())
        .then((msg) => console.log("Server response:", msg))
        .catch((err) => console.error("Error sending email:", err));
}
    