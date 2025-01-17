'use client'

import {ChecksumAlgorithm, S3Client} from "@aws-sdk/client-s3";
import {Upload} from "@aws-sdk/lib-storage";
import {useState} from "react";

export default function UploadCmp() {

    const [text, setText] = useState<string[]>([]);
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {

            try {
                const file = Array.from(e.target.files)[0];

                const parallelUploads3 = new Upload({
                    client: new S3Client({
                        region: "eu-central-1",
                        credentials: {
                            accessKeyId: "<<key>>",
                            secretAccessKey: "<<secret>>",
                        },
                    }),
                    params: {
                        Bucket: "<<your_bucket>>",
                        Key: "large-file.txt",
                        Body: file,
                        // Ensure proper content type
                        ContentType: "text/plain",
                        ChecksumAlgorithm: ChecksumAlgorithm.CRC32,
                    },
                    //  part size 5MB
                    partSize: 1024 * 1024 * 5,
                    queueSize: 1,
                    leavePartsOnError: true,
                });

                // Log upload progress
                parallelUploads3.on("httpUploadProgress", (progress) => {
                    const progressText = `Uploaded ${progress.loaded} of ${progress.total} bytes`;

                    setText(prevState => [...prevState, progressText]);
                    console.log(progressText);
                });

                await parallelUploads3.done();

                const doneMessage = "File uploaded successfully";
                setText(prevState => [...prevState, doneMessage]);
                console.log(doneMessage);
            } catch (error: any) {
                setText(prevState => [...prevState, "Upload error see console"]);
                console.error("Upload error:", error);
                // Log more details about the error
                if (error.message) console.error("Error message:", error.message);
                if (error.code) console.error("Error code:", error.code);

            }
        }
    };


    return (
        <div>
            <input type="file" onChange={handleFileChange}/>
            <div>
                {text.map((value, index) => (
                    <div key={index}>{value}</div>
                ))}
            </div>
        </div>
    );
}
