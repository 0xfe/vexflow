import { Flow } from './flow';
import { RuntimeError } from './util';
export declare class Vex {
    static Flow: typeof Flow;
    /**
     * Take `arr` and return a new list consisting of the sorted, unique,
     * contents of arr. Does not modify `arr`.
     */
    static sortAndUnique(arr: any[], cmp: any, eq: any): any[];
    /** Check if array `arr` contains `obj`. */
    static contains(arr: any[], obj: any): boolean;
    static getCanvasContext(canvasSelector: string): RenderingContext;
    /** Benchmark. Run function `f` once and report time elapsed shifted by `s` milliseconds. */
    static benchmark(s: any, f: any): void;
    static stackTrace(): string | undefined;
    static RERR: RuntimeError;
    static RuntimeError: RuntimeError;
}
