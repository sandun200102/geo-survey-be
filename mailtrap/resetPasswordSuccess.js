export const resetPasswordSuccessEmailGoogle = (email, username) => {
    const scriptURL = "https://script.google.com/macros/s/AKfycbzm0oj6WVLWOFpI6wBjEIjzI7pzPSL64yzsxO8hb1HiHW5SsgngdX_z-ryUhRq134I/exec"; // Replace with your actual script URL

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
    