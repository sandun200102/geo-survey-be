export const sendBookingEmailGoogle = (name, email ,phone, startDate, endDate, notes, equipmentId, equipmentName) => {
    const scriptURL = "https://script.google.com/macros/s/AKfycbwvgvHXIhRcBym-opXotiJbDDeBLrWqZ2bng2JX3FTeO5-UsjcQvUETWVfTACRSeL4/exec" // Replace with your actual script URL

    fetch(scriptURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, 
          email ,
          phone, 
          startDate, 
          endDate, 
          notes,
          equipmentId,
          equipmentName }),
    })
        .then((res) => res.text())
        .then((msg) => console.log("Server response:", msg))
        .catch((err) => console.error("Error sending email:", err));
}
    