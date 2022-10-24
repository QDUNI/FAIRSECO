import { ReturnObject } from "./getdata";
import YAML from "yaml";
import fs, { PathLike } from "fs";
import {WriteHTML, WriteCSS} from './webapp'

export async function post(result: ReturnObject[]): Promise<boolean> {
    createFairSECODir("./.FairSECO/");
    createReport(result);
    await generateHTML(result);
    return true;
}

function createFairSECODir(path: PathLike): void {
    // Create dir if not exists
    console.log("Creating FairSECO directory.");
    try {
        fs.mkdirSync(path);
    } catch {
        console.log("Folder already exists, skipping");
    }
}

// Generate the report of FairSeco
function createReport(result: ReturnObject[]): void {
    const fd: number = fs.openSync("./.FairSECO/Report.yml", "w+");
    try {
        console.log(result);
        fs.writeSync(fd, YAML.stringify(result));
        console.log("Successfully wrote YML file to dir");
        fs.closeSync(fd);
    } catch {
        console.error("Error writing yaml file");
    }
}

// Make a webapp from the report
async function generateHTML(result: ReturnObject[]): Promise<void> {
    try{
        await WriteHTML(result, "./.FairSECO/index.html")
        console.log("Successfully wrote HTML to dir");

        await WriteCSS("./.FairSECO/style.css");
        console.log("Successfully wrote CSS to dir");
    } catch {
        console.error("Error writing HTML file");;
    }
}