import { ChangeEvent, DragEvent, useRef, useState } from "react";

enum ImageType {
  JPEG = "image/jpeg",
  PNG = "image/png",
  GIF = "image/gif",
  BMP = "image/bmp",
  WEBP = "image/webp",
  SVG = "image/svg+xml",
  ICO = "image/x-icon",
}

export default function App() {
  function dragOverHandler(ev: DragEvent<HTMLDivElement>) {
    setdragover(true);

    ev.preventDefault();
  }
  function dropHandler(ev: DragEvent<HTMLDivElement>) {
    ev.preventDefault();

    if (!ev.dataTransfer) return;

    if (ev.dataTransfer.items) {
      [...ev.dataTransfer.items].forEach((item) => {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (
            file &&
            Object.values(ImageType).includes(file.type as ImageType)
          ) {
            setfile(file);
            setOriginalImage(URL.createObjectURL(file));
          } else {
            alert("File type not supported");
          }
        }
      });
    } else {
      [...ev.dataTransfer.files].forEach((file) => {
        setfile(file);
      });
    }

    setdragover(false);
  }

  const [dragover, setdragover] = useState(false);
  const [file, setfile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [originalImage, setOriginalImage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onhandleChange(event: ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    if (event.target.files && event.target.files.length > 0) {
      setfile(event.target.files[0]);
      setOriginalImage(URL.createObjectURL(event.target.files[0]));
    }
  }

  const handleCustomButtonClick = () => {
    if (inputRef.current) inputRef.current.click();
  };

  const handleOnSubmit = async () => {
    setLoading(true);
    setError("");

    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        "http://localhost:3000/api/upload",
        {
          method: "POST",
          body: formData,
        
        }
        
      );

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setOriginalImage(imageUrl);
      } else {
        setError('Failed to upload and process image');
      }
    } catch (error) {
      console.log(error);
      setError("Error uploading or processing image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" p-10 container rounded-lg flex flex-col items-center gap-y-8 shadow-2xl w-[85%] sm:w-2/3 lg:w-1/2 h-fit bg-slate-100 transition-all">
      <h1 className=" text-center text-violet-700 text-4xl  font-extrabold font-mono">
        Upload Image
      </h1>
      <section className=" w-full relative">
        {!originalImage ? (
          <div
            onDragLeave={() => setdragover(false)}
            onDragOver={dragOverHandler}
            onDrop={dropHandler}
            className={` flex flex-col py-10 items-center justify-center gap-y-1 border-2 text-slate-500 transition-colors  border-dotted rounded-lg ${
              dragover
                ? "border-violet-600 bg-sky-100 text-violet-600"
                : "border-slate-500"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke={dragover ? "blueviolet" : "gray"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-20 w-auto"
            >
              <path d="M12 13v8" />
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
              <path d="m8 17 4-4 4 4" />
            </svg>
            <p className=" text-sm ">Drag and Drop Image</p>
          </div>
        ) : (
          <div className=" aspect-video max-h-52 w-full mx-auto flex items-center gap-x-1">
           <img
              src={originalImage}
              alt="logo"
              className="object-contain h-full w-auto mx-auto"
            />
          </div>
        )}
      </section>

      <input
        type="file"
        name="file"
        id="fileInput"
        accept="image/*"
        onChange={onhandleChange}
        ref={inputRef}
        className="sr-only"
      />
      <div className=" flex items-center gap-x-2 w-full text-nowrap">
        <button
          className=" text-violet-700 w-fit rounded-2xl hover:bg-violet-200 px-2 py-1"
          onClick={handleCustomButtonClick}
        >
          Choose file
        </button>
        <p className=" text-slate-400 text-wrap">
          {file ? file.name : "No file selected"}
        </p>
      </div>
      <button
        type="submit"
        className={`flex items-center justify-center w-full text-white p-2 rounded-lg ${
          file ? "bg-violet-600" : "bg-violet-300 cursor-not-allowed"
        }`}
        disabled={!file}
        onClick={handleOnSubmit}
      >
        {!loading ? (
          <p>Rotate</p>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className=" animate-spin"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        )}
      </button>
      {error && <p className=" text-red-500">{error}</p>}
    </div>
  );
}
