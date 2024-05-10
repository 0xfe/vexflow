import { Element } from './element.js';
import { RuntimeError } from './util.js';
export var CurvePosition;
(function (CurvePosition) {
    CurvePosition[CurvePosition["NEAR_HEAD"] = 1] = "NEAR_HEAD";
    CurvePosition[CurvePosition["NEAR_TOP"] = 2] = "NEAR_TOP";
})(CurvePosition || (CurvePosition = {}));
export class Curve extends Element {
    static get CATEGORY() {
        return "Curve";
    }
    static get Position() {
        return CurvePosition;
    }
    static get PositionString() {
        return {
            nearHead: CurvePosition.NEAR_HEAD,
            nearTop: CurvePosition.NEAR_TOP,
        };
    }
    constructor(from, to, options) {
        super();
        this.render_options = Object.assign({ thickness: 2, x_shift: 0, y_shift: 10, position: CurvePosition.NEAR_HEAD, position_end: CurvePosition.NEAR_HEAD, invert: false, cps: [
                { x: 0, y: 10 },
                { x: 0, y: 10 },
            ] }, options);
        this.from = from;
        this.to = to;
    }
    setNotes(from, to) {
        if (!from && !to) {
            throw new RuntimeError('BadArguments', 'Curve needs to have either `from` or `to` set.');
        }
        this.from = from;
        this.to = to;
        return this;
    }
    isPartial() {
        return !this.from || !this.to;
    }
    renderCurve(params) {
        const ctx = this.checkContext();
        const x_shift = this.render_options.x_shift;
        const y_shift = this.render_options.y_shift * params.direction;
        const first_x = params.first_x + x_shift;
        const first_y = params.first_y + y_shift;
        const last_x = params.last_x - x_shift;
        const last_y = params.last_y + y_shift;
        const thickness = this.render_options.thickness;
        const cps = this.render_options.cps;
        const { x: cp0x, y: cp0y } = cps[0];
        const { x: cp1x, y: cp1y } = cps[1];
        const cp_spacing = (last_x - first_x) / (cps.length + 2);
        ctx.beginPath();
        ctx.moveTo(first_x, first_y);
        ctx.bezierCurveTo(first_x + cp_spacing + cp0x, first_y + cp0y * params.direction, last_x - cp_spacing + cp1x, last_y + cp1y * params.direction, last_x, last_y);
        ctx.bezierCurveTo(last_x - cp_spacing + cp1x, last_y + (cp1y + thickness) * params.direction, first_x + cp_spacing + cp0x, first_y + (cp0y + thickness) * params.direction, first_x, first_y);
        ctx.stroke();
        ctx.closePath();
        ctx.fill();
    }
    draw() {
        this.checkContext();
        this.setRendered();
        const first_note = this.from;
        const last_note = this.to;
        let first_x;
        let last_x;
        let first_y;
        let last_y;
        let stem_direction = 0;
        let metric = 'baseY';
        let end_metric = 'baseY';
        function getPosition(position) {
            return typeof position === 'string' ? Curve.PositionString[position] : position;
        }
        const position = getPosition(this.render_options.position);
        const position_end = getPosition(this.render_options.position_end);
        if (position === CurvePosition.NEAR_TOP) {
            metric = 'topY';
            end_metric = 'topY';
        }
        if (position_end === CurvePosition.NEAR_HEAD) {
            end_metric = 'baseY';
        }
        else if (position_end === CurvePosition.NEAR_TOP) {
            end_metric = 'topY';
        }
        if (first_note) {
            first_x = first_note.getTieRightX();
            stem_direction = first_note.getStemDirection();
            first_y = first_note.getStemExtents()[metric];
        }
        else {
            const stave = last_note.checkStave();
            first_x = stave.getTieStartX();
            first_y = last_note.getStemExtents()[metric];
        }
        if (last_note) {
            last_x = last_note.getTieLeftX();
            stem_direction = last_note.getStemDirection();
            last_y = last_note.getStemExtents()[end_metric];
        }
        else {
            const stave = first_note.checkStave();
            last_x = stave.getTieEndX();
            last_y = first_note.getStemExtents()[end_metric];
        }
        this.renderCurve({
            first_x,
            last_x,
            first_y,
            last_y,
            direction: stem_direction * (this.render_options.invert === true ? -1 : 1),
        });
        return true;
    }
}
