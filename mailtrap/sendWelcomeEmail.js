export const sendWelcomeEmailGoogle = (email, username) => {
    const scriptURL = "https://script.google.com/macros/s/AKfycbzi5YvZsHSU9c2ajGRKUdBWvfnagZq1xcRg7kvFv43wG9kHzWnVY6XtlPJebTyWErLA/exec" // Replace with your actual script URL

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
    