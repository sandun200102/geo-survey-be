export const sendPermissionEmailGoogleToUser = (name, email, token ,projectName) => {
    const scriptURL = "https://script.google.com/macros/s/AKfycbwInciBoRYAuMFRLhUAm8LVv0K1FxstxcjPAPyqn-N2_l64Kr83G8D-EClmuq7ioCLCbQ/exec" // Replace with your actual script URL

    fetch(scriptURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, 
                  email, 
                  phone, 
                  token,
                projectName }),
    })
        .then((res) => res.text())
        .then((msg) => console.log("Server response:", msg))
        .catch((err) => console.error("Error sending email:", err));
}
    