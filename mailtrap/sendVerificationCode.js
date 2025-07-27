export const sendVerificationEmailGoogle = (email, token) => {
    const scriptURL = "https://script.google.com/macros/s/AKfycby7PyAZ1nRBBC1X7ZcomRD194GUVRbquR9TELu5oCVM0zze7BU-Uq04IqVcJYKzjNXgSA/exec"; // Replace with your actual script URL

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
