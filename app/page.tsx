import ClickableImage from "@/components/ClickableImage";
import Image from "next/image";

export default function Home() {

  
  return (
    <div className="bg-white h-screen w-screen flex">
      <ClickableImage mainImage={"/jacket.png"}/>
    </div>
  );
}
