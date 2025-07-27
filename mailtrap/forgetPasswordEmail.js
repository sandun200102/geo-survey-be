export const sendPasswordResetEmailGoogle = (email, username ,token, client_URL) => {
    const scriptURL = "https://script.google.com/macros/s/AKfycbyMe58FmnhWc4vuIvT7CQu6IMfXbWetGeTrj-UKiNTh6n35nHiJw6mExTMy45OQSWbH/exec"; // Replace with your actual script URL

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
    