/**
 * This module contains functions to retrieve GitHub workflow artifacts.
 * 
 * The custom interfaces allow @actions/artifact to be mocked in the unit tests.
 * 
 * @module
 */

import * as artifact from "@actions/artifact";
import * as fs from "fs";
import * as path from "path";

/** Contains the information returned by {@link ArtifactClient.downloadArtifact}. */
export type DownloadResponse = artifact.DownloadResponse;
/** Contains the download options that can be passed to {@link ArtifactClient.downloadArtifact}. */
export type DownloadOptions = artifact.DownloadOptions;

/**
 * An interface for providing an {@link ArtifactClient | artifact client},
 * which can be used to download a GitHub artifact.
 * 
 * Normally the artifact client is provided by @actions/artifact,
 * but a different artifact client provider can be used for unit testing.
 */
export interface Artifact {
    /**
     * @returns An {@link ArtifactClient | artifact client} which can be used to download a GitHub artifact.
     */
    create: () => ArtifactClient;
}

/** An interface for downloading a GitHub artifact. */
export interface ArtifactClient {
    /** Downloads a GitHub artifact. */
    downloadArtifact: (
        name: string,
        path: string,
        options?: DownloadOptions | undefined
    ) => Promise<DownloadResponse>;
}

/**
 * Downloads an artifact that was uploaded by another action in a previous step or job in the workflow.
 *
 * @param artifactName The name of the artifact given by the action that created it.
 * @param destination The directory in which the artifact files should be downloaded.
 * @param artifactObject The artifact module that is used. During normal operation of the program, this should simply be \@actions/artifact, but for the unit tests a mock is passed instead.
 * @returns The download reponse.
 */
export async function getArtifactData(
    artifactName: string,
    destination: string,
    artifactObject: Artifact
): Promise<DownloadResponse> {
    const artifactClient = artifactObject.create();
    const downloadResponse = await artifactClient.downloadArtifact(
        artifactName,
        destination
    );

    return downloadResponse;
}

/**
 * Gets a file from the artifact as a string.
 *
 * @param dlResponse The object that was returned by {@link getArtifactData}.
 * @param fileName The name of the file that should be read.
 * @returns The contents of the file.
 */
export function getFileFromArtifact(
    dlResponse: DownloadResponse,
    fileName: string
): string {
    const filePath: string = path.join(dlResponse.downloadPath, fileName);
    const buffer = fs.readFileSync(filePath);

    return buffer.toString();
}

/**
 * An Artifact object that can be used for unit testing.
 * the {@link ArtifactClient} provided by create() does not download anything
 * when downloadArtifact is called, but it returns a download response
 * as if a file was correctly downloaded.
 */
export const testArtifactObject: Artifact = {
    create: () => {
        const client: ArtifactClient = {
            downloadArtifact: async (
                name: string,
                path: string,
                options?: DownloadOptions | undefined
            ) => {
                return { artifactName: name, downloadPath: path };
            },
        };

        return client;
    },
};
