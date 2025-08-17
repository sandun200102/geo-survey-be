export const sendPermissionEmailGoogle = (name, email, projectId ,projectName) => {
    const scriptURL = "https://script.google.com/macros/s/AKfycbzoYKc8Bw8ti_JkaC95J1o-kcKgWlxdH_u7jcF3-cfn63SDdFyUhMNjVmWxGJD575Ce/exec" // Replace with your actual script URL

    fetch(scriptURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, 
                  email, 
                  phone, 
                  projectId,
                projectName }),
    })
        .then((res) => res.text())
        .then((msg) => console.log("Server response:", msg))
        .catch((err) => console.error("Error sending email:", err));
}
    