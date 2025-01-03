"use client";
import Image from "next/image";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadFile } from "@/redux/slices/pdfslice"; // Make sure this handles the file upload
import LoadingSpinner from "@/components/loader";
import { useRouter } from "next/navigation";
import Navbar from "@/components/nav";
export default function Home() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState(null);
  const [name,setname] = useState("Upload PDF file")
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.upload); // Get loading state from Redux

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setname(file.name)
    console.log("Selected file:", file);
  };

  const handleSubmit = () => {
    if (!selectedFile) return;
    
    // Dispatch the uploadFile action with the selected file
    dispatch(uploadFile(selectedFile));
    router.push("/select")
  };

  return (
    <div className="flex flex-col items-center justify-center">
    <Navbar/>
      <div className="w-[100vw] h-[100vh] bg-[#0c0032] flex justify-center items-center">
        <div className="flex w-[70vw] md:w-[50vw] h-[35vh] bg-slate-300 justify-center items-center rounded-md align-middle">
          {loading ? (
            <div className="flex justify-center align-middle text-center content-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div>
              <Image
                src="/images/file-pdf-box.png"
                alt="PDF Icon"
                width={54}
                height={56}
                className="relative top-6 left-20 animate-bounce"
              />
              <label htmlFor="pdfUpload" className="cursor-pointer">
                <Image
                  src="/images/Vector.png"
                  alt="Upload PDF"
                  width={95}
                  height={80}
                  className="relative left-5 hover:opacity-80 transition-opacity duration-200 justify-center"
                />
              </label>
              <input
                id="pdfUpload"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <h1 className="font-semibold">{name}</h1>
              <button
                onClick={handleSubmit}
                className="bg-blue-950 px-10 text-white font-semibold rounded-md mt-4"
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
