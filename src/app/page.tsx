import Footer from "@/components/footer";
import Header from "@/components/header";
import { PhotoGuide } from "@/components/photo-guide";
import { StampWorkspace } from "@/components/stamp-workspace";
export default function Page() {
  return (
    <div>
      <Header />
      <main>
      <StampWorkspace />
      </main>
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-8">       
        <PhotoGuide />
      </div>
      <Footer />
    </div>
  );
}
