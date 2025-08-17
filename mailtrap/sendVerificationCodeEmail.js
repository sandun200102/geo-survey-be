export const sendVerificationEmailGoogle = (email, token) => {
    const scriptURL = "https://script.google.com/macros/s/AKfycbw5poJWjFkwfybCB79d3XjZ0shr1Gj0ClITSfmIE4WTbP6sv2gKQy-ufOA-FrkN-daMqw/exec"; // Replace with your actual script URL

    fetch(scriptURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, token }),
    })
        .then((res) => res.text())
        .then((msg) => console.log("Server response:", msg))
        .catch((err) => console.error("Error sending email:", err));
}
