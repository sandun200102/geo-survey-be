export const sendBookingConfirmedEmailGoogle = (name, email, equipmentName ,startDate, endDate) => {
    const scriptURL = "https://script.google.com/macros/s/AKfycbzNldjWt_Rzg0dJTj9hMDx27XDaBcCSBPSXTapPAH-DaJg9eN-DSCwuhOn6sxW7dIeRCw/exec" // Replace with your actual script URL

    fetch(scriptURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, 
                  email, 
                  equipmentName, 
                  startDate,
                endDate }),
    })
        .then((res) => res.text())
        .then((msg) => console.log("Server response:", msg))
        .catch((err) => console.error("Error sending email:", err));
}
    