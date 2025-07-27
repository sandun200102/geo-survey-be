export const sendWelcomeEmailGoogle = (email, username) => {
    const scriptURL = "https://script.google.com/macros/s/AKfycbw0GHGajztzaghnXYL7EWIIgKf_28f0eMve66moDPxdYlpMlgQRuBahhsrzjHwh6IyE/exec"; // Replace with your actual script URL

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
    