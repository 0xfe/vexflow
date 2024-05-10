import { Element } from './element.js';
import { Tables } from './tables.js';
import { TextJustification } from './textnote.js';
import { RuntimeError } from './util.js';
function drawArrowHead(ctx, x0, y0, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x0, y0);
    ctx.closePath();
    ctx.fill();
}
class StaveLine extends Element {
    static get CATEGORY() {
        return "StaveLine";
    }
    constructor(notes) {
        super();
        this.setNotes(notes);
        this.text = '';
        this.resetFont();
        this.render_options = {
            padding_left: 4,
            padding_right: 3,
            line_width: 1,
            line_dash: undefined,
            rounded_end: true,
            color: undefined,
            draw_start_arrow: false,
            draw_end_arrow: false,
            arrowhead_length: 10,
            arrowhead_angle: Math.PI / 8,
            text_position_vertical: StaveLine.TextVerticalPosition.TOP,
            text_justification: StaveLine.TextJustification.CENTER,
        };
    }
    setText(text) {
        this.text = text;
        return this;
    }
    setNotes(notes) {
        if (!notes.first_note && !notes.last_note) {
            throw new RuntimeError('BadArguments', 'Notes needs to have either first_note or last_note set.');
        }
        if (!notes.first_indices)
            notes.first_indices = [0];
        if (!notes.last_indices)
            notes.last_indices = [0];
        if (notes.first_indices.length !== notes.last_indices.length) {
            throw new RuntimeError('BadArguments', 'Connected notes must have same number of indices.');
        }
        this.notes = notes;
        this.first_note = notes.first_note;
        this.first_indices = notes.first_indices;
        this.last_note = notes.last_note;
        this.last_indices = notes.last_indices;
        return this;
    }
    applyLineStyle() {
        const ctx = this.checkContext();
        const render_options = this.render_options;
        if (render_options.line_dash) {
            ctx.setLineDash(render_options.line_dash);
        }
        if (render_options.line_width) {
            ctx.setLineWidth(render_options.line_width);
        }
        if (render_options.rounded_end) {
            ctx.setLineCap('round');
        }
        else {
            ctx.setLineCap('square');
        }
    }
    applyFontStyle() {
        const ctx = this.checkContext();
        ctx.setFont(this.textFont);
        const render_options = this.render_options;
        const color = render_options.color;
        if (color) {
            ctx.setStrokeStyle(color);
            ctx.setFillStyle(color);
        }
    }
    drawArrowLine(ctx, pt1, pt2) {
        const both_arrows = this.render_options.draw_start_arrow && this.render_options.draw_end_arrow;
        const x1 = pt1.x;
        const y1 = pt1.y;
        const x2 = pt2.x;
        const y2 = pt2.y;
        const distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        const ratio = (distance - this.render_options.arrowhead_length / 3) / distance;
        let end_x;
        let end_y;
        let start_x;
        let start_y;
        if (this.render_options.draw_end_arrow || both_arrows) {
            end_x = Math.round(x1 + (x2 - x1) * ratio);
            end_y = Math.round(y1 + (y2 - y1) * ratio);
        }
        else {
            end_x = x2;
            end_y = y2;
        }
        if (this.render_options.draw_start_arrow || both_arrows) {
            start_x = x1 + (x2 - x1) * (1 - ratio);
            start_y = y1 + (y2 - y1) * (1 - ratio);
        }
        else {
            start_x = x1;
            start_y = y1;
        }
        if (this.render_options.color) {
            ctx.setStrokeStyle(this.render_options.color);
            ctx.setFillStyle(this.render_options.color);
        }
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(end_x, end_y);
        ctx.stroke();
        ctx.closePath();
        const line_angle = Math.atan2(y2 - y1, x2 - x1);
        const h = Math.abs(this.render_options.arrowhead_length / Math.cos(this.render_options.arrowhead_angle));
        let angle1;
        let angle2;
        let top_x;
        let top_y;
        let bottom_x;
        let bottom_y;
        if (this.render_options.draw_end_arrow || both_arrows) {
            angle1 = line_angle + Math.PI + this.render_options.arrowhead_angle;
            top_x = x2 + Math.cos(angle1) * h;
            top_y = y2 + Math.sin(angle1) * h;
            angle2 = line_angle + Math.PI - this.render_options.arrowhead_angle;
            bottom_x = x2 + Math.cos(angle2) * h;
            bottom_y = y2 + Math.sin(angle2) * h;
            drawArrowHead(ctx, top_x, top_y, x2, y2, bottom_x, bottom_y);
        }
        if (this.render_options.draw_start_arrow || both_arrows) {
            angle1 = line_angle + this.render_options.arrowhead_angle;
            top_x = x1 + Math.cos(angle1) * h;
            top_y = y1 + Math.sin(angle1) * h;
            angle2 = line_angle - this.render_options.arrowhead_angle;
            bottom_x = x1 + Math.cos(angle2) * h;
            bottom_y = y1 + Math.sin(angle2) * h;
            drawArrowHead(ctx, top_x, top_y, x1, y1, bottom_x, bottom_y);
        }
    }
    draw() {
        const ctx = this.checkContext();
        this.setRendered();
        const first_note = this.first_note;
        const last_note = this.last_note;
        const render_options = this.render_options;
        ctx.save();
        this.applyLineStyle();
        let start_position = { x: 0, y: 0 };
        let end_position = { x: 0, y: 0 };
        this.first_indices.forEach((first_index, i) => {
            const last_index = this.last_indices[i];
            start_position = first_note.getModifierStartXY(2, first_index);
            end_position = last_note.getModifierStartXY(1, last_index);
            const upwards_slope = start_position.y > end_position.y;
            start_position.x += first_note.getMetrics().modRightPx + render_options.padding_left;
            end_position.x -= last_note.getMetrics().modLeftPx + render_options.padding_right;
            const notehead_width = first_note.getGlyphProps().getWidth();
            const first_displaced = first_note.getKeyProps()[first_index].displaced;
            if (first_displaced && first_note.getStemDirection() === 1) {
                start_position.x += notehead_width + render_options.padding_left;
            }
            const last_displaced = last_note.getKeyProps()[last_index].displaced;
            if (last_displaced && last_note.getStemDirection() === -1) {
                end_position.x -= notehead_width + render_options.padding_right;
            }
            start_position.y += upwards_slope ? -3 : 1;
            end_position.y += upwards_slope ? 2 : 0;
            this.drawArrowLine(ctx, start_position, end_position);
        });
        ctx.restore();
        const text_width = ctx.measureText(this.text).width;
        const justification = render_options.text_justification;
        let x = 0;
        if (justification === StaveLine.TextJustification.LEFT) {
            x = start_position.x;
        }
        else if (justification === StaveLine.TextJustification.CENTER) {
            const delta_x = end_position.x - start_position.x;
            const center_x = delta_x / 2 + start_position.x;
            x = center_x - text_width / 2;
        }
        else if (justification === StaveLine.TextJustification.RIGHT) {
            x = end_position.x - text_width;
        }
        let y = 0;
        const vertical_position = render_options.text_position_vertical;
        if (vertical_position === StaveLine.TextVerticalPosition.TOP) {
            y = first_note.checkStave().getYForTopText();
        }
        else if (vertical_position === StaveLine.TextVerticalPosition.BOTTOM) {
            y = first_note.checkStave().getYForBottomText(Tables.TEXT_HEIGHT_OFFSET_HACK);
        }
        ctx.save();
        this.applyFontStyle();
        ctx.fillText(this.text, x, y);
        ctx.restore();
        return this;
    }
}
StaveLine.TEXT_FONT = Object.assign({}, Element.TEXT_FONT);
StaveLine.TextVerticalPosition = {
    TOP: 1,
    BOTTOM: 2,
};
StaveLine.TextJustification = TextJustification;
export { StaveLine };
