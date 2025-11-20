export const sendPermissionEmailGoogle = (name, email, projectId ,projectName) => {
    const scriptURL = "https://script.google.com/macros/s/AKfycbyNBV2Uk1apJ1IRKr_gqS7KTxTUR-_2WDHMeu25U3QWB95jJ6Fbec9Si8eiOrKMfKk0/exec" // Replace with your actual script URL

    fetch(scriptURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, 
                  email,  
                  projectId,
                projectName }),
    })
        .then((res) => res.text())
        .then((msg) => console.log("Server response:", msg))
        .catch((err) => console.error("Error sending email:", err));
}
    