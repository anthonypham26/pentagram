"use client";

import { useState } from "react";

//This is where the user can input their prompt and generate an image.
//Make sure to update the UI and handle the API response to display the images generated

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.API_KEY}`,
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate image"); // Handle API failure
      }
      
      if (data.imageUrl) {
        const img = new Image(); // Create a new image element
        img.onload = () => {
          setImageUrl(data.imageUrl); // Set the image URL in the state after it loads
        };
        img.src = data.imageUrl; // Set the source of the image to trigger loading
      }
      
      setInputText("");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // TODO: Update the UI here to show the images generated
    
    <div className="min-h-screen flex flex-col justify-between p-8">
      <main className="flex-1">{/* Main content can go here */}</main>

      {imageUrl && (
        <div className="w-full max-w-2xl rounded-lg overflow-hidden shadow-lg">
          <img
            src={imageUrl}
            alt="Generated artwork"
            className="w-full h-auto"
          />
        </div>
      )}

      <footer className="w-full max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 p-3 rounded-lg bg-black/[.05] dark:bg-white/[.06] border border-black/[.08] dark:border-white/[.145] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              placeholder="Describe the image you want to generate..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-lg bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors disabled:opacity-50"
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}