export const sendBookingConfirmedEmailGoogle = (name, email, equipmentName ,startDate, endDate) => {
    const scriptURL = "https://script.google.com/macros/s/AKfycbxXa8CAEsMR3wCLsKSnZ_dp_a-yO2iST-qc65a357BQIEmADmQ7r0P_tvO9hMwqWH5DGA/exec" // Replace with your actual script URL

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
    