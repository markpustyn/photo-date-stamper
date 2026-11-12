import Footer from "@/components/footer";
import Header from "@/components/header";
import { PhotoGuide } from "@/components/photo-guide";
import { StampWorkspace } from "@/components/stamp-workspace";
export default function Page() {
  return (
    <div>
      <div className="flex min-h-dvh flex-col xl:h-dvh xl:overflow-hidden">
        <div className="shrink-0"><Header /></div>
        <main className="flex min-h-0 flex-1">
          <StampWorkspace />
        </main>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-8">       
        <PhotoGuide />
      </div>
      <Footer />
    </div>
  );
}
