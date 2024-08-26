export class RenderContext {
    static get CATEGORY() {
        return "RenderContext";
    }
    set font(f) {
        this.setFont(f);
    }
    get font() {
        return this.getFont();
    }
    setRawFont(f) {
        this.setFont(f);
        return this;
    }
}
export function drawDot(ctx, x, y, color = '#F55') {
    ctx.save();
    ctx.setFillStyle(color);
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}
