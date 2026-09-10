type ToastOptions = {
    message: string;
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
    type?: "success" | "error";
};

export const toast = ({
    message,
    position = "top-right",
    type = "error",
}: ToastOptions) => {
    const el = document.createElement("div");

    el.innerText = message;

    const positions = {
        "top-right": { top: "20px", right: "20px" },
        "top-left": { top: "20px", left: "20px" },
        "bottom-right": { bottom: "20px", right: "20px" },
        "bottom-left": { bottom: "20px", left: "20px" },
    };

    const pos = positions[position];

    Object.assign(el.style, {
        position: "fixed",
        ...pos,
        padding: "12px 16px",
        borderRadius: "10px",
        color: "#fff",
        zIndex: "9999",
        fontSize: "14px",
        background: type === "error" ? "#e11d48" : "#16a34a",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",

        // ✅ animation setup
        opacity: "0",
        transform: "translateY(-10px)",
        transition: "all 0.3s ease",
    });

    document.body.appendChild(el);

    // trigger animation
    requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
    });

    // exit animation before remove
    setTimeout(() => {
        el.style.opacity = "0";
        el.style.transform = "translateY(-10px)";
    }, 2000);

    setTimeout(() => {
        el.remove();
    }, 2500);
};