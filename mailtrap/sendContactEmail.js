export const sendContactEmailGoogle = (name, email, phone, company, projectType,  message) => {
    const scriptURL = "https://script.google.com/macros/s/AKfycby2kE9PgJU_zDsyNRsKa3UkDClQwB5-FEeQyGCpqc1KMCYu2dTYkpxzgMCeXISD3DW-ww/exec" // Replace with your actual script URL

    fetch(scriptURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, 
                  email, 
                  phone, 
                  company, 
                  projectType, 
                  message }),
    })
        .then((res) => res.text())
        .then((msg) => console.log("Server response:", msg))
        .catch((err) => console.error("Error sending email:", err));
}
    