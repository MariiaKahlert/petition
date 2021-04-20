const canvas = $("canvas");
const ctx = canvas.get(0).getContext("2d");
const canvasHtml = canvas.get(0);
let isDrawing;

canvas.mousedown((e) => {
    isDrawing = true;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#f6f4d2";
    ctx.beginPath();
    ctx.moveTo(
        e.clientX - canvasHtml.offsetLeft,
        e.clientY - canvasHtml.offsetTop
    );
});

canvas.mousemove((e) => {
    if (isDrawing) {
        ctx.lineTo(
            e.clientX - canvasHtml.offsetLeft,
            e.clientY - canvasHtml.offsetTop
        );
        ctx.stroke();
    }
});

canvas.mouseup(() => {
    isDrawing = false;
    ctx.closePath();
});
