document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("slider");
    const slabel = document.getElementById("slider-label");
    let sliderVal = sessionStorage.getItem("sliderVal") || 170;
    if (slider && slabel) {
        if(sliderVal) {
            document.documentElement.style.setProperty("--slider-value", sliderVal);
            slider.value = sliderVal;
            slabel.innerHTML = `choose your color (${sliderVal})`;
        }
        slider.addEventListener("input", (event) => {
            let sliderVal = event.target.value;
            sessionStorage.setItem("sliderVal", sliderVal)
            slabel.innerHTML = `choose your color (${sliderVal})`;
            document.documentElement.style.setProperty("--slider-value", sliderVal);
        });
    } else {
        console.error("❌ Slider or label element not found!");
    }
});