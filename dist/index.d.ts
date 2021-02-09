import { APIHoseOptions } from "./typing";
declare class APIHose {
    defaultOpts: APIHoseOptions;
    _opts: APIHoseOptions;
    _content: string;
    _contentArray: Array<string>;
    constructor(content: string, opts?: APIHoseOptions);
    getOpt: (key: string) => any;
    split: () => void;
    export: () => Promise<string>;
}
export { APIHose };
