import { runTortellini } from "./resources/tortellini";
import { runHowfairis } from "./resources/howfairis";
import { runSearchseco } from "./resources/searchseco";
import { runCitingPapers } from "./resources/citingPapers";
import { getCitationFile, CffObject } from "./resources/citation_cff";
import { runSBOM } from "./resources/sbom";
import { ErrorLevel, LogMessage } from "./log";
import { getGithubInfo, GithubInfo } from "./git";
import { getQualityMetrics } from "./resources/qualitymetrics";

/** An object that contains data gathered by FairSECO. */
export interface ReturnObject {
    /** Describes the name of the gathered data. */
    ReturnName: string;

    /** The gathered data. */
    ReturnData: object;
}

export async function data(): Promise<ReturnObject[]> {
    const output: ReturnObject[] = [];

    const ghinfo: GithubInfo = await getGithubInfo();
    const ghreturnobject : ReturnObject = {
        ReturnName: "GithubInfo",
        ReturnData: ghinfo
    }
    output.push(ghreturnobject)

    let tortelliniResult: ReturnObject | undefined;
    try {
        tortelliniResult = await runTortellini();
        output.push(tortelliniResult);
    } catch (error) {
        LogMessage(
            "An error occurred while gathering tortellini data:",
            ErrorLevel.err
        );
        LogMessage(error, ErrorLevel.err);
    }

    let howfairisResult: ReturnObject | undefined;
    try {
        howfairisResult = await runHowfairis(ghinfo);
        output.push(howfairisResult);
    } catch (error) {
        LogMessage(
            "An error occurred while running howfairis.",
            ErrorLevel.err
        );
        LogMessage(error, ErrorLevel.err);
    }

    try {
        const searchsecoResult = await runSearchseco(ghinfo);
        output.push(searchsecoResult);
    } catch (error) {
        LogMessage(
            "An error occurred while running searchSECO.",
            ErrorLevel.err
        );
        LogMessage(error, ErrorLevel.err);
    }

    let cffResult: ReturnObject | undefined;
    try {
        cffResult = await getCitationFile(".");
        output.push(cffResult);
    } catch (error) {
        LogMessage(
            "An error occurred while fetching CITATION.cff.",
            ErrorLevel.err
        );
        LogMessage(error, ErrorLevel.err);
    }

    try {
        const cffFile = cffResult?.ReturnData as CffObject;
        if (cffFile?.status === "valid") {
            const citingPapersResult = await runCitingPapers(cffFile);
            output.push(citingPapersResult);
        } else {
            throw new Error("Invalid CITATION.cff file");
        }
    } catch (error) {
        LogMessage("Scholarly threw an error:", ErrorLevel.err);
        LogMessage(error, ErrorLevel.err);
    }
    
    try {
        const SBOMResult = await runSBOM();
        output.push(SBOMResult);
    } catch (error) {
        LogMessage("An error occurred during SBOM generation.", ErrorLevel.err);
        LogMessage(error, ErrorLevel.err);
    }

    try {
        if (howfairisResult !== undefined && tortelliniResult !== undefined) {
            const qualityMetrics = await getQualityMetrics(
                ghinfo,
                howfairisResult,
                tortelliniResult
            );
            output.push(qualityMetrics);
        } else {
            throw new Error("howfairisResult or tortelliniResult is undefined");
        }
    } catch (error) {
        LogMessage("QualityMetrics threw an error:", ErrorLevel.err);
        LogMessage(error, ErrorLevel.err);
    }

    return output;
}
