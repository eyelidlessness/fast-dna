import examples from "./examples.data";
import { generateSnapshots } from "@microsoft/fast-jest-snapshots-react";

describe("text-field snapshots", (): void => {
    generateSnapshots(examples);
});
